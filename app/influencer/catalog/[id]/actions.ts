'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { createOrGetLink } from '@/lib/links';

export async function generateLinkAction(productId: string, coupon: string | null) {
  const { profile } = await requireRole('influencer');
  try {
    const { link } = await createOrGetLink({
      influencerId: profile.id,
      productId,
      couponCode: coupon ?? null,
    });
    revalidatePath('/influencer/links');
    return { shortCode: link.short_code };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Error desconocido';
    return { error: message };
  }
}
