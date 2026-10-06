'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, Link2, Mail, Rocket } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { useBirthday, useDisplayName } from './birthday-context'
import { fireworks, playSuccess, playTone } from '@/lib/effects'

function letterText(name: string) {
  return `Dear ${name},

Happy birthday! Somehow you keep getting more wonderful. Thank you for every laugh, every late-night talk, every VN and every moment you made my ordinary days worth living.

I hope this year brings you big adventures, quiet joys, and all the cake you can handle. Never stop being exactly you.

With all my honor,
Your biggest fan`
}

function Typewriter({ text }: { text: string }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    setCount(0)
    const id = window.setInterval(() => {
      setCount((c) => {
        if (c >= text.length) {
          window.clearInterval(id)
          return c
        }
        return c + 2
      })
    }, 24)
    return () => window.clearInterval(id)
  }, [text])

  return (
    <p className="whitespace-pre-line text-pretty text-lg leading-relaxed">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {count < text.length ? <span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-primary align-middle" /> : null}
      </span>
    </p>
  )
}

export function LetterSection() {
  const name = useDisplayName()
  const { name: rawName } = useBirthday()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const openLetter = () => {
    setOpen(true)
    ;[659, 784, 988].forEach((f, i) => playTone(f, 0.4, i * 0.1, 'sine', 0.1))
  }

  const finale = () => {
    fireworks(5000)
    playSuccess()
  }

  const share = async () => {
    const url = new URL(window.location.href)
    url.hash = ''
    if (rawName.trim()) url.searchParams.set('name', rawName.trim())
    try {
      await navigator.clipboard.writeText(url.toString())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <SectionShell
      id="letter"
      index={13}
      eyebrow="From the heart"
      tone="pink"
      title="One last thing..."
      description="There's an envelope here with your name on it."
    >
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-xl">
          <AnimatePresence mode="wait">
            {!open ? (
              <motion.button
                key="envelope"
                type="button"
                onClick={openLetter}
                exit={{ y: 60, opacity: 0, rotate: 4 }}
                whileHover={{ rotate: -2, scale: 1.03 }}
                className="relative mx-auto block aspect-[3/2] w-full max-w-md animate-bob focus-visible:outline-4 focus-visible:outline-offset-4"
                aria-label={`Open the letter for ${name}`}
              >
                <span className="absolute inset-0 rounded-2xl border border-border bg-accent shadow-pop-lg" />
                <svg viewBox="0 0 300 200" className="absolute inset-0 size-full" aria-hidden="true" preserveAspectRatio="none">
                  <path d="M4 8 150 118 296 8" fill="none" stroke="var(--foreground)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
                  <path d="M4 196 120 96M296 196 180 96" fill="none" stroke="var(--foreground)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </svg>
                <span className="absolute left-1/2 top-[58%] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-primary text-primary-foreground shadow-pop">
                  <Heart className="size-7 fill-current" aria-hidden="true" />
                </span>
                <span className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-2 font-display font-extrabold">
                  <Mail className="size-4" aria-hidden="true" />
                  {`For ${name}`}
                </span>
              </motion.button>
            ) : (
              <motion.article
                key="letter"
                initial={{ y: 120, opacity: 0, rotate: -3, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, rotate: -1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 120, damping: 15 }}
                className="rounded-3xl border border-border bg-card bg-[repeating-linear-gradient(transparent_0_31px,oklch(0.64_0.24_3/0.12)_31px_32px)] p-8 shadow-pop-lg md:p-10"
              >
                <Typewriter text={letterText(name)} />
              </motion.article>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex flex-wrap justify-center gap-4"
        >
          <FunButton onClick={finale} className="text-lg">
            <Rocket className="size-5" aria-hidden="true" />
            Grand finale fireworks
          </FunButton>
          <FunButton variant="plain" onClick={share}>
            <Link2 className="size-5" aria-hidden="true" />
            {copied ? 'Link copied!' : 'Copy shareable link'}
          </FunButton>
        </motion.div>
      </div>
    </SectionShell>
  )
}
