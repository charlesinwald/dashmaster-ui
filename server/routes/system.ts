import express, { Request, Response } from 'express';
import sshService from '../services/sshService';

const router = express.Router();

// Get system information from desktop
router.get('/info', async (req: Request, res: Response) => {
  try {
    const systemInfo = await sshService.getSystemInfo();
    res.json(systemInfo);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch system info'
    });
  }
});

export default router;
