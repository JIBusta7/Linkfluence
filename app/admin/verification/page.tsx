import { ExternalLink } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import type { Product } from '@/lib/types';
import { PRICE_RANGE_LABELS } from '@/lib/taxonomy';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductImage } from '@/components/product-image';
import { VerificationRow } from './verification-row';

export default async function VerificationQueuePage() {
  const { supabase } = await requireRole('admin');

  const { data: products } = await supabase
    .from('products')
    .select('*, submitter:profiles!products_submitted_by_fkey(display_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  const rows = (products ?? []) as (Product & { submitter: { display_name: string } | null })[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cola de verificación</h1>
        <p className="text-muted-foreground">
          Revisá los productos propuestos por los influencers y decidí si entran al catálogo global.
        </p>
      </div>

      {rows.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Sin pendientes</CardTitle>
            <CardDescription>No hay productos esperando verificación. Todo al día 👌</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((p) => (
            <Card key={p.id}>
              <div className="grid gap-4 md:grid-cols-[180px_1fr]">
                <div className="overflow-hidden md:rounded-l-lg">
                  <ProductImage product={p} aspect="square" />
                </div>
                <div>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="capitalize">{p.category}</Badge>
                          {p.style && <Badge variant="outline" className="capitalize">{p.style}</Badge>}
                          {p.material && <Badge variant="outline" className="capitalize">{p.material}</Badge>}
                          <Badge variant="outline">{PRICE_RANGE_LABELS[p.price_range]}</Badge>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Propuesto por <span className="font-medium">{p.submitter?.display_name ?? '—'}</span>
                        <br />
                        {new Date(p.created_at).toLocaleDateString('es-AR')}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {p.description && <p className="text-sm text-muted-foreground">{p.description}</p>}
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((t) => (
                        <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <a
                      href={p.external_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      Abrir URL original <ExternalLink className="h-3 w-3" />
                    </a>
                    <VerificationRow productId={p.id} />
                  </CardContent>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
