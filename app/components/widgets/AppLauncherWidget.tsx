'use client';

import { useState } from 'react';
import { AppShortcut } from '@/types';

const defaultApps: AppShortcut[] = [
  { id: '1', name: 'Firefox', command: 'firefox &' },
  { id: '2', name: 'Chrome', command: 'google-chrome &' },
  { id: '3', name: 'Terminal', command: 'gnome-terminal &' },
  { id: '4', name: 'File Manager', command: 'nautilus &' },
  { id: '5', name: 'VS Code', command: 'code &' },
  { id: '6', name: 'Spotify', command: 'spotify &' },
];

export default function AppLauncherWidget() {
  const [apps, setApps] = useState<AppShortcut[]>(defaultApps);
  const [launching, setLaunching] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newApp, setNewApp] = useState({ name: '', command: '' });

  const launchApp = async (app: AppShortcut) => {
    setLaunching(app.id);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ssh/launch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: app.command }),
      });
      const result = await response.json();
      if (!result.success) {
        alert(`Failed to launch ${app.name}: ${result.message}`);
      }
    } catch (err) {
      alert(`Error launching ${app.name}`);
    } finally {
      setLaunching(null);
    }
  };

  const addApp = () => {
    if (newApp.name && newApp.command) {
      const app: AppShortcut = {
        id: Date.now().toString(),
        name: newApp.name,
        command: newApp.command,
      };
      setApps([...apps, app]);
      setNewApp({ name: '', command: '' });
      setShowAddForm(false);
    }
  };

  const deleteApp = (id: string) => {
    setApps(apps.filter(app => app.id !== id));
  };

  return (
    <div className="h-full bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-2xl p-6 text-white relative overflow-auto">
      <div className="drag-handle cursor-move absolute top-2 right-2 opacity-50 hover:opacity-100 z-10">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">App Launcher</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-2xl leading-none hover:scale-110 transition-transform"
        >
          +
        </button>
      </div>

      {showAddForm && (
        <div className="mb-4 p-3 bg-white/20 rounded-lg">
          <input
            type="text"
            placeholder="App Name"
            value={newApp.name}
            onChange={(e) => setNewApp({ ...newApp, name: e.target.value })}
            className="w-full p-2 mb-2 rounded bg-white/30 placeholder-white/70 text-white border-none outline-none"
          />
          <input
            type="text"
            placeholder="Command (e.g., firefox &)"
            value={newApp.command}
            onChange={(e) => setNewApp({ ...newApp, command: e.target.value })}
            className="w-full p-2 mb-2 rounded bg-white/30 placeholder-white/70 text-white border-none outline-none"
          />
          <button
            onClick={addApp}
            className="w-full p-2 bg-white/40 rounded hover:bg-white/50 transition-colors"
          >
            Add App
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {apps.map((app) => (
          <div key={app.id} className="relative group">
            <button
              onClick={() => launchApp(app)}
              disabled={launching === app.id}
              className="w-full p-4 bg-white/20 hover:bg-white/30 rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-sm font-medium truncate">{app.name}</div>
            </button>
            <button
              onClick={() => deleteApp(app.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
