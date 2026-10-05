'use client'

import { useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Send } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { playSuccess, playTone } from '@/lib/effects'

type Lantern = { id: number; text: string; from: string; x: number; duration: number; delay: number }

const SEEDED: Lantern[] = [
  { id: 1, text: 'May your year be as sweet as the cake!', from: 'Maya', x: 8, duration: 18, delay: -3 },
  { id: 2, text: 'More laughs, fewer alarms.', from: 'Leo', x: 30, duration: 22, delay: -11 },
  { id: 3, text: 'Adventures everywhere you go.', from: 'Priya', x: 56, duration: 20, delay: -6 },
  { id: 4, text: 'Stay wonderfully weird.', from: 'Sam', x: 78, duration: 24, delay: -15 },
]

function LanternCard({ lantern, fresh }: { lantern: Lantern; fresh?: boolean }) {
  return (
    <motion.li
      initial={fresh ? { y: 0, opacity: 0, scale: 0.5 } : false}
      animate={{ y: -620, opacity: [0, 1, 1, 0], scale: 1 }}
      transition={{
        duration: lantern.duration,
        delay: fresh ? 0 : lantern.delay < 0 ? 0 : lantern.delay,
        repeat: fresh ? 0 : Infinity,
        ease: 'linear',
        opacity: { duration: lantern.duration, times: [0, 0.1, 0.8, 1], repeat: fresh ? 0 : Infinity },
      }}
      style={{ left: `${lantern.x}%` }}
      className="absolute bottom-0 w-44"
    >
      <div className="relative animate-wiggle rounded-[40%_40%_20%_20%] border border-border bg-[linear-gradient(180deg,oklch(0.92_0.06_30),oklch(0.76_0.14_5))] p-4 text-center text-foreground shadow-[0_0_40px_8px_oklch(0.85_0.1_10/0.5)]">
        <p className="text-pretty text-sm font-bold leading-snug">{lantern.text}</p>
        <p className="mt-2 text-xs font-bold uppercase tracking-widest opacity-70">{lantern.from}</p>
        <span aria-hidden="true" className="absolute -bottom-3 left-1/2 h-3 w-6 -translate-x-1/2 rounded-b-md border-2 border-t-0 border-border bg-[oklch(0.5_0.1_40)]" />
      </div>
    </motion.li>
  )
}

export function WishesSection() {
  const [lanterns, setLanterns] = useState<Lantern[]>([])
  const [wish, setWish] = useState('')
  const [from, setFrom] = useState('')
  const idRef = useRef(100)

  const release = (e: React.FormEvent) => {
    e.preventDefault()
    const text = wish.trim()
    if (!text) return
    const id = ++idRef.current
    setLanterns((prev) => [
      ...prev.slice(-6),
      { id, text: text.slice(0, 90), from: from.trim().slice(0, 20) || 'A secret friend', x: 10 + Math.random() * 65, duration: 12, delay: 0 },
    ])
    setWish('')
    ;[523, 659, 784, 1046].forEach((f, i) => playTone(f, 0.5, i * 0.12, 'sine', 0.08))
    window.setTimeout(playSuccess, 500)
  }

  return (
    <SectionShell
      id="wishes"
      index={12}
      eyebrow="Wish lanterns"
      tone="ink"
      title="Send a wish into the night sky"
      description="Write a birthday wish and release it as a glowing lantern. Watch it drift up to join the others."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <form onSubmit={release} className="flex flex-col gap-4 rounded-3xl border-2 border-ink-foreground bg-card p-6 text-card-foreground shadow-[8px_8px_0_0_var(--accent)]">
          <label htmlFor="wish-text" className="font-display text-lg font-extrabold">
            Your wish
          </label>
          <textarea
            id="wish-text"
            value={wish}
            onChange={(e) => setWish(e.target.value)}
            maxLength={90}
            rows={4}
            required
            placeholder="May all your dreams..."
            className="resize-none rounded-2xl border border-border bg-background p-4 font-medium outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          />
          <p className="-mt-2 text-right text-xs font-bold text-muted-foreground">{wish.length}/90</p>
          <label htmlFor="wish-from" className="font-display text-lg font-extrabold">
            From
          </label>
          <input
            id="wish-from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            maxLength={20}
            placeholder="Your name"
            className="rounded-full border border-border bg-background px-5 py-3 font-medium outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
          />
          <FunButton type="submit" className="mt-2">
            <Send className="size-5" aria-hidden="true" />
            Release lantern
          </FunButton>
        </form>

        <div className="relative h-[520px] overflow-hidden rounded-3xl border-2 border-ink-foreground bg-[radial-gradient(ellipse_at_bottom,oklch(0.38_0.1_345),oklch(0.2_0.06_340))]">
          <div aria-hidden="true" className="absolute inset-0">
            {Array.from({ length: 40 }).map((_, i) => (
              <span
                key={i}
                className="absolute size-1 animate-twinkle rounded-full bg-ink-foreground"
                style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 80}%`, animationDelay: `${(i % 7) * 0.4}s` }}
              />
            ))}
          </div>
          <ul aria-label="Released wishes" className="absolute inset-0">
            {SEEDED.map((l) => (
              <LanternCard key={l.id} lantern={{ ...l, delay: Math.abs(l.delay) / 3 }} />
            ))}
            {lanterns.map((l) => (
              <LanternCard key={l.id} lantern={l} fresh />
            ))}
          </ul>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(0deg,oklch(0.15_0.05_340),transparent)]" />
        </div>
      </div>
    </SectionShell>
  )
}
