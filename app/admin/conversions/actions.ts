'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

export async function createManualConversionAction(input: {
  linkId: string;
  amount: number;
  notes?: string;
}) {
  try {
    await requireRole('admin');
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { error: 'Monto inválido' };
    }
    const admin = getSupabaseAdmin();
    const { error } = await admin.from('conversions').insert({
      link_id: input.linkId,
      amount: input.amount,
      source: 'manual',
      notes: input.notes?.trim() || null,
    });
    if (error) return { error: error.message };
    await admin.rpc('refresh_stats');
    revalidatePath('/admin/events');
    revalidatePath('/admin');
    return { ok: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error registrando conversión' };
  }
}
