import Link from 'next/link';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { requireRole } from '@/lib/auth';
import type { Product } from '@/lib/types';
import { CATEGORIES, PRICE_RANGES, PRICE_RANGE_LABELS } from '@/lib/taxonomy';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { buttonVariants } from '@/components/ui/button';
import { cn, formatMoney } from '@/lib/utils';
import { ProductImage } from '@/components/product-image';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; price?: string }>;
}) {
  const { supabase } = await requireRole('influencer');
  const { q, category, price } = await searchParams;

  let query = supabase
    .from('products')
    .select('*')
    .eq('status', 'verified')
    .order('created_at', { ascending: false })
    .limit(80);

  if (q) query = query.ilike('name', `%${q}%`);
  if (category) query = query.eq('category', category);
  if (price) query = query.eq('price_range', price);

  const { data: products } = await query.returns<Product[]>();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Catálogo global</h1>
          <p className="text-sm text-muted-foreground">
            {products?.length ?? 0} productos verificados listos para linkear.
          </p>
        </div>
        <Link
          href="/influencer/catalog/new"
          className={cn(buttonVariants({ variant: 'default' }), 'rounded-full')}
        >
          <Plus className="h-4 w-4" />
          Proponer producto
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 rounded-lg border bg-surface p-3 shadow-sm">
        <div className="relative min-w-[240px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input name="q" defaultValue={q ?? ''} placeholder="Buscar productos…" className="pl-9" />
        </div>
        <Select name="category" defaultValue={category ?? ''} className="w-44">
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c} className="capitalize">{c}</option>
          ))}
        </Select>
        <Select name="price" defaultValue={price ?? ''} className="w-44">
          <option value="">Cualquier precio</option>
          {PRICE_RANGES.map((p) => (
            <option key={p} value={p}>{PRICE_RANGE_LABELS[p]}</option>
          ))}
        </Select>
        <button type="submit" className={cn(buttonVariants({ variant: 'default' }))}>
          Aplicar
        </button>
      </form>

      {(!products || products.length === 0) ? (
        <EmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/influencer/catalog/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <ProductImage product={product} aspect="square" />
      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <span className="capitalize">{product.category}</span>
          {product.style && (
            <>
              <span>·</span>
              <span className="capitalize">{product.style}</span>
            </>
          )}
        </div>

        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        <div className="mt-auto space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-price">
              {product.price_numeric ? formatMoney(product.price_numeric) : '—'}
            </span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-medium text-success">
            <ShieldCheck className="h-3 w-3" />
            Verificado
          </div>
        </div>
      </div>
    </Link>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border bg-surface py-16 text-center shadow-sm">
      <Search className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        No encontramos productos con esos filtros.
      </p>
      <Link
        href="/influencer/catalog/new"
        className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'rounded-full')}
      >
        <Plus className="h-4 w-4" /> Proponer nuevo producto
      </Link>
    </div>
  );
}
