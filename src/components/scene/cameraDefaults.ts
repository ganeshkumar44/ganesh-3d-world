/** Same viewing angle as the original far camera, used only for direction */
const VIEW_DIRECTION = [18, 14, 18] as const
const viewLength = Math.hypot(...VIEW_DIRECTION)

/** Closest zoom (OrbitControls minDistance) — used on first load and reset */
export const MIN_CAMERA_DISTANCE = 4

export const DEFAULT_CAMERA = {
  position: VIEW_DIRECTION.map(
    (v) => (v / viewLength) * MIN_CAMERA_DISTANCE,
  ) as [number, number, number],
  fov: 45,
  target: [0, 0, 0] as [number, number, number],
}
