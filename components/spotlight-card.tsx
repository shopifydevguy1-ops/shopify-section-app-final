"use client"

import { useRef } from "react"
import { cn } from "@/lib/utils"

export function SpotlightCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)

  function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    const node = ref.current
    if (!node) return
    const rect = node.getBoundingClientRect()
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`)
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      className={cn("spotlight-card relative overflow-hidden rounded-[1.6rem]", className)}
    >
      <div className="relative z-10">{children}</div>
    </div>
  )
}
