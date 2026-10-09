import { useRef } from 'react'
import { GameScene, type GameSceneHandle } from './components/scene/GameScene'
import { GameHUD } from './components/ui/GameHUD'

function App() {
  const sceneRef = useRef<GameSceneHandle>(null)

  return (
    <div className="relative h-dvh w-full bg-slate-950">
      <GameScene ref={sceneRef} />
      <GameHUD onResetCamera={() => sceneRef.current?.resetCamera()} />
      <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-lg bg-slate-900/60 px-3 py-2 text-xs text-slate-300 backdrop-blur-sm">
        Left-drag pan · Scroll zoom · Camera angle locked
      </p>
    </div>
  )
}

export default App
