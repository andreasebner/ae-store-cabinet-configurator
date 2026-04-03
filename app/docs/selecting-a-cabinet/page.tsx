import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Selecting a Cabinet — Docs — YourCabinet Pro' };

export default function SelectingCabinetDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Selecting a Cabinet</h1>
      <p>
        Before you start configuring cutouts, you need to choose a cabinet model. All our enclosures
        are ARLI IP65-rated ABS plastic cabinets with transparent door and galvanized mounting plate.
      </p>

      <h2>Available Models</h2>
      <table>
        <thead>
          <tr>
            <th>Model</th>
            <th>Dimensions (W×H×D)</th>
            <th>Best For</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>ARLI 1060 — Compact</strong></td>
            <td>600 × 380 × 210 mm</td>
            <td>Small installations, limited wall space</td>
          </tr>
          <tr>
            <td><strong>ARLI 1076 — Standard</strong></td>
            <td>760 × 500 × 300 mm</td>
            <td>General-purpose control applications</td>
          </tr>
          <tr>
            <td><strong>ARLI 1114 — Large</strong></td>
            <td>1000 × 600 × 400 mm</td>
            <td>Complex installations, multiple DIN rails</td>
          </tr>
          <tr>
            <td><strong>ARLI 1180 — Industrial</strong></td>
            <td>1200 × 800 × 500 mm</td>
            <td>Heavy-duty industrial environments</td>
          </tr>
        </tbody>
      </table>

      <h2>How to Select</h2>
      <ol>
        <li>
          On the <strong>landing page</strong>, scroll to the cabinet catalog or use the Quick Start
          panel at the top.
        </li>
        <li>Click on a model card to see its specifications.</li>
        <li>
          Click <strong>&quot;Configure&quot;</strong> to open the 3D/2D editor with that cabinet pre-selected.
        </li>
      </ol>

      <h2>Key Specifications</h2>
      <ul>
        <li><strong>Protection:</strong> IP65 — dustproof and protected against water jets</li>
        <li><strong>Impact resistance:</strong> IK10</li>
        <li><strong>Material:</strong> HB ABS, halogen-free, impact-resistant</li>
        <li><strong>Mounting plate:</strong> Galvanized steel, included</li>
        <li><strong>Door:</strong> Transparent with perimeter seal and dual locking</li>
        <li><strong>Operating temperature:</strong> −35 °C to +65 °C</li>
        <li><strong>Resistance:</strong> Chemicals, alkalis, oils, and salts</li>
        <li><strong>Color:</strong> Light grey (RAL 7035), transparent door</li>
      </ul>

      <h2>Switching Cabinets</h2>
      <p>
        You can change the cabinet model at any time from the configurator by using{' '}
        <strong>File → New Design</strong>. Note that switching models will reset your current
        configuration.
      </p>
    </article>
  );
}
