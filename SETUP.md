# Quick Setup Guide

This guide will help you get the Shopify Section Generator up and running quickly.

## 🚀 Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp env.example .env
```

Edit `.env` and add your API keys:
- **Database**: PostgreSQL connection string
- **Clerk**: Sign up at [clerk.com](https://clerk.com) and get your keys
- **AI API**: Get a free key from [free-llm-api-resources](https://github.com/cheahjs/free-llm-api-resources)
- **PayMongo**: Sign up at [paymongo.com](https://paymongo.com) for payment processing

### 3. Set Up Database
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🔑 Setting Up Admin User

1. Sign up for an account through the app
2. Go to [Clerk Dashboard](https://dashboard.clerk.com)
3. Navigate to Users → Select your user
4. Go to Metadata tab
5. Add to Public metadata:
   ```json
   {
     "role": "admin"
   }
   ```
6. Refresh the app and go to `/admin`

## 📦 Adding Section Templates

### Method 1: Admin Dashboard (Recommended)
1. Log in as admin
2. Go to `/admin` → Sections tab
3. Click "Add Section"
4. Fill in name, tags, and Liquid code

### Method 2: File System
1. Add files to `/sections` folder
2. Use JSON format (see `sections/hero-banner.json` for example)
3. Or use `.liquid` files directly

## 🧪 Testing the App

1. **Test Authentication**
   - Sign up for a new account
   - Sign in/out
   - Verify user is created in database

2. **Test Section Generation**
   - Go to Dashboard → Generate
   - Enter a keyword like "hero" or "banner"
   - Click Generate
   - Verify code is generated

3. **Test Admin Features**
   - Log in as admin
   - Go to `/admin`
   - Try adding/editing/deleting sections
   - Try updating user subscriptions

4. **Test Payment Flow** (Test Mode)
   - Go to `/pricing`
   - Click "Upgrade to Pro"
   - Complete test payment
   - Verify subscription status updates

## 🐛 Common Setup Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check `DATABASE_URL` format: `postgresql://user:password@host:port/database`
- Ensure database exists

### Clerk Authentication Not Working
- Verify keys are correct in `.env`
- Check Clerk dashboard for allowed origins
- Clear browser cache and cookies

### AI Generation Failing
- Verify API key is valid
- Check API URL matches your provider
- Review rate limits and quotas

### Build Errors
- Ensure Node.js 18+ is installed
- Delete `node_modules` and `.next`, then `npm install`
- Check for TypeScript errors

## 📚 Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
- Customize the UI in `app/` and `components/`
- Add more section templates
- Configure webhooks for PayMongo

## 💡 Tips

- Use Prisma Studio to view database: `npm run db:studio`
- Check browser console for client-side errors
- Check terminal for server-side errors
- Use Clerk's test mode for development
- Use PayMongo's test keys for development

## 🆘 Need Help?

- Check the main [README.md](./README.md)
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for production issues
- Check API documentation for Clerk, PayMongo, and your AI provider

