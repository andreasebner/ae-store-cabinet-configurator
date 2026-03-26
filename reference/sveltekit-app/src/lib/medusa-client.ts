import type { CabinetKey } from './types';

const MEDUSA_URL = import.meta.env.VITE_MEDUSA_URL || 'http://localhost:9000';

async function medusaFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${MEDUSA_URL}/store${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers as Record<string, string>) },
    ...options,
  });
  if (!res.ok) throw new Error(`Medusa API error: ${res.status}`);
  return res.json();
}

export async function getProducts() {
  return medusaFetch<{ products: unknown[] }>('/products');
}

export async function getCabinetProduct(cabinetKey: CabinetKey) {
  return medusaFetch<{ products: unknown[] }>(`/products?handle=${cabinetKey}`);
}

export async function createCart() {
  return medusaFetch<{ cart: { id: string } }>('/carts', { method: 'POST', body: JSON.stringify({}) });
}

export async function addToCart(cartId: string, variantId: string, quantity: number = 1, metadata?: Record<string, unknown>) {
  return medusaFetch<{ cart: unknown }>(`/carts/${encodeURIComponent(cartId)}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ variant_id: variantId, quantity, metadata }),
  });
}
