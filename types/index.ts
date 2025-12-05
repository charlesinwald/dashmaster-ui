export interface WeatherData {
  temperature: number;
  condition: string;
  icon: string;
  humidity: number;
  feelsLike: number;
  location: string;
}

export interface SystemInfo {
  cpu: number;
  memory: number;
  disk: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'event' | 'reminder';
  completed?: boolean;
}

export interface AppShortcut {
  id: string;
  name: string;
  command: string;
  icon?: string;
}
