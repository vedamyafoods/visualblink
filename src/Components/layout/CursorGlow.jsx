import { useEffect, useRef } from 'react'

export function CursorGlow() {
  const glowRef = useRef(null)

  useEffect(() => {
    const move = (event) => {
      if (!glowRef.current) return
      glowRef.current.style.transform = `translate3d(${event.clientX - 160}px, ${event.clientY - 160}px, 0)`
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed left-0 top-0 z-[1] hidden h-80 w-80 rounded-full bg-blue-400/15 blur-3xl lg:block"
    />
  )
}
