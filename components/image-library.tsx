"use client"

import { useEffect, useMemo, useState } from "react"
import { Check, ImagePlus, Loader2, Monitor, Search, Smartphone } from "lucide-react"
import { SpotlightCard } from "@/components/spotlight-card"
import { Input } from "@/components/ui/input"
import type { LibraryImage } from "@/lib/section-library"

type Props = {
  selectedUrls: string[]
  onToggle: (image: LibraryImage, variant: "desktop" | "mobile") => void
  queryHint?: string
}

export function ImageLibrary({ selectedUrls, onToggle, queryHint = "" }: Props) {
  const [items, setItems] = useState<LibraryImage[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [variant, setVariant] = useState<"desktop" | "mobile">("desktop")

  useEffect(() => {
    if (queryHint && !query) setQuery(queryHint)
  }, [queryHint])

  useEffect(() => {
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (query.trim()) params.set("q", query.trim())
        params.set("limit", "120")
        const response = await fetch(`/api/library?${params.toString()}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Could not load library")
        setItems(Array.isArray(data.items) ? data.items : [])
        setTotal(Number(data.total) || 0)
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setItems([])
        }
      } finally {
        setLoading(false)
      }
    }, 180)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  const selected = useMemo(() => new Set(selectedUrls), [selectedUrls])

  return (
    <SpotlightCard>
      <div className="space-y-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium">
              <ImagePlus className="h-4 w-4 text-amber-300" />
              Existing image library
            </div>
            <p className="mt-1 text-sm text-white/55">
              Desktop and mobile previews from your library. Click one to use it as a reference image.
            </p>
          </div>
          <span className="text-xs text-white/40">{total} sections</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={variant === "desktop"}
            onClick={() => setVariant("desktop")}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
              variant === "desktop"
                ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205]"
                : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25"
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
                ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205]"
                : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25"
            }`}
          >
            <Smartphone className="h-3.5 w-3.5" />
            Mobile
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search library, like faq or collection"
            className="border-amber-100/10 bg-white/[0.04] pl-9 text-white placeholder:text-white/35 focus-visible:ring-amber-300/70 focus-visible:ring-offset-0"
            aria-label="Search image library"
          />
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center text-sm text-white/50">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Loading library…
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-dashed border-amber-100/10 px-4 text-center text-sm text-white/50">
            No matching library images.
          </div>
        ) : (
          <ul className="grid max-h-[420px] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {items.map((image) => {
              const url = variant === "mobile" ? image.mobileUrl || image.desktopUrl : image.desktopUrl
              const active = selected.has(url)
              return (
                <li key={`${image.id}-${variant}`}>
                  <button
                    type="button"
                    onClick={() => onToggle(image, variant)}
                    className={`group relative w-full overflow-hidden rounded-xl border text-left transition ${
                      active
                        ? "border-amber-300/70 ring-1 ring-amber-300/40"
                        : "border-amber-100/10 hover:border-amber-100/30"
                    }`}
                  >
                    <img
                      src={url}
                      alt={image.label}
                      loading="lazy"
                      className={`w-full bg-black/30 object-cover object-top ${
                        variant === "mobile" ? "aspect-[9/16]" : "aspect-[16/10]"
                      }`}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-2 pt-8">
                      <p className="truncate text-[11px] font-medium text-white">{image.label}</p>
                      <p className="text-[10px] text-white/55">{variant}</p>
                    </div>
                    {active ? (
                      <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-300 text-[#1a1205]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    ) : null}
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
