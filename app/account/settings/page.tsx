'use client';

import { useState, type FormEvent } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { changePassword, deleteAccount, error, clearError } = useAuthStore();
  const router = useRouter();

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaved, setPwSaved] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setPwError('');
    setPwSaved(false);

    if (pwForm.newPassword.length < 6) {
      setPwError('New password must be at least 6 characters.');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('Passwords do not match.');
      return;
    }

    setPwLoading(true);
    try {
      const ok = changePassword(pwForm.currentPassword, pwForm.newPassword);
      if (ok) {
        setPwSaved(true);
        setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setPwSaved(false), 3000);
      } else {
        setPwError(error || 'Current password is incorrect.');
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    try {
      deleteAccount();
      router.push('/');
    } finally {
      setDeleteLoading(false);
    }
  };

  const pwField = (label: string, name: keyof typeof pwForm) => (
    <div>
      <label htmlFor={name} className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <input
        id={name}
        type="password"
        required
        value={pwForm[name]}
        onChange={(e) => setPwForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent transition"
      />
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Change your password and manage your account.</p>
      </div>

      {/* Password change */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 max-w-xl space-y-5">
        <h2 className="text-sm font-semibold text-slate-900">Change Password</h2>

        {pwSaved && (
          <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Password changed successfully.
          </div>
        )}

        {pwError && (
          <div className="bg-red-50 text-red-700 rounded-lg px-4 py-3 text-sm">{pwError}</div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {pwField('Current Password', 'currentPassword')}
          {pwField('New Password', 'newPassword')}
          {pwField('Confirm New Password', 'confirmPassword')}
          <div className="pt-1">
            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {pwLoading ? 'Saving…' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6 max-w-xl space-y-4">
        <h2 className="text-sm font-semibold text-red-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          Danger Zone
        </h2>
        <p className="text-sm text-slate-600">
          Permanently delete your account and all associated data. This action cannot be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-5 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition"
          >
            Delete Account
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className="px-5 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition"
            >
              {deleteLoading ? 'Deleting…' : 'Yes, delete my account'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2 text-sm text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
