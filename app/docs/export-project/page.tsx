import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Exporting Projects — Docs — YourCabinet Pro' };

export default function ExportProjectDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Exporting Projects</h1>
      <p>
        You can save and share your cabinet configuration in multiple formats — JSON for full project
        state, and DXF for production-ready panel drawings.
      </p>

      <h2>Export as JSON</h2>
      <p>
        The JSON export saves your entire project — cabinet model, all panel sides, every element with
        position, dimensions, and constraints.
      </p>
      <ol>
        <li>Click <strong>File → Export Project</strong> in the toolbar.</li>
        <li>A <code>.json</code> file is downloaded to your device.</li>
        <li>
          To restore it later, use <strong>File → Open Project…</strong> and select the JSON file.
        </li>
      </ol>
      <p>
        Exported projects are also saved to your <strong>Recent Projects</strong> list for quick
        access.
      </p>

      <h2>Export Panel as DXF</h2>
      <p>
        The DXF export creates a production-ready 2D drawing of the current panel side, suitable for
        CNC machining or laser cutting.
      </p>
      <ol>
        <li>
          Navigate to the panel side you want to export (e.g., &quot;right&quot;).
        </li>
        <li>Click <strong>File → Export Panel (.dxf)</strong>.</li>
        <li>A <code>.dxf</code> file is downloaded containing:
          <ul>
            <li>All circular holes as CIRCLE entities</li>
            <li>All rectangular cutouts as LWPOLYLINE entities</li>
            <li>Panel boundary as the outer rectangle</li>
          </ul>
        </li>
      </ol>

      <h2>Import Panel from DXF</h2>
      <p>
        You can also import a panel layout from DXF. See{' '}
        <a href="/docs/import-dxf">Importing DXF Files</a> for details.
      </p>

      <h2>Recent Projects</h2>
      <p>
        The configurator automatically stores your recent projects in the browser's local storage.
        Access them from <strong>File → Recent</strong>. You can remove entries by hovering over them
        and clicking the trash icon.
      </p>

      <h2>Tips</h2>
      <ul>
        <li>Export regularly to avoid losing work — the configurator stores data in your browser only.</li>
        <li>
          Share JSON files with colleagues to collaborate on configurations.
        </li>
        <li>
          Use DXF export to send panel drawings directly to your machining workshop or CNC operator.
        </li>
      </ul>
    </article>
  );
}
