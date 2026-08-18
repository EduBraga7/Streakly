import { app } from "../firebase"
import { getMessaging, getToken, isSupported } from "firebase/messaging"

export async function requestNotificationPermission() {
  if (typeof window === "undefined") return null

  const supported = await isSupported()
  if (!supported) {
    console.warn("Este navegador não suporta notificações Push via Firebase.")
    return null
  }

  const permission = await Notification.requestPermission()
  if (permission !== "granted") {
    console.warn("Permissão de notificação negada.")
    return null
  }

  const messaging = getMessaging(app)
  
  try {
    // VAPID KEY: Required for web push.
    // Replace with process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY in real usage.
    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      console.warn("Aviso: NEXT_PUBLIC_FIREBASE_VAPID_KEY não está definido.")
      return null
    }
    
    const currentToken = await getToken(messaging, { vapidKey })
    
    if (currentToken) {
      console.log("FCM Token:", currentToken)
      // Here you would usually send this token to your database to send push notifications later.
      return currentToken
    } else {
      console.log("Nenhum token de registro disponível. Peça permissão para gerar um.")
      return null
    }
  } catch (err) {
    console.error("Um erro ocorreu ao obter o token.", err)
    return null
  }
}
