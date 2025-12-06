# DashMaster Update Guide

## When You Update the Project

### Quick Update Process

```bash
# 1. Navigate to project directory
cd /home/charles/Code/dashmaster/dashmaster-ui

# 2. Pull latest changes (if using git)
git pull

# 3. Install any new dependencies
npm install

# 4. Rebuild the application
npm run build

# 5. Restart PM2
npm run pm2:restart
```

That's it! The application will reload with zero downtime.

---

## Detailed Update Scenarios

### Scenario 1: Code Changes Only

If you only changed code (no new dependencies):

```bash
npm run build
npm run pm2:restart
```

### Scenario 2: New Dependencies Added

If `package.json` was updated:

```bash
npm install
npm run build
npm run pm2:restart
```

### Scenario 3: Environment Variables Changed

If `.env` file was updated:

```bash
# Edit .env file with new variables
nano .env

# Restart to pick up new environment
npm run pm2:restart
```

### Scenario 4: Server Code Changes

If only backend (`server/`) was changed:

```bash
# Option A: Restart just the server
pm2 restart dashmaster-server

# Option B: Full restart (safer)
npm run pm2:restart
```

### Scenario 5: Frontend Code Changes

If only frontend (app/, components/) was changed:

```bash
npm run build
pm2 restart dashmaster-next
```

---

## Development Workflow

### Working on Features Locally

```bash
# 1. Stop PM2 (to free up ports)
npm run pm2:stop

# 2. Run in development mode
npm run dev

# 3. Make your changes...

# 4. When done, rebuild and restart PM2
npm run build
npm run pm2:start
```

### Testing Before Deploy

```bash
# Build and test locally
npm run build
npm run start

# If good, switch to PM2
# (Stop the manual start with Ctrl+C first)
npm run pm2:restart
```

---

## Update Checklist

- [ ] Stop development server if running (`Ctrl+C`)
- [ ] Pull latest code (`git pull`)
- [ ] Install dependencies (`npm install`)
- [ ] Update `.env` if needed
- [ ] Build application (`npm run build`)
- [ ] Restart PM2 (`npm run pm2:restart`)
- [ ] Check status (`npm run pm2:status`)
- [ ] Verify in browser (`http://localhost:3000`)
- [ ] Check logs if issues (`npm run pm2:logs`)

---

## Troubleshooting Updates

### Build Fails

```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try build again
npm run build
```

### Application Won't Restart

```bash
# Delete from PM2
npm run pm2:delete

# Kill any lingering processes
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9

# Start fresh
npm run pm2:start
```

### Changes Not Showing

```bash
# Hard refresh browser (clear cache)
Ctrl+Shift+R (or Cmd+Shift+R)

# Or rebuild and restart
npm run build
npm run pm2:restart
```

### PM2 Process Issues

```bash
# Check what's running
npm run pm2:status

# View recent logs
npm run pm2:logs --lines 50

# Nuclear option: restart PM2 daemon
pm2 kill
npm run pm2:start
```

---

## Version Control Integration

### If Using Git

```bash
# See what changed
git status
git diff

# Pull and update
git pull
npm install
npm run build
npm run pm2:restart

# Push your changes
git add .
git commit -m "Your changes"
git push
```

### If Syncing from Desktop

```bash
# Option A: rsync from desktop
rsync -avz user@desktop:/path/to/dashmaster/ /home/charles/Code/dashmaster/

# Option B: Copy specific files
scp user@desktop:/path/to/file ./

# Then update
npm install
npm run build
npm run pm2:restart
```

---

## Rollback Procedure

### If Update Breaks Something

```bash
# 1. Revert to previous git commit
git log --oneline  # Find previous commit hash
git checkout <previous-commit-hash>

# 2. Reinstall that version's dependencies
npm install

# 3. Rebuild
npm run build

# 4. Restart
npm run pm2:restart
```

### Emergency Fallback

```bash
# Stop everything
npm run pm2:delete

# Run in basic mode (for debugging)
npm run dev
```

---

## Best Practices

1. **Always build before restart**: `npm run build` before `npm run pm2:restart`
2. **Check status after update**: `npm run pm2:status`
3. **Monitor logs briefly**: `npm run pm2:logs` (Ctrl+C to exit)
4. **Test in browser**: Open `http://localhost:3000`
5. **Keep backup**: Consider `git tag v1.0` before major changes

---

## Automated Update Script

Create `update.sh`:

```bash
#!/bin/bash
set -e

echo "🔄 Updating DashMaster..."

# Pull changes (if using git)
if [ -d .git ]; then
    echo "📥 Pulling latest changes..."
    git pull
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build
echo "🏗️  Building application..."
npm run build

# Restart PM2
echo "🔄 Restarting application..."
npm run pm2:restart

# Check status
echo "✅ Update complete!"
echo ""
npm run pm2:status

echo ""
echo "🌐 Dashboard: http://localhost:3000"
```

Make it executable:
```bash
chmod +x update.sh
```

Then just run:
```bash
./update.sh
```

---

## Summary

**Most Common Update Command:**
```bash
git pull && npm install && npm run build && npm run pm2:restart
```

**Quick Status Check:**
```bash
npm run pm2:status && npm run pm2:logs --lines 20
```

That's it! Updates are simple and PM2 handles the process management for you.
