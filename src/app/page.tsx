import { DesignRoot } from "@/designs/design-root"
import { getAvailability } from "@/lib/availability"

// The calendar is re-read every five minutes; verifyInquiry re-checks it on send.
export const revalidate = 300

export default async function Home() {
  let availability: Awaited<ReturnType<typeof getAvailability>> | null = null
  try {
    availability = await getAvailability()
  } catch (error) {
    console.error("Could not read the availability calendar", error)
  }

  return <DesignRoot booked={availability?.booked ?? null} demo={availability?.source === "demo"} />
}
