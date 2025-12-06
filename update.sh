#!/bin/bash

# DashMaster Update Script
# Automatically updates and restarts the application

set -e

echo "========================================="
echo "🔄 DashMaster Update Script"
echo "========================================="
echo ""

# Change to script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Pull changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes from git..."
    git pull
    echo "✓ Git pull complete"
    echo ""
else
    echo "ℹ️  Not a git repository, skipping pull"
    echo ""
fi

# Install dependencies
echo "📦 Installing/updating dependencies..."
npm install
echo "✓ Dependencies installed"
echo ""

# Build application
echo "🏗️  Building application..."
npm run build
echo "✓ Build complete"
echo ""

# Restart PM2
echo "🔄 Restarting application with PM2..."
if pm2 list | grep -q "dashmaster"; then
    npm run pm2:restart
    echo "✓ Application restarted"
else
    echo "⚠️  Application not running in PM2, starting fresh..."
    npm run pm2:start
    echo "✓ Application started"
fi
echo ""

# Wait a moment for processes to stabilize
sleep 2

# Check status
echo "========================================="
echo "✅ Update Complete!"
echo "========================================="
echo ""
npm run pm2:status
echo ""

# Display URLs
echo "========================================="
echo "🌐 Application URLs:"
echo "========================================="
echo ""
echo "  Dashboard:    http://localhost:5000"
echo "  API Health:   http://localhost:5001/api/health"
echo ""
echo "========================================="
echo "📊 Useful Commands:"
echo "========================================="
echo ""
echo "  npm run pm2:logs     - View application logs"
echo "  npm run pm2:monit    - Monitor in real-time"
echo "  npm run pm2:restart  - Restart application"
echo ""
echo "✨ Update complete! Your dashboard is ready."
