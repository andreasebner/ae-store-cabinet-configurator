'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, CreditCard, MapPin } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import { ordersApi } from '@/lib/api';
import { CABINETS, SIDES } from '@/lib/constants';
import type { Address } from '@/lib/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCartStore();
  const { customer, hydrate: hydrateAuth } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    useCartStore.getState().hydrate();
    hydrateAuth();
    setMounted(true);
  }, [hydrateAuth]);

  const [address, setAddress] = useState<Address>({
    firstName: '', lastName: '', company: '', addressLine1: '',
    addressLine2: '', city: '', postalCode: '', country: 'DE', phone: '',
  });
  const [placing, setPlacing] = useState(false);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-500">
        <Package className="w-16 h-16 text-slate-300" />
        <p className="text-lg font-medium">Your cart is empty</p>
        <Link href="/configure" className="text-sm text-brand-600 hover:text-brand-700 font-medium">
          Start configuring a cabinet
        </Link>
      </div>
    );
  }

  const sub = subtotal();
  const tax = Math.round(sub * 0.19 * 100) / 100;
  const total = Math.round((sub + tax) * 100) / 100;

  function onField(key: keyof Address, v: string) {
    setAddress(a => ({ ...a, [key]: v }));
  }

  function handlePlace(e: FormEvent) {
    e.preventDefault();
    if (!customer) {
      router.push('/account/login?redirect=/checkout');
      return;
    }
    setPlacing(true);
    const lineItems = items.map(i => ({
      cabinetKey: i.cabinetKey,
      sideElements: i.sideElements,
      price: i.price,
      quantity: i.quantity,
    }));
    ordersApi.place(customer.id, lineItems, address);
    clearCart();
    router.push('/account/orders?placed=1');
  }

  const inputCls = 'h-10 w-full rounded-lg border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none';

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* header */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/" className="text-slate-400 hover:text-slate-700 transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Checkout</h1>
        </div>

        <form onSubmit={handlePlace} className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* left – form */}
          <div className="space-y-8">
            {/* auth banner */}
            {!customer && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <Link href="/account/login?redirect=/checkout" className="font-medium underline">Log in</Link> or{' '}
                <Link href="/account/register?redirect=/checkout" className="font-medium underline">create an account</Link> to place your order.
              </div>
            )}

            {/* shipping */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-4 h-4 text-brand-600" />
                <h2 className="text-base font-semibold text-slate-800">Shipping Address</h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input className={inputCls} placeholder="First name *" required value={address.firstName} onChange={e => onField('firstName', e.target.value)} />
                <input className={inputCls} placeholder="Last name *" required value={address.lastName} onChange={e => onField('lastName', e.target.value)} />
                <input className={`${inputCls} sm:col-span-2`} placeholder="Company (optional)" value={address.company} onChange={e => onField('company', e.target.value)} />
                <input className={`${inputCls} sm:col-span-2`} placeholder="Address line 1 *" required value={address.addressLine1} onChange={e => onField('addressLine1', e.target.value)} />
                <input className={`${inputCls} sm:col-span-2`} placeholder="Address line 2 (optional)" value={address.addressLine2} onChange={e => onField('addressLine2', e.target.value)} />
                <input className={inputCls} placeholder="City *" required value={address.city} onChange={e => onField('city', e.target.value)} />
                <input className={inputCls} placeholder="Postal code *" required value={address.postalCode} onChange={e => onField('postalCode', e.target.value)} />
                <input className={inputCls} placeholder="Country *" required value={address.country} onChange={e => onField('country', e.target.value)} />
                <input className={inputCls} placeholder="Phone (optional)" value={address.phone} onChange={e => onField('phone', e.target.value)} />
              </div>
            </section>

            {/* payment stub */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-brand-600" />
                <h2 className="text-base font-semibold text-slate-800">Payment</h2>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
                Payment processing will be handled by the connected commerce backend (e.g. Stripe via MedusaJS). This is a placeholder for the payment step.
              </div>
            </section>
          </div>

          {/* right – order summary */}
          <aside className="lg:sticky lg:top-8 self-start">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h2 className="text-base font-semibold text-slate-800">Order Summary</h2>

              <div className="divide-y divide-slate-100">
                {items.map(item => {
                  const spec = CABINETS[item.cabinetKey];
                  const cutouts = SIDES.reduce((n, s) => n + (item.sideElements[s]?.length ?? 0), 0);
                  return (
                    <div key={item.id} className="py-3 flex justify-between text-sm">
                      <div>
                        <p className="text-slate-800 font-medium">{spec.name}</p>
                        <p className="text-xs text-slate-400">{cutouts} cutout{cutouts !== 1 ? 's' : ''} &middot; Qty {item.quantity}</p>
                      </div>
                      <span className="font-medium text-slate-700">€{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1 text-sm pt-2 border-t border-slate-100">
                <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>€{sub.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">VAT (19 %)</span><span>€{tax.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100">
                  <span>Total</span><span>€{total.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={placing || !customer}
                className="w-full h-11 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition disabled:opacity-50"
              >
                {placing ? 'Placing order…' : 'Place Order'}
              </button>
            </div>
          </aside>
        </form>
      </div>
    </div>
  );
}
