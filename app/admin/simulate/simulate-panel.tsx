'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { simulateTrafficAction } from './actions';

export function SimulatePanel() {
  const [clicks, setClicks] = useState('500');
  const [conversions, setConversions] = useState('30');
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    setResult(null);
    startTransition(async () => {
      const res = await simulateTrafficAction({
        clicks: Number(clicks),
        conversions: Number(conversions),
      });
      if (res.error) setError(res.error);
      else setResult(res.message!);
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="clicks">Clicks a generar</Label>
          <Input id="clicks" type="number" value={clicks} onChange={(e) => setClicks(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="conv">Conversiones a generar</Label>
          <Input id="conv" type="number" value={conversions} onChange={(e) => setConversions(e.target.value)} />
        </div>
      </div>
      <Button onClick={run} disabled={pending}>
        {pending ? 'Simulando…' : 'Ejecutar simulación'}
      </Button>
      {result && <p className="text-sm text-emerald-700">{result}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
