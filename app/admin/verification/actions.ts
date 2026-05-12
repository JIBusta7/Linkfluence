'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';
import { embedProduct, fallbackEmbedding, productEmbeddingInput } from '@/lib/ai/embed';
import { findFirstML } from '@/lib/marketplace/mercadolibre';
import type { Product } from '@/lib/types';

export async function approveProductAction(productId: string) {
  try {
    const { profile } = await requireRole('admin');
    const admin = getSupabaseAdmin();

    const { data: productRaw, error } = await admin
      .from('products')
      .update({
        status: 'verified',
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
        rejection_reason: null,
      })
      .eq('id', productId)
      .select('*')
      .single();

    const product = productRaw as Product | null;
    if (error || !product) {
      return { error: error?.message ?? 'Producto no encontrado' };
    }

    // Auto-fetch de imagen desde Mercado Libre (best-effort, no falla si no hay match)
    if (!product.image_url) {
      const mlMatch = await findFirstML(product.name);
      if (mlMatch?.picture) {
        await admin
          .from('products')
          .update({ image_url: mlMatch.picture })
          .eq('id', productId);
        product.image_url = mlMatch.picture;
      }
    }

    // Generar embedding (con fallback determinístico si no hay API key)
    let embedding: number[];
    try {
      embedding = process.env.OPENAI_API_KEY
        ? await embedProduct(product)
        : fallbackEmbedding(productEmbeddingInput(product));
    } catch {
      embedding = fallbackEmbedding(productEmbeddingInput(product));
    }

    await admin.from('product_embeddings').upsert({
      product_id: productId,
      embedding: embedding as any,
      updated_at: new Date().toISOString(),
    });

    revalidatePath('/admin/verification');
    revalidatePath('/influencer/catalog');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error aprobando' };
  }
}

export async function rejectProductAction(productId: string, reason: string) {
  try {
    const { profile } = await requireRole('admin');
    const admin = getSupabaseAdmin();

    const { error } = await admin
      .from('products')
      .update({
        status: 'rejected',
        verified_by: profile.id,
        verified_at: new Date().toISOString(),
        rejection_reason: reason.trim() || 'Sin motivo indicado',
      })
      .eq('id', productId);

    if (error) return { error: error.message };

    revalidatePath('/admin/verification');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error rechazando' };
  }
}
