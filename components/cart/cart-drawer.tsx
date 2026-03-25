'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { CABINETS, SIDES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, subtotal, itemCount } = useCartStore();

  useEffect(() => {
    useCartStore.getState().hydrate();
  }, []);

  // prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const count = itemCount();
  const total = subtotal();

  return (
    <>
      {/* backdrop */}
      <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm" onClick={() => setOpen(false)} />

      {/* drawer */}
      <aside className="fixed top-0 right-0 z-[70] h-full w-full max-w-md bg-white shadow-2xl flex flex-col">
        {/* header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Shopping Cart ({count})</h2>
          <button onClick={() => setOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-700 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
              <ShoppingBag className="w-12 h-12" />
              <p className="text-sm">Your cart is empty</p>
              <Link
                href="/configure"
                onClick={() => setOpen(false)}
                className="text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Start configuring a cabinet
              </Link>
            </div>
          )}

          {items.map(item => {
            const spec = CABINETS[item.cabinetKey];
            const cutouts = SIDES.reduce((n, s) => n + (item.sideElements[s]?.length ?? 0), 0);
            return (
              <div key={item.id} className="flex gap-4 p-3 rounded-lg border border-slate-100 bg-slate-50">
                {/* mini visual */}
                <div className="w-16 h-16 rounded bg-brand-50 border border-brand-100 flex items-center justify-center shrink-0">
                  <div
                    className="bg-brand-200 rounded-sm"
                    style={{
                      width: `${Math.round(spec.w / 30)}px`,
                      height: `${Math.round(spec.h / 20)}px`,
                    }}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{spec.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {spec.w}×{spec.h}×{spec.d} mm &middot; {cutouts} cutout{cutouts !== 1 ? 's' : ''}
                  </p>

                  <div className="flex items-center justify-between mt-2">
                    {/* qty */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-medium w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-6 h-6 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-800">
                        €{(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* footer */}
        {items.length > 0 && (
          <div className="border-t border-slate-200 px-5 py-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>
              <span className="font-semibold text-slate-900">€{total.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-slate-400">Shipping & taxes calculated at checkout</p>

            <Link
              href="/checkout"
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center justify-center w-full h-11 rounded-lg text-sm font-medium transition',
                'bg-brand-600 text-white hover:bg-brand-700',
              )}
            >
              Proceed to Checkout
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
