import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireRole } from '@/lib/auth';
import { recommendInfluencers, type QueryPayload } from '@/lib/recommend';
import { explainFallback } from '@/lib/ai/explain';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecommendationCard } from './recommendation-card';

export default async function RecommendationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { profile, supabase } = await requireRole('company');

  const { data: search } = await supabase
    .from('company_searches')
    .select('id, query_payload, company_id, result_snapshot')
    .eq('id', id)
    .maybeSingle();

  if (!search || search.company_id !== profile.id) notFound();

  const query = search.query_payload as QueryPayload;
  // topN alto: queremos que TODOS los influencers reales aparezcan en la lista,
  // no solo los seed con mucho historial. El algoritmo igual ordena por fit_score
  // así que los buenos quedan arriba — pero los nuevos también figuran.
  const recs = await recommendInfluencers(query, { topK: 30, topN: 50 });

  // Pre-cargar explicación determinística (la IA real se pide en un componente aparte)
  const recsWithExplain = recs.map((r) => ({
    ...r,
    explanation: explainFallback({
      productName: query.name,
      productCategory: query.category,
      rec: r,
    }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/company/search" className="text-sm text-muted-foreground hover:underline">
          ← Nueva búsqueda
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{query.name}</CardTitle>
          <CardDescription>Ranking de influencers recomendados.</CardDescription>
          <div className="flex flex-wrap gap-1 pt-2">
            <Badge variant="secondary" className="capitalize">{query.category}</Badge>
            {query.style && <Badge variant="outline" className="capitalize">{query.style}</Badge>}
            {query.material && <Badge variant="outline" className="capitalize">{query.material}</Badge>}
            <Badge variant="outline">{query.price_range}</Badge>
          </div>
        </CardHeader>
      </Card>

      {recsWithExplain.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Aún no hay influencers con actividad suficiente. Cargá seed y simulá tráfico desde admin.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recsWithExplain.map((rec, idx) => (
            <RecommendationCard
              key={rec.influencer.id}
              rec={rec}
              rank={idx + 1}
              productName={query.name}
              productCategory={query.category}
              productStyle={query.style}
              productMaterial={query.material}
            />
          ))}
        </div>
      )}
    </div>
  );
}
