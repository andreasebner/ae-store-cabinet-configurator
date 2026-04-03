'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, User, MapPin, Package, Settings, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

const NAV_ITEMS = [
  { href: '/account', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/account/profile', label: 'Personal Information', icon: User },
  { href: '/account/addresses', label: 'Addresses', icon: MapPin },
  { href: '/account/orders', label: 'Orders', icon: Package },
  { href: '/account/settings', label: 'Settings', icon: Settings },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useAuthStore();

  function handleLogout() {
    logout();
    router.push('/');
  }

  return (
    <nav className="w-56 shrink-0 hidden md:block">
      <div className="sticky top-24 space-y-1">
        {/* Customer badge */}
        {customer && (
          <div className="px-3 py-3 mb-3">
            <div className="text-sm font-semibold text-slate-900">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-xs text-slate-400 truncate">{customer.email}</div>
          </div>
        )}

        {NAV_ITEMS.map((item) => {
          const active = item.href === '/account'
            ? pathname === '/account'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}

        <div className="pt-3 mt-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Log out
          </button>
        </div>
      </div>
    </nav>
  );
}
