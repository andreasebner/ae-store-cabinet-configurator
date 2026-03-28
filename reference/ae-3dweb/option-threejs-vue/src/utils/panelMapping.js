/**
 * Maps 2D panel coordinates (mm) to 3D world coordinates on the panel surface.
 * The panel in 3D is a BoxGeometry centered at origin, lying on the XY plane.
 * Panel center is at (0, 0, 0). X = width direction, Y = height direction.
 *
 * 2D editor uses top-left origin (x right, y down).
 * 3D panel uses center origin (x right, y up).
 */

export function panelToWorld(holeX, holeY, panelWidth, panelHeight) {
  // Convert from top-left origin (2D) to center origin (3D)
  const x = holeX - panelWidth / 2;
  const y = -(holeY - panelHeight / 2); // flip Y
  return { x, y };
}

export function worldToPanel(worldX, worldY, panelWidth, panelHeight) {
  const x = worldX + panelWidth / 2;
  const y = -(worldY - panelHeight / 2);
  return { x, y };
}
