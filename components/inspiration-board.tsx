"use client"

import { useEffect, useState } from "react"
import {
  ExternalLink,
  HeartHandshake,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  PanelsTopLeft,
  Upload,
} from "lucide-react"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { compressImageFile } from "@/lib/compose-section-image"
import type { Inspiration, InspirationKind } from "@/lib/inspirations"

const fieldClass =
  "border-amber-100/10 bg-white/[0.04] text-white placeholder:text-white/35 focus-visible:ring-amber-300/70 focus-visible:ring-offset-0"

export function InspirationBoard() {
  const { toast } = useToast()
  const [items, setItems] = useState<Inspiration[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [kind, setKind] = useState<InspirationKind>("section")
  const [title, setTitle] = useState("")
  const [sectionType, setSectionType] = useState("")
  const [notes, setNotes] = useState("")
  const [storeUrl, setStoreUrl] = useState("")
  const [imageDataUrl, setImageDataUrl] = useState("")
  const [imageName, setImageName] = useState("")

  async function loadItems() {
    setLoading(true)
    try {
      const response = await fetch("/api/inspirations")
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not load inspirations")
      setItems(Array.isArray(data.items) ? data.items : [])
    } catch (error) {
      toast({
        title: "Inspiration board unavailable",
        description: error instanceof Error ? error.message : "Try again in a moment.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadItems()
    // Initial gallery fetch only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function onPickImage(fileList: FileList | null) {
    const file = fileList?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Images only",
        description: "Upload a JPG, PNG, or WebP screenshot.",
        variant: "destructive",
      })
      return
    }
    try {
      const dataUrl = await compressImageFile(file)
      setImageDataUrl(dataUrl)
      setImageName(file.name)
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not read that image.",
        variant: "destructive",
      })
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!title.trim() || !imageDataUrl) {
      toast({
        title: "Almost there",
        description: "Add a title and an image of the section or page.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const response = await fetch("/api/inspirations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          title,
          sectionType,
          notes,
          storeUrl,
          imageDataUrl,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Could not save inspiration")
      setItems((current) => [data.item, ...current])
      setTitle("")
      setSectionType("")
      setNotes("")
      setStoreUrl("")
      setImageDataUrl("")
      setImageName("")
      toast({
        title: "Shared with the community",
        description: "Thanks. Your example helps keep SectionGen free for everyone.",
      })
    } catch (error) {
      toast({
        title: "Could not share",
        description: error instanceof Error ? error.message : "Try a smaller image.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="max-w-3xl">
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-100/10 bg-amber-50/5 px-3 py-1 text-xs uppercase tracking-[0.18em] text-amber-200">
          <HeartHandshake className="h-3.5 w-3.5" />
          Keep it free
        </p>
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Share a section image or a whole page
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/60">
          Upload the photos you used on a section, or a full-page screenshot built from SectionGen blocks.
          Those examples inspire other merchants and help the studio stay free.
        </p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <SpotlightCard>
          <form onSubmit={handleSubmit} className="space-y-4 p-5 sm:p-6">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Upload className="h-4 w-4 text-amber-300" />
              Add inspiration
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { id: "section", label: "Section image", icon: LayoutTemplate },
                  { id: "page", label: "Whole page", icon: PanelsTopLeft },
                ] as const
              ).map((option) => {
                const Icon = option.icon
                const active = kind === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setKind(option.id)}
                    className={`inline-flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs transition ${
                      active
                        ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205] shadow-[0_0_24px_rgba(250,204,21,0.28)]"
                        : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25 hover:text-white"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option.label}
                  </button>
                )
              })}
            </div>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Title, like Warm homepage hero"
              className={fieldClass}
              aria-label="Inspiration title"
            />
            <Input
              value={sectionType}
              onChange={(event) => setSectionType(event.target.value)}
              placeholder={kind === "page" ? "Sections used, like hero + FAQ" : "Section type, like testimonials"}
              className={fieldClass}
              aria-label="Section type"
            />
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="What made this layout work?"
              rows={3}
              className={fieldClass}
              aria-label="Notes"
            />
            <Input
              value={storeUrl}
              onChange={(event) => setStoreUrl(event.target.value)}
              placeholder="Optional live store URL"
              className={fieldClass}
              aria-label="Store URL"
            />
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-amber-100/15 bg-white/[0.03] px-4 py-8 text-center transition hover:border-amber-200/30">
              {imageDataUrl ? (
                <img src={imageDataUrl} alt={imageName || "Inspiration preview"} className="mb-3 max-h-40 rounded-xl object-cover" />
              ) : (
                <ImagePlus className="mb-3 h-6 w-6 text-amber-200" />
              )}
              <span className="text-sm text-white/80">
                {imageName || "Drop a section image or full-page screenshot"}
              </span>
              <span className="mt-1 text-xs text-white/40">JPG, PNG, or WebP</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/*"
                className="sr-only"
                onChange={(event) => onPickImage(event.target.files)}
              />
            </label>
            <Button
              type="submit"
              disabled={saving}
              className="h-11 w-full rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300 text-[#1a1205] hover:from-amber-200 hover:via-yellow-200 hover:to-orange-200"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sharing…
                </>
              ) : (
                <>
                  <HeartHandshake className="mr-2 h-4 w-4" />
                  Share for free inspiration
                </>
              )}
            </Button>
          </form>
        </SpotlightCard>

        <SpotlightCard>
          <div className="space-y-4 p-5 sm:p-6">
            <div>
              <h3 className="text-lg font-semibold">Community gallery</h3>
              <p className="text-sm text-white/55">
                Browse section photos and full-page layouts other merchants shared.
              </p>
            </div>
            {loading ? (
              <div className="flex min-h-[280px] items-center justify-center text-sm text-white/50">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading inspiration…
              </div>
            ) : items.length === 0 ? (
              <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-amber-100/10 px-6 text-center text-sm text-white/50">
                Be the first to share a section image or a whole page.
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-amber-100/10 bg-black/20"
                  >
                    {item.imageDataUrl ? (
                      <img
                        src={item.imageDataUrl}
                        alt={item.title}
                        className="aspect-[16/10] w-full object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-amber-500/20 via-orange-400/10 to-yellow-200/10 px-4 text-center text-sm text-amber-50/80">
                        {item.title}
                      </div>
                    )}
                    <div className="space-y-2 p-3">
                      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-amber-200/75">
                        {item.kind === "page" ? (
                          <PanelsTopLeft className="h-3.5 w-3.5" />
                        ) : (
                          <LayoutTemplate className="h-3.5 w-3.5" />
                        )}
                        {item.kind === "page" ? "Whole page" : "Section"}
                      </div>
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-white/45">{item.sectionType}</p>
                      {item.notes ? <p className="text-sm text-white/60">{item.notes}</p> : null}
                      {item.storeUrl ? (
                        <a
                          href={item.storeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-amber-200 hover:underline"
                        >
                          View store
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </SpotlightCard>
      </div>
    </section>
  )
}
