'use client';

import { useState, useEffect } from 'react';
import { Note } from '@/types';

export default function NotesWidget() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/notes`);
      const data = await response.json();
      setNotes(data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    }
  };

  const addNote = async () => {
    if (!newNote.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newNote }),
      });
      const note = await response.json();
      setNotes([...notes, note]);
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
    }
  };

  const updateNote = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: editContent }),
      });
      const updated = await response.json();
      setNotes(notes.map(n => n.id === id ? updated : n));
      setEditingId(null);
      setEditContent('');
    } catch (err) {
      console.error('Failed to update note:', err);
    }
  };

  const deleteNote = async (id: string) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/data/notes/${id}`, {
        method: 'DELETE',
      });
      setNotes(notes.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete note:', err);
    }
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setEditContent(note.content);
  };

  return (
    <div className="h-full bg-gradient-to-br from-pink-500 to-pink-700 rounded-xl shadow-2xl p-6 text-white relative overflow-auto">
      <div className="drag-handle cursor-move absolute top-2 right-2 opacity-50 hover:opacity-100 z-10">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold mb-4">Quick Notes</h3>

      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addNote()}
          placeholder="Add a note..."
          className="flex-1 p-3 rounded-lg bg-white/20 placeholder-white/70 text-white border-none outline-none"
        />
        <button
          onClick={addNote}
          className="px-6 py-3 bg-white/30 hover:bg-white/40 rounded-lg transition-colors touch-manipulation"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="bg-white/20 p-3 rounded-lg">
            {editingId === note.id ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="flex-1 p-2 rounded bg-white/30 text-white border-none outline-none"
                  autoFocus
                />
                <button
                  onClick={() => updateNote(note.id)}
                  className="px-3 py-2 bg-green-500 hover:bg-green-600 rounded text-sm"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="px-3 py-2 bg-gray-500 hover:bg-gray-600 rounded text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <p className="flex-1">{note.content}</p>
                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => startEdit(note)}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-sm hover:scale-110 transition-transform"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
