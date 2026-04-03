'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/auth-store';
import type { Address } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

const EMPTY_ADDRESS: Address = {
  firstName: '',
  lastName: '',
  company: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'DE',
  phone: '',
};

export default function AddressesPage() {
  const { customer, updateProfile } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!customer) return null;

  const [form, setForm] = useState<Address>({
    ...EMPTY_ADDRESS,
    ...customer.address,
    firstName: customer.address?.firstName ?? customer.firstName,
    lastName: customer.address?.lastName ?? customer.lastName,
  });

  const set = (name: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [name]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(false);
    setLoading(true);
    try {
      updateProfile({
        address: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          company: form.company?.trim() || undefined,
          addressLine1: form.addressLine1.trim(),
          addressLine2: form.addressLine2?.trim() || undefined,
          city: form.city.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
          phone: form.phone?.trim() || undefined,
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: keyof Address, required = true, colSpan = false) => (
    <div className={colSpan ? 'sm:col-span-2' : ''}>
      <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        id={name}
        type="text"
        required={required}
        value={form[name] ?? ''}
        onChange={set(name)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Addresses</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your default shipping address.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Address saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {field('First Name', 'firstName')}
          {field('Last Name', 'lastName')}
          {field('Company', 'company', false, true)}
          {field('Address Line 1', 'addressLine1', true, true)}
          {field('Address Line 2', 'addressLine2', false, true)}
          {field('City', 'city')}
          {field('Postal Code', 'postalCode')}
          {field('Country', 'country', true, true)}
          {field('Phone', 'phone', false, true)}
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving…' : 'Save Address'}
          </button>
        </div>
      </form>
    </div>
  );
}
