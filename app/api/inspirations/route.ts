import { NextResponse } from "next/server"
import { createInspiration, listInspirations, type InspirationKind } from "@/lib/inspirations"

export const dynamic = "force-dynamic"

const MAX_IMAGE_CHARS = 900_000

export async function GET() {
  try {
    const items = await listInspirations()
    return NextResponse.json({ items })
  } catch (error) {
    console.error("List inspirations failed:", error)
    return NextResponse.json({ error: "Could not load inspirations" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const kind = body.kind === "page" ? "page" : body.kind === "section" ? "section" : null
    const title = typeof body.title === "string" ? body.title.trim().slice(0, 80) : ""
    const sectionType = typeof body.sectionType === "string" ? body.sectionType.trim().slice(0, 120) : ""
    const notes = typeof body.notes === "string" ? body.notes.trim().slice(0, 500) : ""
    const storeUrl = typeof body.storeUrl === "string" ? body.storeUrl.trim().slice(0, 300) : ""
    const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl : ""

    if (!kind) {
      return NextResponse.json({ error: "Pick section or page" }, { status: 400 })
    }
    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }
    if (!imageDataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Upload a JPG, PNG, or WebP image" }, { status: 400 })
    }
    if (imageDataUrl.length > MAX_IMAGE_CHARS) {
      return NextResponse.json({ error: "Image is too large. Use a smaller screenshot." }, { status: 400 })
    }
    if (storeUrl && !/^https?:\/\//i.test(storeUrl)) {
      return NextResponse.json({ error: "Store URL must start with http:// or https://" }, { status: 400 })
    }

    const item = await createInspiration({
      kind: kind as InspirationKind,
      title,
      sectionType: sectionType || (kind === "page" ? "full page" : "section"),
      notes,
      storeUrl,
      imageDataUrl,
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error("Create inspiration failed:", error)
    return NextResponse.json({ error: "Could not save inspiration" }, { status: 500 })
  }
}
