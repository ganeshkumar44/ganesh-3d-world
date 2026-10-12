import { useEffect, useRef } from 'react'
import { GameScene, type GameSceneHandle } from './components/scene/GameScene'
import { GameHUD } from './components/ui/GameHUD'

function App() {
  const sceneRef = useRef<GameSceneHandle>(null)
  const sceneRootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    sceneRootRef.current?.focus()
  }, [])

  return (
    <div
      ref={sceneRootRef}
      tabIndex={0}
      className="relative h-dvh w-full bg-slate-950 outline-none"
    >
      <GameScene ref={sceneRef} sceneRootRef={sceneRootRef} />
      <GameHUD onResetCamera={() => sceneRef.current?.resetCamera()} />
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 max-w-md rounded-lg bg-slate-900/60 px-3 py-2 text-xs leading-relaxed text-slate-300 backdrop-blur-sm">
        <span className="font-medium text-slate-200">Drive:</span> W / ↑ forward · S / ↓
        reverse · A / ← · D / → steer · Space brake
        <br />
        <span className="font-medium text-slate-200">View:</span> drag pan when stopped ·
        scroll zoom · reset camera
      </p>
    </div>
  )
}

export default App
