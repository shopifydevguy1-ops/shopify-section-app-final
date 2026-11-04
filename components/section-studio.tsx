"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import {
  HelpCircle,
  Columns2,
  Copy,
  Download,
  GalleryHorizontal,
  ImagePlus,
  LayoutGrid,
  Loader2,
  Mail,
  MessageSquare,
  Quote,
  Sparkles,
  Wand2,
  X,
  Zap,
} from "lucide-react"
import { AuraBackground } from "@/components/aura-background"
import { ImageLibrary } from "@/components/image-library"
import { InstallGuide } from "@/components/install-guide"
import { InspirationBoard } from "@/components/inspiration-board"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { composeSectionImage, compressImageFile, type ReferenceImage } from "@/lib/compose-section-image"
import type { LibraryImage } from "@/lib/section-library"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

const STORAGE_KEY = "sectiongen.reference-images.v1"
const MAX_IMAGES = 12

const PRESETS = [
  { id: "hero banner", label: "Hero", icon: Sparkles },
  { id: "testimonials", label: "Testimonials", icon: Quote },
  { id: "product grid", label: "Product grid", icon: LayoutGrid },
  { id: "image with text", label: "Image & text", icon: Columns2 },
  { id: "gallery", label: "Gallery", icon: GalleryHorizontal },
  { id: "newsletter", label: "Newsletter", icon: Mail },
  { id: "faq", label: "FAQ", icon: HelpCircle },
  { id: "contact form", label: "Contact", icon: MessageSquare },
]

type SectionResult = {
  id: string
  keyword: string
  code: string
  image: string
  source: "ai" | "template"
}

const fieldClass =
  "border-amber-100/10 bg-white/[0.04] text-white placeholder:text-white/35 focus-visible:ring-amber-300/70 focus-visible:ring-offset-0"

export function SectionStudio() {
  const { toast } = useToast()
  const fileInput = useRef<HTMLInputElement>(null)
  const [ready, setReady] = useState(false)
  const [keyword, setKeyword] = useState("")
  const [customizations, setCustomizations] = useState("")
  const [selected, setSelected] = useState<string[]>([])
  const [images, setImages] = useState<ReferenceImage[]>([])
  const [results, setResults] = useState<SectionResult[]>([])
  const [dragging, setDragging] = useState(false)
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as ReferenceImage[]
        if (Array.isArray(parsed)) {
          setImages(
            parsed.filter(
              (image) => image && typeof image.dataUrl === "string" && typeof image.id === "string"
            )
          )
        }
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
    setReady(true)
  }, [])

  useEffect(() => {
    if (!ready) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(images))
    } catch {
      toast({
        title: "Could not save images",
        description: "This browser blocked local storage. The images still work until you refresh.",
        variant: "destructive",
      })
    }
  }, [images, ready, toast])

  function togglePreset(id: string) {
    setSelected((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  function sectionsToGenerate() {
    const items = [...selected]
    const custom = keyword.trim()
    if (custom && !items.some((item) => item.toLowerCase() === custom.toLowerCase())) {
      items.push(custom)
    }
    return items
  }

  function toggleLibraryImage(image: LibraryImage, variant: "desktop" | "mobile") {
    const url = variant === "mobile" ? image.mobileUrl || image.desktopUrl : image.desktopUrl
    const existing = images.find((item) => item.dataUrl === url)
    if (existing) {
      setImages((current) => current.filter((item) => item.dataUrl !== url))
      return
    }
    if (images.length >= MAX_IMAGES) {
      toast({
        title: "Reference set is full",
        description: `Remove an image first. ${MAX_IMAGES} is the limit.`,
        variant: "destructive",
      })
      return
    }
    setImages((current) => [
      ...current,
      {
        id: `${image.id}-${variant}`,
        name: `${image.label} (${variant})`,
        dataUrl: url,
      },
    ])
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList).filter((file) => file.type.startsWith("image/"))
    if (files.length === 0) {
      toast({
        title: "Images only",
        description: "Upload JPG, PNG, or WebP files.",
        variant: "destructive",
      })
      return
    }

    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      toast({
        title: "Reference set is full",
        description: `Remove an image before adding another. ${MAX_IMAGES} is the limit.`,
        variant: "destructive",
      })
      return
    }

    const slice = files.slice(0, room)
    try {
      const dataUrls = await Promise.all(slice.map((file) => compressImageFile(file)))
      setImages((current) => [
        ...current,
        ...dataUrls.map((dataUrl, index) => ({
          id: crypto.randomUUID(),
          name: slice[index].name,
          dataUrl,
        })),
      ])
      if (files.length > room) {
        toast({
          title: "Some images were skipped",
          description: `Only ${MAX_IMAGES} reference images can be stored at once.`,
        })
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Could not read that image.",
        variant: "destructive",
      })
    }
  }

  async function handleGenerate() {
    const items = sectionsToGenerate()
    if (items.length === 0) {
      toast({
        title: "Pick a section",
        description: "Choose a preset or type what you want to generate.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const next: SectionResult[] = []
    const sources = images.map((image) => image.dataUrl)

    try {
      for (let index = 0; index < items.length; index += 1) {
        const item = items[index]
        setStatus(`Generating ${index + 1} of ${items.length}: ${item}`)
        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            keyword: item,
            customizations,
            imageCount: sources.length,
          }),
        })
        const data = await response.json()
        if (!response.ok) {
          throw new Error(data.error || "Failed to generate section")
        }

        const image = await composeSectionImage(sources, index)
        next.push({
          id: crypto.randomUUID(),
          keyword: item,
          code: data.code,
          image,
          source: data.source === "template" ? "template" : "ai",
        })
        setResults([...next])
      }

      const usedTemplate = next.some((item) => item.source === "template")
      toast({
        title: items.length === 1 ? "Section ready" : `${items.length} sections ready`,
        description: usedTemplate
          ? "The AI service was unavailable, so a built-in template was used. Each section still has its own image."
          : sources.length > 0
            ? "Each section has an image composed from your uploads."
            : "Upload photos if you want each section image based on your own pictures.",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate section",
        variant: "destructive",
      })
      if (next.length > 0) setResults(next)
    } finally {
      setLoading(false)
      setStatus("")
    }
  }

  async function rebuildImages() {
    if (results.length === 0) return
    setLoading(true)
    setStatus("Rebuilding section images")
    try {
      const sources = images.map((image) => image.dataUrl)
      const next = await Promise.all(
        results.map(async (result, index) => ({
          ...result,
          image: await composeSectionImage(sources, index),
        }))
      )
      setResults(next)
    } catch (error) {
      toast({
        title: "Could not rebuild images",
        description: error instanceof Error ? error.message : "Try another photo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setStatus("")
    }
  }

  function downloadText(filename: string, contents: string) {
    const blob = new Blob([contents], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  function slug(value: string) {
    return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section"
  }

  const queued = sectionsToGenerate()

  return (
    <div className="relative min-h-screen text-white">
      <AuraBackground />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6">
        <div className="flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Shopify Section Generator"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <div>
            <p className="text-sm font-semibold tracking-tight">Shopify Section Generator</p>
            <p className="text-xs text-white/50">shopifysectiongen.com</p>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-amber-100/10 bg-amber-50/5 px-3 py-1.5 text-xs text-white/70">
          <Zap className="h-3.5 w-3.5 text-amber-300" />
          Free · no login
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-20">
        <section className="mb-10 max-w-3xl">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            <span className="block">Generate Shopify sections</span>
            <span className="mt-1 block bg-gradient-to-r from-amber-200 via-yellow-200 to-orange-300 bg-clip-text text-transparent">
              with a photo for each one
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Unlimited, and no account. Upload the images you already have. Every section gets its own picture, composed from that set. Share your finished sections or full pages below to help keep the studio free.
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="aura-frame">
              <SpotlightCard className="aura-frame-inner">
                <div className="space-y-5 p-5 sm:p-6">
                  <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                    <Wand2 className="h-4 w-4 text-amber-300" />
                    What should we build?
                  </div>
                  <Input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") handleGenerate()
                    }}
                    placeholder="Or describe one, like a lookbook hero"
                    className={fieldClass}
                    aria-label="Section description"
                  />
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => {
                      const Icon = preset.icon
                      const active = selected.includes(preset.id)
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => togglePreset(preset.id)}
                          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition ${
                            active
                              ? "border-transparent bg-gradient-to-r from-amber-400 to-orange-400 text-[#1a1205] shadow-[0_0_24px_rgba(250,204,21,0.28)]"
                              : "border-amber-100/10 bg-white/[0.03] text-white/70 hover:border-amber-100/25 hover:text-white"
                          }`}
                        >
                          <Icon className="h-3.5 w-3.5" />
                          {preset.label}
                        </button>
                      )
                    })}
                  </div>
                  <Textarea
                    value={customizations}
                    onChange={(event) => setCustomizations(event.target.value)}
                    placeholder="Optional direction: dark background, large heading, one button"
                    rows={4}
                    className={fieldClass}
                    aria-label="Customizations"
                  />
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading || queued.length === 0}
                    className="relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 px-6 text-sm font-semibold text-[#1a1205] shadow-[0_0_40px_rgba(250,204,21,0.28)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] bg-[length:200%_100%]" />
                    <span className="relative inline-flex items-center gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {loading ? status || "Generating" : queued.length > 1 ? `Generate ${queued.length} sections` : "Generate section"}
                    </span>
                  </button>
                </div>
              </SpotlightCard>
            </div>

            <SpotlightCard>
              <div className="space-y-4 p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <ImagePlus className="h-4 w-4 text-amber-300" />
                      Reference images
                    </div>
                    <p className="mt-1 text-sm text-white/55">
                      Each section image is a new composition of these uploads, so the set stays related.
                    </p>
                  </div>
                  <span className="text-xs text-white/40">{images.length}/{MAX_IMAGES}</span>
                </div>

                <label
                  onDragOver={(event) => {
                    event.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => {
                    event.preventDefault()
                    setDragging(false)
                    if (event.dataTransfer.files) addFiles(event.dataTransfer.files)
                  }}
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition ${
                    dragging ? "border-amber-300/70 bg-amber-300/10" : "border-amber-100/15 bg-white/[0.03] hover:border-amber-200/30"
                  }`}
                >
                  <ImagePlus className="mb-3 h-6 w-6 text-white/70" />
                  <span className="text-sm text-white/80">Drop images, or click to upload</span>
                  <span className="mt-1 text-xs text-white/40">JPG, PNG, or WebP. Stored only in this browser.</span>
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/*"
                    multiple
                    className="sr-only"
                    onChange={(event) => {
                      if (event.target.files) addFiles(event.target.files)
                      event.target.value = ""
                    }}
                  />
                </label>

                {images.length > 0 && (
                  <ul className="grid grid-cols-4 gap-2">
                    {images.map((image) => (
                      <li key={image.id} className="group relative aspect-square overflow-hidden rounded-xl border border-amber-100/10">
                        <img src={image.dataUrl} alt={image.name} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          aria-label={`Remove ${image.name}`}
                          onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))}
                          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </SpotlightCard>

            <ImageLibrary
              selectedUrls={images.map((image) => image.dataUrl)}
              onToggle={toggleLibraryImage}
              queryHint={keyword || selected[0] || ""}
            />
          </div>

          <SpotlightCard>
            <div className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Sections</h2>
                  <p className="text-sm text-white/55">
                    Download the Liquid file and the matching image, then follow the install steps below.
                  </p>
                </div>
                {results.length > 0 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={rebuildImages}
                    disabled={loading}
                    className="border-amber-100/15 bg-transparent text-white hover:bg-amber-50/10 hover:text-white"
                  >
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Rebuild images
                  </Button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-100/10 bg-white/[0.02] px-6 text-center">
                  <Sparkles className="mb-4 h-8 w-8 text-amber-200" />
                  <p className="text-base text-white/80">Your sections will show up here.</p>
                  <p className="mt-2 max-w-sm text-sm text-white/45">
                    Pick one or several types. If you have uploaded photos, each result gets a different image made from them.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {results.map((result, index) => (
                    <motion.article
                      key={result.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.04 }}
                      className="overflow-hidden rounded-2xl border border-amber-100/10 bg-black/20"
                    >
                      <img
                        src={result.image}
                        alt={`${result.keyword} section image`}
                        className="aspect-[16/10] w-full object-cover"
                      />
                      <div className="space-y-4 p-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="text-base font-semibold capitalize">{result.keyword}</h3>
                            <p className="text-xs text-white/45">
                              {result.source === "ai" ? "Written by AI" : "Built-in template"} · image {index + 1}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-100/15 bg-transparent text-white hover:bg-amber-50/10 hover:text-white"
                            onClick={() => {
                              navigator.clipboard.writeText(result.code)
                              toast({ title: "Copied", description: "Liquid copied to the clipboard." })
                            }}
                          >
                            <Copy className="mr-2 h-4 w-4" />
                            Copy code
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-100/15 bg-transparent text-white hover:bg-amber-50/10 hover:text-white"
                            onClick={() => downloadText(`${slug(result.keyword)}.liquid`, result.code)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Liquid
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-amber-100/15 bg-transparent text-white hover:bg-amber-50/10 hover:text-white"
                            onClick={() => {
                              const link = document.createElement("a")
                              link.href = result.image
                              link.download = `${slug(result.keyword)}-image.jpg`
                              link.click()
                            }}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Image
                          </Button>
                        </div>
                        <div className="overflow-hidden rounded-xl border border-amber-100/10">
                          <MonacoEditor
                            height="280px"
                            language="liquid"
                            value={result.code}
                            theme="vs-dark"
                            options={{
                              readOnly: true,
                              minimap: { enabled: false },
                              fontSize: 13,
                              scrollBeyondLastLine: false,
                            }}
                          />
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </div>
          </SpotlightCard>
        </div>

        <div className="mt-10">
          <InstallGuide />
        </div>

        <InspirationBoard />
      </main>
    </div>
  )
}
