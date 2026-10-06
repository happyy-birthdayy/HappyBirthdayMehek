'use client'

import { useState } from 'react'
import { AnimatePresence, motion, useAnimationControls } from 'motion/react'
import { Heart, Sun, Ticket, type LucideIcon } from 'lucide-react'
import { SectionShell } from './section-shell'
import { burstFromElement, playSuccess, playTone } from '@/lib/effects'

type GiftData = {
  box: string
  ribbon: string
  icon: LucideIcon
  kicker: string
  title: string
  body: string
}

const GIFTS: GiftData[] = [
  {
    box: 'var(--primary)',
    ribbon: 'var(--accent)',
    icon: Ticket,
    kicker: 'Coupon',
    title: 'One giant hug',
    body: 'Redeemable anytime, anywhere. No expiry date. Unlimited refills.',
  },
  {
    box: 'var(--secondary)',
    ribbon: 'var(--primary)',
    icon: Sun,
    kicker: 'Fact',
    title: 'You make every room brighter',
    body: 'Scientists are baffled. Friends are not. It is simply who you are.',
  },
  {
    box: 'var(--accent)',
    ribbon: 'oklch(0.7 0.14 330)',
    icon: Heart,
    kicker: 'Promise',
    title: 'Your favorite place, my treat',
    body: 'Pick the place, the dessert and the playlist. I will handle the rest.',
  },
]

function GiftBox({ gift, index }: { gift: GiftData; index: number }) {
  const [opened, setOpened] = useState(false)
  const [busy, setBusy] = useState(false)
  const controls = useAnimationControls()

  const open = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (opened || busy) return
    const el = e.currentTarget
    setBusy(true)
    ;[392, 440, 494].forEach((f, i) => playTone(f, 0.15, i * 0.12, 'square', 0.05))
    await controls.start({ rotate: [0, -8, 8, -10, 10, -6, 6, 0], transition: { duration: 0.6 } })
    setOpened(true)
    setBusy(false)
    burstFromElement(el, 90)
    playSuccess()
  }

  const Icon = gift.icon

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-80 w-full max-w-xs items-end justify-center">
        <AnimatePresence>
          {opened ? (
            <motion.div
              initial={{ y: 80, scale: 0.4, opacity: 0 }}
              animate={{ y: -10, scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 180, damping: 13, delay: 0.15 }}
              className="absolute bottom-24 z-20 w-64 rounded-3xl border border-border bg-card p-5 text-center shadow-pop-lg"
              role="status"
            >
              <span className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full border border-border" style={{ background: gift.box }}>
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{gift.kicker}</p>
              <p className="font-display text-xl font-extrabold leading-tight">{gift.title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{gift.body}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={open}
          animate={controls}
          whileHover={opened ? undefined : { y: -6, scale: 1.03 }}
          aria-label={opened ? `Gift ${index + 1} opened: ${gift.title}` : `Unwrap gift ${index + 1}`}
          className="relative h-40 w-44 focus-visible:outline-4 focus-visible:outline-offset-4"
        >
          <motion.span
            animate={opened ? { y: -170, x: index % 2 ? -60 : 60, rotate: index % 2 ? -45 : 45, opacity: 0 } : { y: 0 }}
            transition={{ type: 'spring', stiffness: 120, damping: 14 }}
            className="absolute -left-2 -right-2 top-0 z-10 h-10 rounded-lg border border-border"
            style={{ background: gift.box }}
          >
            <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 border-x-2 border-border" style={{ background: gift.ribbon }} />
            <span className="absolute -top-8 left-1/2 flex -translate-x-1/2">
              <span className="h-8 w-10 -rotate-12 rounded-[50%_50%_10%_50%] border border-border" style={{ background: gift.ribbon }} />
              <span className="h-8 w-10 rotate-12 rounded-[50%_50%_50%_10%] border border-border" style={{ background: gift.ribbon }} />
            </span>
          </motion.span>
          <span className="absolute inset-x-0 bottom-0 top-9 rounded-b-xl border border-border shadow-pop-lg" style={{ background: gift.box }}>
            <span className="absolute inset-y-0 left-1/2 w-6 -translate-x-1/2 border-x-2 border-border" style={{ background: gift.ribbon }} />
          </span>
        </motion.button>
      </div>
      <p className="mt-6 font-display text-lg font-bold">{opened ? 'Opened!' : 'Tap to unwrap'}</p>
    </div>
  )
}

export function GiftSection() {
  return (
    <SectionShell
      id="gifts"
      index={6}
      eyebrow="Surprises"
      tone="cream"
      title="Three gifts with your name on them"
      description="Give each box a tap. They're a little shy at first."
    >
      <div className="grid gap-8 md:grid-cols-3">
        {GIFTS.map((g, i) => (
          <GiftBox key={g.title} gift={g} index={i} />
        ))}
      </div>
    </SectionShell>
  )
}
