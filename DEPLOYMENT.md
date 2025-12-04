# Deployment Guide - Z.com Hosting

This guide will help you deploy the Shopify Section Generator to Z.com hosting.

## Prerequisites

1. Z.com hosting account with Node.js support
2. PostgreSQL database (provided by Z.com or external)
3. Domain name (optional but recommended)
4. All API keys configured (Clerk, PayMongo, AI API)

## Step-by-Step Deployment

### 1. Prepare Your Application

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Test the build locally
npm start
```

### 2. Configure Environment Variables

In your Z.com hosting panel, set the following environment variables:

```
DATABASE_URL=postgresql://user:password@host:5432/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
AI_API_KEY=your_api_key
AI_API_URL=https://api.openai.com/v1/chat/completions
AI_MODEL=gpt-3.5-turbo
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_PUBLIC_KEY=pk_live_...
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### 3. Database Setup

#### Creating a PostgreSQL Database in Z.com

> **Note**: If you already have a database created (visible in "Manage My Databases"), you can skip steps 3-6 and go directly to step 7 to get your connection string.

1. **Access Your Z.com Account**
   - Log in to your Z.com account using your registered email address

2. **Navigate to the Databases Section**
   - In your control panel, locate and expand the "Databases" section
   - You should see options including:
     - phpMyAdmin
     - Manage My Databases
     - Database Wizard
     - Remote Database Access

3. **Create a New Database**
   - Click on **"Manage My Databases"** or **"Database Wizard"**
   - Select PostgreSQL as your database type (if prompted)
   - Click the option to create a new database
   - Enter your desired database name (e.g., `shopify_section_generator`)
   - Note: The database name may be prefixed with your account username automatically
   - Save/Create the database

4. **Create a Database User**
   - In the same database management interface, look for "Add User" or "Create User" option
   - Set up a username and a strong password for the database user
   - Note: The username may also be prefixed with your account username
   - Save the user credentials

5. **Assign the User to the Database**
   - Once the user is created, you'll need to assign them to the database
   - Look for "Add User to Database" or similar option
   - Select the user and database you created
   - Grant all privileges to the user for the database
   - Save the settings

7. **Get the Connection String**
   
   Since you already have a database created (visible in "Manage My Databases"), you now need to gather the connection information:
   
   **Step 7a: Access Connection Information**
   
   > **Note**: The "Remote Database Access" page is for managing which external IPs can connect to your database - it's NOT where you find connection details. For local connections (same server), you typically use `localhost`.
   
   Connection information in cPanel can be found in several places:
   
   **Option 1: Check "PostgreSQL Databases" (if available)**
   - In the "Databases" section, look for **"PostgreSQL Databases"** (separate from "Manage My Databases")
   - This may show connection details directly
   
   **Option 2: Check Server Information**
   - In cPanel, look for **"Server Information"** or **"General Information"** section
   - This shows server details that may include database host information
   
   **Option 3: Use Default Values (Most Common)**
   - For cPanel hosting, the database is usually on the same server
   - **Host**: `localhost` (this is the most common for local connections)
   - **Port**: `5432` (default PostgreSQL port)
   
   **Step 7b: Collect Required Information**
   
   From your "Manage My Databases" page, you can see:
   - ✅ **Database Name**: `azwywnto_shopify_section_generator` (already visible)
   - ✅ **Username**: `azwywnto_kram` (already visible in "Privileged Users")
   
   You still need to find:
   
   - **Host**: The database server hostname
     - **Most likely**: `localhost` (for cPanel, databases are usually on the same server)
     - **Alternative**: `127.0.0.1` (same as localhost)
     - **If different**: Check "PostgreSQL Databases" or "Server Information" sections
     - ⚠️ **Note**: "Remote Database Access" shows allowed IPs, NOT the database host - ignore that page for connection details
   
   - **Port**: The port number for PostgreSQL
     - **Default**: `5432` (use this unless specified otherwise)
     - May be shown in "PostgreSQL Databases" or server information
     - If not found, use `5432` as it's the standard PostgreSQL port
   
   - **Password**: The password for the database user `azwywnto_kram`
     - This is the password you set when creating the database user
     - If you don't remember it, you can reset it:
       1. In "Manage My Databases", scroll down to the "Database Users" section
       2. Find the user `azwywnto_kram`
       3. Look for "Change Password" or "Reset Password" option
       4. Set a new password and save it securely
     - ⚠️ **Important**: If your password contains special characters, you must URL-encode them:
       - `@` → `%40`
       - `#` → `%23`
       - `$` → `%24`
       - `%` → `%25`
       - `&` → `%26`
       - `/` → `%2F`
       - `:` → `%3A`
       - `?` → `%3F`
       - `=` → `%3D`
       - ` ` (space) → `%20`
   
   **Step 7c: Construct the Connection String**
   
   Based on what you can see, your connection string will be in this format:
   ```
   postgresql://azwywnto_kram:YOUR_PASSWORD@localhost:5432/azwywnto_shopify_section_generator
   ```
   
   Replace:
   - `YOUR_PASSWORD` with the actual password for user `azwywnto_kram` (URL-encoded if it has special characters)
   - `localhost` is the most common host for cPanel (use this unless you find a different host specified)
   - `5432` is the default PostgreSQL port (use this unless specified otherwise)
   
   **Example connection strings:**
   - If password is `mypassword123`:
     ```
     postgresql://azwywnto_kram:mypassword123@localhost:5432/azwywnto_shopify_section_generator
     ```
   - If password has special characters (e.g., `p@ss#word`):
     ```
     postgresql://azwywnto_kram:p%40ss%23word@localhost:5432/azwywnto_shopify_section_generator
     ```
   
   **Most likely connection string for your setup:**
   ```
   postgresql://azwywnto_kram:YOUR_PASSWORD@localhost:5432/azwywnto_shopify_section_generator
   ```
   
   **Step 7d: Quick Checklist**
   - [ ] Database name: `azwywnto_shopify_section_generator` ✅ (you have this)
   - [ ] Username: `azwywnto_kram` ✅ (you have this)
   - [ ] Password: _______________ (get from user settings or reset if needed)
   - [ ] Host: _______________ (check "Remote Database Access")
   - [ ] Port: `5432` (default, or check "Remote Database Access")

8. **Update Environment Variables**
   - In your Z.com hosting panel, set the `DATABASE_URL` environment variable with the connection string

9. **Run Migrations**
   ```bash
   # SSH into your Z.com server or use their database tools
   npx prisma db push
   ```

### 4. Upload Files

**Option A: Git Deployment (Recommended)**
- Connect your Z.com hosting to your GitHub repository
- Z.com will automatically deploy on push

**Option B: FTP/SFTP Upload**
- Upload all files except:
  - `node_modules/`
  - `.next/`
  - `.env` (set in hosting panel instead)
- Upload: `package.json`, `package-lock.json`, and all source files

### 5. Build Configuration

In Z.com hosting panel, configure:

- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Node Version**: 18.x or higher
- **Port**: Usually auto-detected (default: 3000)

### 6. Static File Serving

If Z.com requires static file configuration, ensure:
- Static files in `/public` are served correctly
- Next.js static exports are configured if needed

### 7. Webhook Configuration

**PayMongo Webhook:**
1. In PayMongo Dashboard → Webhooks
2. Add webhook: `https://yourdomain.com/api/paymongo/webhook`
3. Select events:
   - `subscription.updated`
   - `subscription.payment_succeeded`
   - `subscription.cancelled`

### 8. SSL Certificate

- Enable SSL/HTTPS in Z.com panel
- Required for Clerk and PayMongo webhooks

### 9. Domain Configuration

1. Point your domain to Z.com nameservers
2. Update `NEXT_PUBLIC_APP_URL` to your production domain
3. Update Clerk allowed origins in Clerk Dashboard

### 10. Testing

After deployment, test:

1. ✅ Homepage loads
2. ✅ Sign up/Sign in works
3. ✅ Dashboard accessible
4. ✅ Section generation works
5. ✅ Payment flow (test mode)
6. ✅ Admin dashboard (if admin user)
7. ✅ Webhooks receive events

## Troubleshooting

### Build Fails
- Check Node.js version (18+)
- Verify all dependencies in `package.json`
- Check build logs in Z.com panel

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database is accessible from hosting
- Ensure firewall allows connections

### API Routes Not Working
- Verify environment variables are set
- Check API route logs
- Ensure middleware is configured correctly

### Static Files Not Loading
- Check `next.config.js` output mode
- Verify public folder is uploaded
- Check file permissions

## Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] SSL certificate active
- [ ] Webhooks configured and tested
- [ ] Clerk authentication working
- [ ] PayMongo integration tested
- [ ] Admin user created
- [ ] Section templates uploaded
- [ ] Monitoring/logging set up
- [ ] Backup strategy in place

## Maintenance

### Regular Updates
1. Pull latest changes from GitHub
2. Run `npm install` to update dependencies
3. Run `npm run build` to rebuild
4. Restart application

### Database Backups
- Set up automated backups in Z.com
- Or use external backup service
- Test restore process regularly

### Monitoring
- Set up error tracking (Sentry, etc.)
- Monitor API usage and costs
- Track user signups and conversions

## Support

For Z.com specific issues, contact Z.com support.
For application issues, refer to the main README.md troubleshooting section.

