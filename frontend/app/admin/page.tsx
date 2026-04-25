'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { TeamManager } from '@/components/admin/team-manager';
import { SiteSettingsManager } from '@/components/admin/site-settings-manager';
import { Badge } from '@/components/ui/badge';
import { PageHeader, SectionHeading } from '@/components/ui/section-heading';
import { Skeleton, SkeletonStats } from '@/components/ui/skeleton';

export default function AdminPage() {
  const { token } = useApp();
  const [data, setData] = useState<any>(null);
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminAnalytics(token).then(setData);
    apiClient.getSiteSettings(token).then(setSiteSettings).catch(() => undefined);
  }, [token]);

  const chartData = data?.routes?.map((route: any) => ({ name: route.name, risk: route.delayRisk === 'high' ? 80 : route.delayRisk === 'medium' ? 50 : 20 })) ?? [];

  return (
    <ProtectedShell admin>
      <div className='space-y-10'>
        <PageHeader
          overline='Control center'
          title='Admin overview'
          description='Executive view of KPIs, network risk, feature toggles and team management.'
          action={<Badge tone='brand' withDot><ShieldCheck className='h-3 w-3' /> Admin access</Badge>}
        />

        <section className='space-y-5'>
          <SectionHeading overline='Performance' title='Key indicators' description='Auto-refreshed snapshot of the network state.' />
          {!data ? <SkeletonStats /> : <KpiGrid items={data.kpis?.map((k: any) => ({ label: k.label, value: k.value, change: k.helper })) ?? []} />}
        </section>

        <section className='space-y-5'>
          <SectionHeading overline='Risk landscape' title='Delay risk by route' description='Higher score → operator attention required.' />
          {!data ? <Skeleton className='h-80' /> : <TrendChart title='Delay risk landscape' data={chartData} dataKey='risk' />}
        </section>

        <section className='space-y-5'>
          <SectionHeading overline='Configuration' title='Site feature toggles' description='Enterprise feature flags. Effective immediately across surfaces.' />
          <SiteSettingsManager initialSettings={siteSettings} />
        </section>

        <section className='space-y-5'>
          <SectionHeading overline='People' title='Team spotlight' description='CRUD-managed team members surfaced on the public landing.' />
          <TeamManager team={data?.team ?? []} />
        </section>
      </div>
    </ProtectedShell>
  );
}
