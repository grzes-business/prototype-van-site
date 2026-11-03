import "server-only"

import ical, { type VEvent } from "node-ical"

import { BOOKING_RULES, lastBookableDay, today } from "@/lib/booking-rules"
import {
  addDays,
  isoDateFromLocal,
  isoDateInZone,
  localDateFromIso,
  mergeRanges,
  type DayRange,
} from "@/lib/dates"

export type Availability = {
  /** "demo" when GOOGLE_CALENDAR_ICS_URL isn't set. */
  source: "google" | "demo"
  /** Days the van is taken, merged and sorted. */
  booked: DayRange[]
}

/** How long the page may reuse a fetched calendar before re-reading it. */
const REVALIDATE_SECONDS = 300

/**
 * Reads the owner's Google Calendar through its iCal address.
 * `fresh` skips the cache; used when accepting a request.
 */
export async function getAvailability({ fresh = false } = {}): Promise<Availability> {
  const url = process.env.GOOGLE_CALENDAR_ICS_URL
  const ics = url ? await fetchIcs(url, fresh) : demoIcs()
  return { source: url ? "google" : "demo", booked: parseBookedRanges(ics) }
}

async function fetchIcs(url: string, fresh: boolean): Promise<string> {
  const response = await fetch(
    url,
    fresh ? { cache: "no-store" } : { next: { revalidate: REVALIDATE_SECONDS } }
  )
  if (!response.ok) {
    throw new Error(`Calendar feed responded with ${response.status}`)
  }
  const body = await response.text()
  // Google answers share/embed links with an HTML page; only the iCal address works.
  if (!body.trimStart().startsWith("BEGIN:VCALENDAR")) {
    throw new Error(
      "GOOGLE_CALENDAR_ICS_URL isn't an iCal feed — use the \"Secret address in iCal format\""
    )
  }
  // The public address of a non-public calendar is a valid but empty feed.
  if (url.includes("/public/basic.ics") && !body.includes("BEGIN:VEVENT")) {
    throw new Error(
      "GOOGLE_CALENDAR_ICS_URL is the public iCal address of a private calendar — use the \"Secret address in iCal format\""
    )
  }
  return body
}

function parseBookedRanges(ics: string): DayRange[] {
  const from = localDateFromIso(addDays(today(), -1))
  const to = localDateFromIso(addDays(lastBookableDay(), 1))

  const ranges: DayRange[] = []
  for (const component of Object.values(ical.sync.parseICS(ics))) {
    if (component?.type !== "VEVENT" || !blocksVan(component)) continue

    const instances = ical.expandRecurringEvent(component, { from, to, expandOngoing: true })
    for (const { start, end, isFullDay } of instances) {
      ranges.push(
        isFullDay
          ? // All-day events end on the following midnight (exclusive).
            { start: isoDateFromLocal(start), end: addDays(isoDateFromLocal(end), -1) }
          : // Timed events occupy every day they touch.
            {
              start: isoDateInZone(start, BOOKING_RULES.timeZone),
              end: isoDateInZone(new Date(end.getTime() - 1), BOOKING_RULES.timeZone),
            }
      )
    }
  }
  return mergeRanges(ranges.filter((range) => range.end >= range.start))
}

/**
 * Every event on the van calendar is a booking, except cancelled ones. Free/Busy
 * is ignored: Google marks all-day events as "Free" by default.
 */
function blocksVan(event: VEvent): boolean {
  return event.status !== "CANCELLED"
}

/** A few sample bookings relative to today, so the flow works before the real feed is set. */
function demoIcs(): string {
  const day = (offset: number) => addDays(today(), offset).replaceAll("-", "")
  const event = (uid: string, start: number, endExclusive: number) =>
    [
      "BEGIN:VEVENT",
      `UID:${uid}@demo`,
      `DTSTART;VALUE=DATE:${day(start)}`,
      `DTEND;VALUE=DATE:${day(endExclusive)}`,
      "SUMMARY:Booked",
      "END:VEVENT",
    ].join("\r\n")

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    event("a", 3, 7),
    event("b", 12, 20),
    event("c", 27, 30),
    event("d", 45, 52),
    "END:VCALENDAR",
  ].join("\r\n")
}
