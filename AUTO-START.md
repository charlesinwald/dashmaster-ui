# DashMaster Auto-Start Configuration

This guide explains how to set up DashMaster to run continuously and automatically start on system boot.

## Overview

DashMaster uses **PM2** (Process Manager 2) to:
- Keep the application running continuously
- Automatically restart if it crashes
- Auto-start on system boot/reboot
- Provide logging and monitoring capabilities
- Manage both Next.js frontend and Express backend

## Quick Start

### Automated Setup

Run the setup script:

```bash
./setup-autostart.sh
```

Follow the on-screen instructions to complete the setup.

### Manual Setup

If you prefer manual setup:

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start with PM2:**
   ```bash
   npm run pm2:start
   ```

3. **Save PM2 process list:**
   ```bash
   npm run pm2:save
   ```

4. **Setup PM2 auto-start on boot:**
   ```bash
   npm run pm2:startup
   ```

   This will output a command like:
   ```bash
   sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u charles --hp /home/charles
   ```

   **Copy and run that command.**

5. **Save the configuration again:**
   ```bash
   npm run pm2:save
   ```

## PM2 Commands

### Starting & Stopping

```bash
# Start the application
npm run pm2:start

# Stop the application
npm run pm2:stop

# Restart the application
npm run pm2:restart

# Delete from PM2 (stop and remove)
npm run pm2:delete
```

### Monitoring & Logs

```bash
# View application status
npm run pm2:status

# View logs (all apps)
npm run pm2:logs

# View logs for specific app
pm2 logs dashmaster-next
pm2 logs dashmaster-server

# Real-time monitoring dashboard
npm run pm2:monit
```

### Process Management

```bash
# Save current PM2 process list
npm run pm2:save

# Resurrect saved processes
pm2 resurrect

# Clear all logs
pm2 flush
```

## Configuration

### PM2 Ecosystem File

The application is configured in `ecosystem.config.js`:

```javascript
{
  apps: [
    {
      name: 'dashmaster-next',      // Next.js frontend (port 5000)
      script: 'node_modules/.bin/next',
      args: 'start',
      instances: 1,
      autorestart: true,            // Auto-restart on crash
      max_memory_restart: '500M',   // Restart if exceeds 500MB
    },
    {
      name: 'dashmaster-server',    // Express backend (port 5001)
      script: 'ts-node',
      args: '--project tsconfig.server.json server/index.ts',
      instances: 1,
      autorestart: true,
      max_memory_restart: '300M',
    },
  ],
}
```

### Logs Location

All logs are stored in the `./logs` directory:

- `next-error.log` - Next.js error output
- `next-out.log` - Next.js standard output
- `next-combined.log` - Next.js combined output
- `server-error.log` - Express server error output
- `server-out.log` - Express server standard output
- `server-combined.log` - Express server combined output

## Alternative: Systemd Service (Advanced)

For a more traditional Linux service approach, you can use systemd instead of PM2's auto-start:

### Install Systemd Service

```bash
# Copy service file
sudo cp dashmaster.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable service (auto-start on boot)
sudo systemctl enable dashmaster

# Start service
sudo systemctl start dashmaster

# Check status
sudo systemctl status dashmaster
```

### Systemd Commands

```bash
# Start service
sudo systemctl start dashmaster

# Stop service
sudo systemctl stop dashmaster

# Restart service
sudo systemctl restart dashmaster

# View logs
sudo journalctl -u dashmaster -f
```

**Note:** Choose either PM2 startup OR systemd service, not both.

## Troubleshooting

### Application Not Starting

1. Check PM2 status:
   ```bash
   npm run pm2:status
   ```

2. View logs for errors:
   ```bash
   npm run pm2:logs
   ```

3. Ensure application is built:
   ```bash
   npm run build
   ```

### Auto-Start Not Working After Reboot

1. Verify PM2 startup is configured:
   ```bash
   pm2 startup
   ```

2. Ensure process list is saved:
   ```bash
   npm run pm2:save
   ```

3. Check if PM2 daemon is running:
   ```bash
   pm2 status
   ```

### High Memory Usage

PM2 will automatically restart the application if it exceeds:
- 500MB for Next.js frontend
- 300MB for Express backend

You can adjust these limits in `ecosystem.config.js`.

### Port Already in Use

If ports 5000 or 5001 are already in use:

1. Stop the PM2 processes:
   ```bash
   npm run pm2:stop
   ```

2. Find and kill the process using the port:
   ```bash
   lsof -ti:5000 | xargs kill -9
   lsof -ti:5001 | xargs kill -9
   ```

3. Restart PM2:
   ```bash
   npm run pm2:start
   ```

## Environment Variables

Ensure you have a `.env` file in the project root with:

```env
# Backend URL for frontend
NEXT_PUBLIC_API_URL=http://localhost:5001

# SSH Configuration (if using desktop connection)
DESKTOP_SSH_HOST=192.168.1.100
DESKTOP_SSH_PORT=22
DESKTOP_SSH_USER=yourusername
DESKTOP_SSH_PASSWORD=yourpassword
# OR
# DESKTOP_SSH_PRIVATE_KEY_PATH=/path/to/private/key
```

## Updating the Application

When you update the code:

```bash
# 1. Pull latest changes
git pull

# 2. Install dependencies (if needed)
npm install

# 3. Rebuild
npm run build

# 4. Restart PM2
npm run pm2:restart
```

## Complete Removal

To completely remove PM2 auto-start:

```bash
# Stop and delete all processes
npm run pm2:delete

# Remove PM2 startup
pm2 unstartup systemd

# (If using systemd) Disable and remove service
sudo systemctl disable dashmaster
sudo systemctl stop dashmaster
sudo rm /etc/systemd/system/dashmaster.service
sudo systemctl daemon-reload
```

## Features

✅ **Automatic Restart**: Crashes are handled automatically
✅ **Auto-Start on Boot**: Survives system reboots
✅ **Process Monitoring**: Real-time CPU and memory monitoring
✅ **Log Management**: Centralized logging with rotation
✅ **Zero Downtime**: Graceful reload capabilities
✅ **Resource Limits**: Automatic restart on memory threshold

## Support

For issues or questions:
- Check logs: `npm run pm2:logs`
- View status: `npm run pm2:status`
- Monitor: `npm run pm2:monit`
