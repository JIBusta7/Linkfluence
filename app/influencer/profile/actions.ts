'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/taxonomy';

const profileSchema = z.object({
  display_name: z.string().min(1).max(80),
  location: z.string().max(80).nullable(),
  bio: z.string().max(280).nullable(),
  avatar_url: z.string().url().or(z.literal('')).nullable(),
  categories: z.array(z.enum(CATEGORIES)).max(8),
  instagram_handle: z.string().max(60).nullable(),
  tiktok_handle: z.string().max(60).nullable(),
  youtube_handle: z.string().max(60).nullable(),
  twitter_handle: z.string().max(60).nullable(),
  followers_total: z.number().int().nonnegative().nullable(),
  reach_estimate: z.number().int().nonnegative().nullable(),
  hire_cost_min: z.number().nonnegative().nullable(),
  hire_cost_max: z.number().nonnegative().nullable(),
});

function nullable(v: string): string | null {
  const t = v.trim();
  return t.length === 0 ? null : t;
}

function nullableInt(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function nullableNumber(v: string): number | null {
  if (!v.trim()) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function saveProfileAction(formData: FormData) {
  try {
    const { profile, supabase } = await requireRole('influencer');

    const payload = {
      display_name: String(formData.get('display_name') ?? '').trim(),
      location: nullable(String(formData.get('location') ?? '')),
      bio: nullable(String(formData.get('bio') ?? '')),
      avatar_url: nullable(String(formData.get('avatar_url') ?? '')),
      categories: formData.getAll('categories').map(String),
      instagram_handle: nullable(String(formData.get('instagram_handle') ?? '')),
      tiktok_handle: nullable(String(formData.get('tiktok_handle') ?? '')),
      youtube_handle: nullable(String(formData.get('youtube_handle') ?? '')),
      twitter_handle: nullable(String(formData.get('twitter_handle') ?? '')),
      followers_total: nullableInt(String(formData.get('followers_total') ?? '')),
      reach_estimate: nullableInt(String(formData.get('reach_estimate') ?? '')),
      hire_cost_min: nullableNumber(String(formData.get('hire_cost_min') ?? '')),
      hire_cost_max: nullableNumber(String(formData.get('hire_cost_max') ?? '')),
    };

    const parsed = profileSchema.safeParse(payload);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
    }

    if (
      parsed.data.hire_cost_min != null &&
      parsed.data.hire_cost_max != null &&
      parsed.data.hire_cost_min > parsed.data.hire_cost_max
    ) {
      return { error: 'El costo mínimo no puede ser mayor al máximo.' };
    }

    const { error } = await supabase
      .from('profiles')
      .update(parsed.data)
      .eq('id', profile.id);

    if (error) return { error: error.message };

    revalidatePath('/influencer/profile');
    revalidatePath('/influencer/dashboard');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error guardando perfil' };
  }
}

export async function uploadAvatarAction(formData: FormData) {
  try {
    const { profile } = await requireRole('influencer');
    const file = formData.get('file');
    if (!(file instanceof File)) return { error: 'Archivo inválido' };
    if (file.size > 2 * 1024 * 1024) return { error: 'Máximo 2 MB' };
    if (!file.type.startsWith('image/')) return { error: 'El archivo debe ser una imagen' };

    const admin = getSupabaseAdmin();
    const ext = (file.name.split('.').pop() ?? 'png').toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = `${profile.id}/avatar-${Date.now()}.${ext}`;
    const arrayBuffer = await file.arrayBuffer();

    const { error: upErr } = await admin.storage.from('avatars').upload(path, arrayBuffer, {
      contentType: file.type,
      upsert: true,
    });
    if (upErr) return { error: upErr.message };

    const { data } = admin.storage.from('avatars').getPublicUrl(path);
    const url = data.publicUrl;

    await admin.from('profiles').update({ avatar_url: url }).eq('id', profile.id);
    revalidatePath('/influencer/profile');
    return { url };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error subiendo imagen' };
  }
}
