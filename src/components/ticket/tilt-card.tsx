"use client"

import type { MouseEvent, ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

/** A ticket you can tip with the cursor, in the manner of Aceternity's 3D card. Written by hand: its source is not public. */
export function TiltCard({ className, children }: { className?: string; children: ReactNode }) {
  const reduced = useReducedMotion()
  const rotateX = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })
  const rotateY = useSpring(useMotionValue(0), { stiffness: 150, damping: 18 })

  function move(event: MouseEvent<HTMLDivElement>) {
    if (reduced) return
    const box = event.currentTarget.getBoundingClientRect()
    rotateY.set(((event.clientX - box.left) / box.width - 0.5) * 7)
    rotateX.set(((event.clientY - box.top) / box.height - 0.5) * -7)
  }

  function leave() {
    rotateX.set(0)
    rotateY.set(0)
  }

  return (
    <div style={{ perspective: 1400 }} onMouseMove={move} onMouseLeave={leave}>
      <motion.div className={className} style={{ rotateX, rotateY }}>
        {children}
      </motion.div>
    </div>
  )
}
