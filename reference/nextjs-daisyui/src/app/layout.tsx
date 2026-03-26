import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cabinet Configurator — daisyUI',
  description: 'Control cabinet configurator built with Next.js and daisyUI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="corporate">
      <body className="h-full bg-base-200">{children}</body>
    </html>
  );
}
