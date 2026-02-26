import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { headers } from 'next/headers';
import { z } from 'zod';
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nonce = (await headers()).get('x-nonce') ?? '';

  const rawUrl = process.env.PIX3LBOARD_URL || process.env.NEXT_PUBLIC_PIX3LBOARD_URL || 'https://board.pix3ltools.com';
  const parsedUrl = z.string().url().safeParse(rawUrl);
  const pix3lConfig = {
    pix3lboardUrl: parsedUrl.success ? parsedUrl.data : 'https://board.pix3ltools.com',
  };

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <script
          nonce={nonce}
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
