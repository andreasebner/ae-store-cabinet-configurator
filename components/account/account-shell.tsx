'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { SiteHeader } from '@/components/landing/site-header';
import { SiteFooter } from '@/components/landing/site-footer';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { AccountNav } from '@/components/account/account-nav';

export function AccountShell({ children }: { children: React.ReactNode }) {
  const { customer, hydrate } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    hydrate();
    setMounted(true);
  }, [hydrate]);

  useEffect(() => {
    if (mounted && !customer) {
      // Don't redirect login/register pages
      if (!pathname.includes('/login') && !pathname.includes('/register')) {
        router.replace('/account/login?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [customer, mounted, router, pathname]);

  // Login & register get their own full-page layout
  if (pathname.includes('/login') || pathname.includes('/register')) {
    return <>{children}</>;
  }

  if (!mounted || !customer) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <SiteHeader />
      <div className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        <AccountNav />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SiteFooter />
      <CartDrawer />
    </div>
  );
}
