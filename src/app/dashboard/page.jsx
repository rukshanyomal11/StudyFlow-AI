import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/getSession';

export default async function DashboardRedirectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  redirect(`/${user.role || 'student'}/dashboard`);
}
