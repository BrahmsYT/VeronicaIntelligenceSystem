import Link from 'next/link';
import { TrainFront, Github, Linkedin, Twitter } from 'lucide-react';

const cols = [
  {
    title: 'Platform',
    links: [
      { label: 'Predictive flow', href: '/#features' },
      { label: 'Operator console', href: '/#platform' },
      { label: 'Passenger trip planner', href: '/dashboard' },
      { label: 'AI dispatch', href: '/staff' }
    ]
  },
  {
    title: 'Product',
    links: [
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' },
      { label: 'Admin console', href: '/admin' },
      { label: 'Documentation', href: '#' }
    ]
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/#team' },
      { label: 'Contact', href: '#' },
      { label: 'Privacy', href: '#' },
      { label: 'Security', href: '#' }
    ]
  }
];

export function Footer() {
  return (
    <footer className='mt-24 border-t border-[color:var(--border)]'>
      <div className='page-shell py-14'>
        <div className='grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]'>
          <div className='max-w-sm'>
            <Link href='/' className='inline-flex items-center gap-3'>
              <span className='flex h-9 w-9 items-center justify-center rounded-xl border border-[color:var(--border-strong)] bg-[var(--surface-2)]'>
                <TrainFront className='h-4 w-4 text-[color:var(--brand-secondary)]' />
              </span>
              <div className='leading-tight'>
                <p className='text-sm font-semibold'>AZCON Smart Transit AI</p>
                <p className='text-[10px] uppercase tracking-[0.22em] text-[color:var(--muted)]'>Public infrastructure intelligence</p>
              </div>
            </Link>
            <p className='mt-5 text-sm text-[color:var(--text-soft)]'>
              Predictive transit operations for cities and operators — built on real-time signals, AI dispatch, and passenger-first design.
            </p>
            <div className='mt-6 flex items-center gap-2'>
              {[Github, Linkedin, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href='#'
                  className='flex h-9 w-9 items-center justify-center rounded-lg border border-[color:var(--border)] bg-[var(--surface)] text-[color:var(--text-soft)] transition-colors hover:border-[color:var(--border-strong)] hover:text-[color:var(--text)]'
                  aria-label='Social link'
                >
                  <Icon className='h-4 w-4' />
                </a>
              ))}
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <p className='text-overline'>{col.title}</p>
              <ul className='mt-4 space-y-2.5'>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className='text-sm text-[color:var(--text-soft)] transition-colors hover:text-[color:var(--text)]'>
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='divider mt-12' />
        <div className='mt-6 flex flex-wrap items-center justify-between gap-3 text-xs text-[color:var(--muted)]'>
          <p>© {new Date().getFullYear()} AZCON. All rights reserved.</p>
          <p className='inline-flex items-center gap-2'>
            <span className='dot bg-[color:var(--success)]' /> All systems operational
          </p>
        </div>
      </div>
    </footer>
  );
}
