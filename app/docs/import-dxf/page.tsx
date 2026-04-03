import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Importing DXF Files — Docs — YourCabinet Pro' };

export default function ImportDxfDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Importing DXF Files</h1>
      <p>
        DXF (Drawing Exchange Format) is the standard interchange format for 2D CAD drawings. You can
        import DXF files as custom cutout shapes or import entire panel layouts.
      </p>

      <h2>Import a Custom Shape from DXF</h2>
      <p>
        Use this to bring in a single shape (e.g., a ventilation grille pattern, a custom connector
        footprint) designed in external CAD software.
      </p>
      <ol>
        <li>Click the <strong>File</strong> menu in the toolbar.</li>
        <li>Select <strong>Custom Shape (.dxf)</strong>.</li>
        <li>Choose your DXF file. The system will parse the geometry and create an SVG-based cutout.</li>
        <li>
          The shape is automatically scaled to fit within a reasonable size (max 120 mm) while
          preserving aspect ratio.
        </li>
        <li>The imported shape appears on the current panel and can be moved like any other element.</li>
      </ol>

      <h2>Import a Full Panel Layout</h2>
      <p>
        If you've laid out an entire panel side in CAD, you can import all its elements at once.
      </p>
      <ol>
        <li>Click <strong>File → Import Panel (.dxf)</strong>.</li>
        <li>
          Select a DXF file containing circles (interpreted as holes) and rectangles (interpreted as
          rectangular cutouts).
        </li>
        <li>
          The importer reads element positions and dimensions, then <strong>replaces all elements</strong>{' '}
          on the current side with the imported layout.
        </li>
      </ol>

      <h2>Supported DXF Features</h2>
      <table>
        <thead>
          <tr>
            <th>DXF Entity</th>
            <th>Interpreted As</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>CIRCLE</td>
            <td>Circular hole (diameter from radius)</td>
          </tr>
          <tr>
            <td>ARC</td>
            <td>Part of a custom shape outline</td>
          </tr>
          <tr>
            <td>LINE</td>
            <td>Straight edge of a shape</td>
          </tr>
          <tr>
            <td>LWPOLYLINE</td>
            <td>Closed shape → rectangular or custom cutout</td>
          </tr>
          <tr>
            <td>INSERT (block reference)</td>
            <td>Expanded and flattened</td>
          </tr>
        </tbody>
      </table>

      <h2>Tips for Best Results</h2>
      <ul>
        <li>
          <strong>Use millimeters</strong> as your DXF unit. The importer assumes 1 DXF unit = 1 mm.
        </li>
        <li>
          <strong>Keep shapes simple.</strong> Complex splines and 3D entities are not supported.
        </li>
        <li>
          <strong>Use closed polylines</strong> for rectangles. The importer will detect axis-aligned
          rectangles automatically.
        </li>
        <li>
          Export as <strong>DXF R12 or R14</strong> for maximum compatibility.
        </li>
      </ul>
    </article>
  );
}
