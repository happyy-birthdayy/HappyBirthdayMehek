'use client'

import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { RefreshCw } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { burst, playSuccess, playTone } from '@/lib/effects'

const SEGMENTS = [
  { label: 'Shopping Spree', full: 'I carry all your shopping bags for the day without complaining once.', color: 'var(--primary)' },
  { label: 'Movie Time', full: 'You pick the movie, and I pay for the tickets and the popcorn.', color: 'var(--accent)' },
  { label: 'WishX2', full: 'You just dubbled your wish luck, ask any wish you like', color: 'var(--secondary)' },
  { label: 'Snack Delivery', full: 'One free midnight snack delivery right to your door when the cravings hit.', color: 'oklch(0.82 0.09 330)' },
  { label: 'Paparazzi', full: 'I act as your personal photographer for a full Instagram or aesthetic photoshoot.', color: 'var(--primary)' },
  { label: 'Skip a Chore', full: 'Hand over one annoying task or chore you hate doing, and I will handle it.', color: 'var(--accent)' },
  { label: 'Dessert', full: 'A free dessert of your choice at your favorite cafe or bakery.', color: 'var(--secondary)' },
  { label: 'Aux Cable VIP', full: 'You get absolute, unquestioned control of the music playlist for a whole week.', color: 'oklch(0.82 0.09 330)' },
]

const SLICE = 360 / SEGMENTS.length

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export function SpinWheelSection() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<number | null>(null)
  const tickRef = useRef<number | null>(null)

  const spin = () => {
    if (spinning) return
    setResult(null)
    setSpinning(true)
    const target = rotation + 360 * 5 + Math.random() * 360
    setRotation(target)
    let count = 0
    tickRef.current = window.setInterval(() => {
      count++
      playTone(900 + (count % 2) * 200, 0.03, 0, 'square', 0.03)
    }, 90)
    window.setTimeout(() => {
      if (tickRef.current) window.clearInterval(tickRef.current)
      const normalized = ((360 - (target % 360)) % 360 + 360) % 360
      setResult(Math.floor(normalized / SLICE) % SEGMENTS.length)
      setSpinning(false)
      playSuccess()
      burst({ y: 0.55 }, 80)
    }, 4200)
  }

  return (
    <SectionShell
      id="wheel"
      index={10}
      eyebrow="Fortune"
      tone="pink"
      title="Spin the birthday wheel"
      description="Let fate decide your birthday perk. Re-spins are allowed — it's your day."
    >
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <div aria-hidden="true" className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
            <svg width="40" height="48" viewBox="0 0 40 48">
              <path d="M20 46 4 6h32Z" fill="var(--foreground)" />
              <path d="M20 38 10 10h20Z" fill="var(--accent)" />
            </svg>
          </div>
          <motion.svg
            viewBox="0 0 300 300"
            animate={{ rotate: rotation }}
            transition={{ duration: 4.2, ease: [0.15, 0.85, 0.25, 1] }}
            className="size-full drop-shadow-[8px_8px_0_var(--foreground)]"
            role="img"
            aria-label="Birthday prize wheel"
          >
            <circle cx="150" cy="150" r="148" fill="var(--foreground)" />
            {SEGMENTS.map((s, i) => {
              const a = polar(150, 150, 140, i * SLICE)
              const b = polar(150, 150, 140, (i + 1) * SLICE)
              const mid = i * SLICE + SLICE / 2
              const t = polar(150, 150, 86, mid)
              return (
                <g key={i}>
                  <path d={`M150 150 L${a.x} ${a.y} A140 140 0 0 1 ${b.x} ${b.y} Z`} fill={s.color} stroke="var(--foreground)" strokeWidth="2.5" />
                  <text
                    x={t.x}
                    y={t.y}
                    transform={`rotate(${mid - 90} ${t.x} ${t.y})`}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="font-display"
                    fontWeight={800}
                    fontSize="13"
                    fill="var(--foreground)"
                  >
                    {s.label}
                  </text>
                </g>
              )
            })}
            <circle cx="150" cy="150" r="26" fill="var(--card)" stroke="var(--foreground)" strokeWidth="3" />
            <circle cx="150" cy="150" r="8" fill="var(--primary)" />
          </motion.svg>
        </div>

        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div className="min-h-44 w-full" aria-live="polite">
            <AnimatePresence mode="wait">
              {result !== null ? (
                <motion.div
                  key={result}
                  initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
                  animate={{ scale: 1, opacity: 1, rotate: -2 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                  className="rounded-3xl border border-border p-6 shadow-pop-lg"
                  style={{ background: SEGMENTS[result].color }}
                >
                  <p className="text-sm font-bold uppercase tracking-widest">You landed on</p>
                  <p className="font-display text-4xl font-extrabold">{SEGMENTS[result].label}</p>
                  <p className="mt-2 font-bold">{SEGMENTS[result].full}</p>
                </motion.div>
              ) : (
                <motion.p key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="font-display text-3xl font-extrabold">
                  {spinning ? 'Round and round it goes...' : 'Feeling lucky?'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <FunButton onClick={spin} disabled={spinning} className="mt-6 text-lg">
            <RefreshCw className={spinning ? 'size-5 animate-spin' : 'size-5'} aria-hidden="true" />
            {spinning ? 'Spinning' : result === null ? 'Spin the wheel' : 'Spin again'}
          </FunButton>
        </div>
      </div>
    </SectionShell>
  )
}
