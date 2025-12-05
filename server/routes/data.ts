import express, { Request, Response } from 'express';
import dataService from '../services/dataService';

const router = express.Router();

// Notes endpoints
router.get('/notes', async (req: Request, res: Response) => {
  try {
    const notes = await dataService.getNotes();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

router.post('/notes', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }
    const note = await dataService.addNote(content);
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create note' });
  }
});

router.put('/notes/:id', async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const note = await dataService.updateNote(req.params.id, content);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update note' });
  }
});

router.delete('/notes/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await dataService.deleteNote(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

// Calendar endpoints
router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const events = await dataService.getCalendarEvents();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar events' });
  }
});

router.post('/calendar', async (req: Request, res: Response) => {
  try {
    const event = await dataService.addCalendarEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create calendar event' });
  }
});

router.put('/calendar/:id', async (req: Request, res: Response) => {
  try {
    const event = await dataService.updateCalendarEvent(req.params.id, req.body);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update event' });
  }
});

router.delete('/calendar/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await dataService.deleteCalendarEvent(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Layout endpoints
router.get('/layout', async (req: Request, res: Response) => {
  try {
    const layout = await dataService.getLayout();
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch layout' });
  }
});

router.post('/layout', async (req: Request, res: Response) => {
  try {
    const layout = await dataService.saveLayout(req.body.layouts);
    res.json(layout);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save layout' });
  }
});

// Widget settings endpoints
router.get('/widgets', async (req: Request, res: Response) => {
  try {
    const widgets = await dataService.getWidgets();
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch widget settings' });
  }
});

router.post('/widgets', async (req: Request, res: Response) => {
  try {
    const widgets = await dataService.saveWidgets(req.body.widgets);
    res.json(widgets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save widget settings' });
  }
});

export default router;
