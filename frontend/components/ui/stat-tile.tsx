import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export type StatTrend = 'up' | 'down' | 'flat';

export function StatTile({
  label,
  value,
  helper,
  trend,
  icon,
  accent,
  className
}: {
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  trend?: StatTrend;
  icon?: React.ReactNode;
  accent?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}) {
  const trendColor =
    trend === 'up' ? 'text-[color:var(--success)]' : trend === 'down' ? 'text-[color:var(--danger)]' : 'text-[color:var(--text-soft)]';

  const accentRing =
    accent === 'success'
      ? 'before:bg-[color:var(--success)]'
      : accent === 'warning'
      ? 'before:bg-[color:var(--warning)]'
      : accent === 'danger'
      ? 'before:bg-[color:var(--danger)]'
      : accent === 'info'
      ? 'before:bg-[color:var(--info)]'
      : 'before:bg-[linear-gradient(180deg,var(--brand-from),var(--brand-to))]';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-5 transition-colors hover:border-[color:var(--border-strong)]',
        'before:absolute before:left-0 before:top-4 before:bottom-4 before:w-[3px] before:rounded-full',
        accentRing,
        className
      )}
    >
      <div className='flex items-start justify-between gap-3'>
        <p className='text-overline'>{label}</p>
        {icon ? <span className='text-[color:var(--brand-secondary)]'>{icon}</span> : null}
      </div>
      <p className='numeric mt-3 text-3xl font-semibold tracking-tight'>{value}</p>
      {helper ? (
        <p className={cn('mt-2 inline-flex items-center gap-1 text-xs', trendColor)}>
          {trend === 'up' ? <ArrowUpRight className='h-3.5 w-3.5' /> : trend === 'down' ? <ArrowDownRight className='h-3.5 w-3.5' /> : null}
          <span>{helper}</span>
        </p>
      ) : null}
    </div>
  );
}
