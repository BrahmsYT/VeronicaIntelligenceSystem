'use client';

import Link from 'next/link';
import { Globe2, TrainFront } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useApp } from '@/components/providers/app-provider';

export function TopNav() {
  const { locale, setLocale, t } = useApp();

  return (
    <header className='sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl'>
      <div className='page-shell flex h-16 items-center justify-between'>
        <Link href='/' className='flex items-center gap-3 font-semibold'>
          <div className='rounded-2xl border border-white/10 bg-white/5 p-2'><TrainFront className='h-5 w-5 text-sky-300' /></div>
          <span>{t.brand}</span>
        </Link>
        <div className='flex items-center gap-3'>
          <div className='hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm md:flex'>
            <Globe2 className='h-4 w-4 text-slate-300' />
            <select value={locale} onChange={(e) => setLocale(e.target.value as typeof locale)} className='bg-transparent outline-none'>
              <option value='az' className='bg-slate-900'>AZ</option>
              <option value='en' className='bg-slate-900'>EN</option>
              <option value='tr' className='bg-slate-900'>TR</option>
            </select>
          </div>
          <Link href='/login'><Button className='bg-white/10 shadow-none'>{t.nav.login}</Button></Link>
          <Link href='/register'><Button>{t.nav.register}</Button></Link>
        </div>
      </div>
    </header>
  );
}
