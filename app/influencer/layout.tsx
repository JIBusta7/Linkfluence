import { requireRole } from '@/lib/auth';
import { AppShell } from '@/components/app-shell';

export default async function InfluencerLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole('influencer');
  return (
    <AppShell role="influencer" displayName={profile.display_name}>
      {children}
    </AppShell>
  );
}
