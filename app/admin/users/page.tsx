import { requireRole } from '@/lib/auth';
import type { Profile } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default async function AdminUsersPage() {
  const { supabase } = await requireRole('admin');
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .returns<Profile[]>();

  const rows = data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Usuarios</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Categorías / industria</TableHead>
                <TableHead>Creado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.display_name}</TableCell>
                  <TableCell>
                    <Badge variant={p.role === 'admin' ? 'destructive' : p.role === 'company' ? 'secondary' : 'default'}>
                      {p.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {p.role === 'company'
                      ? p.industry ?? '—'
                      : (p.categories ?? []).join(', ') || '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(p.created_at).toLocaleDateString('es-AR')}
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
