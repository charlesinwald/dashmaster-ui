import express, { Request, Response } from 'express';
import path from 'path';
import sshService from '../services/sshService';
import photoCache from '../services/photoCache';

const router = express.Router();

// Get list of images from configured folder (on desktop via SSH)
router.get('/list', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');

    // Check if folder exists on desktop
    const exists = await sshService.checkPhotoFolderExists(photoFolder);

    if (!exists) {
      return res.status(404).json({
        error: 'Photo folder not found on desktop',
        path: photoFolder
      });
    }

    // List photos via SSH
    const files = await sshService.listPhotos(photoFolder);

    const images = files.map(file => ({
      filename: file,
      path: `/api/photos/image/${encodeURIComponent(file)}`
    }));

    res.json({
      folder: photoFolder,
      count: images.length,
      images
    });
  } catch (error) {
    console.error('Error listing photos:', error);
    res.status(500).json({
      error: 'Failed to list photos from desktop',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Serve individual image (fetch from desktop via SSH/SFTP with caching)
router.get('/image/:filename', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');
    const filename = decodeURIComponent(req.params.filename);

    // Security: Prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(403).json({ error: 'Access denied - invalid filename' });
    }

    // Try to get from cache first
    let imageBuffer = await photoCache.get(photoFolder, filename);

    if (!imageBuffer) {
      // Cache miss - fetch from desktop via SSH/SFTP
      imageBuffer = await sshService.getPhotoFile(photoFolder, filename);

      // Store in cache for future requests
      const ext = path.extname(filename).toLowerCase();
      const contentTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.bmp': 'image/bmp'
      };
      const contentType = contentTypes[ext] || 'application/octet-stream';

      await photoCache.set(photoFolder, filename, imageBuffer, contentType);
    }

    // Set appropriate content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({
      error: 'Failed to serve image from desktop',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get current photo folder configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');
    const exists = await sshService.checkPhotoFolderExists(photoFolder);
    const cacheStats = photoCache.getStats();

    res.json({
      photoFolder,
      exists,
      default: !process.env.PHOTO_FOLDER,
      location: 'desktop (via SSH)',
      cache: {
        memoryEntries: cacheStats.memoryEntries,
        memorySize: `${(cacheStats.memorySize / 1024 / 1024).toFixed(2)} MB`,
        diskEntries: cacheStats.diskEntries
      }
    });
  } catch (error) {
    console.error('Error getting photo config:', error);
    res.status(500).json({
      error: 'Failed to get configuration from desktop',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear photo cache
router.post('/cache/clear', async (req: Request, res: Response) => {
  try {
    photoCache.clear();
    res.json({ success: true, message: 'Photo cache cleared' });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      error: 'Failed to clear cache',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get cache statistics
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const stats = photoCache.getStats();
    res.json({
      memoryEntries: stats.memoryEntries,
      memorySize: `${(stats.memorySize / 1024 / 1024).toFixed(2)} MB`,
      diskEntries: stats.diskEntries
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      error: 'Failed to get cache statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
