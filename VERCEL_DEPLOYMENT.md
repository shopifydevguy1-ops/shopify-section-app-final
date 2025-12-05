# Vercel Deployment Guide

This guide will help you deploy the Shopify Section Generator to Vercel.

## Why Vercel?

✅ **Perfect for Next.js** - Built by the Next.js team  
✅ **Automatic Deployments** - Deploys on every Git push  
✅ **Free Tier Available** - Great for getting started  
✅ **Easy Environment Variables** - Simple UI for managing secrets  
✅ **Built-in SSL/HTTPS** - No configuration needed  
✅ **Serverless Functions** - Automatic scaling for API routes  

## Prerequisites

1. Vercel account (sign up at [vercel.com](https://vercel.com))
2. GitHub account (to connect your repository)
3. PostgreSQL database (see Database Options below)
4. All API keys ready (Clerk, PayMongo, AI API)

## Step-by-Step Deployment

### 1. Prepare Your Repository

Make sure your code is pushed to GitHub:

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will auto-detect Next.js

### 3. Configure Project Settings

Vercel will auto-detect most settings, but verify:

- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: `./` (if your project is at the root)
- **Build Command**: `npm run build` (auto-detected)
- **Output Directory**: `.next` (auto-detected)
- **Install Command**: `npm install` (auto-detected)

### 4. Set Environment Variables

In Vercel dashboard → Your Project → Settings → Environment Variables, add:

#### Required Variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
AI_API_KEY=your_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-3.5-turbo
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

**Important Notes:**
- Add variables for **Production**, **Preview**, and **Development** environments
- `NEXT_PUBLIC_APP_URL` should be your Vercel domain initially (e.g., `https://your-app.vercel.app`)
- After adding a custom domain, update `NEXT_PUBLIC_APP_URL` to your custom domain

### 5. Database Options

You have three options for PostgreSQL:

#### Option A: Vercel Postgres (Recommended for Simplicity)

1. In Vercel dashboard → Your Project → Storage
2. Click **"Create Database"** → Select **"Postgres"**
3. Choose a name and region
4. Vercel will automatically create a `POSTGRES_URL` environment variable
5. Update your Prisma schema to use `POSTGRES_URL` or update `DATABASE_URL` to match

**Pros:**
- Integrated with Vercel
- Automatic backups
- Easy to manage

**Cons:**
- Paid service (but has free tier)
- Data stored on Vercel

#### Option B: Supabase (Recommended for Free Tier)

1. Sign up at [supabase.com](https://supabase.com) (free tier available)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add as `DATABASE_URL` in Vercel environment variables

**Pros:**
- Generous free tier
- Great developer experience
- Additional features (auth, storage, etc.)

**Cons:**
- External service (but very reliable)

#### Option C: Keep Your Existing Database

If you want to keep using your Z.com PostgreSQL database:

1. Make sure your database allows external connections
2. Update the connection string to use your database's public IP/hostname
3. Add firewall rules to allow Vercel's IPs (or use 0.0.0.0/0 for simplicity)
4. Add `DATABASE_URL` in Vercel environment variables

**Pros:**
- Keep existing data
- No migration needed

**Cons:**
- May need to configure firewall rules
- Database on different provider

### 6. Deploy

1. Click **"Deploy"** in Vercel
2. Wait for the build to complete (usually 2-5 minutes)
3. Your app will be live at `https://your-app.vercel.app`

### 7. Run Database Migrations

After first deployment, run Prisma migrations:

**Option A: Via Vercel CLI (Recommended)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations
npx prisma migrate deploy
```

**Option B: Via Vercel Dashboard**

1. Go to your project → Settings → Functions
2. You can add a build script that runs migrations, or
3. Use Vercel's database tools if using Vercel Postgres

**Option C: Manual Migration**

Connect to your database directly and run:
```bash
npx prisma db push
```

### 8. Configure Custom Domain (Optional)

1. In Vercel dashboard → Your Project → Settings → Domains
2. Add your domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable to your custom domain
5. Redeploy

### 9. Configure Webhooks

#### PayMongo Webhook:

1. In PayMongo Dashboard → Webhooks
2. Add webhook URL: `https://your-app.vercel.app/api/paymongo/webhook`
3. Select events:
   - `subscription.updated`
   - `subscription.payment_succeeded`
   - `subscription.cancelled`

#### Clerk Configuration:

1. In Clerk Dashboard → Your Application → Settings
2. Update **Allowed Origins** to include:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com` (if using custom domain)

### 10. Testing

After deployment, test:

- [ ] Homepage loads
- [ ] Sign up/Sign in works
- [ ] Dashboard accessible
- [ ] Section generation works
- [ ] Payment flow (test mode)
- [ ] Admin dashboard (if admin user)
- [ ] Webhooks receive events

## Important Changes from Z.com Setup

### 1. Removed Custom Server

Vercel handles Next.js natively, so `server.js` is not needed. The app will work without it.

### 2. Updated next.config.js

Removed `output: 'standalone'` because Vercel uses its own optimized build system.

### 3. No .cpanel.yml Needed

Vercel uses `vercel.json` for configuration (already created).

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Production**: Deploys from `main` branch
- **Preview**: Deploys from other branches (creates preview URLs)
- **Instant**: Usually completes in 2-5 minutes

## Environment Variables by Environment

You can set different environment variables for:
- **Production**: Live site
- **Preview**: Preview deployments (from branches)
- **Development**: Local development (via Vercel CLI)

## Monitoring & Logs

- **Logs**: Vercel dashboard → Your Project → Logs
- **Analytics**: Available in Vercel dashboard
- **Error Tracking**: Consider adding Sentry for better error tracking

## Troubleshooting

### Build Fails

- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct scripts

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if database allows external connections (if using external DB)
- Test connection string locally first

### API Routes Not Working

- Check function logs in Vercel dashboard
- Verify environment variables are set
- Ensure middleware is configured correctly

### Environment Variables Not Loading

- Make sure variables are set for the correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

## Cost Comparison

### Vercel Free Tier:
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Serverless functions included
- ✅ Automatic SSL
- ❌ Database not included (need separate service)

### Vercel Pro ($20/month):
- ✅ Everything in Free tier
- ✅ More bandwidth
- ✅ Team collaboration
- ✅ Better analytics

### Z.com:
- ✅ Includes hosting + database
- ❌ More complex setup
- ❌ Manual deployments

## Migration Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables configured
- [ ] Database set up (Vercel Postgres, Supabase, or external)
- [ ] Database migrations run
- [ ] Custom domain configured (optional)
- [ ] Webhooks updated (PayMongo, Clerk)
- [ ] Application tested
- [ ] Old hosting (Z.com) can be decommissioned (after confirming everything works)

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: Available in dashboard
- **Community**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)

---

**Next Steps:** After deployment, update your PayMongo and Clerk webhooks to point to your new Vercel URL!

