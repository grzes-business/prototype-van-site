"use client"

import { useEffect, useMemo, useState, type BaseSyntheticEvent } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { pl } from "date-fns/locale"
import { AnimatePresence, motion } from "motion/react"
import type { DateRange as PickerRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { verifyInquiry } from "@/app/actions"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { useTicket } from "@/components/ticket/ticket-context"
import { Calendar } from "@/components/ui/calendar"
import { BOOKING_RULES, blockedRanges, lastBookableDay, today } from "@/lib/booking-rules"
import { formatDay, isoDateFromLocal, localDateFromIso, type DayRange } from "@/lib/dates"
import { inquirySchema, type Inquiry, type InquiryInput } from "@/lib/inquiry-schema"
import { PRICES, zl } from "@/lib/pricing"
import { sendInquiryEmail } from "@/lib/web3forms"

const EMPTY: InquiryInput = { start: "", end: "", name: "", email: "", phone: "", people: "2", pets: false, message: "" }

export function Booking({ booked, demo }: { booked: DayRange[] | null; demo: boolean }) {
  return (
    <section id="terminy" className="section px-(--gutter)">
      <h2 className="display section-title rise text-paper">Wydrukuj swój bilet</h2>
      <p className="rise mb-7 mt-2 max-w-[40em] text-[18px] text-paper">
        Wybierz dni odbioru i zwrotu. Zajęte dni pochodzą z kalendarza vana.
        {demo ? " [Przykładowe terminy, dopóki nie podłączymy kalendarza.]" : ""}
      </p>
      {booked ? (
        <BookingTool booked={booked} />
      ) : (
        <p className="bg-moss p-6 text-paper">Nie udało się wczytać kalendarza. Odśwież stronę za chwilę.</p>
      )}
    </section>
  )
}

export function BookingTool({ booked, summary = "ticket" }: { booked: DayRange[]; summary?: "ticket" | "panel" }) {
  const router = useRouter()
  const { destination, setDestination, extras, toggleExtra, start, end, setDates, estimate } = useTicket()
  const [sent, setSent] = useState(false)
  const [months, setMonths] = useState(1)
  const now = today()

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1180px)")
    const update = () => setMonths(wide.matches ? 2 : 1)
    update()
    wide.addEventListener("change", update)
    return () => wide.removeEventListener("change", update)
  }, [])

  const schema = useMemo(() => inquirySchema(booked, now), [booked, now])
  const form = useForm<InquiryInput, unknown, Inquiry>({ resolver: zodResolver(schema), defaultValues: EMPTY, mode: "onTouched" })
  const { errors, isSubmitting } = form.formState

  const toMatcher = (range: DayRange) => ({ from: localDateFromIso(range.start), to: localDateFromIso(range.end) })
  const disabled = [
    { before: localDateFromIso(now) },
    { after: localDateFromIso(lastBookableDay(now)) },
    ...blockedRanges(booked).map(toMatcher),
  ]

  function pick(range: PickerRange | undefined) {
    const from = range?.from ? isoDateFromLocal(range.from) : ""
    const toRaw = range?.to ? isoDateFromLocal(range.to) : ""
    const to = toRaw === from ? "" : toRaw
    setDates(from, to)
    form.setValue("start", from, { shouldValidate: Boolean(from && to) })
    form.setValue("end", to, { shouldValidate: Boolean(from && to) })
  }

  async function onSubmit(values: Inquiry, event?: BaseSyntheticEvent) {
    const payload = { ...values, destination }
    const check = await verifyInquiry(payload)
    if (!check.ok) {
      for (const [field, message] of Object.entries(check.fieldErrors ?? {})) {
        form.setError(field as keyof InquiryInput, { message })
      }
      toast.error(check.message)
      router.refresh()
      return
    }
    try {
      const botcheck = new FormData(event?.target as HTMLFormElement).has("botcheck")
      const picked = [extras.tent && "przedsionek", extras.racks && "bagażniki"].filter(Boolean).join(", ")
      await sendInquiryEmail(payload, botcheck, { extras: picked, estimate: estimate ? zl(estimate.total) : "" })
      setSent(true)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać wiadomości.")
    }
  }

  const dateError = errors.start?.message ?? errors.end?.message
  const when = start ? `${formatDay(start)} → ${end ? formatDay(end) : "wybierz zwrot"}` : "wybierz w kalendarzu"

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} noValidate className="grid grid-cols-[minmax(0,7fr)_minmax(0,5fr)] items-start gap-3 max-lg:grid-cols-1">
      <div className="min-w-0 tool-surface p-6 max-md:p-3">
        <Calendar
          mode="range"
          locale={pl}
          numberOfMonths={months}
          weekStartsOn={1}
          showOutsideDays={false}
          startMonth={localDateFromIso(now)}
          endMonth={localDateFromIso(lastBookableDay(now))}
          selected={start ? { from: localDateFromIso(start), to: end ? localDateFromIso(end) : undefined } : undefined}
          onSelect={pick}
          disabled={disabled}
          excludeDisabled
          modifiers={{ booked: booked.map(toMatcher) }}
          modifiersClassNames={{ booked: "cal-booked" }}
          classNames={{ caption_label: "cal-caption" }}
          className="ticket-cal w-full bg-transparent p-0"
        />
        <p aria-live="polite" className="mb-0 mt-3 min-h-6 text-[16px] tool-accent-text">
          {dateError ?? `Minimum ${BOOKING_RULES.minNights} doby, jeden wolny dzień między wynajmami.`}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <Text label="Imię i nazwisko" error={errors.name?.message} {...form.register("name")} autoComplete="name" />
          <Text label="E-mail" type="email" error={errors.email?.message} {...form.register("email")} autoComplete="email" />
          <Text label="Telefon" type="tel" error={errors.phone?.message} {...form.register("phone")} autoComplete="tel" />
          <label className="form-field">
            <span>Liczba osób</span>
            <select {...form.register("people")}>
              {Array.from({ length: BOOKING_RULES.maxPeople }, (_, i) => String(i + 1)).map((value) => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </label>
          <label className="addon col-span-full">
            <input type="checkbox" {...form.register("pets")} />
            <span>Jadę ze zwierzęciem</span>
          </label>
          <label className="form-field col-span-full">
            <span>Wiadomość</span>
            <textarea rows={3} {...form.register("message")} />
          </label>
        </div>
        <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />
      </div>

      {summary === "panel" ? (
        <aside aria-label="Twój bilet" className="panel relative lg:sticky lg:top-4">
          <div className="p-6">
            <h3 className="m-0 text-[28px] leading-none [font-family:var(--font-display)]">Twój wyjazd</h3>
            <dl className="mb-0 mt-4 grid gap-1 text-[18px]">
              <Row name="Termin" value={when} />
              <Row name={estimate ? `Doby: ${estimate.days}` : "Doby"} value={estimate ? zl(estimate.rent) : "–"} />
              <Row name="Opłata serwisowa" value={zl(PRICES.serviceFee)} />
              {estimate && estimate.extras > 0 ? <Row name="Dodatki" value={zl(estimate.extras)} /> : null}
            </dl>
            <label className="addon mt-2">
              <input type="checkbox" checked={extras.tent} onChange={() => toggleExtra("tent")} />
              <span>Przedsionek, {PRICES.tentPerDay} zł za dobę</span>
            </label>
            <label className="addon">
              <input type="checkbox" checked={extras.racks} onChange={() => toggleExtra("racks")} />
              <span>Bagażniki na rowery, {PRICES.racksPerDay} zł za dobę</span>
            </label>
          </div>
          {sent ? (
            <div className="bg-ink p-6 text-paper">
              <p className="m-0 text-[28px] leading-none [font-family:var(--font-display)]">Zapytanie wysłane</p>
              <p className="mb-0 mt-2 text-[18px]">Odpiszemy mailem lub zadzwonimy, żeby potwierdzić termin.</p>
            </div>
          ) : (
            <div className="btn-accent-zone p-6">
              {estimate ? (
                <p aria-live="polite" className="m-0 text-[56px] leading-none [font-family:var(--font-display)]">
                  <NumberTicker value={estimate.total} startValue={0} className="tracking-normal" />{"\u00a0zł"}
                </p>
              ) : (
                <p className="m-0 text-[22px] font-semibold">Suma pojawi się po wyborze terminu</p>
              )}
              <p className="mb-4 mt-1 text-[16px]">{estimate ? "To szacunek do potwierdzenia przez właściciela. " : ""}Kaucja {zl(PRICES.deposit)} osobno.</p>
              <button type="submit" disabled={isSubmitting} className="btn btn-ink w-full">
                {isSubmitting ? "Sprawdzam termin…" : "Wyślij zapytanie"}
              </button>
            </div>
          )}
        </aside>
      ) : (
      <aside aria-label="Twój bilet" className="relative lg:sticky lg:top-4">
        <div className="ticket-v">
          <div className="p-6">
            <div className="flex items-baseline justify-between gap-3">
              <span className="display text-[44px] leading-none">Wendrowan</span>
              <span className="text-[16px]">bilet na vana</span>
            </div>
            <dl className="mb-0 mt-4 grid gap-1 text-[18px]">
              <Row name="Z" value="Oleśnica lub Wrocław" />
              <div className="flex items-center justify-between gap-3">
                <dt>Do</dt>
                <dd className="m-0 min-w-0">
                  <input
                    aria-label="Cel podróży"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                    maxLength={13}
                    placeholder="wpisz cel"
                    className="w-full border-0 border-b-2 border-ink bg-transparent text-right font-semibold outline-none"
                  />
                </dd>
              </div>
              <Row name="Termin" value={when} />
              <dd className="m-0">
                <label className="addon ">
                  <input type="checkbox" checked={extras.tent} onChange={() => toggleExtra("tent")} />
                  <span>Przedsionek</span>
                </label>
                <label className="addon">
                  <input type="checkbox" checked={extras.racks} onChange={() => toggleExtra("racks")} />
                  <span>Bagażniki na rowery</span>
                </label>
              </dd>
              <Row name={estimate ? `Doby: ${estimate.days}` : "Doby"} value={estimate ? zl(estimate.rent) : "–"} />
              <Row name="Opłata serwisowa" value={zl(PRICES.serviceFee)} />
            </dl>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div key="sent" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-ink p-6 text-paper">
                <p className="display m-0 text-[44px] leading-none text-lime">Bilet wysłany</p>
                <p className="mb-0 mt-2 text-[18px]">Odpiszemy mailem lub zadzwonimy, żeby potwierdzić termin.</p>
              </motion.div>
            ) : (
              <motion.div
                key="stub"
                exit={{ y: 180, x: 40, rotate: 9, opacity: 0, transition: { duration: 0.6, ease: [0.4, 0, 1, 1] } }}
                className="tear bg-lime p-6"
              >
                {estimate ? (
                  <p aria-live="polite" className="display m-0 text-[64px] leading-none">
                    <NumberTicker value={estimate.total} startValue={0} className="tracking-normal" />{"\u00a0zł"}
                  </p>
                ) : (
                  <p className="m-0 text-[24px] font-semibold">Suma pojawi się po wyborze terminu</p>
                )}
                <p className="mb-4 mt-1 text-[16px]">{estimate ? "To szacunek do potwierdzenia przez właściciela. " : ""}Kaucja {zl(PRICES.deposit)} osobno.</p>
                <button type="submit" disabled={isSubmitting} className="btn btn-ink w-full">
                  {isSubmitting ? "Sprawdzam termin…" : "Wyślij zapytanie"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </aside>
      )}
    </form>
  )
}

function Row({ name, value }: { name: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{name}</dt>
      <dd className="m-0 text-right font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function Text({ label, error, ...props }: { label: string; error?: string } & React.ComponentProps<"input">) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input aria-invalid={Boolean(error)} {...props} />
      {error ? <em>{error}</em> : null}
    </label>
  )
}
