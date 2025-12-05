import express, { Request, Response } from 'express';
import googleCalendarService from '../services/googleCalendarService';

const router = express.Router();

// Check if Google Calendar is connected
router.get('/status', async (req: Request, res: Response) => {
  try {
    const connected = await googleCalendarService.isConnected();
    res.json({ connected });
  } catch (error) {
    res.status(500).json({ error: 'Failed to check connection status' });
  }
});

// Get Google OAuth URL
router.get('/connect', (req: Request, res: Response) => {
  try {
    const authUrl = googleCalendarService.getAuthUrl();
    res.json({ authUrl });
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate auth URL'
    });
  }
});

// OAuth callback
router.get('/oauth2callback', async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).send('No authorization code provided');
    }

    await googleCalendarService.getTokenFromCode(code);

    // Redirect back to the dashboard
    res.send(`
      <html>
        <head>
          <title>Google Calendar Connected</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 3rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
            h1 { margin-bottom: 1rem; }
            p { margin-bottom: 2rem; opacity: 0.9; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Google Calendar Connected!</h1>
            <p>You can close this window and return to your dashboard.</p>
            <script>
              setTimeout(() => {
                window.close();
              }, 2000);
            </script>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send(`
      <html>
        <head>
          <title>Connection Failed</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: rgba(255, 255, 255, 0.1);
              padding: 3rem;
              border-radius: 1rem;
              backdrop-filter: blur(10px);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✗ Connection Failed</h1>
            <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// Disconnect Google Calendar
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    await googleCalendarService.disconnect();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to disconnect' });
  }
});

// Get Google Calendar events
router.get('/events', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    console.log(`Fetching events for next ${days} days...`);
    const events = await googleCalendarService.getUpcomingEvents(days);
    console.log(`Found ${events.length} events`);
    console.log('Events:', JSON.stringify(events, null, 2));
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch events'
    });
  }
});

export default router;
