"use client"

import { useEffect, useState } from "react"
import { LayoutGrid, Loader2, Monitor, Search, Smartphone, Sparkles } from "lucide-react"
import { SpotlightCard } from "@/components/spotlight-card"
import { Input } from "@/components/ui/input"
import type { LibraryImage } from "@/lib/section-library"

type CategoryCount = { category: string; count: number }

type Props = {
  onPick: (image: LibraryImage) => void
  busy?: boolean
}

export function SectionCatalog({ onPick, busy = false }: Props) {
  const [items, setItems] = useState<LibraryImage[]>([])
  const [categories, setCategories] = useState<CategoryCount[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("Hero")
  const [variant, setVariant] = useState<"desktop" | "mobile">("desktop")

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        if (!query.trim() && category !== "All") params.set("category", category)
        params.set("limit", "240")
        const response = await fetch(`/api/library?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Could not load sections")
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(Number(data.total) || 0)
        if (Array.isArray(data.categories) && data.categories.length > 0) {
          setCategories(data.categories)
          if (!data.categories.some((entry: CategoryCount) => entry.category === category)) {
            setCategory(data.categories[0].category)
          }
        }
      } catch (error) {
        if ((error as Error).name !== "AbortError") setItems([])
      } finally {
        setLoading(false)
      }
    }, 160)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query, category])

  return (
    <SpotlightCard>
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <LayoutGrid className="h-4 w-4 text-amber-300" />
              Section catalog
            </div>
            <p className="mt-1 text-sm text-white/55">
              Browse ready section types. Pick one to generate its Liquid code with the matching preview.
            </p>
          </div>
          <span className="text-xs text-white/40">{total} total</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategory("All")}
            className={`rounded-full border px-3 py-1.5 text-xs transition ${
              category === "All"
                ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205]"
                : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25"
            }`}
          >
            All
          </button>
          {categories.map((entry) => (
            <button
              key={entry.category}
              type="button"
              onClick={() => {
                setQuery("")
                setCategory(entry.category)
              }}
              className={`rounded-full border px-3 py-1.5 text-xs transition ${
                category === entry.category
                  ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205]"
                  : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25"
              }`}
            >
              {entry.category}
              <span className="ml-1 opacity-70">{entry.count}</span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={variant === "desktop"}
            onClick={() => setVariant("desktop")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              variant === "desktop"
                ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                : "border-amber-100/10 text-white/60"
            }`}
          >
            <Monitor className="h-3.5 w-3.5" />
            Desktop
          </button>
          <button
            type="button"
            aria-pressed={variant === "mobile"}
            onClick={() => setVariant("mobile")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              variant === "mobile"
                ? "border-amber-300/40 bg-amber-300/10 text-amber-100"
                : "border-amber-100/10 text-white/60"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search sections"
              className="border-amber-100/10 bg-white/[0.04] pl-9 text-white placeholder:text-white/35 focus-visible:ring-amber-300/70 focus-visible:ring-offset-0"
              aria-label="Search sections"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[320px] items-center justify-center text-sm text-white/50">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading sections…
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-amber-100/10 px-4 text-center text-sm text-white/50">
            No sections in this category.
          </div>
        ) : (
          <ul className="grid max-h-[560px] grid-cols-1 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
            {items.map((image) => {
              const preview = variant === "mobile" ? image.mobileUrl || image.desktopUrl : image.desktopUrl
              return (
                <li key={image.id}>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onPick(image)}
                    className="group w-full overflow-hidden rounded-2xl border border-amber-100/10 bg-black/20 text-left transition hover:border-amber-200/30 disabled:opacity-60"
                  >
                    <img
                      src={preview}
                      alt={image.label}
                      loading="lazy"
                      className={`w-full bg-black/40 object-cover object-top ${
                        variant === "mobile" ? "aspect-[9/14]" : "aspect-[16/10]"
                      }`}
                    />
                    <div className="flex items-center justify-between gap-2 px-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">{image.label}</p>
                        <p className="text-xs text-white/45">{image.category}</p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-300/15 px-2.5 py-1 text-[11px] font-medium text-amber-100">
                        <Sparkles className="h-3 w-3" />
                        Generate
                      </span>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </SpotlightCard>
  )
}
