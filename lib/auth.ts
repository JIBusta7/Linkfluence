import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import type { Profile, Role } from '@/lib/types';

export async function requireUser() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>();

  if (!profile) redirect('/onboarding');
  return { user, profile, supabase };
}

export async function requireRole(role: Role | Role[]) {
  const ctx = await requireUser();
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(ctx.profile.role)) {
    redirect('/app');
  }
  return ctx;
}
