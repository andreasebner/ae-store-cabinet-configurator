import { SiteHeader } from '@/components/landing/site-header';
import { HeroFlow } from '@/components/landing/hero-flow';
import { CabinetCatalog } from '@/components/landing/cabinet-catalog';
import { SiteFooter } from '@/components/landing/site-footer';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[hsl(var(--background))]">
      <SiteHeader />
      <main className="flex-1">
        <HeroFlow />
        <CabinetCatalog />
      </main>
      <SiteFooter />
    </div>
  );
}
