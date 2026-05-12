'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES, MATERIALS, PRICE_RANGES, PRICE_RANGE_LABELS, STYLES } from '@/lib/taxonomy';
import { classifyAction, submitProductAction } from './actions';
import type { Classified } from '@/lib/ai/classify';

type FormState = Partial<Classified> & {
  external_url: string;
  price_numeric: string;
};

export function NewProductForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    external_url: '',
    price_numeric: '',
    tags: [],
  });
  const [tagsText, setTagsText] = useState('');
  const [classifying, startClassify] = useTransition();
  const [submitting, startSubmit] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClassify = () => {
    if (!form.external_url && !form.name) {
      setError('Ingresá al menos una URL o un nombre.');
      return;
    }
    setError(null);
    startClassify(async () => {
      const res = await classifyAction({ url: form.external_url, name: form.name ?? '' });
      if ('error' in res) {
        setError(res.error);
        return;
      }
      setForm((f) => ({
        ...f,
        name: res.name,
        category: res.category,
        style: res.style,
        material: res.material,
        price_range: res.price_range,
        tags: res.tags,
        description: res.description,
      }));
      setTagsText(res.tags.join(', '));
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set('external_url', form.external_url);
    fd.set('name', form.name ?? '');
    fd.set('category', form.category ?? 'lifestyle');
    fd.set('style', form.style ?? '');
    fd.set('material', form.material ?? '');
    fd.set('price_range', form.price_range ?? 'mid');
    fd.set('price_numeric', form.price_numeric);
    fd.set('description', form.description ?? '');
    fd.set(
      'tags',
      tagsText
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean)
        .join(','),
    );
    startSubmit(async () => {
      const res = await submitProductAction(fd);
      if (res.error) setError(res.error);
      else router.push('/influencer/my-submissions');
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="external_url">URL del producto</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <Input
            id="external_url"
            value={form.external_url}
            onChange={(e) => setForm({ ...form, external_url: e.target.value })}
            placeholder="https://marca.com/producto"
            required
          />
          <Button type="button" variant="secondary" onClick={handleClassify} disabled={classifying}>
            <Sparkles className="h-4 w-4" />
            {classifying ? 'Analizando…' : 'Pre-rellenar con IA'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            value={form.name ?? ''}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Categoría</Label>
          <Select
            id="category"
            value={form.category ?? ''}
            onChange={(e) => setForm({ ...form, category: e.target.value as Classified['category'] })}
            required
          >
            <option value="">Seleccionar</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="style">Estilo</Label>
          <Select
            id="style"
            value={form.style ?? ''}
            onChange={(e) => setForm({ ...form, style: (e.target.value || null) as Classified['style'] })}
          >
            <option value="">— sin estilo específico —</option>
            {STYLES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="material">Material</Label>
          <Select
            id="material"
            value={form.material ?? ''}
            onChange={(e) => setForm({ ...form, material: (e.target.value || null) as Classified['material'] })}
          >
            <option value="">— no aplica —</option>
            {MATERIALS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_range">Rango de precio</Label>
          <Select
            id="price_range"
            value={form.price_range ?? ''}
            onChange={(e) => setForm({ ...form, price_range: e.target.value as Classified['price_range'] })}
            required
          >
            <option value="">Seleccionar</option>
            {PRICE_RANGES.map((p) => (
              <option key={p} value={p}>{PRICE_RANGE_LABELS[p]}</option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_numeric">Precio (USD, opcional)</Label>
          <Input
            id="price_numeric"
            type="number"
            min="0"
            step="0.01"
            value={form.price_numeric}
            onChange={(e) => setForm({ ...form, price_numeric: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por coma)</Label>
        <Input
          id="tags"
          value={tagsText}
          onChange={(e) => setTagsText(e.target.value)}
          placeholder="ej. cuero, urbano, botas"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          rows={3}
          value={form.description ?? ''}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex justify-end">
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar a verificación'}
        </Button>
      </div>
    </form>
  );
}
