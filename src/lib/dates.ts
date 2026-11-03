// Calendar days are passed around as ISO date strings ("2026-10-14") so the
// browser, the server and the iCal feed agree on days regardless of time zone.

export type IsoDate = string

/** Inclusive range of calendar days. */
export type DayRange = { start: IsoDate; end: IsoDate }

const DAY_MS = 24 * 60 * 60 * 1000

function toUtc(iso: IsoDate): number {
  const [y, m, d] = iso.split("-").map(Number)
  return Date.UTC(y, m - 1, d)
}

function fromUtc(ms: number): IsoDate {
  return new Date(ms).toISOString().slice(0, 10)
}

export function isIsoDate(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && fromUtc(toUtc(value)) === value
}

export function addDays(iso: IsoDate, days: number): IsoDate {
  return fromUtc(toUtc(iso) + days * DAY_MS)
}

export function addMonths(iso: IsoDate, months: number): IsoDate {
  const [y, m, d] = iso.split("-").map(Number)
  return fromUtc(Date.UTC(y, m - 1 + months, d))
}

export function daysBetween(from: IsoDate, to: IsoDate): number {
  return Math.round((toUtc(to) - toUtc(from)) / DAY_MS)
}

/** Calendar day of an instant in the given IANA time zone. */
export function isoDateInZone(instant: Date, timeZone: string): IsoDate {
  // en-CA formats as YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant)
}

/** Calendar day of a Date using its local fields (for date pickers and all-day events). */
export function isoDateFromLocal(date: Date): IsoDate {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** Local-midnight Date for an ISO day (for date pickers). */
export function localDateFromIso(iso: IsoDate): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function rangesOverlap(a: DayRange, b: DayRange): boolean {
  return a.start <= b.end && b.start <= a.end
}

/** Sorts and merges overlapping or touching ranges. */
export function mergeRanges(ranges: DayRange[]): DayRange[] {
  const sorted = [...ranges].sort((a, b) => a.start.localeCompare(b.start))
  const merged: DayRange[] = []
  for (const range of sorted) {
    const last = merged.at(-1)
    if (last && range.start <= addDays(last.end, 1)) {
      if (range.end > last.end) last.end = range.end
    } else {
      merged.push({ ...range })
    }
  }
  return merged
}

export function formatDay(iso: IsoDate): string {
  return localDateFromIso(iso).toLocaleDateString("pl-PL", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}
