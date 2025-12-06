'use client';

import { useConnection } from '@/app/contexts/ConnectionContext';
import { useEffect, useState } from 'react';

export default function ConnectionStatus() {
  const { status, lastConnected, retryCount } = useConnection();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show notification when disconnected or reconnecting
    if (status === 'disconnected' || status === 'reconnecting') {
      setIsVisible(true);
    } else if (status === 'connected') {
      // Hide after a brief delay when reconnected
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  if (!isVisible && status === 'connected') {
    return null;
  }

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          bgColor: 'bg-green-500/90',
          textColor: 'text-white',
          icon: '✓',
          message: 'Connected to desktop',
        };
      case 'disconnected':
        return {
          bgColor: 'bg-red-500/90',
          textColor: 'text-white',
          icon: '✕',
          message: 'Desktop disconnected',
          subtitle: 'Some features may be unavailable',
        };
      case 'reconnecting':
        return {
          bgColor: 'bg-yellow-500/90',
          textColor: 'text-white',
          icon: '↻',
          message: `Reconnecting to desktop${retryCount > 0 ? ` (attempt ${retryCount})` : ''}...`,
        };
      case 'degraded':
        return {
          bgColor: 'bg-orange-500/90',
          textColor: 'text-white',
          icon: '⚠',
          message: 'Connection degraded',
          subtitle: 'Some features may be slow',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 ${config.bgColor} ${config.textColor} px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold" aria-hidden="true">
          {config.icon}
        </span>
        <div>
          <div className="font-semibold">{config.message}</div>
          {config.subtitle && (
            <div className="text-sm opacity-90">{config.subtitle}</div>
          )}
          {lastConnected && status === 'disconnected' && (
            <div className="text-xs opacity-75 mt-1">
              Last connected: {new Date(lastConnected).toLocaleTimeString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
