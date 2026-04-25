import { cn } from '@/lib/utils';

export function Badge({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  const styles = {
    default: 'bg-white/10 text-white',
    success: 'bg-emerald-500/15 text-emerald-300',
    warning: 'bg-amber-500/15 text-amber-300',
    danger: 'bg-rose-500/15 text-rose-300'
  };

  return <span className={cn('rounded-full px-3 py-1 text-xs font-medium', styles[tone])}>{children}</span>;
}
