import { BirthdayProvider } from '@/components/birthday/birthday-context'
import { SiteNav } from '@/components/birthday/site-nav'
import { MusicPlayer } from '@/components/birthday/music-player'
import { HeroSection } from '@/components/birthday/hero-section'
import { AgeCounterSection } from '@/components/birthday/age-counter-section'
import { CakeSection } from '@/components/birthday/cake-section'
import { BalloonPopSection } from '@/components/birthday/balloon-pop-section'
import { MemoryMatchSection } from '@/components/birthday/memory-match-section'
import { GiftSection } from '@/components/birthday/gift-section'
import { ScratchCardSection } from '@/components/birthday/scratch-card-section'
import { GallerySection } from '@/components/birthday/gallery-section'
import { QuizSection } from '@/components/birthday/quiz-section'
import { SpinWheelSection } from '@/components/birthday/spin-wheel-section'
import { MusicBoxSection } from '@/components/birthday/music-box-section'
import { WishesSection } from '@/components/birthday/wishes-section'
import { LetterSection } from '@/components/birthday/letter-section'
import { SiteFooter } from '@/components/birthday/site-footer'

export default function Page() {
  return (
    <BirthdayProvider>
      <SiteNav />
      <MusicPlayer />
      <main>
        <HeroSection />
        <AgeCounterSection />
        <CakeSection />
        <BalloonPopSection />
        <MemoryMatchSection />
        <GiftSection />
        <ScratchCardSection />
        <GallerySection />
        <QuizSection />
        <SpinWheelSection />
        <MusicBoxSection />
        <WishesSection />
        <LetterSection />
      </main>
      <SiteFooter />
    </BirthdayProvider>
  )
}
