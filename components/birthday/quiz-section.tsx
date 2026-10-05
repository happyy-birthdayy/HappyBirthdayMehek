'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Check, RotateCcw, X } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { burst, playError, playSuccess, playTone } from '@/lib/effects'
import { cn } from '@/lib/utils'

const QUESTIONS = [
  {
    q: 'The "Happy Birthday" melody was originally a song called...',
    options: ['Good Morning to All', 'Cheers for You', 'Oh What a Day', 'Sing Along Sally'],
    answer: 0,
    fact: 'Written by sisters Patty and Mildred Hill in 1893 as a classroom greeting.',
  },
  {
    q: 'How many people do you need in a room for a 50% chance two share a birthday?',
    options: ['183', '57', '23', '100'],
    answer: 2,
    fact: 'It is the famous "birthday paradox" — just 23 people!',
  },
  {
    q: 'Birthday cakes with candles are often traced back to which country\u2019s "Kinderfeste"?',
    options: ['France', 'Germany', 'Japan', 'Brazil'],
    answer: 1,
    fact: 'German Kinderfeste in the 1700s featured cakes with candles — one for each year.',
  },
  {
    q: 'In parts of Atlantic Canada, birthday kids get their nose greased with...',
    options: ['Maple syrup', 'Butter', 'Frosting', 'Honey'],
    answer: 1,
    fact: 'Buttered noses make you too slippery for bad luck to catch you!',
  },
  {
    q: 'Roughly how many people on Earth share any given birthday?',
    options: ['About 2,000', 'About 200,000', 'About 21 million', 'About 1 billion'],
    answer: 2,
    fact: 'With 8+ billion people, about 21 million share your special day.',
  },
]

export function QuizSection() {
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [score, setScore] = useState(0)
  const done = index >= QUESTIONS.length
  const current = QUESTIONS[Math.min(index, QUESTIONS.length - 1)]

  const choose = (i: number) => {
    if (picked !== null) return
    setPicked(i)
    if (i === current.answer) {
      setScore((s) => s + 1)
      playTone(784, 0.2)
      playTone(1046, 0.3, 0.1)
    } else {
      playError()
    }
  }

  const next = () => {
    const nextIndex = index + 1
    setPicked(null)
    setIndex(nextIndex)
    if (nextIndex >= QUESTIONS.length) {
      playSuccess()
      if (score >= 3) burst({ y: 0.5 })
    }
  }

  const restart = () => {
    setIndex(0)
    setPicked(null)
    setScore(0)
  }

  return (
    <SectionShell
      id="quiz"
      index={9}
      eyebrow="Trivia"
      tone="teal"
      title="The birthday brain-teaser"
      description="Five questions about birthdays around the world. How many can you get?"
    >
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex gap-2" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span
              key={i}
              className={cn('h-3 flex-1 rounded-full border border-border transition-colors', i < index ? 'bg-primary' : i === index ? 'bg-accent' : 'bg-card')}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {done ? (
            <motion.div
              key="done"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="rounded-3xl border border-border bg-card p-8 text-center shadow-pop-lg"
              role="status"
            >
              <p className="font-display text-7xl font-extrabold text-primary">
                {score}/{QUESTIONS.length}
              </p>
              <p className="mt-3 font-display text-2xl font-bold">
                {score === 5 ? 'Certified birthday genius!' : score >= 3 ? 'Party scholar!' : 'You get cake anyway!'}
              </p>
              <FunButton onClick={restart} className="mt-6">
                <RotateCcw className="size-5" aria-hidden="true" />
                Play again
              </FunButton>
            </motion.div>
          ) : (
            <motion.div
              key={index}
              initial={{ x: 80, opacity: 0, rotate: 2 }}
              animate={{ x: 0, opacity: 1, rotate: 0 }}
              exit={{ x: -80, opacity: 0, rotate: -2 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="rounded-3xl border border-border bg-card p-6 shadow-pop-lg md:p-8"
            >
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                Question {index + 1} of {QUESTIONS.length}
              </p>
              <h3 className="mt-2 text-balance text-2xl font-extrabold md:text-3xl">{current.q}</h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {current.options.map((opt, i) => {
                  const isAnswer = i === current.answer
                  const isPicked = i === picked
                  const showState = picked !== null
                  return (
                    <motion.button
                      key={opt}
                      type="button"
                      onClick={() => choose(i)}
                      disabled={showState}
                      whileHover={showState ? undefined : { scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      animate={showState && isPicked && !isAnswer ? { x: [0, -8, 8, -6, 6, 0] } : {}}
                      className={cn(
                        'flex items-center justify-between gap-2 rounded-2xl border border-border px-4 py-3 text-left font-bold shadow-pop transition-colors',
                        !showState && 'bg-background hover:bg-accent',
                        showState && isAnswer && 'bg-secondary',
                        showState && isPicked && !isAnswer && 'bg-destructive text-primary-foreground',
                        showState && !isAnswer && !isPicked && 'bg-background opacity-50',
                      )}
                    >
                      {opt}
                      {showState && isAnswer ? <Check className="size-5 shrink-0" aria-label="Correct" /> : null}
                      {showState && isPicked && !isAnswer ? <X className="size-5 shrink-0" aria-label="Incorrect" /> : null}
                    </motion.button>
                  )
                })}
              </div>
              {picked !== null ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-pretty text-muted-foreground" aria-live="polite">
                    {current.fact}
                  </p>
                  <FunButton onClick={next} className="shrink-0">
                    {index === QUESTIONS.length - 1 ? 'See score' : 'Next'}
                  </FunButton>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  )
}
