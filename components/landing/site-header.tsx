'use client';
import Link from 'next/link';
import { ShoppingCart, Menu, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { toggleCart, itemCount } = useCartStore();
  const { customer, hydrate: hydrateAuth } = useAuthStore();

  useEffect(() => {
    useCartStore.getState().hydrate();
    hydrateAuth();
  }, [hydrateAuth]);

  const count = itemCount();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-tight">
            <span className="text-lg font-bold tracking-tight text-slate-900">
              YourCabinet <span className="text-brand-600">Pro</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 -mt-0.5">
              by DeFctory
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/#catalog" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Cabinets
            </Link>
            <Link href="/configure" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Configurator
            </Link>
            <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Documentation
            </Link>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Support
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Account / Orders */}
            {customer ? (
              <Link href="/account/orders" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">{customer.firstName}</span>
              </Link>
            ) : (
              <Link href="/account/login" className="text-sm text-slate-500 hover:text-slate-900 transition">
                Log in
              </Link>
            )}

            {/* Cart */}
            <button onClick={toggleCart} className="relative p-2 text-slate-500 hover:text-slate-900 transition">
              <ShoppingCart className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-4.5 h-4.5 min-w-[18px] rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </button>

            <Link
              href="/configure"
              className="hidden sm:inline-flex items-center h-9 px-4 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition"
            >
              Start Configuring
            </Link>
            <button
              className="md:hidden p-2 text-slate-500"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 border-t border-slate-100 mt-2 pt-3 space-y-2">
            <Link href="/#catalog" className="block px-3 py-2 text-sm text-slate-600 rounded hover:bg-slate-50">Cabinets</Link>
            <Link href="/configure" className="block px-3 py-2 text-sm text-slate-600 rounded hover:bg-slate-50">Configurator</Link>
            <Link href="/account/orders" className="block px-3 py-2 text-sm text-slate-600 rounded hover:bg-slate-50">My Orders</Link>
            <Link href="/docs" className="block px-3 py-2 text-sm text-slate-600 rounded hover:bg-slate-50">Documentation</Link>
          </div>
        )}
      </div>
    </header>
  );
}
