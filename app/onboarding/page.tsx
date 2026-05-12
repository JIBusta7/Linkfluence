import { redirect } from 'next/navigation';
import { getSupabaseServer } from '@/lib/supabase/server';
import { CATEGORIES } from '@/lib/taxonomy';
import { completeOnboardingAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default async function OnboardingPage() {
  const supabase = await getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    // trigger debería haberlo creado; si no, algo raro pasó
    return <p className="container py-10">Cuenta en preparación. Refrescá en un momento.</p>;
  }

  if (profile.bio && (profile.categories?.length > 0 || profile.industry)) {
    redirect('/app');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="text-2xl">Completá tu perfil</CardTitle>
          <CardDescription>
            {profile.role === 'influencer'
              ? 'Contanos de qué hablás y qué productos solés recomendar.'
              : 'Contanos en qué industria estás.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={completeOnboardingAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio corta</Label>
              <Textarea id="bio" name="bio" required maxLength={280} />
            </div>

            {profile.role === 'influencer' ? (
              <div className="space-y-2">
                <Label>Categorías (seleccioná las que mejor te representen)</Label>
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c}
                      className="flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm hover:bg-accent"
                    >
                      <input type="checkbox" name="categories" value={c} />
                      <span className="capitalize">{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="industry">Industria</Label>
                <Input id="industry" name="industry" required />
              </div>
            )}

            <Button type="submit" className="w-full">Guardar y continuar</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
