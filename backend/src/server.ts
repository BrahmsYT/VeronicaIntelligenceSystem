import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { env } from './config';
import { readDb, writeDb, dbFilePath } from './db';
import { sign, verify } from './auth';
import { getDelayRiskAssessment, getOccupancyForecast, getPassengerFlowPrediction, getSmartRecommendation } from './services/ai';

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

const tripForecastSchema = z.object({
  routeId: z.string().min(1),
  stop: z.string().min(2),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
});

const crowdReportSchema = z.object({
  routeId: z.string().min(1),
  stop: z.string().min(2),
  departureTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
  crowded: z.boolean()
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

const parseHour = (value: string) => Number(value.split(':')[0]);

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const normalizeStop = (value: string) => value.trim().toLowerCase();

const getCrowdReports = (db: any) => (Array.isArray(db.crowdReports) ? db.crowdReports : []);

const getCrowdMemory = (db: any, routeId: string, stop: string, departureTime: string) => {
  const reports = getCrowdReports(db);
  const hour = parseHour(departureTime);
  const normalizedStop = normalizeStop(stop);

  const sameStopReports = reports.filter((item: any) => item.routeId === routeId && normalizeStop(item.stop) === normalizedStop);
  const sameSlotReports = sameStopReports.filter((item: any) => Number(item.hour) === hour);
  const crowdedCount = sameSlotReports.filter((item: any) => item.crowded).length;
  const crowdProbability = sameSlotReports.length ? Math.round((crowdedCount / sameSlotReports.length) * 100) : 0;
  const habitualCrowded = sameSlotReports.length >= 5 && crowdProbability >= 60;

  return {
    reportsInThisHour: sameSlotReports.length,
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

app.post('/api/user/trip-forecast', auth, (req, res) => {
  try {
    const body = tripForecastSchema.parse(req.body);
    const db = readDb();
    const route = db.routes.find((item: any) => item.id === body.routeId);
    if (!route) return res.status(404).json({ message: 'Route not found' });

    const hour = parseHour(body.departureTime);
    const peakBoost = hour >= 7 && hour <= 9 ? 9 : hour >= 17 && hour <= 20 ? 11 : -4;
    const crowdBoost = route.crowded ? 6 : 0;
  const crowdMemory = getCrowdMemory(db, route.id, body.stop, body.departureTime);
  const communityBoost = crowdMemory.crowdProbability >= 70 ? 6 : crowdMemory.crowdProbability >= 50 ? 3 : 0;
  const predictedOccupancy = clamp(Math.round(route.occupancy + peakBoost + crowdBoost + communityBoost), 12, 99);
    const estimatedMinutesToEase = predictedOccupancy <= 70 ? 0 : Math.round(18 + (predictedOccupancy - 70) * 0.9);
    const crowdLevel = predictedOccupancy >= 85 ? 'high' : predictedOccupancy >= 65 ? 'medium' : 'low';

    res.json({
      routeId: route.id,
      routeName: route.name,
      stop: body.stop,
      departureTime: body.departureTime,
      predictedOccupancy,
      crowdLevel,
      estimatedMinutesToEase,
      community: crowdMemory,
      recommendation:
        predictedOccupancy >= 85
          ? 'Crowding is expected to be high. Consider waiting for the next interval or switch to metro/rail.'
          : predictedOccupancy >= 65
            ? 'Moderate crowding expected. Travel is possible with short waiting time.'
            : 'Low crowding expected. This is a good departure window.'
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
