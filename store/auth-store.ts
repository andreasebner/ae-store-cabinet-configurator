import { create } from 'zustand';
import type { Customer } from '@/lib/types';
import { authApi } from '@/lib/api';

interface AuthStore {
  customer: Customer | null;
  error: string | null;

  hydrate: () => void;
  register: (email: string, password: string, firstName: string, lastName: string) => boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  updateProfile: (updates: Partial<Omit<Customer, 'id' | 'createdAt'>>) => boolean;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
  deleteAccount: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  customer: null,
  error: null,

  hydrate: () => set({ customer: authApi.getSession() }),

  register: (email, password, firstName, lastName) => {
    try {
      const customer = authApi.register(email, password, firstName, lastName);
      set({ customer, error: null });
      return true;
    } catch (e: unknown) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  login: (email, password) => {
    try {
      const customer = authApi.login(email, password);
      set({ customer, error: null });
      return true;
    } catch (e: unknown) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  logout: () => {
    authApi.logout();
    set({ customer: null });
  },

  updateProfile: (updates) => {
    try {
      const customer = authApi.updateProfile(updates);
      set({ customer, error: null });
      return true;
    } catch (e: unknown) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  changePassword: (currentPassword, newPassword) => {
    try {
      authApi.changePassword(currentPassword, newPassword);
      set({ error: null });
      return true;
    } catch (e: unknown) {
      set({ error: (e as Error).message });
      return false;
    }
  },

  deleteAccount: () => {
    authApi.deleteAccount();
    set({ customer: null });
  },

  clearError: () => set({ error: null }),
}));
