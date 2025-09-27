/**
 * Geometry utilities for WristFit.
 */

// PUBLIC_INTERFACE
export function toPxPoint(lm, width, height) {
  /**
   * Convert a landmark to pixel coordinates based on returned width/height.
   * Handles both normalized [0,1] and absolute coordinates.
   */
  if (lm == null || typeof lm.x !== "number" || typeof lm.y !== "number") return null;
  const isNormalized = lm.x <= 1.1 && lm.y <= 1.1;
  return {
    x: isNormalized ? lm.x * width : lm.x,
    y: isNormalized ? lm.y * height : lm.y,
  };
}

// PUBLIC_INTERFACE
export function distance(a, b) {
  /** Euclidean distance between two points {x,y}. */
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// PUBLIC_INTERFACE
export function angleBetween(a, b) {
  /** Angle in radians from point a to b. */
  if (!a || !b) return 0;
  return Math.atan2(b.y - a.y, b.x - a.x);
}

// PUBLIC_INTERFACE
export function midpoint(a, b) {
  /** Returns midpoint between two points. */
  if (!a || !b) return { x: 0, y: 0 };
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// PUBLIC_INTERFACE
export function computeWristMetrics(landmarks, width, height) {
  /**
   * Computes wrist width, center and angle using landmarks (indices 5 and 17).
   * Returns: { center: {x,y}, widthPx: number, angleRad: number }
   */
  if (!Array.isArray(landmarks) || landmarks.length < 18) return null;

  const p5 = toPxPoint(landmarks[5], width, height);
  const p17 = toPxPoint(landmarks[17], width, height);

  if (!p5 || !p17) return null;

  const widthPx = distance(p5, p17);
  const center = midpoint(p5, p17);
  const angleRad = angleBetween(p5, p17);

  return { center, widthPx, angleRad, refA: p5, refB: p17 };
}
