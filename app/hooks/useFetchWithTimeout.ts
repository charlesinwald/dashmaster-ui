import { useConnection } from '@/app/contexts/ConnectionContext';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

export function useFetchWithTimeout() {
  const { isHealthy } = useConnection();

  const fetchWithTimeout = async <T = any>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> => {
    const { timeout = 8000, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === 'AbortError') {
        throw new Error('Request timed out - desktop may be slow or offline');
      }

      if (error.message.includes('fetch')) {
        throw new Error('Unable to connect to desktop');
      }

      throw error;
    }
  };

  return { fetchWithTimeout, isHealthy };
}
