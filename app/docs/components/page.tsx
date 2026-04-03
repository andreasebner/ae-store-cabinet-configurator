import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Component Library — Docs — YourCabinet Pro' };

export default function ComponentsDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Component Library</h1>
      <p>
        The component library provides pre-defined cutout templates for common industrial connectors
        and switches. Each component has the correct cutout dimensions and includes pricing.
      </p>

      <h2>Adding a Component</h2>
      <ol>
        <li>Click the <strong>Components</strong> dropdown (plug icon) in the toolbar.</li>
        <li>
          Browse by category: <strong>M8</strong>, <strong>M12</strong>, or <strong>Power</strong>.
          Click a category to expand it.
        </li>
        <li>
          Click a component to place it at the center of the current panel. Drag to reposition.
        </li>
      </ol>

      <h2>Available Categories</h2>

      <h3>M8 Connectors</h3>
      <p>
        Small industrial connectors commonly used for sensors and actuators. Cutout diameter is
        typically 8 mm.
      </p>

      <h3>M12 Connectors</h3>
      <p>
        Standard industrial connectors for sensors, fieldbus, and Ethernet. Cutout diameter is
        12 mm. Available in 4-pin, 5-pin, and 8-pin variants.
      </p>

      <h3>Power Connectors</h3>
      <p>
        Rectangular and circular power connectors for mains input, DC power, and high-current
        applications.
      </p>

      <h2>Component Properties</h2>
      <p>When you select a placed component, the Properties panel shows:</p>
      <ul>
        <li><strong>Position</strong> — X, Y coordinates on the panel (in mm)</li>
        <li><strong>Size</strong> — width and height (locked to the component's spec)</li>
        <li><strong>Component ID</strong> — reference for your BOM (bill of materials)</li>
        <li><strong>Price</strong> — the additional cost for this specific cutout</li>
      </ul>

      <h2>Custom Shapes</h2>
      <p>
        If you need a connector or cutout shape not in the library, you can create custom shapes
        using DXF import. See <a href="/docs/custom-shapes">Custom Shapes (Inkscape &amp; CAD)</a> for
        details.
      </p>
    </article>
  );
}
