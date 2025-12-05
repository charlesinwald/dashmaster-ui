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

export interface AppShortcut {
  id: string;
  name: string;
  command: string;
  icon?: string;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
}

export type WidgetId = 'clock' | 'weather' | 'system' | 'apps' | 'calendar' | 'notes';
