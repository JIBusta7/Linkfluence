import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function CompanyDashboard() {
  const { profile, supabase } = await requireRole('company');
  const { data: searches } = await supabase
    .from('company_searches')
    .select('id, query_payload, created_at')
    .eq('company_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hola, {profile.display_name.split(' ')[0]}</h1>
          <p className="text-muted-foreground">
            Encontrá el influencer ideal para tu producto. Nuestra IA razona por similitud cuando no hay
            historial exacto.
          </p>
        </div>
        <Link
          href="/company/search"
          className="text-sm font-medium text-primary hover:underline"
        >
          Nueva búsqueda →
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de búsquedas</CardTitle>
          <CardDescription>Últimas consultas de influencers por producto.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {(!searches || searches.length === 0) ? (
            <p className="p-6 text-sm text-muted-foreground">
              Aún no hiciste búsquedas. Empezá desde{' '}
              <Link href="/company/search" className="font-medium text-primary hover:underline">
                Buscar influencers
              </Link>
              .
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto consultado</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {searches.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.query_payload?.name ?? '—'}</TableCell>
                    <TableCell className="capitalize">{s.query_payload?.category ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(s.created_at).toLocaleString('es-AR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
