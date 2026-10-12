/**
 * Arcade driving parameters — tuned for smooth toy-car feel on the ground plane (Y = 0).
 * The car uses heading (Y rotation): forward is local +Z, so world velocity uses sin/cos of heading.
 */
export const CAR_PHYSICS = {
  /** meters / s² when W / S is held */
  acceleration: 14,
  reverseAcceleration: 10,
  /** top speed forward / backward */
  maxSpeed: 20,
  reverseMaxSpeed: 9,
  /** passive slowdown when no throttle (m/s²) */
  friction: 10,
  /** extra slowdown when Space is held */
  brakeDeceleration: 28,
  /** how fast the car yaws (rad/s) at full speed */
  steerRate: 2.4,
  /** wheel radius in world units — used for spin animation */
  wheelRadius: 0.32,
  /** half-extent of the driveable platform (matches GameScene surface) */
  platformHalf: 58,
} as const

export type CarInput = {
  forward: boolean
  backward: boolean
  steerLeft: boolean
  steerRight: boolean
  brake: boolean
}

export type CarState = {
  x: number
  z: number
  /** Y-axis rotation in radians; local +Z is the front of the car */
  heading: number
  speed: number
  /** cumulative wheel spin for visual rotation around X */
  wheelSpin: number
  /** front wheel steer angle for visuals (radians) */
  steerVisual: number
}

export function createInitialCarState(): CarState {
  return {
    x: 0,
    z: 0,
    heading: 0,
    speed: 0,
    wheelSpin: 0,
    steerVisual: 0,
  }
}

export function createEmptyCarInput(): CarInput {
  return {
    forward: false,
    backward: false,
    steerLeft: false,
    steerRight: false,
    brake: false,
  }
}

/**
 * Integrate one frame of car motion on the XZ ground plane.
 * Steering is scaled by speed so the car pivots naturally while driving.
 */
export function stepCarPhysics(
  state: CarState,
  input: CarInput,
  delta: number,
): void {
  const p = CAR_PHYSICS
  let throttle = 0
  if (input.forward) throttle += 1
  if (input.backward) throttle -= 1

  if (input.brake) {
    const sign = Math.sign(state.speed)
    const mag = Math.max(0, Math.abs(state.speed) - p.brakeDeceleration * delta)
    state.speed = mag * sign
  } else if (throttle !== 0) {
    const accel = throttle > 0 ? p.acceleration : p.reverseAcceleration
    state.speed += throttle * accel * delta
    const max =
      throttle > 0 ? p.maxSpeed : -p.reverseMaxSpeed
    if (throttle > 0) {
      state.speed = Math.min(state.speed, max)
    } else {
      state.speed = Math.max(state.speed, max)
    }
  } else {
    const sign = Math.sign(state.speed)
    const mag = Math.max(0, Math.abs(state.speed) - p.friction * delta)
    state.speed = mag * sign
  }

  const steerInput =
    (input.steerRight ? 1 : 0) - (input.steerLeft ? 1 : 0)
  const speedFactor = Math.min(1, Math.abs(state.speed) / 3)
  const targetSteerVisual = steerInput * 0.35
  state.steerVisual += (targetSteerVisual - state.steerVisual) * Math.min(1, delta * 12)

  if (steerInput !== 0 && Math.abs(state.speed) > 0.05) {
    const turn =
      steerInput * p.steerRate * speedFactor * delta * Math.sign(state.speed)
    state.heading += turn
  }

  state.x += Math.sin(state.heading) * state.speed * delta
  state.z += Math.cos(state.heading) * state.speed * delta

  const limit = p.platformHalf
  state.x = Math.max(-limit, Math.min(limit, state.x))
  state.z = Math.max(-limit, Math.min(limit, state.z))

  if (Math.abs(state.speed) > 0.01) {
    state.wheelSpin += (state.speed / p.wheelRadius) * delta
  }
}
