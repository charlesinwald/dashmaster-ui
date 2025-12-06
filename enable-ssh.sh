#!/bin/bash

# Enable SSH Server on Desktop
# Run this script on your DESKTOP (not Chromebook)

echo "========================================="
echo "Enabling SSH Server"
echo "========================================="
echo ""

# Start SSH service
echo "Starting SSH service..."
sudo systemctl start sshd

# Enable SSH to start on boot
echo "Enabling SSH to start on boot..."
sudo systemctl enable sshd

# Check status
echo ""
echo "SSH Status:"
sudo systemctl status sshd --no-pager

# Show IP address
echo ""
echo "Your desktop IP addresses:"
ip addr show | grep "inet " | grep -v "127.0.0.1"

echo ""
echo "✓ SSH server is now running!"
echo "You can now run the scp commands from your Chromebook."
