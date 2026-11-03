import {
  addDays,
  addMonths,
  daysBetween,
  isoDateInZone,
  mergeRanges,
  rangesOverlap,
  type DayRange,
  type IsoDate,
} from "@/lib/dates"

export const BOOKING_RULES = {
  /** Minimum number of nights between pickup and return. */
  minNights: 2,
  /** Free days required between two rentals (cleaning / turnover). */
  gapDays: 1,
  /** How far ahead a request may end. */
  horizonMonths: 12,
  maxPeople: 4,
  /** Time zone the owner's calendar and "today" are interpreted in. */
  timeZone: "Europe/Warsaw",
} as const

export function today(): IsoDate {
  return isoDateInZone(new Date(), BOOKING_RULES.timeZone)
}

export function lastBookableDay(from: IsoDate = today()): IsoDate {
  return addMonths(from, BOOKING_RULES.horizonMonths)
}

/** Booked ranges widened by the turnover gap: no rental may touch these days. */
export function blockedRanges(booked: DayRange[]): DayRange[] {
  return mergeRanges(
    booked.map((range) => ({
      start: addDays(range.start, -BOOKING_RULES.gapDays),
      end: addDays(range.end, BOOKING_RULES.gapDays),
    }))
  )
}

export type DateRangeIssue = { field: "start" | "end"; message: string }

/**
 * Checks a requested rental (pickup day to return day, both inclusive)
 * against the booking rules and the owner's booked ranges.
 */
export function checkDateRange(
  requested: DayRange,
  booked: DayRange[],
  now: IsoDate = today()
): DateRangeIssue | null {
  if (requested.start < now) {
    return { field: "start", message: "Data odbioru nie może być w przeszłości." }
  }
  if (daysBetween(requested.start, requested.end) < BOOKING_RULES.minNights) {
    return {
      field: "end",
      message: `Minimalny wynajem to ${BOOKING_RULES.minNights} doby.`,
    }
  }
  if (requested.end > lastBookableDay(now)) {
    return {
      field: "end",
      message: `Przyjmujemy zapytania do ${BOOKING_RULES.horizonMonths} miesięcy naprzód.`,
    }
  }
  if (blockedRanges(booked).some((blocked) => rangesOverlap(requested, blocked))) {
    return {
      field: "start",
      message:
        "Van jest wtedy zajęty. Wybierz wolne dni, z jednym wolnym dniem między wynajmami.",
    }
  }
  return null
}
