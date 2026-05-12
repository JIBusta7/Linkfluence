import Link from 'next/link';
import { LayoutDashboard } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProfileEditor } from './profile-editor';
import { DashboardPreview } from './dashboard-preview';

export default async function InfluencerProfilePage() {
  const { profile, supabase } = await requireRole('influencer');

  // Mini preview de stats para mostrar al lado del perfil (acceso secundario al dashboard)
  const { data: totals } = await supabase
    .from('influencer_totals')
    .select('total_links, total_clicks, total_conversions, cr_global, total_revenue')
    .eq('influencer_id', profile.id)
    .maybeSingle();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">
          Editá tus datos. Esta info la usan las empresas para decidir si trabajan con vos.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Información personal</CardTitle>
            <CardDescription>Datos públicos que ven empresas y administradores.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileEditor profile={profile} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Tu performance</CardTitle>
                <Link
                  href="/influencer/dashboard"
                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                >
                  <LayoutDashboard className="h-3 w-3" /> Ver dashboard
                </Link>
              </div>
              <CardDescription>Resumen rápido de tus métricas globales.</CardDescription>
            </CardHeader>
            <CardContent>
              <DashboardPreview totals={totals ?? null} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
