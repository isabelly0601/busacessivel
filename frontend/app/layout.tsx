import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', weight: ['400','600','700','800','900'] });

export const metadata: Metadata = {
  title: 'PontoMB — Embarque Acessível',
  description: 'Assistente de embarque em ônibus para pessoas com deficiência visual',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
