export function useMedusa() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.medusaUrl as string;

  async function createOrder(items: unknown[]) {
    // Stub – replace with real Medusa API calls
    console.log('[Medusa] createOrder →', baseUrl, items);
    return { id: `order_${Date.now()}` };
  }

  async function listProducts() {
    console.log('[Medusa] listProducts →', baseUrl);
    return [];
  }

  return { createOrder, listProducts };
}
