import { z } from "zod"

import { BOOKING_RULES, checkDateRange } from "@/lib/booking-rules"
import { isIsoDate, type DayRange, type IsoDate } from "@/lib/dates"

const isoDate = z
  .string({ error: "Wybierz datę w kalendarzu." })
  .refine(isIsoDate, "Wybierz datę w kalendarzu.")

const baseSchema = z.object({
  start: isoDate,
  end: isoDate,
  name: z.string().trim().min(2, "Wpisz imię i nazwisko.").max(100),
  email: z.email("Wpisz poprawny adres e-mail."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{7,20}$/, "Wpisz poprawny numer telefonu."),
  people: z.coerce
    .number<string | number>()
    .int()
    .min(1, "Co najmniej 1 osoba.")
    .max(BOOKING_RULES.maxPeople, `Van ma ${BOOKING_RULES.maxPeople} miejsca do spania.`),
  pets: z.boolean(),
  message: z.string().trim().max(2000, "Maksymalnie 2000 znaków."),
  destination: z.string().trim().max(40).optional(),
})

/**
 * Same rules in the browser and on the server; only the booked ranges differ
 * (the server re-reads the calendar right before accepting a request).
 */
export function inquirySchema(booked: DayRange[], now?: IsoDate) {
  return baseSchema.superRefine((values, ctx) => {
    if (!isIsoDate(values.start) || !isIsoDate(values.end)) return
    const issue = checkDateRange({ start: values.start, end: values.end }, booked, now)
    if (issue) ctx.addIssue({ code: "custom", path: [issue.field], message: issue.message })
  })
}

export type InquiryInput = z.input<typeof baseSchema>
export type Inquiry = z.output<typeof baseSchema>
