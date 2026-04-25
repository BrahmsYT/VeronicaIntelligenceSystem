'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';
import { TransportSelectorScene } from '@/components/three/transport-selector-scene';
import { ThemePreset, TransportType } from '@/lib/types';

type RegisterRole = 'admin' | 'staff' | 'user';

const inputClassName = 'w-full rounded-2xl px-4 py-3 outline-none transition focus:ring-2 focus:ring-sky-500/30';
const inputStyle = { border: '1px solid var(--border)', background: 'var(--panel)' };

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { setAuth, locale, t } = useApp();

  const isRegister = mode === 'register';
  const [transportType, setTransportType] = useState<TransportType>('bus');
  const [theme, setTheme] = useState<ThemePreset>('dark');
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as RegisterRole
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    if (!form.email.trim()) return 'Email boş ola bilməz.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return 'Email formatı düzgün deyil.';
    if (!form.password.trim()) return 'Şifrə boş ola bilməz.';
    if (form.password.length < 6) return 'Şifrə minimum 6 simvol olmalıdır.';

    if (isRegister) {
      if (!form.name.trim() || !form.surname.trim()) return 'Ad və soyad mütləqdir.';
      if (form.confirmPassword !== form.password) return 'Şifrələr uyğun gəlmir.';
    }

    return '';
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const result =
        !isRegister
          ? await apiClient.login({ email: form.email, password: form.password })
          : await apiClient.register({ name: form.name, surname: form.surname, email: form.email, password: form.password, role: form.role, preferredLanguage: locale, preferredTransport: transportType, theme });
      setAuth(result, { rememberMe: isRegister ? true : rememberMe });
      router.push(result.user.role === 'admin' ? '/admin' : result.user.role === 'staff' ? '/staff' : '/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`mx-auto grid w-full gap-6 ${isRegister ? 'max-w-[1160px] lg:grid-cols-[0.95fr_1.05fr]' : 'max-w-[520px]'}`}>
      <Card className='p-8'>
        <div className='mb-2 flex items-center justify-between'>
          <p className='rounded-full px-3 py-1 text-xs uppercase tracking-[0.2em]' style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
            AZCON Access
          </p>
          <p className='text-xs soft-text'>{isRegister ? 'Create account' : 'Secure login'}</p>
        </div>

        <h1 className='text-3xl font-semibold'>{isRegister ? t.auth.registerTitle : t.auth.loginTitle}</h1>
        <p className='mt-2 text-sm soft-text'>{t.auth.welcome}</p>

        <form className='mt-8 space-y-4' onSubmit={onSubmit}>
          {isRegister && (
            <div className='grid gap-4 md:grid-cols-2'>
              <input className={inputClassName} style={inputStyle} placeholder='First name' value={form.name} onChange={(e: any) => updateForm('name', e.target.value)} />
              <input className={inputClassName} style={inputStyle} placeholder='Surname' value={form.surname} onChange={(e: any) => updateForm('surname', e.target.value)} />
            </div>
          )}

          <input className={inputClassName} style={inputStyle} placeholder='Email address' type='email' autoComplete='email' value={form.email} onChange={(e: any) => updateForm('email', e.target.value)} />

          <div className='space-y-2'>
            <div className='relative'>
              <input
                className={`${inputClassName} pr-24`}
                style={inputStyle}
                placeholder='Password'
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={(e: any) => updateForm('password', e.target.value)}
              />
              <button
                type='button'
                className='absolute right-3 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-xs soft-text hover:text-white'
                style={{ border: '1px solid var(--border)' }}
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <p className='text-xs soft-text'>Minimum 6 simvol istifadə et.</p>
          </div>

          {isRegister && (
            <>
              <input
                className={inputClassName}
                style={inputStyle}
                placeholder='Confirm password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='new-password'
                value={form.confirmPassword}
                onChange={(e: any) => updateForm('confirmPassword', e.target.value)}
              />

              <div className='grid gap-4 md:grid-cols-2'>
                <select className={inputClassName} style={inputStyle} value={form.role} onChange={(e: any) => setForm((prev) => ({ ...prev, role: e.target.value as RegisterRole }))}>
                  <option value='user'>User (Passenger)</option>
                  <option value='staff'>Staff (Operations)</option>
                  <option value='admin'>Admin (Developer)</option>
                </select>

                <select className={inputClassName} style={inputStyle} value={transportType} onChange={(e: any) => setTransportType(e.target.value as TransportType)}>
                  <option value='bus'>Bus</option>
                  <option value='metro'>Metro</option>
                  <option value='taxi'>Taxi</option>
                  <option value='rail'>Rail</option>
                </select>
              </div>

              <select className={`${inputClassName} capitalize`} style={inputStyle} value={theme} onChange={(e: any) => setTheme(e.target.value as ThemePreset)}>
                <option value='light'>Light</option>
                <option value='dark'>Dark</option>
                <option value='ocean'>Ocean</option>
                <option value='neon'>Neon</option>
                <option value='lava'>Lava</option>
              </select>
            </>
          )}

          {error ? <p className='text-sm text-rose-300'>{error}</p> : null}

          {!isRegister ? (
            <label className='flex items-center gap-3 rounded-xl px-3 py-2 text-sm soft-text' style={{ border: '1px solid var(--border)' }}>
              <input type='checkbox' checked={rememberMe} onChange={(e: any) => setRememberMe(Boolean(e.target.checked))} />
              <span>Remember me for 7 days</span>
            </label>
          ) : null}

          <Button className='w-full' disabled={loading}>
            {loading ? 'Processing...' : isRegister ? 'Create account' : 'Login'}
          </Button>

          <div className='rounded-2xl p-3 text-xs soft-text' style={{ border: '1px dashed var(--border)' }}>
            <p className='font-semibold text-white'>Demo credentials</p>
            <p className='mt-1'>User: <span className='text-sky-300'>user@azcon.ai / User123!</span></p>
            <p>Staff: <span className='text-sky-300'>staff@azcon.ai / Staff123!</span></p>
            <p>Admin: <span className='text-sky-300'>admin@azcon.ai / Admin123!</span></p>
          </div>

          <p className='text-center text-sm soft-text'>
            {isRegister ? 'Already have an account?' : 'Don’t have an account yet?'}{' '}
            <Link className='font-semibold text-sky-300 hover:text-sky-200' href={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Login' : 'Register'}
            </Link>
          </p>
        </form>
      </Card>

      {isRegister && (
        <Card className='overflow-hidden p-4'>
          <div className='mb-4 px-2'>
            <p className='text-sm uppercase tracking-[0.3em]' style={{ color: 'var(--brand-to)' }}>Transport preview</p>
            <h2 className='mt-2 text-2xl font-semibold capitalize'>{transportType} selection</h2>
            <p className='mt-2 text-sm soft-text'>Choose preferred mode + theme. This helps personalize dashboard recommendations from first login.</p>
          </div>
          <TransportSelectorScene type={transportType} />
        </Card>
      )}
    </div>
  );
}
