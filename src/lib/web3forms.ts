import type { Inquiry } from "@/lib/inquiry-schema"
import { formatDay } from "@/lib/dates"

// Web3Forms' free plan only accepts submissions from the browser; server-side
// calls need a paid plan. The access key is designed to be public.
const ENDPOINT = "https://api.web3forms.com/submit"

export const web3formsAccessKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY

async function submit(payload: Record<string, unknown>) {
  if (!web3formsAccessKey) {
    throw new Error("Wysyłka nie jest jeszcze skonfigurowana (brak NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY).")
  }
  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ access_key: web3formsAccessKey, from_name: "Wendrowan", ...payload }),
  })
  const result = (await response.json().catch(() => null)) as
    | { success?: boolean; message?: string }
    | null
  if (!response.ok || !result?.success) {
    throw new Error(result?.message ?? "Nie udało się wysłać wiadomości.")
  }
}

export function sendInquiryEmail(
  inquiry: Inquiry,
  botcheck: boolean,
  ticket?: { extras?: string; estimate?: string }
) {
  return submit({
    subject: `Zapytanie o vana: ${inquiry.start} → ${inquiry.end} (${inquiry.name})`,
    replyto: inquiry.email,
    botcheck,
    Odbior: formatDay(inquiry.start),
    Zwrot: formatDay(inquiry.end),
    Cel: inquiry.destination || "—",
    Dodatki: ticket?.extras || "—",
    Szacunek: ticket?.estimate || "—",
    Imie: inquiry.name,
    Email: inquiry.email,
    Telefon: inquiry.phone,
    Osoby: inquiry.people,
    Zwierzeta: inquiry.pets ? "Tak" : "Nie",
    Wiadomosc: inquiry.message || "—",
  })
}

export function sendContactEmail(
  contact: { name: string; email: string; message: string },
  botcheck: boolean
) {
  return submit({
    subject: `Wiadomość ze strony od ${contact.name}`,
    replyto: contact.email,
    botcheck,
    Imie: contact.name,
    Email: contact.email,
    Wiadomosc: contact.message,
  })
}
