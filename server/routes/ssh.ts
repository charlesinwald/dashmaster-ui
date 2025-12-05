import express, { Request, Response } from 'express';
import sshService from '../services/sshService';

const router = express.Router();

// Launch an application on the desktop
router.post('/launch', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const result = await sshService.launchApp(command);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to launch application'
    });
  }
});

// Execute a custom command
router.post('/execute', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const output = await sshService.executeCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to execute command'
    });
  }
});

export default router;
