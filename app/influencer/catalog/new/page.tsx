import Link from 'next/link';
import { NewProductForm } from './new-product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireRole } from '@/lib/auth';

export default async function NewProductPage() {
  await requireRole('influencer');
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <Link href="/influencer/catalog" className="text-sm text-muted-foreground hover:underline">
        ← Volver al catálogo
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Proponer un producto nuevo</CardTitle>
          <CardDescription>
            Pegá la URL del producto y dejamos que la IA pre-rellene los atributos.
            Revisá, editá si hace falta, y enviá. Queda pendiente de verificación por un admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
