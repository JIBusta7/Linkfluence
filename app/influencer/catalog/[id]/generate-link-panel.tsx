'use client';

import { useState, useTransition } from 'react';
import { Copy, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { generateLinkAction } from './actions';

export function GenerateLinkPanel({
  productId,
  existingShortCode,
}: {
  productId: string;
  existingShortCode: string | null;
}) {
  const [shortCode, setShortCode] = useState(existingShortCode);
  const [coupon, setCoupon] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const fullUrl = shortCode ? `${baseUrl}/r/${shortCode}` : '';

  const handleGenerate = () => {
    setError(null);
    startTransition(async () => {
      const res = await generateLinkAction(productId, coupon || null);
      if (res.error) setError(res.error);
      else setShortCode(res.shortCode!);
    });
  };

  const copy = async () => {
    await navigator.clipboard.writeText(fullUrl);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Link2 className="h-5 w-5" /> Tu link trackeable
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {shortCode ? (
          <div className="space-y-2">
            <Label>Link personal</Label>
            <div className="flex gap-2">
              <Input readOnly value={fullUrl} />
              <Button type="button" variant="outline" onClick={copy}>
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada click registra un evento atribuido a tu perfil.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="coupon">Código de cupón (opcional)</Label>
              <Input
                id="coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value.toUpperCase().slice(0, 20))}
                placeholder="Ej. AMY10"
              />
              <p className="text-xs text-muted-foreground">
                Si la empresa carga ventas con este código, te las atribuimos.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={pending} className="w-full">
              {pending ? 'Generando…' : 'Generar mi link'}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
