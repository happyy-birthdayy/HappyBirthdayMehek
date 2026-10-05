'use client'

import { useState } from 'react'
import { motion } from 'motion/react'
import { Cake, Crown, Gift, Heart, IceCreamCone, Music, PartyPopper, RotateCcw, Star, type LucideIcon } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { burst, playClick, playError, playSuccess, playTone } from '@/lib/effects'
import { cn } from '@/lib/utils'

const ICONS: { icon: LucideIcon; label: string; tone: string }[] = [
  { icon: Cake, label: 'Cake', tone: 'bg-primary text-primary-foreground' },
  { icon: Gift, label: 'Gift', tone: 'bg-accent' },
  { icon: PartyPopper, label: 'Party popper', tone: 'bg-secondary' },
  { icon: Music, label: 'Music', tone: 'bg-[oklch(0.82_0.09_330)]' },
  { icon: Star, label: 'Star', tone: 'bg-accent' },
  { icon: Heart, label: 'Heart', tone: 'bg-primary text-primary-foreground' },
  { icon: IceCreamCone, label: 'Ice cream', tone: 'bg-secondary' },
  { icon: Crown, label: 'Crown', tone: 'bg-[oklch(0.82_0.09_330)]' },
]

type Card = { id: number; pair: number }

function shuffledDeck(): Card[] {
  const deck = ICONS.flatMap((_, pair) => [
    { id: pair * 2, pair },
    { id: pair * 2 + 1, pair },
  ])
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const INITIAL_DECK: Card[] = ICONS.flatMap((_, pair) => [
  { id: pair * 2, pair },
  { id: pair * 2 + 1, pair },
])

export function MemoryMatchSection() {
  const [deck, setDeck] = useState<Card[]>(INITIAL_DECK)
  const [started, setStarted] = useState(false)
  const [flipped, setFlipped] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [moves, setMoves] = useState(0)
  const [locked, setLocked] = useState(false)

  const won = matched.size === ICONS.length

  const reset = () => {
    setDeck(shuffledDeck())
    setFlipped([])
    setMatched(new Set())
    setMoves(0)
    setLocked(false)
    setStarted(true)
  }

  const flip = (index: number) => {
    if (!started) {
      reset()
      return
    }
    if (locked || flipped.includes(index) || matched.has(deck[index].pair)) return
    playClick()
    const next = [...flipped, index]
    setFlipped(next)
    if (next.length < 2) return

    setMoves((m) => m + 1)
    const [a, b] = next
    if (deck[a].pair === deck[b].pair) {
      const newMatched = new Set(matched).add(deck[a].pair)
      setMatched(newMatched)
      setFlipped([])
      playTone(880, 0.2)
      if (newMatched.size === ICONS.length) {
        burst({ y: 0.5 }, 200)
        playSuccess()
      }
    } else {
      setLocked(true)
      window.setTimeout(() => {
        playError()
        setFlipped([])
        setLocked(false)
      }, 800)
    }
  }

  return (
    <SectionShell
      id="memory"
      index={5}
      eyebrow="Mini game"
      tone="pink"
      title="Birthday memory match"
      description="Find all 8 pairs of party favorites in as few moves as possible."
    >
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3 font-display font-bold">
        <span className="rounded-full border border-border bg-card px-4 py-2 shadow-pop">
          Moves <span className="tabular-nums text-primary">{moves}</span>
        </span>
        <span className="rounded-full border border-border bg-card px-4 py-2 shadow-pop">
          Pairs <span className="tabular-nums text-primary">{matched.size}</span>/8
        </span>
        <FunButton variant="accent" onClick={reset} className="py-2">
          <RotateCcw className="size-4" aria-hidden="true" />
          {started ? 'Shuffle' : 'Start'}
        </FunButton>
      </div>

      {won ? (
        <motion.p
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          role="status"
          className="mx-auto mb-6 w-fit rounded-2xl border border-border bg-accent px-6 py-3 font-display text-2xl font-extrabold shadow-pop"
        >
          {`Sharp memory! Solved in ${moves} moves.`}
        </motion.p>
      ) : null}

      <div className="mx-auto grid max-w-xl grid-cols-4 gap-3 md:gap-4">
        {deck.map((card, i) => {
          const isUp = !started || flipped.includes(i) || matched.has(card.pair)
          const { icon: Icon, label, tone } = ICONS[card.pair]
          const isMatched = matched.has(card.pair)
          return (
            <motion.button
              key={card.id}
              type="button"
              layout
              onClick={() => flip(i)}
              aria-label={isUp ? label : 'Hidden card'}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.92 }}
              className="perspective aspect-square focus-visible:outline-4 focus-visible:outline-offset-2"
            >
              <span
                className={cn(
                  'preserve-3d relative block size-full transition-transform duration-500',
                  isUp && 'rotate-y-180',
                )}
              >
                <span className="backface-hidden absolute inset-0 flex items-center justify-center rounded-2xl border border-border bg-foreground shadow-pop">
                  <span className="font-display text-3xl font-extrabold text-accent">?</span>
                </span>
                <span
                  className={cn(
                    'backface-hidden rotate-y-180 absolute inset-0 flex items-center justify-center rounded-2xl border border-border shadow-pop',
                    tone,
                    isMatched && 'ring-4 ring-accent ring-offset-2',
                  )}
                >
                  <Icon className="size-1/2" aria-hidden="true" />
                </span>
              </span>
            </motion.button>
          )
        })}
      </div>
      {!started ? <p className="mt-6 text-center font-bold text-muted-foreground">Memorize the cards, then press Start!</p> : null}
    </SectionShell>
  )
}
