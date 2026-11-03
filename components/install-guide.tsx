"use client"

import { BookOpen, CheckCircle2, Download, ImagePlus, Layers3 } from "lucide-react"
import { SpotlightCard } from "@/components/spotlight-card"

const STEPS = [
  {
    icon: Download,
    title: "Download the Liquid file",
    body: "Use Download Liquid on the section you generated. Keep the matching image too.",
  },
  {
    icon: Layers3,
    title: "Add it in Shopify",
    body: "In Shopify admin go to Online Store → Themes → Edit code → Sections, then upload or create the .liquid file.",
  },
  {
    icon: BookOpen,
    title: "Place it on a page",
    body: "Open the theme editor, add section, pick your new section, and drop it where you want it.",
  },
  {
    icon: ImagePlus,
    title: "Attach the image",
    body: "In the section settings, open Image and upload the JPG you downloaded from SectionGen.",
  },
]

export function InstallGuide() {
  return (
    <SpotlightCard>
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="h-4 w-4 text-amber-300" />
            How to add the section on Shopify
          </div>
          <p className="mt-1 text-sm text-white/55">
            Follow these steps on{" "}
            <a
              href="https://www.shopifysectiongen.com/"
              className="text-amber-200 underline-offset-2 hover:underline"
            >
              shopifysectiongen.com
            </a>{" "}
            after you generate a section.
          </p>
        </div>
        <ol className="grid gap-3 sm:grid-cols-2">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li
                key={step.title}
                className="rounded-2xl border border-amber-100/10 bg-amber-50/[0.03] p-4"
              >
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-amber-200/80">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-300/15 text-amber-100">
                    {index + 1}
                  </span>
                  Step
                </div>
                <div className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                  <div>
                    <p className="text-sm font-medium text-white">{step.title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-white/55">{step.body}</p>
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
        <p className="flex items-start gap-2 text-sm text-white/50">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          Tip: after the first upload, you can reuse the same section on more templates from the theme editor without editing code again.
        </p>
      </div>
    </SpotlightCard>
  )
}
