export const CATEGORIES = [
  'moda',
  'tech',
  'belleza',
  'hogar',
  'deportes',
  'lifestyle',
  'gaming',
  'viajes',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const STYLES = [
  'urbano',
  'casual',
  'premium',
  'deportivo',
  'minimalista',
  'romantico',
  'oficina',
  'streetwear',
] as const;
export type Style = (typeof STYLES)[number];

export const MATERIALS = [
  'cuero',
  'algodon',
  'denim',
  'sintetico',
  'metal',
  'madera',
  'plastico',
  'ceramica',
  'otro',
] as const;
export type Material = (typeof MATERIALS)[number];

export const PRICE_RANGES = ['low', 'mid', 'high', 'luxury'] as const;
export type PriceRange = (typeof PRICE_RANGES)[number];

export const PRICE_RANGE_LABELS: Record<PriceRange, string> = {
  low: 'Económico (<$30)',
  mid: 'Medio ($30–$150)',
  high: 'Alto ($150–$500)',
  luxury: 'Lujo (>$500)',
};

// categorías adyacentes para category_match parcial
export const CATEGORY_NEIGHBORS: Record<Category, Category[]> = {
  moda: ['lifestyle', 'belleza'],
  tech: ['gaming'],
  belleza: ['moda', 'lifestyle'],
  hogar: ['lifestyle'],
  deportes: ['lifestyle', 'moda'],
  lifestyle: ['moda', 'belleza', 'hogar'],
  gaming: ['tech'],
  viajes: ['lifestyle'],
};

export function priceRangeProximity(a: PriceRange, b: PriceRange): number {
  const idx = PRICE_RANGES.indexOf(a);
  const idy = PRICE_RANGES.indexOf(b);
  const dist = Math.abs(idx - idy);
  return Math.max(0, 1 - dist / 3);
}

export function categoryMatch(influencerCategories: string[], target: Category): number {
  if (influencerCategories.includes(target)) return 1;
  const neighbors = CATEGORY_NEIGHBORS[target] ?? [];
  if (influencerCategories.some((c) => neighbors.includes(c as Category))) return 0.5;
  return 0;
}

export function priceNumericToRange(price: number | null | undefined): PriceRange {
  if (price == null) return 'mid';
  if (price < 30) return 'low';
  if (price < 150) return 'mid';
  if (price < 500) return 'high';
  return 'luxury';
}
