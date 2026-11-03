"use server"

import { getAvailability } from "@/lib/availability"
import { inquirySchema } from "@/lib/inquiry-schema"

export type VerifyInquiryResult =
  | { ok: true }
  | { ok: false; message: string; fieldErrors?: Record<string, string> }

/**
 * Re-validates a request against a fresh read of the calendar, so dates booked
 * since the page loaded are rejected. The browser only sends the email after this.
 */
export async function verifyInquiry(values: unknown): Promise<VerifyInquiryResult> {
  let booked
  try {
    booked = (await getAvailability({ fresh: true })).booked
  } catch (error) {
    console.error("Could not read the availability calendar", error)
    return {
      ok: false,
      message: "Nie udało się sprawdzić kalendarza. Spróbuj ponownie za chwilę.",
    }
  }

  const result = inquirySchema(booked).safeParse(values)
  if (result.success) return { ok: true }

  const fieldErrors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] ?? "form")
    fieldErrors[field] ??= issue.message
  }
  return { ok: false, message: "Sprawdź zaznaczone pola.", fieldErrors }
}
