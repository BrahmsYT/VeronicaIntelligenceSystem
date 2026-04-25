'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BellRing, LayoutDashboard, LogOut, Route, ShieldCheck, Sparkles } from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';

const userLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/routes', label: 'Routes', icon: Route },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Sparkles }
];

const adminLinks = [
  { href: '/admin', label: 'Admin', icon: ShieldCheck },
  { href: '/admin/routes', label: 'Manage Routes', icon: Route },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/alerts', label: 'Alerts', icon: BellRing }
];

export function Sidebar({ admin = false }: { admin?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setAuth } = useApp();
  const links = admin ? adminLinks : userLinks;

  return (
    <aside className='glass hidden min-h-[calc(100vh-2rem)] w-72 flex-col rounded-3xl p-4 lg:flex'>
      <div className='mb-6 rounded-3xl border border-white/10 bg-white/5 p-4'>
        <p className='text-xs uppercase tracking-[0.3em] text-slate-400'>Signed in as</p>
        <h3 className='mt-2 text-lg font-semibold'>{[user?.name, user?.surname].filter(Boolean).join(' ')}</h3>
        <p className='text-sm text-slate-400'>{user?.role}</p>
      </div>
      <nav className='space-y-2'>
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${active ? 'bg-brand-600 text-white shadow-glow' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <Icon className='h-4 w-4' />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <button
        className='mt-auto flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-300 hover:bg-white/5 hover:text-white'
        onClick={() => {
          setAuth(null);
          router.push('/login');
        }}
      >
        <LogOut className='h-4 w-4' /> Logout
      </button>
    </aside>
  );
}
