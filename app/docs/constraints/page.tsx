import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Constraints & Dimensions — Docs — YourCabinet Pro' };

export default function ConstraintsDoc() {
  return (
    <article className="prose prose-slate max-w-none">
      <h1>Constraints &amp; Dimensions</h1>
      <p>
        Constraints let you lock relationships between elements — ensuring exact distances are
        maintained even when you rearrange your layout. They're essential for precision engineering
        work.
      </p>

      <h2>Distance Constraints</h2>
      <p>
        A distance constraint fixes the spacing between two elements (or between an element and a
        panel edge).
      </p>
      <ol>
        <li>Click the <strong>Constraint</strong> dropdown in the toolbar.</li>
        <li>Select <strong>Add Distance Constraint</strong>.</li>
        <li>
          <strong>Pick the &quot;from&quot; reference</strong> — click an element or a panel border to set
          the starting point.
        </li>
        <li>
          <strong>Pick the &quot;to&quot; element</strong> — click the target element.
        </li>
        <li>
          The constraint appears as a dimension line in the editor. Edit the distance value in the
          Properties panel to adjust.
        </li>
      </ol>

      <h2>Diameter Constraints</h2>
      <p>
        A diameter constraint locks the size of a circular hole to a specific value.
      </p>
      <ol>
        <li>Select <strong>Add Diameter Constraint</strong> from the Constraint dropdown.</li>
        <li>Click on a circular element (hole or round component).</li>
        <li>The constraint shows the current diameter. Modify it in the Properties panel.</li>
      </ol>

      <h2>Working with Constraints</h2>
      <ul>
        <li>
          When you move a constrained element, the system will try to maintain all constraint
          relationships.
        </li>
        <li>
          Constraints appear as annotation lines on the 2D editor canvas.
        </li>
        <li>
          To cancel a constraint placement in progress, press <code>Escape</code> or click the{' '}
          <strong>Cancel</strong> button in the sub-toolbar.
        </li>
        <li>
          To delete a constraint, select it and press <code>Delete</code>.
        </li>
      </ul>

      <h2>Common Patterns</h2>
      <table>
        <thead>
          <tr>
            <th>Use Case</th>
            <th>Constraint Type</th>
            <th>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Distance from panel edge</td>
            <td>Distance</td>
            <td>Hole center 30 mm from left edge</td>
          </tr>
          <tr>
            <td>Spacing between two holes</td>
            <td>Distance</td>
            <td>50 mm center-to-center</td>
          </tr>
          <tr>
            <td>Lock connector size</td>
            <td>Diameter</td>
            <td>M22 hole fixed at 22 mm</td>
          </tr>
        </tbody>
      </table>
    </article>
  );
}
