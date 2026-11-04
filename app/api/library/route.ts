import { NextResponse } from "next/server"
import {
  findLibraryMatches,
  groupLibraryByCategory,
  listLibraryImages,
} from "@/lib/section-library"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.trim() || ""
    const category = searchParams.get("category")?.trim() || ""
    const grouped = searchParams.get("grouped") === "1"
    const limit = Math.min(400, Math.max(1, Number(searchParams.get("limit") || 200)))

    const all = listLibraryImages()
    let items = q ? findLibraryMatches(q, limit) : all

    if (category && category !== "All") {
      items = items.filter((image) => image.category.toLowerCase() === category.toLowerCase())
    }

    if (!q) items = items.slice(0, limit)

    return NextResponse.json({
      total: all.length,
      count: items.length,
      categories: groupLibraryByCategory(all).map((group) => ({
        category: group.category,
        count: group.items.length,
      })),
      groups: grouped ? groupLibraryByCategory(items) : undefined,
      items,
    })
  } catch (error) {
    console.error("Library list failed:", error)
    return NextResponse.json({ error: "Could not load image library" }, { status: 500 })
  }
}
