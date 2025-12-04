#!/bin/bash
# Script to fix the server.js merge conflict on cPanel server
# Run this via SSH or cPanel Terminal

cd /home/azwywnto/repositories/shopify-section-app || {
    echo "Error: Failed to change directory to /home/azwywnto/repositories/shopify-section-app" >&2
    echo "Please verify the directory exists and is accessible." >&2
    exit 1
}

# Remove the untracked server.js file
if [ -f "server.js" ] && ! git ls-files --error-unmatch server.js >/dev/null 2>&1; then
    echo "Removing untracked server.js file..."
    rm server.js
    echo "server.js removed successfully"
else
    echo "server.js is tracked in git or doesn't exist"
fi

# Now try to pull
echo "Attempting to pull from remote..."
git pull origin main

echo "Done!"

