import Link from 'next/link';
import { signupAction } from './actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Crear cuenta</CardTitle>
          <CardDescription>Empezá en 30 segundos.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={signupAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Nombre</Label>
              <Input id="display_name" name="display_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required autoComplete="email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" name="password" type="password" required minLength={6} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select id="role" name="role" defaultValue="influencer" required>
                <option value="influencer">Soy influencer</option>
                <option value="company">Soy una empresa</option>
              </Select>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full">Crear cuenta</Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Entrá acá
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
