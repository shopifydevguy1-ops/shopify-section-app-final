import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth"

export async function GET() {
  try {
    const admin = await isAdmin()
    return NextResponse.json({ isAdmin: admin })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

