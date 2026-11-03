"use client"

import "./trip.css"

import Image from "next/image"
import { useEffect, useRef } from "react"

import { NumberTicker } from "@/components/magicui/number-ticker"
import BlurTextRaw from "@/components/reactbits/BlurText"
import VariableProximityRaw from "@/components/reactbits/VariableProximity"
import { ContactForm, Faq, CalendarNote } from "@/components/shared/blocks"
import { BookingTool } from "@/components/ticket/booking"
import { useTicket } from "@/components/ticket/ticket-context"
import type { DesignProps } from "@/designs/registry"
import { PRICES, zl } from "@/lib/pricing"

const VariableProximity = VariableProximityRaw as unknown as React.ComponentType<Record<string, unknown>>

const BlurText = BlurTextRaw as unknown as React.ComponentType<Record<string, unknown>>

const MOMENTS = [
  { id: "rano", zone: "tz-dawn", title: "Rano kawa na trawie", text: "Kuchenka, lodówka, stolik i dwa krzesła jadą razem z tobą.", src: "/photos/kettle-grass.jpg", alt: "Czajnik na kuchence i kubek na trawie", pos: "50% 62%" },
  { id: "poludnie", zone: "tz-day", title: "Bez limitu kilometrów", text: "Jedziesz tak daleko, jak chcesz. Licznik nikogo tu nie obchodzi.", src: "/photos/mountain-grey-van.jpg", alt: "Van na drodze pod górskim szczytem", pos: "50% 60%" },
  { id: "wieczor", zone: "tz-dusk", title: "Wieczorem bez pośpiechu", text: "Cztery miejsca do spania, 2×2. Zostajesz, dopóki chcesz.", src: "/photos/interior-lights.jpg", alt: "Wnętrze vana z lampkami i widokiem na las", pos: "50% 50%" },
] as const

const INSIDE = ["Lodówka i kuchenka", "Przenośna toaleta", "Stacja ładowania 12V + 220V", "Stolik, dwa krzesła, dwa stołki", "Rozwijana markiza"]

function useDayClock() {
  const clock = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const room = document.documentElement.scrollHeight - window.innerHeight
      const progress = room > 0 ? Math.min(1, Math.max(0, window.scrollY / room)) : 0
      const minutes = Math.round((6 * 60 + progress * 17.5 * 60) / 5) * 5
      if (label.current) label.current.textContent = `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0") /* taste-skill-ignore: clock minutes */}`
      const phase = minutes < 9 * 60 + 30 ? "dawn" : minutes < 16 * 60 ? "day" : minutes < 20 * 60 ? "dusk" : "night"
      if (clock.current) clock.current.dataset.phase = phase
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  return { clock, label }
}

export function TripDesign({ booked, demo }: DesignProps) {
  const headline = useRef<HTMLDivElement>(null)
  const { extras, toggleExtra } = useTicket()
  const { clock, label } = useDayClock()

  return (
    <main className="d-trip overflow-x-clip">
      <header className="tz-dawn px-(--gutter) pb-24 pt-5 max-md:pb-16">
        <nav aria-label="Główna" className="flex items-center justify-between gap-6">
          <a href="#" className="tz-display text-[34px] no-underline">Wendrowan</a>
          <div className="flex gap-8 text-[18px] max-md:hidden">
            <a className="tz-link" href="#van">Van</a>
            <a className="tz-link" href="#cennik">Cennik</a>
            <a className="tz-link" href="#terminy">Terminy</a>
            <a className="tz-link" href="#pytania">Pytania</a>
          </div>
          <a className="tz-link text-[18px] font-semibold md:hidden" href="#terminy">Terminy</a>
        </nav>
        <div className="mt-16 grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] items-end gap-12 max-lg:grid-cols-1 max-md:mt-10">
          <div>
            <div ref={headline}>
              <h1 className="tz-display text-[clamp(46px,8.3vw,128px)] whitespace-nowrap">
                {["Wendrowan,", "van na wyprawy."].map((line) => (
                  <span key={line} className="mask-line">
                    <span>
                      <VariableProximity
                        label={line}
                        containerRef={headline}
                        fromFontVariationSettings="'wght' 400"
                        toFontVariationSettings="'wght' 700"
                        radius={160}
                        falloff="gaussian"
                        idleWave
                        style={{ fontFamily: "var(--font-display)" }}
                      />
                    </span>
                  </span>
                ))}
              </h1>
            </div>
            <p className="mb-8 mt-8 max-w-[30em] text-[22px] leading-snug max-md:text-[20px]">
              Podnoszony dach, cztery miejsca do spania i droga, którą wybierasz sam.
            </p>
            <a href="#rano" className="tz-btn">Zobacz, jak to wygląda</a>
          </div>
          <div className="tz-reveal tz-frame relative aspect-[4/5] max-lg:aspect-[16/10]">
            <Image src="/photos/dusk-popup.jpg" alt="Van z podniesionym dachem nad jeziorem o zmierzchu" fill priority sizes="(max-width: 1024px) 100vw, 34vw" className="object-cover" style={{ objectPosition: "60% 100%" }} />
          </div>
        </div>
      </header>

      {MOMENTS.map((moment, index) => (
        <section key={moment.id} id={moment.id} className={`${moment.zone} px-(--gutter) py-32 max-md:py-20`}>
          <div className={`grid grid-cols-2 items-center gap-16 max-lg:grid-cols-1 max-lg:gap-10 ${index % 2 ? "[&>div:first-child]:order-2 max-lg:[&>div:first-child]:order-none" : ""}`}>
            <div className="rise">
              <h2 className="tz-display text-[clamp(48px,6.6vw,104px)]"><BlurText text={moment.title} delay={110} stepDuration={0.45} blur={8} distance={24} /></h2>
              <p className="mb-0 mt-6 max-w-[24em] text-[22px] leading-snug max-md:text-[20px]">{moment.text}</p>
            </div>
            <div className="tz-frame rise relative aspect-[5/4]">
              <Image src={moment.src} alt={moment.alt} fill sizes="(max-width: 1024px) 100vw, 46vw" className="object-cover" style={{ objectPosition: moment.pos }} />
            </div>
          </div>
        </section>
      ))}

      <section id="van" className="tz-dusk px-(--gutter) pb-32 max-md:pb-20">
        <h2 className="tz-display rise text-[clamp(48px,6.6vw,104px)]">Co jedzie z tobą</h2>
        <p className="mb-14 mt-5 max-w-[34em] text-[22px] leading-snug max-md:text-[20px]">Automat, 2.0 diesel, hak holowniczy i do pięciu miejsc na trasie.</p>
        <div className="grid grid-cols-2 gap-16 max-lg:grid-cols-1 max-lg:gap-10">
          <div className="rise">
            <h3 className="tz-display text-[44px]">W środku</h3>
            <ul className="m-0 mt-5 list-none p-0 text-[20px] leading-loose">
              {INSIDE.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
          <div className="rise">
            <h3 className="tz-display text-[44px]">Na życzenie</h3>
            <div className="mt-5">
              <label className="tz-check"><input type="checkbox" checked={extras.tent} onChange={() => toggleExtra("tent")} />Duży przedsionek 3×3 m, {PRICES.tentPerDay} zł za dobę</label>
              <label className="tz-check"><input type="checkbox" checked={extras.racks} onChange={() => toggleExtra("racks")} />Bagażnik na 2 rowery na klapę lub na 4 rowery na hak, {PRICES.racksPerDay} zł za dobę</label>
            </div>
          </div>
        </div>
      </section>

      <section id="cennik" className="tz-night px-(--gutter) py-32 max-md:py-20">
        <h2 className="tz-display rise text-[clamp(48px,6.6vw,104px)]">Cennik</h2>
        <div className="mt-12 grid grid-cols-3 gap-10 max-lg:grid-cols-1 max-lg:gap-8">
          {[
            { value: PRICES.highSeason, label: "za dobę w sezonie, od 1 maja do 30 września" },
            { value: PRICES.offSeason, label: "za dobę poza sezonem" },
            { value: PRICES.serviceFee, label: "opłata serwisowa, jednorazowo" },
          ].map((figure) => (
            <div key={figure.label} className="rise">
              <p className="tz-display m-0 text-[clamp(72px,9vw,140px)] tabular-nums">
                <NumberTicker value={figure.value} />{" zł"}
              </p>
              <p className="m-0 mt-2 text-[20px]">{figure.label}</p>
            </div>
          ))}
        </div>
        <p className="rise mb-0 mt-14 max-w-[40em] text-[20px] leading-relaxed">
          Kaucja {zl(PRICES.deposit)}. Przedsionek {PRICES.tentPerDay} zł za dobę, bagażniki na rowery {PRICES.racksPerDay} zł za dobę. Limit kilometrów: brak. Odbiór w Oleśnicy lub we Wrocławiu.
        </p>
      </section>

      <section id="terminy" className="tz-night px-(--gutter) pb-32 max-md:pb-20">
        <h2 className="tz-display rise text-[clamp(48px,6.6vw,104px)]">Kiedy wyjeżdżasz?</h2>
        <p className="mb-8 mt-5 max-w-[36em] text-[20px]">Wybierz dni odbioru i zwrotu. Zajęte dni pochodzą z kalendarza vana.<CalendarNote demo={demo} /></p>
        {booked ? <BookingTool booked={booked} summary="panel" /> : <p className="tool-surface p-6">Nie udało się wczytać kalendarza. Odśwież stronę za chwilę.</p>}
      </section>

      <section id="pytania" className="tz-night px-(--gutter) pb-32 max-md:pb-20">
        <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-16 max-lg:grid-cols-1">
          <div>
            <h2 className="tz-display rise text-[clamp(48px,6.6vw,104px)]">Pytania</h2>
            <Faq className="mt-8 columns-2 gap-12 max-md:columns-1" />
          </div>
          <div className="tool-surface rise self-start p-8 max-md:p-5">
            <h3 className="tz-display mb-4 text-[40px]">Napisz lub zadzwoń</h3>
            <p className="mb-5 mt-0 text-[18px]">Telefon: [numer]<br />E-mail: [e-mail]</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="tz-night px-(--gutter) pb-28 pt-10 text-[18px]">
        <p className="tz-display m-0 text-[clamp(56px,12vw,200px)]">Wendrowan</p>
        <p className="mb-0 mt-6">Wendrowan, Oleśnica i Wrocław. [Dane firmy] · [Regulamin] · Zdjęcia: Unsplash.</p>
      </footer>

      <div ref={clock} className="tz-clock" data-phase="dawn" aria-hidden="true" data-ui>
        <span className="tz-sun" />
        <span ref={label}>6:40</span>
      </div>
    </main>
  )
}
