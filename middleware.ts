import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

// Validate Clerk keys are configured
const hasValidClerkKeys = 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && 
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY.includes('...') &&
  process.env.CLERK_SECRET_KEY &&
  !process.env.CLERK_SECRET_KEY.includes('...')

if (!hasValidClerkKeys) {
  console.error('❌ Clerk keys are missing or contain placeholder values!')
  console.error('Please update your .env file with valid Clerk keys from https://dashboard.clerk.com')
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/pricing",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  // If Clerk keys are missing, allow all routes to pass through
  // This prevents the app from crashing, but authentication won't work
  if (!hasValidClerkKeys) {
    return NextResponse.next()
  }

  // Only protect non-public routes
  if (!isPublicRoute(req)) {
    try {
      const { userId } = await auth()
      if (!userId) {
        const signInUrl = new URL("/sign-in", req.url)
        return NextResponse.redirect(signInUrl)
      }
    } catch (error) {
      console.error('Clerk authentication error:', error)
      // Allow the request to proceed if there's an auth error
      // This prevents the app from crashing due to auth issues
      return NextResponse.next()
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
}

