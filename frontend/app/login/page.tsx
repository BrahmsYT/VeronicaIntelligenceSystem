import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return <div className='page-shell flex min-h-screen items-center py-12'><AuthForm mode='login' /></div>;
}
