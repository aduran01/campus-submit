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

const CONFETTI_COLORS = ['#4f46e5', '#22c55e', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6']

export function runConfetti(canvas: HTMLCanvasElement, particleCount = 150, durationMs = 2600): () => void {
  const ctx = canvas.getContext('2d')
  if (!ctx) return () => {}

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
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
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
