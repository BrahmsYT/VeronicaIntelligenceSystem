'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RouteItem, TransportType } from '@/lib/types';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';

export function RouteManager({ routes }: { routes: RouteItem[] }) {
  const { token } = useApp();
  const [form, setForm] = useState({ name: '', origin: '', destination: '', transportType: 'bus' as TransportType, occupancy: 45, avgDelayMinutes: 3, capacity: 120 });
  const [message, setMessage] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const sortedRoutes = useMemo(() => [...routes].sort((a, b) => b.occupancy - a.occupancy), [routes]);

  const createRoute = async () => {
    if (!token) return;
    await apiClient.upsertRoute(token, form);
    setMessage('Route created in db.json backend. Refresh to load the latest data.');
    setForm({ name: '', origin: '', destination: '', transportType: 'bus', occupancy: 45, avgDelayMinutes: 3, capacity: 120 });
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
            <div key={route.id} className='flex items-center justify-between rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
              <div>
                <p className='font-medium'>{route.name}</p>
                <p className='text-sm soft-text'>{route.corridor}</p>
              </div>
              <div className='flex items-center gap-3'>
                <div className='text-sm soft-text'>{route.occupancy}% occ.</div>
                <button className='rounded-xl px-3 py-2 text-xs text-rose-300' style={{ border: '1px solid rgba(244,63,94,.24)' }} onClick={() => deleteRoute(route.id)} disabled={loadingId === route.id}>
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
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Route name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Origin' value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          <input className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Destination' value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <select className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={form.transportType} onChange={(e) => setForm({ ...form, transportType: e.target.value as TransportType })}>
            <option value='bus'>Bus</option><option value='metro'>Metro</option><option value='taxi'>Taxi</option><option value='rail'>Rail</option>
          </select>
          <div className='grid gap-4 md:grid-cols-3'>
            <input type='number' className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Occupancy' value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: Number(e.target.value) })} />
            <input type='number' className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Delay' value={form.avgDelayMinutes} onChange={(e) => setForm({ ...form, avgDelayMinutes: Number(e.target.value) })} />
            <input type='number' className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} placeholder='Capacity' value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <Button className='w-full' onClick={createRoute}>Save route</Button>
          {message ? <p className='text-sm text-emerald-300'>{message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
