'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function loginAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const redirectTo = String(formData.get('redirectTo') ?? '/app');

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const params = new URLSearchParams({ error: error.message });
    if (redirectTo) params.set('redirectTo', redirectTo);
    redirect(`/login?${params.toString()}`);
  }

  redirect(redirectTo || '/app');
}

export async function logoutAction() {
  const supabase = await getSupabaseServer();
  await supabase.auth.signOut();
  redirect('/');
}
