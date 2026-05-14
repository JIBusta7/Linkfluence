'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function PerformanceByCategoryChart({
  data,
}: {
  data: Array<{ category: string; clicks: number; conversions: number; cr: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Todavía no hay datos por categoría. Generá tu primer link desde el catálogo.
      </p>
    );
  }
  const chartData = data.map((d) => ({ ...d, crPct: Math.round(d.cr * 1000) / 10 }));
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="category" tickLine={false} axisLine={false} fontSize={12} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          // cursor: el highlight gris que Recharts pinta al hover. Por
          // default es gris claro fijo (queda blanco brillante en dark mode).
          // Lo atamos al token muted-foreground con baja opacidad para que
          // sea sutil tanto en light como en dark.
          cursor={{ fill: 'hsl(var(--muted-foreground))', fillOpacity: 0.08 }}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            fontSize: 12,
          }}
        />
        {/* Verde Linkfluence para clicks (consistente en light/dark) y gris
            medio para conversiones. Antes usaba var(--primary) que invierte
            con el tema (negro en light, blanco en dark — feo el blanco puro). */}
        <Bar dataKey="clicks" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
        <Bar dataKey="conversions" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
