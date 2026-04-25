import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { RouteItem } from '@/lib/types';

export function RoutesTable({ routes }: { routes: RouteItem[] }) {
  return (
    <Card>
      <div className='mb-4 flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>Live route monitor</h3>
          <p className='text-sm text-slate-400'>Crowding, risk and operational quality</p>
        </div>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead className='text-slate-400'>
            <tr>
              <th className='pb-3'>Route</th>
              <th className='pb-3'>Corridor</th>
              <th className='pb-3'>Occupancy</th>
              <th className='pb-3'>Delay Risk</th>
              <th className='pb-3'>Status</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((route) => (
              <tr key={route.id} className='border-t border-white/5'>
                <td className='py-4 font-medium'>{route.name}</td>
                <td className='py-4 text-slate-300'>{route.corridor}</td>
                <td className='py-4'>{route.occupancy}%</td>
                <td className='py-4'><Badge tone={route.delayRisk === 'high' ? 'danger' : route.delayRisk === 'medium' ? 'warning' : 'success'}>{route.delayRisk}</Badge></td>
                <td className='py-4 text-slate-300'>{route.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
