import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'INFLU — Inteligencia comercial para influencer marketing',
  description:
    'Recomendá influencers basándote en performance real, no en seguidores. Similitud semántica entre productos para recomendar aun sin historial exacto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans text-body-base text-foreground">
        {children}
      </body>
    </html>
  );
}
