#!/bin/bash

# DashMaster Auto-Start Setup Script
# This script sets up the application to run automatically on boot

set -e

echo "========================================="
echo "DashMaster Auto-Start Setup"
echo "========================================="
echo ""

# Check if running as root for systemd installation
if [ "$EUID" -eq 0 ]; then
    echo "Error: Please run this script as a normal user (without sudo)"
    echo "The script will prompt for sudo when needed"
    exit 1
fi

# Get the current directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
cd "$SCRIPT_DIR"

# Step 1: Build the application
echo "Step 1: Building the application..."
npm run build
echo "✓ Build complete"
echo ""

# Step 2: Create logs directory
echo "Step 2: Creating logs directory..."
mkdir -p logs
echo "✓ Logs directory created"
echo ""

# Step 3: Start with PM2
echo "Step 3: Starting application with PM2..."
npm run pm2:start
echo "✓ Application started"
echo ""

# Step 4: Save PM2 process list
echo "Step 4: Saving PM2 process list..."
npm run pm2:save
echo "✓ PM2 process list saved"
echo ""

# Step 5: Setup PM2 to start on boot (user-level)
echo "Step 5: Setting up PM2 auto-start on boot..."
echo "Running: pm2 startup"
npm run pm2:startup
echo ""
echo "IMPORTANT: Copy and run the command shown above with sudo"
echo ""

# Step 6: Display status
echo "Step 6: Checking application status..."
npm run pm2:status
echo ""

echo "========================================="
echo "Setup Instructions:"
echo "========================================="
echo ""
echo "1. Copy the 'sudo' command shown above and run it"
echo "2. After running the sudo command, run: npm run pm2:save"
echo ""
echo "Optional: Install as systemd service (alternative to PM2 startup)"
echo "   sudo cp dashmaster.service /etc/systemd/system/"
echo "   sudo systemctl daemon-reload"
echo "   sudo systemctl enable dashmaster"
echo "   sudo systemctl start dashmaster"
echo ""
echo "========================================="
echo "Useful Commands:"
echo "========================================="
echo ""
echo "  npm run pm2:status    - Check application status"
echo "  npm run pm2:logs      - View application logs"
echo "  npm run pm2:restart   - Restart application"
echo "  npm run pm2:stop      - Stop application"
echo "  npm run pm2:monit     - Monitor in real-time"
echo ""
echo "Setup complete!"
