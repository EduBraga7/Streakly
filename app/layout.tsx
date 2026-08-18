import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })

export const metadata: Metadata = {
  title: 'Streakly — Foco Diário',
  description:
    'Contador de dias limpos discreto e minimalista para rastrear sua sequência, superar crises e recomeçar sem culpa.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/streakly-assets/favicon-16.png',
        sizes: '16x16',
        type: 'image/png',
      },
      {
        url: '/streakly-assets/favicon-32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/streakly-assets/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        url: '/streakly-assets/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        url: '/streakly-assets/favicon.ico',
      },
    ],
    apple: '/streakly-assets/favicon-180.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f3f4f6' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0b0f' },
  ],
  maximumScale: 1,
}

import { Toaster } from '@/components/ui/sonner'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`dark ${geistSans.variable}`} suppressHydrationWarning>
      <body className="bg-background font-sans antialiased">
        {children}
        <Toaster position="bottom-center" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
