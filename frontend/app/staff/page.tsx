'use client';

import { useEffect, useState } from 'react';
import { Cpu, AlertTriangle, ShieldCheck, Wrench } from 'lucide-react';
import { ProtectedShell } from '@/components/layout/protected-shell';
import { useApp } from '@/components/providers/app-provider';
import { apiClient } from '@/services/api-client';
import { AiOpsPanel } from '@/components/staff/ai-ops-panel';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/section-heading';
import { Skeleton } from '@/components/ui/skeleton';

export default function StaffPage() {
  const { token } = useApp();
  const [data, setData] = useState<{ routes: any[]; alerts: any[]; siteSettings: any } | null>(null);

  useEffect(() => {
    if (!token) return;
    apiClient.getStaffAiOverview(token).then(setData).catch(() => undefined);
  }, [token]);

  const aiOn = data?.siteSettings?.aiDispatchEnabled;
  const maint = data?.siteSettings?.maintenanceMode;
  const crowded = (data?.routes ?? []).filter((r: any) => r.occupancy >= 80).length;
  const alertCount = data?.alerts?.length ?? 0;
  const loading = !data;

  return (
    <ProtectedShell allowedRoles={['admin', 'staff']}>
      <div className='space-y-8'>
        <PageHeader
          overline='Operations command'
          title='Staff AI Operations'
          description='Monitor crowding, triage alerts and generate live deployment actions.'
          action={
            <div className='flex flex-wrap gap-2'>
              <Badge tone={aiOn ? 'success' : 'neutral'} withDot>AI dispatch {aiOn ? 'on' : 'off'}</Badge>
              <Badge tone={maint ? 'warning' : 'neutral'} withDot>Maintenance {maint ? 'on' : 'off'}</Badge>
            </div>
          }
        />

        {loading ? (
          <>
            <div className='grid gap-4 md:grid-cols-4'>
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className='h-[94px]' />
              ))}
            </div>
            <Skeleton className='h-[430px]' />
          </>
        ) : (
          <>
            <div className='grid gap-4 md:grid-cols-4'>
              {[
                { label: 'Crowded routes', value: crowded, accent: crowded > 0 ? 'var(--warning)' : 'var(--success)', icon: <AlertTriangle className='h-4 w-4' /> },
                { label: 'Active alerts', value: alertCount, accent: alertCount > 0 ? 'var(--danger)' : 'var(--success)', icon: <AlertTriangle className='h-4 w-4' /> },
                { label: 'Monitored routes', value: data?.routes?.length ?? '—', accent: 'var(--brand-secondary)', icon: <Cpu className='h-4 w-4' /> },
                { label: 'System health', value: maint ? 'Maintenance' : 'Operational', accent: maint ? 'var(--warning)' : 'var(--success)', icon: maint ? <Wrench className='h-4 w-4' /> : <ShieldCheck className='h-4 w-4' /> }
              ].map((s) => (
                <div key={s.label} className='relative overflow-hidden rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
                  <span className='absolute left-0 top-3 bottom-3 w-[3px] rounded-full' style={{ background: s.accent }} />
                  <div className='flex items-center justify-between'>
                    <p className='text-overline'>{s.label}</p>
                    <span className='text-[color:var(--muted)]'>{s.icon}</span>
                  </div>
                  <p className='numeric mt-2 text-2xl font-semibold tracking-tight'>{s.value}</p>
                </div>
              ))}
            </div>

            <AiOpsPanel routes={data?.routes ?? []} alerts={data?.alerts ?? []} />
          </>
        )}
      </div>
    </ProtectedShell>
  );
}
