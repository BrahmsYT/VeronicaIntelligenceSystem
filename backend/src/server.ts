import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { env } from './config';
import { readDb, writeDb, dbFilePath } from './db';
import { sign, verify } from './auth';
import { getDelayRiskAssessment, getGroundedTripNarrative, getOccupancyForecast, getPassengerFlowPrediction, getSmartRecommendation } from './services/ai';

type AppRole = 'admin' | 'staff' | 'user';

const app = express();
app.use(cors({ origin: env.frontend, credentials: true }));
app.use(express.json({ limit: '1mb' }));

const auth = (req: any, res: any, next: any) => {
  const h = req.headers.authorization;
  const token = h?.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verify(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const forecastForRoute = (db: any, route: any, stop: string, departureTime: string, date?: string) => {
  const hour = parseHour(departureTime);
  const weekday = isWeekdayDate(date);
  const peakBoost = getTemporalBoost(hour, weekday);
  const stopContextBoost = getStopContextBoost(stop, hour, weekday);
  const crowdBoost = route.crowded ? 6 : 0;
  const crowdMemory = getCrowdMemory(db, route.id, stop, departureTime, date);
  const communityBoost = crowdMemory.crowdProbability >= 70 ? 6 : crowdMemory.crowdProbability >= 50 ? 3 : 0;
  const predictedOccupancy = clamp(Math.round(route.occupancy + peakBoost + stopContextBoost + crowdBoost + communityBoost), 12, 99);
  const estimatedMinutesToEase = predictedOccupancy <= 70 ? 0 : Math.round(18 + (predictedOccupancy - 70) * 0.9);
  const crowdLevel: 'low' | 'medium' | 'high' = predictedOccupancy >= 85 ? 'high' : predictedOccupancy >= 65 ? 'medium' : 'low';
  const contextNote = buildContextNote(weekday, hour, stop, stopContextBoost);

  return {
    predictedOccupancy,
    estimatedMinutesToEase,
    crowdLevel,
    crowdMemory,
    weekday,
    contextNote
  };
};

const levelFromOccupancy = (value: number): 'low' | 'medium' | 'high' => (value >= 85 ? 'high' : value >= 65 ? 'medium' : 'low');

const requireRoles = (roles: AppRole[]) => (req: any, res: any, next: any) =>
  auth(req, res, () => (roles.includes(req.user?.role) ? next() : res.status(403).json({ message: `Allowed roles: ${roles.join(', ')}` })));

const admin = requireRoles(['admin']);
const staff = requireRoles(['admin', 'staff']);

const reg = z.object({
  name: z.string().min(2),
  surname: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin', 'staff', 'user']).default('user'),
  avatar: z.string().optional(),
  theme: z.string().optional(),
  preferredLanguage: z.string().optional(),
  preferredTransport: z.enum(['bus', 'metro', 'taxi', 'rail']).optional()
});

const siteSettingsSchema = z.object({
  maintenanceMode: z.boolean(),
  registrationOpen: z.boolean(),
  aiDispatchEnabled: z.boolean(),
  announcements: z.array(z.string().min(2)).max(8)
});

const tripForecastSchema = z
  .object({
    routeId: z.string().min(1).optional(),
    stop: z.string().min(2).optional(),
    origin: z.string().min(2).optional(),
    destination: z.string().min(2).optional(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
  })
  .superRefine((data, ctx) => {
    if (!data.routeId && !(data.origin && data.destination)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['routeId'], message: 'Provide routeId or both origin and destination' });
    }
  });

const crowdReportSchema = z.object({
  routeId: z.string().min(1),
  stop: z.string().min(2),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  crowded: z.boolean()
});

const routeMapQuerySchema = z.object({
  from: z.string().min(2),
  to: z.string().min(2)
});

const staffPlanSchema = z.object({
  routeId: z.string().min(1),
  additionalDemandPercent: z.number().min(0).max(40).default(0),
  targetOccupancy: z.number().min(40).max(90).default(72)
});

const defaultSiteSettings = {
  maintenanceMode: false,
  registrationOpen: true,
  aiDispatchEnabled: true,
  announcements: ['Smart transit mode is active.']
};

const getSiteSettings = (db: any) => ({ ...defaultSiteSettings, ...(db.siteSettings ?? {}) });

type GeoPoint = {
  label: string;
  lng: number;
  lat: number;
};

const geocodeCache = new Map<string, GeoPoint>();

const BAKU_CENTER = { lng: 49.8671, lat: 40.4093 };
const BAKU_BBOX = {
  minLng: 49.74,
  minLat: 40.30,
  maxLng: 50.33,
  maxLat: 40.57
};

const isInsideBakuBounds = (lng: number, lat: number) =>
  lng >= BAKU_BBOX.minLng && lng <= BAKU_BBOX.maxLng && lat >= BAKU_BBOX.minLat && lat <= BAKU_BBOX.maxLat;

const geocodeQueryCandidates = (query: string) => {
  const raw = String(query || '').trim();
  const cleaned = raw
    .replace(/\b(m\/st|mst|metro stansiyasi|metro station|metro)\b/gi, ' ')
    .replace(/\b(q\.?s\.?|qəs\.?|qes\.?|qəsəbəsi|qesebesi)\b/gi, ' ')
    .replace(/\b(t\/?m|tm|trade center|shopping mall)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const canonical = canonicalPlace(raw).replace(/\s+/g, ' ').trim();
  return [raw, cleaned, canonical]
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, idx, arr) => arr.findIndex((x) => x.toLowerCase() === item.toLowerCase()) === idx);
};

const geocodeViaPhoton = async (candidate: string): Promise<GeoPoint | null> => {
  const searchText = `${candidate}, Baku, Azerbaijan`;
  const photonUrl =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(searchText)}` +
    `&limit=8&lang=en&bbox=${BAKU_BBOX.minLng},${BAKU_BBOX.minLat},${BAKU_BBOX.maxLng},${BAKU_BBOX.maxLat}`;
  const response = await fetch(photonUrl, {
    headers: {
      'user-agent': env.osmUserAgent
    }
  });
  if (!response.ok) return null;

  const payload: any = await response.json();
  const features = Array.isArray(payload?.features) ? payload.features : [];
  const feature = features.find((item: any) => {
    const coords = Array.isArray(item?.geometry?.coordinates) ? item.geometry.coordinates : null;
    if (!coords || coords.length < 2) return false;
    const lng = Number(coords[0]);
    const lat = Number(coords[1]);
    if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
    return isInsideBakuBounds(lng, lat);
  });
  if (!feature) return null;

  const coords = Array.isArray(feature?.geometry?.coordinates) ? feature.geometry.coordinates : [];
  const lng = Number(coords[0]);
  const lat = Number(coords[1]);
  if (Number.isNaN(lng) || Number.isNaN(lat)) return null;

  const props = feature?.properties || {};
  const labelParts = [props?.name, props?.city, props?.country].filter(Boolean);
  return {
    label: String(labelParts.join(', ') || candidate),
    lng,
    lat
  };
};

const geocodeStop = async (query: string): Promise<GeoPoint | null> => {
  const emailParam = env.osmContactEmail ? `&email=${encodeURIComponent(env.osmContactEmail)}` : '';
  const candidates = geocodeQueryCandidates(query);

  for (const candidate of candidates) {
    const cacheKey = candidate.toLowerCase();
    const cached = geocodeCache.get(cacheKey);
    if (cached) return cached;

    const searchText = `${candidate}, Baku, Azerbaijan`;
    const geocodeUrl =
      `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=az` +
      `&viewbox=${BAKU_BBOX.minLng},${BAKU_BBOX.maxLat},${BAKU_BBOX.maxLng},${BAKU_BBOX.minLat}` +
      `&bounded=1&q=${encodeURIComponent(searchText)}${emailParam}`;
    const response = await fetch(geocodeUrl, {
      headers: {
        'accept-language': 'en',
        'user-agent': env.osmUserAgent
      }
    });
    if (response.status === 429) {
      const photonResult = await geocodeViaPhoton(candidate);
      if (photonResult) {
        geocodeCache.set(cacheKey, photonResult);
        return photonResult;
      }
      continue;
    }
    if (!response.ok) throw new Error(`Map geocoding failed (${response.status})`);

    const payload: any = await response.json();
    const matches = Array.isArray(payload) ? payload : [];
    const feature = matches.find((item: any) => {
      const lng = Number(item?.lon);
      const lat = Number(item?.lat);
      if (Number.isNaN(lng) || Number.isNaN(lat)) return false;
      return isInsideBakuBounds(lng, lat);
    });
    if (!feature) continue;

    const lng = Number(feature?.lon);
    const lat = Number(feature?.lat);
    const result = {
      label: String(feature?.display_name || candidate),
      lng,
      lat
    };
    geocodeCache.set(cacheKey, result);
    return result;
  }

  return null;
};

const getDirectionsBetween = async (from: GeoPoint, to: GeoPoint) => {
  const coordinates = `${from.lng},${from.lat};${to.lng},${to.lat}`;
  const directionsUrl = `https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson&alternatives=false&steps=false`;
  const response = await fetch(directionsUrl);
  if (!response.ok) throw new Error('Map directions failed');

  const payload: any = await response.json();
  const route = Array.isArray(payload?.routes) ? payload.routes[0] : null;
  if (!route) return null;

  const geometry = Array.isArray(route?.geometry?.coordinates) ? route.geometry.coordinates : [];
  return {
    distanceMeters: Number(route.distance || 0),
    durationSeconds: Number(route.duration || 0),
    geometry: geometry.length ? geometry : [[from.lng, from.lat], [to.lng, to.lat]]
  };
};

const buildStaticMapUrl = (from: GeoPoint, to: GeoPoint, geometry: number[][]) => {
  const sampled = geometry.length > 70
    ? geometry.filter((_, idx) => idx % Math.ceil(geometry.length / 70) === 0 || idx === geometry.length - 1)
    : geometry;
  const pathPoints = sampled.map(([lng, lat]) => `${lat},${lng}`).join('|');
  const markerStart = `${from.lat},${from.lng},lightgreen1`;
  const markerEnd = `${to.lat},${to.lng},orange1`;
  const path = `color:0x22d3eeff|weight:4|${pathPoints}`;
  return `https://staticmap.openstreetmap.de/staticmap.php?size=1200x700&markers=${encodeURIComponent(markerStart)}|${encodeURIComponent(markerEnd)}&path=${encodeURIComponent(path)}`;
};

const parseHour = (value: string) => Number(value.split(':')[0]);

const parseWeekday = (date?: string) => {
  if (!date) return new Date().getDay();
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return new Date().getDay();
  return parsed.getDay();
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeStop = (value: string) => value.trim().toLowerCase();

const normalizePlace = (value: string) =>
  value
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

const transliterateAz = (value: string) =>
  value
    .replace(/ə/g, 'e')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g');

const transliterateCyrillic = (value: string) => {
  const map: Record<string, string> = {
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
    н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch',
    ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
  };

  return value
    .split('')
    .map((char) => {
      const lower = char.toLowerCase();
      const mapped = map[lower];
      if (mapped == null) return char;
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join('');
};

const toEnglishLikeText = (value: string) => transliterateCyrillic(value).trim();

const placeTokenAliases: Record<string, string> = {
  'm/st': '',
  mst: '',
  metro: '',
  m: '',
  stansiyasi: '',
  stansiyasii: '',
  station: '',
  dayanacagi: '',
  dayanacagii: '',
  dayanacaq: '',
  day: '',
  mall: '',
  mərkəzi: 'merkezi',
  merkezi: 'merkezi'
};

const canonicalPlace = (value: string) => {
  const normalized = transliterateAz(normalizePlace(value)).replace(/[^a-z0-9\s/.-]/g, ' ');
  const tokens = normalized
    .split(/[\s/.-]+/)
    .map((token) => placeTokenAliases[token] ?? token)
    .filter(Boolean);
  return tokens.join(' ').trim();
};

const placeTokens = (value: string) => canonicalPlace(value).split(' ').filter(Boolean);

const isAmbiguousPlaceQuery = (value: string) => {
  const tokens = placeTokens(value);
  if (!tokens.length) return true;
  if (tokens.length > 1) return false;
  const token = tokens[0];
  const hasDigit = /\d/.test(token);
  if (hasDigit) return true;
  return token.length <= 3;
};

const placeMatchScore = (candidate: string, query: string) => {
  const cRaw = normalizePlace(candidate);
  const qRaw = normalizePlace(query);
  if (!qRaw) return 0;
  if (cRaw === qRaw) return 100;
  if (cRaw.includes(qRaw) || qRaw.includes(cRaw)) return 88;

  const c = canonicalPlace(candidate);
  const q = canonicalPlace(query);
  if (!q) return 0;
  if (c === q) return 95;
  if (c.includes(q) || q.includes(c)) return 84;

  const cTokens = new Set(placeTokens(candidate));
  const qTokens = placeTokens(query);
  if (!qTokens.length) return 0;

  const intersection = qTokens.filter((token) => cTokens.has(token)).length;
  if (intersection === 0) return 0;

  const overlapRatio = intersection / qTokens.length;
  return Math.round(58 + overlapRatio * 32);
};

const isPlaceMatch = (candidate: string, query: string) => placeMatchScore(candidate, query) >= 80;

const routeStops = (route: any): string[] => {
  if (Array.isArray(route.stops) && route.stops.length) return route.stops;
  return [route.origin, route.destination].filter(Boolean);
};

const findStopIndex = (route: any, place: string) => {
  const stops = routeStops(route);
  let bestIndex = -1;
  let bestScore = 0;

  for (let index = 0; index < stops.length; index += 1) {
    const score = placeMatchScore(String(stops[index]), place);
    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  }

  return bestScore >= 70 ? bestIndex : -1;
};

const findBestStopName = (route: any, place: string) => {
  const idx = findStopIndex(route, place);
  if (idx === -1) return null;
  return routeStops(route)[idx] as string;
};

const resolveGlobalStopName = (routes: any[], place: string) => {
  if (isAmbiguousPlaceQuery(place)) {
    return {
      stop: place,
      score: 0
    };
  }

  let bestStop = place;
  let bestScore = 0;

  for (const route of routes) {
    for (const stop of routeStops(route)) {
      const score = placeMatchScore(String(stop), place);
      if (score > bestScore) {
        bestScore = score;
        bestStop = String(stop);
      }
    }
  }

  return {
    stop: bestScore >= 82 ? bestStop : place,
    score: bestScore
  };
};

const getCrowdReports = (db: any) => (Array.isArray(db.crowdReports) ? db.crowdReports : []);

const isWeekdayDate = (date?: string) => {
  if (!date) {
    const day = new Date().getDay();
    return day >= 1 && day <= 5;
  }
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return true;
  const day = parsed.getDay();
  return day >= 1 && day <= 5;
};

const getTemporalBoost = (hour: number, isWeekday: boolean) => {
  if (isWeekday) {
    if (hour >= 7 && hour <= 9) return 11;
    if (hour >= 12 && hour <= 14) return 3;
    if (hour >= 17 && hour <= 20) return 13;
    if (hour >= 22 || hour <= 5) return -8;
    return -2;
  }

  if (hour >= 11 && hour <= 14) return 4;
  if (hour >= 17 && hour <= 21) return 2;
  if (hour >= 23 || hour <= 6) return -7;
  return -3;
};

const getStopContextBoost = (stop: string, hour: number, isWeekday: boolean) => {
  const s = canonicalPlace(stop);
  if (!s) return 0;

  let boost = 0;
  const hasAny = (tokens: string[]) => tokens.some((token) => s.includes(token));

  if (isWeekday && hasAny(['elm', 'akademiya', 'universitet', 'uni', 'telebe'])) {
    if (hour >= 8 && hour <= 10) boost += 7;
    if (hour >= 15 && hour <= 18) boost += 9;
  }

  if (isWeekday && hasAny(['koroglu', '28 may', 'genclik', 'nizami', 'insaatcilar', 'nehciler', 'narimanov', 'avtovagzal'])) {
    if (hour >= 7 && hour <= 10) boost += 4;
    if (hour >= 17 && hour <= 20) boost += 6;
  }

  if (hasAny(['mall', 'park', 'merkez', 'mərkəz'])) {
    if (hour >= 16 && hour <= 21) boost += isWeekday ? 5 : 7;
    if (!isWeekday && hour >= 12 && hour <= 15) boost += 3;
  }

  if (hasAny(['xestexana', 'hospital', 'klinika'])) {
    if (hour >= 8 && hour <= 11) boost += 3;
    if (hour >= 17 && hour <= 20) boost += 2;
  }

  return boost;
};

const buildContextNote = (isWeekday: boolean, hour: number, stop: string, contextBoost: number) => {
  const displayStop = toEnglishLikeText(stop);
  const period = hour >= 17 && hour <= 20 ? 'evening peak' : hour >= 7 && hour <= 10 ? 'morning peak' : 'regular period';
  if (contextBoost >= 8) return `${isWeekday ? 'Weekday' : 'Weekend'} ${period}; ${displayStop} zone has high local demand.`;
  if (contextBoost >= 4) return `${isWeekday ? 'Weekday' : 'Weekend'} ${period}; ${displayStop} zone has moderate local demand.`;
  if (contextBoost <= -2) return `${isWeekday ? 'Weekday' : 'Weekend'} off-peak window detected.`;
  return `${isWeekday ? 'Weekday' : 'Weekend'} ${period} pattern applied.`;
};

const getCrowdMemory = (db: any, routeId: string, stop: string, departureTime: string, date?: string) => {
  const reports = getCrowdReports(db);
  const hour = parseHour(departureTime);
  const weekday = parseWeekday(date);
  const normalizedStop = normalizeStop(stop);

  const sameStopReports = reports.filter((item: any) => item.routeId === routeId && normalizeStop(item.stop) === normalizedStop);
  const sameSlotReports = sameStopReports.filter((item: any) => Number(item.hour) === hour);
  const sameWeekdayReports = sameSlotReports.filter((item: any) => {
    if (typeof item.dayOfWeek === 'number') return item.dayOfWeek === weekday;
    const createdAt = item.createdAt ? new Date(item.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) return false;
    return createdAt.getDay() === weekday;
  });

  const effectiveReports = sameWeekdayReports.length >= 2 ? sameWeekdayReports : sameSlotReports;
  const crowdedCount = effectiveReports.filter((item: any) => item.crowded).length;
  const crowdProbability = effectiveReports.length ? Math.round((crowdedCount / effectiveReports.length) * 100) : 0;
  const habitualCrowded = effectiveReports.length >= 5 && crowdProbability >= 60;

  return {
    reportsInThisHour: effectiveReports.length,
    crowdProbability,
    habitualCrowded,
    recentReports: sameStopReports.slice(-20).reverse().slice(0, 5).map((item: any) => ({
      crowded: item.crowded,
      reportedAt: item.createdAt,
      departureTime: item.departureTime
    }))
  };
};

const routeSchema = z.object({
  code: z.string().min(2),
  name: z.string().min(2),
  transportType: z.enum(['bus', 'metro', 'taxi', 'rail']),
  origin: z.string().min(2),
  destination: z.string().min(2),
  status: z.enum(['busy', 'stable', 'watch']),
  occupancy: z.number().min(0).max(100),
  delayRisk: z.enum(['low', 'medium', 'high']),
  capacity: z.number().min(1),
  avgDelayMinutes: z.number().min(0),
  crowded: z.boolean()
});

const teamSchema = z.object({
  name: z.string().min(2),
  surname: z.string().min(2),
  role: z.string().min(2),
  image: z.string().url(),
  bio: z.string().min(8)
});

app.get('/', (_req, res) => res.json({ name: 'AZCON Smart Transit AI API', status: 'ok', database: dbFilePath, aiEnabled: env.aiEnabled }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', aiEnabled: env.aiEnabled }));
app.get('/api/public/overview', (_req, res) => {
  const db = readDb();
  res.json({ analytics: db.analytics, institutions: db.institutions, team: db.team, routes: db.routes, recommendations: db.recommendations.filter((x: any) => x.audience === 'user') });
});

app.post('/api/auth/register', (req, res) => {
  try {
    const db = readDb();
    const siteSettings = getSiteSettings(db);
    if (!siteSettings.registrationOpen) return res.status(403).json({ message: 'Registration is temporarily disabled by administrator' });
    const body = reg.parse(req.body);
    if (db.users.some((u: any) => u.email === body.email)) return res.status(400).json({ message: 'Email exists' });
    const user = { id: `u_${Date.now()}`, ...body };
    db.users.push(user);
    writeDb(db);
    res.status(201).json({ token: sign({ id: user.id, email: user.email, role: user.role }), user: { ...user, password: undefined } });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  const body = z.object({ email: z.string().email(), password: z.string().min(6) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ message: 'Invalid login payload' });
  const db = readDb();
  const user = db.users.find((u: any) => u.email === body.data.email && u.password === body.data.password);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  res.json({ token: sign({ id: user.id, email: user.email, role: user.role }), user: { ...user, password: undefined } });
});

app.get('/api/dashboard', auth, (req: any, res) => {
  const db = readDb();
  const siteSettings = getSiteSettings(db);
  res.json({
    stats: [
      { label: 'Managed entities', value: String(db.analytics.overview.managedEntities), delta: 'AZCON ecosystem' },
      { label: 'Network demand', value: '1.2M/day', delta: 'based on public sector indicators' },
      { label: 'Average delay', value: '5.2 min', delta: '-0.6 min' },
      { label: 'Team members', value: db.team.length, delta: 'live db.json' }
    ],
    routes: db.routes,
    alerts: db.alerts,
    analytics: db.analytics,
    recommendations: db.recommendations,
    team: db.team,
    overview: db.analytics.overview,
    aiStatus: { enabled: env.aiEnabled && siteSettings.aiDispatchEnabled, model: env.aiEnabled ? env.openRouterModel : 'mock' },
    siteSettings,
    currentUserRole: req.user?.role
  });
});

app.get('/api/admin/site-settings', admin, (_req, res) => {
  const db = readDb();
  res.json(getSiteSettings(db));
});

app.put('/api/admin/site-settings', admin, (req, res) => {
  try {
    const db = readDb();
    db.siteSettings = siteSettingsSchema.parse(req.body);
    writeDb(db);
    res.json(db.siteSettings);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/routes', auth, (_req, res) => res.json(readDb().routes));
app.post('/api/routes', admin, (req, res) => {
  try {
    const db = readDb();
    const item = { id: `r_${Date.now()}`, ...routeSchema.parse(req.body) };
    db.routes.push(item);
    writeDb(db);
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});
app.put('/api/routes/:id', admin, (req, res) => {
  try {
    const db = readDb();
    const idx = db.routes.findIndex((x: any) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Route not found' });
    db.routes[idx] = { ...db.routes[idx], ...routeSchema.partial().parse(req.body) };
    writeDb(db);
    res.json(db.routes[idx]);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});
app.delete('/api/routes/:id', admin, (req, res) => {
  const db = readDb();
  db.routes = db.routes.filter((x: any) => x.id !== req.params.id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/team', auth, (_req, res) => res.json(readDb().team));
app.post('/api/team', admin, (req, res) => {
  try {
    const db = readDb();
    const item = { id: `t_${Date.now()}`, ...teamSchema.parse(req.body) };
    db.team.push(item);
    writeDb(db);
    res.status(201).json(item);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});
app.put('/api/team/:id', admin, (req, res) => {
  try {
    const db = readDb();
    const idx = db.team.findIndex((x: any) => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ message: 'Team member not found' });
    db.team[idx] = { ...db.team[idx], ...teamSchema.partial().parse(req.body) };
    writeDb(db);
    res.json(db.team[idx]);
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});
app.delete('/api/team/:id', admin, (req, res) => {
  const db = readDb();
  db.team = db.team.filter((x: any) => x.id !== req.params.id);
  writeDb(db);
  res.status(204).send();
});

app.get('/api/ai/passenger-flow/:routeId', auth, async (req, res) => {
  try { res.json(await getPassengerFlowPrediction(req.params.routeId)); } catch (e: any) { res.status(400).json({ message: e.message }); }
});
app.get('/api/ai/occupancy-forecast/:routeId', auth, async (req, res) => {
  try { res.json(await getOccupancyForecast(req.params.routeId)); } catch (e: any) { res.status(400).json({ message: e.message }); }
});
app.get('/api/ai/delay-risk/:routeId', auth, async (req, res) => {
  try { res.json(await getDelayRiskAssessment(req.params.routeId)); } catch (e: any) { res.status(400).json({ message: e.message }); }
});
app.post('/api/ai/recommendation', auth, async (req, res) => {
  try { res.json(await getSmartRecommendation(req.body ?? {})); } catch (e: any) { res.status(400).json({ message: e.message }); }
});

app.get('/api/maps/route-preview', auth, async (req, res) => {
  try {
    const query = routeMapQuerySchema.parse(req.query);
    const fromPoint = await geocodeStop(query.from);
    const toPoint = await geocodeStop(query.to);
    if (!fromPoint || !toPoint) {
      return res.status(404).json({ message: 'Could not resolve Baku coordinates for one or both stops.' });
    }

    if (!isInsideBakuBounds(fromPoint.lng, fromPoint.lat) || !isInsideBakuBounds(toPoint.lng, toPoint.lat)) {
      return res.status(404).json({ message: 'Stops must be inside Baku city bounds.' });
    }

    const directions = await getDirectionsBetween(fromPoint, toPoint);
    if (!directions) {
      return res.status(404).json({ message: 'No route path found on map provider.' });
    }

    res.json({
      from: fromPoint,
      to: toPoint,
      distanceMeters: directions.distanceMeters,
      durationSeconds: directions.durationSeconds,
      geometry: directions.geometry,
      staticMapUrl: buildStaticMapUrl(fromPoint, toPoint, directions.geometry)
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/staff/ai-overview', staff, (_req, res) => {
  const db = readDb();
  const routes = db.routes.map((route: any) => ({
    id: route.id,
    name: route.name,
    occupancy: route.occupancy,
    delayRisk: route.delayRisk,
    transportType: route.transportType,
    crowded: route.crowded,
    avgDelayMinutes: route.avgDelayMinutes
  }));
  res.json({ routes, alerts: db.alerts, siteSettings: getSiteSettings(db) });
});

app.post('/api/staff/deployment-plan', staff, (req, res) => {
  try {
    const body = staffPlanSchema.parse(req.body);
    const db = readDb();
    const route = db.routes.find((item: any) => item.id === body.routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    const effectiveOccupancy = clamp(route.occupancy + body.additionalDemandPercent, 0, 99);
    const overTarget = Math.max(0, effectiveOccupancy - body.targetOccupancy);
    const step = route.transportType === 'bus' ? 10 : 16;
    const deployUnits = Math.max(0, Math.ceil(overTarget / step));
    const estimatedMinutesToEase = deployUnits === 0 ? 0 : Math.max(10, deployUnits * 7 + route.avgDelayMinutes);

    res.json({
      routeId: route.id,
      routeName: route.name,
      currentOccupancy: route.occupancy,
      projectedOccupancy: effectiveOccupancy,
      targetOccupancy: body.targetOccupancy,
      suggestedDeployments: deployUnits,
      estimatedMinutesToEase,
      action: deployUnits > 0 ? `Deploy ${deployUnits} ${route.transportType === 'bus' ? 'bus(es)' : 'extra unit(s)'} to ${route.name}` : 'No extra deployment required',
      rationale: overTarget > 0 ? 'Projected occupancy is above target threshold.' : 'Projected occupancy is inside safe range.'
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.post('/api/user/trip-forecast', auth, async (req, res) => {
  try {
    const body = tripForecastSchema.parse(req.body);
    const db = readDb();
    const routes = Array.isArray(db.routes) ? db.routes : [];
    if (body.routeId) {
      const route = routes.find((item: any) => item.id === body.routeId);
      if (!route) return res.status(404).json({ message: 'Route not found' });

      const inputStop = body.stop || body.origin || route.origin || 'Main stop';
      const effectiveStop = findBestStopName(route, inputStop) || inputStop;
      const base = forecastForRoute(db, route, effectiveStop, body.departureTime, body.date);

      return res.json({
        routeId: route.id,
        routeName: route.name,
        stop: effectiveStop,
        date: body.date,
        departureTime: body.departureTime,
        predictedOccupancy: base.predictedOccupancy,
        crowdLevel: base.crowdLevel,
        estimatedMinutesToEase: base.estimatedMinutesToEase,
        community: base.crowdMemory,
        context: {
          weekday: base.weekday,
          note: base.contextNote
        },
        alternatives: [
          {
            id: 'direct',
            title: '1 bus option',
            transferCount: 0,
            totalPredictedOccupancy: base.predictedOccupancy,
            totalEstimatedMinutesToEase: base.estimatedMinutesToEase,
            crowdLevel: base.crowdLevel,
            summary: `Stay on ${route.code}. This is the selected direct route.`,
            legs: [
              {
                routeId: route.id,
                routeCode: route.code,
                routeName: route.name,
                from: route.origin,
                to: route.destination,
                predictedOccupancy: base.predictedOccupancy,
                crowdLevel: base.crowdLevel,
                estimatedMinutesToEase: base.estimatedMinutesToEase
              }
            ]
          }
        ],
        recommendation:
          base.predictedOccupancy >= 85
            ? `Crowding is expected to be high. ${base.contextNote} Consider waiting for the next interval or switching routes.`
            : base.predictedOccupancy >= 65
              ? `Moderate crowding expected. ${base.contextNote} Travel is possible with short waiting time.`
              : `Low crowding expected. ${base.contextNote} This is a good departure window.`
      });
    }

    const originInput = body.origin as string;
    const destinationInput = body.destination as string;
    const originMatch = resolveGlobalStopName(routes, originInput);
    const destinationMatch = resolveGlobalStopName(routes, destinationInput);
    let origin = originMatch.stop;
    let destination = destinationMatch.stop;

    if (canonicalPlace(originInput) !== canonicalPlace(destinationInput) && canonicalPlace(origin) === canonicalPlace(destination)) {
      if (originMatch.score <= destinationMatch.score && originMatch.score < 92) {
        origin = originInput;
      } else if (destinationMatch.score < 92) {
        destination = destinationInput;
      }
    }

    const directCandidates = routes
      .map((route: any) => {
        const fromStop = findBestStopName(route, origin);
        const toStop = findBestStopName(route, destination);
        if (!fromStop || !toStop || isPlaceMatch(fromStop, toStop)) return null;

        const fromIdx = findStopIndex(route, fromStop);
        const toIdx = findStopIndex(route, toStop);
        if (fromIdx === -1 || toIdx === -1 || fromIdx === toIdx) return null;

        const legForecast = forecastForRoute(db, route, fromStop, body.departureTime, body.date);
        const fastScore = legForecast.estimatedMinutesToEase;
        const comfortScore = legForecast.predictedOccupancy;
        return {
          id: 'direct',
          title: '1 bus, direct',
          transferCount: 0,
          totalPredictedOccupancy: legForecast.predictedOccupancy,
          totalEstimatedMinutesToEase: legForecast.estimatedMinutesToEase,
          crowdLevel: legForecast.crowdLevel,
          fastScore,
          comfortScore,
          score: comfortScore * 0.6 + fastScore * 0.4,
          summary: `Take ${route.code} directly from ${toEnglishLikeText(fromStop)} to ${toEnglishLikeText(toStop)}.`,
          community: legForecast.crowdMemory,
          legs: [
            {
              routeId: route.id,
              routeCode: route.code,
              routeName: route.name,
              from: fromStop,
              to: toStop,
              predictedOccupancy: legForecast.predictedOccupancy,
              crowdLevel: legForecast.crowdLevel,
              estimatedMinutesToEase: legForecast.estimatedMinutesToEase
            }
          ]
        };
      })
      .filter(Boolean) as any[];

    const transferCandidates: any[] = [];
    for (const first of routes) {
      const firstFromStop = findBestStopName(first, origin);
      if (!firstFromStop) continue;

      const firstStops = routeStops(first);
      for (const second of routes) {
        if (first.id === second.id) continue;
        const secondToStop = findBestStopName(second, destination);
        if (!secondToStop) continue;

        const secondStops = routeStops(second);
        const legA = forecastForRoute(db, first, firstFromStop, body.departureTime, body.date);
        let bestForPair: any = null;

        for (const firstInterchange of firstStops) {
          if (!firstInterchange || isPlaceMatch(firstInterchange, firstFromStop) || isPlaceMatch(firstInterchange, secondToStop)) continue;

          const secondInterchange = secondStops.find((stop: string) => isPlaceMatch(stop, firstInterchange));
          if (!secondInterchange || isPlaceMatch(secondInterchange, secondToStop)) continue;

          const legB = forecastForRoute(db, second, secondInterchange, body.departureTime, body.date);
          const totalPredictedOccupancy = Math.round((legA.predictedOccupancy + legB.predictedOccupancy) / 2);
          const transferPenaltyMinutes = 6;
          const totalEstimatedMinutesToEase = legA.estimatedMinutesToEase + legB.estimatedMinutesToEase + transferPenaltyMinutes;
          const crowdLevel = levelFromOccupancy(totalPredictedOccupancy);
          const fastScore = totalEstimatedMinutesToEase;
          const comfortScore = totalPredictedOccupancy;
          const candidate = {
            id: 'transfer',
            title: '2 buses, 1 interchange',
            transferCount: 1,
            interchange: firstInterchange,
            totalPredictedOccupancy,
            totalEstimatedMinutesToEase,
            crowdLevel,
            fastScore,
            comfortScore,
            score: comfortScore * 0.6 + fastScore * 0.4 + 2,
            summary: `Take ${first.code} from ${toEnglishLikeText(firstFromStop)} to ${toEnglishLikeText(firstInterchange)}, then transfer to ${second.code} and continue to ${toEnglishLikeText(secondToStop)}.`,
            community: legA.crowdMemory,
            legs: [
              {
                routeId: first.id,
                routeCode: first.code,
                routeName: first.name,
                from: firstFromStop,
                to: firstInterchange,
                predictedOccupancy: legA.predictedOccupancy,
                crowdLevel: legA.crowdLevel,
                estimatedMinutesToEase: legA.estimatedMinutesToEase
              },
              {
                routeId: second.id,
                routeCode: second.code,
                routeName: second.name,
                from: secondInterchange,
                to: secondToStop,
                predictedOccupancy: legB.predictedOccupancy,
                crowdLevel: legB.crowdLevel,
                estimatedMinutesToEase: legB.estimatedMinutesToEase
              }
            ]
          };

          if (!bestForPair || candidate.score < bestForPair.score) {
            bestForPair = candidate;
          }
        }

        if (bestForPair) transferCandidates.push(bestForPair);
      }
    }

    const bestDirect = directCandidates.sort((a, b) => a.score - b.score)[0] || null;
    const bestTransfer = transferCandidates.sort((a, b) => a.score - b.score)[0] || null;
    const alternatives = [bestDirect, bestTransfer].filter(Boolean);

    if (alternatives.length === 0) {
      return res.status(404).json({
        message: `No route option found from "${toEnglishLikeText(originInput)}" to "${toEnglishLikeText(destinationInput)}". Try another stop name.`
      });
    }

    const allCandidates = [...directCandidates, ...transferCandidates];
    const fastestOption = allCandidates.sort((a, b) => a.fastScore - b.fastScore)[0] || null;
    const leastCrowdedOption = allCandidates.sort((a, b) => a.comfortScore - b.comfortScore)[0] || null;
    const recommended = bestDirect || bestTransfer;
    const displayOrigin = toEnglishLikeText(originInput);
    const displayDestination = toEnglishLikeText(destinationInput);
    const directVsTransferNote =
      bestDirect && bestTransfer
        ? bestTransfer.totalPredictedOccupancy < bestDirect.totalPredictedOccupancy
          ? `2 buses can reduce crowding by about ${bestDirect.totalPredictedOccupancy - bestTransfer.totalPredictedOccupancy}% but requires 1 transfer.`
          : `1 bus is more convenient and crowding difference is small.`
        : bestDirect
          ? 'A direct route was found and prioritized as the recommended option.'
          : 'A transfer route was found as the only viable option.';
    const optimizationNote = [
      fastestOption ? `Fastest option: ${fastestOption.summary}` : '',
      leastCrowdedOption ? `Least-crowded option: ${leastCrowdedOption.summary}` : ''
    ]
      .filter(Boolean)
      .join(' ');
    const weekday = isWeekdayDate(body.date);
    const hour = parseHour(body.departureTime);
    const contextNote = buildContextNote(weekday, hour, origin, getStopContextBoost(origin, hour, weekday));
    const groundedNarrative = await getGroundedTripNarrative({
      origin: displayOrigin,
      destination: displayDestination,
      departureTime: body.departureTime,
      date: body.date,
      recommendedSummary: recommended.summary,
      contextNote,
      directVsTransferNote: `${directVsTransferNote} ${optimizationNote}`.trim(),
      alternatives: alternatives.map((item) => ({
        id: item.id,
        transferCount: item.transferCount,
        summary: item.summary,
        crowdLevel: item.crowdLevel,
        totalPredictedOccupancy: item.totalPredictedOccupancy,
        totalEstimatedMinutesToEase: item.totalEstimatedMinutesToEase
      }))
    });

    res.json({
      routeId: recommended.legs[0].routeId,
      routeName: recommended.transferCount === 0 ? recommended.legs[0].routeName : `${recommended.legs[0].routeCode} + ${recommended.legs[1].routeCode}`,
      stop: origin,
      date: body.date,
      departureTime: body.departureTime,
      predictedOccupancy: recommended.totalPredictedOccupancy,
      crowdLevel: recommended.crowdLevel,
      estimatedMinutesToEase: recommended.totalEstimatedMinutesToEase,
      community: recommended.community,
      context: {
        weekday,
        note: contextNote
      },
      journey: { origin: displayOrigin, destination: displayDestination },
      recommendedOptionId: recommended.id,
      alternatives: alternatives.map((item) => ({
        id: item.id,
        title: item.title,
        transferCount: item.transferCount,
        interchange: item.interchange ? toEnglishLikeText(item.interchange) : undefined,
        totalPredictedOccupancy: item.totalPredictedOccupancy,
        totalEstimatedMinutesToEase: item.totalEstimatedMinutesToEase,
        crowdLevel: item.crowdLevel,
        summary: item.summary,
        legs: item.legs
      })),
      recommendation: groundedNarrative.recommendation
    });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.post('/api/user/crowd-report', auth, (req: any, res) => {
  try {
    const body = crowdReportSchema.parse(req.body);
    const db = readDb();
    const route = db.routes.find((item: any) => item.id === body.routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    if (!Array.isArray(db.crowdReports)) db.crowdReports = [];
    const report = {
      id: `cr_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      routeId: body.routeId,
      stop: body.stop,
      departureTime: body.departureTime,
      hour: parseHour(body.departureTime),
      dayOfWeek: new Date().getDay(),
      crowded: body.crowded,
      userId: req.user?.id,
      createdAt: new Date().toISOString()
    };

    db.crowdReports.push(report);
    if (db.crowdReports.length > 3000) db.crowdReports = db.crowdReports.slice(-3000);
    writeDb(db);

    const memory = getCrowdMemory(db, body.routeId, body.stop, body.departureTime);
    res.status(201).json({ saved: true, reportId: report.id, memory });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.get('/api/user/crowd-feed', auth, (req, res) => {
  try {
    const query = z
      .object({
        routeId: z.string().min(1),
        stop: z.string().min(2),
        limit: z.string().optional()
      })
      .parse(req.query);

    const db = readDb();
    const reports = getCrowdReports(db)
      .filter((item: any) => item.routeId === query.routeId && normalizeStop(item.stop) === normalizeStop(query.stop))
      .reverse()
      .slice(0, clamp(Number(query.limit ?? 8), 1, 20))
      .map((item: any) => ({ crowded: item.crowded, departureTime: item.departureTime, reportedAt: item.createdAt }));

    res.json({ reports });
  } catch (e: any) {
    res.status(400).json({ message: e.message });
  }
});

app.listen(env.port, () => console.log(`AZCON backend listening on http://localhost:${env.port}`));
