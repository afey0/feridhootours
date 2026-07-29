// Real-Time Cross-Session Database & Audit Sync Service

const BROADCAST_CHANNEL_NAME = 'feridhootours_realtime_channel';
let channel: BroadcastChannel | null = null;

if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (err) {
    console.warn('[Realtime Sync] BroadcastChannel not supported in this environment.', err);
  }
}

export type RealtimeSyncListener = (type: string, payload: any) => void;

const listeners = new Set<RealtimeSyncListener>();

export const subscribeRealtimeEvents = (listener: RealtimeSyncListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export const broadcastRealtimeEvent = (type: string, payload: any) => {
  // 1. Broadcast locally via BroadcastChannel for multi-tab sync
  if (channel) {
    try {
      channel.postMessage({ type, payload });
    } catch (e) {
      // Ignore clone error
    }
  }

  // 2. Trigger internal active listeners
  for (const listener of listeners) {
    listener(type, payload);
  }

  // 3. Push transaction to Production Express / PostgreSQL API backend
  fetch('/api/v1/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload })
  }).catch(() => {
    // Ignore backend unreachable error in offline dev mode
  });
};

// Listen to local BroadcastChannel messages
if (channel) {
  channel.onmessage = (event) => {
    if (event.data && event.data.type) {
      for (const listener of listeners) {
        listener(event.data.type, event.data.payload);
      }
    }
  };
}

// Connect to Server-Sent Events (SSE) for Cross-Browser (Chrome <-> Edge <-> Mobile) Live Sync
if (typeof window !== 'undefined' && 'EventSource' in window) {
  try {
    const sse = new EventSource('/api/v1/events');
    sse.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data && data.type) {
          for (const listener of listeners) {
            listener(data.type, data.payload);
          }
        }
      } catch (err) {
        // Ignore parse error
      }
    };
  } catch (e) {
    // Ignore SSE fallback
  }
}
