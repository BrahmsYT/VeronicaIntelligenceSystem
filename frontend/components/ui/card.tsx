import { cn } from '@/lib/utils';

export type CardVariant = 'default' | 'plain' | 'elevated' | 'outline' | 'gradient';

const variants: Record<CardVariant, string> = {
  default: 'glass shadow-elevated',
  plain: 'bg-[var(--surface)] border border-[color:var(--border)]',
  elevated: 'glass shadow-floating',
  outline: 'bg-transparent border border-[color:var(--border-strong)]',
  gradient: 'aurora shadow-glow'
};

export function Card({
  className,
  children,
  variant = 'default',
  padding = 'lg'
}: {
  className?: string;
  children: React.ReactNode;
  variant?: CardVariant;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}) {
  const pad = padding === 'none' ? '' : padding === 'sm' ? 'p-4' : padding === 'md' ? 'p-5' : 'p-6';
  return <div className={cn('rounded-2xl', pad, variants[variant], className)}>{children}</div>;
}

export function CardHeader({
  title,
  description,
  icon,
  action,
  overline,
  className
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  overline?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('mb-5 flex items-start justify-between gap-4', className)}>
      <div className='flex items-start gap-3'>
        {icon ? (
          <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] text-[color:var(--brand-secondary)]'>
            {icon}
          </div>
        ) : null}
        <div className='space-y-1'>
          {overline ? <p className='text-overline'>{overline}</p> : null}
          <h3 className='text-h3 leading-tight'>{title}</h3>
          {description ? <p className='text-sm text-[color:var(--text-soft)]'>{description}</p> : null}
        </div>
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}
