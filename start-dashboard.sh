#!/bin/bash

# Start Dashboard Script for Chromebook
# This creates an SSH tunnel and opens the dashboard in Chrome

echo "Starting dashboard tunnel..."

# Check if tunnel is already running
if pgrep -f "ssh.*5000:localhost:5000" > /dev/null; then
    echo "Dashboard tunnel is already running!"
    echo "Opening dashboard in Chrome..."
    xdg-open http://localhost:5000 2>/dev/null || google-chrome http://localhost:5000 2>/dev/null
    exit 0
fi

# Start SSH tunnel in background
ssh -f -N -L 5000:localhost:5000 charles@192.168.1.164

if [ $? -eq 0 ]; then
    echo "✓ Dashboard tunnel started!"
    echo "Opening dashboard in Chrome..."

    # Wait a moment for tunnel to establish
    sleep 1

    # Open Chrome
    xdg-open http://localhost:5000 2>/dev/null || google-chrome http://localhost:5000 2>/dev/null

    echo ""
    echo "Dashboard is now running at: http://localhost:5000"
    echo ""
    echo "To stop the tunnel, run: ./stop-dashboard.sh"
else
    echo "✗ Failed to start tunnel. Please check:"
    echo "  1. Your desktop is powered on"
    echo "  2. You've run chromebook-setup.sh first"
    echo "  3. Your desktop is reachable at 192.168.1.164"
fi
