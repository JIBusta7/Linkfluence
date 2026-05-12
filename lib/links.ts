import { customAlphabet } from 'nanoid';
import { getSupabaseAdmin } from './supabase/server';

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nano = customAlphabet(alphabet, 6);

export interface CreateLinkArgs {
  influencerId: string;
  productId: string;
  couponCode?: string | null;
}

export async function createOrGetLink({ influencerId, productId, couponCode }: CreateLinkArgs) {
  const admin = getSupabaseAdmin();

  // si ya existe, devolver el existente (idempotente)
  const existing = await admin
    .from('links')
    .select('*')
    .eq('influencer_id', influencerId)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing.data) return { link: existing.data, created: false as const };

  for (let attempt = 0; attempt < 4; attempt++) {
    const short_code = nano();
    const { data, error } = await admin
      .from('links')
      .insert({
        short_code,
        influencer_id: influencerId,
        product_id: productId,
        coupon_code: couponCode ?? null,
      })
      .select('*')
      .single();
    if (!error) return { link: data, created: true as const };
    if (!/duplicate key/i.test(error.message)) throw error;
  }
  throw new Error('No pude generar un short_code único tras varios intentos.');
}

export function linkUrl(shortCode: string, baseUrl?: string): string {
  // Resolución del host:
  //  1. baseUrl explícito si lo pasaron
  //  2. window.location.origin si estamos en el browser (lo más confiable)
  //  3. NEXT_PUBLIC_APP_URL (configurable en Vercel)
  //  4. VERCEL_URL (auto-inyectada por Vercel en runtime)
  //  5. localhost:3000 para desarrollo local
  if (baseUrl) return `${baseUrl.replace(/\/$/, '')}/r/${shortCode}`;
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/r/${shortCode}`;
  }
  const envBase =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '') ||
    'http://localhost:3000';
  return `${envBase.replace(/\/$/, '')}/r/${shortCode}`;
}
