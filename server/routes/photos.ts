import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// Get list of images from configured folder
router.get('/list', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');

    if (!fs.existsSync(photoFolder)) {
      return res.status(404).json({
        error: 'Photo folder not found',
        path: photoFolder
      });
    }

    const files = fs.readdirSync(photoFolder);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

    const images = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => ({
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
    res.status(500).json({ error: 'Failed to list photos' });
  }
});

// Serve individual image
router.get('/image/:filename', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(photoFolder, filename);

    // Security: Prevent directory traversal
    const resolvedPath = path.resolve(filePath);
    const resolvedFolder = path.resolve(photoFolder);

    if (!resolvedPath.startsWith(resolvedFolder)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
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

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Get current photo folder configuration
router.get('/config', async (req: Request, res: Response) => {
  try {
    const photoFolder = process.env.PHOTO_FOLDER || path.join(process.env.HOME || '', 'Pictures');
    const exists = fs.existsSync(photoFolder);

    res.json({
      photoFolder,
      exists,
      default: !process.env.PHOTO_FOLDER
    });
  } catch (error) {
    console.error('Error getting photo config:', error);
    res.status(500).json({ error: 'Failed to get configuration' });
  }
});

export default router;
