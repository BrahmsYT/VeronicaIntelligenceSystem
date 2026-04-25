'use client';

import { useMemo, useState } from 'react';
import { Plus, Route as RouteIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
      <Card padding='none'>
        <div className='p-6'>
          <CardHeader overline='Network' title='Route registry' description='Sorted by occupancy descending.' icon={<RouteIcon className='h-5 w-5' />} action={<Badge tone='neutral'>{sortedRoutes.length} routes</Badge>} className='mb-0' />
        </div>
        <div className='divider' />
        <div className='divide-y divide-[color:var(--border)]'>
          {sortedRoutes.map((route) => {
            const tone: 'success' | 'warning' | 'danger' = route.occupancy >= 85 ? 'danger' : route.occupancy >= 65 ? 'warning' : 'success';
            return (
              <div key={route.id} className='flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[var(--surface)]'>
                <div className='min-w-0'>
                  <p className='truncate text-sm font-semibold'>{route.name}</p>
                  <p className='truncate text-xs text-[color:var(--text-soft)]'>{route.corridor}</p>
                </div>
                <div className='flex items-center gap-3'>
                  <Badge tone={tone} withDot>{route.occupancy}% occ.</Badge>
                  <button
                    className='inline-flex items-center gap-1.5 rounded-md border border-[color:color-mix(in_srgb,var(--danger)_30%,transparent)] bg-[var(--danger-soft)] px-2 py-1 text-[11px] font-semibold text-[color:#fda4af] disabled:opacity-50 hover:brightness-110'
                    onClick={() => deleteRoute(route.id)}
                    disabled={loadingId === route.id}
                  >
                    <Trash2 className='h-3 w-3' /> {loadingId === route.id ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
      <Card>
        <CardHeader overline='CRUD' title='Add route' icon={<Plus className='h-5 w-5' />} />
        <div className='space-y-3'>
          <input className='input-base' placeholder='Route name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className='input-base' placeholder='Origin' value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} />
          <input className='input-base' placeholder='Destination' value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} />
          <select className='input-base capitalize' value={form.transportType} onChange={(e) => setForm({ ...form, transportType: e.target.value as TransportType })}>
            <option value='bus'>Bus</option><option value='metro'>Metro</option><option value='taxi'>Taxi</option><option value='rail'>Rail</option>
          </select>
          <div className='grid gap-3 md:grid-cols-3'>
            <input type='number' className='input-base' placeholder='Occupancy' value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: Number(e.target.value) })} />
            <input type='number' className='input-base' placeholder='Delay' value={form.avgDelayMinutes} onChange={(e) => setForm({ ...form, avgDelayMinutes: Number(e.target.value) })} />
            <input type='number' className='input-base' placeholder='Capacity' value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} />
          </div>
          <Button className='w-full' onClick={createRoute} leftIcon={<Plus className='h-4 w-4' />}>Save route</Button>
          {message ? <p className='inline-flex items-center gap-2 text-xs text-[color:var(--text-soft)]'><span className='dot bg-[color:var(--success)]' /> {message}</p> : null}
        </div>
      </Card>
    </div>
  );
}
