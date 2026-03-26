import type { Metadata } from 'next';
import { Chakra_Petch, Instrument_Sans } from 'next/font/google';
import './globals.css';

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-chakra',
  display: 'swap',
});

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-instrument',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CabinetPro — Electric Blueprint Configurator',
  description: 'Configure and order custom control cabinets with precision cutouts',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${chakraPetch.variable} ${instrumentSans.variable}`}>
      <body className="font-instrument">{children}</body>
    </html>
  );
}
