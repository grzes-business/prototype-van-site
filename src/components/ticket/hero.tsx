"use client"

import Image from "next/image"

import CircularText from "@/components/reactbits/CircularText"
import SplitFlapText from "@/components/reactbits/SplitFlapText"
import { useTicket } from "@/components/ticket/ticket-context"
import { DESTINATIONS } from "@/lib/content"

export function Hero() {
  const { destination, setDestination } = useTicket()
  const typed = destination.trim().toLocaleUpperCase("pl-PL").slice(0, 13)

  return (
    <header id="top" className="relative">
      <div className="hero-box relative overflow-hidden">
        <Image
          src="/photos/dusk-popup.jpg"
          alt="Van z podniesionym dachem nad jeziorem o zmierzchu"
          fill
          priority
          sizes="100vw"
          className="hero-drift object-cover object-[50%_100%] brightness-[.72]"
        />
        <nav aria-label="Główna" className="relative z-10 flex items-center justify-between px-(--gutter) py-5 text-paper">
          <a href="#top" className="display text-[28px] leading-none">Wendrowan</a>
          <div className="flex gap-7 text-[18px] max-md:hidden">
            <a href="#van">Van</a>
            <a href="#cennik">Cennik</a>
            <a href="#pytania">Pytania</a>
          </div>
          <a href="#terminy" className="text-[18px] font-semibold text-lime">Terminy</a>
        </nav>
        <div className="relative z-10 px-(--gutter) pt-1 max-md:pt-5">
          <h1 className="display hero-title text-paper">
            <span className="mask-line"><span>Bilet na vana.</span></span>
            <span className="mask-line"><span className="delay">Cel wpisujesz sam.</span></span>
          </h1>
        </div>
      </div>

      <div className="relative z-20 -mt-[150px] px-(--gutter) max-md:-mt-[120px]">
        <div className="ticket notched notch-lg [--notch:calc(100%-263px)] grid grid-cols-[minmax(0,1fr)_260px] max-lg:grid-cols-1">
          <div className="flex min-w-0 flex-col gap-5 p-8 max-md:p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-3 max-md:grid-cols-1 max-md:gap-y-1">
              <span className="field-label max-md:hidden">Z</span>
              <span className="display text-[44px] leading-none max-md:text-[34px]"><span className="md:hidden">Z </span>Oleśnica lub Wrocław</span>
              <span className="field-label max-md:mt-2">Do</span>
              <div className="flap min-w-0 overflow-hidden">
                <SplitFlapText
                  words={DESTINATIONS}
                  text={typed || undefined}
                  charset="polish"
                  padTo={13}
                  gap={3}
                  tileRadius={2}
                  tileColor="#0f1f10"
                  textColor="#c6f19d"
                  tileStyle="board"
                  depth={0}
                  flipDuration={0.09}
                  stagger={0.03}
                  flipsPerChar={5}
                  cycleDelay={2600}
                  aria-live="off"
                  style={{ "--split-flap-font-size": "var(--flap)" }}
                />
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-4">
              <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
                <span className="text-[16px] font-medium">Dokąd jedziesz?</span>
                <input
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  maxLength={13}
                  placeholder="Wpisz swój cel"
                  className="h-[52px] border-2 border-ink bg-transparent px-3 text-[18px] outline-none focus:bg-white"
                />
              </label>
              <a href="#van" className="btn btn-ink">Zobacz vana</a>
            </div>
            <p className="m-0 max-w-[46em] text-[18px] leading-snug">
              Wendrowan to van z podnoszonym dachem do wynajęcia. Jeden van, cztery miejsca do spania
              i trasa, którą wybierasz sam.
            </p>
          </div>
          <div className="stub-edge relative flex items-center justify-center bg-lime p-6 max-lg:hidden">
            <CircularText
              text="BEZ LIMITU KILOMETRÓW • BEZ LIMITU KILOMETRÓW • "
              size={190}
              fontSize={16}
              fontWeight={700}
              spinDuration={26}
              onHover="slowDown"
              color="#0f1f10"
            >
              <span className="display text-[44px] leading-none">1 van</span>
            </CircularText>
          </div>
        </div>
      </div>
    </header>
  )
}
