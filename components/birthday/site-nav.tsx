'use client'

import { motion, useScroll, useSpring } from 'motion/react'
import { PartyPopper, Volume2, VolumeX } from 'lucide-react'
import { useBirthday, useDisplayName } from './birthday-context'
import { SECTIONS } from './sections'

export function SiteNav() {
  const { soundOn, toggleSound } = useBirthday()
  const name = useDisplayName()
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 25 })

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <a href="#hero" className="flex min-w-0 items-center gap-2 font-display text-lg font-extrabold">
            <PartyPopper className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{name}&apos;s Big Day</span>
          </a>
          <button
            type="button"
            onClick={toggleSound}
            aria-pressed={soundOn}
            aria-label={soundOn ? 'Mute sounds' : 'Unmute sounds'}
            className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-accent shadow-pop transition-transform hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none"
          >
            {soundOn ? <Volume2 className="size-5" aria-hidden="true" /> : <VolumeX className="size-5" aria-hidden="true" />}
          </button>
        </div>
        <motion.div style={{ scaleX }} className="h-1 origin-left bg-primary" aria-hidden="true" />
      </header>

      <nav aria-label="Party sections" className="fixed right-3 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ul className="flex flex-col gap-2.5">
          {SECTIONS.map((s) => (
            <li key={s.id} className="group relative flex items-center justify-end">
              <span className="pointer-events-none absolute right-6 whitespace-nowrap rounded-full border border-border bg-card px-3 py-0.5 text-xs font-bold opacity-0 transition-opacity group-hover:opacity-100">
                {s.label}
              </span>
              <a
                href={`#${s.id}`}
                aria-label={s.label}
                className="block size-3.5 rounded-full border border-border bg-card transition-all hover:scale-125 hover:bg-primary"
              />
            </li>
          ))}
        </ul>
      </nav>
    </>
  )
}
