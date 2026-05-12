import { embed, embedMany } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { Product } from '@/lib/types';

const MODEL = openai.embedding('text-embedding-3-small');
export const EMBEDDING_DIMS = 1536;

export function productEmbeddingInput(
  p: Pick<Product, 'name' | 'category' | 'style' | 'material' | 'description' | 'tags'>,
): string {
  return [
    p.name,
    p.category,
    p.style,
    p.material,
    (p.tags ?? []).join(', '),
    p.description,
  ]
    .filter(Boolean)
    .join(' | ');
}

export async function embedProduct(p: Parameters<typeof productEmbeddingInput>[0]): Promise<number[]> {
  const { embedding } = await embed({ model: MODEL, value: productEmbeddingInput(p) });
  return embedding;
}

export async function embedText(text: string): Promise<number[]> {
  const { embedding } = await embed({ model: MODEL, value: text });
  return embedding;
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({ model: MODEL, values: texts });
  return embeddings;
}

// Fallback: vector determinístico basado en hash del texto (para seed sin API key)
export function fallbackEmbedding(text: string): number[] {
  const arr = new Array(EMBEDDING_DIMS).fill(0);
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h = (h ^ text.charCodeAt(i)) * 16777619;
    arr[i % EMBEDDING_DIMS] += (h & 0xff) / 256 - 0.5;
  }
  // normalize
  const norm = Math.sqrt(arr.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? arr : arr.map((v) => v / norm);
}
