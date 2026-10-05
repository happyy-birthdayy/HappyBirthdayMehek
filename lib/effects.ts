import confetti from 'canvas-confetti'

export const PARTY_COLORS = ['#f472b6', '#fbcfe8', '#e11d74', '#f9a8d4', '#fde2e4', '#d8b4fe']

export function burst(origin: { x?: number; y?: number } = { y: 0.6 }, particleCount = 120) {
  confetti({
    particleCount,
    spread: 80,
    startVelocity: 45,
    origin,
    colors: PARTY_COLORS,
    disableForReducedMotion: true,
  })
}

export function burstFromElement(el: Element | null, particleCount = 80) {
  if (!el || typeof window === 'undefined') return burst()
  const rect = el.getBoundingClientRect()
  burst(
    {
      x: (rect.left + rect.width / 2) / window.innerWidth,
      y: (rect.top + rect.height / 2) / window.innerHeight,
    },
    particleCount,
  )
}

export function sideCannons() {
  const end = Date.now() + 1200
  const frame = () => {
    confetti({ particleCount: 4, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: PARTY_COLORS, disableForReducedMotion: true })
    confetti({ particleCount: 4, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: PARTY_COLORS, disableForReducedMotion: true })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

export function fireworks(durationMs = 4000) {
  const end = Date.now() + durationMs
  const id = window.setInterval(() => {
    const timeLeft = end - Date.now()
    if (timeLeft <= 0) return window.clearInterval(id)
    const particleCount = Math.round(50 * (timeLeft / durationMs)) + 10
    const opts = { startVelocity: 30, spread: 360, ticks: 70, zIndex: 60, colors: PARTY_COLORS, disableForReducedMotion: true }
    confetti({ ...opts, particleCount, origin: { x: Math.random() * 0.3 + 0.1, y: Math.random() * 0.4 } })
    confetti({ ...opts, particleCount, origin: { x: Math.random() * 0.3 + 0.6, y: Math.random() * 0.4 } })
  }, 260)
}

let audioCtx: AudioContext | null = null
let soundEnabled = true

export function setSoundEnabled(value: boolean) {
  soundEnabled = value
}

function getAudio() {
  if (typeof window === 'undefined' || !soundEnabled) return null
  if (!audioCtx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new Ctor()
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume()
  return audioCtx
}

export function playTone(freq: number, duration = 0.4, delay = 0, type: OscillatorType = 'triangle', volume = 0.18) {
  const ctx = getAudio()
  if (!ctx) return
  const start = ctx.currentTime + delay
  const osc = ctx.createOscillator()
  const overtone = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = type
  overtone.type = 'sine'
  osc.frequency.value = freq
  overtone.frequency.value = freq * 2
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain)
  overtone.connect(gain)
  gain.connect(ctx.destination)
  osc.start(start)
  overtone.start(start)
  osc.stop(start + duration + 0.05)
  overtone.stop(start + duration + 0.05)
}

export function playPop() {
  const ctx = getAudio()
  if (!ctx) return
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  const t = ctx.currentTime
  osc.type = 'square'
  osc.frequency.setValueAtTime(900, t)
  osc.frequency.exponentialRampToValueAtTime(120, t + 0.08)
  gain.gain.setValueAtTime(0.12, t)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.1)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.12)
}

export function playSuccess() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => playTone(f, 0.35, i * 0.09))
}

export function playError() {
  playTone(220, 0.25, 0, 'sawtooth', 0.08)
  playTone(180, 0.3, 0.12, 'sawtooth', 0.08)
}

export function playClick() {
  playTone(880, 0.08, 0, 'sine', 0.08)
}
