'use server';

import { revalidatePath } from 'next/cache';
import { requireRole } from '@/lib/auth';
import { getSupabaseAdmin } from '@/lib/supabase/server';

interface SimulateArgs {
  clicks: number;
  conversions: number;
}

// Generador determinístico sesgado por afinidad categoría-influencer.
// No reemplaza al seed script — este botón sirve para "empujar" data en la demo en vivo.
export async function simulateTrafficAction({ clicks, conversions }: SimulateArgs) {
  try {
    await requireRole('admin');
    if (clicks < 0 || conversions < 0 || clicks > 20000 || conversions > 5000) {
      return { error: 'Valores fuera de rango razonable.' };
    }

    const admin = getSupabaseAdmin();
    const { data: links } = await admin
      .from('links')
      .select('id, influencer_id, products(category), profiles:profiles!links_influencer_id_fkey(categories)')
      .limit(1000);

    if (!links || links.length === 0) {
      return { error: 'No hay links para simular. Cargá seed primero.' };
    }

    // Peso: 1 si el influencer tiene la categoría del producto, 0.1 si no
    const weights: number[] = links.map((l: any) => {
      const cats: string[] = l.profiles?.categories ?? [];
      const prodCat = l.products?.category;
      return cats.includes(prodCat) ? 1 : 0.1;
    });
    const totalWeight = weights.reduce((a: number, b: number) => a + b, 0);

    const now = Date.now();
    const pickLink = () => {
      let r = Math.random() * totalWeight;
      for (let i = 0; i < links.length; i++) {
        r -= weights[i];
        if (r <= 0) return links[i];
      }
      return links[links.length - 1];
    };

    // batch clicks
    const clickRows = Array.from({ length: clicks }).map(() => {
      const l: any = pickLink();
      // spread en los últimos 30 días
      const offsetMs = Math.random() * 30 * 24 * 60 * 60 * 1000;
      return {
        link_id: l.id,
        utm_source: 'demo',
        utm_medium: 'simulation',
        country: ['AR', 'MX', 'ES', 'CL', 'UY'][Math.floor(Math.random() * 5)],
        created_at: new Date(now - offsetMs).toISOString(),
      };
    });

    const convRows = Array.from({ length: conversions }).map(() => {
      const l: any = pickLink();
      const offsetMs = Math.random() * 30 * 24 * 60 * 60 * 1000;
      return {
        link_id: l.id,
        amount: Math.round((20 + Math.random() * 180) * 100) / 100,
        source: 'simulated' as const,
        occurred_at: new Date(now - offsetMs).toISOString(),
      };
    });

    // insert por lotes (chunking para evitar límites)
    const chunk = <T,>(arr: T[], n: number): T[][] => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
      return out;
    };

    for (const c of chunk(clickRows, 500)) {
      const { error } = await admin.from('click_events').insert(c);
      if (error) throw error;
    }
    for (const c of chunk(convRows, 500)) {
      const { error } = await admin.from('conversions').insert(c);
      if (error) throw error;
    }

    await admin.rpc('refresh_stats');

    revalidatePath('/influencer', 'layout');
    revalidatePath('/admin', 'layout');

    return { message: `Listo: ${clicks} clicks + ${conversions} conversiones insertadas.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Error simulando' };
  }
}
