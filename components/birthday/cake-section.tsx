'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Mic, MicOff, RotateCcw, Sparkles } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { useDisplayName } from './birthday-context'
import { burst, playSuccess, playTone, sideCannons } from '@/lib/effects'

const CANDLE_COLORS = ['var(--primary)', 'var(--secondary)', 'var(--accent)', 'oklch(0.7 0.14 330)', 'var(--primary)']

function Candle({ lit, color, onBlow, index }: { lit: boolean; color: string; onBlow: () => void; index: number }) {
  return (
    <button
      type="button"
      onClick={onBlow}
      disabled={!lit}
      aria-label={lit ? `Blow out candle ${index + 1}` : `Candle ${index + 1} is out`}
      className="group relative flex h-32 w-8 flex-col items-center justify-end focus-visible:outline-4 focus-visible:outline-offset-4 disabled:cursor-default"
    >
      <AnimatePresence>
        {lit ? (
          <motion.span
            key="flame"
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute top-2 h-10 w-6 origin-bottom"
          >
            <span className="absolute inset-0 animate-flicker rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-accent shadow-[0_0_30px_10px_oklch(0.87_0.17_88/0.55)]" />
            <span className="absolute inset-x-1.5 bottom-0 top-3 animate-flicker rounded-[50%_50%_50%_50%/60%_60%_40%_40%] bg-[oklch(0.72_0.2_45)]" />
          </motion.span>
        ) : (
          <motion.span
            key="smoke"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-4 size-5 animate-smoke rounded-full bg-muted-foreground/40 blur-[2px]"
          />
        )}
      </AnimatePresence>
      <span className="mb-0 h-2 w-0.5 bg-foreground" />
      <span
        className="h-16 w-5 rounded-t-sm border border-border transition-transform group-hover:scale-105 group-enabled:group-hover:-rotate-3"
        style={{
          background: `repeating-linear-gradient(135deg, ${color} 0 8px, var(--card) 8px 14px)`,
        }}
      />
    </button>
  )
}

export function CakeSection() {
  const name = useDisplayName()
  const [lit, setLit] = useState<boolean[]>(() => CANDLE_COLORS.map(() => true))
  const [listening, setListening] = useState(false)
  const [micError, setMicError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const rafRef = useRef<number | null>(null)
  const celebratedRef = useRef(false)

  const allOut = lit.every((l) => !l)
  const remaining = lit.filter(Boolean).length

  const stopMic = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    void ctxRef.current?.close()
    streamRef.current = null
    ctxRef.current = null
    setListening(false)
  }

  useEffect(() => stopMic, [])

  useEffect(() => {
    if (allOut && !celebratedRef.current) {
      celebratedRef.current = true
      sideCannons()
      playSuccess()
      if (streamRef.current) stopMic()
    }
  }, [allOut])

  const blow = (i: number) => {
    playTone(320 - i * 30, 0.25, 0, 'sine', 0.06)
    setLit((prev) => prev.map((l, idx) => (idx === i ? false : l)))
  }

  const blowNext = () => {
    setLit((prev) => {
      const idx = prev.findIndex(Boolean)
      if (idx === -1) return prev
      return prev.map((l, i) => (i === idx ? false : l))
    })
  }

  const startMic = async () => {
    setMicError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      streamRef.current = stream
      ctxRef.current = ctx
      setListening(true)
      const data = new Uint8Array(analyser.frequencyBinCount)
      let lastBlow = 0
      const loop = () => {
        analyser.getByteFrequencyData(data)
        const avg = data.reduce((a, b) => a + b, 0) / data.length
        if (avg > 45 && performance.now() - lastBlow > 220) {
          lastBlow = performance.now()
          blowNext()
        }
        rafRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      setMicError('Microphone unavailable — just tap the candles instead!')
    }
  }

  const relight = () => {
    celebratedRef.current = false
    setLit(CANDLE_COLORS.map(() => true))
    playTone(660, 0.3)
  }

  return (
    <SectionShell
      id="cake"
      index={3}
      eyebrow="Mini game"
      tone="cream"
      title="Make a wish & blow out the candles"
      description="Tap each flame, or turn on your microphone and actually blow. Close your eyes first — it's the rules."
    >
      <div className="flex flex-col items-center">
        <div className="relative flex flex-col items-center">
          <AnimatePresence>
            {allOut ? (
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 12 }}
                className="absolute -top-20 z-10 flex items-center gap-2 rounded-2xl border border-border bg-accent px-5 py-3 font-display text-xl font-extrabold shadow-pop"
                role="status"
              >
                <Sparkles className="size-5" aria-hidden="true" />
                {`Wish granted, ${name}!`}
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="relative z-10 flex gap-4 md:gap-6">
            {lit.map((isLit, i) => (
              <Candle key={i} index={i} lit={isLit} color={CANDLE_COLORS[i]} onBlow={() => blow(i)} />
            ))}
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={() => allOut && burst({ y: 0.5 })}
            className="flex flex-col items-center"
          >
            <div className="relative h-20 w-64 rounded-t-3xl border border-border bg-card md:w-72">
              <div className="absolute inset-x-0 top-0 flex h-8 overflow-hidden rounded-t-3xl">
                {Array.from({ length: 9 }).map((_, i) => (
                  <span key={i} className="h-full flex-1 rounded-b-full border-b-2 border-border bg-primary" style={{ height: `${60 + (i % 3) * 20}%` }} />
                ))}
              </div>
              <div className="absolute inset-x-6 bottom-4 flex justify-between">
                {Array.from({ length: 6 }).map((_, i) => (
                  <span key={i} className="size-2.5 rounded-full border border-border" style={{ background: CANDLE_COLORS[i % 5] }} />
                ))}
              </div>
            </div>
            <div className="relative h-24 w-80 border-2 border-t-0 border-border bg-accent md:w-96">
              <div className="absolute inset-x-0 top-0 flex h-6">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span key={i} className="flex-1 rounded-b-full border-b-2 border-border bg-card" style={{ height: `${50 + (i % 2) * 40}%` }} />
                ))}
              </div>
              <p aria-hidden="true" className="absolute inset-x-0 bottom-3 truncate px-4 text-center font-display text-2xl font-extrabold">
                {name}
              </p>
            </div>
            <div className="h-5 w-[26rem] max-w-[90vw] rounded-full border border-border bg-secondary" />
          </motion.div>
        </div>

        <p className="mt-8 font-display text-lg font-bold" aria-live="polite">
          {allOut ? 'All candles out! Click the cake for more confetti.' : `${remaining} candle${remaining === 1 ? '' : 's'} still burning`}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-4">
          {listening ? (
            <FunButton variant="accent" onClick={stopMic}>
              <MicOff className="size-5" aria-hidden="true" />
              Stop listening
            </FunButton>
          ) : (
            <FunButton variant="secondary" onClick={startMic} disabled={allOut}>
              <Mic className="size-5" aria-hidden="true" />
              Blow into the mic
            </FunButton>
          )}
          <FunButton variant="plain" onClick={relight}>
            <RotateCcw className="size-5" aria-hidden="true" />
            Relight candles
          </FunButton>
        </div>
        {listening ? <p className="mt-4 animate-pulse font-bold text-primary">Listening... blow!</p> : null}
        {micError ? <p className="mt-4 font-bold text-destructive">{micError}</p> : null}
      </div>
    </SectionShell>
  )
}
