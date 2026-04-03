import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Placing Cutouts — Docs — YourCabinet Pro' };

export default function PlacingCutoutsDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Placing Cutouts</h1>
      <p>
        Cutouts are the primary elements you place on cabinet panels — circular holes for connectors
        and cable glands, rectangular openings for displays and ventilation, and text labels for
        identification.
      </p>

      <h2>Circular Holes</h2>
      <ol>
        <li>Select the <strong>Hole</strong> tool (<code>H</code>) from the toolbar.</li>
        <li>In the sub-toolbar, set the desired <strong>diameter</strong> (default: 22 mm — standard M22 connector).</li>
        <li>Click anywhere on the panel to place the hole.</li>
        <li>The hole appears at the clicked location. You can drag it with the Select tool to reposition.</li>
      </ol>
      <p>
        Common hole sizes: <strong>8 mm</strong> (M8), <strong>12 mm</strong> (M12), <strong>16 mm</strong>{' '}
        (M16/cable gland PG9), <strong>22 mm</strong> (M22/push button), <strong>29 mm</strong> (PG21).
      </p>

      <h2>Rectangular Cutouts</h2>
      <ol>
        <li>Select the <strong>Rect</strong> tool (<code>R</code>) from the toolbar.</li>
        <li>Set the <strong>width</strong> and <strong>height</strong> in the sub-toolbar.</li>
        <li>Click on the panel to place the rectangle.</li>
      </ol>
      <p>
        Rectangular cutouts are useful for display windows, ventilation grilles, DIN rail slots, and
        cable entry plates.
      </p>

      <h2>Text Labels</h2>
      <ol>
        <li>Select the <strong>Text</strong> tool (<code>T</code>).</li>
        <li>Enter your label text and font size in the sub-toolbar.</li>
        <li>Click on the panel to place the label.</li>
      </ol>
      <p>
        Text labels are engraved (not cut through) and are useful for marking connector designations,
        circuit numbers, and safety warnings.
      </p>

      <h2>Moving &amp; Resizing</h2>
      <ul>
        <li>Switch to the <strong>Select</strong> tool (<code>V</code>).</li>
        <li><strong>Click</strong> an element to select it. Its properties appear in the right panel.</li>
        <li><strong>Drag</strong> to reposition it.</li>
        <li>
          Edit <strong>X</strong>, <strong>Y</strong>, <strong>width</strong>, <strong>height</strong>,
          or <strong>diameter</strong> precisely in the Properties panel.
        </li>
      </ul>

      <h2>Precise Positioning</h2>
      <p>
        For exact placement, use the Properties panel to enter coordinates directly. All values are
        in millimeters from the top-left corner of the panel. You can also use{' '}
        <a href="/docs/constraints">constraints</a> to lock distances between elements.
      </p>

      <h2>3D Preview</h2>
      <p>
        Every change you make in the 2D editor is immediately reflected in the 3D preview on the left.
        Holes and rectangular cutouts appear as actual openings in the 3D model surface using real-time
        shader-based rendering.
      </p>
    </article>
  );
}
