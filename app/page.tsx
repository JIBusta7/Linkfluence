'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChevronDown,
  Eye,
  Link2,
  Lock,
  MessageSquare,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import {
  AnimatedCounter,
  FadeUp,
  HoverLift,
  Stagger,
  StaggerItem,
} from '@/components/animations';
import { Logo } from '@/components/logo';
import { cn } from '@/lib/utils';

// =========================================================================
// PAGE
// =========================================================================
export default function LandingPage() {
  // force-light: la landing pública siempre se renderiza en modo claro
  // aunque el usuario tenga el toggle dark mode activado (la app autenticada
  // sí respeta su preferencia). Override de las CSS variables — ver globals.css.
  return (
    <main className="force-light min-h-screen bg-surface text-foreground">
      <NavBar />
      <Hero />
      <StatsStrip />
      <HowItWorks />
      <FeaturesGrid />
      <ForWho />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </main>
  );
}

// =========================================================================
// NavBar — sticky con leve background blur al scrollear
// =========================================================================
function NavBar() {
  const { scrollY } = useScroll();
  const bgOpacity = useTransform(scrollY, [0, 80], [0.7, 0.98]);
  const borderOpacity = useTransform(scrollY, [0, 80], [0, 1]);

  return (
    <motion.header
      style={{
        backgroundColor: 'hsl(0 0% 100% / var(--nav-bg))',
        borderBottomColor: 'hsl(0 0% 89% / var(--nav-border))',
        // @ts-expect-error CSS custom properties via motion
        '--nav-bg': bgOpacity,
        '--nav-border': borderOpacity,
      }}
      className="sticky top-0 z-50 border-b backdrop-blur-md"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <Logo textClass="text-lg" />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#como-funciona" className="hover:text-foreground transition-colors">Cómo funciona</a>
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          <Link href="/demo" className="hover:text-foreground transition-colors">Demo</Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }))}>
            Ingresar
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link href="/signup" className={cn(buttonVariants({ size: 'sm' }))}>
              Crear cuenta
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}

// =========================================================================
// Hero — title con stagger de líneas, mockup flotante, blobs decorativos
// =========================================================================
function Hero() {
  return (
    <section className="relative overflow-hidden border-b bg-surface">
      {/* Decorative blobs */}
      <motion.div
        animate={{ y: [0, -20, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-32 -right-24 h-72 w-72 rounded-full bg-success/20 blur-3xl"
      />
      <motion.div
        animate={{ y: [0, 20, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 py-20 md:grid-cols-2 md:py-28">
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success"
          >
            <Sparkles className="h-3 w-3" /> Inteligencia comercial con IA
          </motion.div>

          <h1 className="text-balance text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl">
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="block"
            >
              Elegí influencers
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
              className="block"
            >
              por <span className="text-success">performance real</span>,
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
              className="block"
            >
              no por seguidores.
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
            className="max-w-xl text-base text-muted-foreground md:text-lg"
          >
            Linkfluence construye un perfil comercial objetivo de cada influencer a partir
            de links trackeables únicos. Recomienda el talento ideal para tu producto —
            incluso si es nuevo en el mercado.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link href="/signup" className={cn(buttonVariants({ size: 'lg' }), 'group')}>
                Empezar gratis{' '}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/demo"
                className={cn(buttonVariants({ variant: 'outline', size: 'lg' }))}
              >
                Ver demo guiada
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap items-center gap-5 pt-2 text-xs text-muted-foreground"
          >
            <div className="flex items-center gap-1 text-success">
              <ShieldCheck className="h-3.5 w-3.5" /> Catálogo verificado
            </div>
            <div className="flex items-center gap-1">
              <BadgeCheck className="h-3.5 w-3.5 text-success" /> Anti-fraude integrado
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-success" /> Tracking anónimo
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
          className="relative"
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}

function HeroMockup() {
  const categories = [
    { name: 'moda', pct: 64 },
    { name: 'tech', pct: 22 },
    { name: 'belleza', pct: 14 },
  ];
  const bars = [24, 38, 22, 56, 42, 70, 48];
  return (
    <motion.div
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      className="space-y-4 rounded-lg border bg-surface p-5 shadow-float"
    >
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Tu link personal
        </div>
        <div className="flex items-center gap-2 rounded border bg-muted/30 px-3 py-2 text-sm font-mono">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="truncate">
            linkfluence.app/r/<span className="font-semibold text-foreground">AmY9X</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded border bg-surface p-3">
          <div className="text-2xl font-bold leading-tight">
            <AnimatedCounter value={223} />
          </div>
          <div className="text-xs text-muted-foreground">Clicks únicos</div>
          <div className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-success">
            <TrendingUp className="h-3 w-3" /> +22.4%
          </div>
        </div>
        <div className="rounded border bg-surface p-3">
          <div className="text-2xl font-bold leading-tight">
            <AnimatedCounter value={49} format={(n) => `${n.toFixed(1)}%`} />
          </div>
          <div className="text-xs text-muted-foreground">CR global</div>
          <div className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-semibold text-success">
            <TrendingUp className="h-3 w-3" /> +1.2pp
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex h-16 items-end justify-between gap-1">
          {bars.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${(h / 70) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 rounded-sm bg-success/40"
            />
          ))}
        </div>
        <div className="text-right text-[10px] text-muted-foreground">últimos 7 días</div>
      </div>

      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Categorías top
        </div>
        {categories.map((c, i) => (
          <div key={c.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium capitalize">{c.name}</span>
              <span className="text-muted-foreground">{c.pct}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${c.pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="h-full rounded-full bg-success"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// =========================================================================
// StatsStrip — números animados con counter
// =========================================================================
function StatsStrip() {
  const stats = [
    { value: 120, label: 'productos verificados', suffix: '+' },
    { value: 15, label: 'influencers demo', suffix: '+' },
    { value: 2000, label: 'clicks trackeados', suffix: '+' },
    { value: 6.8, label: 'CR promedio top-10', suffix: '%', format: (n: number) => n.toFixed(1) },
  ];
  return (
    <section className="border-b bg-page">
      <div className="container grid grid-cols-2 divide-y sm:divide-y-0 md:grid-cols-4 md:divide-x">
        {stats.map((s, i) => (
          <FadeUp
            key={s.label}
            delay={i * 0.08}
            className="px-4 py-8 text-center md:px-6"
          >
            <div className="text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              <AnimatedCounter
                value={s.value}
                suffix={s.suffix ?? ''}
                format={s.format}
              />
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{s.label}</div>
          </FadeUp>
        ))}
      </div>
    </section>
  );
}

// =========================================================================
// How it works — 3 pasos verticales con ilustración
// =========================================================================
function HowItWorks() {
  const steps = [
    {
      num: '01',
      icon: <Search className="h-6 w-6" />,
      title: 'Encontrá tu producto',
      body: 'El influencer navega el catálogo de productos verificados y elige el que mejor encaja con su audiencia. Si no lo encuentra, lo propone para verificación.',
      color: 'bg-success-soft text-success',
    },
    {
      num: '02',
      icon: <Link2 className="h-6 w-6" />,
      title: 'Generá tu link único',
      body: 'En un click se crea un link trackeable atado a tu perfil. Lo compartís en tus redes, stories, bio — donde quieras. Cada visita queda asociada a vos.',
      color: 'bg-primary/5 text-primary',
    },
    {
      num: '03',
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Mirá tu performance',
      body: 'Dashboard con clicks únicos, CR, mejores categorías, horarios pico, dispositivos. Los datos suman a tu perfil comercial — las marcas te encuentran por evidencia.',
      color: 'bg-success-soft text-success',
    },
  ];
  return (
    <section id="como-funciona" className="border-b bg-surface py-24">
      <div className="container space-y-14">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <FadeUp>
            <span className="text-xs font-semibold uppercase tracking-wider text-success">
              Cómo funciona
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Tres pasos para conectar data con decisiones.
            </h2>
          </FadeUp>
          <FadeUp delay={0.16}>
            <p className="text-muted-foreground">
              Pensado para que un influencer arranque en menos de 5 minutos y una marca tome
              decisiones con evidencia, no con corazonadas.
            </p>
          </FadeUp>
        </div>

        <Stagger className="grid gap-6 md:grid-cols-3">
          {steps.map((s) => (
            <StaggerItem key={s.num}>
              <HoverLift className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-lg border bg-surface p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'inline-flex h-12 w-12 items-center justify-center rounded',
                        s.color,
                      )}
                    >
                      {s.icon}
                    </span>
                    <span className="text-3xl font-bold text-muted-foreground/30">
                      {s.num}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{s.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// =========================================================================
// Features grid — 6 cards con iconos
// =========================================================================
function FeaturesGrid() {
  const items = [
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Dashboard de performance',
      body: 'KPIs, CR por categoría, tendencias semanales y evolución temporal.',
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
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Anti-fraude integrado',
      body: 'Filtro de bots, rate limit por IP y conteo de clicks únicos.',
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: 'Explicaciones naturales',
      body: 'IA redacta por qué cada influencer encaja con tu producto.',
    },
    {
      icon: <MousePointerClick className="h-5 w-5" />,
      title: 'Atribución simple',
      body: 'Cupones personales, carga manual y simulación controlada.',
    },
  ];
  return (
    <section id="features" className="border-b bg-page py-24">
      <div className="container space-y-12">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <FadeUp>
            <span className="text-xs font-semibold uppercase tracking-wider text-success">
              Features
            </span>
          </FadeUp>
          <FadeUp delay={0.08}>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Todo lo que necesitás en un solo lugar.
            </h2>
          </FadeUp>
        </div>
        <Stagger className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <StaggerItem key={it.title}>
              <HoverLift>
                <div className="h-full rounded-lg border bg-surface p-6 transition-shadow hover:shadow-md">
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-success-soft text-success">
                    {it.icon}
                  </div>
                  <h3 className="mt-4 text-base font-semibold">{it.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// =========================================================================
// ForWho — dos columnas (Marcas / Influencers)
// =========================================================================
function ForWho() {
  return (
    <section className="border-b bg-surface py-24">
      <div className="container space-y-12">
        <FadeUp className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-success">
            Para vos
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Diseñado para ambos lados del mercado.
          </h2>
        </FadeUp>

        <div className="grid gap-6 md:grid-cols-2">
          <FadeUp delay={0.08}>
            <HoverLift>
              <div className="h-full space-y-4 rounded-lg border bg-page p-8">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/5 px-3 py-1 text-xs font-semibold text-primary">
                  <Users className="h-3 w-3" /> Para marcas
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Encontrá el talento ideal
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Subí tu producto y recibí un ranking de influencers ordenado por fit score,
                  con explicación natural de por qué cada uno encaja. Decidí por data, no por
                  capturas de seguidores.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    'Recomendaciones con IA',
                    'CR real, no estimado',
                    'Histórico verificable',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-soft">
                        <BadgeCheck className="h-3 w-3 text-success" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </HoverLift>
          </FadeUp>

          <FadeUp delay={0.16}>
            <HoverLift>
              <div className="h-full space-y-4 rounded-lg border bg-page p-8">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success">
                  <Sparkles className="h-3 w-3" /> Para influencers
                </div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Demostrá tu performance real
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Construí un perfil comercial con data verificable. Cada click cuenta y suma a
                  tu historial. Las marcas te encuentran por evidencia — dejá de competir solo
                  por followers.
                </p>
                <ul className="space-y-2 text-sm">
                  {[
                    'Dashboard con stats reales',
                    'Trends de últimos 7 días',
                    'Top productos y dispositivos',
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-success-soft">
                        <BadgeCheck className="h-3 w-3 text-success" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </HoverLift>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Testimonials
// =========================================================================
function Testimonials() {
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
    <section className="border-b bg-page py-24">
      <div className="container space-y-12">
        <FadeUp className="mx-auto max-w-2xl space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-success">
            Testimonios
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Quienes ya lo usan.
          </h2>
        </FadeUp>
        <Stagger className="grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <StaggerItem key={t.name}>
              <HoverLift className="h-full">
                <div className="h-full rounded-lg border bg-surface p-6">
                  <div className="mb-3 flex items-center gap-0.5 text-success">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90">"{t.text}"</p>
                  <div className="mt-4 flex items-center gap-3 border-t pt-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-success-soft text-xs font-semibold text-success">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{t.name}</div>
                      <div className="text-xs text-muted-foreground">{t.role}</div>
                    </div>
                  </div>
                </div>
              </HoverLift>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

// =========================================================================
// FAQ — accordion animado
// =========================================================================
function FAQ() {
  const items = [
    {
      q: '¿Cómo se cuentan los clicks?',
      a: 'Cada visita a tu link único queda asociada a tu perfil. Aplicamos 3 capas anti-fraude: filtro de bots por user agent, rate limit por IP (un mismo dispositivo no cuenta 2 veces en 30s) y mostramos también clicks únicos para que las marcas decidan con la métrica más honesta.',
    },
    {
      q: '¿Necesito acceso a la API de Mercado Libre?',
      a: 'No. El catálogo viene poblado con productos reales y el redirect lleva al sitio externo. Si tenés acceso a APIs específicas (eBay, ML certificado, etc.), se pueden integrar.',
    },
    {
      q: '¿Cómo se atribuyen las ventas (conversiones)?',
      a: 'Mediante cupón personal opcional. Si la marca carga ventas indicando tu código, se atribuyen automáticamente a tu cuenta. Sin cupón, solo se trackean los clicks.',
    },
    {
      q: '¿La data del influencer es pública?',
      a: 'El perfil comercial (clicks, CR, categorías top) es visible para las marcas registradas que hagan búsquedas. Los datos personales nunca se exponen.',
    },
    {
      q: '¿Cuánto cuesta usar Linkfluence?',
      a: 'El MVP es gratuito y corre en tiers gratuitos de Vercel y Supabase. Es un proyecto universitario abierto.',
    },
  ];
  return (
    <section id="faq" className="border-b bg-surface py-24">
      <div className="container max-w-3xl space-y-10">
        <FadeUp className="space-y-3 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-success">
            FAQ
          </span>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Preguntas frecuentes
          </h2>
        </FadeUp>
        <Stagger className="space-y-3">
          {items.map((it, i) => (
            <StaggerItem key={i}>
              <FAQItem question={it.q} answer={it.a} />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="overflow-hidden rounded-lg border bg-page">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold transition-colors hover:bg-muted/40"
      >
        <span>{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown className="h-4 w-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =========================================================================
// Final CTA
// =========================================================================
function FinalCTA() {
  return (
    <section className="bg-surface py-24">
      <div className="container">
        <FadeUp>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-lg border bg-primary p-10 text-center text-primary-foreground md:p-16">
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full bg-success/30 blur-2xl"
            />
            <motion.div
              animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-success/20 blur-2xl"
            />
            <h2 className="relative text-3xl font-bold tracking-tight md:text-5xl">
              ¿Listo para decidir con evidencia?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-base text-primary-foreground/80">
              Sumate a Linkfluence en menos de 30 segundos. Sin tarjeta, sin compromiso.
            </p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded bg-success px-6 py-3 text-sm font-semibold text-white shadow-lg transition-shadow hover:shadow-xl"
                >
                  Crear cuenta gratis <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
                <Link
                  href="/demo"
                  className="inline-flex items-center gap-2 rounded border border-primary-foreground/30 bg-transparent px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
                >
                  <Eye className="h-4 w-4" /> Ver demo
                </Link>
              </motion.div>
            </div>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}

// =========================================================================
// Footer
// =========================================================================
function Footer() {
  return (
    <footer className="border-t bg-surface">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 text-xs text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <Logo textClass="text-sm" iconClass="h-4 w-4" />
          <span>· Proyecto universitario — Diseño Interactivo.</span>
        </div>
        <div className="flex gap-5">
          <Link href="/demo" className="transition-colors hover:text-foreground">Demo</Link>
          <Link href="/login" className="transition-colors hover:text-foreground">Ingresar</Link>
          <Link href="/signup" className="transition-colors hover:text-foreground">Crear cuenta</Link>
        </div>
      </div>
    </footer>
  );
}
