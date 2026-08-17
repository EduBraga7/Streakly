import { Dashboard } from "@/components/dashboard"
import { TrackerProvider } from "@/components/tracker-provider"

export default function Page() {
  return (
    <TrackerProvider>
      <Dashboard />
    </TrackerProvider>
  )
}
