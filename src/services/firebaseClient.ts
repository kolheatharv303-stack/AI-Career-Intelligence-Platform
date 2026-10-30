/**
 * Real-Time Event Sync Service using Firebase Realtime Pattern & Cross-Tab Broadcast Channel.
 * Ensures Kanban columns and application updates synchronize instantly across all open browser tabs.
 */

import { FirebaseBroadcastEvent } from '../types';

type EventListener = (event: FirebaseBroadcastEvent) => void;

class RealTimeSyncService {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<EventListener> = new Set();
  private isOnline = true;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.channel = new BroadcastChannel('firebase_status_sync_channel');
        this.channel.onmessage = (messageEvent) => {
          if (messageEvent.data && messageEvent.data.eventType) {
            this.notifyListeners(messageEvent.data as FirebaseBroadcastEvent);
          }
        };
      } catch (e) {
        console.warn('BroadcastChannel not supported in this frame, using window events.');
      }
    }

    // Fallback: storage event for cross-tab sync
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'firebase_last_broadcast_event' && e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            this.notifyListeners(parsed);
          } catch {
            // Ignore parse errors
          }
        }
      });
    }
  }

  /**
   * Subscribe to real-time events.
   */
  public subscribe(listener: EventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast an event across all tabs and open windows.
   */
  public broadcastEvent(event: FirebaseBroadcastEvent): void {
    // 1. Send through BroadcastChannel
    if (this.channel) {
      this.channel.postMessage(event);
    }

    // 2. LocalStorage trigger for cross-tab listeners
    try {
      localStorage.setItem('firebase_last_broadcast_event', JSON.stringify(event));
    } catch {
      // Storage quota or sandboxing
    }

    // 3. Notify local listeners in the current tab as well
    this.notifyListeners(event);
  }

  private notifyListeners(event: FirebaseBroadcastEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in real-time sync listener:', err);
      }
    });
  }

  public getStatus(): { isConnected: boolean; transport: string } {
    return {
      isConnected: this.isOnline,
      transport: this.channel ? 'BroadcastChannel (WebRTC/Socket Sim)' : 'LocalStorage Event Bus',
    };
  }
}

export const realtimeSync = new RealTimeSyncService();
