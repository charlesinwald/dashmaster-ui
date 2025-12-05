import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sshRoutes from './routes/ssh';
import weatherRoutes from './routes/weather';
import systemRoutes from './routes/system';
import dataRoutes from './routes/data';
import calendarRoutes from './routes/calendar';

dotenv.config();

console.log('=== Environment Variables Debug ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('GOOGLE_CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
console.log('=====================================');

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ssh', sshRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/calendar', calendarRoutes);

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`⚡️ Express server running on port ${port}`);
});
