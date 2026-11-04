import { NextResponse } from "next/server"
import { findLibraryMatches, listLibraryImages } from "@/lib/section-library"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    const limit = Math.min(200, Math.max(1, Number(searchParams.get("limit") || 120)))

    const all = listLibraryImages()
    const items = q ? findLibraryMatches(q, limit) : all.slice(0, limit)

    return NextResponse.json({
      total: all.length,
      count: items.length,
      items,
    })
  } catch (error) {
    console.error("Library list failed:", error)
    return NextResponse.json({ error: "Could not load image library" }, { status: 500 })
  }
}
