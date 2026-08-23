/**
 * Local Notification Helpers
 * Allows scheduling and displaying notification reminders locally without requiring a remote server
 */

const REMINDER_TIME_KEY = "streakly.reminder_time"
const REMINDER_ENABLED_KEY = "streakly.reminder_enabled"

export async function requestLocalNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "denied"
  }

  try {
    const permission = await Notification.requestPermission()
    return permission
  } catch {
    return "denied"
  }
}

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied"
  return Notification.permission
}

export function getStoredReminderSettings(): { enabled: boolean; time: string } {
  if (typeof window === "undefined") {
    return { enabled: false, time: "21:00" }
  }

  const enabled = window.localStorage.getItem(REMINDER_ENABLED_KEY) === "true"
  const time = window.localStorage.getItem(REMINDER_TIME_KEY) || "21:00"

  return { enabled, time }
}

export function saveReminderSettings(enabled: boolean, time: string): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(REMINDER_ENABLED_KEY, String(enabled))
  window.localStorage.setItem(REMINDER_TIME_KEY, time)
}

export function sendLocalNotification(title: string, body: string): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return

  try {
    if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, {
          body,
          icon: "/streakly-assets/favicon-192.png",
          badge: "/streakly-assets/favicon-192.png",
          tag: "streakly-checkin-reminder",
        })
      })
    } else {
      new Notification(title, {
        body,
        icon: "/streakly-assets/favicon-192.png",
      })
    }
  } catch (err) {
    console.warn("Falha ao disparar notificação:", err)
  }
}
