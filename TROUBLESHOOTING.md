# Troubleshooting Guide for Production Issues

## Common Issues and Solutions

### 1. Application Error / White Screen

**Symptoms:**
- Site shows error page or blank screen
- Browser console shows errors

**Common Causes:**
- Missing or invalid Clerk authentication keys
- Database connection issues
- Missing environment variables

**Solutions:**

#### Check Clerk Keys
1. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set in production environment
2. Verify `CLERK_SECRET_KEY` is set in production environment
3. Ensure keys are **live keys** (not test keys) for production
4. Check Clerk dashboard: https://dashboard.clerk.com

#### Check Database Connection
1. Verify `DATABASE_URL` is set correctly
2. For Vercel: Database must be accessible externally (not localhost)
3. Check database connection string format: `postgresql://user:password@host:port/database`
4. Ensure database is running and accessible

#### Check Environment Variables
Required variables:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `AI_API_KEY`
- `AI_API_URL`
- `AI_MODEL`
- `NEXT_PUBLIC_APP_URL` (should be `https://www.shopifysectiongen.com`)

### 2. Authentication Not Working

**Symptoms:**
- Sign in/sign up buttons don't work
- Users can't log in
- Redirect loops

**Solutions:**
1. Verify Clerk keys are correct and active
2. Check Clerk dashboard for allowed origins:
   - Add `https://www.shopifysectiongen.com` to allowed origins
   - Add `https://shopifysectiongen.com` (without www) if needed
3. Clear browser cache and cookies
4. Check browser console for Clerk errors

### 3. Database Connection Errors

**Symptoms:**
- API routes return 500 errors
- User data not loading
- Generation features not working

**Solutions:**
1. **For Vercel deployments:**
   - Database must use external connection (not localhost)
   - Use connection string with remote hostname
   - See `ZCOM_DATABASE_EXTERNAL_ACCESS.md` for setup

2. **Verify connection string:**
   ```bash
   # Format should be:
   postgresql://username:password@hostname:5432/database_name
   ```

3. **Test connection:**
   - Check Vercel function logs for database errors
   - Verify database is accessible from Vercel's IP ranges

### 4. Build/Deployment Errors

**Symptoms:**
- Build fails on Vercel
- Deployment doesn't complete

**Solutions:**
1. Check build logs in Vercel dashboard
2. Ensure `package.json` has correct build script: `"build": "prisma generate && npm run build"`
3. Verify all dependencies are in `package.json`
4. Check for TypeScript errors locally: `npm run build`

### 5. API Routes Returning Errors

**Symptoms:**
- `/api/generate` returns errors
- `/api/user/me` returns 401 or 500

**Solutions:**
1. Check server logs for specific error messages
2. Verify database connection is working
3. Verify Clerk authentication is working
4. Check AI API key is valid and has quota

## Recent Fixes Applied

### Error Handling Improvements

1. **Database Connection:**
   - Added graceful error handling for database connection failures
   - App won't crash if database is temporarily unavailable
   - Better error messages in logs

2. **Clerk Authentication:**
   - Middleware now handles missing Clerk keys gracefully
   - App continues to work even if Clerk keys are misconfigured
   - Better error logging for debugging

3. **API Routes:**
   - All database operations wrapped in try-catch
   - API routes return proper error responses instead of crashing
   - Better error messages for debugging

## Debugging Steps

### 1. Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for error messages
3. Check function logs for specific errors

### 2. Check Browser Console
1. Open browser DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for failed requests

### 3. Verify Environment Variables
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Verify all required variables are set
3. Ensure they're set for **Production** environment
4. Redeploy after adding/updating variables

### 4. Test Database Connection
```bash
# If you have access to the database, test connection:
psql "postgresql://user:password@host:5432/database"
```

## Quick Checklist

- [ ] All environment variables are set in Vercel
- [ ] Clerk keys are live keys (not test keys)
- [ ] Database URL uses external hostname (not localhost)
- [ ] `NEXT_PUBLIC_APP_URL` is set to `https://www.shopifysectiongen.com`
- [ ] Clerk dashboard has correct allowed origins
- [ ] Database is accessible from Vercel
- [ ] Build completes successfully
- [ ] No errors in Vercel function logs

## Getting Help

If issues persist:
1. Check Vercel deployment logs
2. Check browser console for client-side errors
3. Review recent code changes
4. Verify all environment variables are correct
5. Test database connection separately

## Contact

For deployment-specific issues:
- Vercel Support: https://vercel.com/support
- Clerk Support: https://clerk.com/support
- Database Host Support: Check your hosting provider

