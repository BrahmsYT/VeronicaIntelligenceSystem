import { AuthForm } from '@/components/auth/auth-form';

export default function LoginPage() {
  return (
    <div className='relative min-h-screen'>
      <div className='page-shell flex min-h-screen items-center py-16'>
        <AuthForm mode='login' />
      </div>
    </div>
  );
}
