"use client"

import Image from "next/image"
import { useState, type FormEvent } from "react"
import { toast } from "sonner"

import { FAQ } from "@/lib/content"
import { sendContactEmail } from "@/lib/web3forms"

export function Questions() {
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

  return (
    <>
      <section id="pytania" className="section grid grid-cols-[minmax(0,3fr)_minmax(0,9fr)] gap-8 px-(--gutter) text-paper max-lg:grid-cols-1">
        <h2 className="display section-title rise">Pytania</h2>
        <div className="rise columns-2 gap-14 max-md:columns-1">
          {FAQ.map(([question, answer]) => (
            <p key={question} className="m-0 mb-5 break-inside-avoid text-[18px] leading-relaxed">
              <strong className="font-semibold">{question}</strong> {answer}
            </p>
          ))}
        </div>
      </section>

      <section aria-labelledby="kontakt" className="relative mt-[120px] min-h-[760px] max-md:mt-20 max-md:min-h-0">
        <Image src="/photos/green-forest-road.jpg" alt="Polna droga przez zielony las we mgle" fill sizes="100vw" className="object-cover max-md:hidden" />
        <div className="relative hidden aspect-[4/3] md:hidden max-md:block">
          <Image src="/photos/green-forest-road.jpg" alt="" fill sizes="100vw" className="object-cover" />
        </div>
        <div className="absolute right-[var(--gutter)] top-14 w-[420px] bg-paper p-8 text-ink max-md:relative max-md:right-auto max-md:top-auto max-md:mx-(--gutter) max-md:-mt-16 max-md:w-auto max-md:p-5">
          <h2 id="kontakt" className="display m-0 text-[44px] leading-none">Napisz lub zadzwoń</h2>
          <p className="mb-4 mt-3 text-[18px]">Telefon: [numer]<br />E-mail: [adres e-mail]</p>
          {sent ? (
            <p className="m-0 text-[18px] font-semibold">Dzięki, wiadomość dotarła.</p>
          ) : (
            <form onSubmit={submit} className="grid gap-3">
              <label className="form-field on-paper"><span>Imię</span><input name="name" required autoComplete="name" /></label>
              <label className="form-field on-paper"><span>E-mail</span><input name="email" type="email" required autoComplete="email" /></label>
              <label className="form-field on-paper"><span>Wiadomość</span><textarea name="message" rows={3} required /></label>
              <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />
              <button type="submit" disabled={busy} className="btn btn-ink">{busy ? "Wysyłam…" : "Wyślij wiadomość"}</button>
            </form>
          )}
        </div>
      </section>
    </>
  )
}
