import { AlertItem, PredictionCardData, RouteItem, User } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unexpected error' }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) return undefined as T;
  return response.json();
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
    crowded: route.crowded
  };
}

function mapAlert(alert: any): AlertItem {
  return {
    id: alert.id,
    title: alert.title,
    severity: alert.severity === 'critical' ? 'high' : alert.severity,
    message: alert.message || alert.description,
    createdAt: alert.createdAt
  };
}

function mapPrediction(item: any, idx: number): PredictionCardData {
  return {
    routeId: item.routeId || `rec-${idx + 1}`,
    passengerFlow: item.passengerFlow ?? 0,
    occupancyForecast: item.occupancyForecast ?? 0,
    delayRiskScore: item.delayRiskScore ?? Math.round((item.confidence ?? 0.72) * 100),
    recommendation: item.recommendation || item.description || item.title
  };
}

export const apiClient = {
  login: (payload: { email: string; password: string }) => request<{ token: string; user: User }>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  register: (payload: { name: string; surname: string; email: string; password: string; role?: 'admin' | 'user'; preferredLanguage: string }) =>
    request<{ token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ ...payload, theme: 'dark', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80' })
    }),
  async getDashboard(token: string) {
    const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    return {
      stats: data.stats,
      routes: (data.routes || []).map(mapRoute),
      predictions: (data.recommendations || []).map(mapPrediction),
      alerts: (data.alerts || []).map(mapAlert)
    };
  },
  async getRoutes(token: string) {
    const data = await request<any[]>('/routes', { headers: { Authorization: `Bearer ${token}` } });
    return data.map(mapRoute);
  },
  async getRecommendations(token: string) {
    const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    return (data.recommendations || []).map(mapPrediction);
  },
  async getAdminAnalytics(token: string) {
    const data = await request<any>('/dashboard', { headers: { Authorization: `Bearer ${token}` } });
    const routes = (data.routes || []).map(mapRoute);
    return {
      alerts: (data.alerts || []).map(mapAlert),
      routes,
      kpis: [
        { label: 'Crowded routes', value: String(routes.filter((route) => route.occupancy >= 80).length), helper: 'Routes above safe occupancy threshold' },
        { label: 'Average occupancy', value: `${Math.round(routes.reduce((sum, route) => sum + route.occupancy, 0) / Math.max(routes.length, 1))}%`, helper: 'Live blended network average' },
        { label: 'High risk corridors', value: String(routes.filter((route) => route.delayRisk === 'high').length), helper: 'Requires operator attention' }
      ]
    };
  },
  upsertRoute: (token: string, payload: Partial<RouteItem>) =>
    request<RouteItem>('/routes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        code: `R-${Date.now().toString().slice(-4)}`,
        name: payload.name,
        transportType: payload.transportType || 'bus',
        origin: payload.corridor?.split('→')[0]?.trim() || 'Central Hub',
        destination: payload.corridor?.split('→')[1]?.trim() || 'Transit Park',
        status: 'stable',
        occupancy: payload.occupancy ?? 45,
        delayRisk: payload.delayRisk ?? 'low',
        capacity: payload.capacity ?? 120,
        avgDelayMinutes: payload.etaVariance ?? 3,
        crowded: false
      })
    }),
  deleteRoute: (token: string, routeId: string) => request<{ success: boolean }>(`/routes/${routeId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
};
