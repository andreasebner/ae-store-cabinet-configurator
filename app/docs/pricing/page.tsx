import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Pricing & Cart — Docs — YourCabinet Pro' };

export default function PricingDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Pricing &amp; Cart</h1>
      <p>
        Cabinet pricing is calculated in real time based on the base model and the cutouts you've
        configured. The total price is always visible in the bottom-right corner of the configurator.
      </p>

      <h2>How Pricing Works</h2>
      <p>The configured price consists of:</p>
      <ul>
        <li>
          <strong>Base cabinet price</strong> — depends on the model (Compact, Standard, Large, or
          Industrial).
        </li>
        <li>
          <strong>Cutout surcharges</strong> — each hole, rectangle, and custom shape adds a
          per-element fee.
        </li>
        <li>
          <strong>Component surcharges</strong> — components from the library include the cutout cost
          plus the part price.
        </li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Element Type</th>
            <th>Price per Unit</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Circular hole</td>
            <td>€12.50</td>
          </tr>
          <tr>
            <td>Rectangular cutout</td>
            <td>€18.00</td>
          </tr>
          <tr>
            <td>Custom shape</td>
            <td>€35.00</td>
          </tr>
          <tr>
            <td>Text label (engraving)</td>
            <td>Free</td>
          </tr>
        </tbody>
      </table>

      <h2>Adding to Cart</h2>
      <ol>
        <li>
          Review your configuration and price in the bottom of the Properties panel.
        </li>
        <li>
          Click <strong>&quot;Add to Cart&quot;</strong> to add the current configuration.
        </li>
        <li>
          A toast notification confirms the addition. The cart icon in the header shows the updated
          item count.
        </li>
      </ol>

      <h2>Cart &amp; Checkout</h2>
      <ul>
        <li>
          Click the <strong>cart icon</strong> in the header to open the cart drawer.
        </li>
        <li>
          Review your items, quantities, and total price.
        </li>
        <li>
          Click <strong>&quot;Proceed to Checkout&quot;</strong> to complete your order with shipping
          details and payment.
        </li>
      </ul>

      <h2>Multiple Configurations</h2>
      <p>
        You can add multiple differently-configured cabinets to the same cart. Each item appears as a
        separate line item with its own cutout summary and price.
      </p>
    </article>
  );
}
