import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

const base =
  'group relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold tracking-tight transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50 active:scale-[.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--bg)]';

const sizes: Record<ButtonSize, string> = {
  sm: 'h-9 rounded-md px-3 text-xs',
  md: 'h-11 rounded-lg px-4 text-sm',
  lg: 'h-12 rounded-lg px-5 text-sm',
  icon: 'h-10 w-10 rounded-lg text-sm'
};

const variants: Record<ButtonVariant, string> = {
  primary:
    'text-white shadow-elevated bg-[linear-gradient(135deg,var(--brand-from),var(--brand-to))] hover:shadow-glow hover:brightness-110 ring-1 ring-white/10',
  secondary:
    'bg-[var(--surface-2)] text-[color:var(--text)] hover:bg-[var(--surface-3)] border border-[color:var(--border-strong)]',
  outline:
    'bg-transparent text-[color:var(--text)] border border-[color:var(--border-strong)] hover:bg-[var(--surface)]',
  ghost:
    'bg-transparent text-[color:var(--text-soft)] hover:text-[color:var(--text)] hover:bg-[var(--surface)]',
  destructive:
    'text-white bg-[linear-gradient(135deg,#e11d48,#f43f5e)] hover:brightness-110 ring-1 ring-rose-500/30 shadow-elevated'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, disabled, ...props },
  ref
) {
  return (
    <button ref={ref} className={cn(base, sizes[size], variants[variant], className)} disabled={disabled || loading} {...props}>
      {loading ? <Loader2 className='h-4 w-4 animate-spin' /> : leftIcon}
      <span className='inline-flex items-center'>{children}</span>
      {!loading ? rightIcon : null}
    </button>
  );
});
