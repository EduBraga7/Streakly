import { defaultCache } from "@serwist/next/worker"
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist"
import { Serwist } from "serwist"
import { initializeApp } from "firebase/app"
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw"

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()

try {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  }

  // Only initialize if we have the config
  if (firebaseConfig.apiKey) {
    const app = initializeApp(firebaseConfig)
    const messaging = getMessaging(app)

    onBackgroundMessage(messaging, (payload) => {
      console.log('[sw] Recebeu mensagem em background: ', payload)
      const notificationTitle = payload.notification?.title || 'Streakly'
      const notificationOptions = {
        body: payload.notification?.body,
        icon: '/streakly-assets/favicon-192.png'
      }

      self.registration.showNotification(notificationTitle, notificationOptions)
    })
  }
} catch (e) {
  console.warn('Falha ao inicializar o Firebase Messaging no SW:', e)
}
