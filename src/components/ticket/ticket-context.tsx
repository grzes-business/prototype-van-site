"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

import { quote, type Extras, type Quote } from "@/lib/pricing"

type Ticket = {
  destination: string
  setDestination: (value: string) => void
  extras: Extras
  toggleExtra: (key: keyof Extras) => void
  start: string
  end: string
  setDates: (start: string, end: string) => void
  estimate: Quote | null
}

const TicketContext = createContext<Ticket | null>(null)

export function TicketProvider({ children }: { children: ReactNode }) {
  const [destination, setDestination] = useState("")
  const [extras, setExtras] = useState<Extras>({ tent: false, racks: false })
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")

  const value = useMemo<Ticket>(
    () => ({
      destination,
      setDestination,
      extras,
      toggleExtra: (key) => setExtras((current) => ({ ...current, [key]: !current[key] })),
      start,
      end,
      setDates: (nextStart, nextEnd) => {
        setStart(nextStart)
        setEnd(nextEnd)
      },
      estimate: start && end ? quote(start, end, extras) : null,
    }),
    [destination, extras, start, end]
  )

  return <TicketContext.Provider value={value}>{children}</TicketContext.Provider>
}

export function useTicket() {
  const ticket = useContext(TicketContext)
  if (!ticket) throw new Error("useTicket must be used inside TicketProvider")
  return ticket
}
