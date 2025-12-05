'use client';

import { useState, useEffect } from 'react';
import { SystemInfo } from '@/types';

export default function SystemMonitorWidget() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/system/info`);
      if (!response.ok) throw new Error('Failed to fetch system info');
      const data = await response.json();
      setSystemInfo(data);
      setError(null);
    } catch (err) {
      setError('Unable to connect');
    } finally {
      setLoading(false);
    }
  };

  const getColor = (value: number) => {
    if (value < 50) return 'bg-green-500';
    if (value < 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="h-full bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl shadow-2xl p-6 text-white relative">
      <div className="drag-handle cursor-move absolute top-2 right-2 opacity-50 hover:opacity-100">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold mb-4">Desktop Monitor</h3>

      {loading && <div className="flex items-center justify-center h-24">Loading...</div>}

      {error && <div className="flex items-center justify-center h-24 text-red-200">{error}</div>}

      {systemInfo && !loading && !error && (
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>CPU</span>
              <span>{systemInfo.cpu.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getColor(systemInfo.cpu)} transition-all`}
                style={{ width: `${systemInfo.cpu}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Memory</span>
              <span>{systemInfo.memory.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getColor(systemInfo.memory)} transition-all`}
                style={{ width: `${systemInfo.memory}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Disk</span>
              <span>{systemInfo.disk.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${getColor(systemInfo.disk)} transition-all`}
                style={{ width: `${systemInfo.disk}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
