# Quick Start Guide

Get your dashboard running in 5 minutes!

## Step 1: Configure SSH Access

1. **Find your desktop's IP address:**
   On your desktop, run:
   ```bash
   hostname -I
   ```
   Example output: `192.168.1.100`

2. **Enable SSH on your desktop** (if not already enabled):
   ```bash
   sudo apt install openssh-server
   sudo systemctl enable ssh
   sudo systemctl start ssh
   ```

3. **Test SSH connection from Chromebook:**
   ```bash
   ssh your-username@192.168.1.100
   ```

## Step 2: Get Weather API Key

1. Visit [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Copy your API key from the dashboard

## Step 3: Configure Environment

Edit the `.env` file in the project root:

```bash
# Replace with your desktop's IP
DESKTOP_SSH_HOST=192.168.1.100

# Replace with your desktop username
DESKTOP_SSH_USER=your-username

# Replace with your desktop password
DESKTOP_SSH_PASSWORD=your-password

# Paste your WeatherAPI.com key
WEATHER_API_KEY=your-api-key-here

# Set your location
WEATHER_LOCATION=New York

# Choose units (imperial or metric)
WEATHER_UNITS=imperial
```

## Step 4: Run the Dashboard

```bash
yarn dev
```

Open your browser to **http://localhost:3000**

That's it! Your dashboard should now be running.

## Quick Tips

### Add Custom Apps
1. Click the `+` button in the App Launcher widget
2. Enter app name and command
3. Common commands:
   - Firefox: `firefox &`
   - Chrome: `google-chrome &`
   - VS Code: `code &`
   - File Manager: `nautilus &`

### Rearrange Widgets
- Grab the three-dot icon (⋮) in the top-right of any widget
- Drag to reposition
- Resize by dragging the corner
- Your layout is saved automatically

### Using on Chromebook
For the best experience:
1. Enable Developer Mode (optional, for SSH key setup)
2. Connect to the same WiFi as your desktop
3. Bookmark http://localhost:3000
4. For full-screen: Press F11 or use Chrome's full-screen mode

## Troubleshooting

**Can't connect to desktop?**
- Make sure both devices are on the same network
- Verify SSH is running: `sudo systemctl status ssh`
- Check firewall allows SSH: `sudo ufw allow ssh`

**Weather not showing?**
- Verify your API key is correct
- Check you haven't exceeded the free tier limit (1M calls/month)

**System monitor shows 0%?**
- The SSH commands are Linux-specific
- Test manually: `ssh user@ip "top -bn1"`

## Next Steps

- See [README.md](./README.md) for full documentation
- Customize app shortcuts for your workflow
- Add calendar events and reminders
- Create quick notes

Enjoy your dashboard! 🚀
