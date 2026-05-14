'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

// LogoLink — wrapper clickeable del Logo para usuarios autenticados.
// Reglas:
//   • Si estás en /influencer/profile (edición de perfil) → vas al catálogo.
//   • En cualquier otra ruta autenticada → refresh in-place (no navega,
//     re-fetcha server components manteniendo estado del cliente).
export function LogoLink({
  className,
  textClass,
  iconClass,
}: {
  className?: string;
  textClass?: string;
  iconClass?: string;
}) {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const isProfilePage = pathname.startsWith('/influencer/profile');
  const href = isProfilePage ? '/influencer/catalog' : pathname;

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isProfilePage) return; // dejar que Next navegue normalmente al catálogo
    // En el resto de rutas autenticadas: refresh in-place.
    e.preventDefault();
    router.refresh();
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={isProfilePage ? 'Ir al catálogo' : 'Refrescar página'}
    >
      <Logo textClass={textClass} iconClass={iconClass} />
    </Link>
  );
}
