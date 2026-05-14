'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, CheckCircle2, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CATEGORIES } from '@/lib/taxonomy';
import type { Profile } from '@/lib/types';
import { cn } from '@/lib/utils';
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
  const [editing, setEditing] = useState(false);
  // resetKey: al cancelar, cambiamos este key para forzar re-mount del form
  // y resetear los inputs a sus defaultValue del profile original.
  const [resetKey, setResetKey] = useState(0);

  const toggleCategory = (c: string) => {
    if (!editing) return;
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
      if (res.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setEditing(false);
        router.refresh();
        window.setTimeout(() => setSaved(false), 2500);
      }
    });
  };

  const cancelEdit = () => {
    setEditing(false);
    setCategories(profile.categories ?? []);
    setAvatarUrl(profile.avatar_url ?? '');
    setError(null);
    setSaved(false);
    setResetKey((k) => k + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header con toggle edit mode */}
      <div className="flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium">Modo:</span>{' '}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={editing ? 'edit' : 'view'}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              className={cn(
                'inline-block rounded px-2 py-0.5 text-xs font-medium',
                editing ? 'bg-success-soft text-success' : 'bg-muted text-muted-foreground',
              )}
            >
              {editing ? 'Editando' : 'Vista'}
            </motion.span>
          </AnimatePresence>
        </div>
        {!editing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setEditing(true)}
            className="gap-2"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar perfil
          </Button>
        )}
      </div>

      <form key={resetKey} onSubmit={handleSubmit} className="space-y-6">
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
            {editing && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-1 -right-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-card shadow-sm hover:bg-muted"
                aria-label="Cambiar foto"
              >
                <Camera className="h-3.5 w-3.5" />
              </motion.button>
            )}
          </div>
          <div className="text-sm">
            <div className="font-medium">Foto de perfil</div>
            <div className="text-xs text-muted-foreground">
              {editing ? 'JPG/PNG, hasta 2 MB. Se ve cuadrada.' : 'Imagen pública.'}
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
            <Input
              id="display_name"
              name="display_name"
              defaultValue={profile.display_name}
              required
              readOnly={!editing}
              tabIndex={editing ? 0 : -1}
              className={cn(!editing && 'cursor-default bg-muted/40')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Input
              id="location"
              name="location"
              defaultValue={profile.location ?? ''}
              placeholder="Montevideo, UY"
              readOnly={!editing}
              tabIndex={editing ? 0 : -1}
              className={cn(!editing && 'cursor-default bg-muted/40')}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio ?? ''}
            rows={3}
            maxLength={280}
            readOnly={!editing}
            tabIndex={editing ? 0 : -1}
            className={cn(!editing && 'cursor-default bg-muted/40')}
          />
        </div>

        {/* Categorías */}
        <div className="space-y-2">
          <Label>Categorías</Label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {CATEGORIES.map((c) => {
              const active = categories.includes(c);
              return (
                <label
                  key={c}
                  className={cn(
                    'flex items-center gap-2 rounded-md border p-2 text-sm',
                    editing ? 'cursor-pointer hover:bg-muted' : 'cursor-default',
                    active && !editing && 'border-success/40 bg-success-soft/40',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleCategory(c)}
                    disabled={!editing}
                    className="h-4 w-4 accent-[hsl(var(--primary))]"
                  />
                  <span className="capitalize">{c}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Redes */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Redes sociales</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <SocialField name="instagram_handle" label="Instagram" defaultValue={profile.instagram_handle} placeholder="@usuario" editing={editing} />
            <SocialField name="tiktok_handle" label="TikTok" defaultValue={profile.tiktok_handle} placeholder="@usuario" editing={editing} />
            <SocialField name="youtube_handle" label="YouTube" defaultValue={profile.youtube_handle} placeholder="@canal" editing={editing} />
            <SocialField name="twitter_handle" label="X / Twitter" defaultValue={profile.twitter_handle} placeholder="@usuario" editing={editing} />
          </div>
        </div>

        {/* Métricas + costo */}
        <div>
          <h3 className="mb-2 text-sm font-semibold">Audiencia y costo de contratación</h3>
          <p className="mb-3 text-xs text-muted-foreground">
            Estos números los ven las empresas al recibir tu recomendación.
          </p>
          <div className="grid gap-3 md:grid-cols-2">
            <NumberField name="followers_total" label="Seguidores totales" defaultValue={profile.followers_total} placeholder="45000" editing={editing} />
            <NumberField name="reach_estimate" label="Alcance promedio (personas)" defaultValue={profile.reach_estimate} placeholder="12000" editing={editing} />
            <NumberField name="hire_cost_min" label="Costo desde (USD)" defaultValue={profile.hire_cost_min} placeholder="200" step="any" editing={editing} />
            <NumberField name="hire_cost_max" label="Costo hasta (USD)" defaultValue={profile.hire_cost_max} placeholder="800" step="any" editing={editing} />
          </div>
        </div>

        {/* Footer: solo aparece en modo edición */}
        <AnimatePresence>
          {editing && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              className="flex flex-wrap items-center gap-3 border-t pt-4"
            >
              <Button type="submit" disabled={pending}>
                {pending ? 'Guardando…' : 'Guardar cambios'}
              </Button>
              <Button type="button" variant="outline" onClick={cancelEdit} disabled={pending}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
              {error && <span className="text-sm text-destructive">{error}</span>}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmación post-guardado (visible incluso fuera de modo edición) */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="inline-flex items-center gap-1 rounded bg-success-soft px-3 py-1.5 text-sm font-medium text-success"
            >
              <CheckCircle2 className="h-4 w-4" /> Cambios guardados
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}

function SocialField({
  name,
  label,
  defaultValue,
  placeholder,
  editing,
}: {
  name: string;
  label: string;
  defaultValue: string | null;
  placeholder?: string;
  editing: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-xs">{label}</Label>
      <Input
        id={name}
        name={name}
        defaultValue={defaultValue ?? ''}
        placeholder={placeholder}
        readOnly={!editing}
        tabIndex={editing ? 0 : -1}
        className={cn(!editing && 'cursor-default bg-muted/40')}
      />
    </div>
  );
}

function NumberField({
  name,
  label,
  defaultValue,
  placeholder,
  step = '1',
  editing,
}: {
  name: string;
  label: string;
  defaultValue: number | null;
  placeholder?: string;
  step?: string;
  editing: boolean;
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
        readOnly={!editing}
        tabIndex={editing ? 0 : -1}
        className={cn(!editing && 'cursor-default bg-muted/40')}
      />
    </div>
  );
}
