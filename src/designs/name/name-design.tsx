"use client"

import "./name.css"

import Image from "next/image"
import { useRef } from "react"

import { Marquee } from "@/components/magicui/marquee"
import { NumberTicker } from "@/components/magicui/number-ticker"
import VariableProximityRaw from "@/components/reactbits/VariableProximity"
import { CalendarNote, ContactForm, Faq } from "@/components/shared/blocks"
import { BookingTool } from "@/components/ticket/booking"
import type { DesignProps } from "@/designs/registry"
import { FACTS } from "@/lib/content"
import { PRICES, zl } from "@/lib/pricing"

const VariableProximity = VariableProximityRaw as unknown as React.ComponentType<Record<string, unknown>>

const ROWS = [
  { word: "Spanie", text: "Cztery miejsca, 2×2, pod podnoszonym dachem vana.", src: "/photos/open-vans-forest.jpg", alt: "Otwarte klapy vanów z pościelą" },
  { word: "Kuchnia", text: "Lodówka, kuchenka, stolik, dwa krzesła i dwa stołki.", src: "/photos/kettle-grass.jpg", alt: "Czajnik na kuchence i kubek na trawie" },
  { word: "Prąd", text: "Stacja ładowania 12V + 220V i przenośna toaleta.", src: "/photos/interior-lights.jpg", alt: "Wnętrze vana z lampkami" },
  { word: "Jazda", text: "Automat, 2.0 diesel, hak i do pięciu miejsc.", src: "/photos/mountain-grey-van.jpg", alt: "Van na górskiej drodze" },
] as const

export function NameDesign({ booked, demo }: DesignProps) {
  const wordmark = useRef<HTMLDivElement>(null)

  return (
    <main className="d-name overflow-x-clip">
      <header className="px-(--gutter) pt-5">
        <nav aria-label="Główna" className="flex items-center justify-between gap-6 text-[20px] font-semibold">
          <span>Oleśnica i Wrocław</span>
          <div className="flex gap-8 max-md:hidden">
            <a className="nm-link" href="#van">Van</a>
            <a className="nm-link" href="#cennik">Cennik</a>
            <a className="nm-link" href="#terminy">Terminy</a>
            <a className="nm-link" href="#pytania">Pytania</a>
          </div>
          <a className="nm-link md:hidden" href="#terminy">Terminy</a>
        </nav>
        <div ref={wordmark} className="mt-6 max-md:mt-10">
          <h1 className="m-0 nm-big nm-word whitespace-nowrap">
            <VariableProximity
              label="Wendrowan"
              containerRef={wordmark}
              fromFontVariationSettings="'wght' 380, 'wdth' 100, 'opsz' 96"
              toFontVariationSettings="'wght' 800, 'wdth' 100, 'opsz' 96"
              radius={220}
              falloff="gaussian"
              idleWave
              style={{ fontFamily: "var(--font-display)" }}
            />
          </h1>
        </div>
        <div className="mt-10 grid grid-cols-[minmax(0,6fr)_minmax(0,4fr)] items-end gap-12 pb-16 max-lg:grid-cols-1 max-lg:gap-6 max-md:mt-6">
          <p className="nm-big m-0 text-[clamp(40px,6.2vw,96px)] [text-transform:none]">Wędrować, tylko vanem.</p>
          <div>
            <p className="mb-6 mt-0 max-w-[26em] text-[22px] leading-snug">Van z podnoszonym dachem do wynajęcia. Cztery miejsca do spania i prąd na miejscu.</p>
            <a href="#van" className="nm-btn">Zobacz vana</a>
          </div>
        </div>
      </header>

      <div className="nm-ink py-5">
        <Marquee className="p-0 [--duration:40s] [--gap:3rem]" pauseOnHover>
          {FACTS.map((fact) => (
            <span key={fact} className="nm-big whitespace-nowrap text-[44px] text-[#f4d51d] [text-transform:none] max-md:text-[32px]">{fact}</span>
          ))}
        </Marquee>
      </div>

      <section id="van" className="pt-28 max-md:pt-16">
        <h2 className="nm-big m-0 px-(--gutter) pb-10 text-[clamp(44px,6.6vw,104px)] [text-transform:none]">Wszystko na pokładzie</h2>
        <div>
          {ROWS.map((row) => (
            <div key={row.word} className="nm-row rise">
              <h3 className="nm-big m-0 text-[clamp(52px,9.4vw,150px)] [text-transform:none]">{row.word}</h3>
              <p className="m-0 max-w-[22em] text-[22px] leading-snug max-md:text-[19px]">{row.text}</p>
              <div className="nm-thumb relative aspect-[4/5] w-full overflow-hidden max-md:aspect-square">
                <Image src={row.src} alt={row.alt} fill sizes="150px" className="object-cover" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="cennik" className="nm-ink mt-28 px-(--gutter) py-28 max-md:mt-16 max-md:py-16">
        <h2 className="nm-big m-0 text-[clamp(44px,6.6vw,104px)] [text-transform:none]">Cennik</h2>
        <div className="mt-12 grid grid-cols-4 gap-8 max-lg:grid-cols-2 max-md:grid-cols-1 max-md:gap-6">
          {[
            { v: PRICES.highSeason, l: "za dobę od maja do września" },
            { v: PRICES.offSeason, l: "za dobę poza sezonem" },
            { v: PRICES.serviceFee, l: "opłata serwisowa, jednorazowo" },
            { v: PRICES.deposit, l: "kaucja" },
          ].map((figure) => (
            <div key={figure.l} className="rise">
              <p className="nm-big m-0 whitespace-nowrap text-[clamp(44px,5.4vw,88px)] text-[#f4d51d] tabular-nums"><NumberTicker value={figure.v} />{" zł"}</p>
              <p className="m-0 mt-2 text-[20px]">{figure.l}</p>
            </div>
          ))}
        </div>
        <p className="mb-0 mt-14 max-w-[34em] text-[22px] leading-snug">
          Przedsionek {zl(PRICES.tentPerDay)} za dobę, bagażniki na rowery {zl(PRICES.racksPerDay)} za dobę. Bez limitu kilometrów. Odbiór w Oleśnicy lub we Wrocławiu.
        </p>
      </section>

      <section id="terminy" className="nm-ink px-(--gutter) pb-28 max-md:pb-16">
        <h2 className="nm-big m-0 text-[clamp(44px,6.6vw,104px)] [text-transform:none]">Terminy</h2>
        <p className="mb-8 mt-5 max-w-[36em] text-[20px]">Wybierz dni odbioru i zwrotu. Zajęte dni pochodzą z kalendarza vana.<CalendarNote demo={demo} /></p>
        {booked ? <BookingTool booked={booked} summary="panel" /> : <p className="tool-surface p-6">Nie udało się wczytać kalendarza. Odśwież stronę za chwilę.</p>}
      </section>

      <section id="pytania" className="px-(--gutter) py-28 max-md:py-16">
        <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-16 max-lg:grid-cols-1">
          <div>
            <h2 className="nm-big m-0 text-[clamp(44px,6.6vw,104px)] [text-transform:none]">Pytania</h2>
            <Faq className="mt-8 columns-2 gap-12 max-md:columns-1" />
          </div>
          <div className="tool-surface self-start p-8 max-md:p-5">
            <h3 className="nm-big m-0 mb-3 text-[36px] [text-transform:none]">Napisz lub zadzwoń</h3>
            <p className="mb-5 mt-0 text-[18px]">Telefon: [telefon]<br />E-mail: [e-mail]</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="nm-ink overflow-hidden px-(--gutter) pb-8 pt-12">
        <p className="nm-big nm-word m-0 whitespace-nowrap text-[#f4d51d]">Wendrowan</p>
        <p className="mb-0 mt-6 text-[18px]">Oleśnica i Wrocław. [Dane firmy] · [Regulamin] · Zdjęcia: Unsplash.</p>
      </footer>
    </main>
  )
}
