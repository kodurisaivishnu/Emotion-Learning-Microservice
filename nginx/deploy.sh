#!/bin/bash

# Deployment Script for Render (Fixed for Free Tier)
echo "Preparing deployment for Render..."

# Remove any Docker files that cause deployment issues
if [ -f "Dockerfile" ]; then
    echo "Removing Dockerfile to use native Node.js deployment..."
    rm Dockerfile
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing Git repository..."
    git init
    echo "Git initialized"
else
    echo "Git repository already exists"
fi

# Add all files to git
echo "Adding files to git..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to commit"
else
    # Commit changes
    echo "Committing changes..."
    git commit -m "Fix: Remove Dockerfile for native Node.js deployment on Render"
    echo "Changes committed"
fi

# Check if main branch exists
if ! git show-ref --verify --quiet refs/heads/main; then
    echo "Creating main branch..."
    git branch -M main
fi

echo ""
echo "FIXED RENDER DEPLOYMENT STEPS:"
echo "==============================="
echo ""
echo "IMPORTANT: The Docker error is now fixed!"
echo ""
echo "1. Create GitHub Repository:"
echo "   - Go to https://github.com/new"
echo "   - Name: nginx-reverse-proxy"
echo "   - Make it public"
echo "   - Do NOT initialize with README"
echo ""
echo "2. Connect and Push:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/nginx-reverse-proxy.git"
echo "   git push -u origin main"
echo ""
echo "3. Deploy on Render (FREE TIER):"
echo "   - Go to https://dashboard.render.com"
echo "   - Click 'New' → 'Web Service'"
echo "   - Connect your GitHub repository"
echo "   - IMPORTANT SETTINGS:"
echo "     * Name: nginx-reverse-proxy"
echo "     * Environment: Node"
echo "     * Build Command: npm install"
echo "     * Start Command: npm start"
echo "     * Health Check Path: /health"
echo "     * Auto Deploy: Yes"
echo ""
echo "4. Environment Variables (set in Render):"
echo "   NODE_ENV=production"
echo ""
echo "5. Your services will be available at:"
echo "   https://your-service.onrender.com/api/auth/*"
echo "   https://your-service.onrender.com/api/emotion-service/*"
echo "   https://your-service.onrender.com/api/logs/*"
echo "   https://your-service.onrender.com/api/send-email/*"
echo "   https://your-service.onrender.com/api/upload/*"
echo "   https://your-service.onrender.com/api/videos/*"
echo ""
echo "The Dockerfile has been removed to prevent Docker deployment issues."
echo "Render will now use native Node.js deployment which works on free tier."
echo ""
echo "All files are ready for deployment!"