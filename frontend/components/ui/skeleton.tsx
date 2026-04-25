import { cn } from '@/lib/utils';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden />;
}

export function SkeletonStats({ count = 3 }: { count?: number }) {
  return (
    <div className='grid gap-4 md:grid-cols-3'>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className='h-28' />
      ))}
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: {
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center rounded-2xl border border-dashed border-[color:var(--border-strong)] bg-[var(--surface)] p-10 text-center', className)}>
      {icon ? (
        <div className='mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-2)] text-[color:var(--brand-secondary)]'>{icon}</div>
      ) : null}
      <h3 className='text-h3'>{title}</h3>
      {description ? <p className='mt-2 max-w-sm text-sm text-[color:var(--text-soft)]'>{description}</p> : null}
      {action ? <div className='mt-5'>{action}</div> : null}
    </div>
  );
}
