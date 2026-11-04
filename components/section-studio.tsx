"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  Copy,
  Download,
  ImagePlus,
  Loader2,
  Sparkles,
  Wand2,
  Zap,
} from "lucide-react"
import { AuraBackground } from "@/components/aura-background"
import { InstallGuide } from "@/components/install-guide"
import { InspirationBoard } from "@/components/inspiration-board"
import { SectionCatalog } from "@/components/section-catalog"
import { SpotlightCard } from "@/components/spotlight-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { composeSectionImage } from "@/lib/compose-section-image"
import type { LibraryImage } from "@/lib/section-library"

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false })

type SectionResult = {
  id: string
  keyword: string
  code: string
  image: string
  mobileImage?: string | null
  source: "ai" | "template" | "library"
}

const fieldClass =
  "border-amber-100/10 bg-white/[0.04] text-white placeholder:text-white/35 focus-visible:ring-amber-300/70 focus-visible:ring-offset-0"

export function SectionStudio() {
  const { toast } = useToast()
  const [customName, setCustomName] = useState("")
  const [notes, setNotes] = useState("")
  const [results, setResults] = useState<SectionResult[]>([])
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(false)

  async function generateOne(keyword: string, libraryImage?: LibraryImage) {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        keyword,
        customizations: notes,
        imageCount: libraryImage ? 1 : 0,
      }),
    })
    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || "Failed to generate section")
    }

    const image = libraryImage
      ? libraryImage.desktopUrl
      : await composeSectionImage([], results.length)

    return {
      id: crypto.randomUUID(),
      keyword,
      code: data.code,
      image,
      mobileImage: libraryImage?.mobileUrl || null,
      source: libraryImage ? ("library" as const) : data.source === "template" ? ("template" as const) : ("ai" as const),
    }
  }

  async function handleCustomGenerate() {
    const name = customName.trim()
    if (!name) {
      toast({
        title: "Name your section",
        description: "Type what you want, like “lookbook hero” or “pricing table”.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setStatus(`Generating “${name}”`)
    try {
      const result = await generateOne(name)
      setResults((current) => [result, ...current])
      toast({
        title: "Section ready",
        description: `Generated from your custom text: ${name}`,
      })
      setCustomName("")
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate section",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setStatus("")
    }
  }

  async function handleCatalogPick(image: LibraryImage) {
    setLoading(true)
    setStatus(`Generating “${image.label}”`)
    try {
      const result = await generateOne(image.label, image)
      setResults((current) => [result, ...current])
      toast({
        title: "Section ready",
        description: `${image.label} · ${image.category}`,
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate section",
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
              from a catalog or your own idea
            </span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/65 sm:text-lg">
            Browse heroes, testimonials, FAQs, and more. Or type a custom section name below. Free, and no account.
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <div className="space-y-6 lg:sticky lg:top-6">
            <div className="aura-frame">
              <SpotlightCard className="aura-frame-inner">
                <div className="space-y-5 p-5 sm:p-6">
                  <div>
                    <div className="flex items-center gap-2 text-sm font-medium text-white/80">
                      <Wand2 className="h-4 w-4 text-amber-300" />
                      Custom section
                    </div>
                    <p className="mt-1 text-sm text-white/55">
                      Use this only when you want something that is not in the catalog.
                    </p>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/45">
                      Section name
                    </label>
                    <Input
                      value={customName}
                      onChange={(event) => setCustomName(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleCustomGenerate()
                      }}
                      placeholder="Example: lookbook hero, pricing table, team grid"
                      className={fieldClass}
                      aria-label="Custom section name"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs uppercase tracking-[0.14em] text-white/45">
                      Extra notes (optional)
                    </label>
                    <Textarea
                      value={notes}
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="Optional details for the layout, like dark background or one CTA"
                      rows={3}
                      className={fieldClass}
                      aria-label="Extra notes"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleCustomGenerate}
                    disabled={loading || !customName.trim()}
                    className="relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 px-6 text-sm font-semibold text-[#1a1205] shadow-[0_0_40px_rgba(250,204,21,0.28)] transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="pointer-events-none absolute inset-0 animate-shimmer bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.45),transparent)] bg-[length:200%_100%]" />
                    <span className="relative inline-flex items-center gap-2">
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      {loading ? status || "Generating" : "Generate custom section"}
                    </span>
                  </button>
                </div>
              </SpotlightCard>
            </div>

            <SectionCatalog onPick={handleCatalogPick} busy={loading} />
          </div>

          <SpotlightCard>
            <div className="space-y-5 p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold">Generated sections</h2>
                <p className="text-sm text-white/55">
                  Download the Liquid file, then follow the install steps below.
                </p>
              </div>

              {results.length === 0 ? (
                <div className="flex min-h-[420px] flex-col items-center justify-center rounded-2xl border border-dashed border-amber-100/10 bg-white/[0.02] px-6 text-center">
                  <Sparkles className="mb-4 h-8 w-8 text-amber-200" />
                  <p className="text-base text-white/80">Pick a section from the catalog</p>
                  <p className="mt-2 max-w-sm text-sm text-white/45">
                    Or type a custom section name on the left if you need something new.
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
                      <div className={`grid gap-0 ${result.mobileImage ? "md:grid-cols-[1.4fr_0.7fr]" : ""}`}>
                        <img
                          src={result.image}
                          alt={`${result.keyword} desktop preview`}
                          className="aspect-[16/10] w-full object-cover object-top"
                        />
                        {result.mobileImage ? (
                          <img
                            src={result.mobileImage}
                            alt={`${result.keyword} mobile preview`}
                            className="aspect-[9/16] w-full object-cover object-top md:max-h-full"
                          />
                        ) : null}
                      </div>
                      <div className="space-y-4 p-4">
                        <div>
                          <h3 className="text-base font-semibold capitalize">{result.keyword}</h3>
                          <p className="text-xs text-white/45">
                            {result.source === "library"
                              ? "Catalog section"
                              : result.source === "ai"
                                ? "Custom AI section"
                                : "Built-in template"}
                          </p>
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
                              link.download = `${slug(result.keyword)}-desktop.png`
                              link.click()
                            }}
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Desktop image
                          </Button>
                          {result.mobileImage ? (
                            <Button
                              type="button"
                              variant="outline"
                              className="border-amber-100/15 bg-transparent text-white hover:bg-amber-50/10 hover:text-white"
                              onClick={() => {
                                const link = document.createElement("a")
                                link.href = result.mobileImage!
                                link.download = `${slug(result.keyword)}-mobile.png`
                                link.click()
                              }}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Mobile image
                            </Button>
                          ) : null}
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
