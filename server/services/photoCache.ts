import fs from 'fs';
import path from 'path';

interface CacheEntry {
  buffer: Buffer;
  timestamp: number;
  contentType: string;
}

class PhotoCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cacheDir: string;
  private maxAge: number = 24 * 60 * 60 * 1000; // 24 hours
  private maxMemorySize: number = 50 * 1024 * 1024; // 50MB in memory
  private currentMemorySize: number = 0;

  constructor() {
    this.cacheDir = path.join(process.cwd(), '.cache', 'photos');
    this.ensureCacheDir();
  }

  private ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  private getCacheKey(photoFolder: string, filename: string): string {
    return `${photoFolder}:${filename}`;
  }

  private getDiskCachePath(key: string): string {
    const hash = Buffer.from(key).toString('base64').replace(/[/+=]/g, '_');
    return path.join(this.cacheDir, hash);
  }

  async get(photoFolder: string, filename: string): Promise<Buffer | null> {
    const key = this.getCacheKey(photoFolder, filename);
    const now = Date.now();

    // Check memory cache first
    const memEntry = this.cache.get(key);
    if (memEntry && (now - memEntry.timestamp) < this.maxAge) {
      console.log(`Photo cache HIT (memory): ${filename}`);
      return memEntry.buffer;
    }

    // Check disk cache
    const diskPath = this.getDiskCachePath(key);
    if (fs.existsSync(diskPath)) {
      const stats = fs.statSync(diskPath);
      if ((now - stats.mtimeMs) < this.maxAge) {
        console.log(`Photo cache HIT (disk): ${filename}`);
        const buffer = fs.readFileSync(diskPath);

        // Promote to memory cache if there's space
        if (this.currentMemorySize + buffer.length <= this.maxMemorySize) {
          const ext = path.extname(filename).toLowerCase();
          const contentTypes: { [key: string]: string } = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.bmp': 'image/bmp'
          };
          this.cache.set(key, {
            buffer,
            timestamp: now,
            contentType: contentTypes[ext] || 'application/octet-stream'
          });
          this.currentMemorySize += buffer.length;
        }

        return buffer;
      } else {
        // Expired, delete it
        fs.unlinkSync(diskPath);
      }
    }

    console.log(`Photo cache MISS: ${filename}`);
    return null;
  }

  async set(photoFolder: string, filename: string, buffer: Buffer, contentType: string): Promise<void> {
    const key = this.getCacheKey(photoFolder, filename);
    const now = Date.now();

    // Store to disk
    const diskPath = this.getDiskCachePath(key);
    fs.writeFileSync(diskPath, buffer);

    // Store to memory if there's space
    if (this.currentMemorySize + buffer.length <= this.maxMemorySize) {
      this.cache.set(key, { buffer, timestamp: now, contentType });
      this.currentMemorySize += buffer.length;
    } else {
      // Evict oldest entries from memory if needed
      this.evictOldest();
      if (this.currentMemorySize + buffer.length <= this.maxMemorySize) {
        this.cache.set(key, { buffer, timestamp: now, contentType });
        this.currentMemorySize += buffer.length;
      }
    }

    console.log(`Photo cached: ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  private evictOldest(): void {
    if (this.cache.size === 0) return;

    let oldestKey: string | null = null;
    let oldestTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.currentMemorySize -= entry.buffer.length;
        this.cache.delete(oldestKey);
        console.log(`Evicted from memory cache: ${oldestKey}`);
      }
    }
  }

  clear(): void {
    this.cache.clear();
    this.currentMemorySize = 0;

    // Clear disk cache
    if (fs.existsSync(this.cacheDir)) {
      const files = fs.readdirSync(this.cacheDir);
      for (const file of files) {
        fs.unlinkSync(path.join(this.cacheDir, file));
      }
    }

    console.log('Photo cache cleared');
  }

  getStats(): { memoryEntries: number; memorySize: number; diskEntries: number } {
    let diskEntries = 0;
    if (fs.existsSync(this.cacheDir)) {
      diskEntries = fs.readdirSync(this.cacheDir).length;
    }

    return {
      memoryEntries: this.cache.size,
      memorySize: this.currentMemorySize,
      diskEntries
    };
  }
}

export default new PhotoCache();
