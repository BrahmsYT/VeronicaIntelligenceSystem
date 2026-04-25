'use client';

import Link from 'next/link';
import { Globe2, Palette, TrainFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/providers/app-provider';

export function TopNav() {
  const { locale, setLocale, theme, setTheme, themes, t } = useApp();

  return (
    <header className='sticky top-0 z-30 border-b' style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--bg) 72%, transparent)' }}>
      <div className='page-shell flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center gap-3 font-semibold'>
          <div className='rounded-2xl border p-2 glass'><TrainFront className='h-5 w-5' style={{ color: 'var(--brand-to)' }} /></div>
          <span>{t.brand}</span>
        </Link>
        <div className='flex items-center gap-3'>
          <div className='hidden items-center gap-2 rounded-2xl px-3 py-2 text-sm glass md:flex'>
            <Globe2 className='h-4 w-4 soft-text' />
            <select value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className='bg-transparent outline-none'>
              <option value='az'>AZ</option>
              <option value='en'>EN</option>
              <option value='tr'>TR</option>
            </select>
          </div>
          <div className='hidden items-center gap-2 rounded-2xl px-3 py-2 text-sm glass lg:flex'>
            <Palette className='h-4 w-4 soft-text' />
            <select value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)} className='bg-transparent capitalize outline-none'>
              {themes.map((item) => <option key={item} value={item} className='capitalize'>{item}</option>)}
            </select>
          </div>
          <Link href='/login'><Button className='bg-white/10 shadow-none'>{t.nav.login}</Button></Link>
          <Link href='/register'><Button>{t.nav.register}</Button></Link>
        </div>
      </div>
    </header>
  );
}
