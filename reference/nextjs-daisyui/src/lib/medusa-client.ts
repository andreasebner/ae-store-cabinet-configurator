const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';

export async function createOrder(items: unknown[]) {
  console.log('[Medusa] createOrder →', MEDUSA_URL, items);
  return { id: `order_${Date.now()}` };
}

export async function listProducts() {
  console.log('[Medusa] listProducts →', MEDUSA_URL);
  return [];
}
