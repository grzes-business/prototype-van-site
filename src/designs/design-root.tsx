"use client"

import { useEffect, useState } from "react"

import { TicketProvider } from "@/components/ticket/ticket-context"
import { DESIGNS } from "@/designs/list"
import type { DesignProps } from "@/designs/registry"

const KEY = "wendrowan-design"

/** One page, several designs. The picker in the corner swaps them; dates, extras and destination survive the swap. */
export function DesignRoot(props: DesignProps) {
  const [id, setId] = useState(DESIGNS[0].id)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let wanted: string | null = new URLSearchParams(window.location.search).get("d")
    if (!wanted) {
      try {
        wanted = window.localStorage.getItem(KEY)
      } catch {
        wanted = null
      }
    }
    if (wanted && DESIGNS.some((design) => design.id === wanted)) setId(wanted)
  }, [])

  function choose(next: string) {
    setId(next)
    setOpen(false)
    try {
      window.localStorage.setItem(KEY, next)
    } catch {}
    const url = new URL(window.location.href)
    url.searchParams.set("d", next)
    window.history.replaceState(null, "", url)
    window.scrollTo({ top: 0, behavior: "instant" })
  }

  const current = DESIGNS.find((design) => design.id === id) ?? DESIGNS[0]
  const Design = current.Component

  return (
    <TicketProvider>
      <div key={current.id} data-design={current.id} className="design-enter">
        <Design {...props} />
      </div>
      <div data-ui className="picker fixed bottom-4 left-4 z-50">
        {open ? (
          <ul role="listbox" aria-label="Wybierz projekt" className="picker-list m-0 mb-2 list-none p-0">
            {DESIGNS.map((design) => (
              <li key={design.id}>
                <button type="button" role="option" aria-selected={design.id === current.id} onClick={() => choose(design.id)}>
                  <strong>{design.label}</strong>
                  <span>{design.note}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button type="button" className="picker-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Projekt: {current.label}
        </button>
      </div>
    </TicketProvider>
  )
}
