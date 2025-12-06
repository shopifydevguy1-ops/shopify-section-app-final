import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET() {
  const health: {
    status: string
    timestamp: string
    error?: string
    checks: {
      environment: {
        databaseUrl: boolean
        clerkPublicKey: boolean
        clerkSecretKey: boolean
        aiApiKey: boolean
        appUrl: string
      }
      database: {
        connected: boolean
        error: string | null
      }
    }
  } = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    checks: {
      environment: {
        databaseUrl: !!process.env.DATABASE_URL,
        clerkPublicKey: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
        clerkSecretKey: !!process.env.CLERK_SECRET_KEY,
        aiApiKey: !!process.env.AI_API_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
      },
      database: {
        connected: false,
        error: null,
      },
    },
  }

  // Test database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    health.checks.database.connected = true
  } catch (error: any) {
    health.checks.database.connected = false
    health.checks.database.error = error.message
    health.status = 'degraded'
  }

  // Check if all required env vars are set
  const missingVars = []
  if (!process.env.DATABASE_URL) missingVars.push('DATABASE_URL')
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) missingVars.push('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY')
  if (!process.env.CLERK_SECRET_KEY) missingVars.push('CLERK_SECRET_KEY')
  if (!process.env.AI_API_KEY) missingVars.push('AI_API_KEY')

  if (missingVars.length > 0) {
    health.status = 'error'
    health.error = `Missing environment variables: ${missingVars.join(', ')}`
  }

  const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 500

  return NextResponse.json(health, { status: statusCode })
}

