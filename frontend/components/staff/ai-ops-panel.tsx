'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertItem, DeploymentPlan, StaffRouteOps } from '@/lib/types';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export function AiOpsPanel({ routes, alerts }: { routes: StaffRouteOps[]; alerts: AlertItem[] }) {
  const { token } = useApp();
  const [routeId, setRouteId] = useState(routes[0]?.id ?? '');
  const [targetOccupancy, setTargetOccupancy] = useState(72);
  const [additionalDemandPercent, setAdditionalDemandPercent] = useState(0);
  const [plan, setPlan] = useState<DeploymentPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const crowdedCount = useMemo(() => routes.filter((route) => route.occupancy >= 80).length, [routes]);

  const buildPlan = async () => {
    if (!token || !routeId) return;
    setLoading(true);
    setError('');
    try {
      const response = await apiClient.getDeploymentPlan(token, { routeId, additionalDemandPercent, targetOccupancy });
      setPlan(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to build plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='grid gap-6 xl:grid-cols-[1fr_1fr]'>
      <Card>
        <h3 className='text-xl font-semibold'>Staff AI dispatch center</h3>
        <p className='mt-2 text-sm soft-text'>Analyze crowding and deploy extra fleet intelligently.</p>
        <div className='mt-4 grid gap-3 md:grid-cols-3'>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>High occupancy routes</p>
            <p className='mt-1 text-2xl font-semibold'>{crowdedCount}</p>
          </div>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>Active alerts</p>
            <p className='mt-1 text-2xl font-semibold'>{alerts.length}</p>
          </div>
          <div className='rounded-2xl p-4' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            <p className='text-xs soft-text'>Monitored routes</p>
            <p className='mt-1 text-2xl font-semibold'>{routes.length}</p>
          </div>
        </div>

        <div className='mt-5 space-y-3'>
          <select className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={routeId} onChange={(e: any) => setRouteId(e.target.value)}>
            {routes.map((route) => <option key={route.id} value={route.id}>{route.name} ({route.occupancy}% occ.)</option>)}
          </select>
          <div className='grid gap-3 md:grid-cols-2'>
            <input type='number' className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={targetOccupancy} onChange={(e: any) => setTargetOccupancy(Number(e.target.value))} placeholder='Target occupancy %' />
            <input type='number' className='w-full rounded-2xl px-4 py-3 outline-none' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }} value={additionalDemandPercent} onChange={(e: any) => setAdditionalDemandPercent(Number(e.target.value))} placeholder='Additional demand %' />
          </div>
          <Button onClick={buildPlan} disabled={loading}>{loading ? 'Analyzing...' : 'Analyze & suggest deployment'}</Button>
          {error ? <p className='text-sm text-rose-300'>{error}</p> : null}
        </div>
      </Card>

      <Card>
        <h3 className='text-xl font-semibold'>AI recommendation output</h3>
        {!plan ? <p className='mt-4 text-sm soft-text'>Run analysis to get a deployment plan (example: "buraya 3 bus deploy et").</p> : (
          <div className='mt-4 space-y-3'>
            <p className='text-sm soft-text'>Route: <span className='font-medium text-white'>{plan.routeName}</span></p>
            <p className='text-sm soft-text'>Projected occupancy: <span className='font-medium text-white'>{plan.projectedOccupancy}%</span></p>
            <p className='text-sm soft-text'>Target occupancy: <span className='font-medium text-white'>{plan.targetOccupancy}%</span></p>
            <div className='rounded-2xl p-4' style={{ border: '1px solid rgba(16,185,129,.35)', background: 'rgba(16,185,129,.08)' }}>
              <p className='text-xs uppercase tracking-[0.2em] text-emerald-300'>Suggested action</p>
              <p className='mt-2 text-lg font-semibold'>{plan.action}</p>
              <p className='mt-1 text-sm soft-text'>Estimated easing time: {plan.estimatedMinutesToEase} min</p>
            </div>
            <p className='text-sm soft-text'>{plan.rationale}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
