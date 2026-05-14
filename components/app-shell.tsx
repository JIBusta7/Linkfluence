import Link from 'next/link';
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  Link2,
  LogOut,
  MessageSquare,
  Search,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  User,
  Users,
  Zap,
} from 'lucide-react';
import { logoutAction } from '@/app/login/actions';
import type { Role } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SidebarNav, type NavGroup } from '@/components/sidebar-nav';

const NAV_BY_ROLE: Record<Role, NavGroup[]> = {
  influencer: [
    {
      items: [
        { href: '/influencer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: '/influencer/catalog', label: 'Catálogo', icon: <ShoppingBag className="h-4 w-4" /> },
        { href: '/influencer/links', label: 'Mis links', icon: <Link2 className="h-4 w-4" /> },
        { href: '/influencer/my-submissions', label: 'Mis propuestos', icon: <Sparkles className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Ajustes',
      items: [
        { href: '/influencer/profile', label: 'Mi perfil', icon: <User className="h-4 w-4" /> },
      ],
    },
  ],
  company: [
    {
      items: [
        { href: '/company', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: '/company/search', label: 'Buscar influencers', icon: <Search className="h-4 w-4" /> },
      ],
    },
  ],
  admin: [
    {
      items: [
        { href: '/admin', label: 'Panel', icon: <LayoutDashboard className="h-4 w-4" /> },
        { href: '/admin/verification', label: 'Verificación', icon: <ShieldCheck className="h-4 w-4" /> },
        { href: '/admin/products', label: 'Productos', icon: <ShoppingBag className="h-4 w-4" /> },
        { href: '/admin/users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
      ],
    },
    {
      label: 'Tools',
      items: [
        { href: '/admin/events', label: 'Eventos', icon: <BarChart3 className="h-4 w-4" /> },
        { href: '/admin/conversions', label: 'Conversiones', icon: <Link2 className="h-4 w-4" /> },
        { href: '/admin/simulate', label: 'Simular', icon: <Zap className="h-4 w-4" /> },
      ],
    },
  ],
};

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function AppShell({
  role,
  displayName,
  children,
}: {
  role: Role;
  displayName: string;
  children: React.ReactNode;
}) {
  const nav = NAV_BY_ROLE[role];
  const initials = initialsOf(displayName);

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
            <Link2 className="h-4 w-4 -rotate-45" />
          </span>
          <span className="text-lg font-bold tracking-tight">Linkfluence</span>
        </div>

        <SidebarNav groups={nav} />

        <div className="shrink-0 border-t border-border p-3">
          <form action={logoutAction}>
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b border-border bg-surface px-4 md:px-6">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded bg-primary text-primary-foreground">
              <Link2 className="h-3.5 w-3.5 -rotate-45" />
            </span>
            <span className="text-base font-bold tracking-tight">Linkfluence</span>
          </div>

          {/* Search */}
          <div className="relative hidden flex-1 md:block md:max-w-xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar…"
              className="h-10 w-full rounded border border-transparent bg-muted/60 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:border-border focus:bg-surface focus:outline-none"
            />
          </div>

          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-label="Mensajes"
              className="hidden h-9 w-9 items-center justify-center rounded text-foreground/80 hover:bg-muted hover:text-foreground md:flex"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Notificaciones"
              className="hidden h-9 w-9 items-center justify-center rounded text-foreground/80 hover:bg-muted hover:text-foreground md:flex"
            >
              <Bell className="h-4 w-4" />
            </button>

            {/* User chip */}
            <Link
              href={role === 'influencer' ? '/influencer/profile' : '#'}
              className="ml-1 flex items-center gap-2 rounded px-2 py-1.5 hover:bg-muted"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                {initials}
              </span>
              <span className="hidden text-sm font-medium md:inline">{displayName}</span>
            </Link>

            {/* Mobile logout */}
            <form action={logoutAction} className="md:hidden">
              <Button type="submit" variant="ghost" size="icon" aria-label="Cerrar sesión">
                <LogOut className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
