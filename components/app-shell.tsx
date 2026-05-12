import Link from 'next/link';
import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Link2,
  LogOut,
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
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  influencer: [
    { href: '/influencer/catalog', label: 'Catálogo', icon: <ShoppingBag className="h-4 w-4" /> },
    { href: '/influencer/links', label: 'Mis links', icon: <Link2 className="h-4 w-4" /> },
    { href: '/influencer/my-submissions', label: 'Mis propuestos', icon: <Sparkles className="h-4 w-4" /> },
    { href: '/influencer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/influencer/profile', label: 'Mi perfil', icon: <User className="h-4 w-4" /> },
  ],
  company: [
    { href: '/company', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/company/search', label: 'Buscar influencers', icon: <Search className="h-4 w-4" /> },
  ],
  admin: [
    { href: '/admin', label: 'Panel', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/admin/verification', label: 'Verificación', icon: <ShieldCheck className="h-4 w-4" /> },
    { href: '/admin/products', label: 'Productos', icon: <ShoppingBag className="h-4 w-4" /> },
    { href: '/admin/users', label: 'Usuarios', icon: <Users className="h-4 w-4" /> },
    { href: '/admin/events', label: 'Eventos', icon: <BarChart3 className="h-4 w-4" /> },
    { href: '/admin/conversions', label: 'Cargar conversión', icon: <Link2 className="h-4 w-4" /> },
    { href: '/admin/simulate', label: 'Simular', icon: <Zap className="h-4 w-4" /> },
  ],
};

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

  return (
    <div className="flex min-h-screen bg-muted/20">
      <aside className="hidden w-60 shrink-0 border-r bg-background md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b px-4 text-lg font-semibold">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            i
          </span>
          INFLU
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-3 text-xs text-muted-foreground">
          <div className="mb-2 flex items-center gap-2">
            {role === 'company' ? (
              <Building2 className="h-3 w-3" />
            ) : role === 'admin' ? (
              <ShieldCheck className="h-3 w-3" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            <span className="truncate">{displayName}</span>
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="w-full justify-start">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </Button>
          </form>
        </div>
      </aside>

      <main className={cn('flex-1')}>
        <header className="flex h-16 items-center justify-between border-b bg-background px-6 md:hidden">
          <span className="text-lg font-semibold">INFLU</span>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="icon">
              <LogOut className="h-4 w-4" />
            </Button>
          </form>
        </header>
        <div className="p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
