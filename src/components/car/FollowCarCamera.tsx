import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { Vector3, type PerspectiveCamera } from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import type { Group } from 'three'

const _offset = new Vector3()
const _lookAt = new Vector3()

/** Camera sits behind and above the car in the car's local space (+Z is forward, so behind is -Z). */
const FOLLOW_LOCAL_OFFSET = new Vector3(0, 4.5, -7.5)

type FollowCarCameraProps = {
  enabled: boolean
  carGroupRef: React.RefObject<Group | null>
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}

/**
 * When enabled, disables OrbitControls and places the camera behind the car each frame.
 * When disabled, OrbitControls handle pan/zoom again and the camera is not moved here.
 */
export function FollowCarCamera({
  enabled,
  carGroupRef,
  controlsRef,
}: FollowCarCameraProps) {
  const camera = useThree((s) => s.camera as PerspectiveCamera)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    controls.enabled = !enabled
  }, [enabled, controlsRef])

  useFrame(() => {
    if (!enabled) return
    const car = carGroupRef.current
    if (!car) return

    _offset.copy(FOLLOW_LOCAL_OFFSET).applyQuaternion(car.quaternion)
    camera.position.copy(car.position).add(_offset)
    _lookAt.set(car.position.x, car.position.y + 1.1, car.position.z)
    camera.lookAt(_lookAt)

    const controls = controlsRef.current
    if (controls) {
      controls.target.copy(_lookAt)
    }
  })

  return null
}
