import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/server';

// Nota: usamos node runtime para poder usar service role key.
// Para producción pura con latencia mínima se podría mover a edge con una RPC.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  // Registrar click. Importante: hacemos await antes del redirect porque en
  // serverless (Vercel) la función se congela al devolver la respuesta y un
  // insert "fire and forget" se cancela. ~50ms extra de latencia a cambio de
  // que la estadística quede registrada de verdad.
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '';
  const ipHash = ip ? await sha256(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '')) : null;
  const url = request.nextUrl;

  const { error: insertErr } = await supabase.from('click_events').insert({
    link_id: (link as any).id,
    ip_hash: ipHash,
    user_agent: request.headers.get('user-agent'),
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
