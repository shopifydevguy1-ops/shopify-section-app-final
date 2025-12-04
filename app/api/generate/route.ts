import { NextResponse } from "next/server"
import { getCurrentUser, checkGenerationLimit, incrementGenerationCount } from "@/lib/auth"
import { searchSections } from "@/lib/sections"
import { generateSectionCode } from "@/lib/ai"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check generation limit
    const limit = await checkGenerationLimit(user.id)
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Generation limit reached. Please upgrade to Pro." },
        { status: 403 }
      )
    }

    const { keyword, customizations } = await request.json()

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json(
        { error: "Keyword is required" },
        { status: 400 }
      )
    }

    // Search for matching sections
    const matchingSections = await searchSections(keyword)
    const sectionTemplate = matchingSections[0]?.content

    // Generate code using AI
    const generatedCode = await generateSectionCode({
      keyword,
      sectionTemplate,
      customizations,
    })

    // Find or create section record
    let section = matchingSections[0]
      ? await prisma.section.findFirst({
          where: { name: matchingSections[0].name },
        })
      : null

    // Log generation
    await prisma.generationLog.create({
      data: {
        userId: user.id,
        sectionId: section?.id,
        keyword,
      },
    })

    // Increment generation count
    await incrementGenerationCount(user.id)

    return NextResponse.json({ code: generatedCode })
  } catch (error: any) {
    console.error("Generation error:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate section" },
      { status: 500 }
    )
  }
}

