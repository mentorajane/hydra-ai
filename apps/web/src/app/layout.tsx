import type { Metadata } from 'next';
import { Toaster } from 'sonner';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hydra AI - Assistente de Hidratação',
  description: 'Sua saúde começa com um gole.',
  manifest: '/manifest.json',
  themeColor: '#0088d4',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Hydra AI' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-b from-ocean-950 via-ocean-900 to-ocean-950 min-h-screen text-white antialiased">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
