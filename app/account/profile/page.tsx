'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const { customer, updateProfile, error, clearError } = useAuthStore();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!customer) return null;

  const [form, setForm] = useState({
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    company: customer.company ?? '',
    phone: customer.phone ?? '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSaved(false);
    setLoading(true);
    try {
      updateProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        company: form.company.trim() || undefined,
        phone: form.phone.trim() || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, name: keyof typeof form, type = 'text', required = true) => (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Personal Information</h1>
        <p className="text-sm text-slate-500 mt-1">Update your name, email, and contact details.</p>
      </div>

      {saved && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          Profile updated successfully.
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 max-w-xl">
        <div className="grid sm:grid-cols-2 gap-4">
          {field('First Name', 'firstName')}
          {field('Last Name', 'lastName')}
        </div>
        {field('Email', 'email', 'email')}
        {field('Company', 'company', 'text', false)}
        {field('Phone', 'phone', 'tel', false)}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
