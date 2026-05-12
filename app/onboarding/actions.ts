'use server';

import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';

export async function completeOnboardingAction(formData: FormData) {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const bio = String(formData.get('bio') ?? '').trim();
  const categories = formData.getAll('categories').map((v) => String(v));
  const industry = String(formData.get('industry') ?? '').trim() || null;

  await supabase
    .from('profiles')
    .update({ bio, categories, industry })
    .eq('id', user.id);

  redirect('/app');
}
