import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';

// Dispatcher: envía al dashboard del rol correspondiente
export default async function AppHomePage() {
  const { profile } = await requireUser();
  if (profile.role === 'influencer') redirect('/influencer/catalog');
  if (profile.role === 'company') redirect('/company');
  if (profile.role === 'admin') redirect('/admin');
  redirect('/');
}
