'use client'

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

type SectionShellProps = {
  id: string
  index: number
  eyebrow: string
  title: React.ReactNode
  description?: React.ReactNode
  tone?: 'cream' | 'pink' | 'yellow' | 'teal' | 'ink'
  className?: string
  children: React.ReactNode
}

const toneClasses: Record<NonNullable<SectionShellProps['tone']>, string> = {
  cream: 'bg-background text-foreground',
  pink: 'bg-primary/10 text-foreground',
  yellow: 'bg-accent/30 text-foreground',
  teal: 'bg-secondary/20 text-foreground',
  ink: 'bg-ink text-ink-foreground',
}

export function SectionShell({ id, index, eyebrow, title, description, tone = 'cream', className, children }: SectionShellProps) {
  const isInk = tone === 'ink'
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={cn('relative scroll-mt-16 overflow-hidden border-b-2 border-border px-4 py-20 md:px-8 md:py-28', toneClasses[tone], className)}
    >
      <div className="mx-auto max-w-6xl">
        <motion.header
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ type: 'spring', stiffness: 120, damping: 16 }}
          className="mb-12 flex flex-col items-center text-center"
        >
          <span
            className={cn(
              'mb-4 inline-flex items-center gap-2 rounded-full border-2 px-4 py-1 text-xs font-bold uppercase tracking-widest',
              isInk ? 'border-ink-foreground bg-accent text-accent-foreground' : 'border-border bg-card shadow-pop',
            )}
          >
            <span className="font-display tabular-nums">{String(index).padStart(2, '0')}</span>
            <span aria-hidden="true">/</span>
            {eyebrow}
          </span>
          <h2 id={`${id}-title`} className="text-balance text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
            {title}
          </h2>
          {description ? (
            <p className={cn('mt-4 max-w-2xl text-pretty text-lg', isInk ? 'text-ink-foreground/75' : 'text-muted-foreground')}>
              {description}
            </p>
          ) : null}
        </motion.header>
        {children}
      </div>
    </section>
  )
}

export function FunButton({
  className,
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'accent' | 'secondary' | 'plain' }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    plain: 'bg-card text-card-foreground',
  }
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 font-display text-base font-bold shadow-pop transition-all',
        'hover:-translate-y-0.5 hover:shadow-pop-lg active:translate-x-1 active:translate-y-1 active:shadow-none',
        'disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-4 focus-visible:outline-offset-2',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}

export function Balloon({ color, className, style }: { color: string; className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 60 110" className={className} style={style} aria-hidden="true">
      <path d="M30 2C14 2 4 15 4 31c0 19 15 34 26 38 11-4 26-19 26-38C56 15 46 2 30 2Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" />
      <ellipse cx="20" cy="22" rx="5" ry="9" fill="white" opacity="0.45" transform="rotate(-20 20 22)" />
      <path d="M25 69h10l-5 7Z" fill={color} stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.25" strokeLinejoin="round" />
      <path d="M30 76c-6 8 6 14 0 22s4 10 0 12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeOpacity="0.4" />
    </svg>
  )
}
