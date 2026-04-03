'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi } from '@/lib/api';
import { useEffect, useState } from 'react';
import type { Order } from '@/lib/types';
import { Package, User, MapPin, Settings, ArrowRight } from 'lucide-react';

const CARDS = [
  { href: '/account/profile', label: 'Personal Information', desc: 'Update your name, email, and phone number', icon: User },
  { href: '/account/addresses', label: 'Addresses', desc: 'Manage your shipping and billing addresses', icon: MapPin },
  { href: '/account/orders', label: 'Orders', desc: 'View your order history and track deliveries', icon: Package },
  { href: '/account/settings', label: 'Settings', desc: 'Change password and manage your account', icon: Settings },
];

export default function AccountDashboard() {
  const { customer } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (customer) {
      setOrders(ordersApi.getByCustomer(customer.id).reverse().slice(0, 3));
    }
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, {customer.firstName}!
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your account, view orders, and update your personal information.
        </p>
      </div>

      {/* Quick access cards */}
      <div className="grid sm:grid-cols-2 gap-4">
        {CARDS.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-brand-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition">
                <card.icon className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-900 text-sm group-hover:text-brand-700 transition flex items-center gap-1">
                  {card.label}
                  <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="text-xs text-slate-500 mt-0.5">{card.desc}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <Link href="/account/orders" className="text-xs text-brand-600 hover:text-brand-700 font-medium">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {orders.map((order) => (
              <div key={order.id} className="px-5 py-3 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-slate-500">{order.id.slice(0, 13)}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600">
                    {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="capitalize text-xs text-slate-500">{order.status}</span>
                  <span className="font-medium text-slate-800">€{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Account info summary */}
      <div className="bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-3">Account Summary</h2>
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-slate-400 text-xs">Name</dt>
            <dd className="text-slate-700">{customer.firstName} {customer.lastName}</dd>
          </div>
          <div>
            <dt className="text-slate-400 text-xs">Email</dt>
            <dd className="text-slate-700">{customer.email}</dd>
          </div>
          {customer.company && (
            <div>
              <dt className="text-slate-400 text-xs">Company</dt>
              <dd className="text-slate-700">{customer.company}</dd>
            </div>
          )}
          {customer.phone && (
            <div>
              <dt className="text-slate-400 text-xs">Phone</dt>
              <dd className="text-slate-700">{customer.phone}</dd>
            </div>
          )}
          <div>
            <dt className="text-slate-400 text-xs">Member since</dt>
            <dd className="text-slate-700">
              {new Date(customer.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
