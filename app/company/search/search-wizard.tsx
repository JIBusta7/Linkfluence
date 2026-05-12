'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Search, ShieldCheck, Sparkles, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, MATERIALS, PRICE_RANGES, PRICE_RANGE_LABELS, STYLES } from '@/lib/taxonomy';
import { cn, formatMoney } from '@/lib/utils';
import { classifyForSearchAction, createSearchAction } from './actions';
import type { Product } from '@/lib/types';

type Step = 'search' | 'confirm' | 'manual';

interface CatalogHit {
  id: string;
  name: string;
  category: string;
  style: string | null;
  material: string | null;
  price_range: string;
  price_numeric: number | null;
  image_url: string | null;
  tags: string[];
  description: string | null;
}

interface MLHit {
  id: string;
  title: string;
  price: number;
  currency_id: string;
  picture: string;
  permalink: string;
}

interface SearchResults {
  catalog: CatalogHit[];
  marketplace: MLHit[];
}

export function SearchWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResults>({ catalog: [], marketplace: [] });
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<{ kind: 'catalog'; item: CatalogHit } | { kind: 'ml'; item: MLHit } | null>(null);
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // -------- Step 1: search ----------
  useEffect(() => {
    if (step !== 'search') return;
    if (query.trim().length < 2) {
      setResults({ catalog: [], marketplace: [] });
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/product-search?q=${encodeURIComponent(query)}`, {
          signal: ctrl.signal,
        });
        if (res.ok) setResults(await res.json());
      } catch {
        /* abort */
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, step]);

  const pickCatalog = (item: CatalogHit) => {
    setPicked({ kind: 'catalog', item });
    setStep('confirm');
  };

  const pickML = (item: MLHit) => {
    setPicked({ kind: 'ml', item });
    setStep('confirm');
  };

  const goManual = () => {
    setPicked(null);
    setStep('manual');
  };

  // -------- Step 2a: confirm + recommend ----------
  const confirmAndRecommend = () => {
    if (!picked) return;
    setError(null);
    startSubmit(async () => {
      let payload: Parameters<typeof createSearchAction>[0];
      if (picked.kind === 'catalog') {
        const it = picked.item;
        payload = {
          name: it.name,
          category: it.category,
          style: it.style,
          material: it.material,
          price_range: it.price_range,
          description: it.description ?? `Producto del catálogo: ${it.name}`,
          tags: it.tags,
        };
      } else {
        // Producto de ML — clasificamos con IA usando el título
        const cls = await classifyForSearchAction({ name: picked.item.title });
        if ('error' in cls) {
          setError(cls.error);
          return;
        }
        payload = {
          name: cls.name,
          category: cls.category,
          style: cls.style,
          material: cls.material,
          price_range: cls.price_range,
          description: cls.description,
          tags: cls.tags,
        };
      }
      const res = await createSearchAction(payload);
      if (res.error) setError(res.error);
      else router.push(`/company/recommendations/${res.searchId}`);
    });
  };

  if (step === 'manual') {
    return <ManualForm onBack={() => setStep('search')} />;
  }

  if (step === 'confirm' && picked) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setStep('search')}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Cambiar producto
        </button>

        <div className="overflow-hidden rounded-lg border bg-surface">
          <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
            <div className="aspect-square w-full overflow-hidden bg-muted sm:rounded-l-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  picked.kind === 'catalog'
                    ? picked.item.image_url ?? `https://picsum.photos/seed/${picked.item.id}/400/400`
                    : picked.item.picture
                }
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-2 p-4 sm:p-5">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                {picked.kind === 'catalog' ? (
                  <>
                    <ShieldCheck className="h-3 w-3" /> Producto verificado
                  </>
                ) : (
                  <>
                    <Store className="h-3 w-3" /> Mercado Libre
                  </>
                )}
              </span>
              <h3 className="text-base font-semibold leading-snug">
                {picked.kind === 'catalog' ? picked.item.name : picked.item.title}
              </h3>
              {picked.kind === 'catalog' && (
                <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                  <span className="capitalize">{picked.item.category}</span>
                  {picked.item.style && <span>· {picked.item.style}</span>}
                  {picked.item.material && <span>· {picked.item.material}</span>}
                </div>
              )}
              <div className="text-lg font-bold text-price">
                {picked.kind === 'catalog'
                  ? picked.item.price_numeric
                    ? formatMoney(picked.item.price_numeric)
                    : PRICE_RANGE_LABELS[picked.item.price_range as keyof typeof PRICE_RANGE_LABELS]
                  : `${picked.item.currency_id} ${picked.item.price.toLocaleString('es-AR')}`}
              </div>
              {picked.kind === 'ml' && (
                <a
                  href={picked.item.permalink}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-xs text-primary hover:underline"
                >
                  Ver en Mercado Libre →
                </a>
              )}
            </div>
          </div>
        </div>

        {picked.kind === 'ml' && (
          <p className="text-xs text-muted-foreground">
            Vamos a clasificar este producto con IA para recomendar influencers afines.
          </p>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex justify-end">
          <Button onClick={confirmAndRecommend} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Buscando influencers…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Buscar influencers
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // ------------------ Step 1: search ------------------
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="q">Producto a promocionar</Label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder='Ej. "campera de cuero", "auriculares wireless"…'
            className="pl-9"
            autoFocus
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {query.trim().length >= 2 && (
        <ResultsList
          results={results}
          onPickCatalog={pickCatalog}
          onPickML={pickML}
          onManual={goManual}
        />
      )}

      {query.trim().length < 2 && (
        <button
          type="button"
          onClick={goManual}
          className="block w-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground hover:bg-muted/50"
        >
          ¿Tu producto no es buscable? <span className="font-semibold text-foreground">Cargalo manualmente</span>
        </button>
      )}
    </div>
  );
}

function ResultsList({
  results,
  onPickCatalog,
  onPickML,
  onManual,
}: {
  results: SearchResults;
  onPickCatalog: (item: CatalogHit) => void;
  onPickML: (item: MLHit) => void;
  onManual: () => void;
}) {
  const empty = results.catalog.length === 0 && results.marketplace.length === 0;

  return (
    <div className="space-y-5">
      {results.catalog.length > 0 && (
        <Section title="En el catálogo INFLU" icon={<ShieldCheck className="h-4 w-4 text-success" />}>
          <div className="space-y-2">
            {results.catalog.map((it) => (
              <button
                key={it.id}
                onClick={() => onPickCatalog(it)}
                className="flex w-full items-center gap-3 rounded-lg border bg-surface p-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={it.image_url ?? `https://picsum.photos/seed/${it.id}/120/120`}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">{it.name}</div>
                  <div className="text-xs capitalize text-muted-foreground">
                    {it.category}
                    {it.style && ` · ${it.style}`}
                  </div>
                </div>
                <div className="text-right text-sm font-semibold text-price">
                  {it.price_numeric ? formatMoney(it.price_numeric) : '—'}
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      {results.marketplace.length > 0 && (
        <Section title="En Mercado Libre" icon={<Store className="h-4 w-4 text-primary" />}>
          <div className="space-y-2">
            {results.marketplace.map((it) => (
              <button
                key={it.id}
                onClick={() => onPickML(it)}
                className="flex w-full items-center gap-3 rounded-lg border bg-surface p-2.5 text-left transition-colors hover:bg-muted/50"
              >
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={it.picture} alt="" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="line-clamp-1 text-sm font-medium">{it.title}</div>
                  <div className="text-xs text-muted-foreground">{it.currency_id} {it.price.toLocaleString('es-AR')}</div>
                </div>
              </button>
            ))}
          </div>
        </Section>
      )}

      <button
        type="button"
        onClick={onManual}
        className={cn(
          'block w-full rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground hover:bg-muted/50',
          empty && 'border-primary/40 text-foreground',
        )}
      >
        {empty ? (
          <>
            No encontramos resultados para esto.{' '}
            <span className="font-semibold text-primary">Cargalo manualmente</span>
          </>
        ) : (
          <>
            ¿No es ninguno de estos?{' '}
            <span className="font-semibold text-foreground">Cargalo manualmente</span>
          </>
        )}
      </button>
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

// -------------------------------------------------------------------------
// Step 2b: manual form
// -------------------------------------------------------------------------
function ManualForm({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    category: '',
    style: '',
    material: '',
    price_range: '',
    description: '',
    tags: '',
  });
  const [classifying, startClassify] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClassify = () => {
    if (!form.name) {
      setError('Ingresá al menos el nombre.');
      return;
    }
    setError(null);
    startClassify(async () => {
      const res = await classifyForSearchAction({ name: form.name });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setForm((f) => ({
        ...f,
        name: res.name,
        category: res.category,
        style: res.style ?? '',
        material: res.material ?? '',
        price_range: res.price_range,
        description: res.description,
        tags: res.tags.join(', '),
      }));
    });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = {
      name: form.name,
      category: form.category,
      style: form.style || null,
      material: form.material || null,
      price_range: form.price_range || 'mid',
      description: form.description,
      tags: form.tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
    };
    startSubmit(async () => {
      const res = await createSearchAction(payload);
      if (res.error) setError(res.error);
      else router.push(`/company/recommendations/${res.searchId}`);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> Volver al buscador
      </button>

      <div className="space-y-2">
        <Label htmlFor="name">Nombre del producto</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Button type="button" variant="secondary" onClick={handleClassify} disabled={classifying}>
            <Sparkles className="h-4 w-4" />
            {classifying ? 'Clasificando…' : 'Auto-completar con IA'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select id="category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} required>
            <option value="">Seleccionar</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Estilo</Label>
          <Select id="style" value={form.style} onChange={(e) => setForm({ ...form, style: e.target.value })}>
            <option value="">— opcional —</option>
            {STYLES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Select id="material" value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })}>
            <option value="">— opcional —</option>
            {MATERIALS.map((m) => <option key={m} value={m}>{m}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_range">Rango de precio</Label>
          <Select id="price_range" value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} required>
            <option value="">Seleccionar</option>
            {PRICE_RANGES.map((p) => <option key={p} value={p}>{PRICE_RANGE_LABELS[p]}</option>)}
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por coma)</Label>
        <Input
          id="tags"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          placeholder="ej. cuero, urbano, premium"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Buscando…' : 'Buscar influencers'}
        </Button>
      </div>
    </form>
  );
}
