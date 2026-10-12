import { useEffect, useRef, useState } from 'react'
import { GameScene, type GameSceneHandle } from './components/scene/GameScene'
import { GameHUD } from './components/ui/GameHUD'

function App() {
  const sceneRef = useRef<GameSceneHandle>(null)
  const sceneRootRef = useRef<HTMLDivElement>(null)
  const [followCar, setFollowCar] = useState(false)

  useEffect(() => {
    sceneRootRef.current?.focus()
  }, [])

  return (
    <div
      ref={sceneRootRef}
      tabIndex={0}
      className="relative h-dvh w-full bg-slate-950 outline-none"
    >
      <GameScene
        ref={sceneRef}
        followCar={followCar}
        sceneRootRef={sceneRootRef}
      />
      <GameHUD
        followCar={followCar}
        onToggleFollowCar={() => setFollowCar((v) => !v)}
        onResetCamera={() => sceneRef.current?.resetCamera()}
      />
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-md rounded-lg bg-slate-900/60 px-3 py-2 text-xs leading-relaxed text-slate-300 backdrop-blur-sm">
        <span className="font-medium text-slate-200">Drive:</span> W / ↑ forward · S / ↓
        reverse · A / ← · D / → steer · Space brake
        <br />
        <span className="font-medium text-slate-200">View:</span> drag pan · scroll zoom ·
        reset camera · follow-car toggle (top right)
      </p>
    </div>
  )
}

export default App
