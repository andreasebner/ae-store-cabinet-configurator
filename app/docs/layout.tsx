import { SiteHeader } from '@/components/landing/site-header';
import { SiteFooter } from '@/components/landing/site-footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { DocsNav } from '@/components/docs/docs-nav';

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <SiteHeader />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex gap-10">
        <DocsNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
