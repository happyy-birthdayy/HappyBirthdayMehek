import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Nunito } from 'next/font/google'
import { BIRTHDAY_NAME } from '@/lib/birthday-config'
import './globals.css'

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display-face',
  weight: ['500', '600', '700', '800'],
  style: ['normal', 'italic'],
})

const body = Nunito({
  subsets: ['latin'],
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: `Happy Birthday, ${BIRTHDAY_NAME}!`,
  description:
    'A little world made just for you — blow out candles, pop balloons, unwrap gifts, play mini games and read a special letter.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#fdf2f6',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} bg-background`}>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
