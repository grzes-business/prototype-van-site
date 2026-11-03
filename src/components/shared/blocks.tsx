"use client"

import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { FAQ } from "@/lib/content"
import { sendContactEmail } from "@/lib/web3forms"

/** Questions and answers, set as running text so the answer sits beside the question. */
export function Faq({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      {FAQ.map(([question, answer]) => (
        <p key={question} className="m-0 mb-5 break-inside-avoid text-[18px] leading-relaxed">
          <strong className="font-semibold">{question}</strong> {answer}
        </p>
      ))}
    </div>
  )
}

/** Contact form. Colours come from the --t-* variables of the design it sits in. */
export function ContactForm({ buttonClass = "btn btn-accent" }: { buttonClass?: string }) {
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    setBusy(true)
    try {
      await sendContactEmail(
        { name: String(data.get("name")), email: String(data.get("email")), message: String(data.get("message")) },
        data.has("botcheck")
      )
      setSent(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać wiadomości.")
    } finally {
      setBusy(false)
    }
  }

  if (sent) return <p className="m-0 text-[20px] font-semibold">Dzięki, wiadomość dotarła.</p>

  return (
    <form onSubmit={submit} className="grid gap-3">
      <label className="form-field"><span>Imię</span><input name="name" required autoComplete="name" /></label>
      <label className="form-field"><span>E-mail</span><input name="email" type="email" required autoComplete="email" /></label>
      <label className="form-field"><span>Wiadomość</span><textarea name="message" rows={3} required /></label>
      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />
      <button type="submit" disabled={busy} className={buttonClass}>{busy ? "Wysyłam…" : "Wyślij wiadomość"}</button>
    </form>
  )
}

/** Booking section body: the real calendar, or an honest message when the calendar could not be read. */
export function CalendarNote({ demo }: { demo: boolean }) {
  return demo ? <> [Przykładowe terminy, dopóki nie podłączymy kalendarza.]</> : null
}
