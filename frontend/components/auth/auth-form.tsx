'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Eye, EyeOff, Lock, Mail, ShieldCheck, Sparkles, TrainFront, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { apiClient } from '@/services/api-client';
import { useApp } from '@/components/providers/app-provider';
import { TransportSelectorScene } from '@/components/three/transport-selector-scene';
import { ThemePreset, TransportType } from '@/lib/types';

type RegisterRole = 'admin' | 'staff' | 'user';

const inputClassName = 'input-base';

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

  const roleOptions: { value: RegisterRole; label: string; hint: string }[] = [
    { value: 'user', label: 'Passenger', hint: 'Plan trips, see crowding' },
    { value: 'staff', label: 'Staff', hint: 'Live ops & dispatch' },
    { value: 'admin', label: 'Admin', hint: 'Full system control' }
  ];

  const transportOptions: { value: TransportType; label: string }[] = [
    { value: 'bus', label: 'Bus' },
    { value: 'metro', label: 'Metro' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'rail', label: 'Rail' }
  ];

  return (
    <div className={`mx-auto grid w-full gap-6 ${isRegister ? 'max-w-[1180px] lg:grid-cols-[1.05fr_0.95fr]' : 'max-w-[480px]'}`}>
      <Card className='p-8 md:p-10'>
        {/* Brand block */}
        <Link href='/' className='inline-flex items-center gap-3'>
          <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[var(--surface-2)]'>
            <TrainFront className='h-4 w-4 text-[color:var(--brand-secondary)]' />
          </span>
          <span className='text-sm font-semibold tracking-tight'>AZCON Smart Transit</span>
        </Link>

        <div className='mt-8'>
          <p className='text-overline'>{isRegister ? 'Create account' : 'Secure login'}</p>
          <h1 className='mt-2 text-h1'>{isRegister ? t.auth.registerTitle : t.auth.loginTitle}</h1>
          <p className='mt-3 max-w-md text-sm text-[color:var(--text-soft)]'>{t.auth.welcome}</p>
        </div>

        <form className='mt-8 space-y-5' onSubmit={onSubmit} noValidate>
          {isRegister && (
            <div className='grid gap-4 sm:grid-cols-2'>
              <Field label='First name'>
                <input className={inputClassName} placeholder='Aysel' value={form.name} onChange={(e: any) => updateForm('name', e.target.value)} />
              </Field>
              <Field label='Surname'>
                <input className={inputClassName} placeholder='Aliyev' value={form.surname} onChange={(e: any) => updateForm('surname', e.target.value)} />
              </Field>
            </div>
          )}

          <Field label='Email address'>
            <div className='relative'>
              <Mail className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]' />
              <input
                className={`${inputClassName} input-with-left-icon`}
                placeholder='you@company.com'
                type='email'
                autoComplete='email'
                value={form.email}
                onChange={(e: any) => updateForm('email', e.target.value)}
              />
            </div>
          </Field>

          <Field label='Password' helper='Minimum 6 simvol — hərflər və rəqəmlər tövsiyə olunur.'>
            <div className='relative'>
              <Lock className='pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]' />
              <input
                className={`${inputClassName} input-with-left-icon input-with-right-icon`}
                placeholder='••••••••'
                type={showPassword ? 'text' : 'password'}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                value={form.password}
                onChange={(e: any) => updateForm('password', e.target.value)}
              />
              <button
                type='button'
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className='absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-[color:var(--muted)] hover:bg-[var(--surface-2)] hover:text-[color:var(--text)]'
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff className='h-4 w-4' /> : <Eye className='h-4 w-4' />}
              </button>
            </div>
          </Field>

          {isRegister && (
            <>
              <Field label='Confirm password'>
                <input
                  className={inputClassName}
                  placeholder='Repeat password'
                  type={showPassword ? 'text' : 'password'}
                  autoComplete='new-password'
                  value={form.confirmPassword}
                  onChange={(e: any) => updateForm('confirmPassword', e.target.value)}
                />
              </Field>

              <div>
                <p className='text-overline mb-2'>Account role</p>
                <div className='grid gap-2 sm:grid-cols-3'>
                  {roleOptions.map((opt) => {
                    const active = form.role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => setForm((prev) => ({ ...prev, role: opt.value }))}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          active
                            ? 'border-[color:var(--brand-secondary)] bg-[var(--surface-2)]'
                            : 'border-[color:var(--border)] hover:border-[color:var(--border-strong)]'
                        }`}
                      >
                        <p className='text-sm font-semibold'>{opt.label}</p>
                        <p className='text-[11px] text-[color:var(--text-soft)]'>{opt.hint}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className='text-overline mb-2'>Preferred transport</p>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                  {transportOptions.map((opt) => {
                    const active = transportType === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type='button'
                        onClick={() => setTransportType(opt.value)}
                        className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                          active
                            ? 'border-[color:var(--brand-secondary)] bg-[var(--surface-2)] text-[color:var(--text)]'
                            : 'border-[color:var(--border)] text-[color:var(--text-soft)] hover:border-[color:var(--border-strong)]'
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Field label='Default theme'>
                <select className={`${inputClassName} capitalize`} value={theme} onChange={(e: any) => setTheme(e.target.value as ThemePreset)}>
                  <option value='light'>Light</option>
                  <option value='dark'>Dark</option>
                  <option value='ocean'>Ocean</option>
                  <option value='neon'>Neon</option>
                  <option value='lava'>Lava</option>
                </select>
              </Field>
            </>
          )}

          {!isRegister ? (
            <label className='flex items-center gap-3 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[color:var(--text-soft)] hover:border-[color:var(--border-strong)]'>
              <input type='checkbox' checked={rememberMe} onChange={(e: any) => setRememberMe(Boolean(e.target.checked))} />
              <span>Remember me for 7 days</span>
            </label>
          ) : null}

          {error ? (
            <div className='flex items-start gap-2 rounded-lg border border-[color:color-mix(in_srgb,var(--danger)_40%,transparent)] bg-[var(--danger-soft)] p-3 text-sm text-[color:#fda4af]'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <span>{error}</span>
            </div>
          ) : null}

          <Button className='w-full' size='lg' loading={loading} rightIcon={<ArrowRight className='h-4 w-4' />}>
            {isRegister ? 'Create account' : 'Sign in'}
          </Button>

          <div className='flex items-start gap-2 rounded-lg border border-[color:var(--border)] bg-[var(--surface)] p-3 text-xs text-[color:var(--text-soft)]'>
            <ShieldCheck className='mt-0.5 h-4 w-4 shrink-0 text-[color:var(--success)]' />
            <span>Encrypted in transit · Role-aware sessions · GDPR-ready data handling.</span>
          </div>

          <details className='rounded-lg border border-dashed border-[color:var(--border-strong)] bg-[var(--surface)] p-3 text-xs text-[color:var(--text-soft)]'>
            <summary className='cursor-pointer font-semibold text-[color:var(--text)]'>Demo credentials</summary>
            <p className='mt-2'>User: <span className='text-[color:var(--brand-secondary)]'>user@azcon.ai / User123!</span></p>
            <p>Staff: <span className='text-[color:var(--brand-secondary)]'>staff@azcon.ai / Staff123!</span></p>
            <p>Admin: <span className='text-[color:var(--brand-secondary)]'>admin@azcon.ai / Admin123!</span></p>
          </details>

          <p className='text-center text-sm text-[color:var(--text-soft)]'>
            {isRegister ? 'Already have an account?' : 'Don’t have an account yet?'}{' '}
            <Link className='font-semibold text-[color:var(--brand-secondary)] hover:underline' href={isRegister ? '/login' : '/register'}>
              {isRegister ? 'Login' : 'Register'}
            </Link>
          </p>
        </form>
      </Card>

      {isRegister && (
        <div className='space-y-6'>
          <Card variant='gradient' className='overflow-hidden p-5'>
            <div className='mb-4'>
              <p className='text-overline'>Transport preview</p>
              <h2 className='mt-2 text-h2 capitalize'>{transportType}</h2>
              <p className='mt-2 text-sm text-[color:var(--text-soft)]'>Your preferred mode personalizes dashboard recommendations from first login.</p>
            </div>
            <div className='overflow-hidden rounded-xl border border-[color:var(--border)]'>
              <TransportSelectorScene type={transportType} />
            </div>
          </Card>

          <Card>
            <p className='text-overline'>What you unlock</p>
            <ul className='mt-3 space-y-3 text-sm'>
              {[
                ['Predictive crowd & delay forecasts', 'Plan trips with confidence'],
                ['Role-aware command surfaces', 'Staff & admin tools, segmented'],
                ['AI dispatch with safe fallback', 'Works offline-first']
              ].map(([t1, t2]) => (
                <li key={t1} className='flex items-start gap-3'>
                  <span className='mt-0.5 flex h-7 w-7 items-center justify-center rounded-md bg-[var(--surface-2)] text-[color:var(--brand-secondary)]'>
                    <Sparkles className='h-3.5 w-3.5' />
                  </span>
                  <div>
                    <p className='font-medium'>{t1}</p>
                    <p className='text-xs text-[color:var(--text-soft)]'>{t2}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </div>
  );
}

function Field({ label, helper, children }: { label: string; helper?: string; children: React.ReactNode }) {
  return (
    <label className='block space-y-1.5'>
      <span className='text-xs font-semibold text-[color:var(--text-soft)]'>{label}</span>
      {children}
      {helper ? <span className='block text-[11px] text-[color:var(--muted)]'>{helper}</span> : null}
    </label>
  );
}
