'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { Card } from '@/components/ui/card';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export default function AdminAnalyticsPage() {
  const { token } = useApp();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminAnalytics(token).then(setData);
  }, [token]);

  return (
    <ProtectedShell admin>
      <div className='grid gap-6 md:grid-cols-3'>
        {data?.kpis?.map((kpi: any) => (
          <Card key={kpi.label}>
            <p className='text-sm text-slate-400'>{kpi.label}</p>
            <h3 className='mt-3 text-3xl font-semibold'>{kpi.value}</h3>
            <p className='mt-2 text-sm text-slate-300'>{kpi.helper}</p>
          </Card>
        ))}
      </div>
    </ProtectedShell>
  );
}
