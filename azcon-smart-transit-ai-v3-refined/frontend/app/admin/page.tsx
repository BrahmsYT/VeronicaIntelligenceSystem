'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { KpiGrid } from '@/components/dashboard/kpi-grid';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export default function AdminPage() {
  const { token } = useApp();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminAnalytics(token).then(setData);
  }, [token]);

  const chartData = data?.routes?.map((route: any) => ({ name: route.name, risk: route.delayRisk === 'high' ? 80 : route.delayRisk === 'medium' ? 50 : 20 })) ?? [];

  return (
    <ProtectedShell admin>
      <div className='space-y-6'>
        <KpiGrid items={data?.kpis?.map((k: any) => ({ label: k.label, value: k.value, change: k.helper })) ?? []} />
        <TrendChart title='Delay risk landscape' data={chartData} dataKey='risk' />
      </div>
    </ProtectedShell>
  );
}
