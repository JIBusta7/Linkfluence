'use server';

import { z } from 'zod';
import { requireRole } from '@/lib/auth';
import { classifyProduct, classifyFallback } from '@/lib/ai/classify';
import { CATEGORIES, MATERIALS, PRICE_RANGES, STYLES } from '@/lib/taxonomy';

export async function classifyForSearchAction(input: { url?: string; name?: string }) {
  try {
    await requireRole('company');
    if (!process.env.ANTHROPIC_API_KEY) {
      return classifyFallback({ name: input.name || 'producto', url: input.url });
    }
    return await classifyProduct({ url: input.url, name: input.name });
  } catch (e) {
    if (input.name) return classifyFallback({ name: input.name, url: input.url });
    return { error: e instanceof Error ? e.message : 'Error clasificando' } as const;
  }
}

const payloadSchema = z.object({
  name: z.string().min(2).max(120),
  category: z.enum(CATEGORIES),
  style: z.enum(STYLES).nullable(),
  material: z.enum(MATERIALS).nullable(),
  price_range: z.enum(PRICE_RANGES),
  description: z.string().min(5).max(500),
  tags: z.array(z.string()).max(12),
});

export async function createSearchAction(input: unknown) {
  try {
    const { profile, supabase } = await requireRole('company');
    const parsed = payloadSchema.safeParse(input);
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' };
    }

    const { data, error } = await supabase
      .from('company_searches')
      .insert({
        company_id: profile.id,
        query_product_id: null,
        query_payload: parsed.data,
      })
      .select('id')
      .single();

    if (error) return { error: error.message };
    return { searchId: data.id };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error en la búsqueda' };
  }
}
