'use client';

import { motion, useInView, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

// ─────────────────────────────────────────────────────────────────────────
// FadeUp — animación de entrada estándar con scroll trigger.
// La curva de easing y los timings emulan el feel de Linear / Vercel.
// ─────────────────────────────────────────────────────────────────────────
export function FadeUp({
  children,
  delay = 0,
  className,
  as = 'div',
  y = 24,
  amount = 0.2,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: 'div' | 'section' | 'header' | 'footer' | 'span' | 'li' | 'h1' | 'h2' | 'h3' | 'p';
  y?: number;
  amount?: number;
  once?: boolean;
}) {
  const MotionTag = motion[as] as typeof motion.div;
  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </MotionTag>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// Stagger — orquesta la entrada de hijos en cascada.
// Útil para grids de cards o listas.
// ─────────────────────────────────────────────────────────────────────────
export function Stagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  y = 20,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// AnimatedCounter — número que cuenta hacia arriba al entrar en viewport.
// El easing es exponencial lento al final, como un odómetro real.
// ─────────────────────────────────────────────────────────────────────────
export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  duration = 1.6,
  format,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) =>
    format ? format(latest) : Math.round(latest).toLocaleString('es-AR'),
  );
  const inView = useInView(ref, { once: true, amount: 0.5 });

  useEffect(() => {
    if (inView) {
      const controls = animate(motionValue, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    }
  }, [inView, value, duration, motionValue]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// HoverLift — eleva el elemento al hover con sombra. Reutilizable para
// cualquier card. Usa spring physics para feel orgánico.
// ─────────────────────────────────────────────────────────────────────────
export function HoverLift({
  children,
  className,
  scale = 1.02,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
