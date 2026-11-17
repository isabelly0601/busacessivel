import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400','600','700','800','900'] });

export const metadata: Metadata = {
  title: 'Vai de Ônibus',
  description: 'Mobilidade acessível. Autonomia para todos.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Vai de Ônibus',
  },
};

export const viewport: Viewport = {
  themeColor: '#ffc107',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#000' }}>
        {children}
        <script dangerouslySetInnerHTML={{ __html: `
          // Limpa todos os Service Workers e caches antigos
          if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
              for(let registration of registrations) { registration.unregister(); }
            });
          }
          if ('caches' in window) {
            caches.keys().then(function(names) {
              for (let name of names) { caches.delete(name); }
            });
          }
        `}} />
      </body>
    </html>
  );
}
