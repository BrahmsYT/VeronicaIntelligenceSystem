import { cn } from '@/lib/utils';

export function SectionHeading({
  overline,
  title,
  description,
  action,
  className
}: {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-4', className)}>
      <div className='space-y-2'>
        {overline ? <p className='text-overline'>{overline}</p> : null}
        <h2 className='text-h2'>{title}</h2>
        {description ? <p className='max-w-2xl text-sm text-[color:var(--text-soft)]'>{description}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}

export function PageHeader({
  overline,
  title,
  description,
  action
}: {
  overline?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className='mb-2 flex flex-wrap items-end justify-between gap-4 border-b border-[color:var(--border)] pb-6'>
      <div className='space-y-2'>
        {overline ? <p className='text-overline'>{overline}</p> : null}
        <h1 className='text-h1'>{title}</h1>
        {description ? <p className='max-w-2xl text-[color:var(--text-soft)]'>{description}</p> : null}
      </div>
      {action ? <div className='shrink-0'>{action}</div> : null}
    </div>
  );
}
