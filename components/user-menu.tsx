'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  Keyboard,
  LogOut,
  Monitor,
  Moon,
  Settings,
  Sun,
  User,
} from 'lucide-react';
import type { Role } from '@/lib/types';
import { logoutAction } from '@/app/login/actions';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Path al perfil según el rol del usuario.
function profileHref(role: Role): string {
  if (role === 'influencer') return '/influencer/profile';
  if (role === 'company') return '/company';
  return '/admin';
}

export function UserMenu({
  role,
  displayName,
  email,
}: {
  role: Role;
  displayName: string;
  email?: string | null;
}) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();
  const initials = initialsOf(displayName);

  // Cierre por click fuera + Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded px-2 py-1.5 transition-colors hover:bg-muted',
          open && 'bg-muted',
        )}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-success-soft text-xs font-semibold text-success">
          {initials}
        </span>
        <span className="hidden text-sm font-medium md:inline">{displayName}</span>
        <ChevronDown
          className={cn(
            'hidden h-3.5 w-3.5 text-muted-foreground transition-transform md:inline',
            open && 'rotate-180',
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-lg border border-border bg-surface shadow-float"
          >
            {/* Header: avatar + nombre + email */}
            <div className="flex items-center gap-3 border-b border-border bg-muted/30 p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-sm font-semibold text-success">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{displayName}</div>
                {email && (
                  <div className="truncate text-xs text-muted-foreground">{email}</div>
                )}
                <div className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {role}
                </div>
              </div>
            </div>

            {/* Navegación principal */}
            <div className="p-1">
              <MenuItem
                href={profileHref(role)}
                icon={<User className="h-4 w-4" />}
                label="Mi perfil"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                href={profileHref(role)}
                icon={<Settings className="h-4 w-4" />}
                label="Configuración"
                onClick={() => setOpen(false)}
              />
            </div>

            {/* Apariencia */}
            <div className="border-t border-border p-1">
              <div className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Apariencia
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                role="menuitem"
                className="flex w-full items-center justify-between rounded px-3 py-2 text-sm transition-colors hover:bg-muted"
              >
                <span className="flex items-center gap-3">
                  <AnimatePresence mode="wait" initial={false}>
                    {theme === 'dark' ? (
                      <motion.span
                        key="moon"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex h-4 w-4 items-center justify-center"
                      >
                        <Moon className="h-4 w-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="sun"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="inline-flex h-4 w-4 items-center justify-center"
                      >
                        <Sun className="h-4 w-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <span>Modo {theme === 'dark' ? 'claro' : 'oscuro'}</span>
                </span>
                <ThemeToggleSwitch dark={theme === 'dark'} />
              </button>
            </div>

            {/* Ayuda */}
            <div className="border-t border-border p-1">
              <MenuItem
                href="/demo"
                icon={<HelpCircle className="h-4 w-4" />}
                label="Demo guiada"
                onClick={() => setOpen(false)}
              />
              <MenuItem
                href="https://github.com"
                icon={<Keyboard className="h-4 w-4" />}
                label="Atajos de teclado"
                onClick={() => setOpen(false)}
                external
                disabled
              />
            </div>

            {/* Cerrar sesión */}
            <div className="border-t border-border p-1">
              <form action={logoutAction}>
                <button
                  type="submit"
                  role="menuitem"
                  className="flex w-full items-center gap-3 rounded px-3 py-2 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Cerrar sesión
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  href,
  icon,
  label,
  onClick,
  external,
  disabled,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  external?: boolean;
  disabled?: boolean;
}) {
  if (disabled) {
    return (
      <div
        role="menuitem"
        aria-disabled="true"
        className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm text-muted-foreground/50"
      >
        {icon}
        <span>{label}</span>
        <span className="ml-auto text-[10px] uppercase tracking-wider">Próximamente</span>
      </div>
    );
  }
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        role="menuitem"
        onClick={onClick}
        className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-muted"
      >
        {icon}
        <span>{label}</span>
      </a>
    );
  }
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded px-3 py-2 text-sm transition-colors hover:bg-muted"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function ThemeToggleSwitch({ dark }: { dark: boolean }) {
  // Dimensiones estilo HeadlessUI/iOS:
  //   track:  h-6 (24px) × w-11 (44px) — generosa, fácil de ver y clickear
  //   thumb:  h-5 (20px) × w-5 (20px) — 4px de gap arriba/abajo dentro del track
  //   travel: x va de 2 (off, izq) a 22 (on, der) → simétrico, 2px de margen
  return (
    <span
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        dark ? 'bg-success' : 'bg-muted-foreground/30',
      )}
    >
      <motion.span
        animate={{ x: dark ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-1 ring-black/5"
      />
    </span>
  );
}
