'use client';

import { useState, useEffect } from 'react';
import { SystemInfo } from '@/types';
import { useConnection } from '@/app/contexts/ConnectionContext';

export default function SystemMonitorWidget() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isHealthy } = useConnection();

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/system/info`, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch system info');
      }

      const data = await response.json();
      setSystemInfo(data);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Request timed out - desktop may be slow or offline');
      } else {
        setError(err.message || 'Unable to connect to desktop');
      }
      console.error('System monitor error:', err);
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
    <div className={`h-full bg-gradient-to-br ${!isHealthy ? 'from-gray-500 to-gray-700' : 'from-emerald-500 to-emerald-700'} rounded-xl shadow-2xl p-6 text-white relative transition-colors duration-500`}>
      <div className="drag-handle cursor-move absolute top-2 right-2 opacity-50 hover:opacity-100">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </div>

      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        Desktop Monitor
        {!isHealthy && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded" title="Connection unavailable">
            Offline
          </span>
        )}
      </h3>

      {loading && <div className="flex items-center justify-center h-24">Loading...</div>}

      {error && (
        <div className="flex flex-col items-center justify-center h-24 text-center">
          <div className="text-red-200 mb-2">{error}</div>
          {!isHealthy && (
            <div className="text-xs opacity-75">
              Waiting for desktop connection...
            </div>
          )}
        </div>
      )}

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
