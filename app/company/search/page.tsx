import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SearchWizard } from './search-wizard';

export default async function SearchPage() {
  await requireRole('company');
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Buscar influencers</h1>
        <p className="text-sm text-muted-foreground">
          Decinos qué producto querés promocionar y te recomendamos los influencers ideales.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Encontrá tu producto</CardTitle>
          <CardDescription>
            Buscá entre nuestro catálogo y Mercado Libre. Si lo encontrás, no tenés que llenar nada más.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SearchWizard />
        </CardContent>
      </Card>
    </div>
  );
}
