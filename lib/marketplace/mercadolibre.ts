/**
 * Cliente mínimo de la API pública de Mercado Libre.
 *
 * No requiere token para Search público. Útil para:
 *   - autocompletar imagen + precio cuando el admin aprueba un producto
 *   - sugerir productos a la empresa cuando hace una búsqueda
 *
 * Sites: MLA (Argentina), MLU (Uruguay), MLM (México), MLB (Brasil), etc.
 */

export const ML_DEFAULT_SITE = process.env.MERCADOLIBRE_SITE || 'MLU';
const ML_BASE = 'https://api.mercadolibre.com';

export interface MLItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  thumbnail: string;
  /** Versión grande (https) — derivada de thumbnail */
  picture: string;
  category_id: string | null;
  condition?: string;
}

interface RawSearchResponse {
  results?: Array<{
    id: string;
    title: string;
    price: number;
    currency_id: string;
    permalink: string;
    thumbnail: string;
    category_id?: string | null;
    condition?: string;
  }>;
}

/**
 * Reemplaza el thumbnail de baja resolución por la versión grande.
 * Mercado Libre devuelve URLs tipo:
 *   http://http2.mlstatic.com/D_NQ_NP_2X_xxx-O.webp
 * El truco es usar `-O.webp` (grande) reemplazando `-I.jpg`/`-V.jpg` que vienen como thumbnail.
 */
function thumbnailToLarge(url: string): string {
  if (!url) return url;
  return url
    .replace(/^http:\/\//, 'https://')
    .replace(/-I(\.|$)/, '-O$1')
    .replace(/-V(\.|$)/, '-O$1');
}

export async function searchML(
  query: string,
  opts: { limit?: number; site?: string } = {},
): Promise<MLItem[]> {
  const site = opts.site || ML_DEFAULT_SITE;
  const limit = Math.min(Math.max(opts.limit ?? 5, 1), 20);
  const url = `${ML_BASE}/sites/${encodeURIComponent(site)}/search?q=${encodeURIComponent(query)}&limit=${limit}`;

  try {
    const res = await fetch(url, {
      // Cache 1 hora — la API tiene rate limit; caching reduce hits
      next: { revalidate: 3600 },
      headers: { accept: 'application/json' },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as RawSearchResponse;
    return (json.results ?? []).map((r) => ({
      id: r.id,
      title: r.title,
      price: r.price,
      currency_id: r.currency_id,
      permalink: r.permalink,
      thumbnail: r.thumbnail,
      picture: thumbnailToLarge(r.thumbnail),
      category_id: r.category_id ?? null,
      condition: r.condition,
    }));
  } catch {
    return [];
  }
}

/** Buscar UN producto y devolver el primer match (o null). */
export async function findFirstML(query: string, site?: string): Promise<MLItem | null> {
  const items = await searchML(query, { limit: 1, site });
  return items[0] ?? null;
}
