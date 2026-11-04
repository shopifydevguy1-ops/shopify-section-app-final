import { cn } from "@/lib/utils"

export function SpotlightCard({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn("spotlight-card relative overflow-hidden rounded-[1.6rem]", className)}>
      <div className="relative z-10">{children}</div>
    </div>
  )
}
