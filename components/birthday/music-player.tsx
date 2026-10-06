'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Heart, Music2, Pause, Play } from 'lucide-react'
import { sideCannons } from '@/lib/effects'
import { cn } from '@/lib/utils'
import { useDisplayName } from './birthday-context'

const BAR_COUNT = 5

function Visualizer({ playing }: { playing: boolean }) {
  const [heights, setHeights] = useState([20, 20, 20, 20, 20])

  useEffect(() => {
    if (!playing) {
      setHeights([20, 20, 20, 20, 20])
      return
    }
    const interval = setInterval(() => {
      setHeights(Array.from({ length: BAR_COUNT }, () => Math.max(20, Math.random() * 100)))
    }, 150)
    return () => clearInterval(interval)
  }, [playing])

  return (
    <span aria-hidden="true" className="flex h-5 items-end gap-0.5">
      {heights.map((h, i) => (
        <span
          key={i}
          className="w-1 origin-bottom rounded-full bg-primary transition-all duration-150"
          style={{ height: `${h}%` }}
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
  const [playing, setPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [gateOpen, setGateOpen] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    // This loads your MP3 directly from the public folder on GitHub pages
    audioRef.current = new Audio('/HappyBirthdayMehek/bestsong.mp3')
    audioRef.current.loop = true
    audioRef.current.volume = volume

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const togglePlay = () => {
    if (!audioRef.current) return
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
  }

  const openSurprise = () => {
    if (audioRef.current) {
      audioRef.current.play().then(() => setPlaying(true)).catch(() => {})
    }
    setGateOpen(false)
    sideCannons()
  }

  const handleVolumeChange = (v: number) => {
    setVolume(v)
    if (audioRef.current) {
      audioRef.current.volume = v
    }
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
          <span className="truncate font-display text-sm font-semibold italic">Best Song Ever</span>
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
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="h-1 w-20 cursor-pointer accent-[var(--primary)]"
          />
        </label>
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause music' : 'Play music'}
          className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95"
        >
          {playing ? <Pause className="size-4" aria-hidden="true" /> : <Play className="size-4 translate-x-px" aria-hidden="true" />}
        </button>
      </motion.aside>
    </>
  )
}
