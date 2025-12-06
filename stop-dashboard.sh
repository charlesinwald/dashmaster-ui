#!/bin/bash

# Stop Dashboard Script for Chromebook
# This kills the SSH tunnel

echo "Stopping dashboard tunnel..."

# Find and kill SSH tunnel process
pkill -f "ssh.*3000:localhost:3000"

if [ $? -eq 0 ]; then
    echo "✓ Dashboard tunnel stopped!"
else
    echo "No tunnel found running."
fi
