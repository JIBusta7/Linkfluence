import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default async function CompanyLayout({ children }: { children: React.ReactNode }) {
  const { profile, user } = await requireRole('company');
  return (
    <AppShell role="company" displayName={profile.display_name} email={user.email ?? null}>
      {children}
    </AppShell>
  );
}
