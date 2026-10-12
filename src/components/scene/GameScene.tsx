import { Grid, OrbitControls } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react'
import {
  MOUSE,
  Spherical,
  TOUCH,
  Vector3,
  type PerspectiveCamera,
} from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { CuboidCollider, Physics, RigidBody } from '@react-three/rapier'
import type { Group } from 'three'
import { CarController } from '../car/CarController'
import { FollowCarCamera } from '../car/FollowCarCamera'
import {
  DEFAULT_CAMERA,
  MAX_PAN_TARGET_RADIUS,
  MAX_PAN_TARGET_Y,
  MIN_CAMERA_DISTANCE,
} from './cameraDefaults'

export type GameSceneHandle = {
  resetCamera: () => void
}

type GameSceneProps = {
  sceneRootRef: React.RefObject<HTMLElement | null>
}

const SURFACE_SIZE = 120

function BuildSurface() {
  return (
    <RigidBody type="fixed" colliders={false}>
      <CuboidCollider
        args={[SURFACE_SIZE / 2, 0.05, SURFACE_SIZE / 2]}
        position={[0, -0.05, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[SURFACE_SIZE, SURFACE_SIZE]} />
        <meshStandardMaterial color="#ebe6dc" roughness={0.95} metalness={0} />
      </mesh>
    </RigidBody>
  )
}

function SceneHelpers() {
  return (
    <>
      <Grid
        args={[SURFACE_SIZE, SURFACE_SIZE]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#64748b"
        sectionSize={10}
        sectionThickness={1.2}
        sectionColor="#94a3b8"
        fadeDistance={80}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, 0.02, 0]}
      />
      <axesHelper args={[10]} />
    </>
  )
}

const _offset = new Vector3()

function clampPanTarget(
  camera: PerspectiveCamera,
  controls: OrbitControlsImpl,
  maxRadius: number,
) {
  const { target } = controls
  const dx = target.x
  const dz = target.z
  const distXZ = Math.hypot(dx, dz)
  let corrX = 0
  let corrY = 0
  let corrZ = 0

  if (distXZ > maxRadius) {
    const scale = maxRadius / distXZ
    corrX = dx * scale - dx
    corrZ = dz * scale - dz
  }

  const clampedY = Math.max(-MAX_PAN_TARGET_Y, Math.min(MAX_PAN_TARGET_Y, target.y))
  if (clampedY !== target.y) {
    corrY = clampedY - target.y
  }

  if (corrX === 0 && corrY === 0 && corrZ === 0) return

  target.x += corrX
  target.y += corrY
  target.z += corrZ
  camera.position.x += corrX
  camera.position.y += corrY
  camera.position.z += corrZ
  controls.update()
}

function lockOrbitRotation(
  camera: PerspectiveCamera,
  controls: OrbitControlsImpl,
) {
  _offset.copy(camera.position).sub(controls.target)
  const spherical = new Spherical().setFromVector3(_offset)
  controls.minPolarAngle = spherical.phi
  controls.maxPolarAngle = spherical.phi
  controls.minAzimuthAngle = spherical.theta
  controls.maxAzimuthAngle = spherical.theta
}

function resetCameraState(
  camera: PerspectiveCamera | null,
  controls: OrbitControlsImpl | null,
) {
  if (!camera || !controls) return
  camera.position.set(...DEFAULT_CAMERA.position)
  camera.fov = DEFAULT_CAMERA.fov
  camera.updateProjectionMatrix()
  controls.target.set(...DEFAULT_CAMERA.target)
  controls.update()
  lockOrbitRotation(camera, controls)
}

function OrbitRotationLock({
  controlsRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
}) {
  const camera = useThree((s) => s.camera as PerspectiveCamera)

  useEffect(() => {
    const controls = controlsRef.current
    if (!controls) return
    lockOrbitRotation(camera, controls)
  }, [camera, controlsRef])

  return null
}

function PanTargetLimiter({
  controlsRef,
  carGroupRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  carGroupRef: React.RefObject<Group | null>
}) {
  const camera = useThree((s) => s.camera as PerspectiveCamera)

  useFrame(() => {
    const controls = controlsRef.current
    if (!controls?.enablePan) return
    const car = carGroupRef.current
    const carRadius = car ? Math.hypot(car.position.x, car.position.z) : 0
    const maxRadius = Math.max(MAX_PAN_TARGET_RADIUS, carRadius)
    clampPanTarget(camera, controls, maxRadius)
  })

  return null
}

function RegisterCameraReset({
  controlsRef,
  registerReset,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  registerReset: (reset: () => void) => void
}) {
  const camera = useThree((s) => s.camera as PerspectiveCamera)

  useEffect(() => {
    registerReset(() => resetCameraState(camera, controlsRef.current))
  }, [camera, controlsRef, registerReset])

  return null
}

function WorldScene({
  controlsRef,
  registerReset,
  carGroupRef,
  sceneRootRef,
}: {
  controlsRef: React.RefObject<OrbitControlsImpl | null>
  registerReset: (reset: () => void) => void
  carGroupRef: React.RefObject<Group | null>
  sceneRootRef: React.RefObject<HTMLElement | null>
}) {
  return (
    <>
      <color attach="background" args={['#cfd8e3']} />
      <ambientLight intensity={0.55} />
      <directionalLight castShadow intensity={0.7} position={[16, 24, 12]} />
      <SceneHelpers />
      <Physics gravity={[0, -9.81, 0]}>
        <BuildSurface />
        <CarController sceneRootRef={sceneRootRef} carGroupRef={carGroupRef} />
      </Physics>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableRotate={false}
        enablePan
        enableZoom
        keyEvents={false}
        screenSpacePanning
        target={DEFAULT_CAMERA.target}
        minDistance={MIN_CAMERA_DISTANCE}
        maxDistance={120}
        mouseButtons={{
          LEFT: MOUSE.PAN,
          MIDDLE: MOUSE.DOLLY,
          RIGHT: MOUSE.PAN,
        }}
        touches={{
          ONE: TOUCH.PAN,
          TWO: TOUCH.DOLLY_PAN,
        }}
      />
      <OrbitRotationLock controlsRef={controlsRef} />
      <PanTargetLimiter controlsRef={controlsRef} carGroupRef={carGroupRef} />
      <FollowCarCamera carGroupRef={carGroupRef} controlsRef={controlsRef} />
      <RegisterCameraReset controlsRef={controlsRef} registerReset={registerReset} />
    </>
  )
}

export const GameScene = forwardRef<GameSceneHandle, GameSceneProps>(
  function GameScene({ sceneRootRef }, ref) {
  const controlsRef = useRef<OrbitControlsImpl>(null)
  const cameraRef = useRef<PerspectiveCamera | null>(null)
  const carGroupRef = useRef<Group>(null)
  const resetRef = useRef<(() => void) | null>(null)

  useImperativeHandle(ref, () => ({
    resetCamera() {
      if (resetRef.current) {
        resetRef.current()
        return
      }
      resetCameraState(cameraRef.current, controlsRef.current)
    },
  }))

  const registerReset = useCallback((fn: () => void) => {
    resetRef.current = fn
  }, [])

  return (
    <Canvas
      shadows
      camera={{
        position: DEFAULT_CAMERA.position,
        fov: DEFAULT_CAMERA.fov,
        near: 0.1,
        far: 500,
      }}
      className="h-full w-full touch-none"
      onCreated={({ camera }) => {
        cameraRef.current = camera as PerspectiveCamera
      }}
    >
      <WorldScene
        controlsRef={controlsRef}
        registerReset={registerReset}
        carGroupRef={carGroupRef}
        sceneRootRef={sceneRootRef}
      />
    </Canvas>
  )
},
)
