import { InquiryForm } from "@/components/google-calendar/inquiry-form"
import { getAvailability, type Availability } from "@/lib/availability"

export async function GoogleCalendarFlow() {
  let availability: Availability | null = null
  try {
    availability = await getAvailability()
  } catch (error) {
    console.error("Could not read the availability calendar", error)
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <h2 className="text-2xl font-semibold tracking-tight">Check dates &amp; send a request</h2>
        <p className="max-w-2xl text-muted-foreground">
          Pick your pickup and return days in the calendar, leave your contact details, and
          we&apos;ll confirm the booking personally.
        </p>
        {availability?.source === "demo" && (
          <p className="text-xs text-amber-700">
            Showing sample bookings — set GOOGLE_CALENDAR_ICS_URL to use the real calendar.
          </p>
        )}
      </header>

      {availability ? (
        <InquiryForm booked={availability.booked} />
      ) : (
        <p className="rounded-xl border p-6 text-muted-foreground">
          We couldn&apos;t load the availability calendar right now. Please refresh the page in a
          moment.
        </p>
      )}
    </div>
  )
}
