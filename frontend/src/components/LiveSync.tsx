import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function LiveSync() {
  const client = useQueryClient();
  const reconnectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let stream: EventSource | null = null;
    let isMounted = true;

    const refresh = () => {
      void client.invalidateQueries();
      void client.refetchQueries({ type: 'active' });
    };

    const connect = () => {
      if (!isMounted) return;
      if (stream) {
        stream.close();
      }

      try {
        stream = new EventSource('/api/v1/events');

        stream.addEventListener('campus-change', () => {
          refresh();
        });

        stream.addEventListener('connected', () => {
          refresh();
        });

        stream.onmessage = () => {
          refresh();
        };

        stream.onerror = () => {
          if (stream) {
            stream.close();
            stream = null;
          }
          // Auto reconnect after 2 seconds
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = setTimeout(connect, 2000);
        };
      } catch (err) {
        console.warn('[LiveSync] EventSource setup error:', err);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    // Mobile screen wake/focus triggers immediate refresh & reconnect
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        connect();
      }
    };

    // Background interval: every 3s refresh active queries on screen (mobile fallback)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void client.refetchQueries({ type: 'active' });
      }
    }, 3000);

    window.addEventListener('online', connect);
    window.addEventListener('focus', handleVisibility);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMounted = false;
      clearInterval(interval);
      clearTimeout(reconnectTimeoutRef.current);
      if (stream) stream.close();
      window.removeEventListener('online', connect);
      window.removeEventListener('focus', handleVisibility);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [client]);

  return null;
}
