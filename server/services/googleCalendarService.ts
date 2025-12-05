import { google } from 'googleapis';
import fs from 'fs/promises';
import path from 'path';

const TOKEN_PATH = path.join(process.cwd(), 'data', 'google-token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  location?: string;
}

class GoogleCalendarService {
  private _oauth2Client: any = null;

  private get oauth2Client(): any {
    if (this._oauth2Client) {
      return this._oauth2Client;
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/api/calendar/oauth2callback';

    if (!clientId || !clientSecret) {
      throw new Error('Google Calendar OAuth not configured');
    }

    this._oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    console.log('Google Calendar: OAuth client initialized successfully!');
    return this._oauth2Client;
  }

  private isConfigured(): boolean {
    return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  }

  getAuthUrl(): string {
    if (!this.isConfigured()) {
      throw new Error('Google Calendar OAuth not configured');
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
  }

  async getTokenFromCode(code: string): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Google Calendar OAuth not configured');
    }

    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);

    await fs.mkdir(path.dirname(TOKEN_PATH), { recursive: true });
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens));

    return tokens;
  }

  async loadSavedToken(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const token = await fs.readFile(TOKEN_PATH, 'utf-8');
      this.oauth2Client.setCredentials(JSON.parse(token));
      return true;
    } catch (error) {
      return false;
    }
  }

  async isConnected(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    const hasToken = await this.loadSavedToken();
    if (!hasToken) {
      return false;
    }

    try {
      const credentials = this.oauth2Client.credentials;
      return !!credentials.access_token;
    } catch (error) {
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    try {
      await fs.unlink(TOKEN_PATH);
      this.oauth2Client.setCredentials({});
    } catch (error) {
      // Token file doesn't exist, that's fine
    }
  }

  async getEvents(maxResults: number = 10): Promise<GoogleCalendarEvent[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Calendar OAuth not configured');
    }

    await this.loadSavedToken();

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items as GoogleCalendarEvent[] || [];
  }

  async getUpcomingEvents(days: number = 7): Promise<GoogleCalendarEvent[]> {
    if (!this.isConfigured()) {
      throw new Error('Google Calendar OAuth not configured');
    }

    await this.loadSavedToken();

    const calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });

    const now = new Date();
    const future = new Date();
    future.setDate(future.getDate() + days);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: now.toISOString(),
      timeMax: future.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    return response.data.items as GoogleCalendarEvent[] || [];
  }
}

export default new GoogleCalendarService();
