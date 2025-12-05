import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

interface Note {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  date: string;
  time?: string;
  type: 'event' | 'reminder';
  completed?: boolean;
}

interface LayoutConfig {
  layouts: any;
}

interface WidgetConfig {
  id: string;
  name: string;
  enabled: boolean;
}

interface WidgetsConfig {
  widgets: WidgetConfig[];
}

class DataService {
  private notesFile = path.join(DATA_DIR, 'notes.json');
  private calendarFile = path.join(DATA_DIR, 'calendar.json');
  private layoutFile = path.join(DATA_DIR, 'layout.json');
  private widgetsFile = path.join(DATA_DIR, 'widgets.json');

  async ensureDataDir() {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  async ensureFile(filePath: string, defaultData: any) {
    try {
      await fs.access(filePath);
    } catch {
      await fs.writeFile(filePath, JSON.stringify(defaultData, null, 2));
    }
  }

  // Notes methods
  async getNotes(): Promise<Note[]> {
    await this.ensureDataDir();
    await this.ensureFile(this.notesFile, []);
    const data = await fs.readFile(this.notesFile, 'utf-8');
    return JSON.parse(data);
  }

  async addNote(content: string): Promise<Note> {
    const notes = await this.getNotes();
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    notes.push(newNote);
    await fs.writeFile(this.notesFile, JSON.stringify(notes, null, 2));
    return newNote;
  }

  async updateNote(id: string, content: string): Promise<Note | null> {
    const notes = await this.getNotes();
    const noteIndex = notes.findIndex(n => n.id === id);
    if (noteIndex === -1) return null;

    notes[noteIndex].content = content;
    notes[noteIndex].updatedAt = new Date().toISOString();
    await fs.writeFile(this.notesFile, JSON.stringify(notes, null, 2));
    return notes[noteIndex];
  }

  async deleteNote(id: string): Promise<boolean> {
    const notes = await this.getNotes();
    const filtered = notes.filter(n => n.id !== id);
    if (filtered.length === notes.length) return false;

    await fs.writeFile(this.notesFile, JSON.stringify(filtered, null, 2));
    return true;
  }

  // Calendar methods
  async getCalendarEvents(): Promise<CalendarEvent[]> {
    await this.ensureDataDir();
    await this.ensureFile(this.calendarFile, []);
    const data = await fs.readFile(this.calendarFile, 'utf-8');
    return JSON.parse(data);
  }

  async addCalendarEvent(event: Omit<CalendarEvent, 'id'>): Promise<CalendarEvent> {
    const events = await this.getCalendarEvents();
    const newEvent: CalendarEvent = {
      ...event,
      id: Date.now().toString(),
    };
    events.push(newEvent);
    await fs.writeFile(this.calendarFile, JSON.stringify(events, null, 2));
    return newEvent;
  }

  async updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent | null> {
    const events = await this.getCalendarEvents();
    const eventIndex = events.findIndex(e => e.id === id);
    if (eventIndex === -1) return null;

    events[eventIndex] = { ...events[eventIndex], ...updates };
    await fs.writeFile(this.calendarFile, JSON.stringify(events, null, 2));
    return events[eventIndex];
  }

  async deleteCalendarEvent(id: string): Promise<boolean> {
    const events = await this.getCalendarEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;

    await fs.writeFile(this.calendarFile, JSON.stringify(filtered, null, 2));
    return true;
  }

  // Layout methods
  async getLayout(): Promise<LayoutConfig> {
    await this.ensureDataDir();
    await this.ensureFile(this.layoutFile, { layouts: {} });
    const data = await fs.readFile(this.layoutFile, 'utf-8');
    return JSON.parse(data);
  }

  async saveLayout(layouts: any): Promise<LayoutConfig> {
    await this.ensureDataDir();
    const layoutConfig = { layouts };
    await fs.writeFile(this.layoutFile, JSON.stringify(layoutConfig, null, 2));
    return layoutConfig;
  }

  // Widget settings methods
  async getWidgets(): Promise<WidgetsConfig> {
    await this.ensureDataDir();
    await this.ensureFile(this.widgetsFile, { widgets: [] });
    const data = await fs.readFile(this.widgetsFile, 'utf-8');
    return JSON.parse(data);
  }

  async saveWidgets(widgets: WidgetConfig[]): Promise<WidgetsConfig> {
    await this.ensureDataDir();
    const widgetsConfig = { widgets };
    await fs.writeFile(this.widgetsFile, JSON.stringify(widgetsConfig, null, 2));
    return widgetsConfig;
  }
}

export default new DataService();
