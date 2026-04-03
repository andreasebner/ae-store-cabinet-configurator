import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FAQ — Docs — YourCabinet Pro' };

export default function FaqDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Frequently Asked Questions</h1>

      <h2>General</h2>

      <h3>Do I need to install any software?</h3>
      <p>
        No. The configurator runs entirely in your web browser. You need a modern browser with
        WebGL support (Chrome, Firefox, Edge, or Safari).
      </p>

      <h3>Is my configuration saved automatically?</h3>
      <p>
        Your current configuration is stored in your browser's local storage. It persists across
        sessions until you clear your browser data. For permanent storage, use{' '}
        <strong>File → Export Project</strong> to download a JSON file.
      </p>

      <h3>Can I share my configuration with someone else?</h3>
      <p>
        Yes — export your project as JSON and send the file. The recipient can import it via{' '}
        <strong>File → Open Project…</strong>.
      </p>

      <h2>Configurator</h2>

      <h3>Why can't I edit the back side?</h3>
      <p>
        The back panel sits against the wall when the cabinet is mounted. Cutouts on the back side are
        not practical for most installations, so it's disabled by default.
      </p>

      <h3>What is the minimum hole size?</h3>
      <p>
        The minimum supported hole diameter is 5 mm, limited by CNC milling capabilities.
      </p>

      <h3>Can I place elements outside the panel boundary?</h3>
      <p>
        No — elements are constrained to the panel area. The editor will prevent placement outside
        the panel edges.
      </p>

      <h3>How accurate is the 3D preview?</h3>
      <p>
        The 3D preview shows cutouts rendered with real-time shaders on the cabinet model. It's a
        visualization aid — the production cutout positions come from the 2D editor data (or exported
        DXF), which is millimeter-precise.
      </p>

      <h2>Import / Export</h2>

      <h3>What DXF versions are supported?</h3>
      <p>
        The importer supports DXF R12, R14, and AutoCAD 2000–2013 formats. For best results, export
        as R12 or R14.
      </p>

      <h3>Can I import 3D DXF files?</h3>
      <p>
        No — only 2D entities (CIRCLE, LINE, ARC, LWPOLYLINE) are supported. 3D meshes, solids, and
        surfaces are ignored.
      </p>

      <h3>What units does the DXF importer expect?</h3>
      <p>
        The importer assumes 1 DXF unit = 1 millimeter. If your DXF uses inches, the shapes will
        appear much smaller than intended.
      </p>

      <h2>Ordering</h2>

      <h3>How long does delivery take?</h3>
      <p>
        Custom-fabricated cabinets are typically delivered within 5 business days within Germany.
        International shipping may take longer.
      </p>

      <h3>Can I modify my order after placing it?</h3>
      <p>
        Contact us as soon as possible at <a href="mailto:info@defctory.de">info@defctory.de</a>. If
        production hasn't started, we can adjust the configuration.
      </p>

      <h3>What payment methods do you accept?</h3>
      <p>
        We accept credit/debit cards, PayPal, bank transfer (SEPA), and Amazon Pay. All payments are
        processed securely.
      </p>
    </article>
  );
}
