/**
 * Utilities for handling zoom functionality in the AR view
 */

// Default zoom level (1.0 = no zoom)
export const DEFAULT_ZOOM = 1.0;

// Minimum and maximum zoom levels
export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 5.0;

/**
 * Calculates a new zoom level based on pinch gesture
 * @param currentZoom Current zoom level
 * @param scale Scale factor from pinch gesture
 * @returns New zoom level constrained between MIN_ZOOM and MAX_ZOOM
 */
export function calculateNewZoom(currentZoom: number, scale: number): number {
  const newZoom = currentZoom * scale;
  return Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
}

/**
 * Applies zoom to screen coordinates
 * @param x X coordinate
 * @param y Y coordinate
 * @param zoom Zoom level
 * @param centerX Center X of the screen
 * @param centerY Center Y of the screen
 * @returns Zoomed coordinates
 */
export function applyZoomToCoordinates(
  x: number,
  y: number,
  zoom: number,
  centerX: number,
  centerY: number
): { x: number; y: number } {
  // Calculate distance from center
  const dx = x - centerX;
  const dy = y - centerY;
  
  // Apply zoom
  const zoomedX = centerX + dx * zoom;
  const zoomedY = centerY + dy * zoom;
  
  return { x: zoomedX, y: zoomedY };
}

