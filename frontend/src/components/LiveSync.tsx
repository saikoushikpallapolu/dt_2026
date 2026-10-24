import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const campusChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('campus-sync')
  : null;

export function broadcastCampusChange() {
  try {
    campusChannel?.postMessage({ type: 'CAMPUS_UPDATE', timestamp: Date.now() });
  } catch (err) {
    // Ignore cross-tab broadcast error
  }
}

export function LiveSync() {
  const client = useQueryClient();
  const reconnectTimeoutRef = useRef<any>(null);

  useEffect(() => {
    let stream: EventSource | null = null;
    let isMounted = true;

    const refresh = () => {
      void client.invalidateQueries();
      void client.refetchQueries({ type: 'active', stale: false });
    };

    // 1. Cross-tab instant update listener
    if (campusChannel) {
      campusChannel.onmessage = (event) => {
        if (event.data?.type === 'CAMPUS_UPDATE') {
          refresh();
        }
      };
    }

    // 2. Server-Sent Events (SSE) listener
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
          // If the connection was closed by browser or network, reconnect
          if (stream?.readyState === EventSource.CLOSED) {
            stream.close();
            stream = null;
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = setTimeout(connect, 2000);
          }
        };
      } catch (err) {
        console.warn('[LiveSync] EventSource setup error:', err);
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };

    connect();

    // 3. Screen focus/wake listener: immediate live refresh
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refresh();
        if (!stream || stream.readyState === EventSource.CLOSED) {
          connect();
        }
      }
    };

    // 4. Background polling fallback (ensures active view is strictly synchronized every 2s)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        void client.refetchQueries({ type: 'active', stale: false });
      }
    }, 2000);

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

