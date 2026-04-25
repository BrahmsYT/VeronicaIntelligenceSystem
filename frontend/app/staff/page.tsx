'use client';

import { useEffect, useState } from 'react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { AiOpsPanel } from '@/components/staff/ai-ops-panel';
import { Card } from '@/components/ui/card';

export default function StaffPage() {
  const { token } = useApp();
  const [data, setData] = useState<{ routes: any[]; alerts: any[]; siteSettings: any } | null>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getStaffAiOverview(token).then(setData).catch(() => undefined);
  }, [token]);

  return (
    <ProtectedShell allowedRoles={['admin', 'staff']}>
      <div className='space-y-6'>
        <div>
          <h1 className='text-3xl font-semibold'>Staff AI Operations</h1>
          <p className='mt-2 soft-text'>Monitor crowding and generate live deployment actions.</p>
        </div>

        {data?.siteSettings ? (
          <Card>
            <h3 className='text-lg font-semibold'>System mode</h3>
            <p className='mt-2 text-sm soft-text'>AI dispatch: {data.siteSettings.aiDispatchEnabled ? 'Enabled' : 'Disabled'} · Maintenance: {data.siteSettings.maintenanceMode ? 'On' : 'Off'}</p>
          </Card>
        ) : null}

        <AiOpsPanel routes={data?.routes ?? []} alerts={data?.alerts ?? []} />
      </div>
    </ProtectedShell>
  );
}
