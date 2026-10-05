'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, Music2, Pause, Play } from 'lucide-react'
import { music, pauseMusic, playMusic, setMusicVolume } from '@/lib/music'
import { sideCannons } from '@/lib/effects'
import { cn } from '@/lib/utils'
import { useDisplayName } from './birthday-context'

const BAR_COUNT = 5

function useMusic() {
  return useSyncExternalStore(music.subscribe, music.getState, music.getServerState)
}

function Visualizer({ playing }: { playing: boolean }) {
  const barsRef = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    if (!playing) {
      barsRef.current.forEach((b) => b && (b.style.transform = 'scaleY(0.2)'))
      return
    }
    let raf = 0
    const data = new Uint8Array(32)
    const tick = () => {
      const analyser = music.getAnalyser()
      if (analyser) {
        analyser.getByteFrequencyData(data)
        barsRef.current.forEach((bar, i) => {
          if (!bar) return
          const v = data[2 + i * 3] / 255
          bar.style.transform = `scaleY(${Math.max(0.15, v)})`
        })
      }
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [playing])

  return (
    <span aria-hidden="true" className="flex h-5 items-end gap-0.5">
      {Array.from({ length: BAR_COUNT }).map((_, i) => (
        <span
          key={i}
          ref={(el) => {
            barsRef.current[i] = el
          }}
          className="h-full w-1 origin-bottom rounded-full bg-primary transition-transform duration-100"
          style={{ transform: 'scaleY(0.2)' }}
        />
      ))}
    </span>
  )
}

function WelcomeGate({ onOpen }: { onOpen: () => void }) {
  const name = useDisplayName()
  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gate-title"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-[80] flex flex-col items-center justify-center gap-8 bg-background bg-romance px-6 text-center"
    >
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 12 }}
        className="flex size-28 items-center justify-center rounded-full bg-card shadow-pop-lg"
      >
        <Heart className="size-12 animate-heartbeat fill-primary text-primary" aria-hidden="true" />
      </motion.div>
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-muted-foreground">A little surprise for</p>
        <h2 id="gate-title" className="mt-3 font-display text-6xl font-semibold italic text-primary md:text-8xl">
          {name}
        </h2>
      </div>
      <button
        type="button"
        autoFocus
        onClick={onOpen}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-4 font-display text-lg font-semibold text-primary-foreground shadow-pop-lg transition-transform hover:-translate-y-0.5 active:translate-y-0.5"
      >
        <Music2 className="size-5" aria-hidden="true" />
        Open your surprise
      </button>
      <p className="text-sm text-muted-foreground">Turn your sound on for the full experience</p>
    </motion.div>
  )
}

export function MusicPlayer() {
  const { playing, volume } = useMusic()
  const [gateOpen, setGateOpen] = useState(true)

  useEffect(() => {
    let cancelled = false
    playMusic().then((ok) => {
      if (ok && !cancelled) setGateOpen(false)
    })
    return () => {
      cancelled = true
    }
  }, [])

  const openSurprise = () => {
    void playMusic()
    setGateOpen(false)
    sideCannons()
  }

  return (
    <>
      <AnimatePresence>{gateOpen ? <WelcomeGate key="gate" onOpen={openSurprise} /> : null}</AnimatePresence>

      <motion.aside
        aria-label="Background music"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring', stiffness: 160, damping: 18 }}
        className="fixed left-1/2 top-[7px] z-[55] flex -translate-x-1/2 items-center gap-2 rounded-full border border-border bg-card/90 py-1 pl-1 pr-1 shadow-pop backdrop-blur-md sm:gap-3 sm:pr-1.5"
      >
        <span
          aria-hidden="true"
          className={cn(
            'relative flex size-8 items-center justify-center rounded-full bg-[conic-gradient(var(--primary),var(--secondary),var(--accent),var(--primary))] animate-spin-slow',
            !playing && '[animation-play-state:paused]',
          )}
        >
          <span className="size-2.5 rounded-full bg-card" />
        </span>
        <span className="hidden min-w-0 flex-col leading-tight md:flex">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {playing ? 'Now playing' : 'Paused'}
          </span>
          <span className="truncate font-display text-sm font-semibold italic">Happy Birthday, music box</span>
        </span>
        <Visualizer playing={playing} />
        <label className="hidden items-center sm:flex">
          <span className="sr-only">Music volume</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(e) => setMusicVolume(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-[var(--primary)]"
          />
        </label>
        <button
          type="button"
          onClick={() => (playing ? pauseMusic() : void playMusic())}
          aria-label={playing ? 'Pause music' : 'Play music'}
          className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px" aria-hidden="true" />}
        </button>
      </motion.aside>
    </>
  )
}
