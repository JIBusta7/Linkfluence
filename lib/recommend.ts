import { getSupabaseAdmin } from './supabase/server';
import { embedText, fallbackEmbedding } from './ai/embed';
import {
  categoryMatchScore,
  cosine,
  exactPerf,
  fitScore,
  jaccard,
  priceMatchScore,
  similarPerf,
  styleMatchScore,
  volumeConfidence,
  type PastProductStats,
} from './scoring';
import { priceRangeProximity, type Category, type Material, type PriceRange, type Style } from './taxonomy';
import type { Product, Recommendation } from './types';

export interface QueryPayload {
  name: string;
  category: Category;
  style: Style | null;
  material: Material | null;
  price_range: PriceRange;
  description: string;
  tags: string[];
}

export async function recommendInfluencers(
  query: QueryPayload,
  opts: { topK?: number; topN?: number } = {},
): Promise<Recommendation[]> {
  const topK = opts.topK ?? 20;
  const topN = opts.topN ?? 10;
  const admin = getSupabaseAdmin();

  // 1. Producto target sintético (no se inserta)
  const targetText = [
    query.name,
    query.category,
    query.style,
    query.material,
    query.tags.join(', '),
    query.description,
  ]
    .filter(Boolean)
    .join(' | ');

  let targetEmbedding: number[];
  try {
    targetEmbedding = process.env.OPENAI_API_KEY
      ? await embedText(targetText)
      : fallbackEmbedding(targetText);
  } catch {
    targetEmbedding = fallbackEmbedding(targetText);
  }

  // 2. Traer todos los productos verificados + su embedding (topK por similitud semántica)
  const productsRes = await admin
    .from('products')
    .select('*, product_embeddings(embedding)')
    .eq('status', 'verified');

  const products = (productsRes.data ?? []) as Array<Product & { product_embeddings: { embedding: unknown } | null }>;
  if (products.length === 0) return [];

  const candidates = products
    .map((p) => {
      const emb: number[] | null = p.product_embeddings?.embedding
        ? parseEmbedding(p.product_embeddings.embedding)
        : null;
      const sem = emb ? cosine(emb, targetEmbedding) : 0;
      const struct =
        0.25 * jaccard(p.tags ?? [], query.tags) +
        0.1 * (p.category === query.category ? 1 : 0) +
        0.05 * priceRangeProximity(p.price_range, query.price_range);
      const similarity = Math.max(0, Math.min(1, 0.6 * sem + struct));
      return { product: p as Product, similarity };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  if (candidates.length === 0) return [];

  // 3. Influencers con historial en esos productos candidatos
  const { data: linkStats } = await admin
    .from('link_stats')
    .select('influencer_id, product_id, clicks, conversions, cr, revenue');

  const { data: influencers } = await admin
    .from('profiles')
    .select(
      'id, display_name, bio, categories, avatar_url, role, followers_total, reach_estimate, hire_cost_min, hire_cost_max, instagram_handle, tiktok_handle, youtube_handle',
    )
    .eq('role', 'influencer');

  const { data: totals } = await admin
    .from('influencer_totals')
    .select('influencer_id, total_clicks');

  const totalsByInfluencer = new Map<string, number>(
    (totals ?? []).map((t: any) => [t.influencer_id, Number(t.total_clicks) || 0]),
  );

  // Pre-computar maxCR global para normalizar
  const maxCrGlobal = Math.max(
    0.01,
    ...(linkStats ?? []).map((s: any) => Number(s.cr) || 0),
  );

  // 4. Por influencer: construir lista de "pastProducts" con similarity
  const productIndex = new Map<string, Product>(products.map((p) => [p.id, p as Product]));
  const candidateMap = new Map<string, number>(candidates.map((c) => [c.product.id, c.similarity]));

  const byInfluencer = new Map<string, PastProductStats[]>();
  const candidateByInfluencer = new Map<string, Array<PastProductStats & { similarity: number }>>();

  for (const s of (linkStats ?? []) as Array<{
    influencer_id: string;
    product_id: string;
    clicks: number;
    conversions: number;
    cr: number;
    revenue: number;
  }>) {
    const prod = productIndex.get(s.product_id);
    if (!prod) continue;
    const entry: PastProductStats = {
      product: {
        id: prod.id,
        name: prod.name,
        category: prod.category,
        style: prod.style,
        material: prod.material,
        price_range: prod.price_range,
        tags: prod.tags,
      },
      clicks: Number(s.clicks) || 0,
      conversions: Number(s.conversions) || 0,
      cr: Number(s.cr) || 0,
    };

    const list = byInfluencer.get(s.influencer_id) ?? [];
    list.push(entry);
    byInfluencer.set(s.influencer_id, list);

    const sim = candidateMap.get(s.product_id);
    if (sim !== undefined) {
      const arr = candidateByInfluencer.get(s.influencer_id) ?? [];
      arr.push({ ...entry, similarity: sim });
      candidateByInfluencer.set(s.influencer_id, arr);
    }
  }

  // 5. Construir recomendaciones
  const recs: Recommendation[] = [];
  type InfluencerRow = {
    id: string;
    display_name: string;
    bio: string | null;
    categories: string[];
    avatar_url: string | null;
    role: string;
    followers_total: number | null;
    reach_estimate: number | null;
    hire_cost_min: number | null;
    hire_cost_max: number | null;
    instagram_handle: string | null;
    tiktok_handle: string | null;
    youtube_handle: string | null;
  };
  for (const inf of (influencers ?? []) as InfluencerRow[]) {
    const past = byInfluencer.get(inf.id) ?? [];
    const similar = candidateByInfluencer.get(inf.id) ?? [];
    const totalClicks = totalsByInfluencer.get(inf.id) ?? 0;

    const targetProduct = {
      id: '__target__',
      name: query.name,
      category: query.category,
      style: query.style,
      material: query.material,
      price_range: query.price_range,
      tags: query.tags,
      description: query.description,
      external_url: '',
      image_url: null,
      price_numeric: null,
      status: 'verified' as const,
      submitted_by: null,
      verified_by: null,
      verified_at: null,
      rejection_reason: null,
      created_at: new Date().toISOString(),
    };

    const components = {
      exact_perf: exactPerf(targetProduct, past, maxCrGlobal),
      similar_perf: similarPerf(similar, maxCrGlobal),
      category_match: categoryMatchScore(inf.categories ?? [], query.category),
      style_match: styleMatchScore(past.map((p) => p.product.style), query.style),
      price_match: priceMatchScore(past.map((p) => p.product.price_range), query.price_range),
      volume_confidence: volumeConfidence(totalClicks),
    };

    const score = fitScore(components);

    // Best category (donde el influencer tiene mejor CR con volumen mínimo)
    const byCat = new Map<string, { cr: number; clicks: number; conversions: number }>();
    for (const p of past) {
      const cur = byCat.get(p.product.category) ?? { cr: 0, clicks: 0, conversions: 0 };
      cur.clicks += p.clicks;
      cur.conversions += p.conversions;
      byCat.set(p.product.category, cur);
    }
    let bestCategory: Category | null = null;
    let bestCatCr = 0;
    byCat.forEach((v, k) => {
      const cr = v.clicks ? v.conversions / v.clicks : 0;
      if (v.clicks >= 10 && cr > bestCatCr) {
        bestCatCr = cr;
        bestCategory = k as Category;
      }
    });

    // CR promedio en similares
    const crOnSimilar = similar.length
      ? similar.reduce((s, p) => s + p.cr * p.similarity, 0) /
        Math.max(1, similar.reduce((s, p) => s + p.similarity, 0))
      : 0;

    // match reasons estructurales
    const reasons: string[] = [];
    if ((inf.categories ?? []).includes(query.category)) reasons.push(query.category);
    if (query.material) {
      const hasMaterial = past.some((p) => p.product.material === query.material);
      if (hasMaterial) reasons.push(query.material);
    }
    if (query.style) {
      const hasStyle = past.some((p) => p.product.style === query.style);
      if (hasStyle) reasons.push(query.style);
    }
    const tagMatches = new Set<string>();
    for (const p of past) {
      for (const t of p.product.tags ?? []) {
        if (query.tags.includes(t)) tagMatches.add(t);
      }
    }
    reasons.push(...Array.from(tagMatches).slice(0, 3));

    recs.push({
      influencer: {
        id: inf.id,
        display_name: inf.display_name,
        bio: inf.bio,
        categories: inf.categories ?? [],
        avatar_url: inf.avatar_url,
        followers_total: inf.followers_total,
        reach_estimate: inf.reach_estimate,
        hire_cost_min: inf.hire_cost_min,
        hire_cost_max: inf.hire_cost_max,
        instagram_handle: inf.instagram_handle,
        tiktok_handle: inf.tiktok_handle,
        youtube_handle: inf.youtube_handle,
      },
      fit_score: score,
      components,
      evidence: {
        best_category: bestCategory,
        cr_on_similar: crOnSimilar,
        volume: totalClicks,
        top_similar_products: similar
          .slice()
          .sort((a, b) => b.similarity - a.similarity)
          .slice(0, 5)
          .map((p) => ({
            product_id: p.product.id,
            name: p.product.name,
            similarity: p.similarity,
            cr: p.cr,
          })),
        match_reasons: Array.from(new Set(reasons)).slice(0, 6),
      },
    });
  }

  recs.sort((a, b) => b.fit_score - a.fit_score);
  return recs.slice(0, topN);
}

// pgvector devuelve un string tipo "[0.1,0.2,...]" o un array, según cliente.
function parseEmbedding(raw: unknown): number[] {
  if (Array.isArray(raw)) return raw.map(Number);
  if (typeof raw === 'string') {
    try {
      const s = raw.trim();
      if (s.startsWith('[')) return JSON.parse(s);
      return s.split(',').map(Number);
    } catch {
      return [];
    }
  }
  return [];
}
