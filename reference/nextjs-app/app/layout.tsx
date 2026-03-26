import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CabinetPro — Control Cabinet Configurator',
  description: 'Configure and order custom control cabinets with precision cutouts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
