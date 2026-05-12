'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function signupAction(formData: FormData) {
  const email = String(formData.get('email') ?? '');
  const password = String(formData.get('password') ?? '');
  const display_name = String(formData.get('display_name') ?? '');
  const role = String(formData.get('role') ?? 'influencer');

  if (!['influencer', 'company'].includes(role)) {
    redirect('/signup?error=Rol%20inv%C3%A1lido');
  }

  const supabase = await getSupabaseServer();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name, role },
    },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect('/onboarding');
}
