import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'

export async function getCurrentUser() {
  try {
    const { userId } = await auth()
    if (!userId) return null

    const clerkUser = await currentUser()
    if (!clerkUser) return null

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    })

    if (!user) {
      try {
        user = await prisma.user.create({
          data: {
            clerkUserId: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            subscriptionType: 'free',
            generationCount: 0,
          },
        })
      } catch (error: any) {
        console.error('Error creating user:', error)
        // If database is unavailable, return null instead of crashing
        return null
      }
    }

    return user
  } catch (error) {
    console.error('Error in getCurrentUser:', error)
    return null
  }
}

export async function isAdmin() {
  const { userId } = await auth()
  if (!userId) return false

  const clerkUser = await currentUser()
  return clerkUser?.publicMetadata?.role === 'admin'
}

export async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return { allowed: false, remaining: 0 }
    }

    if (user.subscriptionType === 'pro') {
      return { allowed: true, remaining: -1 } // -1 means unlimited
    }

    const remaining = 10 - user.generationCount
    return {
      allowed: remaining > 0,
      remaining: Math.max(0, remaining),
    }
  } catch (error) {
    console.error('Error checking generation limit:', error)
    // If database is unavailable, deny access to be safe
    return { allowed: false, remaining: 0 }
  }
}

export async function incrementGenerationCount(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        generationCount: {
          increment: 1,
        },
      },
    })
  } catch (error) {
    console.error('Error incrementing generation count:', error)
    // Don't throw - allow the generation to proceed even if count update fails
  }
}

