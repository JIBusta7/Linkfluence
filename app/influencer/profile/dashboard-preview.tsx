import { formatMoney, formatNumber, formatPercent } from '@/lib/utils';

interface Totals {
  total_links: number;
  total_clicks: number;
  total_conversions: number;
  cr_global: number;
  total_revenue: number;
}

export function DashboardPreview({ totals }: { totals: Totals | null }) {
  const t = totals ?? { total_links: 0, total_clicks: 0, total_conversions: 0, cr_global: 0, total_revenue: 0 };
  const items = [
    { label: 'Links', value: formatNumber(t.total_links) },
    { label: 'Clicks', value: formatNumber(t.total_clicks) },
    { label: 'Conversiones', value: formatNumber(t.total_conversions) },
    { label: 'CR global', value: formatPercent(t.cr_global) },
    { label: 'Revenue estimado', value: formatMoney(t.total_revenue) },
  ];
  return (
    <ul className="divide-y text-sm">
      {items.map((i) => (
        <li key={i.label} className="flex items-center justify-between py-2">
          <span className="text-muted-foreground">{i.label}</span>
          <span className="font-semibold">{i.value}</span>
        </li>
      ))}
    </ul>
  );
}
