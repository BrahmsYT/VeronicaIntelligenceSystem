'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BarChart3, BellRing, Cpu, LayoutDashboard, LogOut, Palette, Route, ShieldCheck, Sparkles, TrainFront } from 'lucide-react';
import { useApp } from '@/components/providers/app-provider';
import { cn } from '@/lib/utils';

const userLinks = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, group: 'Workspace' },
  { href: '/dashboard/routes', label: 'Routes', icon: Route, group: 'Workspace' },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Sparkles, group: 'Intelligence' }
];

const adminLinks = [
  { href: '/admin', label: 'Control Center', icon: ShieldCheck, group: 'Admin' },
  { href: '/admin/routes', label: 'Manage Routes', icon: Route, group: 'Admin' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, group: 'Insights' },
  { href: '/admin/alerts', label: 'Alerts', icon: BellRing, group: 'Insights' }
];

const staffLinks = [
  { href: '/staff', label: 'AI Operations', icon: Cpu, group: 'Operations' },
  { href: '/dashboard/routes', label: 'Live Routes', icon: Route, group: 'Operations' },
  { href: '/dashboard/recommendations', label: 'Recommendations', icon: Sparkles, group: 'Intelligence' }
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setAuth, theme, setTheme, themes } = useApp();
  const links = user?.role === 'admin' ? adminLinks : user?.role === 'staff' ? staffLinks : userLinks;
  const initials = [user?.name?.[0], user?.surname?.[0]].filter(Boolean).join('').toUpperCase() || 'AZ';
  const roleLabel = user?.role === 'admin' ? 'Developer / Admin' : user?.role === 'staff' ? 'Staff Operator' : 'Passenger';

  // Group nav by section
  const grouped = links.reduce<Record<string, typeof links>>((acc, item) => {
    (acc[item.group] = acc[item.group] || []).push(item);
    return acc;
  }, {});

  return (
    <aside className='hidden w-72 self-start flex-col gap-5 lg:sticky lg:top-6 lg:flex'>
      {/* Brand block */}
      <Link href='/' className='flex items-center gap-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-4 py-3'>
        <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[var(--surface-2)]'>
          <TrainFront className='h-4 w-4 text-[color:var(--brand-secondary)]' />
        </span>
        <div className='leading-tight'>
          <p className='text-sm font-semibold tracking-tight'>AZCON</p>
          <p className='text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]'>Smart Transit</p>
        </div>
      </Link>

      {/* User card */}
      <div className='rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4'>
        <p className='text-overline'>Signed in</p>
        <div className='mt-3 flex items-center gap-3'>
          <span className='flex h-10 w-10 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-sm font-semibold text-white'>
            {initials}
          </span>
          <div className='min-w-0 leading-tight'>
            <p className='truncate text-sm font-semibold'>{[user?.name, user?.surname].filter(Boolean).join(' ') || 'AZCON User'}</p>
            <p className='truncate text-xs text-[color:var(--muted)]'>{roleLabel}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className='space-y-5'>
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className='space-y-1.5'>
            <p className='px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[color:var(--text-faint)]'>{group}</p>
            {items.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    active
                      ? 'bg-[var(--surface-2)] text-[color:var(--text)]'
                      : 'text-[color:var(--text-soft)] hover:bg-[var(--surface)] hover:text-[color:var(--text)]'
                  )}
                >
                  {active && (
                    <span className='absolute inset-y-1.5 left-0 w-[3px] rounded-full bg-[linear-gradient(180deg,var(--brand-from),var(--brand-to))]' />
                  )}
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-[color:var(--brand-secondary)]' : '')} />
                  <span className='truncate'>{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Theme switcher */}
      <div className='rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-3'>
        <div className='mb-2 flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--text-faint)]'>
          <Palette className='h-3.5 w-3.5' /> Theme
        </div>
        <div className='grid grid-cols-5 gap-1.5'>
          {themes.map((item) => (
            <button
              key={item}
              onClick={() => setTheme(item)}
              title={item}
              className={cn(
                'flex h-8 items-center justify-center rounded-md text-[10px] capitalize transition-colors',
                item === theme
                  ? 'bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] text-white'
                  : 'border border-[color:var(--border)] text-[color:var(--text-soft)] hover:bg-[var(--surface-2)]'
              )}
            >
              {item.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        className='flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[color:var(--text-soft)] transition-colors hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]'
        onClick={() => { setAuth(null); router.push('/login'); }}
      >
        <LogOut className='h-4 w-4' /> Sign out
      </button>
    </aside>
  );
}
