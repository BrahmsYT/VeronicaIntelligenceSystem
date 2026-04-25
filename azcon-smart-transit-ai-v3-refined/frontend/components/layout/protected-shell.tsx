'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { useApp } from '@/components/providers/app-provider';

export function ProtectedShell({ children, admin = false }: { children: React.ReactNode; admin?: boolean }) {
  const { user, isHydrated } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) router.push('/login');
    if (admin && user?.role !== 'admin') router.push('/dashboard');
  }, [admin, user, isHydrated, router]);

  if (!isHydrated || !user || (admin && user.role !== 'admin')) {
    return <div className='page-shell py-16 text-slate-300'>Loading secure workspace...</div>;
  }

  return (
    <div className='page-shell grid gap-6 py-6 lg:grid-cols-[288px_1fr]'>
      <Sidebar admin={admin} />
      <main>{children}</main>
    </div>
  );
}
