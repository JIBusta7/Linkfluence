'use client';

import { useEffect, useState } from 'react';
import { Banknote, Eye, Instagram, Music, Sparkles, TrendingUp, Users, Youtube } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Recommendation } from '@/lib/types';
import { formatMoney, formatNumber, formatPercent } from '@/lib/utils';

interface Props {
  rec: Recommendation & { explanation: NonNullable<Recommendation['explanation']> };
  rank: number;
  productName: string;
  productCategory: string;
  productStyle: string | null;
  productMaterial: string | null;
}

export function RecommendationCard({
  rec,
  rank,
  productName,
  productCategory,
  productStyle,
  productMaterial,
}: Props) {
  const [explanation, setExplanation] = useState(rec.explanation);
  const [aiEnriched, setAiEnriched] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/explain', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        productName,
        productCategory,
        productStyle,
        productMaterial,
        rec,
      }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data?.headline) {
          setExplanation(data);
          setAiEnriched(true);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [rec, productName, productCategory, productStyle, productMaterial]);

  const lowConfidence = rec.components.volume_confidence < 0.4;
  const inf = rec.influencer;
  const initials = inf.display_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const costRange =
    inf.hire_cost_min != null && inf.hire_cost_max != null
      ? `${formatMoney(inf.hire_cost_min)} – ${formatMoney(inf.hire_cost_max)}`
      : inf.hire_cost_min != null
        ? `desde ${formatMoney(inf.hire_cost_min)}`
        : inf.hire_cost_max != null
          ? `hasta ${formatMoney(inf.hire_cost_max)}`
          : 'A consultar';

  return (
    <Card className="overflow-hidden">
      {/* Header con avatar + ranking + fit score */}
      <div className="grid gap-4 border-b bg-muted/30 p-5 sm:grid-cols-[auto_1fr_auto]">
        <div className="relative">
          <Avatar src={inf.avatar_url} initials={initials} />
          <div className="absolute -left-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-foreground text-xs font-bold text-background">
            #{rank}
          </div>
        </div>

        <div className="min-w-0 space-y-1.5">
          <div>
            <h3 className="text-lg font-semibold leading-tight">{inf.display_name}</h3>
            {inf.bio && (
              <p className="line-clamp-2 text-sm text-muted-foreground">{inf.bio}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {inf.categories.map((c) => (
              <Badge key={c} variant="secondary" className="capitalize">
                {c}
              </Badge>
            ))}
          </div>
          <SocialHandles
            instagram={inf.instagram_handle}
            tiktok={inf.tiktok_handle}
            youtube={inf.youtube_handle}
          />
        </div>

        <div className="text-right">
          <div className="text-3xl font-bold leading-none text-primary">
            {Math.round(rec.fit_score)}
          </div>
          <div className="text-xs text-muted-foreground">Fit / 100</div>
          {lowConfidence && (
            <Badge variant="warning" className="mt-2">Confianza baja</Badge>
          )}
        </div>
      </div>

      <CardContent className="space-y-4 p-5">
        {/* Métricas headline: followers, reach, costo */}
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            icon={<Users className="h-4 w-4" />}
            label="Seguidores"
            value={inf.followers_total != null ? formatNumber(inf.followers_total) : '—'}
          />
          <Stat
            icon={<Eye className="h-4 w-4" />}
            label="Alcance promedio"
            value={inf.reach_estimate != null ? formatNumber(inf.reach_estimate) : '—'}
          />
          <Stat
            icon={<Banknote className="h-4 w-4" />}
            label="Costo de contratación"
            value={costRange}
          />
        </div>

        {/* Explicación IA */}
        <div className="rounded-md border bg-accent/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-accent-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            {explanation.headline}
            {aiEnriched && (
              <Badge variant="outline" className="ml-1 text-[10px]">IA</Badge>
            )}
          </div>
          <p className="mt-1.5 text-sm text-foreground/90">{explanation.paragraph}</p>
          <div className="mt-3 flex flex-wrap gap-1">
            {explanation.reasons.map((r) => (
              <Badge key={r} variant="outline" className="capitalize">
                {r}
              </Badge>
            ))}
          </div>
        </div>

        {/* Métricas comerciales */}
        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <SmallStat
            label="CR en similares"
            value={formatPercent(rec.evidence.cr_on_similar)}
            hint="ponderado"
          />
          <SmallStat
            label="Volumen Linkfluence"
            value={formatNumber(rec.evidence.volume)}
            hint="clicks"
          />
          <SmallStat
            label="Top categoría"
            value={rec.evidence.best_category ?? '—'}
            hint=""
          />
        </div>

        {/* Productos similares */}
        {rec.evidence.top_similar_products.length > 0 && (
          <div>
            <p className="mb-1.5 flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <TrendingUp className="h-3 w-3" /> Productos similares que promocionó
            </p>
            <ul className="space-y-1 text-sm">
              {rec.evidence.top_similar_products.map((p) => (
                <li key={p.product_id} className="flex items-center justify-between">
                  <span className="truncate">{p.name}</span>
                  <span className="whitespace-nowrap text-xs text-muted-foreground">
                    sim {p.similarity.toFixed(2)} · CR {formatPercent(p.cr)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Avatar({ src, initials }: { src: string | null; initials: string }) {
  if (src) {
    return (
      <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="h-full w-full object-cover" />
      </div>
    );
  }
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full border bg-primary/10 text-xl font-bold text-primary">
      {initials}
    </div>
  );
}

function SocialHandles({
  instagram,
  tiktok,
  youtube,
}: {
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
}) {
  if (!instagram && !tiktok && !youtube) return null;
  return (
    <div className="flex items-center gap-3 pt-0.5 text-xs text-muted-foreground">
      {instagram && (
        <span className="inline-flex items-center gap-1">
          <Instagram className="h-3 w-3" />
          {instagram}
        </span>
      )}
      {tiktok && (
        <span className="inline-flex items-center gap-1">
          <Music className="h-3 w-3" />
          {tiktok}
        </span>
      )}
      {youtube && (
        <span className="inline-flex items-center gap-1">
          <Youtube className="h-3 w-3" />
          {youtube}
        </span>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}

function SmallStat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-md border bg-surface p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-semibold capitalize">{value}</div>
      {hint && <div className="text-[10px] text-muted-foreground">{hint}</div>}
    </div>
  );
}
