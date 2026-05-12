import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import type { Product } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function MySubmissionsPage() {
  const { profile, supabase } = await requireRole('influencer');

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .eq('submitted_by', profile.id)
    .order('created_at', { ascending: false })
    .returns<Product[]>();

  const rows = products ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis productos propuestos</h1>
        <p className="text-muted-foreground">
          Estado de los productos que enviaste al catálogo global.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Aún no propusiste productos</CardTitle>
            <CardDescription>
              Cuando no encuentres lo que buscás en el catálogo, agregalo desde acá.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link
              href="/influencer/catalog/new"
              className="text-sm font-medium text-primary hover:underline"
            >
              Proponer un producto →
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
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Notas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      {p.status === 'verified' ? (
                        <Link href={`/influencer/catalog/${p.id}`} className="text-primary hover:underline">
                          {p.name}
                        </Link>
                      ) : (
                        p.name
                      )}
                    </TableCell>
                    <TableCell className="capitalize">{p.category}</TableCell>
                    <TableCell>
                      <StatusBadge status={p.status} />
                    </TableCell>
                    <TableCell className="max-w-sm text-sm text-muted-foreground">
                      {p.status === 'rejected' ? (
                        p.rejection_reason || '—'
                      ) : p.status === 'verified' ? (
                        'Podés generar tu link desde el catálogo.'
                      ) : (
                        'En cola de revisión.'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: Product['status'] }) {
  if (status === 'verified') return <Badge variant="success">Verificado</Badge>;
  if (status === 'rejected') return <Badge variant="destructive">Rechazado</Badge>;
  return <Badge variant="warning">Pendiente</Badge>;
}
