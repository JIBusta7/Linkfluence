import { Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Logo Linkfluence: solo icono de cadena (sin background sólido) + wordmark.
// Coincide con el Figma: el icono es accent (success/green) y el texto es
// el foreground. Reusable en navbar landing, sidebar autenticado, demo,
// emails, etc.
export function Logo({
  className,
  textClass,
  iconClass,
  showText = true,
}: {
  className?: string;
  textClass?: string;
  iconClass?: string;
  showText?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <Link2
        className={cn('h-5 w-5 -rotate-45 text-success', iconClass)}
        strokeWidth={2.5}
      />
      {showText && (
        <span className={cn('font-bold tracking-tight', textClass)}>
          Linkfluence
        </span>
      )}
    </span>
  );
}
