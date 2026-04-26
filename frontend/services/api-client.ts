import { AlertItem, CrowdFeedReport, CrowdReportResult, DeploymentPlan, PredictionCardData, RouteItem, SiteSettings, StaffRouteOps, TeamMember, ThemePreset, TripForecast, User } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });

  if (!response.ok) {
    const error = (await response.json().catch(() => ({ message: 'Unexpected error' }))) as { message?: string };
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function mapRoute(route: any): RouteItem {
  const corridor = route.corridor || [route.origin, route.destination].filter(Boolean).join(' → ') || route.code || 'Transit corridor';
  return {
    id: route.id,
    code: route.code,
    name: route.name,
    corridor,
    occupancy: route.occupancy,
    delayRisk: route.delayRisk,
    status: route.status === 'busy' ? 'monitoring' : route.status === 'watch' ? 'delayed' : 'on-time',
    trend: route.trend || [Math.max(20, route.occupancy - 12), Math.max(26, route.occupancy - 6), route.occupancy],
    etaVariance: route.etaVariance ?? route.avgDelayMinutes ?? 2,
    transportType: route.transportType,
    origin: route.origin,
    destination: route.destination,
    capacity: route.capacity,
    avgDelayMinutes: route.avgDelayMinutes,
    crowded: route.crowded,
    stops: Array.isArray(route.stops) ? route.stops : undefined,
    stopCount: typeof route.stopCount === 'number' ? route.stopCount : (Array.isArray(route.stops) ? route.stops.length : undefined),
    firstDeparture: route.firstDeparture,
    lastDeparture: route.lastDeparture
  };
}

function mapAlert(alert: any): AlertItem {
  return { id: alert.id, title: alert.title, severity: alert.severity === 'critical' ? 'high' : alert.severity, message: alert.message || alert.description, createdAt: alert.createdAt };
}

function mapPrediction(item: any, idx: number): PredictionCardData {
  return { routeId: item.routeId || `rec-${idx + 1}`, passengerFlow: item.passengerFlow ?? 0, occupancyForecast: item.occupancyForecast ?? 0, delayRiskScore: item.delayRiskScore ?? Math.round((item.confidence ?? 0.72) * 100), recommendation: item.recommendation || item.description || item.title };
}

export const apiClient = {
  login: (payload: { email: string; password: string }) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { name: string; surname: string; email: string; password: string; role?: 'admin' | 'staff' | 'user'; preferredLanguage: string; preferredTransport: string; theme: ThemePreset }) =>
    request<{ token: string; user: User }>('/auth/register', { method: 'POST', body: JSON.stringify({ ...payload, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' }) }),
  async getPublicOverview() { return request<any>('/public/overview'); },
  async getDashboard(token: string) {
    const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    return { stats: data.stats, routes: (data.routes || []).map(mapRoute), predictions: (data.recommendations || []).map(mapPrediction), alerts: (data.alerts || []).map(mapAlert), aiStatus: data.aiStatus, team: data.team || [], overview: data.overview || {} };
  },
  async getRoutes(token: string) { return (await request<any[]>('/routes', { headers: { Authorization: `Bearer ${token}` } })).map(mapRoute); },
  async getRecommendations(token: string) { const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } }); return (data.recommendations || []).map(mapPrediction); },
  async getAdminAnalytics(token: string) {
    const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    const routes = (data.routes || []).map(mapRoute);
    return { alerts: (data.alerts || []).map(mapAlert), routes, team: data.team || [], aiStatus: data.aiStatus, kpis: [
      { label: 'Crowded routes', value: String(routes.filter((route: RouteItem) => route.occupancy >= 80).length), helper: 'Routes above safe occupancy threshold' },
      { label: 'Average occupancy', value: `${Math.round(routes.reduce((sum: number, route: RouteItem) => sum + route.occupancy, 0) / Math.max(routes.length, 1))}%`, helper: 'Live blended network average' },
      { label: 'High risk corridors', value: String(routes.filter((route: RouteItem) => route.delayRisk === 'high').length), helper: 'Requires operator attention' }
    ] };
  },
  upsertRoute: (token: string, payload: { name: string; origin: string; destination: string; transportType: string; occupancy: number; avgDelayMinutes: number; capacity: number }) =>
    request<RouteItem>('/routes', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ code: `R-${Date.now().toString().slice(-4)}`, name: payload.name, transportType: payload.transportType, origin: payload.origin, destination: payload.destination, status: payload.occupancy >= 80 ? 'busy' : payload.avgDelayMinutes > 5 ? 'watch' : 'stable', occupancy: payload.occupancy, delayRisk: payload.occupancy >= 80 ? 'high' : payload.avgDelayMinutes > 5 ? 'medium' : 'low', capacity: payload.capacity, avgDelayMinutes: payload.avgDelayMinutes, crowded: payload.occupancy >= 85 }) }),
  deleteRoute: (token: string, routeId: string) => request<{ success: boolean }>(`/routes/${routeId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  getTeam: (token: string) => request<TeamMember[]>('/team', { headers: { Authorization: `Bearer ${token}` } }),
  createTeamMember: (token: string, payload: Omit<TeamMember, 'id'>) => request<TeamMember>('/team', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  deleteTeamMember: (token: string, id: string) => request<{ success: boolean }>(`/team/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  getSmartRecommendation: (token: string, payload: Record<string, unknown>) => request<{ recommendation: string; actions?: string[]; source: string }>('/ai/recommendation', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  getSiteSettings: (token: string) => request<SiteSettings>('/admin/site-settings', { headers: { Authorization: `Bearer ${token}` } }),
  updateSiteSettings: (token: string, payload: SiteSettings) => request<SiteSettings>('/admin/site-settings', { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  getStaffAiOverview: (token: string) => request<{ routes: StaffRouteOps[]; alerts: AlertItem[]; siteSettings: SiteSettings }>('/staff/ai-overview', { headers: { Authorization: `Bearer ${token}` } }),
  getDeploymentPlan: (token: string, payload: { routeId: string; additionalDemandPercent?: number; targetOccupancy?: number }) =>
    request<DeploymentPlan>('/staff/deployment-plan', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  getTripForecast: (token: string, payload: { departureTime: string; date?: string; routeId?: string; stop?: string; origin?: string; destination?: string }) =>
    request<TripForecast>('/user/trip-forecast', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  submitCrowdReport: (token: string, payload: { routeId: string; stop: string; departureTime: string; crowded: boolean }) =>
    request<CrowdReportResult>('/user/crowd-report', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) }),
  getCrowdFeed: (token: string, payload: { routeId: string; stop: string; limit?: number }) =>
    request<{ reports: CrowdFeedReport[] }>(`/user/crowd-feed?routeId=${encodeURIComponent(payload.routeId)}&stop=${encodeURIComponent(payload.stop)}&limit=${payload.limit ?? 8}`, { headers: { Authorization: `Bearer ${token}` } }),
  getRoutePreview: (token: string, payload: { from: string; to: string }) =>
    request<{
      from: { label: string; lng: number; lat: number };
      to: { label: string; lng: number; lat: number };
      distanceMeters: number;
      durationSeconds: number;
      staticMapUrl: string;
      geometry: number[][];
    }>(`/maps/route-preview?from=${encodeURIComponent(payload.from)}&to=${encodeURIComponent(payload.to)}`, { headers: { Authorization: `Bearer ${token}` } })
};
