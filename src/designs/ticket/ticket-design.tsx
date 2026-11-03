"use client"

import { Marquee } from "@/components/magicui/marquee"
import { Booking } from "@/components/ticket/booking"
import { Footer } from "@/components/ticket/footer"
import { Hero } from "@/components/ticket/hero"
import { Pricing } from "@/components/ticket/pricing"
import { Questions } from "@/components/ticket/questions"
import { FloatingStub } from "@/components/ticket/stub"
import { Opening, Van } from "@/components/ticket/van"
import type { DesignProps } from "@/designs/registry"
import { REVIEWS } from "@/lib/content"

const FACTS = ["Bez limitu kilometrów", "Cztery miejsca do spania", "Lodówka i kuchenka", "Prąd 12V + 220V", "Rowery na klapie lub haku", "Odbiór w Oleśnicy lub we Wrocławiu"]

export function TicketDesign({ booked, demo }: DesignProps) {
  return (
    <>
      <main className="min-h-svh overflow-x-clip bg-forest text-paper">
        <Hero />
        <div className="mt-12 bg-lime text-ink">
          <Marquee className="p-0 py-3 [--duration:36s] [--gap:3rem]" pauseOnHover>
            {FACTS.map((fact) => (
              <span key={fact} className="whitespace-nowrap text-[18px] font-medium">{fact}</span>
            ))}
          </Marquee>
        </div>
        <Opening />
        <Van />
        <Pricing />
        {REVIEWS.length > 0 && (
          <section aria-label="Opinie" className="section px-(--gutter)">
            {REVIEWS.map((review) => (
              <blockquote key={review.name} className="m-0 max-w-[34em] text-[28px]">
                {review.quote}
                <footer className="mt-3 text-[17px]">{review.name}</footer>
              </blockquote>
            ))}
          </section>
        )}
        <Booking booked={booked} demo={demo} />
        <Questions />
        <Footer />
      </main>
      <FloatingStub />
    </>
  )
}
