import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Linkfluence — Inteligencia comercial para influencer marketing',
  description:
    'Recomendá influencers basándote en performance real, no en seguidores. Similitud semántica entre productos para recomendar aun sin historial exacto.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={poppins.variable}>
      <body className="min-h-screen bg-background font-sans text-body-base text-foreground">
        {children}
      </body>
    </html>
  );
}
