import { NextRequest, NextResponse } from 'next/server';
import { explainFallback, explainRecommendation } from '@/lib/ai/explain';
import type { Recommendation } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Body {
  productName: string;
  productCategory: string;
  productStyle: string | null;
  productMaterial: string | null;
  rec: Recommendation;
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      explainFallback({
        productName: body.productName,
        productCategory: body.productCategory,
        rec: body.rec,
      }),
    );
  }

  try {
    const explanation = await explainRecommendation({
      productName: body.productName,
      productCategory: body.productCategory,
      productStyle: body.productStyle,
      productMaterial: body.productMaterial,
      rec: body.rec,
    });
    return NextResponse.json(explanation);
  } catch {
    return NextResponse.json(
      explainFallback({
        productName: body.productName,
        productCategory: body.productCategory,
        rec: body.rec,
      }),
    );
  }
}
