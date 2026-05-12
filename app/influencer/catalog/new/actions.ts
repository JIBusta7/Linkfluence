'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { classifyProduct, classifyFallback } from '@/lib/ai/classify';
import { CATEGORIES, MATERIALS, PRICE_RANGES, STYLES } from '@/lib/taxonomy';

export async function classifyAction(input: { url?: string; name?: string }) {
  try {
    await requireRole('influencer');
    if (!process.env.ANTHROPIC_API_KEY) {
      return classifyFallback({ name: input.name || 'producto', url: input.url });
    }
    return await classifyProduct({ url: input.url, name: input.name });
  } catch (e) {
    // last resort fallback
    if (input.name) {
      return classifyFallback({ name: input.name, url: input.url });
    }
    const message = e instanceof Error ? e.message : 'Error al clasificar';
    return { error: message } as const;
  }
}

const submitSchema = z.object({
  external_url: z.string().url(),
  name: z.string().min(2).max(120),
  category: z.enum(CATEGORIES),
  style: z.enum(STYLES).nullable(),
  material: z.enum(MATERIALS).nullable(),
  price_range: z.enum(PRICE_RANGES),
  price_numeric: z.number().positive().nullable(),
  description: z.string().min(10).max(500),
  tags: z.array(z.string().min(1)).max(12),
});

export async function submitProductAction(formData: FormData) {
  const { profile, supabase } = await requireRole('influencer');

  const raw = {
    external_url: String(formData.get('external_url') ?? ''),
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? ''),
    style: String(formData.get('style') ?? '') || null,
    material: String(formData.get('material') ?? '') || null,
    price_range: String(formData.get('price_range') ?? ''),
    price_numeric: formData.get('price_numeric')
      ? Number(formData.get('price_numeric'))
      : null,
    description: String(formData.get('description') ?? '').trim(),
    tags: String(formData.get('tags') ?? '')
      .split(',')
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean),
  };

  const parsed = submitSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
  }

  const { error } = await supabase.from('products').insert({
    ...parsed.data,
    status: 'pending',
    submitted_by: profile.id,
  });

  if (error) {
    return { error: error.message };
  }

  return { ok: true };
}
