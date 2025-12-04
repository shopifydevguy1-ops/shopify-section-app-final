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

Z.com uses cPanel, and setting environment variables for Node.js/Next.js applications can be done through several methods. Try these options in order:

#### Method 1: Node.js Application Manager (Recommended)

1. **Navigate to Node.js Application Manager**
   - In your cPanel dashboard, look for **"Node.js"** or **"Node.js App"** section
   - Click on **"+ CREATE APPLICATION"** or edit an existing application

2. **Configure Application Settings**
   - **Node.js version**: Select 18.x or higher (recommended: latest LTS version)
   - **Application mode**: Select "Production"
   - **Application root**: Enter the path to your application (e.g., `/home/azwywnto/repositories/shopify-section-app`)
     - ⚠️ **Important**: The path must NOT contain spaces. If you see an error "Directory should not contain spaces", check your path carefully
   - **Application URL**: Enter your domain (e.g., `shopifysectiongen.com`)
   - **Application startup file**: 
     - For Next.js, you may need to create a `server.js` file, or the system might handle `npm start` automatically
     - If using `server.js`, create it in your app root with:
       ```javascript
       const { createServer } = require('http')
       const { parse } = require('url')
       const next = require('next')
       
       const dev = process.env.NODE_ENV !== 'production'
       const hostname = 'localhost'
       const port = process.env.PORT || 3000
       
       const app = next({ dev, hostname, port })
       const handle = app.getRequestHandler()
       
       app.prepare().then(() => {
         createServer(async (req, res) => {
           try {
             const parsedUrl = parse(req.url, true)
             await handle(req, res, parsedUrl)
           } catch (err) {
             console.error('Error occurred handling', req.url, err)
             res.statusCode = 500
             res.end('internal server error')
           }
         }).listen(port, (err) => {
           if (err) throw err
           console.log(`> Ready on http://${hostname}:${port}`)
         })
       })
       ```
     - Alternatively, some Node.js managers allow you to specify `npm start` as the command

3. **Set Environment Variables**
   - Scroll down to the **"Environment variables"** section
   - Click **"+ ADD VARIABLE"** button for each variable you need to add
   - Add the following variables (click "DONE" after each one):
     
     **Required Variables:**
     - `DATABASE_URL` = `postgresql://azwywnto_kram:YOUR_PASSWORD@localhost:5432/azwywnto_shopify_section_generator`
       - ⚠️ **Important**: Make sure the full connection string is entered (it appears your current one might be cut off)
       - Replace `YOUR_PASSWORD` with your actual database password
       - URL-encode special characters in the password if needed
     
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...` (your Clerk publishable key)
     - `CLERK_SECRET_KEY` = `sk_live_...` (your Clerk secret key)
     - `AI_API_KEY` = `your_api_key` (your AI API key)
     - `AI_API_URL` = `https://api.openai.com/v1/chat/completions`
     - `AI_MODEL` = `gpt-3.5-turbo`
     - `PAYMONGO_SECRET_KEY` = `sk_live_...` (your PayMongo secret key)
     - `PAYMONGO_PUBLIC_KEY` = `pk_live_...` (your PayMongo public key)
     - `NEXT_PUBLIC_APP_URL` = `https://shopifysectiongen.com` (your production URL)
     - `NODE_ENV` = `production` (this is usually set automatically by "Production" mode)

4. **Fix Common Issues**
   
   **Error: "Directory should not contain spaces"**
   - This error appears if your application root path contains spaces
   - **Solution**: 
     1. Check your path: `/home/azwywnto/repositories/shopify-section-app` ✅ (no spaces)
     2. If you see spaces, remove them or use hyphens/underscores
     3. Make sure the directory actually exists at that path
     4. Try refreshing the page and re-entering the path
     5. If the error persists, the directory might not exist yet - create it first via File Manager
   
   **Incomplete DATABASE_URL**
   - Your DATABASE_URL appears to be cut off: `postgresql://azwywnto_kram:Zaiza`
   - **Solution**: 
     1. Click on the DATABASE_URL row to edit it
     2. Enter the complete connection string:
        ```
        postgresql://azwywnto_kram:YOUR_PASSWORD@localhost:5432/azwywnto_shopify_section_generator
        ```
     3. Replace `YOUR_PASSWORD` with your actual database password
     4. Make sure the entire string is visible and not truncated
     5. Click "DONE" to save
   
   **Variables not saving**
   - Click "DONE" after entering each variable (don't just click away)
   - Make sure there are no special characters that need URL-encoding in values
   - If a value contains `@`, `#`, `$`, etc., URL-encode them (e.g., `@` becomes `%40`)
   
   **Missing Environment Variables**
   - Make sure you add ALL required variables listed above
   - Don't forget `NEXT_PUBLIC_` prefix for variables that need to be accessible in the browser

5. **Create the Application**
   - Review all settings and environment variables
   - Click the **"CREATE"** button (top right)
   - Wait for the application to be created and started

#### Method 2: Using .env File (Alternative)

If Application Manager is not available, you can create a `.env` file in your project root:

1. **Access File Manager**
   - In cPanel, click on **"File Manager"**
   - Navigate to your application's root directory (usually `public_html` or your domain folder)

2. **Create .env File**
   - Click **"New File"** or **"Create File"**
   - Name it `.env` (with the dot at the beginning)
   - Open the file for editing

3. **Add Environment Variables**
   - Add the following content (replace with your actual values):
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
   - Save the file

4. **Set File Permissions**
   - Right-click on `.env` file → **"Change Permissions"**
   - Set permissions to `600` (read/write for owner only) for security
   - This prevents others from reading your sensitive data

#### Method 3: Using SSH (If you have SSH access)

1. **Connect via SSH**
   - Use an SSH client to connect to your server
   - Navigate to your application directory

2. **Create .env File**
   ```bash
   cd ~/public_html  # or your app directory
   nano .env
   ```

3. **Add Environment Variables**
   - Add all the variables as shown in Method 2
   - Save and exit (Ctrl+X, then Y, then Enter)

4. **Set Permissions**
   ```bash
   chmod 600 .env
   ```

#### Required Environment Variables

Regardless of which method you use, you need to set these variables:

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

#### Troubleshooting

- **Can't find Application Manager**: Your hosting plan might not include Node.js support. Contact Z.com support to enable it or use Method 2 (.env file)
- **.env file not working**: Make sure the file is in the root directory where your `package.json` is located
- **Variables not loading**: Restart your Node.js application after setting environment variables
- **Still having issues**: Contact Z.com support and ask about setting environment variables for Node.js/Next.js applications

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
   - Use one of the methods described in Step 2 (Application Manager, .env file, or SSH)
   - Set the `DATABASE_URL` environment variable with your connection string
   - Example: `DATABASE_URL=postgresql://azwywnto_kram:YOUR_PASSWORD@localhost:5432/azwywnto_shopify_section_generator`

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

