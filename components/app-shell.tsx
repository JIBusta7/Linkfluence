import {
  BarChart3,
  LayoutDashboard,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  ShoppingBag,
  Users,
  Zap,
} from 'lucide-react';
import type { Role } from '@/lib/types';
import { SidebarNav, type NavGroup } from '@/components/sidebar-nav';
import { Logo } from '@/components/logo';
import { UserMenu } from '@/components/user-menu';

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

export function AppShell({
  role,
  displayName,
  email,
  children,
}: {
  role: Role;
  displayName: string;
  email?: string | null;
  children: React.ReactNode;
}) {
  const nav = NAV_BY_ROLE[role];

  return (
    <div className="flex min-h-screen bg-page">
      {/* Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-surface md:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-border px-5">
          <Logo textClass="text-lg" />
        </div>

        <SidebarNav groups={nav} />

        {/* Pie del sidebar — branding mínimo (cerrar sesión se mueve al UserMenu) */}
        <div className="shrink-0 border-t border-border px-5 py-3 text-[11px] text-muted-foreground">
          © Linkfluence · MVP
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 md:px-6">
          {/* Mobile logo */}
          <div className="md:hidden">
            <Logo textClass="text-base" iconClass="h-4 w-4" />
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
            <UserMenu role={role} displayName={displayName} email={email} />
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
