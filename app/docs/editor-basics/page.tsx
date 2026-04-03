import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Editor Basics — Docs — YourCabinet Pro' };

export default function EditorBasicsDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Editor Basics</h1>
      <p>
        The configurator is divided into three panels: the <strong>3D Preview</strong> (left),
        the <strong>2D Panel Editor</strong> (center), and the <strong>Properties &amp; Details</strong>{' '}
        panel (right).
      </p>

      <h2>Layout Overview</h2>
      <ul>
        <li>
          <strong>3D Preview</strong> — Shows a real-time 3D model of your cabinet with cutouts
          rendered directly on the active face. Click any face on the 3D model to switch to that
          side.
        </li>
        <li>
          <strong>2D Panel Editor</strong> — The main workspace where you place and position cutouts
          on the selected panel side. All dimensions are in millimeters.
        </li>
        <li>
          <strong>Properties Panel</strong> — Shows details of the selected element (position, size,
          constraints) and a list of all elements on the current side.
        </li>
      </ul>

      <h2>Side Selection</h2>
      <p>
        Below the 3D preview, you'll find <strong>side pills</strong> (front, left, right, top, bottom).
        Click any pill to switch the editor to that panel. The back side is not editable as it sits
        against the wall when mounted.
      </p>
      <p>
        A dot indicator on each pill shows how many elements are placed on that side.
      </p>

      <h2>Tools</h2>
      <p>The toolbar at the top of the 2D editor provides these tools:</p>
      <table>
        <thead>
          <tr>
            <th>Tool</th>
            <th>Shortcut</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Select</strong></td>
            <td><code>V</code></td>
            <td>Click to select elements, drag to move them</td>
          </tr>
          <tr>
            <td><strong>Pan</strong></td>
            <td><code>P</code></td>
            <td>Click and drag to pan the canvas view</td>
          </tr>
          <tr>
            <td><strong>Hole</strong></td>
            <td><code>H</code></td>
            <td>Click on the panel to place a circular hole</td>
          </tr>
          <tr>
            <td><strong>Rect</strong></td>
            <td><code>R</code></td>
            <td>Click to place a rectangular cutout</td>
          </tr>
          <tr>
            <td><strong>Text</strong></td>
            <td><code>T</code></td>
            <td>Click to place a text label (engraved, not cut)</td>
          </tr>
          <tr>
            <td><strong>Measure</strong></td>
            <td><code>M</code></td>
            <td>Click two points to measure the distance</td>
          </tr>
        </tbody>
      </table>

      <h2>Tool Options</h2>
      <p>
        When a placement tool (Hole, Rect, Text) is active, a <strong>sub-toolbar</strong> appears
        below the main toolbar where you can set dimensions before placing:
      </p>
      <ul>
        <li><strong>Hole:</strong> Set the diameter in mm (default: 22 mm)</li>
        <li><strong>Rect:</strong> Set width and height in mm (default: 80 × 40 mm)</li>
        <li><strong>Text:</strong> Enter the label text and font size</li>
      </ul>

      <h2>Zoom</h2>
      <p>
        Use the zoom dropdown in the sub-toolbar to change the zoom level (25% – 300%). You can also
        use your mouse scroll wheel while hovering over the 2D editor.
      </p>

      <h2>Deleting Elements</h2>
      <p>
        Select an element with the Select tool, then press <code>Delete</code> or <code>Backspace</code>,
        or click the trash icon in the sub-toolbar.
      </p>
    </article>
  );
}
