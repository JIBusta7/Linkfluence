'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES } from '@/lib/taxonomy';
import type { Profile } from '@/lib/types';
import { saveProfileAction, uploadAvatarAction } from './actions';

export function ProfileEditor({ profile }: { profile: Profile }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '');
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>(profile.categories ?? []);

  const toggleCategory = (c: string) => {
    setCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set('file', file);
      const res = await uploadAvatarAction(fd);
      if (res.error) setError(res.error);
      else if (res.url) setAvatarUrl(res.url);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    fd.delete('categories');
    for (const c of categories) fd.append('categories', c);
    fd.set('avatar_url', avatarUrl);
    startTransition(async () => {
      const res = await saveProfileAction(fd);
      if (res.error) setError(res.error);
      else {
        setSaved(true);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-20 w-20 overflow-hidden rounded-full border bg-muted">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-muted-foreground">
                {profile.display_name[0]?.toUpperCase()}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted"
            aria-label="Cambiar foto"
          >
            <Camera className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="text-sm">
          <div className="font-medium">Foto de perfil</div>
          <div className="text-xs text-muted-foreground">
            JPG/PNG, hasta 2 MB. Se ve cuadrada.
          </div>
          {uploading && <div className="text-xs text-primary">Subiendo…</div>}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Datos básicos */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="display_name">Nombre</Label>
          <Input id="display_name" name="display_name" defaultValue={profile.display_name} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" name="location" defaultValue={profile.location ?? ''} placeholder="Montevideo, UY" />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ''} rows={3} maxLength={280} />
      </div>

      {/* Categorías */}
      <div className="space-y-2">
        <Label>Categorías</Label>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-muted"
            >
              <input
                type="checkbox"
                checked={categories.includes(c)}
                onChange={() => toggleCategory(c)}
                className="h-4 w-4 accent-[hsl(var(--primary))]"
              />
              <span className="capitalize">{c}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Redes */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Redes sociales</h3>
        <div className="grid gap-3 md:grid-cols-2">
          <SocialField name="instagram_handle" label="Instagram" defaultValue={profile.instagram_handle} placeholder="@usuario" />
          <SocialField name="tiktok_handle" label="TikTok" defaultValue={profile.tiktok_handle} placeholder="@usuario" />
          <SocialField name="youtube_handle" label="YouTube" defaultValue={profile.youtube_handle} placeholder="@canal" />
          <SocialField name="twitter_handle" label="X / Twitter" defaultValue={profile.twitter_handle} placeholder="@usuario" />
        </div>
      </div>

      {/* Métricas + costo */}
      <div>
        <h3 className="mb-2 text-sm font-semibold">Audiencia y costo de contratación</h3>
        <p className="mb-3 text-xs text-muted-foreground">
          Estos números los ven las empresas al recibir tu recomendación.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <NumberField name="followers_total" label="Seguidores totales" defaultValue={profile.followers_total} placeholder="45000" />
          <NumberField name="reach_estimate" label="Alcance promedio (personas)" defaultValue={profile.reach_estimate} placeholder="12000" />
          <NumberField name="hire_cost_min" label="Costo desde (USD)" defaultValue={profile.hire_cost_min} placeholder="200" step="any" />
          <NumberField name="hire_cost_max" label="Costo hasta (USD)" defaultValue={profile.hire_cost_max} placeholder="800" step="any" />
        </div>
      </div>

      <div className="flex items-center gap-3 border-t pt-4">
        <Button type="submit" disabled={pending}>
          {pending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Guardado
          </span>
        )}
        {error && <span className="text-sm text-destructive">{error}</span>}
      </div>
    </form>
  );
}

function SocialField({
  name,
  label,
  defaultValue,
  placeholder,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ''} placeholder={placeholder} />
    </div>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  placeholder,
  step = '1',
}: {
  name: string;
  label: string;
  defaultValue: number | null;
  placeholder?: string;
  step?: string;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input
        id={name}
        name={name}
        type="number"
        min="0"
        step={step}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
      />
    </div>
  );
}
