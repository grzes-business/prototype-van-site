"use client"

import { useEffect, useRef } from "react"

/**
 * The van turns a full circle as you scroll past.
 *
 * The source is a transparent 1920×1080 VP9 webm (720 frames, soft ground shadow in its alpha).
 * Scrubbing a <video> on scroll is choppy (seeks land on keyframes), and Safari can't play VP9 alpha
 * at all, so every 3rd frame was extracted to transparent WebP stills in /public/van360/{lg,sm}
 * (1600 / 800 px wide) and is drawn to a canvas instead. The drawn
 * position eases toward the scroll position, and neighbouring frames are cross-faded, so slow
 * scrolling stays smooth between frames.
 */

const COUNT = 240
const FRAME_W = 1600
const FRAME_H = 734
/** The van itself spans ~80% of the frame width; the rest is its soft ground shadow, feathered to 0 at the edges. */
const VAN_SHARE = 0.82

const CAPTIONS = [
  { from: 0.07, to: 0.3, title: "Dach podnoszony", note: "4 miejsca do spania, układ 2×2" },
  { from: 0.34, to: 0.56, title: "Automat, 2.0 diesel", note: "jazda do 5 osób" },
  { from: 0.6, to: 0.82, title: "Rowery na klapie", note: "2 na klapie lub 4 na haku" },
] as const

const frameSrc = (set: "lg" | "sm", index: number) => `/van360/${set}/${String(index).padStart(3, "0")}.webp`

/** Coarse to fine (every 32nd frame, then every 16th…), so the whole turn scrubs early and fills in. */
function loadOrder(count: number) {
  const order: number[] = []
  const seen = new Set<number>()
  for (let step = 32; step >= 1; step /= 2) {
    for (let index = 0; index < count; index += step) {
      if (!seen.has(index)) {
        seen.add(index)
        order.push(index)
      }
    }
  }
  return order
}

export function VanSpin() {
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const degRef = useRef<HTMLSpanElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const capsRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!section || !canvas || !ctx) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const set = canvas.clientWidth * dpr > 1000 ? "lg" : "sm"
    const frames: (HTMLImageElement | null)[] = new Array(COUNT).fill(null)
    const captions = Array.from(capsRef.current?.children ?? []) as HTMLElement[]

    let cancelled = false
    let loading = false
    let visible = false
    let raf = 0
    let last = 0
    let current = 0
    let drawn = -1
    let dirty = true

    /** Nearest loaded frame, wrapping around: it's a full circle, so frame 0 neighbours frame 239. */
    function nearest(index: number) {
      if (frames[index]) return index
      for (let distance = 1; distance < COUNT; distance++) {
        const before = (index - distance + COUNT) % COUNT
        if (frames[before]) return before
        const after = (index + distance) % COUNT
        if (frames[after]) return after
      }
      return -1
    }

    function resize() {
      const width = Math.round(canvas!.clientWidth * dpr)
      const height = Math.round(canvas!.clientHeight * dpr)
      if (canvas!.width !== width || canvas!.height !== height) {
        canvas!.width = width
        canvas!.height = height
        dirty = true
        wake()
      }
    }

    function draw(position: number) {
      const { width, height } = canvas!
      ctx!.clearRect(0, 0, width, height)
      const base = Math.floor(position)
      const a = nearest(base)
      if (a < 0) return

      // fit the van (not the whole frame) in the canvas; the faded shadow may run past the edges
      const scale = Math.min(width / (FRAME_W * VAN_SHARE), height / FRAME_H)
      const w = FRAME_W * scale
      const h = FRAME_H * scale
      const x = (width - w) / 2
      const y = (height - h) / 2

      ctx!.imageSmoothingQuality = "high"
      ctx!.globalAlpha = 1
      ctx!.drawImage(frames[a]!, x, y, w, h)

      // cross-fade toward the next frame for sub-frame positions
      const next = base + 1
      const fraction = position - base
      if (a === base && fraction > 0.02 && next < COUNT && frames[next]) {
        ctx!.globalAlpha = fraction
        ctx!.drawImage(frames[next]!, x, y, w, h)
        ctx!.globalAlpha = 1
      }
    }

    function progress() {
      const rect = section!.getBoundingClientRect()
      const span = rect.height - window.innerHeight
      return span > 0 ? Math.min(1, Math.max(0, -rect.top / span)) : 0
    }

    function paintUi(position: number) {
      const p = position / (COUNT - 1)
      if (degRef.current) degRef.current.textContent = String(Math.round(p * 360))
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`
      captions.forEach((caption, index) => {
        const on = p >= CAPTIONS[index].from && p <= CAPTIONS[index].to
        if (caption.dataset.on !== String(on)) caption.dataset.on = String(on)
      })
    }

    function tick(time: number) {
      raf = 0
      const dt = last ? Math.min(time - last, 64) : 16
      last = time
      const target = progress() * (COUNT - 1)
      // exponential easing toward the scroll position; time constant ≈ 110 ms
      current = reduce ? target : current + (target - current) * (1 - Math.exp(-dt / 110))
      if (Math.abs(target - current) < 0.01) current = target

      if (dirty || current !== drawn) {
        draw(current)
        paintUi(current)
        drawn = current
        dirty = false
      }
      // keep animating while easing; otherwise sleep until the next scroll/resize/frame load
      if (visible && current !== target) raf = requestAnimationFrame(tick)
      else last = 0
    }

    function wake() {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    function startLoading() {
      if (loading) return
      loading = true
      const queue = loadOrder(COUNT)
      const worker = async () => {
        while (!cancelled && queue.length) {
          const index = queue.shift()!
          const image = new Image()
          image.decoding = "async"
          image.src = frameSrc(set, index)
          try {
            await image.decode()
          } catch {
            continue
          }
          if (cancelled) return
          frames[index] = image
          dirty = true
          wake()
        }
      }
      for (let i = 0; i < 6; i++) void worker()
    }

    // first frame right away, so the section never shows an empty stage
    const first = new Image()
    first.src = frameSrc(set, 0)
    first.decode().then(() => {
      if (cancelled) return
      frames[0] ??= first
      // start where the page already is (e.g. after a reload mid-scroll), without easing in from 0
      current = progress() * (COUNT - 1)
      draw(current)
      paintUi(current)
      drawn = current
      dirty = false
    }, () => {})

    // load the rest once the section is within a couple of screens
    const near = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startLoading()
        near.disconnect()
      }
    }, { rootMargin: "200% 0px" })
    near.observe(section)

    const onScreen = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) wake()
    })
    onScreen.observe(section)

    const sizer = new ResizeObserver(resize)
    sizer.observe(canvas)
    resize()

    window.addEventListener("scroll", wake, { passive: true })

    return () => {
      cancelled = true
      cancelAnimationFrame(raf)
      near.disconnect()
      onScreen.disconnect()
      sizer.disconnect()
      window.removeEventListener("scroll", wake)
    }
  }, [])

  return (
    <section ref={sectionRef} aria-label="Van z każdej strony" className="section relative h-[320vh] max-md:h-[260vh]">
      <div className="sticky top-0 flex h-svh flex-col px-(--gutter) pt-[clamp(20px,5svh,56px)] pb-[clamp(16px,4svh,40px)] max-md:pb-[84px]">
        <div className="flex items-end justify-between gap-6">
          <h2 className="display section-title">
            Obejdź go
            <br />
            dookoła
          </h2>
          <p aria-hidden="true" className="display m-0 text-[clamp(56px,9vw,136px)] leading-[.85] text-lime">
            <span ref={degRef} className="inline-block min-w-[2.4ch] text-right tabular-nums">0</span>°
          </p>
        </div>

        <div className="relative -mx-(--gutter) min-h-0 flex-1">
          <canvas
            ref={canvasRef}
            role="img"
            aria-label="Biały van z podnoszonym dachem, obracający się o 360 stopni"
            className="absolute inset-0 h-full w-full"
          />
        </div>

        <div className="flex items-end justify-between gap-6">
          <ul ref={capsRef} className="relative m-0 h-[64px] min-w-0 flex-1 list-none p-0">
            {CAPTIONS.map((caption) => (
              <li key={caption.title} data-on="false" className="spin-cap">
                <strong className="block text-[24px] font-semibold leading-tight">{caption.title}</strong>
                <span className="text-[18px] opacity-80">{caption.note}</span>
              </li>
            ))}
          </ul>
          <p className="m-0 shrink-0 text-[16px] opacity-80 max-md:hidden">Przewijaj, żeby obrócić</p>
        </div>
        <div className="mt-4 h-[6px] bg-moss">
          <div ref={barRef} className="h-full origin-left bg-lime" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  )
}
