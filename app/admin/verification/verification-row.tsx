'use client';

import { useState, useTransition } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { approveProductAction, rejectProductAction } from './actions';

export function VerificationRow({ productId }: { productId: string }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const approve = () => {
    setError(null);
    startTransition(async () => {
      const res = await approveProductAction(productId);
      if (res.error) setError(res.error);
    });
  };

  const reject = () => {
    if (rejecting && !reason.trim()) {
      setError('Necesitás explicar el motivo del rechazo.');
      return;
    }
    if (!rejecting) {
      setRejecting(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await rejectProductAction(productId, reason);
      if (res.error) setError(res.error);
    });
  };

  return (
    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center">
      <Button onClick={approve} disabled={pending} className="sm:w-auto">
        <Check className="h-4 w-4" /> Aprobar
      </Button>
      {rejecting && (
        <Input
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Motivo del rechazo"
          className="flex-1"
        />
      )}
      <Button onClick={reject} disabled={pending} variant="destructive" className="sm:w-auto">
        <X className="h-4 w-4" /> {rejecting ? 'Confirmar rechazo' : 'Rechazar'}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
