'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { RotateCcw, Sparkles } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { useDisplayName } from './birthday-context'
import { burstFromElement, playSuccess, playTone } from '@/lib/effects'

const PRIZES = [
  'A year full of wild adventures',
  'Unlimited cake for 365 days',
  'The best year of your life (so far)',
  'A lifetime supply of good vibes',
]

export function ScratchCardSection() {
  const name = useDisplayName()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const strokes = useRef(0)
  const [revealed, setRevealed] = useState(false)
  const [prizeIndex, setPrizeIndex] = useState(0)
  const [round, setRound] = useState(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const paint = () => {
      const { width, height } = wrap.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = width * dpr
      canvas.height = height * dpr
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.scale(dpr, dpr)
      const g = ctx.createLinearGradient(0, 0, width, height)
      g.addColorStop(0, '#f5c542')
      g.addColorStop(0.5, '#fff0a8')
      g.addColorStop(1, '#e0a92a')
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = g
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(80, 40, 60, 0.12)'
      for (let i = 0; i < 160; i++) {
        ctx.beginPath()
        ctx.arc((i * 73) % width, (i * 131) % height, 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = '#4a1f3d'
      ctx.font = '800 28px sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('SCRATCH HERE', width / 2, height / 2 - 12)
      ctx.font = '700 15px sans-serif'
      ctx.fillText('to reveal your birthday prize', width / 2, height / 2 + 20)
    }
    paint()
    strokes.current = 0
    return () => {}
  }, [round])

  const scratch = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || revealed) return
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const rect = canvas.getBoundingClientRect()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(e.clientX - rect.left, e.clientY - rect.top, 24, 0, Math.PI * 2)
    ctx.fill()
    strokes.current++
    if (strokes.current % 6 === 0) playTone(1200 + Math.random() * 400, 0.04, 0, 'sine', 0.03)
    if (strokes.current % 15 === 0) checkCleared()
  }

  const checkCleared = () => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let clear = 0
    let total = 0
    for (let i = 3; i < data.length; i += 4 * 16) {
      total++
      if (data[i] === 0) clear++
    }
    if (clear / total > 0.5) {
      setRevealed(true)
      burstFromElement(wrapRef.current, 150)
      playSuccess()
    }
  }

  const again = () => {
    setRevealed(false)
    setPrizeIndex((p) => (p + 1) % PRIZES.length)
    setRound((r) => r + 1)
  }

  return (
    <SectionShell
      id="scratch"
      index={7}
      eyebrow="Lucky draw"
      tone="ink"
      title="Your golden scratch card"
      description="Every ticket is a winner. Rub away the gold with your finger or mouse."
    >
      <div className="flex flex-col items-center">
        <div
          ref={wrapRef}
          className="relative h-64 w-full max-w-lg overflow-hidden rounded-3xl border-2 border-ink-foreground bg-card text-card-foreground shadow-[8px_8px_0_0_var(--accent)]"
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Sparkles className="size-8 text-primary" aria-hidden="true" />
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{`${name} wins`}</p>
            <p className="text-balance font-display text-3xl font-extrabold leading-tight">{PRIZES[prizeIndex]}</p>
          </div>
          <motion.canvas
            key={round}
            ref={canvasRef}
            aria-label="Scratch card surface. Drag to scratch."
            role="img"
            animate={{ opacity: revealed ? 0 : 1 }}
            transition={{ duration: 0.6 }}
            onPointerDown={(e) => {
              drawing.current = true
              e.currentTarget.setPointerCapture(e.pointerId)
              scratch(e)
            }}
            onPointerMove={scratch}
            onPointerUp={() => {
              drawing.current = false
              checkCleared()
            }}
            className="absolute inset-0 size-full cursor-grab touch-none"
            style={{ pointerEvents: revealed ? 'none' : 'auto' }}
          />
        </div>
        <div className="mt-8 flex gap-4">
          {!revealed ? (
            <FunButton variant="accent" onClick={() => { setRevealed(true); burstFromElement(wrapRef.current); playSuccess() }}>
              Reveal instantly
            </FunButton>
          ) : null}
          <FunButton variant="primary" onClick={again}>
            <RotateCcw className="size-5" aria-hidden="true" />
            New card
          </FunButton>
        </div>
      </div>
    </SectionShell>
  )
}
