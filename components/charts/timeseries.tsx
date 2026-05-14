'use client';

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export function TimeseriesChart({
  data,
}: {
  data: Array<{ date: string; clicks: number; conversions: number }>;
}) {
  if (data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Sin actividad en los últimos 30 días.
      </p>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={11} />
        <YAxis tickLine={false} axisLine={false} fontSize={12} />
        <Tooltip
          cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeOpacity: 0.3 }}
          contentStyle={{
            borderRadius: 8,
            border: '1px solid hsl(var(--border))',
            background: 'hsl(var(--card))',
            fontSize: 12,
          }}
        />
        <Line type="monotone" dataKey="clicks" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="hsl(var(--muted-foreground))"
          strokeWidth={2}
          strokeDasharray="4 2"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
