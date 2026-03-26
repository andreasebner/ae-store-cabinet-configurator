/**
 * MedusaJS client setup for the control cabinet configurator.
 *
 * In production, this connects to a running MedusaJS backend to:
 * - Fetch cabinet products/variants from /store/products
 * - Create/manage carts via /store/carts
 * - Store configurator state as line item metadata
 * - Calculate server-side pricing
 *
 * For now, this is a stub that provides the client setup and typed helpers.
 */

const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || 'http://localhost:9000';

export interface MedusaProduct {
  id: string;
  title: string;
  variants: MedusaVariant[];
  metadata?: Record<string, unknown>;
}

export interface MedusaVariant {
  id: string;
  title: string;
  prices: { amount: number; currency_code: string }[];
  metadata?: Record<string, unknown>;
}

export interface MedusaCart {
  id: string;
  items: MedusaLineItem[];
  total: number;
}

export interface MedusaLineItem {
  id: string;
  variant_id: string;
  quantity: number;
  metadata?: Record<string, unknown>;
}

class MedusaClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /** Fetch all cabinet products from MedusaJS */
  async getProducts(): Promise<MedusaProduct[]> {
    const res = await fetch(`${this.baseUrl}/store/products`, {
      credentials: 'include',
    });
    const data = await res.json();
    return data.products;
  }

  /** Create a new cart */
  async createCart(): Promise<MedusaCart> {
    const res = await fetch(`${this.baseUrl}/store/carts`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    return data.cart;
  }

  /** Add a configured cabinet to cart with configuration metadata */
  async addToCart(
    cartId: string,
    variantId: string,
    configurationData: Record<string, unknown>
  ): Promise<MedusaCart> {
    const res = await fetch(`${this.baseUrl}/store/carts/${cartId}/line-items`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        variant_id: variantId,
        quantity: 1,
        metadata: {
          configurator_version: '1.0',
          configuration: configurationData,
        },
      }),
    });
    const data = await res.json();
    return data.cart;
  }
}

export const medusaClient = new MedusaClient(MEDUSA_BACKEND_URL);
export default medusaClient;
