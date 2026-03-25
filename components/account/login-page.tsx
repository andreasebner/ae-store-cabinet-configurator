'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { customer, login, error, clearError, hydrate } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => { hydrate(); }, [hydrate]);

  useEffect(() => {
    if (customer) router.replace(redirect);
  }, [customer, redirect, router]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    clearError();
    if (login(email, password)) {
      router.push(redirect);
    }
  }

  const inputCls = 'h-10 w-full rounded-lg border border-slate-200 px-3 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm space-y-6">
        <div>
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Log in</h1>
          <p className="text-sm text-slate-500 mt-1">Welcome back to YourCabinet Pro</p>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
            <input className={inputCls} type="email" required placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Password</label>
            <input className={inputCls} type="password" required placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button type="submit" className="w-full h-10 rounded-lg bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition">
            Log in
          </button>
        </form>

        <p className="text-sm text-center text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href={`/account/register?redirect=${encodeURIComponent(redirect)}`} className="text-brand-600 font-medium hover:text-brand-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
