/**
 * INFLU — seed determinístico para demo.
 *
 *  Requiere:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *
 *  Uso:
 *   npm run seed
 *
 *  Nota importante: "botas de cuero" se omite adrede del seed para que la
 *  consulta golden de la demo tenga que razonar por similitud.
 */
import { createClient } from '@supabase/supabase-js';
import { customAlphabet } from 'nanoid';
import { fallbackEmbedding, productEmbeddingInput } from '../lib/ai/embed';

// -------------------------------------------------------------------------
// PRNG determinístico
// -------------------------------------------------------------------------
function mulberry32(seed: number) {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = t;
    r = Math.imul(r ^ (r >>> 15), r | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const randInt = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];
const poisson = (lambda: number) => {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= rand();
  } while (p > L);
  return k - 1;
};

// -------------------------------------------------------------------------
// Config
// -------------------------------------------------------------------------
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SRV_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPA_URL || !SRV_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en el entorno.');
  process.exit(1);
}
const sb = createClient(SUPA_URL, SRV_KEY, { auth: { persistSession: false } });

const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nano = customAlphabet(alphabet, 6);

// -------------------------------------------------------------------------
// Usuarios
// -------------------------------------------------------------------------
interface SeedUser {
  email: string;
  password: string;
  role: 'influencer' | 'company' | 'admin';
  display_name: string;
  bio?: string;
  categories?: string[];
  industry?: string;
}

const USERS: SeedUser[] = [
  { email: 'admin@demo.com', password: 'demo1234', role: 'admin', display_name: 'Admin Demo' },
  { email: 'acme@demo.com', password: 'demo1234', role: 'company', display_name: 'ACME Fashion', industry: 'moda' },
  { email: 'technova@demo.com', password: 'demo1234', role: 'company', display_name: 'TechNova', industry: 'tech' },
  { email: 'glowlab@demo.com', password: 'demo1234', role: 'company', display_name: 'GlowLab', industry: 'belleza' },
  // 15 influencers
  { email: 'amy@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Amy Urban',
    bio: 'Moda urbana premium. Cuero y streetwear con onda.', categories: ['moda', 'lifestyle'] },
  { email: 'juli@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Juli Street',
    bio: 'Streetwear y denim, con foco en marcas locales.', categories: ['moda'] },
  { email: 'martina@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Martina Premium',
    bio: 'Lujo accesible. Perfumes, cuero, joyas.', categories: ['moda', 'belleza'] },
  { email: 'sofi@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Sofi Casual',
    bio: 'Looks diarios: casual, cómodo, aesthetic.', categories: ['moda', 'lifestyle'] },
  { email: 'luca@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Luca Gym',
    bio: 'Entrenamiento, suplementación y bienestar.', categories: ['deportes', 'lifestyle'] },
  { email: 'tomi@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Tomi Running',
    bio: 'Maratonista. Todo lo que corre y mide.', categories: ['deportes'] },
  { email: 'nico@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Nico Tech',
    bio: 'Reviews de gadgets y setup productivo.', categories: ['tech', 'gaming'] },
  { email: 'pablo@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Pablo Dev',
    bio: 'Dev. Herramientas que no odies usar.', categories: ['tech'] },
  { email: 'cata@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Cata Belleza',
    bio: 'Maquillaje editorial y rutinas.', categories: ['belleza', 'moda'] },
  { email: 'vicky@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Vicky Skincare',
    bio: 'Skincare honesta. Tipo de piel: grasa mixta.', categories: ['belleza'] },
  { email: 'santi@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Santi Deco',
    bio: 'Deco minimalista con onda cálida.', categories: ['hogar', 'lifestyle'] },
  { email: 'flor@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Flor Home',
    bio: 'Crafts, cocina y aromaterapia.', categories: ['hogar'] },
  { email: 'mateo@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Mateo Gaming',
    bio: 'Setups gamer y reviews de periféricos.', categories: ['gaming', 'tech'] },
  { email: 'vale@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Vale Traveler',
    bio: 'Viajes slow + gear minimalista.', categories: ['viajes', 'lifestyle'] },
  { email: 'joaco@demo.com', password: 'demo1234', role: 'influencer', display_name: 'Joaco Lifestyle',
    bio: 'Un poco de todo: moda, deco, tech.', categories: ['lifestyle', 'moda'] },
];

// -------------------------------------------------------------------------
// Productos
// -------------------------------------------------------------------------
type Cat = 'moda' | 'tech' | 'belleza' | 'hogar' | 'deportes' | 'lifestyle' | 'gaming' | 'viajes';
type Sty = 'urbano' | 'casual' | 'premium' | 'deportivo' | 'minimalista' | 'romantico' | 'oficina' | 'streetwear';
type Mat = 'cuero' | 'algodon' | 'denim' | 'sintetico' | 'metal' | 'madera' | 'plastico' | 'ceramica' | 'otro';
type PR = 'low' | 'mid' | 'high' | 'luxury';

interface SeedProduct {
  name: string;
  category: Cat;
  style: Sty | null;
  material: Mat | null;
  price_range: PR;
  price_numeric: number;
  tags: string[];
  description: string;
  status?: 'verified' | 'pending';
}

// NOTA: "botas de cuero" se omite adrede. Sí está: camperas de cuero, cinturón, billetera, mochila.
const PRODUCTS: SeedProduct[] = [
  // Moda (12)
  { name: 'Campera de cuero marrón', category: 'moda', style: 'urbano', material: 'cuero', price_range: 'high', price_numeric: 280, tags: ['cuero', 'campera', 'urbano', 'moda'], description: 'Clásica campera de cuero marrón para el día a día.' },
  { name: 'Cinturón de cuero negro', category: 'moda', style: 'premium', material: 'cuero', price_range: 'mid', price_numeric: 65, tags: ['cuero', 'cinturon', 'premium'], description: 'Cinturón de cuero genuino con hebilla metálica.' },
  { name: 'Billetera de cuero bifold', category: 'moda', style: 'premium', material: 'cuero', price_range: 'mid', price_numeric: 80, tags: ['cuero', 'billetera', 'premium'], description: 'Billetera bifold de cuero con compartimientos RFID.' },
  { name: 'Mochila de cuero urbana', category: 'moda', style: 'urbano', material: 'cuero', price_range: 'high', price_numeric: 220, tags: ['cuero', 'mochila', 'urbano'], description: 'Mochila de cuero para laptop de 15".' },
  { name: 'Zapatillas running Pro', category: 'deportes', style: 'deportivo', material: 'sintetico', price_range: 'high', price_numeric: 180, tags: ['running', 'zapatillas', 'deporte'], description: 'Zapatillas para entrenamiento y distancias largas.' },
  { name: 'Zapatillas lifestyle Samba', category: 'moda', style: 'urbano', material: 'sintetico', price_range: 'mid', price_numeric: 110, tags: ['zapatillas', 'urbano', 'streetwear'], description: 'Zapatillas lifestyle ícono del streetwear.' },
  { name: 'Remera básica algodón', category: 'moda', style: 'casual', material: 'algodon', price_range: 'low', price_numeric: 25, tags: ['algodon', 'remera', 'casual'], description: 'Remera 100% algodón peinado.' },
  { name: 'Jean slim denim', category: 'moda', style: 'casual', material: 'denim', price_range: 'mid', price_numeric: 95, tags: ['denim', 'jean', 'casual'], description: 'Jean slim con stretch, lavado medio.' },
  { name: 'Campera denim clásica', category: 'moda', style: 'streetwear', material: 'denim', price_range: 'mid', price_numeric: 120, tags: ['denim', 'campera', 'streetwear'], description: 'Campera de jean clásica trucker.' },
  { name: 'Bolso tote algodón', category: 'moda', style: 'minimalista', material: 'algodon', price_range: 'low', price_numeric: 20, tags: ['algodon', 'tote', 'minimalista'], description: 'Tote bag algodón orgánico.' },
  { name: 'Vestido casual algodón', category: 'moda', style: 'casual', material: 'algodon', price_range: 'mid', price_numeric: 75, tags: ['algodon', 'vestido', 'casual'], description: 'Vestido casual, algodón liviano.' },
  { name: 'Jogger urbano negro', category: 'moda', style: 'urbano', material: 'sintetico', price_range: 'mid', price_numeric: 60, tags: ['urbano', 'jogger', 'streetwear'], description: 'Jogger técnico con bolsillos laterales.' },

  // Tech (8)
  { name: 'Auriculares inalámbricos pro', category: 'tech', style: 'minimalista', material: 'sintetico', price_range: 'high', price_numeric: 220, tags: ['tech', 'audio', 'wireless'], description: 'Cancelación activa de ruido y 30h de batería.' },
  { name: 'Notebook liviana 14"', category: 'tech', style: 'oficina', material: 'metal', price_range: 'luxury', price_numeric: 1100, tags: ['tech', 'notebook', 'trabajo'], description: 'Ultrabook 14" con M2 y 16GB RAM.' },
  { name: 'Mouse gamer RGB', category: 'tech', style: 'deportivo', material: 'plastico', price_range: 'mid', price_numeric: 80, tags: ['tech', 'gaming', 'mouse'], description: 'Mouse gamer 26K DPI.' },
  { name: 'Teclado mecánico TKL', category: 'tech', style: 'minimalista', material: 'plastico', price_range: 'mid', price_numeric: 130, tags: ['tech', 'teclado', 'setup'], description: 'Teclado tenkeyless switches hot-swap.' },
  { name: 'Cámara compacta 4K', category: 'tech', style: 'premium', material: 'metal', price_range: 'high', price_numeric: 480, tags: ['tech', 'camara', 'video'], description: 'Cámara compacta 4K con sensor de 1".' },
  { name: 'Monitor 27" QHD', category: 'tech', style: 'oficina', material: 'plastico', price_range: 'high', price_numeric: 360, tags: ['tech', 'monitor', 'setup'], description: 'Monitor QHD 144Hz IPS.' },
  { name: 'Parlante portátil BT', category: 'tech', style: 'casual', material: 'sintetico', price_range: 'mid', price_numeric: 90, tags: ['tech', 'audio', 'portable'], description: 'Parlante resistente al agua IP67.' },
  { name: 'Smartwatch deportivo', category: 'tech', style: 'deportivo', material: 'sintetico', price_range: 'high', price_numeric: 280, tags: ['tech', 'wearable', 'deporte'], description: 'GPS, HR, sleep tracking.' },

  // Belleza (7)
  { name: 'Perfume premium 100ml', category: 'belleza', style: 'premium', material: null, price_range: 'high', price_numeric: 180, tags: ['fragancia', 'premium', 'belleza'], description: 'Perfume amaderado ámbar.' },
  { name: 'Crema hidratante 50ml', category: 'belleza', style: 'minimalista', material: null, price_range: 'mid', price_numeric: 42, tags: ['skincare', 'hidratacion'], description: 'Crema facial con ácido hialurónico.' },
  { name: 'Serum vitamina C', category: 'belleza', style: 'minimalista', material: null, price_range: 'mid', price_numeric: 35, tags: ['skincare', 'vitamina c'], description: 'Serum iluminador, 15% vitamina C.' },
  { name: 'Labial mate longlasting', category: 'belleza', style: 'romantico', material: null, price_range: 'low', price_numeric: 22, tags: ['maquillaje', 'labial'], description: 'Labial mate larga duración.' },
  { name: 'Paleta de sombras nude', category: 'belleza', style: 'casual', material: null, price_range: 'mid', price_numeric: 55, tags: ['maquillaje', 'sombras', 'nude'], description: 'Paleta 12 tonos nude.' },
  { name: 'Máscara de pestañas volumen', category: 'belleza', style: 'romantico', material: null, price_range: 'low', price_numeric: 25, tags: ['maquillaje', 'pestanas'], description: 'Máscara para volumen extremo.' },
  { name: 'Kit skincare rutina', category: 'belleza', style: 'premium', material: null, price_range: 'high', price_numeric: 150, tags: ['skincare', 'rutina', 'premium'], description: 'Rutina 4 pasos: limpiador, tónico, serum, crema.' },

  // Deportes (6)
  { name: 'Mat de yoga antideslizante', category: 'deportes', style: 'minimalista', material: 'sintetico', price_range: 'mid', price_numeric: 55, tags: ['yoga', 'mat', 'deporte'], description: 'Mat 6mm de espesor.' },
  { name: 'Botella deportiva 1L', category: 'deportes', style: 'deportivo', material: 'metal', price_range: 'low', price_numeric: 28, tags: ['deporte', 'hidratacion'], description: 'Botella acero inoxidable, conserva frío 24h.' },
  { name: 'Mancuernas ajustables', category: 'deportes', style: 'deportivo', material: 'metal', price_range: 'high', price_numeric: 320, tags: ['gym', 'fuerza'], description: 'Mancuernas ajustables 2-24kg.' },
  { name: 'Reloj running GPS', category: 'deportes', style: 'deportivo', material: 'sintetico', price_range: 'high', price_numeric: 300, tags: ['running', 'gps', 'wearable'], description: 'Reloj running con mapa offline.' },
  { name: 'Kit bandas elásticas', category: 'deportes', style: 'deportivo', material: 'sintetico', price_range: 'low', price_numeric: 30, tags: ['bandas', 'fuerza', 'casa'], description: 'Set 5 niveles resistencia.' },
  { name: 'Zapatillas cross-training', category: 'deportes', style: 'deportivo', material: 'sintetico', price_range: 'high', price_numeric: 170, tags: ['zapatillas', 'crossfit'], description: 'Zapatillas estables para gym.' },

  // Hogar (7)
  { name: 'Set sartenes cerámica', category: 'hogar', style: 'minimalista', material: 'ceramica', price_range: 'high', price_numeric: 180, tags: ['cocina', 'sartenes'], description: 'Set 3 sartenes antiadherentes cerámicas.' },
  { name: 'Lámpara de mesa moderna', category: 'hogar', style: 'minimalista', material: 'metal', price_range: 'mid', price_numeric: 90, tags: ['deco', 'lampara'], description: 'Lámpara LED regulable.' },
  { name: 'Almohada memory foam', category: 'hogar', style: 'casual', material: 'sintetico', price_range: 'mid', price_numeric: 65, tags: ['dormir', 'almohada'], description: 'Almohada ergonómica memory foam.' },
  { name: 'Difusor aromaterapia', category: 'hogar', style: 'minimalista', material: 'ceramica', price_range: 'mid', price_numeric: 45, tags: ['aromaterapia', 'deco'], description: 'Difusor ultrasónico con luz cálida.' },
  { name: 'Set de toallas algodón', category: 'hogar', style: 'minimalista', material: 'algodon', price_range: 'mid', price_numeric: 70, tags: ['hogar', 'textil'], description: 'Set 4 toallas algodón egipcio.' },
  { name: 'Organizador modular escritorio', category: 'hogar', style: 'oficina', material: 'madera', price_range: 'low', price_numeric: 28, tags: ['oficina', 'organizador'], description: 'Organizador de bambú.' },
  { name: 'Maceta cerámica minimal', category: 'hogar', style: 'minimalista', material: 'ceramica', price_range: 'low', price_numeric: 18, tags: ['deco', 'plantas'], description: 'Maceta cerámica con plato.' },
];

const PENDING_PRODUCTS: SeedProduct[] = [
  { name: 'Auriculares gaming rosa pastel', category: 'gaming', style: 'streetwear', material: 'plastico', price_range: 'mid', price_numeric: 110, tags: ['gaming', 'audio', 'rosa'], description: 'Auriculares gaming con luces RGB, color rosa pastel.', status: 'pending' },
  { name: 'Cafetera manual v60', category: 'hogar', style: 'minimalista', material: 'ceramica', price_range: 'mid', price_numeric: 55, tags: ['cocina', 'cafe'], description: 'Cafetera tipo v60 para filtrado manual.', status: 'pending' },
  { name: 'Smartwatch kids con GPS', category: 'tech', style: 'casual', material: 'sintetico', price_range: 'mid', price_numeric: 95, tags: ['tech', 'kids', 'gps'], description: 'Smartwatch para chicos con llamadas y GPS.', status: 'pending' },
];

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------
async function upsertUser(u: SeedUser): Promise<string> {
  // Si ya existe, lo buscamos; si no, lo creamos.
  const { data: existing } = await sb.auth.admin.listUsers({ page: 1, perPage: 200 });
  const found = existing?.users.find((x) => x.email === u.email);
  if (found) {
    return found.id;
  }
  const { data, error } = await sb.auth.admin.createUser({
    email: u.email,
    password: u.password,
    email_confirm: true,
    user_metadata: { display_name: u.display_name, role: u.role },
  });
  if (error || !data.user) throw new Error(`createUser ${u.email}: ${error?.message}`);
  return data.user.id;
}

async function updateProfile(userId: string, u: SeedUser) {
  // Métricas declaradas por defecto para influencers (deterministas por nombre)
  let extras: Record<string, unknown> = {};
  if (u.role === 'influencer') {
    const seedHash = u.display_name.split('').reduce((s, ch) => s + ch.charCodeAt(0), 0);
    const r = mulberry32(seedHash + 1);
    const followers = Math.round(8000 + r() * 90000);
    const reach = Math.round(followers * (0.15 + r() * 0.35));
    const minCost = Math.round(80 + r() * 350);
    const maxCost = Math.round(minCost * (1.8 + r() * 1.2));
    const handle = u.email.split('@')[0];
    extras = {
      followers_total: followers,
      reach_estimate: reach,
      hire_cost_min: minCost,
      hire_cost_max: maxCost,
      instagram_handle: `@${handle}`,
      tiktok_handle: r() > 0.4 ? `@${handle}.tk` : null,
      youtube_handle: r() > 0.6 ? `@${handle}` : null,
      location: ['Montevideo, UY', 'Buenos Aires, AR', 'CDMX, MX', 'Madrid, ES'][Math.floor(r() * 4)],
    };
  }

  await sb
    .from('profiles')
    .update({
      role: u.role,
      display_name: u.display_name,
      bio: u.bio ?? null,
      categories: u.categories ?? [],
      industry: u.industry ?? null,
      ...extras,
    })
    .eq('id', userId);
}

// -------------------------------------------------------------------------
// Main
// -------------------------------------------------------------------------
async function main() {
  console.log('→ creando usuarios…');
  const emailToId = new Map<string, SeedUser & { id: string }>();
  for (const u of USERS) {
    const id = await upsertUser(u);
    await updateProfile(id, u);
    emailToId.set(u.email, { ...u, id });
  }

  const influencers = USERS.filter((u) => u.role === 'influencer').map((u) => emailToId.get(u.email)!);

  console.log('→ limpiando productos y datos viejos…');
  await sb.from('conversions').delete().neq('id', 0);
  await sb.from('click_events').delete().neq('id', 0);
  await sb.from('links').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await sb.from('product_embeddings').delete().neq('product_id', '00000000-0000-0000-0000-000000000000');
  await sb.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('→ insertando productos verified…');
  const admin = emailToId.get('admin@demo.com')!;
  const productRows: Array<SeedProduct & { external_url: string; status: 'verified' | 'pending'; submitted_by: string | null; verified_by: string | null; verified_at: string | null }> = [];
  for (const p of PRODUCTS) {
    productRows.push({
      ...p,
      status: 'verified',
      external_url: `https://demo.influ.app/p/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      submitted_by: null,
      verified_by: admin.id,
      verified_at: new Date().toISOString(),
    });
  }
  // algunos pending, propuestos por influencers
  for (const [idx, p] of PENDING_PRODUCTS.entries()) {
    const proposer = influencers[idx % influencers.length];
    productRows.push({
      ...p,
      status: 'pending',
      external_url: `https://demo.influ.app/p/${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      submitted_by: proposer.id,
      verified_by: null,
      verified_at: null,
    });
  }

  const { data: insertedProducts, error: pErr } = await sb
    .from('products')
    .insert(productRows)
    .select('*');
  if (pErr || !insertedProducts) throw pErr ?? new Error('No se insertaron productos');

  const verifiedProducts = insertedProducts.filter((p: any) => p.status === 'verified');
  console.log(`   ${verifiedProducts.length} verified + ${insertedProducts.length - verifiedProducts.length} pending`);

  console.log('→ generando embeddings (fallback determinístico)…');
  const embRows = verifiedProducts.map((p: any) => ({
    product_id: p.id,
    embedding: fallbackEmbedding(productEmbeddingInput(p)) as any,
    updated_at: new Date().toISOString(),
  }));
  const { error: eErr } = await sb.from('product_embeddings').insert(embRows);
  if (eErr) throw eErr;

  console.log('→ creando links (3-5 por influencer, sesgados por afinidad)…');
  const links: Array<{ id: string; influencer_id: string; product_id: string; category: string }> = [];
  for (const inf of influencers) {
    const wantsCats = new Set(inf.categories ?? []);
    // prefer products cuya category matchea; fallback a random
    const scored = verifiedProducts
      .map((p: any) => ({ p, score: wantsCats.has(p.category) ? 2 + rand() : rand() * 0.5 }))
      .sort((a, b) => b.score - a.score);
    const count = randInt(3, 5);
    const chosen = scored.slice(0, count).map((x) => x.p);
    for (const p of chosen) {
      const { data: link, error } = await sb
        .from('links')
        .insert({
          short_code: nano(),
          influencer_id: inf.id,
          product_id: p.id,
          coupon_code: `${inf.display_name.split(' ')[0].toUpperCase()}10`,
        })
        .select('id')
        .single();
      if (error) {
        if (/duplicate|unique/i.test(error.message)) continue;
        throw error;
      }
      links.push({ id: link!.id, influencer_id: inf.id, product_id: p.id, category: p.category });
    }
  }
  console.log(`   ${links.length} links creados`);

  console.log('→ generando clicks (poisson con sesgo por afinidad)…');
  const clickRows: Array<Record<string, unknown>> = [];
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const countries = ['AR', 'MX', 'ES', 'CL', 'UY', 'CO', 'PE'];
  const sources = ['instagram', 'tiktok', 'youtube', 'organic'];

  for (const link of links) {
    const inf = influencers.find((i) => i.id === link.influencer_id)!;
    const affinity = (inf.categories ?? []).includes(link.category) ? 1.8 : 0.6;
    const lambda = 30 * affinity;
    const clicks = Math.min(250, poisson(lambda) + randInt(5, 20));
    for (let i = 0; i < clicks; i++) {
      const offset = rand() * 30 * DAY;
      clickRows.push({
        link_id: link.id,
        ip_hash: `seed-${Math.floor(rand() * 1e6)}`,
        user_agent: 'seed-bot',
        utm_source: pick(sources),
        utm_medium: 'social',
        country: pick(countries),
        created_at: new Date(now - offset).toISOString(),
      });
    }
  }
  // insertar en chunks
  const chunk = <T,>(arr: T[], n: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
    return out;
  };
  for (const c of chunk(clickRows, 500)) {
    const { error } = await sb.from('click_events').insert(c);
    if (error) throw error;
  }
  console.log(`   ${clickRows.length} clicks`);

  console.log('→ generando conversiones (CR realista)…');
  const convRows: Array<Record<string, unknown>> = [];
  // agrupar clicks por link para calcular conversiones como % del lado
  const clicksByLink = new Map<string, number>();
  for (const c of clickRows) clicksByLink.set(c.link_id as string, (clicksByLink.get(c.link_id as string) ?? 0) + 1);
  for (const link of links) {
    const inf = influencers.find((i) => i.id === link.influencer_id)!;
    const affinity = (inf.categories ?? []).includes(link.category) ? 1 : 0.3;
    const baseCr = 0.015 + rand() * 0.06; // 1.5% a 7.5%
    const cr = baseCr * affinity;
    const nClicks = clicksByLink.get(link.id) ?? 0;
    const nConv = Math.min(nClicks, Math.round(nClicks * cr));
    for (let i = 0; i < nConv; i++) {
      const offset = rand() * 30 * DAY;
      const amount = Math.round((20 + rand() * 280) * 100) / 100;
      convRows.push({
        link_id: link.id,
        amount,
        source: rand() < 0.4 ? 'coupon' : 'simulated',
        occurred_at: new Date(now - offset).toISOString(),
      });
    }
  }
  for (const c of chunk(convRows, 500)) {
    const { error } = await sb.from('conversions').insert(c);
    if (error) throw error;
  }
  console.log(`   ${convRows.length} conversiones`);

  console.log('→ refrescando vistas materializadas…');
  await sb.rpc('refresh_stats');

  console.log('\n✓ Seed completo.');
  console.log('\nUsuarios demo:');
  console.log('  admin:     admin@demo.com / demo1234');
  console.log('  empresa:   acme@demo.com / demo1234');
  console.log('  influencer: amy@demo.com / demo1234 (moda/cuero — estrella para el caso golden)');
  console.log('\nCaso golden: como empresa, buscá "botas de cuero premium urbano" en /company/search.');
  console.log('El seed NO tiene botas de cuero, pero sí camperas, cinturones, billeteras y mochila de cuero.');
  console.log('→ Amy, Martina y Juli deberían rankear alto por similitud.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
