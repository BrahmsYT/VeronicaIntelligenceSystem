import { Route as RouteIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader } from '@/components/ui/card';
import { RouteItem } from '@/lib/types';

function occupancyTone(occ: number): 'success' | 'warning' | 'danger' {
  if (occ >= 85) return 'danger';
  if (occ >= 65) return 'warning';
  return 'success';
}

export function RoutesTable({ routes }: { routes: RouteItem[] }) {
  return (
    <Card padding='none' className='overflow-hidden'>
      <div className='p-6 pb-4'>
        <CardHeader
          overline='Network'
          title='Live route monitor'
          description='Crowding, delay risk and operational quality'
          icon={<RouteIcon className='h-5 w-5' />}
          action={<Badge tone='neutral'>{routes.length} routes</Badge>}
          className='mb-0'
        />
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-y border-[color:var(--border)] bg-[var(--surface)]'>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Bus no</th>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Route</th>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Corridor</th>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Occupancy</th>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Delay risk</th>
              <th className='px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--muted)]'>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => {
              const occTone = occupancyTone(route.occupancy);
              const occColor = occTone === 'danger' ? 'var(--danger)' : occTone === 'warning' ? 'var(--warning)' : 'var(--success)';
              return (
                <tr key={route.id} className='group border-b border-[color:var(--border)] last:border-0 transition-colors hover:bg-[var(--surface)]'>
                  <td className='px-6 py-4'>
                    <span className='inline-flex min-w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[var(--surface-2)] px-2 py-1 text-xs font-semibold'>
                      {route.code || '—'}
                    </span>
                  </td>
                  <td className='px-6 py-4 font-semibold'>{route.name}</td>
                  <td className='px-6 py-4 text-[color:var(--text-soft)]'>{route.corridor}</td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className='relative h-1.5 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]'>
                        <div className='absolute inset-y-0 left-0 rounded-full' style={{ width: `${Math.min(route.occupancy, 100)}%`, background: occColor }} />
                      </div>
                      <span className='numeric text-xs font-semibold' style={{ color: occColor }}>{route.occupancy}%</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <Badge tone={route.delayRisk === 'high' ? 'danger' : route.delayRisk === 'medium' ? 'warning' : 'success'} withDot>
                      {route.delayRisk}
                    </Badge>
                  </td>
                  <td className='px-6 py-4 text-[color:var(--text-soft)] capitalize'>{route.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
