'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RouteItem, TransportType } from '@/lib/types';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';

export function RouteManager({ routes }: { routes: RouteItem[] }) {
  const { token } = useApp();
  const [form, setForm] = useState({ name: '', corridor: '', transportType: 'bus' as TransportType });
  const [message, setMessage] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const sortedRoutes = useMemo(() => [...routes].sort((a, b) => b.occupancy - a.occupancy), [routes]);

  const createRoute = async () => {
    if (!token) return;
    await apiClient.upsertRoute(token, { name: form.name, corridor: form.corridor, transportType: form.transportType, occupancy: 45, delayRisk: 'low', status: 'on-time', trend: [33, 48, 42], etaVariance: 2.1 });
    setMessage('Route created in db.json backend. Refresh to load the latest data.');
    setForm({ name: '', corridor: '', transportType: 'bus' });
  };

  const deleteRoute = async (routeId: string) => {
    if (!token) return;
    setLoadingId(routeId);
    await apiClient.deleteRoute(token, routeId);
    setMessage('Route removed from db.json backend. Refresh to sync the registry.');
    setLoadingId(null);
  };

  return (
    <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
      <Card>
        <h3 className='text-lg font-semibold'>Route registry</h3>
        <div className='mt-4 space-y-3'>
          {sortedRoutes.map((route) => (
            <div key={route.id} className='flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div>
                <p className='font-medium'>{route.name}</p>
                <p className='text-sm text-slate-400'>{route.corridor}</p>
              </div>
              <div className='flex items-center gap-3'>
                <div className='text-sm text-slate-300'>{route.occupancy}% occ.</div>
                <button className='rounded-xl border border-rose-400/20 px-3 py-2 text-xs text-rose-300 hover:bg-rose-500/10' onClick={() => deleteRoute(route.id)} disabled={loadingId === route.id}>
                  {loadingId === route.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className='text-lg font-semibold'>Add route</h3>
        <div className='mt-4 space-y-4'>
          <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='Route name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='Corridor (e.g. Koroglu → Airport)' value={form.corridor} onChange={(e) => setForm({ ...form, corridor: e.target.value })} />
          <select className='w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none' value={form.transportType} onChange={(e) => setForm({ ...form, transportType: e.target.value as TransportType })}>
            <option value='bus'>Bus</option>
            <option value='metro'>Metro</option>
            <option value='taxi'>Taxi</option>
            <option value='rail'>Rail</option>
          </select>
          <Button className='w-full' onClick={createRoute}>Save route</Button>
          {message ? <p className='text-sm text-emerald-300'>{message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
