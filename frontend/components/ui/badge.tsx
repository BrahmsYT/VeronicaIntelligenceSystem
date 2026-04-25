import { cn } from '@/lib/utils';

export type BadgeTone = 'default' | 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'brand';

const toneClass: Record<BadgeTone, string> = {
  default: 'chip chip-neutral',
  neutral: 'chip chip-neutral',
  success: 'chip chip-success',
  warning: 'chip chip-warning',
  danger: 'chip chip-danger',
  info: 'chip chip-info',
  brand: 'chip text-white border-transparent bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))]'
};

const dotClass: Record<BadgeTone, string> = {
  default: 'bg-[color:var(--muted)]',
  neutral: 'bg-[color:var(--muted)]',
  success: 'bg-[color:var(--success)]',
  warning: 'bg-[color:var(--warning)]',
  danger: 'bg-[color:var(--danger)]',
  info: 'bg-[color:var(--info)]',
  brand: 'bg-white'
};

export function Badge({
  children,
  tone = 'default',
  withDot = false,
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  withDot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(toneClass[tone], 'capitalize', className)}>
      {withDot ? <span className={cn('dot', dotClass[tone])} aria-hidden /> : null}
      {children}
    </span>
  );
}
