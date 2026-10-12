import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { ProceduralCar } from './ProceduralCar'
import {
  createEmptyCarInput,
  createInitialCarState,
  stepCarPhysics,
  type CarInput,
  type CarState,
} from './carPhysics'
import { useCarKeyboard } from './useCarKeyboard'

type CarControllerProps = {
  sceneRootRef: React.RefObject<HTMLElement | null>
  carGroupRef: React.RefObject<Group | null>
}

/**
 * Reads keyboard input, integrates physics each frame, and moves the car root group on the ground.
 */
export function CarController({ sceneRootRef, carGroupRef }: CarControllerProps) {
  const stateRef = useRef<CarState>(createInitialCarState())
  const inputRef = useRef<CarInput>(createEmptyCarInput())

  useCarKeyboard(inputRef, sceneRootRef)

  useFrame((_, delta) => {
    stepCarPhysics(stateRef.current, inputRef.current, delta)
    const group = carGroupRef.current
    if (!group) return
    const { x, z, heading } = stateRef.current
    group.position.set(x, 0, z)
    group.rotation.set(0, heading, 0)
  })

  return (
    <group ref={carGroupRef}>
      <ProceduralCar stateRef={stateRef} />
    </group>
  )
}
