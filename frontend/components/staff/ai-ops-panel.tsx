'use client';

import { useMemo, useState } from 'react';
import { Cpu, Rocket, Sparkles } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
        <CardHeader
          overline='Dispatch center'
          title='Staff AI dispatch'
          description='Analyze crowding and deploy extra fleet intelligently.'
          icon={<Cpu className='h-5 w-5' />}
        />

        <div className='space-y-3'>
          <label className='block space-y-1.5'>
            <span className='text-xs font-semibold text-[color:var(--text-soft)]'>Target route</span>
            <select className='input-base' value={routeId} onChange={(e: any) => setRouteId(e.target.value)}>
              {routes.map((route) => <option key={route.id} value={route.id}>{route.name} — {route.occupancy}% occ.</option>)}
            </select>
          </label>
          <div className='grid gap-3 md:grid-cols-2'>
            <label className='block space-y-1.5'>
              <span className='text-xs font-semibold text-[color:var(--text-soft)]'>Target occupancy %</span>
              <input type='number' className='input-base' value={targetOccupancy} onChange={(e: any) => setTargetOccupancy(Number(e.target.value))} placeholder='e.g. 72' />
            </label>
            <label className='block space-y-1.5'>
              <span className='text-xs font-semibold text-[color:var(--text-soft)]'>Additional demand %</span>
              <input type='number' className='input-base' value={additionalDemandPercent} onChange={(e: any) => setAdditionalDemandPercent(Number(e.target.value))} placeholder='e.g. 10' />
            </label>
          </div>
          <Button onClick={buildPlan} loading={loading} leftIcon={<Sparkles className='h-4 w-4' />} className='w-full'>Analyze & suggest deployment</Button>
          {error ? (
            <div className='flex items-start gap-2 rounded-md border border-[color:color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[color:#fda4af]'>
              <span>{error}</span>
            </div>
          ) : null}
        </div>
      </Card>

      <Card>
        <CardHeader
          overline='AI output'
          title='Recommended deployment'
          description='Run analysis to receive an actionable deployment plan.'
          icon={<Sparkles className='h-5 w-5' />}
          action={plan ? <Badge tone={plan.projectedOccupancy > plan.targetOccupancy ? 'warning' : 'success'} withDot>{plan.projectedOccupancy > plan.targetOccupancy ? 'Action needed' : 'On target'}</Badge> : null}
        />
        {!plan ? (
          <div className='rounded-xl border border-dashed border-[color:var(--border-strong)] bg-[var(--surface)] p-6 text-center'>
            <p className='text-sm text-[color:var(--text-soft)]'>Run analysis to get a deployment plan (example: <span className='text-[color:var(--text)] font-medium'>"buraya 3 bus deploy et"</span>).</p>
          </div>
        ) : (
          <div className='space-y-4'>
            <div className='grid gap-3 sm:grid-cols-3'>
              {[
                { label: 'Route', value: plan.routeName },
                { label: 'Projected', value: `${plan.projectedOccupancy}%` },
                { label: 'Target', value: `${plan.targetOccupancy}%` }
              ].map((s) => (
                <div key={s.label} className='rounded-md border border-[color:var(--border)] bg-[var(--bg-alt)]/40 px-3 py-2'>
                  <p className='text-[10px] uppercase tracking-[0.16em] text-[color:var(--muted)]'>{s.label}</p>
                  <p className='numeric mt-1 truncate text-sm font-semibold'>{s.value}</p>
                </div>
              ))}
            </div>

            <div className='relative overflow-hidden rounded-xl border p-4' style={{ borderColor: 'color-mix(in srgb, var(--success) 35%, transparent)', background: 'var(--success-soft)' }}>
              <div className='flex items-center gap-2'>
                <Rocket className='h-4 w-4 text-[color:var(--success)]' />
                <p className='text-overline' style={{ color: '#6ee7b7' }}>Suggested action</p>
              </div>
              <p className='mt-2 text-lg font-semibold'>{plan.action}</p>
              <p className='mt-1 text-xs text-[color:var(--text-soft)]'>Estimated easing time: <span className='font-semibold text-[color:var(--text)]'>{plan.estimatedMinutesToEase} min</span></p>
            </div>

            <p className='text-sm leading-6 text-[color:var(--text-soft)]'>{plan.rationale}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
