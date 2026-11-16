"use client"

import { useEffect, useRef } from "react"

import { PRICES } from "@/lib/pricing"

/**
 * The van film, scrubbed by scroll.
 *
 * One transparent render (955 frames at 30 fps): a full turn, the roof lifting, a turn to the back, the bike rack
 * appearing, a turn to the awning side, the awning unrolling and finally the tent. Scroll position maps to the
 * video's currentTime, eased so slow scrolling doesn't stutter between frames.
 *
 * Two files, because no single format carries alpha everywhere: VP9 alpha WebM for Chromium and Firefox,
 * HEVC alpha MOV for Safari (all of iOS is WebKit). Both are encoded with a keyframe every 6 frames, which is
 * what makes seeking cheap enough to scrub; a normal web encode (a keyframe every few seconds) can't.
 *
 * The captions are aligned to the render's own timeline (frame numbers at 30 fps, see CHAPTERS).
 */

const FRAMES = 955

/** First frame of each chapter in the render, and the copy shown while it plays. */
const CHAPTERS = [
  { from: 0, label: "Wokół", title: "Jeden van, z każdej strony", note: "Automat, 2.0 diesel, jazda do 5 osób" },
  { from: 185, label: "Dach", title: "Dach podnoszony", note: "4 miejsca do spania, układ 2×2" },
  { from: 395, label: "Rowery", title: "Rowery na klapie", note: "2 na klapie lub 4 na haku" },
  { from: 612, label: "Markiza", title: "Rozwijana markiza", note: "W standardzie, cień i miejsce przy vanie" },
  { from: 785, label: "Przedsionek", title: "Przedsionek 3×3 m", note: `Opcjonalnie, ${PRICES.tentPerDay} zł za dobę` },
] as const

const STARTS = CHAPTERS.map((chapter) => chapter.from / FRAMES)

/** Safari and every iOS browser are WebKit: they play the HEVC alpha file and not VP9 alpha. */
function pickSource() {
  const ua = navigator.userAgent
  const webkit = /safari/i.test(ua) && !/chrome|chromium|crios|fxios|edg|android/i.test(ua)
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  return webkit || ios ? "/van-video/van.mov" : "/van-video/van.webm"
}

export function VanSpin() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const stepRef = useRef<HTMLSpanElement>(null)
  const barsRef = useRef<HTMLDivElement>(null)
  const capsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const captions = Array.from(capsRef.current?.children ?? []) as HTMLElement[]
    const bars = Array.from(barsRef.current?.querySelectorAll<HTMLElement>("[data-fill]") ?? [])

    let visible = false
    let raf = 0
    let last = 0
    let current = -1
    let drawn = -1
    let chapter = -1

    function progress() {
      const rect = section!.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      return span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0
    }

    function paintUi(p: number) {
      let index = 0
      for (let i = 0; i < STARTS.length; i++) if (p >= STARTS[i]) index = i
      if (index !== chapter) {
        chapter = index
        if (stepRef.current) stepRef.current.textContent = String(index + 1).padStart(2, "0")
        captions.forEach((caption, i) => {
          const on = i === index
          caption.dataset.on = String(on)
          caption.querySelectorAll("a").forEach((link) => { link.tabIndex = on ? 0 : -1 })
        })
      }
      bars.forEach((bar, i) => {
        const end = i + 1 < STARTS.length ? STARTS[i + 1] : 1
        const fill = Math.min(1, Math.max(0, (p - STARTS[i]) / (end - STARTS[i])))
        bar.style.transform = `scaleX(${fill})`
      })
    }

    function tick(time: number) {
      raf = 0
      const dt = last ? Math.min(time - last, 64) : 16
      last = time
      const target = progress()
      if (current < 0) current = target
      // exponential easing toward the scroll position; time constant ≈ 90 ms
      current = reduce ? target : current + (target - current) * (1 - Math.exp(-dt / 90))
      if (Math.abs(target - current) < 0.0002) current = target

      if (current !== drawn) {
        const duration = video!.duration
        // seek in whole frames, and don't queue a new seek while the last one is still decoding
        const ready = video!.readyState >= 1 && Number.isFinite(duration) && duration > 0
        if (ready && !video!.seeking) {
          const frame = Math.round(current * (FRAMES - 1))
          const at = Math.min(duration - 0.001, (frame + 0.5) / FRAMES * duration)
          if (Math.abs(video!.currentTime - at) > 1e-4) video!.currentTime = at
          drawn = current
        }
        paintUi(current)
      }
      // keep going while easing or while a seek is pending; with no usable video (still loading, or failed)
      // wait for its events instead of spinning every frame
      const pending = current !== target || (drawn !== current && video!.readyState >= 1 && !video!.error)
      if (visible && pending) raf = requestAnimationFrame(tick)
      else last = 0
    }

    function wake() {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    // the right file for this browser, only once the section is a couple of screens away: it's ~8 MB
    // and scrubbing needs all of it, so it shouldn't compete with the hero at page load
    const near = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      near.disconnect()
      video.src = pickSource()
      video.load()
    }, { rootMargin: "250% 0px" })
    near.observe(section)

    // iOS won't buffer a video that has never played; a muted play/pause primes it (blocked in Low Power Mode, harmlessly)
    // (play() moves the playhead a little, so the frame is re-seeked afterwards)
    const prime = () => {
      video.play().then(() => {
        video.pause()
        drawn = -1
        wake()
      }, () => {})
    }
    video.addEventListener("loadedmetadata", prime, { once: true })
    video.addEventListener("loadedmetadata", wake)
    video.addEventListener("seeked", wake)
    video.addEventListener("loadeddata", wake)

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
    }, { rootMargin: "20% 0px" })
    onScreen.observe(section)

    // start at the current scroll position (after a reload mid-scroll) without easing in from the top
    paintUi(progress())
    window.addEventListener("scroll", wake, { passive: true })
    window.addEventListener("resize", wake)

    return () => {
      cancelAnimationFrame(raf)
      onScreen.disconnect()
      near.disconnect()
      video.removeEventListener("loadedmetadata", prime)
      video.removeEventListener("loadedmetadata", wake)
      video.removeEventListener("seeked", wake)
      video.removeEventListener("loadeddata", wake)
      window.removeEventListener("scroll", wake)
      window.removeEventListener("resize", wake)
    }
  }, [])

  return (
    <section ref={sectionRef} aria-label="Van z każdej strony" className="section relative h-[1500vh] max-md:h-[1100vh]">
      <div className="sticky top-0 isolate flex h-svh flex-col px-(--gutter) pt-[clamp(20px,5svh,56px)] pb-[clamp(16px,4svh,40px)] max-md:pb-[84px]">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display section-title">
            Obejdź go
            <br />
            dookoła
          </h2>
          <p aria-hidden="true" className="display m-0 text-[clamp(56px,9vw,136px)] leading-[.85] text-lime">
            <span ref={stepRef} className="inline-block min-w-[2ch] text-right tabular-nums">01</span>
            <span className="text-[.4em] text-paper/60">/0{CHAPTERS.length}</span>
          </p>
        </div>

        {/* the film fills the whole stage; the headline and captions sit over its empty corners */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          aria-label="Biały van z podnoszonym dachem: obrót, otwarcie dachu, bagażnik na rowery, markiza i przedsionek"
          role="img"
          className="absolute inset-0 -z-10 h-full w-full object-contain"
        />
        <div className="min-h-0 flex-1" />

        <div className="flex items-end justify-between gap-6">
          <ul ref={capsRef} className="relative m-0 h-[64px] min-w-0 flex-1 list-none p-0">
            {CHAPTERS.map((caption, index) => (
              <li key={caption.title} data-on={index === 0 ? "true" : "false"} className="spin-cap">
                <strong className="block text-[24px] font-semibold leading-tight">{caption.title}</strong>
                <span className="text-[18px] opacity-80">
                  {caption.note}
                  {index === CHAPTERS.length - 1 && <> · <a href="#van" tabIndex={index === 0 ? 0 : -1} className="underline underline-offset-4">dodaj do biletu</a></>}
                </span>
              </li>
            ))}
          </ul>
          <p className="m-0 shrink-0 text-[16px] opacity-80 max-md:hidden">Przewijaj, żeby zobaczyć dalej</p>
        </div>
        <div ref={barsRef} className="mt-4 flex gap-1.5" aria-hidden="true">
          {CHAPTERS.map((chapter) => (
            <div key={chapter.label} className="min-w-0 flex-1">
              <div className="h-[6px] bg-moss">
                <div data-fill className="h-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
              </div>
              <span className="mt-1.5 block truncate text-[13px] uppercase tracking-wide opacity-70 max-md:hidden">{chapter.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
