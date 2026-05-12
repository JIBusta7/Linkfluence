import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { linkUrl } from '@/lib/links';
import { formatMoney, formatNumber, formatPercent } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function MyLinksPage() {
  const { profile, supabase } = await requireRole('influencer');

  const { data: links } = await supabase
    .from('links')
    .select('id, short_code, coupon_code, created_at, products(id, name, category)')
    .eq('influencer_id', profile.id)
    .order('created_at', { ascending: false });

  const { data: stats } = await supabase
    .from('link_stats')
    .select('*')
    .eq('influencer_id', profile.id);

  const statsByLink = new Map<string, any>((stats ?? []).map((s: any) => [s.link_id, s]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis links</h1>
        <p className="text-muted-foreground">Cada link es único por producto y acumula métricas propias.</p>
      </div>

      {(!links || links.length === 0) ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin links todavía</CardTitle>
            <CardDescription>
              Entrá al catálogo y generá tu primer link en un click.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/influencer/catalog" className="text-sm font-medium text-primary hover:underline">
              Ir al catálogo →
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Cupón</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">CR</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((l: any) => {
                  const s = statsByLink.get(l.id) ?? { clicks: 0, conversions: 0, cr: 0, revenue: 0 };
                  const url = linkUrl(l.short_code);
                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-medium">{l.products?.name ?? '—'}</TableCell>
                      <TableCell>
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                          /r/{l.short_code}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{l.coupon_code || '—'}</TableCell>
                      <TableCell className="text-right">{formatNumber(s.clicks)}</TableCell>
                      <TableCell className="text-right">{formatPercent(s.cr)}</TableCell>
                      <TableCell className="text-right">{formatMoney(Number(s.revenue))}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
