export const DESTINATIONS = ["MAZURY", "BIESZCZADY", "BAŁTYK", "KARKONOSZE", "TATRY", "ROZTOCZE"]

export const VAN_ROWS = [
  { group: "Van", items: [["Skrzynia", "automat"], ["Silnik", "2.0 diesel"], ["Jazda", "do 5 osób"], ["Spanie", "4 osoby, układ 2×2"], ["Dach", "podnoszony"], ["Markiza", "rozwijana"], ["Hak", "holowniczy"]] },
  { group: "W środku i obok", items: [["Lodówka", "w cenie"], ["Kuchenka", "w cenie"], ["Przenośna toaleta", "w cenie"], ["Stacja ładowania 12V + 220V", "w cenie"], ["Stolik, 2 krzesła, 2 stołki", "w cenie"]] },
] as const

export const GALLERY = [
  { src: "/photos/open-vans-forest.jpg", alt: "Otwarte klapy vanów z pościelą, w lesie", a: "Spanie", b: "2×2", tone: "lime", pos: "50% 60%" },
  { src: "/photos/kettle-grass.jpg", alt: "Czajnik na kuchence turystycznej i kubek na trawie", a: "Kuchnia", b: "na zewnątrz", tone: "paper", pos: "50% 60%" },
  { src: "/photos/interior-lights.jpg", alt: "Wnętrze vana z widokiem na las", a: "Wnętrze", b: "wieczorem", tone: "ink", pos: "50% 50%" },
  { src: "/photos/mountain-grey-van.jpg", alt: "Van na drodze pod górskim szczytem", a: "Trasa", b: "bez limitu", tone: "moss", pos: "50% 62%" },
] as const

export const FAQ = [
  ["Czy jest limit kilometrów?", "Nie. Jedziesz tak daleko, jak chcesz."],
  ["Czy formularz to już rezerwacja?", "Nie. Wysyłasz zapytanie, a termin potwierdza właściciel."],
  ["Co dzieje się po wysłaniu?", "Właściciel odpisuje mailem lub dzwoni. Po potwierdzeniu oznacza termin jako zajęty."],
  ["Skąd odbieram vana?", "Z Oleśnicy lub Wrocławia."],
  ["Ile wynosi kaucja?", "4000 zł."],
  ["Jaki jest minimalny wynajem?", "[do potwierdzenia, na razie 2 doby]"],
  ["O której odbiór i zwrot?", "[do potwierdzenia]"],
  ["Czy mogę wyjechać za granicę?", "[do potwierdzenia]"],
  ["Czy mogę zabrać psa?", "[do potwierdzenia]"],
  ["Czy mogę palić w vanie?", "[do potwierdzenia]"],
  ["Czy van nadaje się na festiwal?", "[do potwierdzenia]"],
  ["Czy są garnki i naczynia?", "[do potwierdzenia]"],
] as const

/** Real reviews only, used with the renter's permission. The section stays hidden while this is empty. */
export const REVIEWS: { quote: string; name: string }[] = []

export const FACTS = ["Bez limitu kilometrów", "Cztery miejsca do spania", "Lodówka i kuchenka", "Prąd 12V + 220V", "Rowery na klapie lub haku", "Odbiór w Oleśnicy lub we Wrocławiu"]
