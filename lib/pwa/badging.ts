/**
 * App Badging API Helper
 * Sets or clears the numeric badge on the PWA icon (supported on Chrome Android, Chrome Desktop, Edge, etc.)
 */
export async function updateAppBadge(count: number): Promise<void> {
  if (typeof window === "undefined" || typeof navigator === "undefined") return

  try {
    if ("setAppBadge" in navigator) {
      if (count > 0) {
        await (navigator as any).setAppBadge(count)
      } else {
        await (navigator as any).clearAppBadge()
      }
    }
  } catch (err) {
    // Badging not permitted or unsupported on platform
  }
}

export async function clearAppBadge(): Promise<void> {
  if (typeof window === "undefined" || typeof navigator === "undefined") return

  try {
    if ("clearAppBadge" in navigator) {
      await (navigator as any).clearAppBadge()
    }
  } catch (err) {
    // Ignore
  }
}
