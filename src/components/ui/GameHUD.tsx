import type { ReactNode } from 'react'

type IconButtonProps = {
  label: string
  onClick?: () => void
  accent?: boolean
  children: ReactNode
}

function IconButton({ label, onClick, accent, children }: IconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`flex size-10 items-center justify-center rounded-lg border border-white/10 shadow-lg backdrop-blur-md transition ${
        accent
          ? 'bg-emerald-500/90 text-white hover:bg-emerald-400'
          : 'bg-slate-900/75 text-white hover:bg-slate-800/90'
      }`}
    >
      {children}
    </button>
  )
}

function ResetCameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}

type GameHUDProps = {
  onResetCamera: () => void
}

export function GameHUD({ onResetCamera }: GameHUDProps) {
  return (
    <div className="absolute right-4 top-4 z-10 flex gap-2">
      <IconButton label="Reset camera" onClick={onResetCamera}>
        <ResetCameraIcon />
      </IconButton>
    </div>
  )
}
