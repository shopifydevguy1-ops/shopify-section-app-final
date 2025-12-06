# Runtime Troubleshooting Guide

## Quick Diagnostic Checklist

If your site is deployed but showing errors or blank pages, check these in order:

### 1. Check Vercel Function Logs

1. Go to: https://vercel.com/shopifydevguy1-ops/shopify-section-app-final/logs
2. Look for recent errors
3. Common errors to look for:
   - `DATABASE_URL is not set`
   - `Failed to connect to database`
   - `Clerk keys are missing`
   - `Unauthorized` errors

### 2. Verify Environment Variables in Vercel

Go to: https://vercel.com/shopifydevguy1-ops/shopify-section-app-final/settings/environment-variables

**Required Variables (must be set for Production):**

- ✅ `DATABASE_URL` - Should include `?sslmode=require` for Supabase
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Must be live key (pk_live_...)
- ✅ `CLERK_SECRET_KEY` - Must be live key (sk_live_...)
- ✅ `AI_API_KEY` - Your Google AI Studio API key
- ✅ `AI_API_URL` - Should be set
- ✅ `AI_MODEL` - Should be set
- ✅ `NEXT_PUBLIC_APP_URL` - Should be `https://www.shopifysectiongen.com`

**Important:** Make sure each variable is set for **Production** environment (not just Preview/Development)

### 3. Check Browser Console

1. Visit: https://www.shopifysectiongen.com/
2. Open DevTools (F12)
3. Check **Console** tab for errors
4. Check **Network** tab for failed requests

**Common Browser Errors:**
- `Clerk: publishableKey is required` - Clerk key missing
- `Failed to fetch` - API route errors
- `CORS error` - Domain not allowed in Clerk

### 4. Verify Clerk Configuration

1. Go to: https://dashboard.clerk.com
2. Select your application
3. Go to **Settings** → **Domains**
4. Ensure these domains are added:
   - `www.shopifysectiongen.com`
   - `shopifysectiongen.com` (without www)
   - `*.vercel.app` (for preview deployments)

### 5. Test Database Connection

Your DATABASE_URL should be:
```
postgresql://postgres:Zaizai111720@db.xmaelpfzipdfegkgahto.supabase.co:5432/postgres?sslmode=require
```

**To test if database is accessible:**
1. Check Vercel logs for database connection errors
2. Look for errors like: `Can't reach database server` or `SSL connection required`

### 6. Common Runtime Issues

#### Issue: Blank Page / White Screen

**Possible Causes:**
- Missing Clerk keys
- JavaScript errors in browser console
- Middleware redirecting incorrectly

**Solution:**
1. Check browser console for errors
2. Verify Clerk keys are set in Vercel
3. Check Vercel function logs

#### Issue: "Application Error" Page

**Possible Causes:**
- Unhandled exception in server code
- Database connection failure
- Missing environment variable

**Solution:**
1. Check Vercel function logs
2. Look for stack traces
3. Verify all environment variables are set

#### Issue: Sign In/Sign Up Not Working

**Possible Causes:**
- Clerk keys not configured
- Domain not allowed in Clerk dashboard
- Middleware blocking requests

**Solution:**
1. Verify Clerk keys in Vercel
2. Add domain to Clerk dashboard
3. Check middleware configuration

#### Issue: API Routes Returning 500 Errors

**Possible Causes:**
- Database connection issues
- Missing environment variables
- Unhandled exceptions

**Solution:**
1. Check Vercel function logs for specific errors
2. Verify DATABASE_URL is correct
3. Check if database is accessible

### 7. Quick Fixes

#### Fix 1: Update DATABASE_URL with SSL

If you haven't already, update DATABASE_URL in Vercel to:
```
postgresql://postgres:Zaizai111720@db.xmaelpfzipdfegkgahto.supabase.co:5432/postgres?sslmode=require
```

#### Fix 2: Redeploy After Environment Variable Changes

After updating environment variables:
1. Go to Vercel Dashboard → Deployments
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger redeploy

#### Fix 3: Clear Vercel Build Cache

If issues persist:
1. Go to Vercel Dashboard → Settings → General
2. Clear build cache
3. Redeploy

### 8. Test Specific Endpoints

Test these URLs to identify the issue:

1. **Homepage:** https://www.shopifysectiongen.com/
   - Should show landing page
   - Check browser console for errors

2. **Sign In:** https://www.shopifysectiongen.com/sign-in
   - Should show Clerk sign-in form
   - If blank, Clerk keys might be missing

3. **API Health Check:** Create a test endpoint to verify:
   - Database connection
   - Environment variables
   - Clerk configuration

### 9. Create a Health Check Endpoint

Add this to test your configuration:

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const checks = {
    database: !!process.env.DATABASE_URL,
    clerkPublic: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    clerkSecret: !!process.env.CLERK_SECRET_KEY,
    aiApi: !!process.env.AI_API_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL,
  }
  
  return NextResponse.json(checks)
}
```

Then visit: https://www.shopifysectiongen.com/api/health

### 10. Debugging Steps Summary

1. ✅ Check Vercel logs for errors
2. ✅ Verify all environment variables are set
3. ✅ Check browser console for client-side errors
4. ✅ Verify Clerk domain configuration
5. ✅ Test database connection
6. ✅ Redeploy after making changes
7. ✅ Clear browser cache and cookies
8. ✅ Test in incognito mode

## Still Having Issues?

If none of the above fixes work:

1. **Share Vercel Logs:**
   - Copy error messages from Vercel function logs
   - Include stack traces if available

2. **Share Browser Console Errors:**
   - Open DevTools → Console
   - Copy any red error messages

3. **Check Environment Variables:**
   - Verify all required variables are set
   - Ensure they're set for Production environment
   - Double-check values (no typos, correct format)

4. **Database Connection:**
   - Verify DATABASE_URL includes SSL parameter
   - Check if Supabase project is active (not paused)
   - Verify database credentials are correct

