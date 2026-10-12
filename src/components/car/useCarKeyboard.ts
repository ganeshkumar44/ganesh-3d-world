import { useEffect, useRef } from 'react'
import {
  type CarInput,
  createEmptyCarInput,
} from './carPhysics'

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return (
    tag === 'INPUT' ||
    tag === 'TEXTAREA' ||
    tag === 'SELECT' ||
    target.isContentEditable
  )
}

const DRIVE_KEYS = new Set([
  'w',
  'a',
  's',
  'd',
  ' ',
  'arrowup',
  'arrowdown',
  'arrowleft',
  'arrowright',
])

function applyKey(input: CarInput, code: string, down: boolean): void {
  const on = down
  switch (code) {
    case 'KeyW':
    case 'ArrowUp':
      input.forward = on
      break
    case 'KeyS':
    case 'ArrowDown':
      input.backward = on
      break
    case 'KeyA':
    case 'ArrowLeft':
      input.steerLeft = on
      break
    case 'KeyD':
    case 'ArrowRight':
      input.steerRight = on
      break
    case 'Space':
      input.brake = on
      break
    default:
      break
  }
}

/**
 * Tracks held driving keys in a ref (no React re-renders per frame).
 * Ignores keys while typing in form fields; clears on window blur.
 */
export function useCarKeyboard(
  inputRef: React.RefObject<CarInput>,
  sceneRootRef: React.RefObject<HTMLElement | null>,
) {
  const heldRef = useRef(new Set<string>())

  useEffect(() => {
    const input = inputRef.current ?? createEmptyCarInput()

    const syncInputFromHeld = () => {
      Object.assign(input, createEmptyCarInput())
      for (const code of heldRef.current) {
        applyKey(input, code, true)
      }
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (isEditableTarget(e.target)) return
      const code = e.code
      const isDrive =
        DRIVE_KEYS.has(e.key.toLowerCase()) || e.key.startsWith('Arrow')
      if (!isDrive) return

      const root = sceneRootRef.current
      if (
        root &&
        (document.activeElement === document.body ||
          root.contains(document.activeElement))
      ) {
        e.preventDefault()
      }
      if (heldRef.current.has(code)) return
      heldRef.current.add(code)
      applyKey(input, code, true)
    }

    const onKeyUp = (e: KeyboardEvent) => {
      heldRef.current.delete(e.code)
      syncInputFromHeld()
    }

    const onBlur = () => {
      heldRef.current.clear()
      Object.assign(input, createEmptyCarInput())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
    }
  }, [inputRef, sceneRootRef])
}
