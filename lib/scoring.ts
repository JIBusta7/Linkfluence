import type { Product } from './types';
import { CATEGORIES, type Category, categoryMatch, priceRangeProximity } from './taxonomy';

// =========================================================================
// similitud entre productos
// =========================================================================

export function cosine(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a.map((s) => s.toLowerCase()));
  const setB = new Set(b.map((s) => s.toLowerCase()));
  let inter = 0;
  setA.forEach((x) => {
    if (setB.has(x)) inter++;
  });
  const union = setA.size + setB.size - inter;
  return union === 0 ? 0 : inter / union;
}

/**
 * Score combinado de similitud entre dos productos.
 * Requiere el coseno ya calculado (vía pgvector en DB o js).
 */
export function productSimilarity(
  a: Pick<Product, 'category' | 'price_range' | 'tags'>,
  b: Pick<Product, 'category' | 'price_range' | 'tags'>,
  embeddingCosine: number,
): number {
  const sem = Math.max(0, Math.min(1, embeddingCosine));
  const jac = jaccard(a.tags, b.tags);
  const cat = a.category === b.category ? 1 : 0;
  const pr = priceRangeProximity(a.price_range, b.price_range);
  return 0.6 * sem + 0.25 * jac + 0.1 * cat + 0.05 * pr;
}

// =========================================================================
// fit score influencer × producto
// =========================================================================

export const FIT_SCORE_WEIGHTS = {
  exact_perf: 0.35,
  similar_perf: 0.3,
  category_match: 0.15,
  style_match: 0.08,
  price_match: 0.05,
  volume_confidence: 0.07,
} as const;

export interface FitComponents {
  exact_perf: number;
  similar_perf: number;
  category_match: number;
  style_match: number;
  price_match: number;
  volume_confidence: number;
}

export function fitScore(c: FitComponents): number {
  const w = FIT_SCORE_WEIGHTS;
  const raw =
    w.exact_perf * clamp01(c.exact_perf) +
    w.similar_perf * clamp01(c.similar_perf) +
    w.category_match * clamp01(c.category_match) +
    w.style_match * clamp01(c.style_match) +
    w.price_match * clamp01(c.price_match) +
    w.volume_confidence * clamp01(c.volume_confidence);
  return Math.round(raw * 1000) / 10; // 0-100 con 1 decimal
}

function clamp01(x: number): number {
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(1, x));
}

// =========================================================================
// componentes
// =========================================================================

export interface PastProductStats {
  product: Pick<Product, 'id' | 'name' | 'category' | 'style' | 'material' | 'price_range' | 'tags'>;
  clicks: number;
  conversions: number;
  cr: number;
}

/**
 * exact_perf: si el influencer promocionó el mismo producto (o una combinación
 * exacta de categoría+estilo+material), devuelve su CR normalizado.
 */
export function exactPerf(target: Product, past: PastProductStats[], maxCrGlobal: number): number {
  if (maxCrGlobal <= 0) return 0;
  const exact = past.find(
    (p) =>
      p.product.id === target.id ||
      (p.product.category === target.category &&
        p.product.style === target.style &&
        p.product.material === target.material),
  );
  if (!exact || exact.clicks < 5) return 0;
  return clamp01(exact.cr / maxCrGlobal);
}

/**
 * similar_perf: Σ (sim(target, Pj) * cr(I, Pj)) / Σ sim
 * Usa un score de similitud ya calculado por producto pasado.
 */
export function similarPerf(
  past: Array<PastProductStats & { similarity: number }>,
  maxCrGlobal: number,
): number {
  if (maxCrGlobal <= 0) return 0;
  const filtered = past.filter((p) => p.similarity > 0.3 && p.clicks >= 3);
  if (filtered.length === 0) return 0;
  let num = 0;
  let den = 0;
  for (const p of filtered) {
    num += p.similarity * p.cr;
    den += p.similarity;
  }
  if (den === 0) return 0;
  return clamp01(num / den / maxCrGlobal);
}

export function categoryMatchScore(influencerCategories: string[], target: Category): number {
  return categoryMatch(influencerCategories, target);
}

export function styleMatchScore(pastStyles: Array<string | null>, targetStyle: string | null): number {
  if (!targetStyle) return 0.5;
  const freq = new Map<string, number>();
  for (const s of pastStyles) {
    if (!s) continue;
    freq.set(s, (freq.get(s) ?? 0) + 1);
  }
  const total = Array.from(freq.values()).reduce((a, b) => a + b, 0);
  if (total === 0) return 0;
  return clamp01((freq.get(targetStyle) ?? 0) / total);
}

export function priceMatchScore(
  pastPriceRanges: string[],
  targetPriceRange: string,
): number {
  if (pastPriceRanges.length === 0) return 0;
  const matches = pastPriceRanges.filter((p) => p === targetPriceRange).length;
  return clamp01(matches / pastPriceRanges.length);
}

export function volumeConfidence(totalClicks: number): number {
  return clamp01(totalClicks / 50);
}

// helper para UI: reconocer top categoría de un influencer
export function topCategory(byCategory: Record<string, { cr: number; clicks: number }>): Category | null {
  let best: Category | null = null;
  let bestScore = -Infinity;
  for (const cat of CATEGORIES) {
    const s = byCategory[cat];
    if (!s || s.clicks < 10) continue;
    const score = s.cr;
    if (score > bestScore) {
      best = cat;
      bestScore = score;
    }
  }
  return best;
}
