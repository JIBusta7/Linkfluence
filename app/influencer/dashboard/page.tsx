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
