import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Alignment Tools — Docs — YourCabinet Pro' };

export default function AlignmentToolsDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Alignment Tools</h1>
      <p>
        Alignment tools help you distribute elements evenly on a panel — either along a circular arc
        or in a rectangular grid pattern. Instead of placing elements one by one, define an alignment
        and let the system arrange them for you.
      </p>

      <h2>Circular Alignment</h2>
      <p>
        Creates guide positions along a circle centered on the panel. Useful for placing connectors
        around a central opening or arranging indicators in an arc.
      </p>
      <ol>
        <li>Click the <strong>Alignment</strong> dropdown in the toolbar.</li>
        <li>Select <strong>Add Circular Alignment</strong>.</li>
        <li>
          A circular guide appears on the panel. In the Properties panel you can adjust:
          <ul>
            <li><strong>Center X / Y</strong> — position of the circle center</li>
            <li><strong>Radius</strong> — distance from center to element positions</li>
            <li><strong>Count</strong> — number of positions around the circle</li>
            <li><strong>Start angle</strong> — where the first position begins (in degrees)</li>
          </ul>
        </li>
        <li>
          Each position becomes a snap point. When you drag elements near these positions, they
          snap into place automatically.
        </li>
      </ol>

      <h2>Rectangular (Grid) Alignment</h2>
      <p>
        Creates a grid of evenly spaced positions. Ideal for placing rows of connectors, button
        arrays, or indicator lights.
      </p>
      <ol>
        <li>Click the <strong>Alignment</strong> dropdown.</li>
        <li>Select <strong>Add Rectangular Alignment</strong>.</li>
        <li>
          Adjust in the Properties panel:
          <ul>
            <li><strong>Position X / Y</strong> — top-left corner of the grid</li>
            <li><strong>Columns / Rows</strong> — number of positions in each direction</li>
            <li><strong>Spacing X / Y</strong> — distance between positions in mm</li>
          </ul>
        </li>
      </ol>

      <h2>Working with Alignments</h2>
      <ul>
        <li>
          Alignments are <strong>visual guides</strong>, not physical elements. They don't appear in
          the final cutout plan or DXF export.
        </li>
        <li>
          You can have multiple alignments on the same panel side.
        </li>
        <li>
          To remove an alignment, select it and press <code>Delete</code>.
        </li>
        <li>
          Alignment positions appear as small crosshairs on the panel. Elements snap to the nearest
          position when dragged close enough.
        </li>
      </ul>

      <h2>Tips</h2>
      <ul>
        <li>
          For a row of equally spaced M22 push buttons, use a <strong>rectangular alignment</strong>{' '}
          with 1 row, set the column count to your number of buttons, and spacing to match your
          desired pitch (e.g., 50 mm).
        </li>
        <li>
          For pilot lights arranged in a semicircle, use a <strong>circular alignment</strong> with
          start angle 0° and adjust the count and radius.
        </li>
      </ul>
    </article>
  );
}
