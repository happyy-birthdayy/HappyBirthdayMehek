'use client'

import { ArrowUp, Heart } from 'lucide-react'
import { useDisplayName } from './birthday-context'

export function SiteFooter() {
  const name = useDisplayName()
  return (
    <footer className="bg-foreground px-4 py-12 text-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <p className="font-display text-3xl font-extrabold">
          Happy birthday, <span className="text-accent">{name}</span>.
        </p>
        <p className="inline-flex items-center gap-2 text-sm opacity-80">
          Made with <Heart className="size-4 fill-primary text-primary" aria-label="love" /> and way too much confetti
        </p>
        <a
          href="#hero"
          className="inline-flex items-center gap-2 rounded-full border-2 border-background px-5 py-2 font-display font-bold transition-colors hover:bg-background hover:text-foreground"
        >
          <ArrowUp className="size-4" aria-hidden="true" />
          Party again
        </a>
      </div>
    </footer>
  )
}
