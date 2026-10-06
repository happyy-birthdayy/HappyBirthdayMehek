'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { Hand, Shuffle } from 'lucide-react'
import { FunButton, SectionShell } from './section-shell'
import { playClick } from '@/lib/effects'

const PHOTOS = [
  { src: '/HappyBirthdayMehek/images/memory-1.png', caption: 'You have beautiful eyes', rotate: -7},
  { src: '/HappyBirthdayMehek/images/memory-2.png', caption: 'You are pretty', rotate: 5},
  { src: '/HappyBirthdayMehek/images/memory-3.png', caption: 'You are sweet', rotate: -3},
  { src: '/HappyBirthdayMehek/images/memory-4.png', caption: 'You are the best', rotate: 8}
]

export function GallerySection() {
  const constraintsRef = useRef<HTMLDivElement>(null)
  const [round, setRound] = useState(0)
  const [top, setTop] = useState<number | null>(null)

  return (
    <SectionShell
      id="gallery"
      index={8}
      eyebrow="Throwbacks"
      tone="yellow"
      title="A pile of favorite memories"
      description="Drag the polaroids around the table. Toss them, stack them, make a mess — it's your party."
    >
      <div
        ref={constraintsRef}
        className="relative mx-auto flex min-h-[560px] max-w-5xl flex-wrap items-center justify-center gap-6 rounded-3xl border-2 border-dashed border-border/40 p-6 md:gap-0"
      >
        {PHOTOS.map((p, i) => (
          <motion.figure
            key={`${round}-${p.src}`}
            drag
            dragConstraints={constraintsRef}
            dragElastic={0.2}
            onDragStart={() => {
              setTop(i)
              playClick()
            }}
            initial={{ opacity: 0, y: 80, rotate: 0, scale: 0.6 }}
            whileInView={{ opacity: 1, y: 0, rotate: p.rotate, scale: 1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.05, rotate: 0 }}
            whileDrag={{ scale: 1.12, rotate: 0, cursor: 'grabbing' }}
            transition={{ type: 'spring', stiffness: 140, damping: 14, delay: i * 0.1 }}
            style={{ zIndex: top === i ? 20 : 10 - i }}
            className="relative w-56 cursor-grab touch-none rounded-sm border border-border bg-card p-3 pb-4 shadow-pop-lg md:-mx-4 md:w-64"
          >
            <span
              aria-hidden="true"
              className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2 rotate-2 bg-secondary/70"
            />
            <div className="relative aspect-square overflow-hidden border border-border">
              <Image src={p.src} alt={p.alt} fill sizes="256px" className="pointer-events-none object-cover" draggable={false} />
            </div>
            <figcaption className="mt-3 text-center font-display text-lg font-bold">{p.caption}</figcaption>
          </motion.figure>
        ))}
      </div>
      <div className="mt-8 flex flex-col items-center gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-muted-foreground">
          <Hand className="size-4" aria-hidden="true" />
          Drag to move
        </p>
        <FunButton variant="plain" onClick={() => setRound((r) => r + 1)}>
          <Shuffle className="size-5" aria-hidden="true" />
          Tidy up the table
        </FunButton>
      </div>
    </SectionShell>
  )
}
