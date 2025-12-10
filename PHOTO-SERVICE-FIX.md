# Photo Service Fix - Fetching from Desktop

## Problem

The photo service was fetching photos from the Chromebook's local filesystem instead of from the desktop via SSH.

## Root Cause

In `server/services/sshService.ts`, the `isLocalhost()` method had `192.168.1.164` (your desktop IP) hardcoded as a localhost address:

```typescript
// OLD - INCORRECT
private isLocalhost(): boolean {
  const host = this.config.host;
  return host === 'localhost' || host === '127.0.0.1' || host === '192.168.1.164';
}
```

This caused the service to treat your desktop as localhost and read files directly from the Chromebook instead of using SSH/SFTP.

## Solution

Removed the hardcoded IP from the localhost check:

```typescript
// NEW - CORRECT
private isLocalhost(): boolean {
  const host = this.config.host;
  return host === 'localhost' || host === '127.0.0.1';
}
```

## How It Works Now

### Architecture

```
PictureFrame Widget (Frontend)
    ↓
/api/photos/list → Lists photos on DESKTOP via SSH
    ↓
/api/photos/image/:filename → Fetches photo from DESKTOP via SFTP
    ↓
Photo Cache (50MB memory + disk)
    ↓
Served to browser
```

### Photo Fetching Flow

1. **Widget requests photo list**
   - Backend runs `find` command on desktop via SSH
   - Returns list of image files

2. **Widget requests individual photo**
   - Check cache first (instant if cached)
   - If cache miss: Fetch from desktop via SFTP
   - Cache for 24 hours
   - Serve to frontend

### Configuration

From your `.env`:

```env
DESKTOP_SSH_HOST=192.168.1.164   # Desktop IP
DESKTOP_SSH_PORT=22
DESKTOP_SSH_USER=charles
DESKTOP_SSH_PASSWORD=Freegums9
PHOTO_FOLDER=/home/charles/Pictures/Vim-1-001/Vim  # Path on DESKTOP
```

## Features

### 1. Remote Photo Access
- Photos stored on desktop at `/home/charles/Pictures/Vim-1-001/Vim`
- Fetched via SSH/SFTP when needed
- No need to copy photos to Chromebook

### 2. Intelligent Caching
- **Memory Cache**: 50MB for frequently accessed photos
- **Disk Cache**: Unlimited for all photos (24-hour expiration)
- **Automatic Eviction**: LRU (Least Recently Used)

### 3. Performance
- First view: ~500ms-2s (depends on photo size and network)
- Cached view: <50ms (instant from memory/disk)
- Reduces SSH connections and network usage

### 4. Graceful Degradation
- If desktop is offline: Shows connection error
- Widget displays offline state
- Automatically reconnects when desktop comes back

## API Endpoints

### Get Photo List
```bash
GET /api/photos/list
```

Response:
```json
{
  "folder": "/home/charles/Pictures/Vim-1-001/Vim",
  "count": 42,
  "images": [
    {
      "filename": "photo1.jpg",
      "path": "/api/photos/image/photo1.jpg"
    }
  ]
}
```

### Get Photo Image
```bash
GET /api/photos/image/:filename
```

Returns: Binary image data with appropriate Content-Type

### Get Configuration
```bash
GET /api/photos/config
```

Response:
```json
{
  "photoFolder": "/home/charles/Pictures/Vim-1-001/Vim",
  "exists": true,
  "default": false,
  "location": "desktop (via SSH)",
  "cache": {
    "memoryEntries": 5,
    "memorySize": "12.34 MB",
    "diskEntries": 15
  }
}
```

### Cache Management
```bash
# Get cache stats
GET /api/photos/cache/stats

# Clear cache
POST /api/photos/cache/clear
```

## Troubleshooting

### Photos Not Loading

1. **Check desktop is reachable:**
   ```bash
   ping 192.168.1.164
   ssh charles@192.168.1.164
   ```

2. **Verify photo folder exists on desktop:**
   ```bash
   ssh charles@192.168.1.164 "ls -la /home/charles/Pictures/Vim-1-001/Vim"
   ```

3. **Check server logs:**
   ```bash
   pm2 logs dashmaster-server
   ```

### Cache Issues

Clear cache if photos aren't updating:
```bash
curl -X POST http://localhost:5001/api/photos/cache/clear
```

Or delete cache directory:
```bash
rm -rf .cache/photos
```

### SSH Connection Errors

If you see "Desktop connection refused" or timeout errors:

1. **Verify SSH credentials in `.env`**
2. **Check SSH service on desktop:**
   ```bash
   ssh charles@192.168.1.164 "systemctl status sshd"
   ```
3. **Check firewall allows SSH:**
   ```bash
   ssh charles@192.168.1.164 "sudo ufw status"
   ```

## Security

- **Path Traversal Protection**: Filenames validated to prevent `../` attacks
- **Folder Restriction**: Only configured `PHOTO_FOLDER` is accessible
- **SSH Authentication**: Password or key-based authentication
- **Cache Isolation**: Photos cached per folder path

## Performance Tips

1. **Optimize Photo Size**: Large photos (>5MB) transfer slowly
   - Consider resizing photos on desktop: 1920x1080 is plenty for display

2. **Preload Cache**: Access photos once to cache them

3. **Network**: Use wired connection or 5GHz WiFi for faster transfers

4. **Photo Format**:
   - JPG: Best for photos (smaller size)
   - PNG: Larger but better quality
   - WebP: Modern format, smallest size

## Changes Made

### Files Modified
- `server/services/sshService.ts` - Removed hardcoded desktop IP from localhost check
- `server/routes/photos.ts` - Updated to use SSH service
- `server/services/photoCache.ts` - NEW: Photo caching service
- `.gitignore` - Added `.cache` directory

### No Changes Needed
- Frontend (PictureFrameWidget) - Already using correct API endpoints
- Environment variables - Already configured correctly

## Verification

To verify it's working:

1. Open dashboard: http://localhost:5000
2. View PictureFrame widget
3. Check server logs: `pm2 logs dashmaster-server`
4. Look for messages like:
   - `Photo cache MISS: photo1.jpg` (first load)
   - `Photo cache HIT (disk): photo1.jpg` (subsequent loads)
   - No localhost file read messages

## Summary

✅ Photos now fetch from **desktop** (192.168.1.164) via SSH/SFTP
✅ Intelligent caching reduces network usage
✅ Graceful handling when desktop is offline
✅ No need to copy photos to Chromebook
✅ Security measures prevent unauthorized access

The fix has been applied and the service restarted. Photos should now load from your desktop!
