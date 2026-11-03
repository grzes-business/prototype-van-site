export function Footer() {
  return (
    <footer className="mt-[120px] px-(--gutter) pb-6 max-md:mt-20">
      <div className="sheet-top bg-paper px-10 pb-8 pt-14 text-ink max-md:px-5">
        <div className="flex flex-wrap justify-between gap-6 text-[18px]">
          <p className="m-0 max-w-[26em]">Bilet ważny na jeden van, w terminie potwierdzonym przez właściciela.</p>
          <p className="m-0">[Dane firmy]<br />[Regulamin] · [Polityka prywatności]</p>
          <nav aria-label="Stopka" className="flex flex-col"><a href="#van">Van</a><a href="#cennik">Cennik</a><a href="#terminy">Terminy</a></nav>
        </div>
        <svg viewBox="0 0 1000 200" role="img" aria-label="Wendrowan" className="mt-10 block w-full overflow-visible">
          <text x="0" y="178" textLength="1000" lengthAdjust="spacingAndGlyphs" fontSize="236" fontWeight="800" fill="currentColor" style={{ fontFamily: "var(--font-display)" }}>WENDROWAN</text>
        </svg>
        <p className="mb-0 mt-4 text-[16px]">© 2026 Wendrowan. Oleśnica i Wrocław. Zdjęcia: Unsplash.</p>
      </div>
    </footer>
  )
}
