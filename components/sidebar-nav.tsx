'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export interface NavGroup {
  label?: string;
  items: NavItem[];
}

export function SidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-6 overflow-y-auto p-4">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <div className="mb-2 px-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {group.label}
            </div>
          )}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
