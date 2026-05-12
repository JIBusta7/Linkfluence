'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createManualConversionAction } from './actions';

interface LinkOption {
  id: string;
  short_code: string;
  label: string;
}

export function ManualConversionForm({ links }: { links: LinkOption[] }) {
  const router = useRouter();
  const [linkId, setLinkId] = useState(links[0]?.id ?? '');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(false);
    const amt = Number(amount);
    if (!linkId) return setError('Elegí un link.');
    if (!Number.isFinite(amt) || amt <= 0) return setError('Monto inválido.');
    startTransition(async () => {
      const res = await createManualConversionAction({ linkId, amount: amt, notes });
      if (res.error) setError(res.error);
      else {
        setOk(true);
        setAmount('');
        setNotes('');
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="link">Link</Label>
        <Select id="link" value={linkId} onChange={(e) => setLinkId(e.target.value)} required>
          {links.length === 0 ? (
            <option value="">— sin links —</option>
          ) : (
            links.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))
          )}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="amount">Monto (USD)</Label>
        <Input
          id="amount"
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="ej. orden 12345 reportada por la empresa"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      {ok && <p className="text-sm text-emerald-700">Conversión registrada.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? 'Registrando…' : 'Registrar conversión'}
      </Button>
    </form>
  );
}
