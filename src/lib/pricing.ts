import { daysBetween, addDays, type IsoDate } from "@/lib/dates"

export const PRICES = {
  highSeason: 500,
  offSeason: 450,
  serviceFee: 200,
  deposit: 4000,
  tentPerDay: 100,
  racksPerDay: 50,
} as const

export type Extras = { tent: boolean; racks: boolean }

/** High season runs 1 May to 30 September. To confirm with the owner: how a rental crossing seasons is priced. */
export function dayRate(day: IsoDate): number {
  const month = Number(day.slice(5, 7))
  return month >= 5 && month <= 9 ? PRICES.highSeason : PRICES.offSeason
}

export type Quote = { days: number; rent: number; extras: number; total: number }

export function quote(start: IsoDate, end: IsoDate, extras: Extras): Quote {
  const days = daysBetween(start, end)
  let rent = 0
  for (let i = 0; i < days; i++) rent += dayRate(addDays(start, i))
  const extrasCost =
    (extras.tent ? PRICES.tentPerDay * days : 0) + (extras.racks ? PRICES.racksPerDay * days : 0)
  return { days, rent, extras: extrasCost, total: rent + PRICES.serviceFee + extrasCost }
}

export function zl(value: number): string {
  return `${String(value).replace(/\B(?=(\d{3})+$)/g, " ")} zł`
}
