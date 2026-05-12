import Link from 'next/link';
import { requireRole } from '@/lib/auth';
import { formatNumber } from '@/lib/utils';
import { KPITile } from '@/components/kpi-tile';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AdminHome() {
  const { supabase } = await requireRole('admin');

  const [usersRes, verifiedRes, pendingRes, linksRes, clicksRes, convsRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'verified'),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('links').select('id', { count: 'exact', head: true }),
    supabase.from('click_events').select('id', { count: 'exact', head: true }),
    supabase.from('conversions').select('id', { count: 'exact', head: true }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel admin</h1>
        <p className="text-muted-foreground">Estado global del sistema.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <KPITile label="Usuarios" value={formatNumber(usersRes.count ?? 0)} />
        <KPITile label="Productos verificados" value={formatNumber(verifiedRes.count ?? 0)} />
        <KPITile label="Productos pendientes" value={formatNumber(pendingRes.count ?? 0)} />
        <KPITile label="Links" value={formatNumber(linksRes.count ?? 0)} />
        <KPITile label="Clicks" value={formatNumber(clicksRes.count ?? 0)} />
        <KPITile label="Conversiones" value={formatNumber(convsRes.count ?? 0)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Verificación de productos</CardTitle>
            <CardDescription>
              {pendingRes.count ?? 0} pendientes esperan tu revisión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/verification" className="font-medium text-primary hover:underline">
              Abrir cola →
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Demo</CardTitle>
            <CardDescription>
              Simulá tráfico y conversiones para que la demo se vea poblada.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/simulate" className="font-medium text-primary hover:underline">
              Simulador →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
