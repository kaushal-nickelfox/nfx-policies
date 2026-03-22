import { auth } from '@/lib/auth/authOptions';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  if (session.user?.role === 'admin') {
    redirect('/admin/dashboard');
  }

  redirect('/employee/dashboard');
}
