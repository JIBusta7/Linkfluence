/**
 * Test integration para las 3 capas anti-fraude del endpoint /r/[code].
 * Usa la service role key para inspeccionar click_events directamente.
 */
import { createClient } from '@supabase/supabase-js';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SRV_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const HOST = process.env.TEST_HOST || 'http://localhost:3002';

const sb = createClient(SUPA_URL, SRV_KEY, { auth: { persistSession: false } });

async function getOrCreateTestLink(): Promise<{ short_code: string; link_id: string }> {
  const { data: existing } = await sb
    .from('links')
    .select('id, short_code')
    .limit(1)
    .maybeSingle();
  if (!existing) throw new Error('No hay links en la DB. Corré npm run seed primero.');
  return { short_code: existing.short_code, link_id: existing.id };
}

async function countClicks(linkId: string): Promise<number> {
  const { count } = await sb
    .from('click_events')
    .select('id', { count: 'exact', head: true })
    .eq('link_id', linkId);
  return count ?? 0;
}

async function hit(shortCode: string, userAgent: string, ip: string) {
  const res = await fetch(`${HOST}/r/${shortCode}`, {
    method: 'GET',
    redirect: 'manual',
    headers: {
      'user-agent': userAgent,
      'x-forwarded-for': ip,
    },
  });
  return { status: res.status, location: res.headers.get('location') };
}

function pad(s: string, n: number): string {
  return s + ' '.repeat(Math.max(0, n - s.length));
}

async function main() {
  const { short_code, link_id } = await getOrCreateTestLink();
  console.log(`\nLink de test: /r/${short_code}  (link_id=${link_id})\n`);

  const before = await countClicks(link_id);
  console.log(`Clicks ANTES del test: ${before}\n`);

  const scenarios: Array<{ name: string; ua: string; ip: string; shouldCount: boolean }> = [
    {
      name: 'Mozilla legítimo, IP A',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      ip: '200.1.1.1',
      shouldCount: true,
    },
    {
      name: 'Mozilla legítimo, IP A (duplicado en 30s)',
      ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
      ip: '200.1.1.1',
      shouldCount: false, // Capa 2: rate limit
    },
    {
      name: 'curl/7.85 (bot por UA)',
      ua: 'curl/7.85.0',
      ip: '200.1.1.2',
      shouldCount: false, // Capa 1: bot UA
    },
    {
      name: 'python-requests',
      ua: 'python-requests/2.31.0',
      ip: '200.1.1.3',
      shouldCount: false, // Capa 1
    },
    {
      name: 'Googlebot',
      ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      ip: '200.1.1.4',
      shouldCount: false, // Capa 1
    },
    {
      name: 'Sin user-agent',
      ua: '',
      ip: '200.1.1.5',
      shouldCount: false, // Capa 1 (UA vacío)
    },
    {
      name: 'Mozilla legítimo, IP B (distinta)',
      ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1',
      ip: '200.1.1.6',
      shouldCount: true,
    },
  ];

  console.log(pad('Escenario', 50), pad('HTTP', 6), pad('Δclicks', 10), 'Veredicto');
  console.log('-'.repeat(95));

  let running = before;
  let pass = 0;
  let fail = 0;
  for (const s of scenarios) {
    const { status } = await hit(short_code, s.ua, s.ip);
    // Pequeño delay para que el insert termine antes de contar
    await new Promise((r) => setTimeout(r, 250));
    const after = await countClicks(link_id);
    const delta = after - running;
    const ok = s.shouldCount ? delta === 1 : delta === 0;
    if (ok) pass++; else fail++;
    console.log(
      pad(s.name, 50),
      pad(String(status), 6),
      pad(delta > 0 ? `+${delta}` : '0', 10),
      ok ? '✓' : `✗  (esperaba ${s.shouldCount ? '+1' : '+0'})`,
    );
    running = after;
  }

  console.log('\n─'.repeat(95));
  console.log(`Resultado: ${pass}/${scenarios.length} escenarios OK  ·  Clicks legítimos sumados: ${running - before}`);

  // Cleanup: borramos los clicks de test para no ensuciar las stats
  await sb
    .from('click_events')
    .delete()
    .eq('link_id', link_id)
    .in('ip_hash', await getRecentTestHashes(link_id, before));
  console.log('Cleanup hecho.\n');

  process.exit(fail === 0 ? 0 : 1);
}

async function getRecentTestHashes(linkId: string, before: number): Promise<string[]> {
  // Trae los ip_hash creados después del baseline.
  const { data } = await sb
    .from('click_events')
    .select('id, ip_hash, created_at')
    .eq('link_id', linkId)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []).slice(0, Math.max(0, (data?.length ?? 0))).map((r: any) => r.ip_hash).filter(Boolean);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
