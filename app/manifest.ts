import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Streakly',
    short_name: 'Streakly',
    description: 'Foco diário. Um dia de cada vez.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b0f',
    theme_color: '#0a0b0f',
    orientation: 'portrait',
    icons: [
      {
        src: '/streakly-assets/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/streakly-assets/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'SOS · Momento de Crise',
        short_name: 'SOS',
        description: 'Abra imediatamente o modo de alívio e respiração de emergência',
        url: '/app?action=sos',
        icons: [{ src: '/streakly-assets/favicon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Check-in Diário',
        short_name: 'Check-in',
        description: 'Confirme seu foco diário e mantenha sua sequência',
        url: '/app?action=checkin',
        icons: [{ src: '/streakly-assets/favicon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
