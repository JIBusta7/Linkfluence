import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServer } from '@/lib/supabase/server';
import { searchML } from '@/lib/marketplace/mercadolibre';
import type { Product } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ catalog: [], marketplace: [] });

  // 1) Catálogo interno (verified)
  const catalogRes = await supabase
    .from('products')
    .select('id, name, category, style, material, price_range, price_numeric, image_url, tags, description')
    .eq('status', 'verified')
    .ilike('name', `%${q}%`)
    .limit(8)
    .returns<Product[]>();

  // 2) Mercado Libre (público)
  const ml = await searchML(q, { limit: 6 });

  return NextResponse.json({
    catalog: catalogRes.data ?? [],
    marketplace: ml,
  });
}
