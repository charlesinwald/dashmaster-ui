#!/bin/bash

# Stop Dashboard Script for Chromebook
# This kills the SSH tunnel

echo "Stopping dashboard tunnel..."

# Find and kill SSH tunnel process
pkill -f "ssh.*5000:localhost:5000"

if [ $? -eq 0 ]; then
    echo "✓ Dashboard tunnel stopped!"
else
    echo "No tunnel found running."
fi
