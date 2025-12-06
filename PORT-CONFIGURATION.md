# Port Configuration Guide

## Current Port Configuration

DashMaster uses the following ports:

- **Frontend (Next.js)**: Port **5000**
- **Backend (Express API)**: Port **5001**

## How Ports Are Configured

### 1. PM2 Ecosystem Configuration

File: `ecosystem.config.js`

```javascript
{
  apps: [
    {
      name: 'dashmaster-next',
      env: {
        PORT: 5000,  // Frontend port
      },
    },
    {
      name: 'dashmaster-server',
      env: {
        PORT: 5001,  // Backend port
      },
    },
  ],
}
```

### 2. Environment Variables

File: `.env`

```env
# Backend server port
PORT=5001

# Backend API URL (used by frontend to connect to backend)
NEXT_PUBLIC_API_URL=http://localhost:5001
```

### 3. Proxy Handler

File: `app/api/proxy-handler.ts`

```typescript
const EXPRESS_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
```

## Changing Ports

If you need to use different ports, update these files:

### Step 1: Update ecosystem.config.js

```javascript
// Change PORT values
env: {
  PORT: YOUR_FRONTEND_PORT,  // e.g., 8080
}

env: {
  PORT: YOUR_BACKEND_PORT,   // e.g., 8081
}
```

### Step 2: Update .env

```env
PORT=YOUR_BACKEND_PORT
NEXT_PUBLIC_API_URL=http://localhost:YOUR_BACKEND_PORT
```

### Step 3: Update Google Calendar Redirect (if using)

```env
GOOGLE_REDIRECT_URI=http://localhost:YOUR_BACKEND_PORT/api/calendar/oauth2callback
```

Also update this in your [Google Cloud Console](https://console.cloud.google.com/apis/credentials).

### Step 4: Rebuild and Restart

```bash
npm run build
npm run pm2:restart
```

## Port Conflicts

### Check What's Using a Port

```bash
# Check if port 5000 is in use
lsof -i :5000

# Check if port 5001 is in use
lsof -i :5001

# See all listening ports
ss -tlnp | grep LISTEN
```

### Kill Process on a Port

```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Kill process on port 5001
lsof -ti:5001 | xargs kill -9
```

### Common Port Conflicts

- **Port 5000**: Often used by other Next.js/React apps
- **Port 3001**: Common development backend port
- **Port 5000**: Sometimes used by macOS AirPlay Receiver
- **Port 8080**: Common alternative HTTP port

## Firewall Configuration

If accessing from other devices on your network:

### Check Firewall Status (Manjaro/Arch)

```bash
sudo ufw status
```

### Allow Ports Through Firewall

```bash
# Allow frontend port
sudo ufw allow 5000/tcp

# Allow backend port
sudo ufw allow 5001/tcp

# Enable firewall
sudo ufw enable
```

## Network Access

### Access from Same Machine

```
http://localhost:5000
```

### Access from Other Devices on Network

Replace `localhost` with your Chromebook's IP address:

```bash
# Find your IP address
ip addr show | grep "inet "
```

Then access from other devices:
```
http://YOUR_CHROMEBOOK_IP:5000
```

**Note**: Update `.env` if you want to allow external access:

```env
# For external access
NEXT_PUBLIC_API_URL=http://YOUR_CHROMEBOOK_IP:5001
```

## Development vs Production Ports

### Development Mode

Uses Next.js dev server defaults unless specified:

```bash
npm run dev
# Frontend typically starts on first available: 5000, 3001, etc.
# Backend uses PORT from .env: 5001
```

### Production Mode (PM2)

Uses ports specified in `ecosystem.config.js`:

```bash
npm run pm2:start
# Frontend: 5000 (fixed)
# Backend: 5001 (fixed)
```

## Troubleshooting

### Port Already in Use

**Error**: `EADDRINUSE: address already in use :::5000`

**Solution**:
```bash
# Find what's using the port
lsof -i :5000

# Kill it
lsof -ti:5000 | xargs kill -9

# Or stop PM2 properly
npm run pm2:stop
```

### Frontend Can't Connect to Backend

**Error**: `Failed to connect to backend API`

**Check**:
1. Backend is running: `npm run pm2:status`
2. Backend port matches in `.env`: `NEXT_PUBLIC_API_URL=http://localhost:5001`
3. Rebuild after changing .env: `npm run build && npm run pm2:restart`

### Google Calendar Not Working After Port Change

**Problem**: OAuth redirect fails

**Solution**:
1. Update `.env` with new redirect URI
2. Update [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
3. Add authorized redirect URI: `http://localhost:YOUR_NEW_PORT/api/calendar/oauth2callback`

## Port Recommendations

### Good Port Choices

- **8080/8081**: Standard alternative HTTP ports
- **4000/4001**: Common Node.js development ports
- **5000/5001**: Python Flask default (current choice)
- **9000/9001**: Less commonly used, good for avoiding conflicts

### Ports to Avoid

- **80/443**: Require root privileges
- **22**: SSH (system critical)
- **3306**: MySQL
- **5432**: PostgreSQL
- **6379**: Redis
- **27017**: MongoDB

## Quick Port Change Script

Create `change-ports.sh`:

```bash
#!/bin/bash

NEW_FRONTEND_PORT=$1
NEW_BACKEND_PORT=$2

if [ -z "$NEW_FRONTEND_PORT" ] || [ -z "$NEW_BACKEND_PORT" ]; then
    echo "Usage: ./change-ports.sh <frontend-port> <backend-port>"
    echo "Example: ./change-ports.sh 8080 8081"
    exit 1
fi

echo "Changing ports to $NEW_FRONTEND_PORT (frontend) and $NEW_BACKEND_PORT (backend)..."

# Update ecosystem.config.js
sed -i "s/PORT: [0-9]*,  \/\/ Frontend/PORT: $NEW_FRONTEND_PORT,  \/\/ Frontend/g" ecosystem.config.js
sed -i "s/PORT: [0-9]*,  \/\/ Backend/PORT: $NEW_BACKEND_PORT,  \/\/ Backend/g" ecosystem.config.js

# Update .env
sed -i "s/^PORT=.*/PORT=$NEW_BACKEND_PORT/" .env
sed -i "s|NEXT_PUBLIC_API_URL=.*|NEXT_PUBLIC_API_URL=http://localhost:$NEW_BACKEND_PORT|" .env
sed -i "s|GOOGLE_REDIRECT_URI=.*|GOOGLE_REDIRECT_URI=http://localhost:$NEW_BACKEND_PORT/api/calendar/oauth2callback|" .env

echo "✓ Ports updated!"
echo "Run: npm run build && npm run pm2:restart"
```

Make it executable:
```bash
chmod +x change-ports.sh
```

Use it:
```bash
./change-ports.sh 8080 8081
```

## Summary

- **Frontend Port**: Controlled by `ecosystem.config.js` → `PORT: 5000`
- **Backend Port**: Controlled by `ecosystem.config.js` → `PORT: 5001`
- **Frontend → Backend Connection**: Controlled by `.env` → `NEXT_PUBLIC_API_URL`
- **After Changes**: Always rebuild → `npm run build && npm run pm2:restart`

For most users, the default ports **5000** and **5001** work well and avoid common conflicts.
