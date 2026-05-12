import { z } from 'zod';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import type { Recommendation } from '@/lib/types';

export const explanationSchema = z.object({
  headline: z.string().min(5).max(120),
  paragraph: z.string().min(20).max(500),
  reasons: z.array(z.string().min(3).max(60)).min(1).max(5),
});

export type Explanation = z.infer<typeof explanationSchema>;

const SYSTEM = `Sos un analista de marketing que escribe 2-3 oraciones explicando por qué un influencer
encaja para promocionar un producto. Tono profesional, datos concretos, sin hype.
Siempre en español rioplatense neutral. No inventes datos: usá SOLO la evidencia provista.
Mencioná números cuando apliquen (ej. "CR 6.8%"). Si el influencer no tiene historial exacto del producto,
explicá la razón por similitud (categoría, material, estilo).`;

export async function explainRecommendation(args: {
  productName: string;
  productCategory: string;
  productStyle: string | null;
  productMaterial: string | null;
  rec: Recommendation;
}): Promise<Explanation> {
  const { rec } = args;
  const evidenceText = [
    `Influencer: ${rec.influencer.display_name}`,
    `Categorías declaradas: ${rec.influencer.categories.join(', ') || 'ninguna'}`,
    `Fit score: ${rec.fit_score}/100`,
    `CR sobre productos similares: ${(rec.evidence.cr_on_similar * 100).toFixed(1)}%`,
    `Volumen (clicks): ${rec.evidence.volume}`,
    `Top categoría: ${rec.evidence.best_category ?? '—'}`,
    `Productos similares:`,
    ...rec.evidence.top_similar_products.slice(0, 5).map(
      (p) => ` - ${p.name} (sim=${p.similarity.toFixed(2)}, CR=${(p.cr * 100).toFixed(1)}%)`,
    ),
    `Razones estructurales: ${rec.evidence.match_reasons.join(', ') || '—'}`,
  ].join('\n');

  const prompt = `Producto target: ${args.productName} (${args.productCategory}${
    args.productStyle ? `, ${args.productStyle}` : ''
  }${args.productMaterial ? `, ${args.productMaterial}` : ''})

Evidencia del influencer:
${evidenceText}

Escribí una explicación con:
- headline: una sola oración de cierre comercial (máx 12 palabras)
- paragraph: 2-3 oraciones fundamentando
- reasons: 2-4 razones puntuales (chips)`;

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: SYSTEM,
    prompt,
    schema: explanationSchema,
    temperature: 0.3,
  });
  return result.object;
}

// Fallback determinístico si el LLM falla o no hay API key
export function explainFallback(args: {
  productName: string;
  productCategory: string;
  rec: Recommendation;
}): Explanation {
  const { rec } = args;
  const crPct = (rec.evidence.cr_on_similar * 100).toFixed(1);
  const topCat = rec.evidence.best_category ?? rec.influencer.categories[0] ?? 'su vertical';
  const reasons = rec.evidence.match_reasons.length > 0
    ? rec.evidence.match_reasons
    : [topCat, `${rec.evidence.volume} clicks`, `CR ${crPct}%`];

  return {
    headline: `${rec.influencer.display_name} calza para ${args.productName}`,
    paragraph: `Con un CR promedio de ${crPct}% en productos similares y foco en ${topCat}, ${rec.influencer.display_name} muestra afinidad comercial con ${args.productCategory}. Su volumen acumulado de ${rec.evidence.volume} clicks respalda la proyección.`,
    reasons: reasons.slice(0, 4),
  };
}
