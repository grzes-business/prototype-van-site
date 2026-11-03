import { FlowSwitcher, parseFlow } from "@/components/flow-switcher"
import { CalDiyFlow } from "@/components/flows/caldiy-flow"
import { GoogleCalendarFlow } from "@/components/flows/google-calendar-flow"

export default async function Prototype({ searchParams }: PageProps<"/prototyp">) {
  const flow = parseFlow((await searchParams).flow)

  return (
    <main className="relative flex min-h-svh flex-col bg-white">
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <FlowSwitcher active={flow} />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pt-24 pb-16">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-muted-foreground">Volkswagen California</p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Rent our camper van
          </h1>
        </div>

        {flow === "google" ? <GoogleCalendarFlow /> : <CalDiyFlow />}
      </section>
    </main>
  )
}
