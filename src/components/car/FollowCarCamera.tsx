import { useFrame, useThree } from '@react-three/fiber'
import { useRef } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Group } from 'three'

const _offset = new Vector3()
const _lookAt = new Vector3()

/** Ignore sub-millimeter jitter so a fully stopped car can be panned. */
const MOVE_EPSILON_SQ = 1e-8

type FollowCarCameraProps = {
  carGroupRef: React.RefObject<Group | null>
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

/**
 * Keeps the page-load camera angle and zoom, and slides that view with the car
 * while it is moving so the car stays on screen. Pan stays available once the car stops.
 */
export function FollowCarCamera({
  carGroupRef,
  controlsRef,
}: FollowCarCameraProps) {
  const camera = useThree((s) => s.camera as PerspectiveCamera)
  const lastCarPos = useRef(new Vector3())
  const hasLast = useRef(false)

  useFrame(() => {
    const car = carGroupRef.current
    const controls = controlsRef.current
    if (!car || !controls) return

    if (!hasLast.current) {
      lastCarPos.current.copy(car.position)
      hasLast.current = true
      return
    }

    const moving = car.position.distanceToSquared(lastCarPos.current) > MOVE_EPSILON_SQ
    lastCarPos.current.copy(car.position)

    if (controls.enablePan === moving) {
      controls.enablePan = !moving
    }

    if (!moving) return

    _offset.copy(camera.position).sub(controls.target)
    _lookAt.set(car.position.x, car.position.y, car.position.z)
    controls.target.copy(_lookAt)
    camera.position.copy(_lookAt).add(_offset)
    controls.update()
  })

  return null
}
