'use client';
import { useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { RoutesTable } from '@/components/dashboard/routes-table';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { Card, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/section-heading';
import { Skeleton, SkeletonStats } from '@/components/ui/skeleton';
import { TripPlanner } from '@/components/dashboard/trip-planner';

export default function DashboardPage() {
  const { token, t, user } = useApp();
  const [data, setData] = useState<any>(null);
  const [smartRecommendation, setSmartRecommendation] = useState<any>(null);

  useEffect(() => {
    if (token) {
      apiClient.getDashboard(token).then(setData);
      apiClient
        .getSmartRecommendation(token, { preferredTransport: user?.preferredTransport ?? 'metro', role: user?.role, panel: user?.role === 'user' ? 'user-trip' : 'ops' })
        .then(setSmartRecommendation)
        .catch(() => undefined);
    }
  }, [token, user]);

  const trendData = useMemo(
    () => data?.routes?.map((route: any, index: number) => ({ name: route.name, density: route.occupancy, delay: Math.round(route.etaVariance * 10 + index * 3) })) ?? [],
    [data]
  );

  return (
    <ProtectedShell>
      <div className='space-y-8'>
        <PageHeader
          overline='Workspace'
          title={t.dashboard.title}
          description={t.dashboard.subtitle}
          action={<Badge tone='success' withDot>Live</Badge>}
        />

        {!data ? (
          <div className='space-y-6'>
            <SkeletonStats />
            <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
              <Skeleton className='h-80' />
              <Skeleton className='h-80' />
            </div>
            <Skeleton className='h-72' />
          </div>
        ) : (
          <>
            <KpiGrid items={data.stats} />

            <div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'>
              <TrendChart title='Density trend' data={trendData} dataKey='density' />
              <InsightsPanel predictions={data.predictions} aiStatus={data.aiStatus} />
            </div>

            {smartRecommendation ? (
              <Card variant='gradient'>
                <CardHeader
                  overline='Smart recommendation'
                  title='Personalized next best action'
                  description='Generated from current network state, your role and preferred transport.'
                  icon={<Sparkles className='h-5 w-5' />}
                  action={<Badge tone='brand'>AI</Badge>}
                />
                <p className='text-sm leading-6 text-[color:var(--text-soft)]'>{smartRecommendation.recommendation}</p>
                {(smartRecommendation.actions || []).length ? (
                  <div className='mt-5 flex flex-wrap gap-2'>
                    {(smartRecommendation.actions || []).map((item: string) => (
                      <span key={item} className='chip chip-neutral'>{item}</span>
                    ))}
                  </div>
                ) : null}
              </Card>
            ) : null}

            {user?.role === 'user' ? <TripPlanner routes={data.routes} /> : null}

            <RoutesTable routes={data.routes} />
          </>
        )}
      </div>
    </ProtectedShell>
  );
}
