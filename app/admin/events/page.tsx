import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatMoney } from '@/lib/utils';

export default async function AdminEventsPage() {
  const { supabase } = await requireRole('admin');

  const [clicksRes, convsRes] = await Promise.all([
    supabase
      .from('click_events')
      .select('id, link_id, created_at, utm_source, country, links(short_code, profiles:profiles!links_influencer_id_fkey(display_name))')
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('conversions')
      .select('id, link_id, amount, source, occurred_at, links(short_code, profiles:profiles!links_influencer_id_fkey(display_name))')
      .order('occurred_at', { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Eventos</h1>

      <Card>
        <CardHeader>
          <CardTitle>Últimos clicks</CardTitle>
          <CardDescription>50 más recientes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Short code</TableHead>
                <TableHead>UTM source</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Cuándo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(clicksRes.data ?? []).map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell>{e.links?.profiles?.display_name ?? '—'}</TableCell>
                  <TableCell>/r/{e.links?.short_code ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.utm_source ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{e.country ?? '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(e.created_at).toLocaleString('es-AR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Últimas conversiones</CardTitle>
          <CardDescription>50 más recientes.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Short code</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fuente</TableHead>
                <TableHead>Cuándo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(convsRes.data ?? []).map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell>{e.links?.profiles?.display_name ?? '—'}</TableCell>
                  <TableCell>/r/{e.links?.short_code ?? '—'}</TableCell>
                  <TableCell>{formatMoney(Number(e.amount))}</TableCell>
                  <TableCell className="capitalize">{e.source}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(e.occurred_at).toLocaleString('es-AR')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
