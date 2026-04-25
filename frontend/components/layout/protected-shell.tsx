'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useApp } from '@/components/providers/app-provider';
import { Role } from '@/lib/types';

export function ProtectedShell({ children, admin = false, allowedRoles }: { children: React.ReactNode; admin?: boolean; allowedRoles?: Role[] }) {
  const { user, isHydrated } = useApp();
  const router = useRouter();
  const roles = admin ? (['admin'] as Role[]) : (allowedRoles ?? ['admin', 'staff', 'user']);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.push('/login');
    if (user && !roles.includes(user.role)) {
      if (user.role === 'admin') router.push('/admin');
      else if (user.role === 'staff') router.push('/staff');
      else router.push('/dashboard');
    }
  }, [admin, user, isHydrated, router, roles]);

  if (!isHydrated || !user || !roles.includes(user.role)) {
    return (
      <div className='page-shell py-16'>
        <div className='mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-8 text-center'>
          <div className='h-2 w-24 overflow-hidden rounded-full bg-[var(--surface-2)]'>
            <div className='h-full w-1/2 animate-pulse rounded-full bg-[linear-gradient(90deg,var(--brand-from),var(--brand-to))]' />
          </div>
          <p className='text-overline'>Authenticating</p>
          <p className='text-sm text-[color:var(--text-soft)]'>Loading secure workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <div className='page-shell grid gap-6 py-6 lg:grid-cols-[288px_1fr]'>
      <Sidebar />
      <main className='min-w-0'>{children}</main>
    </div>
  );
}
