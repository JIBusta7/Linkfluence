import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Nota: usamos node runtime para poder usar service role key.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ── Anti-fraude ─────────────────────────────────────────────────────────
// Patrones de user agents conocidos de bots, scrapers y librerías HTTP.
// Bloquean acceso anónimo de cosas como curl/wget/python-requests y
// crawlers como GoogleBot. Los seguimos redirigiendo (no rompemos nada)
// pero no contamos el click en las estadísticas.
const BOT_UA_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /headless/i,
  /phantomjs/i,
  /puppeteer/i,
  /playwright/i,
  /selenium/i,
  /^curl\//i,
  /^wget\//i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /java\//i,
  /libwww/i,
  /lwp-/i,
  /node-fetch/i,
  /axios\//i,
  /okhttp/i,
];

function isBotUserAgent(ua: string | null): boolean {
  if (!ua) return true; // sin UA es sospechoso → no contar
  return BOT_UA_PATTERNS.some((re) => re.test(ua));
}

// Ventana de rate limit: si el mismo ip_hash clickeó este link
// hace menos de RATE_LIMIT_SECONDS, no contamos el nuevo click.
const RATE_LIMIT_SECONDS = 30;

async function sha256(text: string): Promise<string> {
  const enc = new TextEncoder().encode(text);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function GET(request: NextRequest, context: { params: Promise<{ code: string }> }) {
  const { code } = await context.params;
  if (!code || code.length > 16) {
    return new NextResponse('Link inválido', { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: link, error } = await supabase
    .from('links')
    .select('id, external_url:products(external_url)')
    .eq('short_code', code)
    .maybeSingle();

  if (error || !link) {
    return new NextResponse('Link no encontrado', { status: 404 });
  }

  const externalUrl: string | undefined = (link as any).external_url?.external_url;
  if (!externalUrl) {
    return new NextResponse('Destino inválido', { status: 404 });
  }

  const linkId = (link as any).id as string;
  const userAgent = request.headers.get('user-agent');

  // ── Capa 1: filtrar bots por user agent ────────────────────────────
  // Si es bot, redirigimos pero NO contamos el click. El bot llega a
  // su destino, pero no infla las estadísticas del influencer.
  if (isBotUserAgent(userAgent)) {
    return NextResponse.redirect(externalUrl, { status: 302 });
  }

  // ── Capa 2: rate limit por ip_hash ─────────────────────────────────
  // El mismo dispositivo no puede inflar clicks haciendo F5 en bucle:
  // solo cuenta 1 click cada RATE_LIMIT_SECONDS segundos.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ipHash = ip ? await sha256(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')) : null;

  if (ipHash) {
    const since = new Date(Date.now() - RATE_LIMIT_SECONDS * 1000).toISOString();
    const { count } = await supabase
      .from('click_events')
      .select('id', { count: 'exact', head: true })
      .eq('link_id', linkId)
      .eq('ip_hash', ipHash)
      .gte('created_at', since);

    if ((count ?? 0) > 0) {
      // Click duplicado en ventana — redirigimos sin contar.
      return NextResponse.redirect(externalUrl, { status: 302 });
    }
  }

  // ── Insertar el click legítimo ──────────────────────────────────────
  const url = request.nextUrl;
  const { error: insertErr } = await supabase.from('click_events').insert({
    link_id: linkId,
    ip_hash: ipHash,
    user_agent: userAgent,
    referer: request.headers.get('referer'),
    utm_source: url.searchParams.get('utm_source'),
    utm_medium: url.searchParams.get('utm_medium'),
    utm_campaign: url.searchParams.get('utm_campaign'),
    country: request.headers.get('x-vercel-ip-country'),
  });
  if (insertErr) {
    console.error('click_events insert failed', insertErr);
  }

  return NextResponse.redirect(externalUrl, { status: 302 });
}
