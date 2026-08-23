import { Dashboard } from "@/components/dashboard"
import { TrackerProvider } from "@/components/tracker-provider"

export default function AppPage() {
  return (
    <TrackerProvider>
      <Dashboard />
    </TrackerProvider>
  )
}
