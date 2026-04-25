'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BellRing, Cpu, LayoutDashboard, LogOut, Palette, Route, ShieldCheck, Sparkles, Users } from 'lucide-react';
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

const staffLinks = [
  { href: '/staff', label: 'AI Operations', icon: Cpu },
  { href: '/dashboard/routes', label: 'Live Routes', icon: Route },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Sparkles }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setAuth, theme, setTheme, themes } = useApp();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : userLinks;

  return (
    <aside className='glass hidden min-h-[calc(100vh-2rem)] w-72 flex-col rounded-3xl p-4 lg:flex'>
      <div className='mb-6 rounded-3xl p-4 panel-strong' style={{ border: '1px solid var(--border)' }}>
        <p className='text-xs uppercase tracking-[0.3em] soft-text'>Signed in as</p>
        <h3 className='mt-2 text-lg font-semibold'>{[user?.name, user?.surname].filter(Boolean).join(' ')}</h3>
        <p className='text-sm soft-text capitalize'>{user?.role === 'admin' ? 'Developer/Admin' : user?.role}</p>
      </div>
      <nav className='space-y-2'>
        {links.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${active ? 'text-white shadow-lg' : 'hover:translate-x-1 soft-text hover:text-[var(--text)]'}`} style={active ? { background: 'linear-gradient(90deg,var(--brand-from),var(--brand-to))' } : {}}>
              <Icon className='h-4 w-4' />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className='mt-6 rounded-3xl p-4 panel-strong' style={{ border: '1px solid var(--border)' }}>
        <div className='mb-3 flex items-center gap-2 text-sm'><Palette className='h-4 w-4' /> Change mode</div>
        <div className='grid grid-cols-2 gap-2'>
          {themes.map((item) => (
            <button key={item} onClick={() => setTheme(item)} className='rounded-xl px-2 py-2 text-xs capitalize' style={item === theme ? { border: '1px solid var(--brand-to)', background: 'var(--panel)' } : { border: '1px solid var(--border)' }}>
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className='mt-6 rounded-3xl p-4 panel-strong' style={{ border: '1px solid var(--border)' }}>
        <div className='flex items-center gap-2 text-sm'><Users className='h-4 w-4' /> Team-ready admin workspace</div>
        <p className='mt-2 text-xs soft-text'>Routes, alerts, team cards, db.json CRUD and OpenRouter-ready AI live in the same MVP foundation.</p>
      </div>
      <button className='mt-auto flex items-center gap-3 rounded-2xl px-4 py-3 text-sm soft-text hover:text-[var(--text)]' style={{ border: '1px solid var(--border)' }} onClick={() => { setAuth(null); router.push('/login'); }}>
        <LogOut className='h-4 w-4' /> Logout
      </button>
    </aside>
  );
}
