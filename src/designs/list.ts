import type { DesignEntry } from "@/designs/registry"
import { TicketDesign } from "@/designs/ticket/ticket-design"

// Only the ticket is live. The other designs (trip, split, name, barebone) still live in src/designs/;
// import them here again to bring them back into the picker.
export const DESIGNS: DesignEntry[] = [
  { id: "ticket", label: "Bilet", note: "Cel wpisujesz sam", Component: TicketDesign },
]
