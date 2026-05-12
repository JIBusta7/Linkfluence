import { requireRole } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimulatePanel } from './simulate-panel';

export default async function SimulatePage() {
  await requireRole('admin');
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Simulador de tráfico</h1>
        <p className="text-muted-foreground">
          Genera clicks y conversiones coherentes para que la demo luzca poblada.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Ejecutar simulación</CardTitle>
          <CardDescription>
            Usa distribuciones sesgadas por la afinidad de cada influencer con la categoría del producto.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SimulatePanel />
        </CardContent>
      </Card>
    </div>
  );
}
