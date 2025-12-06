#!/bin/bash

# Chromebook Dashboard Setup Script
# This script sets up SSH key authentication so you don't need to enter password each time

echo "========================================="
echo "Chromebook Dashboard Setup"
echo "========================================="
echo ""

# Install required packages
echo "Installing required packages..."
sudo apt update
sudo apt install -y openssh-client sshpass

# Check if SSH key already exists
if [ ! -f ~/.ssh/id_rsa ]; then
    echo ""
    echo "Generating SSH key..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "SSH key generated!"
fi

# Copy SSH key to desktop
echo ""
echo "Setting up passwordless SSH to desktop..."
echo "You'll need to enter your desktop password ONE TIME:"
ssh-copy-id charles@192.168.1.164

if [ $? -eq 0 ]; then
    echo ""
    echo "✓ Setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Run: ./start-dashboard.sh"
    echo "2. Open Chrome and go to: http://localhost:5000"
    echo ""
else
    echo ""
    echo "✗ Setup failed. Please check your desktop is reachable at 192.168.1.164"
    exit 1
fi
