"use client"

import "./split.css"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"

import TrueFocusRaw from "@/components/reactbits/TrueFocus"
import DecryptedTextRaw from "@/components/reactbits/DecryptedText"
import { NumberTicker } from "@/components/magicui/number-ticker"
import { CalendarNote, ContactForm, Faq } from "@/components/shared/blocks"
import { BookingTool } from "@/components/ticket/booking"
import { useTicket } from "@/components/ticket/ticket-context"
import type { DesignProps } from "@/designs/registry"
import { PRICES, zl } from "@/lib/pricing"

const TrueFocus = TrueFocusRaw as unknown as React.ComponentType<Record<string, unknown>>
const DecryptedText = DecryptedTextRaw as unknown as React.ComponentType<Record<string, unknown>>

const PARTS = [
  { id: "spanie", tab: "Spanie", title: "Spanie dla czterech", text: "Cztery miejsca do spania, 2×2, i rozwijana markiza. Na trasie jedzie z wami do pięciu osób.", src: "/photos/open-vans-forest.jpg", alt: "Otwarte klapy vanów z pościelą w lesie", pos: "50% 62%" },
  { id: "kuchnia", tab: "Kuchnia i prąd", title: "Kuchnia i prąd", text: "Lodówka, kuchenka, przenośna toaleta i stacja ładowania 12V + 220V. Do tego stolik, dwa krzesła i dwa stołki.", src: "/photos/kettle-grass.jpg", alt: "Czajnik na kuchence i kubek na trawie", pos: "50% 62%" },
  { id: "miejsce", tab: "Więcej miejsca", title: "Więcej miejsca, kiedy chcesz", text: "Duży przedsionek 3×3 m oraz bagażniki na 2 rowery na klapę lub 4 rowery na hak.", src: "/photos/forest-road-van.jpg", alt: "Van na leśnej drodze", pos: "50% 60%" },
  { id: "jazda", tab: "Prowadzenie", title: "Prowadzi się jak auto", text: "Automat, 2.0 diesel, hak holowniczy i brak limitu kilometrów.", src: "/photos/mountain-grey-van.jpg", alt: "Van na drodze pod górskim szczytem", pos: "50% 60%" },
] as const

type PartId = (typeof PARTS)[number]["id"]

/** A plain drawing of the van. The part you are reading about turns teal. */
function VanPlan({ active, onPick }: { active: PartId; onPick?: (id: PartId) => void }) {
  const fill = (id: PartId, rest = "#16221e") => (active === id ? "#0f6b63" : rest)
  const pick = (id: PartId) =>
    onPick
      ? {
          onClick: () => onPick(id),
          onKeyDown: (event: React.KeyboardEvent) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault()
              onPick(id)
            }
          },
          tabIndex: 0,
          role: "button" as const,
        }
      : { "aria-hidden": true as const }

  return (
    <svg viewBox="-70 -10 740 310" role={onPick ? "group" : "img"} aria-label="Rysunek vana z podniesionym dachem" className="sp-van block h-auto w-full">
      <g {...pick("spanie")} aria-label="Spanie, podnoszony dach">
        <path className="roof" data-on={String(active === "spanie")} fill={fill("spanie")} d="M110 66 L146 20 L404 16 L440 62 Z" />
      </g>
      <path fill="#16221e" d="M30 236 L30 98 Q30 68 58 66 L440 62 Q500 62 532 112 L592 164 Q614 180 614 204 L614 236 Z" />
      <path className="glass" d="M64 88 L172 87 L172 146 L64 147 Z" />
      <path className="glass" d="M386 86 L440 84 Q490 84 516 122 L386 128 Z" />
      <g {...pick("kuchnia")} aria-label="Kuchnia i prąd, drzwi boczne">
        <rect x="188" y="80" width="182" height="156" fill={fill("kuchnia", "#2a3a35")} />
        <path className="glass" d="M204 94 L354 92 L354 148 L204 150 Z" />
        <rect x="204" y="176" width="40" height="10" fill="#e4e8e6" />
      </g>
      <g {...pick("miejsce")} aria-label="Więcej miejsca, markiza i bagażniki">
        <rect x="150" y="52" width="270" height="14" fill={fill("miejsce")} />
        <rect x="-4" y="168" width="36" height="12" fill={fill("miejsce")} />
        <circle cx="-34" cy="206" r="30" fill="none" stroke={fill("miejsce")} strokeWidth="9" />
        <circle cx="-34" cy="206" r="5" fill={fill("miejsce")} />
      </g>
      <g {...pick("jazda")} aria-label="Prowadzenie, automat i hak">
        <path d="M520 132 L592 164 Q614 180 614 204 L614 236 L520 236 Z" fill={fill("jazda")} />
        <rect x="14" y="214" width="22" height="10" fill={fill("jazda")} />
      </g>
      <circle cx="140" cy="240" r="54" fill="#e4e8e6" />
      <circle cx="500" cy="240" r="54" fill="#e4e8e6" />
      <circle cx="140" cy="240" r="44" fill="#16221e" />
      <circle cx="140" cy="240" r="17" fill="#e4e8e6" />
      <circle cx="500" cy="240" r="44" fill="#16221e" />
      <circle cx="500" cy="240" r="17" fill="#e4e8e6" />
    </svg>
  )
}

export function SplitDesign({ booked, demo }: DesignProps) {
  const { extras, toggleExtra } = useTicket()
  const [active, setActive] = useState<PartId>("spanie")
  const blocks = useRef<Record<string, HTMLElement | null>>({})

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.getAttribute("data-part") as PartId)
      },
      { rootMargin: "-45% 0px -45% 0px" }
    )
    Object.values(blocks.current).forEach((node) => node && observer.observe(node))
    return () => observer.disconnect()
  }, [])

  function go(id: PartId) {
    setActive(id)
    blocks.current[id]?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <main className="d-split overflow-x-clip">
      <header className="px-(--gutter) pt-5">
        <nav aria-label="Główna" className="flex items-center justify-between gap-6">
          <a href="#" className="sp-display text-[28px] no-underline">Wendrowan</a>
          <div className="flex gap-8 text-[18px] max-md:hidden">
            <a className="sp-link" href="#van">Van</a>
            <a className="sp-link" href="#cennik">Cennik</a>
            <a className="sp-link" href="#terminy">Terminy</a>
            <a className="sp-link" href="#pytania">Pytania</a>
          </div>
          <a className="sp-link text-[18px] font-semibold md:hidden" href="#terminy">Terminy</a>
        </nav>
        <h1 className="sp-display mt-16 text-[clamp(34px,6.6vw,104px)] whitespace-nowrap max-md:mt-10">
          <span className="mask-line"><span>Van, który ma</span></span>
          <span className="mask-line"><span className="delay">wszystko na wyjazd</span></span>
        </h1>
        <p className="mb-8 mt-7 max-w-[32em] text-[22px] leading-snug max-md:text-[20px]">
          Podnoszony dach, kuchenka, lodówka i cztery miejsca do spania. Do wynajęcia w Oleśnicy i we Wrocławiu.
        </p>
        <a href="#van" className="sp-btn">Zobacz vana</a>
      </header>

      <div className="px-(--gutter) pt-16 text-[clamp(32px,5vw,72px)] sp-display" aria-hidden="true">
        <TrueFocus sentence="Spanie Kuchnia Miejsce Jazda" borderColor="#0f6b63" blurAmount={4} animationDuration={0.5} pauseBetweenAnimations={1} />
      </div>

      <section id="van" className="grid grid-cols-2 gap-x-16 px-(--gutter) pt-16 max-lg:grid-cols-1 max-lg:gap-0 max-md:pt-8">
        <div className="sp-plan sticky top-6 self-start max-lg:hidden lg:h-[calc(100svh-48px)]">
          <div className="flex h-full flex-col justify-center">
            <VanPlan active={active} onPick={go} />
            <div role="tablist" aria-label="Części vana" className="mt-4 grid grid-cols-4 gap-2">
              {PARTS.map((part) => (
                <button key={part.id} type="button" role="tab" aria-selected={active === part.id} className="sp-tab" onClick={() => go(part.id)}>
                  {part.tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          {PARTS.map((part) => (
            <article key={part.id} data-part={part.id} ref={(node) => { blocks.current[part.id] = node }} className="sp-block flex flex-col justify-center py-14 max-lg:min-h-0 max-lg:py-12">
              <div className="mb-8 max-w-[520px] lg:hidden"><VanPlan active={part.id} /></div>
              <h2 className="sp-display text-[clamp(32px,3.8vw,56px)]"><DecryptedText text={part.title} animateOn="inViewHover" sequential revealDirection="start" speed={35} useOriginalCharsOnly /></h2>
              <p className="mb-6 mt-5 max-w-[28em] text-[21px] leading-snug">{part.text}</p>
              {part.id === "miejsce" ? (
                <div className="mb-6">
                  <label className="sp-check"><input type="checkbox" checked={extras.tent} onChange={() => toggleExtra("tent")} />Przedsionek, {PRICES.tentPerDay} zł za dobę</label>
                  <label className="sp-check"><input type="checkbox" checked={extras.racks} onChange={() => toggleExtra("racks")} />Bagażniki, {PRICES.racksPerDay} zł za dobę</label>
                </div>
              ) : null}
              <div className="rise relative aspect-[16/9] max-w-[520px] overflow-hidden">
                <Image src={part.src} alt={part.alt} fill sizes="(max-width: 1024px) 90vw, 36vw" className="object-cover" style={{ objectPosition: part.pos }} />
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="cennik" className="mt-24 grid grid-cols-[minmax(0,5fr)_minmax(0,6fr)] items-start gap-16 px-(--gutter) max-lg:grid-cols-1 max-lg:gap-8 max-md:mt-16">
        <div className="rise">
          <h2 className="sp-display text-[clamp(40px,5.4vw,84px)]">Cennik</h2>
          <p className="mb-0 mt-5 max-w-[24em] text-[21px] leading-snug">Bez limitu kilometrów. Odbiór w Oleśnicy lub we Wrocławiu.</p>
          <p className="sp-display mb-0 mt-10 text-[clamp(72px,9vw,140px)] tabular-nums"><NumberTicker value={PRICES.highSeason} />{" zł"}</p>
          <p className="m-0 mt-1 text-[20px]">za dobę w sezonie, od 1 maja do 30 września</p>
        </div>
        <table className="sp-table rise">
          <tbody>
            <tr><th scope="row">Doba w sezonie, 1 maja do 30 września</th><td>{zl(PRICES.highSeason)}</td></tr>
            <tr><th scope="row">Doba poza sezonem</th><td>{zl(PRICES.offSeason)}</td></tr>
            <tr><th scope="row">Opłata serwisowa, jednorazowo</th><td>{zl(PRICES.serviceFee)}</td></tr>
            <tr><th scope="row">Kaucja</th><td>{zl(PRICES.deposit)}</td></tr>
            <tr><th scope="row">Przedsionek za dobę</th><td>{zl(PRICES.tentPerDay)}</td></tr>
            <tr><th scope="row">Bagażniki na rowery za dobę</th><td>{zl(PRICES.racksPerDay)}</td></tr>
          </tbody>
        </table>
      </section>

      <section id="terminy" className="sp-dark mt-28 px-(--gutter) py-28 max-md:mt-20 max-md:py-16">
        <h2 className="sp-display rise text-[clamp(40px,5.4vw,84px)]">Sprawdź terminy</h2>
        <p className="mb-8 mt-5 max-w-[36em] text-[20px]">Wybierz dni odbioru i zwrotu. Zajęte dni pochodzą z kalendarza vana.<CalendarNote demo={demo} /></p>
        {booked ? <BookingTool booked={booked} summary="panel" /> : <p className="tool-surface p-6">Nie udało się wczytać kalendarza. Odśwież stronę za chwilę.</p>}
      </section>

      <section id="pytania" className="px-(--gutter) py-28 max-md:py-16">
        <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-16 max-lg:grid-cols-1">
          <div>
            <h2 className="sp-display rise text-[clamp(40px,5.4vw,84px)]">Pytania i kontakt</h2>
            <Faq className="mt-8 columns-2 gap-12 max-md:columns-1" />
          </div>
          <div className="sp-dark rise self-start p-8 max-md:p-5">
            <h3 className="sp-display mb-3 text-[32px]">Napisz lub zadzwoń</h3>
            <p className="mb-5 mt-0 text-[18px]">Telefon: [numer]<br />E-mail: [e-mail]</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="sp-dark px-(--gutter) py-12 text-[18px]">
        <p className="sp-display m-0 text-[clamp(44px,8vw,120px)]">Wendrowan</p>
        <p className="mb-0 mt-5">Wendrowan, Oleśnica i Wrocław. [Dane firmy] · [Regulamin] · Zdjęcia: Unsplash.</p>
      </footer>
    </main>
  )
}
