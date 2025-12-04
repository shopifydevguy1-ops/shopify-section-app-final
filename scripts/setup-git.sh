#!/bin/bash

# Setup script for GitHub repository
# This script helps initialize the git repository and connect to GitHub

echo "🚀 Setting up Shopify Section Generator for GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
fi

# Add all files
echo "📝 Adding files to git..."
git add .

# Check if remote exists
if ! git remote | grep -q origin; then
    echo "🔗 Please add your GitHub remote:"
    echo "   git remote add origin https://github.com/shopifydevguy1-ops/shopify-section-app.git"
    echo ""
    echo "Then run:"
    echo "   git branch -M main"
    echo "   git push -u origin main"
else
    echo "✅ Git remote already configured"
    echo ""
    echo "To push to GitHub, run:"
    echo "   git commit -m 'Initial commit: Shopify Section Generator'"
    echo "   git push -u origin main"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure environment variables (see SETUP.md)"
echo "2. Install dependencies: npm install"
echo "3. Set up database: npx prisma db push"
echo "4. Run development server: npm run dev"

