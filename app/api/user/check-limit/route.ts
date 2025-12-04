import { NextResponse } from "next/server"
import { getCurrentUser, checkGenerationLimit } from "@/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const limit = await checkGenerationLimit(user.id)
    return NextResponse.json(limit)
  } catch (error) {
    console.error("Error checking limit:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

