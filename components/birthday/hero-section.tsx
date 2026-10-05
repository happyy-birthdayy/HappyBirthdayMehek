'use client'

import { motion } from 'motion/react'
import { ArrowDown, Heart, PartyPopper, Sparkles } from 'lucide-react'
import { Balloon, FunButton } from './section-shell'
import { useDisplayName } from './birthday-context'
import { playSuccess, playTone, sideCannons } from '@/lib/effects'

const FLOATING = [
  { left: '4%', color: 'var(--primary)', size: 70, duration: 16, delay: -2 },
  { left: '14%', color: 'var(--accent)', size: 54, duration: 19, delay: -9 },
  { left: '26%', color: 'var(--secondary)', size: 62, duration: 14, delay: -5 },
  { left: '72%', color: 'var(--accent)', size: 66, duration: 17, delay: -12 },
  { left: '82%', color: 'var(--primary)', size: 58, duration: 15, delay: -3 },
  { left: '92%', color: 'var(--secondary)', size: 72, duration: 20, delay: -14 },
  { left: '48%', color: 'oklch(0.7 0.14 330)', size: 48, duration: 22, delay: -7 },
]

const NOTES = [523.25, 587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5]
const LINE_ONE = 'Happy'.split('')
const LINE_TWO = 'Birthday'.split('')

function BouncyLetter({ char, index }: { char: string; index: number }) {
  return (
    <motion.span
      initial={{ y: -120, opacity: 0, rotate: -20 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.2 + index * 0.06 }}
      whileHover={{ y: -16, rotate: index % 2 ? 8 : -8, scale: 1.1 }}
      whileTap={{ scale: 0.85 }}
      onPointerEnter={() => playTone(NOTES[index % NOTES.length], 0.3, 0, 'sine', 0.08)}
      className="inline-block cursor-pointer select-none"
    >
      {char}
    </motion.span>
  )
}

export function HeroSection() {
  const displayName = useDisplayName()

  const startParty = () => {
    sideCannons()
    playSuccess()
    document.getElementById('age')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="hero" aria-labelledby="hero-title" className="relative flex min-h-svh flex-col overflow-hidden border-b-2 border-border pt-14">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        {FLOATING.map((b, i) => (
          <div
            key={i}
            className="absolute top-0 animate-float-up text-foreground"
            style={{ left: b.left, ['--float-duration' as string]: `${b.duration}s`, animationDelay: `${b.delay}s` }}
          >
            <Balloon color={b.color} style={{ width: b.size }} />
          </div>
        ))}
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: -4 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-accent px-5 py-2 font-display text-sm font-bold shadow-pop"
        >
          <Sparkles className="size-4" aria-hidden="true" />
          A whole party, just for you
        </motion.div>

        <h1 id="hero-title" className="font-display text-7xl font-extrabold leading-[0.9] tracking-tighter sm:text-8xl md:text-9xl">
          <span className="sr-only">Happy Birthday, {displayName}!</span>
          <span aria-hidden="true" className="block">
            {LINE_ONE.map((c, i) => (
              <BouncyLetter key={i} char={c} index={i} />
            ))}
          </span>
          <span aria-hidden="true" className="block font-semibold italic text-primary">
            {LINE_TWO.map((c, i) => (
              <BouncyLetter key={i} char={c} index={i + LINE_ONE.length} />
            ))}
          </span>
        </h1>

        <motion.p
          key={displayName}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 14 }}
          aria-hidden="true"
          className="mt-6 inline-flex items-center gap-3 rounded-full bg-card/80 px-8 py-2 font-display text-4xl font-semibold italic text-foreground shadow-pop-lg backdrop-blur md:text-6xl"
        >
          <Heart className="size-7 animate-heartbeat fill-primary text-primary md:size-9" />
          {displayName}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-10 flex w-full max-w-md flex-col items-center gap-4"
        >
          <FunButton onClick={startParty} className="mt-2 text-lg">
            <PartyPopper className="size-5" aria-hidden="true" />
            {"Let's start the party"}
          </FunButton>
          <p className="text-sm text-muted-foreground">Tip: hover the letters above to play notes.</p>
        </motion.div>

        <a href="#age" aria-label="Scroll to next section" className="mt-10 animate-bob rounded-full border border-border bg-card p-3 shadow-pop">
          <ArrowDown className="size-5" aria-hidden="true" />
        </a>
      </div>

      <div aria-hidden="true" className="relative z-10 overflow-hidden border-t-2 border-border bg-foreground py-3 text-background">
        <div className="flex w-max animate-marquee">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="flex shrink-0 items-center">
              {Array.from({ length: 8 }).map((__, i) => (
                <span key={i} className="flex items-center gap-6 px-6 font-display text-xl font-extrabold uppercase">
                  Happy birthday {displayName}
                  <Sparkles className="size-5 text-accent" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
