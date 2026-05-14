import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { formatMoney, formatNumber, formatPercent } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPITile } from '@/components/kpi-tile';
import { PerformanceByCategoryChart } from '@/components/charts/performance-by-category';
import { TimeseriesChart } from '@/components/charts/timeseries';

export default async function InfluencerDashboardPage() {
  const { profile, supabase } = await requireRole('influencer');

  const [totalsRes, byCatRes] = await Promise.all([
    supabase.from('influencer_totals').select('*').eq('influencer_id', profile.id).maybeSingle(),
    supabase
      .from('influencer_category_stats')
      .select('category, clicks, conversions, cr, revenue')
      .eq('influencer_id', profile.id),
  ]);

  const totals = totalsRes.data ?? {
    total_links: 0,
    total_clicks: 0,
    total_conversions: 0,
    total_revenue: 0,
    cr_global: 0,
  };

  const byCategory = aggregateByCategory(byCatRes.data ?? []);
  const series = await fetchTimeseries(supabase, profile.id);
  const topProducts = await fetchTopProducts(supabase, profile.id);
  const deviceStats = await fetchDeviceStats(supabase, profile.id);
  const peakHours = await fetchPeakHours(supabase, profile.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Tu performance comercial en un vistazo, {profile.display_name.split(' ')[0]}.
          </p>
        </div>
        <Link
          href="/influencer/catalog"
          className="text-sm font-medium text-primary hover:underline"
        >
          Ir al catálogo →
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <KPITile label="Links activos" value={formatNumber(totals.total_links)} />
        <KPITile label="Clicks totales" value={formatNumber(totals.total_clicks)} />
        <KPITile label="Conversiones" value={formatNumber(totals.total_conversions)} />
        <KPITile
          label="CR global"
          value={formatPercent(totals.cr_global)}
          hint={`Revenue estimado: ${formatMoney(totals.total_revenue)}`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Performance por categoría</CardTitle>
            <CardDescription>CR y volumen en las categorías que más tocás.</CardDescription>
          </CardHeader>
          <CardContent>
            <PerformanceByCategoryChart data={byCategory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos 30 días</CardTitle>
            <CardDescription>Clicks y conversiones diarios.</CardDescription>
          </CardHeader>
          <CardContent>
            <TimeseriesChart data={series} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top productos</CardTitle>
            <CardDescription>Los productos que más tráfico te generaron.</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Todavía no hay clicks. Generá un link desde el catálogo y compartilo.
              </p>
            ) : (
              <ul className="space-y-3">
                {topProducts.map((p: { product_id: string; name: string; clicks: number }, i: number) => (
                  <li
                    key={p.product_id}
                    className="flex items-center justify-between gap-3 border-b pb-2 last:border-none last:pb-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
                        {i + 1}
                      </span>
                      <span className="truncate text-sm font-medium">{p.name}</span>
                    </div>
                    <div className="flex shrink-0 items-baseline gap-2 text-sm">
                      <span className="font-semibold">{formatNumber(p.clicks)}</span>
                      <span className="text-xs text-muted-foreground">clicks</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audiencia</CardTitle>
            <CardDescription>De qué dispositivo y a qué hora te clickean.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Dispositivo
              </div>
              {deviceStats.total === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
              ) : (
                <div className="space-y-2">
                  <DeviceBar label="Mobile" count={deviceStats.mobile} total={deviceStats.total} />
                  <DeviceBar label="Desktop" count={deviceStats.desktop} total={deviceStats.total} />
                  {deviceStats.other > 0 && (
                    <DeviceBar label="Otro" count={deviceStats.other} total={deviceStats.total} />
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
                Hora pico
              </div>
              {peakHours.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin datos todavía.</p>
              ) : (
                <div className="space-y-1">
                  {peakHours.slice(0, 3).map((h) => (
                    <div key={h.hour} className="flex items-baseline justify-between text-sm">
                      <span className="font-medium">
                        {String(h.hour).padStart(2, '0')}:00 – {String(h.hour).padStart(2, '0')}:59
                      </span>
                      <span className="text-muted-foreground">
                        {formatNumber(h.clicks)} clicks
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DeviceBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {pct}% · {formatNumber(count)}
        </span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function aggregateByCategory(
  rows: Array<{ category: string; clicks: number; conversions: number; cr: number; revenue: number }>,
) {
  const map = new Map<string, { clicks: number; conversions: number; revenue: number }>();
  for (const r of rows) {
    const cur = map.get(r.category) ?? { clicks: 0, conversions: 0, revenue: 0 };
    cur.clicks += r.clicks;
    cur.conversions += r.conversions;
    cur.revenue += Number(r.revenue);
    map.set(r.category, cur);
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({
      category,
      clicks: v.clicks,
      conversions: v.conversions,
      revenue: v.revenue,
      cr: v.clicks ? v.conversions / v.clicks : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks);
}

async function fetchTopProducts(supabase: any, influencerId: string) {
  const { data } = await supabase
    .from('link_stats')
    .select('product_id, clicks, products(name)')
    .eq('influencer_id', influencerId)
    .order('clicks', { ascending: false })
    .limit(5);
  return (data ?? [])
    .filter((r: any) => r.clicks > 0)
    .map((r: any) => ({
      product_id: r.product_id,
      name: r.products?.name ?? '—',
      clicks: Number(r.clicks) || 0,
    }));
}

async function fetchDeviceStats(supabase: any, influencerId: string) {
  const { data: links } = await supabase
    .from('links')
    .select('id')
    .eq('influencer_id', influencerId);
  const linkIds = (links ?? []).map((l: any) => l.id);
  if (linkIds.length === 0) return { mobile: 0, desktop: 0, other: 0, total: 0 };

  const { data: events } = await supabase
    .from('click_events')
    .select('user_agent')
    .in('link_id', linkIds);

  let mobile = 0;
  let desktop = 0;
  let other = 0;
  for (const e of events ?? []) {
    const ua = (e.user_agent ?? '').toLowerCase();
    if (!ua) {
      other++;
    } else if (/mobi|android|iphone|ipod|opera mini|iemobile/.test(ua)) {
      mobile++;
    } else if (/windows|macintosh|linux|x11/.test(ua)) {
      desktop++;
    } else {
      other++;
    }
  }
  return { mobile, desktop, other, total: mobile + desktop + other };
}

async function fetchPeakHours(supabase: any, influencerId: string) {
  const { data: links } = await supabase
    .from('links')
    .select('id')
    .eq('influencer_id', influencerId);
  const linkIds = (links ?? []).map((l: any) => l.id);
  if (linkIds.length === 0) return [];

  const { data: events } = await supabase
    .from('click_events')
    .select('created_at')
    .in('link_id', linkIds);

  const byHour = new Map<number, number>();
  for (const e of events ?? []) {
    const h = new Date(e.created_at).getHours();
    byHour.set(h, (byHour.get(h) ?? 0) + 1);
  }
  return Array.from(byHour.entries())
    .map(([hour, clicks]) => ({ hour, clicks }))
    .sort((a, b) => b.clicks - a.clicks);
}

async function fetchTimeseries(supabase: any, influencerId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const { data: links } = await supabase
    .from('links')
    .select('id')
    .eq('influencer_id', influencerId);
  const linkIds = (links ?? []).map((l: any) => l.id);
  if (linkIds.length === 0) return [];

  const [clicksRes, convsRes] = await Promise.all([
    supabase
      .from('click_events')
      .select('created_at')
      .in('link_id', linkIds)
      .gte('created_at', since.toISOString()),
    supabase
      .from('conversions')
      .select('occurred_at')
      .in('link_id', linkIds)
      .gte('occurred_at', since.toISOString()),
  ]);

  const byDay = new Map<string, { date: string; clicks: number; conversions: number }>();
  const touch = (date: string) => {
    if (!byDay.has(date)) byDay.set(date, { date, clicks: 0, conversions: 0 });
    return byDay.get(date)!;
  };

  for (const c of clicksRes.data ?? []) touch(c.created_at.slice(0, 10)).clicks++;
  for (const c of convsRes.data ?? []) touch(c.occurred_at.slice(0, 10)).conversions++;

  return Array.from(byDay.values()).sort((a, b) => (a.date < b.date ? -1 : 1));
}
