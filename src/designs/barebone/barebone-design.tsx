"use client"

import "./barebone.css"

import Image from "next/image"

import CurvedLoopRaw from "@/components/reactbits/CurvedLoop"

import { NumberTicker } from "@/components/magicui/number-ticker"
import { CalendarNote, ContactForm, Faq } from "@/components/shared/blocks"
import { BookingTool } from "@/components/ticket/booking"
import type { DesignProps } from "@/designs/registry"
import { REVIEWS } from "@/lib/content"
import { PRICES } from "@/lib/pricing"

const CurvedLoop = CurvedLoopRaw as unknown as React.ComponentType<Record<string, unknown>>

const ENTRIES = [
  { title: "Śpi cztery osoby", text: "Cztery miejsca do spania, 2×2. Na trasie jedzie z wami do pięciu osób." },
  { title: "Kuchnia i prąd na miejscu", text: "Lodówka, kuchenka, przenośna toaleta i stacja ładowania 12V + 220V. Do tego stolik, dwa krzesła i dwa stołki." },
  { title: "Więcej miejsca, kiedy chcesz", text: "Rozwijana markiza w standardzie. Opcjonalnie duży przedsionek 3×3 m i bagażniki na 2 lub 4 rowery." },
  { title: "Automat i 2.0 diesel", text: "Automatyczna skrzynia biegów, hak holowniczy i brak limitu kilometrów." },
] as const

const TABLE = [
  { group: "Doba wynajmu", rows: [["Sezon, 1 maja do 30 września", PRICES.highSeason], ["Poza sezonem", PRICES.offSeason]] },
  { group: "Opłaty", rows: [["Opłata serwisowa, jednorazowo", PRICES.serviceFee], ["Kaucja", PRICES.deposit]] },
  { group: "Dodatki za dobę", rows: [["Przedsionek", PRICES.tentPerDay], ["Bagażniki na rowery", PRICES.racksPerDay]] },
] as const

export function BareboneDesign({ booked, demo }: DesignProps) {
  return (
    <main className="d-barebone overflow-x-clip">
      <header className="px-(--gutter) pt-5">
        <nav aria-label="Główna" className="flex items-center justify-between gap-6 text-[18px]">
          <a href="#" className="bb-display text-[22px] no-underline">Wendrowan</a>
          <div className="flex gap-8 max-md:hidden">
            <a className="bb-link" href="#van">Van</a>
            <a className="bb-link" href="#cennik">Cennik</a>
            <a className="bb-link" href="#terminy">Terminy</a>
            <a className="bb-link" href="#pytania">Pytania</a>
          </div>
          <a className="bb-link font-semibold md:hidden" href="#terminy">Terminy</a>
        </nav>
        <h1 className="bb-display mt-20 text-[clamp(44px,10.4vw,176px)] max-md:mt-12">
          <span className="mask-line"><span>Wędruj vanem.</span></span>
        </h1>
        <p className="mb-8 mt-8 max-w-[30em] text-[24px] leading-snug max-md:text-[20px]">
          Wendrowan to van z podnoszonym dachem do wynajęcia. Cztery miejsca do spania i wszystko, co potrzebne w drodze.
        </p>
        <div className="flex flex-wrap items-center gap-8">
          <a href="#van" className="bb-btn">Zobacz vana</a>
          <a href="#terminy" className="bb-link text-[20px] font-semibold">Sprawdź terminy</a>
        </div>
        <div className="bb-reveal relative mt-16 aspect-[21/9] overflow-hidden max-md:mt-10 max-md:aspect-[4/3]">
          <Image src="/photos/sunset-popup.jpg" alt="Van z podniesionym dachem na plaży o zachodzie słońca" fill priority sizes="100vw" className="hero-drift object-cover" style={{ objectPosition: "50% 78%" }} />
        </div>
      </header>

      <div className="mt-16 max-md:mt-8" aria-hidden="true">
        <CurvedLoop marqueeText="Wędruj vanem ✦ Wendrowan ✦ " speed={2} curveAmount={220} fontSize={72} fontWeight={800} color="#2744f5" interactive />
      </div>

      <section id="van" className="mt-32 px-(--gutter) max-md:mt-20">
        <h2 className="bb-display rise text-[clamp(34px,5.4vw,88px)]">Dom, który jedzie z tobą.</h2>
        <div className="mt-14 grid grid-cols-2 gap-x-16 gap-y-12 max-md:grid-cols-1">
          {ENTRIES.map((entry) => (
            <article key={entry.title} className="rise">
              <h3 className="m-0 text-[28px] font-bold leading-tight">{entry.title}</h3>
              <p className="mb-0 mt-3 max-w-[26em] text-[21px] leading-snug">{entry.text}</p>
            </article>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-3 gap-3 max-md:mt-10 max-md:grid-cols-1">
          {[
            { src: "/photos/open-vans-forest.jpg", alt: "Otwarte klapy vanów z pościelą w lesie" },
            { src: "/photos/kettle-grass.jpg", alt: "Czajnik na kuchence i kubek na trawie" },
            { src: "/photos/interior-lights.jpg", alt: "Wnętrze vana z lampkami" },
          ].map((photo) => (
            <div key={photo.src} className="rise relative aspect-[4/3] overflow-hidden">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      <section id="cennik" className="mt-32 px-(--gutter) max-md:mt-20">
        <h2 className="bb-display rise text-[clamp(34px,5.4vw,88px)]">Cennik</h2>
        <div className="mt-10 grid grid-cols-[minmax(0,4fr)_minmax(0,7fr)] gap-16 max-lg:grid-cols-1 max-lg:gap-8">
          <p className="rise m-0 text-[24px] leading-snug">Odbiór w Oleśnicy lub we Wrocławiu. Bez limitu kilometrów.</p>
          <table className="bb-table rise">
            {TABLE.map((group) => (
              <tbody key={group.group}>
                <tr><th colSpan={2} scope="colgroup" className="bb-group">{group.group}</th></tr>
                {group.rows.map(([name, value]) => (
                  <tr key={name}><th scope="row">{name}</th><td><NumberTicker value={value} />{" zł"}</td></tr>
                ))}
              </tbody>
            ))}
            <tbody>
              <tr><th colSpan={2} scope="colgroup" className="bb-group">W cenie</th></tr>
              <tr><th scope="row">Limit kilometrów</th><td>brak</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      {REVIEWS.length > 0 ? (
        <section aria-label="Opinie" className="mt-32 px-(--gutter)">
          {REVIEWS.map((review) => (
            <blockquote key={review.name} className="m-0 max-w-[30em] text-[28px]">{review.quote}<footer className="mt-3 text-[18px]">{review.name}</footer></blockquote>
          ))}
        </section>
      ) : null}

      <section id="terminy" className="mt-32 px-(--gutter) max-md:mt-20">
        <h2 className="bb-display rise text-[clamp(34px,5.4vw,88px)]">Wybierz terminy</h2>
        <p className="mb-8 mt-5 max-w-[36em] text-[20px]">Wybierz dni odbioru i zwrotu. Zajęte dni pochodzą z kalendarza vana.<CalendarNote demo={demo} /></p>
        {booked ? <BookingTool booked={booked} summary="panel" /> : <p className="tool-surface p-6">Nie udało się wczytać kalendarza. Odśwież stronę za chwilę.</p>}
      </section>

      <section id="pytania" className="mt-32 px-(--gutter) max-md:mt-20">
        <div className="grid grid-cols-[minmax(0,7fr)_minmax(0,4fr)] gap-16 max-lg:grid-cols-1">
          <div>
            <h2 className="bb-display rise text-[clamp(34px,5.4vw,88px)]">Pytania i kontakt</h2>
            <Faq className="mt-8 columns-2 gap-12 max-md:columns-1" />
          </div>
          <div className="tool-surface self-start p-8 max-md:p-5">
            <h3 className="m-0 mb-3 text-[28px] font-bold">Napisz lub zadzwoń</h3>
            <p className="mb-5 mt-0 text-[18px]">Telefon: [numer]<br />E-mail: [adres]</p>
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="mt-32 px-(--gutter) pb-10 text-[18px]">
        <p className="bb-display m-0 text-[clamp(40px,8vw,120px)]">Wendrowan</p>
        <p className="mb-0 mt-5">Oleśnica, Wrocław. [Dane firmy] · [Regulamin] · [Polityka prywatności] · Zdjęcia: Unsplash.</p>
      </footer>
    </main>
  )
}
