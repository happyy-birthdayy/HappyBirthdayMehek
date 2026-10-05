'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { CalendarHeart, Clock, Heart, Moon, Sun, Wind } from 'lucide-react'
import { SectionShell } from './section-shell'
import { useDisplayName } from './birthday-context'
import { cn } from '@/lib/utils'

const DAY = 86_400_000

function nextBirthday(birth: Date, now: Date) {
  const next = new Date(now.getFullYear(), birth.getMonth(), birth.getDate())
  if (next.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) {
    next.setFullYear(now.getFullYear() + 1)
  }
  return next
}

function format(n: number) {
  return Math.floor(n).toLocaleString('en-US')
}

export function AgeCounterSection() {
  const name = useDisplayName()
  const [birthDate, setBirthDate] = useState('2000-01-01')
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])

  const birth = new Date(`${birthDate}T00:00:00`)
  const valid = !Number.isNaN(birth.getTime()) && now !== null && birth.getTime() < now
  const ms = valid && now ? now - birth.getTime() : 0
  const nowDate = now ? new Date(now) : null
  const years = valid && nowDate ? Math.floor(ms / (365.2425 * DAY)) : 0
  const daysToNext =
    valid && nowDate ? Math.round((nextBirthday(birth, nowDate).getTime() - new Date(nowDate.toDateString()).getTime()) / DAY) : 0

  const stats = [
    { label: 'Days on Earth', value: format(ms / DAY), icon: Sun, tone: 'bg-accent' },
    { label: 'Hours of awesome', value: format(ms / 3_600_000), icon: Clock, tone: 'bg-secondary' },
    { label: 'Seconds (live!)', value: format(ms / 1000), icon: CalendarHeart, tone: 'bg-primary text-primary-foreground' },
    { label: 'Heartbeats, roughly', value: format((ms / 60_000) * 80), icon: Heart, tone: 'bg-card' },
    { label: 'Breaths taken', value: format((ms / 60_000) * 16), icon: Wind, tone: 'bg-accent' },
    { label: 'Full moons seen', value: format(ms / (29.53 * DAY)), icon: Moon, tone: 'bg-secondary' },
  ]

  return (
    <SectionShell
      id="age"
      index={2}
      eyebrow="Life in numbers"
      tone="yellow"
      title={
        <>
          {name}, you&apos;ve been amazing for{' '}
          <span className="inline-block -rotate-2 rounded-xl border border-border bg-card px-3 tabular-nums shadow-pop">
            {valid ? years : '--'}
          </span>{' '}
          years
        </>
      }
      description="Pick a birth date and watch the counters tick in real time. Every second counts — literally."
    >
      <div className="mb-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <label htmlFor="birth-date" className="font-display font-bold">
          Birth date
        </label>
        <input
          id="birth-date"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          className="rounded-full border border-border bg-card px-5 py-2 font-display font-bold shadow-pop outline-none focus-visible:ring-4 focus-visible:ring-primary/40"
        />
        {valid ? (
          <span className="rounded-full border border-border bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">
            {daysToNext === 0 || daysToNext === 365 ? "It's today!" : `Next birthday in ${daysToNext} days`}
          </span>
        ) : null}
      </div>

      <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s, i) => (
          <motion.li
            key={s.label}
            initial={{ opacity: 0, y: 40, rotate: i % 2 ? 3 : -3 }}
            whileInView={{ opacity: 1, y: 0, rotate: i % 2 ? 1 : -1 }}
            whileHover={{ rotate: 0, scale: 1.04 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', stiffness: 160, damping: 14, delay: i * 0.07 }}
            className={cn('rounded-3xl border border-border p-6 shadow-pop-lg', s.tone)}
          >
            <s.icon className="mb-6 size-8" aria-hidden="true" />
            <p className="font-display text-4xl font-extrabold tabular-nums md:text-5xl" aria-live={i === 2 ? 'off' : undefined}>
              {valid ? s.value : '—'}
            </p>
            <p className="mt-2 font-bold opacity-80">{s.label}</p>
          </motion.li>
        ))}
      </ul>
    </SectionShell>
  )
}
