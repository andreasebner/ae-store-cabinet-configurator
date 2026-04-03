import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Custom Shapes — Inkscape & CAD — Docs — YourCabinet Pro' };

export default function CustomShapesDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Custom Shapes (Inkscape &amp; CAD)</h1>
      <p>
        When the built-in hole, rectangle, and component library don't cover your needs, you can
        design arbitrary cutout shapes in external software and import them as DXF files.
      </p>

      <h2>Using Inkscape (Free, Open-Source)</h2>
      <p>
        <a href="https://inkscape.org" target="_blank" rel="noopener noreferrer">Inkscape</a> is a
        free vector graphics editor that can export DXF. Here's the workflow:
      </p>
      <ol>
        <li>
          <strong>Set document units to mm.</strong> Go to{' '}
          <em>File → Document Properties → Display units → mm</em>. This ensures your drawing
          dimensions match real-world sizes.
        </li>
        <li>
          <strong>Draw your shape.</strong> Use the circle, rectangle, and path tools. For a
          ventilation grille, draw the outer boundary and any inner holes.
        </li>
        <li>
          <strong>Convert objects to paths.</strong> Select all objects and go to{' '}
          <em>Path → Object to Path</em> (<code>Shift+Ctrl+C</code>). This ensures all shapes are
          exported as polylines.
        </li>
        <li>
          <strong>Position at origin.</strong> Move your shape so that its top-left corner is at
          coordinate (0, 0). This helps the importer place it predictably.
        </li>
        <li>
          <strong>Export as DXF.</strong> Go to <em>File → Save As</em> and choose{' '}
          <strong>Desktop Cutting Plotter (AutoCAD DXF R14) (*.dxf)</strong>. Use these settings:
          <ul>
            <li>Base unit: mm</li>
            <li>ROBO-Master/CAMM-1 format: unchecked</li>
            <li>LWPOLYLINE output: checked</li>
          </ul>
        </li>
        <li>
          <strong>Import into configurator.</strong> In the configurator, go to{' '}
          <em>File → Custom Shape (.dxf)</em> and select your exported file.
        </li>
      </ol>

      <h2>Using FreeCAD</h2>
      <p>
        <a href="https://www.freecad.org" target="_blank" rel="noopener noreferrer">FreeCAD</a> is a
        free parametric 3D CAD modeler.
      </p>
      <ol>
        <li>Create a 2D sketch in the <strong>Sketcher</strong> workbench.</li>
        <li>Draw your cutout contour using lines, arcs, and circles.</li>
        <li>Save the sketch, then export: <em>File → Export → AutoCAD 2D (*.dxf)</em>.</li>
        <li>Import into the configurator as described above.</li>
      </ol>

      <h2>Using AutoCAD / DraftSight</h2>
      <ol>
        <li>
          Draw your cutout in <strong>model space</strong> using circles, lines, and polylines.
          Use mm as your drawing unit.
        </li>
        <li>
          Save as: <em>File → Save As → DXF → AutoCAD 2013 DXF</em> (or R12/R14 for maximum
          compatibility).
        </li>
        <li>Import into the configurator.</li>
      </ol>

      <h2>Using SolidWorks / Fusion 360</h2>
      <ol>
        <li>Create a 2D sketch of the cutout shape.</li>
        <li>
          Export: In SolidWorks, use <em>File → Save As → DXF</em>. In Fusion 360, right-click the
          sketch → <em>Save as DXF</em>.
        </li>
        <li>Import into the configurator.</li>
      </ol>

      <h2>Design Guidelines</h2>
      <table>
        <thead>
          <tr>
            <th>Guideline</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Use mm as your unit</td>
            <td>The importer assumes 1 unit = 1 mm</td>
          </tr>
          <tr>
            <td>Keep shapes 2D</td>
            <td>3D entities and meshes are not supported</td>
          </tr>
          <tr>
            <td>Use closed contours</td>
            <td>Open paths may not import correctly</td>
          </tr>
          <tr>
            <td>Minimum feature size: 3 mm</td>
            <td>CNC milling tolerance limit</td>
          </tr>
          <tr>
            <td>Avoid overlapping paths</td>
            <td>May cause rendering artifacts</td>
          </tr>
          <tr>
            <td>Use DXF R12 or R14</td>
            <td>Highest compatibility with the parser</td>
          </tr>
        </tbody>
      </table>

      <h2>Built-in Shape Library</h2>
      <p>
        Before designing a custom shape, check the <strong>Shapes</strong> dropdown in the toolbar.
        We include common cutout templates (fan inlets in 80 mm and 120 mm sizes) that you can place
        with one click.
      </p>
    </article>
  );
}
