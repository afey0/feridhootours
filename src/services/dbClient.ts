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
  // Broadcast locally via BroadcastChannel for multi-tab sync
  if (channel) {
    channel.postMessage({ type, payload });
  }

  // Also trigger internal listeners
  for (const listener of listeners) {
    listener(type, payload);
  }

  // Also push to Express API backend if available
  fetch('/api/v1/broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, payload })
  }).catch(() => {
    // Ignore backend unreachable error in standalone dev mode
  });
};

if (channel) {
  channel.onmessage = (event) => {
    if (event.data && event.data.type) {
      for (const listener of listeners) {
        listener(event.data.type, event.data.payload);
      }
    }
  };
}
