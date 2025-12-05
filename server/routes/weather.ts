import express, { Request, Response } from 'express';
import weatherService from '../services/weatherService';

const router = express.Router();

// Debug endpoint to check config
router.get('/debug', (req: Request, res: Response) => {
  res.json({
    hasApiKey: !!process.env.WEATHER_API_KEY,
    apiKeyLength: process.env.WEATHER_API_KEY?.length || 0,
    location: process.env.WEATHER_LOCATION,
    units: process.env.WEATHER_UNITS,
  });
});

// Get current weather
router.get('/current', async (req: Request, res: Response) => {
  try {
    const weather = await weatherService.getCurrentWeather();
    res.json(weather);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch weather'
    });
  }
});

// Get weather forecast
router.get('/forecast', async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 3;
    const forecast = await weatherService.getForecast(days);
    res.json(forecast);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch forecast'
    });
  }
});

export default router;
