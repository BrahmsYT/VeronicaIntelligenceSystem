'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';
import { TransportSelectorScene } from '@/components/three/transport-selector-scene';
import { TransportType } from '@/lib/types';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { setAuth, locale, t } = useApp();
  const [transportType, setTransportType] = useState<TransportType>('bus');
  const [form, setForm] = useState({ name: '', surname: '', email: '', password: '', role: 'user' as 'admin' | 'user' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result =
        mode === 'login'
          ? await apiClient.login({ email: form.email, password: form.password })
          : await apiClient.register({ name: form.name, surname: form.surname, email: form.email, password: form.password, role: form.role, preferredLanguage: locale });
      setAuth(result);
      router.push(result.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto grid w-full gap-6 ${mode === 'register' ? 'max-w-[1100px] lg:grid-cols-[0.95fr_1.05fr]' : 'max-w-[460px]'}`}>
      <Card className='p-8'>
        <h1 className='text-3xl font-semibold'>{mode === 'login' ? t.auth.loginTitle : t.auth.registerTitle}</h1>
        <p className='mt-2 text-sm text-slate-400'>{t.auth.welcome}</p>
        <form className='mt-8 space-y-4' onSubmit={onSubmit}>
          {mode === 'register' && (
            <div className='grid gap-4 md:grid-cols-2'>
              <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='First name' value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='Surname' value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} />
            </div>
          )}
          <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='Email address' type='email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className='w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none' placeholder='Password' type='password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {mode === 'register' && (
            <div className='grid gap-4 md:grid-cols-2'>
              <select className='w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none' value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as 'admin' | 'user' })}>
                <option value='user'>Standard user</option>
                <option value='admin'>Admin</option>
              </select>
              <select className='w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 outline-none' value={transportType} onChange={(e) => setTransportType(e.target.value as TransportType)}>
                <option value='bus'>Bus</option>
                <option value='metro'>Metro</option>
                <option value='taxi'>Taxi</option>
                <option value='rail'>Rail</option>
              </select>
            </div>
          )}
          {error ? <p className='text-sm text-rose-300'>{error}</p> : null}
          <Button className='w-full' disabled={loading}>{loading ? 'Processing...' : mode === 'login' ? 'Login' : 'Register'}</Button>
        </form>
      </Card>
      {mode === 'register' && (
        <Card className='overflow-hidden p-4'>
          <div className='mb-4 px-2'>
            <p className='text-sm uppercase tracking-[0.3em] text-sky-300'>Transport preview</p>
            <h2 className='mt-2 text-2xl font-semibold capitalize'>{transportType} selection</h2>
            <p className='mt-2 text-sm text-slate-400'>3D model saxlanıldı, amma əvvəlki versiyanın səliqəli frontend stilinə qaytarıldı.</p>
          </div>
          <TransportSelectorScene type={transportType} />
        </Card>
      )}
    </div>
  );
}
