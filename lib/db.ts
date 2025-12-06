import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create Prisma client with connection error handling
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    // During build time, DATABASE_URL might not be available
    // Don't throw error, just log a warning
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      console.warn('⚠️ DATABASE_URL not set during build. This is OK if you set it in Vercel.')
    } else {
      console.error('❌ DATABASE_URL is not set!')
      throw new Error('DATABASE_URL environment variable is required')
    }
  }

  // Check if this is a Supabase connection
  const isSupabase = process.env.DATABASE_URL?.includes('supabase.co')
  
  if (isSupabase && process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('sslmode')) {
    console.warn('⚠️ Supabase connection detected but SSL mode not specified.')
    console.warn('   Add ?sslmode=require to your DATABASE_URL for better security.')
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Note: Prisma connects lazily on first query, so we don't need to call $connect() here
// This prevents connection attempts during build time
// Connection will happen automatically when the first database query is made at runtime

