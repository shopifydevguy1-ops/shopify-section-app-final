# Shopify Section Generator

A full-stack SaaS application that generates beautiful Shopify Liquid sections using AI. Built with Next.js 14, TypeScript, TailwindCSS, and ShadCN UI.

## 🚀 Features

- **AI-Powered Generation**: Generate Shopify sections from simple keywords
- **Free & Pro Plans**: 10 free generations, unlimited with Pro
- **Section Library**: Manage and search through section templates
- **Admin Dashboard**: Full CRUD operations for sections and user management
- **PayMongo Integration**: Secure payment processing for subscriptions
- **Modern UI**: Glassmorphism effects, gradients, and smooth animations
- **Dark Mode**: Full dark mode support

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Clerk account (for authentication)
- PayMongo account (for payments)
- Free AI API key (see configuration below)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/shopifydevguy1-ops/shopify-section-app.git
   cd shopify-section-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Fill in all required environment variables (see Configuration section below).

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

#### Database
- `DATABASE_URL`: PostgreSQL connection string

#### Clerk Authentication
1. Sign up at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key and secret key
4. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`

**Setting Admin Role:**
- In Clerk Dashboard, go to Users → select a user → Metadata
- Add `role: "admin"` to public metadata

#### AI API Key
Get a free AI API key from: https://github.com/cheahjs/free-llm-api-resources

Popular options:
- **OpenAI** (requires API key)
- **Anthropic Claude** (requires API key)
- **Free alternatives** listed in the GitHub repo above

Set:
- `AI_API_KEY`: Your API key
- `AI_API_URL`: API endpoint URL (default: OpenAI)
- `AI_MODEL`: Model name (default: gpt-3.5-turbo)

#### PayMongo
1. Sign up at [paymongo.com](https://paymongo.com)
2. Get your secret and public keys from the dashboard
3. Set `PAYMONGO_SECRET_KEY` and `PAYMONGO_PUBLIC_KEY`

#### App URL
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., `http://localhost:3000` for local, or your production URL)

## 📁 Section Templates

### Adding Section Templates

1. **Via Admin Dashboard** (Recommended)
   - Log in as admin
   - Go to Admin Dashboard → Sections
   - Click "Add Section"
   - Fill in name, tags, and Liquid template code

2. **Via File System**
   - Create a `/sections` folder in the project root
   - Add `.json` or `.liquid` files

   **JSON Format:**
   ```json
   {
     "name": "Hero Banner",
     "tags": ["hero", "banner", "landing"],
     "content": "<!-- Your Liquid template code here -->"
   }
   ```

   **Liquid Format:**
   - Just the `.liquid` file with your template code
   - Filename will be used as the section name

## 🚢 Deployment to Z.com

### Prerequisites
- Z.com hosting account
- PostgreSQL database (Z.com provides this)
- Domain name (optional)

### Deployment Steps

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Prepare for deployment**
   - Ensure all environment variables are set in Z.com's environment settings
   - Make sure `NEXT_PUBLIC_APP_URL` points to your Z.com domain

3. **Upload files**
   - Upload the entire project to your Z.com hosting
   - Or use Git deployment if Z.com supports it

4. **Database setup**
   - Create a PostgreSQL database in Z.com
   - Update `DATABASE_URL` in environment variables
   - Run migrations:
     ```bash
     npx prisma db push
     ```

5. **Configure webhooks**
   - PayMongo webhook URL: `https://yourdomain.com/api/paymongo/webhook`
   - Configure in PayMongo dashboard

6. **Build configuration**
   - Z.com should detect Next.js automatically
   - Build command: `npm run build`
   - Start command: `npm start`

### Z.com Specific Configuration

If needed, create a `.htaccess` file for static file serving:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## 🔧 Development

### Database Commands
```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes
npm run db:push

# Create migration
npm run db:migrate

# Open Prisma Studio
npm run db:studio
```

### Project Structure
```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   ├── pricing/           # Pricing page
│   └── account/           # User account page
├── components/            # React components
│   └── ui/               # ShadCN UI components
├── lib/                   # Utility functions
│   ├── ai.ts             # AI integration
│   ├── auth.ts           # Authentication helpers
│   ├── db.ts             # Database client
│   ├── paymongo.ts       # PayMongo integration
│   └── sections.ts       # Section management
├── prisma/               # Prisma schema
├── sections/             # Section templates (optional)
└── public/              # Static assets
```

## 🔐 Admin Setup

To set a user as admin:

1. **Via Clerk Dashboard:**
   - Go to Users → select user
   - Click on Metadata tab
   - Add to Public metadata:
     ```json
     {
       "role": "admin"
     }
   ```

2. **Via Database:**
   - Update user's Clerk metadata directly in database (not recommended)

## 💳 PayMongo Integration

### Subscription Flow

1. User clicks "Upgrade to Pro" on pricing page
2. App creates a PayMongo subscription
3. User completes payment
4. Webhook updates user subscription status
5. User gets Pro features

### Webhook Configuration

1. In PayMongo Dashboard:
   - Go to Webhooks
   - Add webhook URL: `https://yourdomain.com/api/paymongo/webhook`
   - Select events: `subscription.updated`, `subscription.payment_succeeded`, `subscription.cancelled`

2. Test webhook locally using ngrok or similar tool

## 📊 Database Schema

- **User**: Stores user data, subscription type, generation count
- **Section**: Section templates library
- **GenerationLog**: Tracks all section generations
- **SubscriptionHistory**: Payment and subscription records

## 🐛 Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check `DATABASE_URL` format
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Clerk authentication not working**
   - Verify keys are correct
   - Check middleware configuration
   - Ensure routes are properly protected

3. **AI generation failing**
   - Verify API key is valid
   - Check API URL and model name
   - Review API rate limits

4. **PayMongo webhook not working**
   - Verify webhook URL is accessible
   - Check webhook signature verification
   - Review PayMongo logs

## 📝 License

This project is private and proprietary.

## 🤝 Support

For issues and questions, please contact the development team.

## 🎯 Roadmap

- [ ] Add more section templates
- [ ] Implement section preview
- [ ] Add section versioning
- [ ] Export sections as ZIP
- [ ] Add section marketplace
- [ ] Implement analytics dashboard

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

