import { auth, currentUser } from '@clerk/nextjs/server'
import { prisma } from './db'

export async function getCurrentUser() {
  const { userId } = await auth()
  if (!userId) return null

  const clerkUser = await currentUser()
  if (!clerkUser) return null

  // Get or create user in database
  let user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        clerkUserId: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        subscriptionType: 'free',
        generationCount: 0,
      },
    })
  }

  return user
}

export async function isAdmin() {
  const { userId } = await auth()
  if (!userId) return false

  const clerkUser = await currentUser()
  return clerkUser?.publicMetadata?.role === 'admin'
}

export async function checkGenerationLimit(userId: string): Promise<{ allowed: boolean; remaining: number }> {
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
}

export async function incrementGenerationCount(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      generationCount: {
        increment: 1,
      },
    },
  })
}

