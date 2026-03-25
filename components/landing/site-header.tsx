'use client';
import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { useState } from 'react';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Documentation
            </a>
            <a href="#" className="text-sm text-slate-600 hover:text-slate-900 transition">
              Support
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-500 hover:text-slate-900 transition">
              <ShoppingCart className="w-5 h-5" />
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
            <a href="#" className="block px-3 py-2 text-sm text-slate-600 rounded hover:bg-slate-50">Documentation</a>
          </div>
        )}
      </div>
    </header>
  );
}
