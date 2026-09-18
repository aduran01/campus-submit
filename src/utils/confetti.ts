/**
 * Minimal canvas confetti effect — no dependency needed for a ~2.5s burst.
 *
 * `runConfetti` draws and animates particles on the given canvas (which the
 * caller is expected to size via CSS to cover the area it wants confetti
 * over) and returns a cleanup function that cancels the animation and
 * clears the canvas. Safe to call the cleanup function multiple times.
 */

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  rotation: number
  rotationSpeed: number
  shape: 'rect' | 'circle'
}

const CONFETTI_COLOR_TOKENS = [
  '--color-primary-400',
  '--color-primary-600',
  '--color-success-500',
  '--color-warning-500',
  '--color-danger-500',
  '--color-neutral-0',
]

/** Reads the live design tokens rather than duplicating their hex values here, so confetti always matches the current palette. */
function readConfettiColors(): string[] {
  const computed = getComputedStyle(document.documentElement)
  return CONFETTI_COLOR_TOKENS.map((token) => computed.getPropertyValue(token).trim()).filter(Boolean)
}

export function runConfetti(canvas: HTMLCanvasElement, particleCount = 150, durationMs = 2600): () => void {
  // Respect the OS-level reduced-motion preference: skip the burst entirely
  // rather than force motion CSS alone can't reach (this is a <canvas>).
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return () => {}
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

  const colors = readConfettiColors()
  const width = canvas.clientWidth
  const height = canvas.clientHeight
  canvas.width = width
  canvas.height = height

  const particles: Particle[] = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: -20 - Math.random() * height * 0.4,
    vx: (Math.random() - 0.5) * 3.2,
    vy: 1.5 + Math.random() * 2.5,
    size: 6 + Math.random() * 6,
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 12,
    shape: Math.random() > 0.5 ? 'rect' : 'circle',
  }))

  let frameId = 0
  let elapsed = 0
  let lastTime = performance.now()
  let cancelled = false

  function tick(now: number) {
    if (cancelled) return
    const delta = now - lastTime
    lastTime = now
    elapsed += delta

    ctx!.clearRect(0, 0, width, height)
    for (const p of particles) {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.035
      p.rotation += p.rotationSpeed

      ctx!.save()
      ctx!.translate(p.x, p.y)
      ctx!.rotate((p.rotation * Math.PI) / 180)
      ctx!.fillStyle = p.color
      if (p.shape === 'rect') {
        ctx!.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      } else {
        ctx!.beginPath()
        ctx!.arc(0, 0, p.size / 2, 0, Math.PI * 2)
        ctx!.fill()
      }
      ctx!.restore()
    }

    if (elapsed < durationMs) {
      frameId = requestAnimationFrame(tick)
    } else {
      ctx!.clearRect(0, 0, width, height)
    }
  }

  frameId = requestAnimationFrame(tick)

  return () => {
    cancelled = true
    cancelAnimationFrame(frameId)
    ctx.clearRect(0, 0, width, height)
  }
}
