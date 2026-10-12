/**
 * Platform layout from GameScene BuildSurface / Grid:
 * 120×120 plane at world origin, top at Y = 0, centered on XZ.
 */
export const PLATFORM_SURFACE_SIZE = 120

export const PLATFORM_CENTER = {
  x: 0,
  y: 0,
  z: 0,
} as const

/** Initial car heading (radians). Local +Z is the front of the procedural car. */
export const CAR_SPAWN_HEADING = 0 as const
