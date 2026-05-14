'use client';

import { useState, useTransition } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Copy, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
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
  const [copied, setCopied] = useState(false);
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
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // navegador antiguo o sin permiso — fallback silencioso
    }
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
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2"
          >
            <Label>Link personal</Label>
            <div className="flex gap-2">
              <Input readOnly value={fullUrl} className="font-mono text-xs" />
              <Button
                type="button"
                variant={copied ? 'default' : 'outline'}
                onClick={copy}
                className={cn(
                  'relative min-w-[110px] overflow-hidden transition-colors',
                  copied && 'bg-success text-white hover:bg-success',
                )}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {copied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.9 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="flex items-center gap-1.5"
                    >
                      <motion.span
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
                        className="inline-flex"
                      >
                        <Check className="h-4 w-4" />
                      </motion.span>
                      ¡Copiado!
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center gap-1.5"
                    >
                      <Copy className="h-4 w-4" />
                      Copiar
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cada click registra un evento atribuido a tu perfil.
            </p>
          </motion.div>
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
