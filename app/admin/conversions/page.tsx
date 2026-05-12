import { requireRole } from '@/lib/auth';
import type { LinkRow } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualConversionForm } from './manual-conversion-form';

export default async function AdminConversionsPage() {
  const { supabase } = await requireRole('admin');

  const { data: links } = await supabase
    .from('links')
    .select('id, short_code, coupon_code, products(name), profiles:profiles!links_influencer_id_fkey(display_name)')
    .limit(500);

  const options = (links ?? []).map((l: any) => ({
    id: l.id as string,
    short_code: l.short_code as string,
    label: `${l.profiles?.display_name ?? '?'} → ${l.products?.name ?? '?'} (/r/${l.short_code})`,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cargar conversión manual</h1>
        <p className="text-muted-foreground">
          Registrá una venta atribuida a un link. Útil para casos reportados por la empresa.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Nueva conversión</CardTitle>
          <CardDescription>
            Elegí el link, el monto y una nota opcional. Se guarda con `source=manual`.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ManualConversionForm links={options} />
        </CardContent>
      </Card>
    </div>
  );
}
