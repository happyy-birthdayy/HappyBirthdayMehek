'use client'

import { useEffect, useRef, useState } from 'react'
import { Music2, Play, Square } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { playTone } from '@/lib/effects'
import { cn } from '@/lib/utils'

const WHITE = [
  { note: 'G4', freq: 392, key: 'a' },
  { note: 'A4', freq: 440, key: 's' },
  { note: 'B4', freq: 493.88, key: 'd' },
  { note: 'C5', freq: 523.25, key: 'f' },
  { note: 'D5', freq: 587.33, key: 'g' },
  { note: 'E5', freq: 659.25, key: 'h' },
  { note: 'F5', freq: 698.46, key: 'j' },
  { note: 'G5', freq: 783.99, key: 'k' },
]
const BLACK = [
  { note: 'G#4', freq: 415.3, key: 'w', after: 0 },
  { note: 'A#4', freq: 466.16, key: 'e', after: 1 },
  { note: 'C#5', freq: 554.37, key: 't', after: 3 },
  { note: 'D#5', freq: 622.25, key: 'y', after: 4 },
  { note: 'F#5', freq: 739.99, key: 'i', after: 6 },
]
const ALL = [...WHITE, ...BLACK]

const MELODY: [string, number][] = [
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
  ['G4', 0.75], ['G4', 0.25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
  ['G4', 0.75], ['G4', 0.25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
  ['F5', 0.75], ['F5', 0.25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 2],
]
const BEAT = 0.42
const KEY_COLORS = ['var(--primary)', 'var(--accent)', 'var(--secondary)', 'oklch(0.82 0.09 330)']

type FloatingNote = { id: number; left: number; color: string }

export function MusicBoxSection() {
  const [active, setActive] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [notes, setNotes] = useState<FloatingNote[]>([])
  const timers = useRef<number[]>([])
  const idRef = useRef(0)

  const press = (note: string) => {
    const n = ALL.find((x) => x.note === note)
    if (!n) return
    playTone(n.freq, 0.5, 0, 'triangle', 0.14)
    setActive(note)
    const whiteIndex = WHITE.findIndex((w) => w.note === note)
    const pos = whiteIndex >= 0 ? whiteIndex : (BLACK.find((b) => b.note === note)?.after ?? 0) + 0.5
    const id = ++idRef.current
    setNotes((prev) => [...prev.slice(-14), { id, left: ((pos + 0.5) / WHITE.length) * 100, color: KEY_COLORS[id % KEY_COLORS.length] }])
    window.setTimeout(() => setActive((a) => (a === note ? null : a)), 180)
  }

  const stop = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
    setPlaying(false)
  }

  const playSong = () => {
    stop()
    setPlaying(true)
    let t = 0
    MELODY.forEach(([note, beats]) => {
      timers.current.push(window.setTimeout(() => press(note), t * 1000))
      t += beats * BEAT
    })
    timers.current.push(window.setTimeout(() => setPlaying(false), t * 1000))
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      const n = ALL.find((x) => x.key === e.key.toLowerCase())
      if (n) press(n.note)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      timers.current.forEach((t) => window.clearTimeout(t))
    }
    // press is stable in behavior; re-binding each render is unnecessary
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <SectionShell
      id="music"
      index={11}
      eyebrow="Music box"
      tone="ink"
      title="Play the birthday song"
      description="Tap the keys or use your keyboard (A S D F G H J K). Can't play? Let the music box do it."
    >
      <div className="mx-auto max-w-3xl">
        <div className="relative h-40 overflow-hidden" aria-hidden="true">
          {notes.map((n) => (
            <span
              key={n.id}
              onAnimationEnd={() => setNotes((prev) => prev.filter((x) => x.id !== n.id))}
              className="absolute bottom-0 animate-note-rise"
              style={{ left: `${n.left}%`, color: n.color }}
            >
              <Music2 className="size-10 -translate-x-1/2" />
            </span>
          ))}
        </div>

        <div className="relative rounded-3xl border-2 border-ink-foreground bg-[oklch(0.32_0.07_350)] p-3 pt-6 shadow-pop-lg md:p-5 md:pt-8">
          <div aria-hidden="true" className="absolute inset-x-6 top-2 flex justify-between md:top-3">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="size-1.5 rounded-full bg-ink-foreground/30" />
            ))}
          </div>
          <div className="relative flex h-56 md:h-64" role="group" aria-label="Piano keyboard">
            {WHITE.map((w, i) => (
              <button
                key={w.note}
                type="button"
                onPointerDown={() => press(w.note)}
                aria-label={`Play ${w.note}`}
                className={cn(
                  'relative flex flex-1 items-end justify-center rounded-b-xl border border-border pb-3 font-display text-sm font-bold text-foreground transition-all duration-100',
                  active === w.note ? 'translate-y-1 shadow-none' : 'bg-card shadow-[0_6px_0_0_var(--muted)]',
                )}
                style={active === w.note ? { background: KEY_COLORS[i % KEY_COLORS.length] } : undefined}
              >
                <span className="flex flex-col items-center leading-tight">
                  <span>{w.note.replace(/\d/, '')}</span>
                  <span className="hidden text-xs uppercase text-muted-foreground sm:block">{w.key}</span>
                </span>
              </button>
            ))}
            {BLACK.map((b) => (
              <button
                key={b.note}
                type="button"
                onPointerDown={() => press(b.note)}
                aria-label={`Play ${b.note}`}
                className={cn(
                  'absolute top-0 z-10 h-[60%] w-[8%] -translate-x-1/2 rounded-b-lg border border-border transition-all duration-100',
                  active === b.note ? 'translate-y-1 bg-primary' : 'bg-foreground',
                )}
                style={{ left: `${((b.after + 1) / WHITE.length) * 100}%` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          {playing ? (
            <FunButton variant="accent" onClick={stop}>
              <Square className="size-5" aria-hidden="true" />
              Stop
            </FunButton>
          ) : (
            <FunButton variant="accent" onClick={playSong} className="text-lg">
              <Play className="size-5" aria-hidden="true" />
              Play &ldquo;Happy Birthday&rdquo;
            </FunButton>
          )}
        </div>
      </div>
    </SectionShell>
  )
}
