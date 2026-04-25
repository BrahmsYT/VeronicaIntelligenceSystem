'use client';

import Link from 'next/link';
import { Globe2, Palette, TrainFront, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/providers/app-provider';

export function TopNav() {
  const { locale, setLocale, theme, setTheme, themes, t } = useApp();

  return (
    <header
      className='sticky top-0 z-30 border-b border-[color:var(--border)] backdrop-blur-xl'
      style={{ background: 'color-mix(in srgb, var(--bg) 78%, transparent)' }}
    >
      <div className='page-shell flex h-16 items-center justify-between gap-6'>
        <Link href='/' className='group flex items-center gap-3'>
          <span className='relative flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[var(--surface-2)] shadow-soft'>
            <TrainFront className='h-4 w-4 text-[color:var(--brand-secondary)]' />
            <span className='pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/5' />
          </span>
          <div className='leading-tight'>
            <span className='text-sm font-semibold tracking-tight'>{t.brand}</span>
            <span className='block text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]'>Smart Transit AI</span>
          </div>
        </Link>

        <nav className='hidden items-center gap-1 md:flex'>
          {[
            { href: '/#platform', label: 'Platform' },
            { href: '/#features', label: 'Features' },
            { href: '/#team', label: 'Team' },
            { href: '/dashboard', label: 'Dashboard' }
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='rounded-md px-3 py-2 text-sm text-[color:var(--text-soft)] transition-colors hover:bg-[var(--surface)] hover:text-[color:var(--text)]'
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className='flex items-center gap-2'>
          <div className='hidden items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs sm:flex'>
            <Globe2 className='h-3.5 w-3.5 text-[color:var(--muted)]' />
            <select value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className='bg-transparent outline-none'>
              <option value='az'>AZ</option>
              <option value='en'>EN</option>
              <option value='tr'>TR</option>
            </select>
          </div>
          <div className='hidden items-center gap-1.5 rounded-md border border-[color:var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs lg:flex'>
            <Palette className='h-3.5 w-3.5 text-[color:var(--muted)]' />
            <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className='bg-transparent capitalize outline-none'>
              {themes.map((item) => <option key={item} value={item} className='capitalize'>{item}</option>)}
            </select>
          </div>
          <Link href='/login'><Button variant='ghost' size='sm'>{t.nav.login}</Button></Link>
          <Link href='/register'><Button size='sm' rightIcon={<ArrowRight className='h-3.5 w-3.5' />}>{t.nav.register}</Button></Link>
        </div>
      </div>
    </header>
  );
}
