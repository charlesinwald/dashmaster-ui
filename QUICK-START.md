# DashMaster Quick Start Guide

## First Time Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your settings
```

### 3. Build the Application
```bash
npm run build
```

## Running the Application

### Development Mode (Manual)
```bash
npm run dev
```
- Frontend: http://localhost:5000
- Backend: http://localhost:5001

### Production Mode (Always Running)

**Option A: Automated Setup (Recommended)**
```bash
./setup-autostart.sh
```

**Option B: Manual Setup**
```bash
# 1. Build
npm run build

# 2. Start with PM2
npm run pm2:start

# 3. Save PM2 process list
npm run pm2:save

# 4. Setup auto-start on boot
npm run pm2:startup
# Copy and run the sudo command shown

# 5. Save again
npm run pm2:save
```

## Common Commands

### PM2 Process Management
```bash
npm run pm2:status    # Check status
npm run pm2:logs      # View logs
npm run pm2:restart   # Restart app
npm run pm2:stop      # Stop app
npm run pm2:monit     # Monitor resources
```

### Application URLs
- **Dashboard**: http://localhost:5000
- **API Health**: http://localhost:5001/api/health

## Features

✅ **Automatic Restart**: App restarts if it crashes
✅ **Auto-Start on Boot**: Survives system reboots
✅ **Connection Resilience**: Graceful handling of desktop disconnection
✅ **Real-time Monitoring**: System stats, weather, calendar, photos
✅ **Customizable Layout**: Drag and drop widgets

## Troubleshooting

### App Not Starting
```bash
# Check PM2 status
npm run pm2:status

# View logs
npm run pm2:logs

# Rebuild
npm run build
npm run pm2:restart
```

### Port Already in Use
```bash
# Kill processes on ports
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Restart
npm run pm2:restart
```

### Desktop Connection Issues
- Check `.env` file has correct SSH credentials
- Verify desktop is reachable: `ping DESKTOP_SSH_HOST`
- Check SSH service is running on desktop

## Next Steps

- Read [AUTO-START.md](./AUTO-START.md) for detailed setup
- Configure widgets in the dashboard
- Set up Google Calendar integration (if needed)
- Add desktop SSH credentials for system monitoring

## Support

Check logs for errors:
```bash
npm run pm2:logs              # All logs
pm2 logs dashmaster-next      # Frontend logs
pm2 logs dashmaster-server    # Backend logs
```
