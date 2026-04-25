'use client';
import { useEffect, useMemo, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { RoutesTable } from '@/components/dashboard/routes-table';
import { InsightsPanel } from '@/components/dashboard/insights-panel';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
export default function DashboardPage() {
  const { token, t } = useApp();
  const [data, setData] = useState<any>(null);
  useEffect(() => { if (token) apiClient.getDashboard(token).then(setData); }, [token]);
  const trendData = useMemo(() => data?.routes?.map((route: any, index: number) => ({ name: route.name, density: route.occupancy, delay: Math.round(route.etaVariance * 10 + index * 3) })) ?? [], [data]);
  return <ProtectedShell><div className='space-y-6'><div><h1 className='text-3xl font-semibold'>{t.dashboard.title}</h1><p className='mt-2 text-slate-400'>{t.dashboard.subtitle}</p></div>{!data ? <div className='grid gap-4 md:grid-cols-3'>{Array.from({ length: 3 }).map((_, i) => <div key={i} className='glass h-32 animate-pulse rounded-3xl' />)}</div> : <><KpiGrid items={data.stats} /><div className='grid gap-6 xl:grid-cols-[1.2fr_0.8fr]'><TrendChart title='Density trend' data={trendData} dataKey='density' /><InsightsPanel predictions={data.predictions} /></div><RoutesTable routes={data.routes} /></>}</div></ProtectedShell>;
}
