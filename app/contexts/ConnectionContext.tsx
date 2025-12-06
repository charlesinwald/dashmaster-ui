'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'degraded';

interface ConnectionContextType {
  status: ConnectionStatus;
  isHealthy: boolean;
  lastConnected: Date | null;
  retryCount: number;
  checkConnection: () => Promise<boolean>;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

const HEALTH_CHECK_INTERVAL = 10000; // 10 seconds
const HEALTH_CHECK_TIMEOUT = 5000; // 5 seconds
const MAX_RETRY_ATTEMPTS = 5;
const RETRY_BACKOFF_BASE = 2000; // 2 seconds

export function ConnectionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<ConnectionStatus>('connected');
  const [lastConnected, setLastConnected] = useState<Date | null>(new Date());
  const [retryCount, setRetryCount] = useState(0);
  const healthCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    if (isCheckingRef.current) {
      return status === 'connected';
    }

    isCheckingRef.current = true;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/health`, {
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        setStatus('connected');
        setLastConnected(new Date());
        setRetryCount(0);
        isCheckingRef.current = false;
        return true;
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      console.warn('Connection health check failed:', error);

      if (status === 'connected') {
        setStatus('disconnected');
      }

      isCheckingRef.current = false;
      return false;
    }
  }, [status]);

  const attemptReconnection = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      setStatus('disconnected');
      return;
    }

    setStatus('reconnecting');
    setRetryCount(prev => prev + 1);

    const backoffDelay = Math.min(
      RETRY_BACKOFF_BASE * Math.pow(2, retryCount),
      30000 // Max 30 seconds
    );

    await new Promise(resolve => setTimeout(resolve, backoffDelay));

    const isConnected = await checkConnection();

    if (!isConnected && retryCount < MAX_RETRY_ATTEMPTS - 1) {
      attemptReconnection();
    }
  }, [retryCount, checkConnection]);

  useEffect(() => {
    checkConnection();

    healthCheckIntervalRef.current = setInterval(() => {
      checkConnection().then(isConnected => {
        if (!isConnected && status !== 'reconnecting') {
          attemptReconnection();
        }
      });
    }, HEALTH_CHECK_INTERVAL);

    return () => {
      if (healthCheckIntervalRef.current) {
        clearInterval(healthCheckIntervalRef.current);
      }
    };
  }, [checkConnection, attemptReconnection, status]);

  const value: ConnectionContextType = {
    status,
    isHealthy: status === 'connected' || status === 'degraded',
    lastConnected,
    retryCount,
    checkConnection,
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
}

export function useConnection() {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
}
