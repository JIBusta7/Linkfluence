import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Link2,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-surface">
      <NavBar />
      <Hero />
      <StatsStrip />
      <WhatIsSection />
      <FeaturesGrid />
      <HowItWorks />
      <TestimonialsSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// -------------------------------------------------------------------------
function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-surface/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded bg-primary text-sm font-bold text-primary-foreground">
            i
          </span>
          <span className="text-lg tracking-tight">INFLU</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#como-funciona" className="hover:text-foreground">Cómo funciona</a>
          <Link href="/demo" className="hover:text-foreground">Demo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Ingresar
          </Link>
          <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
            Crear cuenta
          </Link>
        </div>
      </div>
    </header>
  );
}

// -------------------------------------------------------------------------
function Hero() {
  return (
    <section className="border-b bg-surface">
      <div className="container grid items-center gap-12 py-16 md:grid-cols-2 md:py-24">
        <div className="space-y-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3 w-3" /> Inteligencia comercial con IA
          </span>
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            Elegí influencers por <span className="text-primary">performance real</span>,
            no por seguidores.
          </h1>
          <p className="max-w-xl text-base text-muted-foreground">
            INFLU construye un perfil comercial objetivo de cada influencer a partir de links
            trackeables únicos. Y recomienda el talento ideal para tu producto — aun si es nuevo.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
              Empezar gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Ver demo guiada
            </Link>
          </div>
          <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1 text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Catálogo verificado
            </div>
            <div className="flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-success" /> +15 influencers demo
            </div>
          </div>
        </div>

        <div className="relative">
          <ProductGridPreview />
        </div>
      </div>
    </section>
  );
}

function ProductGridPreview() {
  const items = [
    { name: 'Campera de cuero marrón', price: 280, cat: 'moda', seed: 'campera-cuero' },
    { name: 'Zapatillas running Pro', price: 180, cat: 'deportes', seed: 'zapatillas' },
    { name: 'Auriculares inalámbricos pro', price: 220, cat: 'tech', seed: 'auriculares' },
    { name: 'Perfume premium 100ml', price: 180, cat: 'belleza', seed: 'perfume' },
  ];
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((p) => (
        <div
          key={p.seed}
          className="overflow-hidden rounded-lg border bg-surface shadow-sm"
        >
          <div className="aspect-square w-full overflow-hidden bg-muted">
            <img
              src={`https://picsum.photos/seed/${p.seed}/400/400`}
              alt={p.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-1 p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {p.cat}
            </div>
            <div className="line-clamp-1 text-sm font-medium">{p.name}</div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-price">US$ {p.price}</span>
              <span className="flex items-center gap-0.5 text-[10px] font-medium text-success">
                <ShieldCheck className="h-3 w-3" /> Verificado
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// -------------------------------------------------------------------------
function StatsStrip() {
  const stats = [
    { value: '43', label: 'Productos en catálogo' },
    { value: '+15', label: 'Influencers activos' },
    { value: '2.000+', label: 'Clicks trackeados' },
    { value: '6.8%', label: 'CR promedio top-10' },
  ];
  return (
    <section className="border-b bg-page">
      <div className="container grid grid-cols-2 divide-y sm:divide-y-0 md:grid-cols-4 md:divide-x">
        {stats.map((s) => (
          <div key={s.label} className="px-4 py-6 text-center md:px-6">
            <div className="text-2xl font-bold text-foreground md:text-3xl">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function WhatIsSection() {
  const cards = [
    {
      icon: <Link2 className="h-5 w-5" />,
      title: 'Links únicos trackeables',
      body: 'Cada influencer genera su link personal sobre productos verificados.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Catálogo curado',
      body: 'Los productos pasan por verificación antes de estar disponibles.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Recomendación con IA',
      body: 'Fit score + similitud semántica para encontrar el match ideal.',
    },
  ];
  return (
    <section id="features" className="border-b bg-surface py-20">
      <div className="container space-y-12">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            ¿Qué es INFLU?
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Una plataforma de inteligencia comercial para marketing con influencers.
          </h2>
          <p className="text-muted-foreground">
            Decisiones basadas en data real, no en seguidores. Pensada para marcas,
            influencers y administradores que valoran la evidencia.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {cards.map((c) => (
            <div
              key={c.title}
              className="rounded-lg border bg-surface p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                {c.icon}
              </div>
              <h3 className="mt-4 text-base font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function FeaturesGrid() {
  const items = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Dashboard de performance',
      body: 'KPIs, CR por categoría y evolución temporal de cada influencer.',
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: 'Perfil comercial objetivo',
      body: 'Cada click y conversión suma al historial público del influencer.',
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: 'Búsqueda semántica',
      body: 'Aún sin historial exacto, la IA encuentra matches por similitud.',
    },
    {
      icon: <BadgeCheck className="h-5 w-5" />,
      title: 'Productos verificados',
      body: 'Cola de aprobación con clasificación automática por IA.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Explicaciones naturales',
      body: 'Claude redacta por qué cada influencer encaja con tu producto.',
    },
    {
      icon: <Link2 className="h-5 w-5" />,
      title: 'Atribución simple',
      body: 'Cupones personales + carga manual + simulación controlada.',
    },
  ];
  return (
    <section className="border-b bg-page py-20">
      <div className="container space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Features
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Todo lo que necesitás en un solo lugar.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.title} className="rounded-lg border bg-surface p-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-accent text-accent-foreground">
                {it.icon}
              </div>
              <h3 className="mt-4 text-sm font-semibold">{it.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'El influencer explora el catálogo',
      body: 'Busca entre productos verificados y genera su link trackeable único. Si no lo encuentra, lo propone al catálogo.',
    },
    {
      num: '02',
      title: 'El sistema registra clicks y conversiones',
      body: 'Cada visita queda atribuida al influencer. Las conversiones llegan por cupón, carga manual o simulación controlada.',
    },
    {
      num: '03',
      title: 'La empresa busca recomendaciones',
      body: 'Ingresa un producto y INFLU devuelve un ranking con fit score y explicación natural por cada influencer.',
    },
  ];
  return (
    <section id="como-funciona" className="border-b bg-surface py-20">
      <div className="container space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Cómo funciona
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Tres pasos para matchear data con decisiones.
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="space-y-3 rounded-lg border bg-surface p-6">
              <div className="text-3xl font-bold text-primary">{s.num}</div>
              <h3 className="text-base font-semibold">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function TestimonialsSection() {
  const items = [
    {
      name: 'Sofía Ramos',
      role: 'Head of Growth · ACME Fashion',
      text: 'Encontramos 3 influencers con afinidad real a cuero urbano que ni estaban en nuestro radar. Cerramos campaña en 2 días.',
    },
    {
      name: 'Martín Álvarez',
      role: 'Influencer lifestyle · 45K followers',
      text: 'Por primera vez puedo mostrar mi performance con números reales, no con capturas. Las marcas me escriben primero.',
    },
    {
      name: 'Laura Peña',
      role: 'Brand manager · GlowLab',
      text: 'La explicación de por qué cada influencer encaja vale oro. Justifica el presupuesto frente a dirección sin vueltas.',
    },
  ];
  return (
    <section className="border-b bg-page py-20">
      <div className="container space-y-10">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Testimonios
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Lo que dicen quienes ya lo usan.
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <div key={t.name} className="rounded-lg border bg-surface p-6">
              <div className="mb-3 flex items-center gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-foreground/90">"{t.text}"</p>
              <div className="mt-4 flex items-center gap-3 border-t pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                  {t.name.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function FinalCTA() {
  return (
    <section className="bg-surface py-20">
      <div className="container">
        <div className="mx-auto max-w-3xl rounded-xl border bg-accent p-10 text-center md:p-14">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            ¿Listo para recomendar (y ser recomendado) con data real?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Sumate a INFLU y dejá de decidir a ciegas.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }))}>
              Crear cuenta gratis <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
            >
              Ver demo guiada
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// -------------------------------------------------------------------------
function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-primary text-[11px] font-bold text-primary-foreground">
            i
          </span>
          © INFLU. Proyecto universitario — Diseño Interactivo.
        </div>
        <div className="flex gap-4">
          <Link href="/demo" className="hover:text-foreground">Demo</Link>
          <Link href="/login" className="hover:text-foreground">Ingresar</Link>
          <Link href="/signup" className="hover:text-foreground">Crear cuenta</Link>
        </div>
      </div>
    </footer>
  );
}

