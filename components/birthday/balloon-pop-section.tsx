'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Play, Timer, Trophy } from 'lucide-react'
import { Balloon, FunButton, SectionShell } from './section-shell'
import { burst, playError, playPop, playSuccess } from '@/lib/effects'

type BalloonKind = 'normal' | 'gold' | 'bomb'
type FloatingBalloon = { id: number; x: number; color: string; duration: number; kind: BalloonKind; size: number }
type PopMark = { id: number; x: number; y: number; label: string; good: boolean }

const GAME_SECONDS = 30
const COLORS = ['var(--primary)', 'var(--secondary)', 'oklch(0.7 0.14 330)', 'oklch(0.78 0.12 20)']
const POINTS: Record<BalloonKind, number> = { normal: 1, gold: 5, bomb: -3 }

export function BalloonPopSection() {
  const [phase, setPhase] = useState<'idle' | 'playing' | 'over'>('idle')
  const [balloons, setBalloons] = useState<FloatingBalloon[]>([])
  const [marks, setMarks] = useState<PopMark[]>([])
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(0)
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS)
  const idRef = useRef(0)
  const arenaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phase !== 'playing') return
    const startedAt = Date.now()
    const spawn = window.setInterval(() => {
      const elapsed = (Date.now() - startedAt) / 1000
      const roll = Math.random()
      const kind: BalloonKind = roll < 0.1 ? 'gold' : roll < 0.25 ? 'bomb' : 'normal'
      setBalloons((prev) => [
        ...prev,
        {
          id: ++idRef.current,
          x: 4 + Math.random() * 84,
          color: kind === 'gold' ? 'var(--accent)' : kind === 'bomb' ? 'oklch(0.3 0.03 320)' : COLORS[Math.floor(Math.random() * COLORS.length)],
          duration: Math.max(2.4, 6 - elapsed * 0.12) + Math.random() * 1.2,
          kind,
          size: kind === 'gold' ? 48 : 56 + Math.random() * 16,
        },
      ])
    }, 520)
    const tick = window.setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase('over')
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      window.clearInterval(spawn)
      window.clearInterval(tick)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'over') return
    setBalloons([])
    if (score > best) {
      setBest(score)
      burst({ y: 0.5 })
      playSuccess()
    }
  }, [phase, score, best])

  const start = () => {
    setScore(0)
    setTimeLeft(GAME_SECONDS)
    setBalloons([])
    setMarks([])
    setPhase('playing')
  }

  const pop = (b: FloatingBalloon, e: React.PointerEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect()
    if (!rect) return
    const pts = POINTS[b.kind]
    if (pts < 0) playError()
    else playPop()
    setScore((s) => Math.max(0, s + pts))
    setBalloons((prev) => prev.filter((x) => x.id !== b.id))
    setMarks((prev) => [
      ...prev,
      { id: b.id, x: e.clientX - rect.left, y: e.clientY - rect.top, label: pts > 0 ? `+${pts}` : `${pts}`, good: pts > 0 },
    ])
  }

  return (
    <SectionShell
      id="balloons"
      index={4}
      eyebrow="Mini game"
      tone="teal"
      title="Pop the party balloons"
      description="You have 30 seconds. Regular balloons are +1, golden ones are +5 — but avoid the dark grumpy ones (−3)."
    >
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 font-display font-bold">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-pop">
          Score <span className="tabular-nums text-primary">{score}</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-pop">
          <Timer className="size-4" aria-hidden="true" />
          <span className="tabular-nums">{timeLeft}s</span>
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-accent px-4 py-2 shadow-pop">
          <Trophy className="size-4" aria-hidden="true" />
          Best <span className="tabular-nums">{best}</span>
        </span>
      </div>

      <div
        ref={arenaRef}
        className="relative mx-auto h-[520px] max-w-4xl touch-manipulation select-none overflow-hidden rounded-3xl border border-border bg-[linear-gradient(180deg,oklch(0.92_0.05_340),oklch(0.98_0.015_350))] shadow-pop-lg"
      >
        <div aria-hidden="true" className="absolute left-[10%] top-12 h-10 w-32 rounded-full bg-card/80" />
        <div aria-hidden="true" className="absolute right-[12%] top-28 h-8 w-24 rounded-full bg-card/70" />

        {balloons.map((b) => (
          <button
            key={b.id}
            type="button"
            aria-label={b.kind === 'bomb' ? 'Grumpy balloon, avoid' : b.kind === 'gold' ? 'Golden balloon, 5 points' : 'Balloon, 1 point'}
            onPointerDown={(e) => pop(b, e)}
            onAnimationEnd={() => setBalloons((prev) => prev.filter((x) => x.id !== b.id))}
            className="absolute -bottom-32 animate-rise cursor-crosshair text-foreground"
            style={{ left: `${b.x}%`, ['--rise-duration' as string]: `${b.duration}s`, ['--rise-distance' as string]: '700px' }}
          >
            <span className="block animate-wiggle">
              <Balloon color={b.color} style={{ width: b.size }} />
            </span>
            {b.kind === 'bomb' ? (
              <span aria-hidden="true" className="absolute left-1/2 top-6 -translate-x-1/2 font-display text-lg font-extrabold text-background">
                {'>:('}
              </span>
            ) : null}
          </button>
        ))}

        {marks.map((m) => (
          <span
            key={m.id}
            aria-hidden="true"
            onAnimationEnd={() => setMarks((prev) => prev.filter((x) => x.id !== m.id))}
            className={`pointer-events-none absolute animate-pop-burst font-display text-3xl font-extrabold ${m.good ? 'text-primary' : 'text-destructive'}`}
            style={{ left: m.x - 16, top: m.y - 20 }}
          >
            {m.label}
          </span>
        ))}

        <AnimatePresence>
          {phase !== 'playing' ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/70 p-6 text-center backdrop-blur-sm"
            >
              {phase === 'over' ? (
                <>
                  <p className="font-display text-5xl font-extrabold">{"Time's up!"}</p>
                  <p className="text-xl font-bold" role="status">
                    You popped <span className="text-primary">{score}</span> points of joy.
                  </p>
                </>
              ) : (
                <p className="font-display text-3xl font-extrabold">Ready to pop?</p>
              )}
              <FunButton onClick={start} className="text-lg">
                <Play className="size-5" aria-hidden="true" />
                {phase === 'over' ? 'Play again' : 'Start game'}
              </FunButton>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </SectionShell>
  )
}
