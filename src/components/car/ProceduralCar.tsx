import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { CAR_PHYSICS, type CarState } from './carPhysics'

type ProceduralCarProps = {
  /** Shared simulation state — wheel spin is applied in useFrame without React re-renders. */
  stateRef: React.RefObject<CarState>
}

/**
 * Low-poly toy car built only from primitives.
 * Local +Z is the front (grille, headlights); -Z is the rear (tail lights).
 */
export function ProceduralCar({ stateRef }: ProceduralCarProps) {
  const frontLeftSpin = useRef<Group>(null)
  const frontRightSpin = useRef<Group>(null)
  const rearLeftSpin = useRef<Group>(null)
  const rearRightSpin = useRef<Group>(null)
  const frontLeftSteer = useRef<Group>(null)
  const frontRightSteer = useRef<Group>(null)

  useFrame(() => {
    const s = stateRef.current
    const spin = s.wheelSpin
    const steer = s.steerVisual
    for (const ref of [
      frontLeftSpin,
      frontRightSpin,
      rearLeftSpin,
      rearRightSpin,
    ]) {
      if (ref.current) ref.current.rotation.x = spin
    }
    if (frontLeftSteer.current) frontLeftSteer.current.rotation.y = steer
    if (frontRightSteer.current) frontRightSteer.current.rotation.y = steer
  })

  const bodyColor = '#e63946'
  const cabinColor = '#457b9d'
  const glassColor = '#a8dadc'
  const trimColor = '#1d3557'
  const wheelY = CAR_PHYSICS.wheelRadius

  return (
    <group>
      <mesh castShadow position={[0, wheelY + 0.28, 0]}>
        <boxGeometry args={[1.55, 0.42, 2.6]} />
        <meshStandardMaterial color={bodyColor} roughness={0.45} metalness={0.15} />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.72, -0.12]}>
        <boxGeometry args={[1.35, 0.55, 1.35]} />
        <meshStandardMaterial color={cabinColor} roughness={0.5} metalness={0.1} />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.78, 0.42]}>
        <boxGeometry args={[1.22, 0.42, 0.06]} />
        <meshStandardMaterial
          color={glassColor}
          roughness={0.15}
          metalness={0.35}
          transparent
          opacity={0.75}
        />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.78, -0.62]}>
        <boxGeometry args={[1.15, 0.38, 0.06]} />
        <meshStandardMaterial
          color={glassColor}
          roughness={0.15}
          metalness={0.35}
          transparent
          opacity={0.75}
        />
      </mesh>

      <mesh castShadow position={[0.66, wheelY + 0.76, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.05]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.7} roughness={0.2} />
      </mesh>
      <mesh castShadow position={[-0.66, wheelY + 0.76, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.05]} />
        <meshStandardMaterial color={glassColor} transparent opacity={0.7} roughness={0.2} />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.18, 1.38]}>
        <boxGeometry args={[1.5, 0.22, 0.18]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>
      <mesh castShadow position={[0, wheelY + 0.18, -1.38]}>
        <boxGeometry args={[1.5, 0.22, 0.18]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.32, 1.32]}>
        <boxGeometry args={[0.9, 0.28, 0.08]} />
        <meshStandardMaterial color="#222" roughness={0.85} />
      </mesh>

      <mesh castShadow position={[0, wheelY + 0.52, 0.85]}>
        <boxGeometry args={[0.18, 0.06, 0.9]} />
        <meshStandardMaterial color="#ffd166" roughness={0.4} />
      </mesh>

      <mesh castShadow position={[0.52, wheelY + 0.38, 1.22]}>
        <boxGeometry args={[0.22, 0.14, 0.1]} />
        <meshStandardMaterial
          color="#fff3b0"
          emissive="#fff3b0"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>
      <mesh castShadow position={[-0.52, wheelY + 0.38, 1.22]}>
        <boxGeometry args={[0.22, 0.14, 0.1]} />
        <meshStandardMaterial
          color="#fff3b0"
          emissive="#fff3b0"
          emissiveIntensity={0.6}
          roughness={0.3}
        />
      </mesh>

      <mesh castShadow position={[0.52, wheelY + 0.38, -1.22]}>
        <boxGeometry args={[0.22, 0.14, 0.1]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.55}
          roughness={0.35}
        />
      </mesh>
      <mesh castShadow position={[-0.52, wheelY + 0.38, -1.22]}>
        <boxGeometry args={[0.22, 0.14, 0.1]} />
        <meshStandardMaterial
          color="#ff006e"
          emissive="#ff006e"
          emissiveIntensity={0.55}
          roughness={0.35}
        />
      </mesh>

      <CarWheel
        steerRef={frontLeftSteer}
        spinRef={frontLeftSpin}
        position={[0.78, wheelY, 0.85]}
      />
      <CarWheel
        steerRef={frontRightSteer}
        spinRef={frontRightSpin}
        position={[-0.78, wheelY, 0.85]}
      />
      <CarWheel spinRef={rearLeftSpin} position={[0.78, wheelY, -0.85]} />
      <CarWheel spinRef={rearRightSpin} position={[-0.78, wheelY, -0.85]} />
    </group>
  )
}

type CarWheelProps = {
  position: [number, number, number]
  spinRef: React.RefObject<Group | null>
  steerRef?: React.RefObject<Group | null>
}

function CarWheel({ position, spinRef, steerRef }: CarWheelProps) {
  const r = CAR_PHYSICS.wheelRadius
  const tire = (
    <group ref={spinRef}>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r, r, 0.26, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
      </mesh>
      <mesh castShadow rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.55, r * 0.55, 0.28, 12]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.25} />
      </mesh>
    </group>
  )

  if (steerRef) {
    return (
      <group position={position}>
        <group ref={steerRef}>{tire}</group>
      </group>
    )
  }

  return <group position={position}>{tire}</group>
}
