import { TiltCard } from "@/components/ticket/tilt-card"
import { PRICES, zl } from "@/lib/pricing"

const ROWS = [
  ["Poza sezonem, za dobę", zl(PRICES.offSeason)],
  ["Opłata serwisowa, jednorazowo", zl(PRICES.serviceFee)],
  ["Kaucja", zl(PRICES.deposit)],
  ["Przedsionek, za dobę", zl(PRICES.tentPerDay)],
  ["Bagażniki na rowery, za dobę", zl(PRICES.racksPerDay)],
  ["Limit kilometrów", "brak"],
]

export function Pricing() {
  return (
    <section id="cennik" className="section px-(--gutter)">
      <TiltCard className="ticket notched rise grid grid-cols-[minmax(0,7fr)_minmax(0,3fr)] [--notch:70%] max-md:grid-cols-1">
        <div className="p-10 max-md:p-6">
          <h2 className="display section-title">Cennik</h2>
          <p className="mb-6 mt-2 text-[18px]">Sezon trwa od 1 maja do 30 września. Odbiór w Oleśnicy lub we Wrocławiu.</p>
          <dl className="m-0 grid grid-cols-2 gap-x-12 gap-y-2 max-lg:grid-cols-1">
            {ROWS.map(([name, value]) => (
              <div key={name} className="flex justify-between gap-4 text-[18px]">
                <dt>{name}</dt>
                <dd className="m-0 whitespace-nowrap font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="stub-edge flex flex-col justify-center gap-1 bg-lime p-8">
          <span className="display text-[clamp(64px,8vw,116px)] leading-none">{zl(PRICES.highSeason)}</span>
          <span className="text-[18px]">za dobę w sezonie</span>
        </div>
      </TiltCard>
    </section>
  )
}
