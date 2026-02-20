import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/components/providers/AppProvider';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Pix3lWiki - Knowledge Base',
  description: 'Wiki companion for Pix3lBoard. Document your projects, share knowledge.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pix3lConfig = {
    pix3lboardUrl: process.env.PIX3LBOARD_URL || 'http://localhost:3000',
  };

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__PIX3L_CONFIG__ = ${JSON.stringify(pix3lConfig)};`,
          }}
        />
        <AppProvider>
          {children}
          <ToastContainer />
          <ConfirmDialog />
        </AppProvider>
      </body>
    </html>
  );
}
