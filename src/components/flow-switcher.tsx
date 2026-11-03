import Link from "next/link"

import { cn } from "@/lib/utils"

export const FLOWS = [
  { id: "google", label: "Google Calendar" },
  { id: "caldiy", label: "cal.diy" },
] as const

export type FlowId = (typeof FLOWS)[number]["id"]

export function parseFlow(value: string | string[] | undefined): FlowId {
  return FLOWS.some((flow) => flow.id === value) ? (value as FlowId) : "google"
}

/** Links rather than client state, so each flow has a shareable URL. */
export function FlowSwitcher({ active }: { active: FlowId }) {
  return (
    <nav
      aria-label="Booking flow"
      className="inline-flex rounded-lg bg-muted p-[3px] text-sm font-medium"
    >
      {FLOWS.map((flow) => (
        <Link
          key={flow.id}
          href={`/?flow=${flow.id}`}
          scroll={false}
          aria-current={flow.id === active ? "page" : undefined}
          className={cn(
            "rounded-md px-3 py-1 text-foreground/60 transition-colors hover:text-foreground",
            flow.id === active && "bg-background text-foreground shadow-sm"
          )}
        >
          {flow.label}
        </Link>
      ))}
    </nav>
  )
}
