type MusicState = { playing: boolean; volume: number }

const F = {
  G3: 196, A3: 220, B3: 246.94, C3: 130.81, F3: 174.61,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392, A4: 440, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99,
} as const

type Note = keyof typeof F

const MELODY: [Note, number][] = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3],
]

const CHORDS: [number, Note[]][] = [
  [1, ['C3', 'E4', 'G4']], [4, ['G3', 'B3', 'D4']], [7, ['G3', 'B3', 'F4']], [10, ['C3', 'E4', 'G4']],
  [13, ['C3', 'E4', 'G4']], [16, ['F3', 'A3', 'C4']], [19, ['F3', 'A3', 'C4']], [20, ['C3', 'E4', 'G4']],
  [22, ['G3', 'B3', 'D4']], [23, ['C3', 'E4', 'G4']],
]

const LOOP_BEATS = 28
const SECONDS_PER_BEAT = 60 / 92

type Event = { beat: number; freqs: number[]; dur: number; kind: 'melody' | 'chord' }

const EVENTS: Event[] = (() => {
  const events: Event[] = []
  let beat = 0
  for (const [note, dur] of MELODY) {
    events.push({ beat, freqs: [F[note]], dur, kind: 'melody' })
    beat += dur
  }
  for (const [b, notes] of CHORDS) events.push({ beat: b, freqs: notes.map((n) => F[n]), dur: 2.5, kind: 'chord' })
  return events.sort((a, b) => a.beat - b.beat)
})()

const INITIAL: MusicState = { playing: false, volume: 0.7 }
let state = INITIAL
const listeners = new Set<() => void>()

let ctx: AudioContext | null = null
let master: GainNode | null = null
let analyser: AnalyserNode | null = null
let timer: number | null = null
let loopStart = 0
let cursor = 0

function setState(patch: Partial<MusicState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export const music = {
  subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getState: () => state,
  getServerState: () => INITIAL,
  getAnalyser: () => analyser,
}

function ensureContext() {
  if (ctx) return ctx
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  ctx = new Ctor()
  master = ctx.createGain()
  master.gain.value = 0
  analyser = ctx.createAnalyser()
  analyser.fftSize = 64
  analyser.smoothingTimeConstant = 0.8

  const delay = ctx.createDelay()
  delay.delayTime.value = 0.32
  const feedback = ctx.createGain()
  feedback.gain.value = 0.28
  const wet = ctx.createGain()
  wet.gain.value = 0.35
  master.connect(delay)
  delay.connect(feedback)
  feedback.connect(delay)
  delay.connect(wet)

  master.connect(analyser)
  wet.connect(analyser)
  analyser.connect(ctx.destination)
  return ctx
}

function voice(freq: number, start: number, length: number, peak: number, type: OscillatorType) {
  if (!ctx || !master) return
  const gain = ctx.createGain()
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.012)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  gain.connect(master)
  ;[
    { mult: 1, t: type, v: 1 },
    { mult: 2, t: 'sine' as OscillatorType, v: 0.35 },
    { mult: 4, t: 'sine' as OscillatorType, v: 0.08 },
  ].forEach(({ mult, t, v }) => {
    const osc = ctx!.createOscillator()
    const g = ctx!.createGain()
    osc.type = t
    osc.frequency.value = freq * mult
    g.gain.value = v
    osc.connect(g)
    g.connect(gain)
    osc.start(start)
    osc.stop(start + length + 0.05)
  })
}

function schedule() {
  if (!ctx) return
  const horizon = ctx.currentTime + 0.4
  while (true) {
    if (cursor >= EVENTS.length) {
      cursor = 0
      loopStart += LOOP_BEATS * SECONDS_PER_BEAT
    }
    const ev = EVENTS[cursor]
    const when = loopStart + ev.beat * SECONDS_PER_BEAT
    if (when > horizon) break
    if (ev.kind === 'melody') {
      voice(ev.freqs[0], when, Math.max(1.1, ev.dur * SECONDS_PER_BEAT * 1.6), 0.22, 'sine')
    } else {
      ev.freqs.forEach((f, i) => voice(f, when, ev.dur * SECONDS_PER_BEAT, i === 0 ? 0.12 : 0.045, 'triangle'))
    }
    cursor++
  }
}

export async function playMusic(): Promise<boolean> {
  if (typeof window === 'undefined') return false
  const audio = ensureContext()
  if (audio.state !== 'running') {
    await Promise.race([audio.resume(), new Promise((r) => setTimeout(r, 350))])
  }
  if (audio.state !== 'running') return false
  if (timer === null) {
    loopStart = audio.currentTime + 0.15
    cursor = 0
    schedule()
    timer = window.setInterval(schedule, 120)
  }
  master!.gain.cancelScheduledValues(audio.currentTime)
  master!.gain.setTargetAtTime(state.volume, audio.currentTime, 0.3)
  setState({ playing: true })
  return true
}

export function pauseMusic() {
  if (!ctx || !master) return
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
  if (timer !== null) {
    window.clearInterval(timer)
    timer = null
  }
  setState({ playing: false })
}

export function setMusicVolume(volume: number) {
  setState({ volume })
  if (ctx && master && state.playing) master.gain.setTargetAtTime(volume, ctx.currentTime, 0.05)
}
