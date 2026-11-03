"use client"

import Image from "next/image"
import { useEffect, useState } from "react"

import ScrollExpand from "@/components/reactbits/ScrollExpand"
import { useTicket } from "@/components/ticket/ticket-context"
import { GALLERY, VAN_ROWS } from "@/lib/content"
import { PRICES } from "@/lib/pricing"

export function Opening() {
  const { destination } = useTicket()
  const going = destination.trim()
  const [live, setLive] = useState(false)

  useEffect(() => {
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setLive(true)
  }, [])

  return (
    <section aria-label="Droga" className={`scene mt-16 ${live ? "is-live" : ""}`}>
      <ScrollExpand
        src="/photos/sunset-popup.jpg"
        alt="Van z podniesionym dachem na plaży o zachodzie słońca"
        useWindowScroll
        startWidth={76}
        startHeight={78}
        startRadius={0}
        endRadius={0}
        mediaZoom={1.15}
        scrollDistance={1}
        holdDistance={0.25}
        overlayScrim={0.5}
        title=""
      >
        <p className="display m-0 text-[clamp(44px,8vw,120px)] leading-[.92] text-white">{going ? `Kierunek: ${going}` : "Reszta trasy jest twoja"}</p>
      </ScrollExpand>
    </section>
  )
}

export function Van() {
  const { extras, toggleExtra } = useTicket()
  const addons = [
    { key: "tent", name: "Przedsionek 3×3 m", price: PRICES.tentPerDay },
    { key: "racks", name: "Bagażnik: 2 rowery na klapie lub 4 na haku", price: PRICES.racksPerDay },
  ] as const

  return (
    <section id="van" className="section grid grid-cols-[minmax(0,5fr)_minmax(0,7fr)] items-start gap-10 px-(--gutter) max-lg:grid-cols-1">
      <div className="sheet rise p-10 text-ink max-md:p-6">
        <h2 className="display section-title">Co jest w bilecie</h2>
        {VAN_ROWS.map((group) => (
          <div key={group.group} className="mt-7">
            <h3 className="m-0 mb-2 text-[24px] font-semibold">{group.group}</h3>
            {group.items.map(([name, value]) => (
              <div key={name} className="leader">
                <span>{name}</span>
                <i aria-hidden="true" />
                <span className="shrink-0">{value}</span>
              </div>
            ))}
          </div>
        ))}
        <h3 className="m-0 mb-2 mt-7 text-[24px] font-semibold">Dodaj do biletu</h3>
        {addons.map((addon) => (
          <label key={addon.key} className="addon">
            <input type="checkbox" checked={extras[addon.key]} onChange={() => toggleExtra(addon.key)} />
            <span>{addon.name}</span>
            <span className="ml-auto shrink-0 tabular-nums">{addon.price} zł/doba</span>
          </label>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {GALLERY.map((photo, index) => (
          <figure key={photo.src} className={`tile rise m-0 ${index % 2 ? "mt-16 max-md:mt-0" : ""}`}>
            <div className="relative aspect-[4/5]">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover" style={{ objectPosition: photo.pos }} />
            </div>
            <figcaption className={`tone-${photo.tone} flex justify-between gap-2 px-3 py-2.5 text-[16px] font-medium`}>
              <span>{photo.a}</span>
              <span>{photo.b}</span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
