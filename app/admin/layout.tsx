import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireRole('admin');
  return (
    <AppShell role="admin" displayName={profile.display_name} email={user.email ?? null}>
      {children}
    </AppShell>
  );
}
