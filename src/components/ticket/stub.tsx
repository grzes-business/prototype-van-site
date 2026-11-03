"use client"

import { useEffect, useState } from "react"

import { useTicket } from "@/components/ticket/ticket-context"
import { zl } from "@/lib/pricing"

/** The ticket stays with you while you scroll, and leaves once the full ticket is on screen. */
export function FloatingStub() {
  const { destination, extras, estimate } = useTicket()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const update = () => {
      const booking = document.querySelector('aside[aria-label="Twój bilet"]')?.getBoundingClientRect()
      const past = window.scrollY > 760
      const atBooking = booking ? booking.top < window.innerHeight * 0.92 : false
      setShow(past && !atBooking)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  }, [])

  const stamp = `${destination}|${extras.tent}|${extras.racks}`
  const added = [extras.tent && "przedsionek", extras.racks && "bagażniki"].filter(Boolean).join(", ")

  return (
    <a
      href="#terminy"
      aria-label="Przejdź do swojego biletu"
      data-show={show}
      className="float-stub fixed bottom-4 right-4 z-40 flex items-center gap-4 bg-lime px-4 py-3 text-ink no-underline max-md:inset-x-3 max-md:bottom-3"
    >
      <span key={stamp} className="stub-bump flex min-w-0 flex-1 items-center gap-4">
      <span className="min-w-0 truncate text-[16px]">
        <strong className="font-semibold">Do: {destination || "wpisz cel"}</strong>
        {added ? ` · ${added}` : ""}
      </span>
      <span className="ml-auto shrink-0 font-semibold">{estimate ? zl(estimate.total) : "Wybierz terminy"}</span>
      </span>
    </a>
  )
}
