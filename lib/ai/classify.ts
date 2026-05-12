import { z } from 'zod';
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';
import { CATEGORIES, MATERIALS, PRICE_RANGES, STYLES } from '@/lib/taxonomy';

export const classifySchema = z.object({
  name: z.string().min(1),
  category: z.enum(CATEGORIES),
  style: z.enum(STYLES).nullable(),
  material: z.enum(MATERIALS).nullable(),
  price_range: z.enum(PRICE_RANGES),
  tags: z.array(z.string().min(1)).min(2).max(8),
  description: z.string().min(10).max(300),
});

export type Classified = z.infer<typeof classifySchema>;

const SYSTEM_PROMPT = `Sos un clasificador de productos para una plataforma de influencer marketing.
Dado el nombre y opcionalmente la URL de un producto externo, devolvés JSON estricto con:
- name: string corto y limpio (sin emojis, sin spam)
- category: ${CATEGORIES.join(' | ')}
- style: ${STYLES.join(' | ')} o null si no aplica
- material: ${MATERIALS.join(' | ')} o null si no aplica (ej. electrónica)
- price_range: low (<30) | mid (30-150) | high (150-500) | luxury (>500)
- tags: 2-8 tags descriptivas, minúsculas, sin "#"
- description: 1-2 oraciones en español, neutras, sin claims de venta

Reglas:
- Si no tenés datos concretos de precio, estimá por el tipo de producto.
- Usá SOLO los valores de las taxonomías dadas.
- description no puede tener precios ni promesas.`;

export async function classifyProduct(input: {
  url?: string;
  name?: string;
  hint?: string;
}): Promise<Classified> {
  const user = [
    input.name ? `nombre: ${input.name}` : '',
    input.url ? `url: ${input.url}` : '',
    input.hint ? `contexto: ${input.hint}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const result = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: SYSTEM_PROMPT,
    prompt: user || 'producto genérico',
    schema: classifySchema,
    temperature: 0.2,
  });

  return result.object;
}

// Fallback sin IA: heurísticas mínimas
export function classifyFallback(input: { name: string; url?: string }): Classified {
  const n = input.name.toLowerCase();
  let category: Classified['category'] = 'lifestyle';
  if (/zapat|campera|jean|remera|bota|vestido|moda/.test(n)) category = 'moda';
  else if (/auricular|notebook|mouse|teclado|tech|cam|phone/.test(n)) category = 'tech';
  else if (/maquillaje|crema|perfume|belleza|skincare/.test(n)) category = 'belleza';
  else if (/muscul|fitness|deporte|run|yoga/.test(n)) category = 'deportes';
  else if (/mate|cocina|deco|hogar|sillón|mesa/.test(n)) category = 'hogar';
  else if (/gaming|consola|joystick|headset/.test(n)) category = 'gaming';

  return {
    name: input.name,
    category,
    style: null,
    material: null,
    price_range: 'mid',
    tags: n.split(/\s+/).filter((t) => t.length > 2).slice(0, 5),
    description: `${input.name} — producto clasificado automáticamente. Podés editar los atributos.`,
  };
}
