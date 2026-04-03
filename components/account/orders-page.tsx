'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi } from '@/lib/api';
import { CABINETS } from '@/lib/constants';
import type { Order, OrderStatus } from '@/lib/types';
import { Package, CheckCircle2 } from 'lucide-react';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrdersPage() {
  const searchParams = useSearchParams();
  const justPlaced = searchParams.get('placed') === '1';

  const { customer } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (customer) {
      setOrders(ordersApi.getByCustomer(customer.id).reverse());
    }
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Orders</h1>
        <p className="text-sm text-slate-500 mt-1">View your order history and track deliveries.</p>
      </div>

      {/* success banner */}
      {justPlaced && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-emerald-800">Order placed successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">You will receive a confirmation email shortly.</p>
          </div>
        </div>
      )}

      {/* orders list */}
      {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Package className="w-14 h-14" />
            <p className="text-sm">No orders yet</p>
            <Link href="/configure" className="text-sm text-brand-600 hover:text-brand-700 font-medium">Configure your first cabinet</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                {/* order header */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">Order</span>
                    <span className="font-mono font-medium text-slate-700">{order.id.slice(0, 13)}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    <span className="text-slate-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* items */}
                <div className="px-5 py-3 divide-y divide-slate-100">
                  {order.items.map((item, idx) => {
                    const spec = CABINETS[item.cabinetKey];
                    return (
                      <div key={idx} className="py-2 flex justify-between text-sm">
                        <div>
                          <span className="font-medium text-slate-800">{spec.name}</span>
                          <span className="text-slate-400 ml-2">× {item.quantity}</span>
                        </div>
                        <span className="font-medium text-slate-700">€{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* totals */}
                <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Subtotal €{order.subtotal.toFixed(2)}</span>
                  <span className="text-slate-400">VAT €{order.tax.toFixed(2)}</span>
                  <span className="font-bold text-slate-800">Total €{order.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
