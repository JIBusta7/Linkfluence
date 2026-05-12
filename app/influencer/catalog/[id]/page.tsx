import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import { PRICE_RANGE_LABELS } from '@/lib/taxonomy';
import type { Product } from '@/lib/types';
import { formatMoney } from '@/lib/utils';
import { ProductImage } from '@/components/product-image';
import { GenerateLinkPanel } from './generate-link-panel';

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, profile } = await requireRole('influencer');

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle<Product>();

  if (!product || product.status !== 'verified') {
    notFound();
  }

  const { data: existingLink } = await supabase
    .from('links')
    .select('short_code')
    .eq('influencer_id', profile.id)
    .eq('product_id', product.id)
    .maybeSingle<{ short_code: string }>();

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <nav className="text-xs text-muted-foreground">
        <Link href="/influencer/catalog" className="hover:text-foreground">Catálogo</Link>
        <span className="px-1">›</span>
        <span className="capitalize">{product.category}</span>
      </nav>

      <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_360px]">
        {/* Columna izquierda: imagen + descripción */}
        <div className="space-y-6">
          <div className="overflow-hidden rounded-lg border bg-surface shadow-sm">
            <ProductImage product={product} aspect="4/3" />
          </div>

          <div className="rounded-lg border bg-surface p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Descripción</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {product.description || 'Sin descripción.'}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-1.5">
                {product.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-surface p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Especificaciones</h2>
            <dl className="grid gap-y-2 text-sm sm:grid-cols-2">
              <Spec label="Categoría" value={product.category} />
              <Spec label="Estilo" value={product.style ?? '—'} />
              <Spec label="Material" value={product.material ?? '—'} />
              <Spec label="Rango de precio" value={PRICE_RANGE_LABELS[product.price_range] ?? '—'} />
            </dl>
          </div>
        </div>

        {/* Columna derecha: precio + CTA + link */}
        <div className="space-y-4">
          <div className="rounded-lg border bg-surface p-6 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-medium text-success">
              <ShieldCheck className="h-3.5 w-3.5" />
              Producto verificado
            </div>
            <h1 className="mt-2 text-xl font-semibold leading-tight">{product.name}</h1>

            <div className="mt-4 space-y-1">
              {product.price_numeric ? (
                <div className="text-4xl font-light text-price">
                  {formatMoney(product.price_numeric)}
                </div>
              ) : (
                <div className="text-2xl font-semibold text-price">
                  {PRICE_RANGE_LABELS[product.price_range] ?? 'Consultar'}
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Precio aproximado del producto externo
              </div>
            </div>

            <a
              href={product.external_url}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              Ver sitio original <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          <GenerateLinkPanel
            productId={product.id}
            existingShortCode={existingLink?.short_code ?? null}
          />
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-dashed py-1.5 sm:block sm:border-none sm:py-0">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize">{value}</dd>
    </div>
  );
}
