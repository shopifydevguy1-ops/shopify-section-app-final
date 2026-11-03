import { NextResponse } from "next/server"
import { generateSectionCode } from "@/lib/ai"
import { buildFallbackSection } from "@/lib/fallback-section"
import { searchSections } from "@/lib/sections"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const keyword = typeof body.keyword === "string" ? body.keyword.trim().slice(0, 120) : ""
    const customizations = typeof body.customizations === "string" ? body.customizations.slice(0, 2000) : ""
    const imageCount = Number.isFinite(body.imageCount) ? Math.max(0, Math.min(8, Number(body.imageCount))) : 0

    if (!keyword) {
      return NextResponse.json({ error: "Keyword is required" }, { status: 400 })
    }

    let sectionTemplate: string | undefined
    try {
      const matchingSections = await searchSections(keyword)
      sectionTemplate = matchingSections[0]?.content
    } catch (error) {
      console.error("Template lookup skipped:", error)
    }

    try {
      const code = await generateSectionCode({
        keyword,
        sectionTemplate,
        customizations,
        imageCount,
      })
      return NextResponse.json({ code, source: "ai" })
    } catch (error) {
      console.error("AI generation failed, using built-in template:", error)
      return NextResponse.json({
        code: buildFallbackSection(keyword, customizations),
        source: "template",
      })
    }
  } catch (error) {
    console.error("Generation error:", error)
    return NextResponse.json({ error: "Failed to generate section" }, { status: 500 })
  }
}
