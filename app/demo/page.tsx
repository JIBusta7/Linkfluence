import Link from 'next/link';
import { ArrowRight, KeyRound, Play, Sparkles } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

export default function DemoPage() {
  return (
    <main className="min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <Logo textClass="text-lg" />
          </Link>
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost' }))}>
            Ir a login
          </Link>
        </div>
      </header>

      <section className="container py-16">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <Play className="h-3 w-3" /> Demo guiada
          </div>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl">
            Recorré Linkfluence en 3 pasos
          </h1>
          <p className="text-lg text-muted-foreground">
            Hay tres perfiles armados con data seed lista para usarse.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-3">
          <DemoStep
            num={1}
            title="Entrá como influencer"
            description="Explorá el catálogo global, generá tu link único en un click o proponé un producto nuevo."
            email="amy@demo.com"
          />
          <DemoStep
            num={2}
            title="Entrá como empresa"
            description='Pedí recomendaciones para "botas de cuero premium" — un producto que NO existe en el catálogo. Mirá cómo se razona por similitud.'
            email="acme@demo.com"
          />
          <DemoStep
            num={3}
            title="Entrá como admin"
            description="Revisá la cola de verificación, aprobá productos pendientes y simulá tráfico."
            email="admin@demo.com"
          />
        </div>

        <Card className="mx-auto mt-10 max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-primary" /> Caso golden
            </CardTitle>
            <CardDescription>
              El seed <strong>no incluye "botas de cuero"</strong>. Cuando una empresa las busque,
              el sistema debe razonar por similitud — productos de cuero como camperas, cinturones,
              billeteras y mochila — y rankear alto a influencers afines (Amy Urban, Martina
              Premium). Esa es la diferencia contra recomendadores basados en seguidores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login?redirectTo=/company/search" className={cn(buttonVariants())}>
              Probar el caso golden <ArrowRight className="h-4 w-4" />
            </Link>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function DemoStep({
  num,
  title,
  description,
  email,
}: {
  num: number;
  title: string;
  description: string;
  email: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          {num}
        </div>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2 text-xs font-mono">
          <KeyRound className="h-3 w-3 text-muted-foreground" />
          {email} / demo1234
        </div>
      </CardContent>
    </Card>
  );
}
