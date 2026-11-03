import type { DesignEntry } from "@/designs/registry"
import { BareboneDesign } from "@/designs/barebone/barebone-design"
import { NameDesign } from "@/designs/name/name-design"
import { SplitDesign } from "@/designs/split/split-design"
import { TripDesign } from "@/designs/trip/trip-design"
import { TicketDesign } from "@/designs/ticket/ticket-design"

export const DESIGNS: DesignEntry[] = [
  { id: "ticket", label: "Bilet", note: "Cel wpisujesz sam", Component: TicketDesign },
  { id: "trip", label: "Wyprawa", note: "Dzień na trasie", Component: TripDesign },
  { id: "split", label: "Van", note: "Rysunek z częściami", Component: SplitDesign },
  { id: "name", label: "Nazwa", note: "Wędrować, tylko vanem", Component: NameDesign },
  { id: "barebone", label: "Goły", note: "Dziennik, same fakty", Component: BareboneDesign },
]
