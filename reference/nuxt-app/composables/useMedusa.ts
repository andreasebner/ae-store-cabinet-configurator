/**
 * MedusaJS composable for Nuxt 3.
 * Provides typed helpers for connecting to MedusaJS backend.
 */
export function useMedusa() {
  const config = useRuntimeConfig();
  const baseUrl = config.public.medusaUrl as string;

  async function getProducts() {
    const data = await $fetch<{ products: any[] }>(`${baseUrl}/store/products`);
    return data.products;
  }

  async function createCart() {
    const data = await $fetch<{ cart: any }>(`${baseUrl}/store/carts`, { method: 'POST' });
    return data.cart;
  }

  async function addToCart(cartId: string, variantId: string, configData: Record<string, unknown>) {
    const data = await $fetch<{ cart: any }>(`${baseUrl}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      body: { variant_id: variantId, quantity: 1, metadata: { configurator_version: '1.0', configuration: configData } },
    });
    return data.cart;
  }

  return { getProducts, createCart, addToCart };
}
