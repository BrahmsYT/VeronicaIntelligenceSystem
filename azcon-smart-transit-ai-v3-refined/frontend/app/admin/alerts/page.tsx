'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';

export default function AdminAlertsPage() {
  const { token } = useApp();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getAdminAnalytics(token).then(setData);
  }, [token]);

  return (
    <ProtectedShell admin>
      <Card>
        <h2 className='text-2xl font-semibold'>Operational alerts</h2>
        <div className='mt-6 space-y-4'>
          {data?.alerts?.map((alert: any) => (
            <div key={alert.id} className='rounded-2xl border border-white/10 bg-white/5 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <h3 className='font-medium'>{alert.title}</h3>
                <Badge tone={alert.severity === 'high' ? 'danger' : alert.severity === 'medium' ? 'warning' : 'success'}>{alert.severity}</Badge>
              </div>
              <p className='mt-3 text-slate-300'>{alert.message}</p>
            </div>
          ))}
        </div>
      </Card>
    </ProtectedShell>
  );
}
