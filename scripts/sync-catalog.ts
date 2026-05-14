/**
 * Sincroniza el catálogo con productos reales desde dos fuentes posibles:
 *
 *   1) Mercado Libre Uruguay (MLU) — si MELI_ACCESS_TOKEN está configurado.
 *      Mercado Libre cerró su API pública en 2024-2025: ahora cualquier llamada
 *      a /sites/MLU/search devuelve 403 sin un access_token OAuth2. Para
 *      conseguir uno hay que registrar una app en
 *      https://developers.mercadolibre.com.uy y completar el flujo OAuth.
 *
 *   2) DummyJSON (https://dummyjson.com) — fallback público sin auth. Devuelve
 *      productos reales con imágenes HD y precios en USD. Para que el click
 *      del influencer lleve a algo accionable, el external_url apunta a una
 *      búsqueda real en listado.mercadolibre.com.uy con el slug de la
 *      categoría — así el usuario final ve productos reales en Mercado Libre.
 *
 * Uso:
 *   npm run sync:catalog          # default → DummyJSON si no hay token
 *   MELI_ACCESS_TOKEN=xxx npm run sync:catalog   # fuerza Mercado Libre
 *
 * Requiere:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 * El script es idempotente: borra los productos importados previamente
 * (marcados con tag 'external') y reinserta. No toca tus productos manuales.
 */
import { createClient } from '@supabase/supabase-js';
import { fallbackEmbedding, productEmbeddingInput } from '../lib/ai/embed';
import { priceNumericToRange, type Category, type Material, type Style } from '../lib/taxonomy';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SRV_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SRV_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local');
  process.exit(1);
}
const sb = createClient(SUPA_URL, SRV_KEY, { auth: { persistSession: false } });

const ML_SITE = 'MLU';
const ML_SEARCH_HOST = 'https://listado.mercadolibre.com.uy';
const EXTERNAL_TAG = 'external';
const UYU_PER_USD = 40;

// -------------------------------------------------------------------------
// Tipos comunes
// -------------------------------------------------------------------------
interface CatalogItem {
  name: string;
  description: string | null;
  image_url: string | null;
  external_url: string;
  price_usd: number;
  category: Category;
  style: Style | null;
  material: Material | null;
  tags: string[];
}

// -------------------------------------------------------------------------
// Fuente A: Mercado Libre (requiere OAuth2)
// -------------------------------------------------------------------------
interface MeliSearch {
  query: string;
  category: Category;
  style?: Style;
  material?: Material;
}

const ML_SEARCHES: MeliSearch[] = [
  { query: 'remera hombre', category: 'moda', style: 'casual' },
  { query: 'zapatillas urbanas', category: 'moda', style: 'urbano' },
  { query: 'campera de cuero', category: 'moda', style: 'streetwear', material: 'cuero' },
  { query: 'jean mujer', category: 'moda', style: 'casual', material: 'denim' },
  { query: 'celular samsung', category: 'tech' },
  { query: 'auriculares bluetooth', category: 'tech' },
  { query: 'notebook', category: 'tech' },
  { query: 'smartwatch', category: 'tech' },
  { query: 'perfume mujer', category: 'belleza' },
  { query: 'crema facial', category: 'belleza' },
  { query: 'cafetera', category: 'hogar' },
  { query: 'lampara mesa', category: 'hogar' },
  { query: 'pelota futbol', category: 'deportes', style: 'deportivo' },
  { query: 'mancuernas', category: 'deportes', style: 'deportivo' },
  { query: 'lentes de sol', category: 'lifestyle' },
  { query: 'mochila urbana', category: 'lifestyle' },
  { query: 'playstation 5', category: 'gaming' },
  { query: 'auriculares gamer', category: 'gaming' },
  { query: 'valija', category: 'viajes' },
  { query: 'mochila viaje', category: 'viajes' },
];

interface MeliItem {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  permalink: string;
  thumbnail: string;
}

async function fetchFromMercadoLibre(token: string): Promise<CatalogItem[]> {
  const items: CatalogItem[] = [];
  const seen = new Set<string>();
  for (const s of ML_SEARCHES) {
    const url = `https://api.mercadolibre.com/sites/${ML_SITE}/search?q=${encodeURIComponent(s.query)}&limit=8&condition=new`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    });
    if (!res.ok) {
      console.warn(`   ⚠ ML "${s.query}": HTTP ${res.status}`);
      continue;
    }
    const json = (await res.json()) as { results?: MeliItem[] };
    const results = json.results ?? [];
    console.log(`   ML ${s.category.padEnd(10)} | ${s.query.padEnd(28)} → ${results.length}`);
    for (const it of results) {
      if (!it.permalink || !it.title || seen.has(it.permalink)) continue;
      seen.add(it.permalink);
      const priceUSD =
        it.currency_id === 'USD' ? it.price : Math.round(it.price / UYU_PER_USD);
      items.push({
        name: it.title.slice(0, 200),
        description: null,
        image_url: upgradeImage(it.thumbnail),
        external_url: it.permalink,
        price_usd: priceUSD,
        category: s.category,
        style: s.style ?? null,
        material: s.material ?? null,
        tags: [EXTERNAL_TAG, 'meli', s.query.replace(/\s+/g, '-')],
      });
    }
  }
  return items;
}

function upgradeImage(thumb: string | null | undefined): string | null {
  if (!thumb) return null;
  return thumb.replace(/-I\.(jpg|jpeg|png|webp)$/i, '-O.$1').replace(/^http:/, 'https:');
}

// -------------------------------------------------------------------------
// Fuente B: DummyJSON (fallback público, sin auth)
// -------------------------------------------------------------------------
// Mapeo de cada categoría de DummyJSON a (categoría local, query ES en ML)
const DUMMY_CATEGORIES: Array<{
  slug: string;
  category: Category;
  style?: Style;
  material?: Material;
  esQuery: string;
}> = [
  { slug: 'beauty', category: 'belleza', esQuery: 'maquillaje' },
  { slug: 'fragrances', category: 'belleza', esQuery: 'perfume' },
  { slug: 'skin-care', category: 'belleza', esQuery: 'crema-facial' },
  { slug: 'furniture', category: 'hogar', material: 'madera', esQuery: 'mueble' },
  { slug: 'home-decoration', category: 'hogar', esQuery: 'decoracion-living' },
  { slug: 'kitchen-accessories', category: 'hogar', esQuery: 'accesorio-cocina' },
  { slug: 'laptops', category: 'tech', esQuery: 'notebook' },
  { slug: 'smartphones', category: 'tech', esQuery: 'celular' },
  { slug: 'tablets', category: 'tech', esQuery: 'tablet' },
  { slug: 'mobile-accessories', category: 'tech', esQuery: 'accesorio-celular' },
  { slug: 'mens-shirts', category: 'moda', style: 'casual', esQuery: 'camisa-hombre' },
  { slug: 'mens-shoes', category: 'moda', style: 'urbano', esQuery: 'zapato-hombre' },
  { slug: 'mens-watches', category: 'moda', style: 'premium', esQuery: 'reloj-hombre' },
  { slug: 'tops', category: 'moda', style: 'casual', esQuery: 'remera-mujer' },
  { slug: 'womens-bags', category: 'moda', material: 'cuero', esQuery: 'cartera-mujer' },
  { slug: 'womens-dresses', category: 'moda', style: 'premium', esQuery: 'vestido-mujer' },
  { slug: 'womens-jewellery', category: 'moda', style: 'premium', esQuery: 'joya-mujer' },
  { slug: 'womens-shoes', category: 'moda', style: 'urbano', esQuery: 'zapato-mujer' },
  { slug: 'womens-watches', category: 'moda', style: 'premium', esQuery: 'reloj-mujer' },
  { slug: 'sports-accessories', category: 'deportes', style: 'deportivo', esQuery: 'deportes' },
  { slug: 'sunglasses', category: 'lifestyle', esQuery: 'lentes-de-sol' },
];

interface DummyProduct {
  id: number;
  title: string;
  description: string;
  category: string;
  price: number; // USD
  thumbnail: string;
  images?: string[];
  tags?: string[];
  brand?: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // saca acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchFromDummyJson(): Promise<CatalogItem[]> {
  const items: CatalogItem[] = [];
  for (const c of DUMMY_CATEGORIES) {
    const url = `https://dummyjson.com/products/category/${c.slug}?limit=10`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) {
      console.warn(`   ⚠ DummyJSON "${c.slug}": HTTP ${res.status}`);
      continue;
    }
    const json = (await res.json()) as { products?: DummyProduct[] };
    const products = json.products ?? [];
    console.log(`   DJ ${c.category.padEnd(10)} | ${c.slug.padEnd(22)} → ${products.length}`);
    for (const p of products) {
      // external_url: usamos el slug del TÍTULO del producto en lugar del de
      // la categoría. Así al hacer click el usuario llega a resultados
      // específicos de ese modelo en Mercado Libre (ej:
      // "Samsung Galaxy S22 Ultra" → listado.mercadolibre.com.uy/samsung-galaxy-s22-ultra).
      const titleSlug = slugify(p.title) || c.esQuery;
      const externalUrl = `${ML_SEARCH_HOST}/${titleSlug}`;
      const cleanImg = (p.images?.[0] ?? p.thumbnail ?? '').replace(/^http:/, 'https:');
      items.push({
        name: p.title.slice(0, 200),
        description: (p.description ?? '').slice(0, 500) || null,
        image_url: cleanImg || null,
        external_url: externalUrl,
        price_usd: Math.round(p.price),
        category: c.category,
        style: c.style ?? null,
        material: c.material ?? null,
        tags: [
          EXTERNAL_TAG,
          'dummyjson',
          c.slug,
          ...(p.tags ?? []).slice(0, 5),
        ],
      });
    }
  }
  return items;
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------
async function main() {
  const token = process.env.MELI_ACCESS_TOKEN;
  let items: CatalogItem[] = [];
  let source = '';

  if (token) {
    console.log('→ usando Mercado Libre Uruguay (token detectado)');
    try {
      items = await fetchFromMercadoLibre(token);
      source = 'Mercado Libre';
    } catch (err) {
      console.warn('Mercado Libre falló:', err);
    }
  }

  if (items.length === 0) {
    if (token) {
      console.log('→ Mercado Libre devolvió 0 ítems, cayendo en DummyJSON');
    } else {
      console.log(
        '→ usando DummyJSON (configurá MELI_ACCESS_TOKEN para usar Mercado Libre)',
      );
    }
    items = await fetchFromDummyJson();
    source = 'DummyJSON';
  }

  if (items.length === 0) {
    console.error('✗ Ninguna fuente devolvió ítems. Saliendo.');
    process.exit(1);
  }

  // verified_by → admin si existe
  const { data: adminProfile } = await sb
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1)
    .maybeSingle();
  const adminId: string | null = adminProfile?.id ?? null;

  // Limpiar imports externos previos (sin tocar productos manuales)
  console.log('→ limpiando catálogo importado anterior…');
  const { data: previous } = await sb
    .from('products')
    .select('id')
    .contains('tags', [EXTERNAL_TAG]);
  if (previous && previous.length > 0) {
    const ids = previous.map((r) => r.id);
    await sb.from('product_embeddings').delete().in('product_id', ids);
    await sb.from('products').delete().in('id', ids);
    console.log(`   eliminados ${ids.length}`);
  }

  // Dedupe por external_url
  const seen = new Set<string>();
  const rows = items
    .filter((it) => {
      if (seen.has(it.external_url + '|' + it.name)) return false;
      seen.add(it.external_url + '|' + it.name);
      return true;
    })
    .map((it) => ({
      name: it.name,
      external_url: it.external_url,
      image_url: it.image_url,
      category: it.category,
      style: it.style,
      material: it.material,
      price_range: priceNumericToRange(it.price_usd),
      price_numeric: it.price_usd,
      tags: it.tags,
      description: it.description,
      status: 'verified' as const,
      submitted_by: null,
      verified_by: adminId,
      verified_at: new Date().toISOString(),
    }));

  console.log(`→ insertando ${rows.length} productos en Supabase (fuente: ${source})…`);
  const { data: inserted, error: pErr } = await sb
    .from('products')
    .insert(rows)
    .select('id, name, category, style, material, description, tags');
  if (pErr || !inserted) throw pErr ?? new Error('No se insertaron productos');

  console.log('→ generando embeddings (fallback determinístico)…');
  const embRows = inserted.map(
    (p: { id: string } & Parameters<typeof productEmbeddingInput>[0]) => ({
      product_id: p.id,
      embedding: fallbackEmbedding(productEmbeddingInput(p)) as unknown as number[],
      updated_at: new Date().toISOString(),
    }),
  );
  const { error: eErr } = await sb.from('product_embeddings').insert(embRows);
  if (eErr) throw eErr;

  console.log(`✓ ${inserted.length} productos importados desde ${source}.`);
}

main().catch((err) => {
  console.error('✗ Error:', err);
  process.exit(1);
});
