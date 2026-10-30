import React from 'react';
import {
  Flame,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FirebaseBroadcastEvent } from '../types';

interface FirebaseEventStreamProps {
  events: FirebaseBroadcastEvent[];
  onClearEvents: () => void;
}

export const FirebaseEventStream: React.FC<FirebaseEventStreamProps> = ({
  events,
  onClearEvents,
}) => {
  return (
    <div className="space-y-6">
      {/* Stream Header */}
      <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold mb-3">
              <Flame className="w-3.5 h-3.5" />
              Google Firebase Admin SDK Broadcast Feed
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Real-Time Application Status Event Stream
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Live broadcast listener subscribed to Firestore collection{' '}
              <code className="text-orange-300 font-mono">application_events</code> and Realtime Database{' '}
              <code className="text-orange-300 font-mono">/users/&#123;user_id&#125;/status_events</code>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950 border border-orange-800 text-orange-300 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              {events.length} Events Logged
            </span>
            {events.length > 0 && (
              <button
                onClick={onClearEvents}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <Flame className="w-10 h-10 mx-auto text-slate-600" />
          <h4 className="text-sm font-semibold text-slate-300">No Real-Time Events Broadcast Yet</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Change an application stage in the <strong>API Sandbox</strong> (e.g. Applied → Interview) to trigger a
            real-time push event from the FastAPI backend to Firebase.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((evt, idx) => (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/40 rounded-xl p-4 transition shadow-lg space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                  <span className="font-bold text-white uppercase font-mono tracking-wider">
                    {evt.eventType}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-300 font-semibold">{evt.companyName}</span>
                  <span className="text-slate-500">({evt.jobTitle})</span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px]">
                    {evt.deliveredVia}
                  </span>
                </div>
              </div>

              {/* Status Transition Visual Badge */}
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {evt.oldStatus}
                </span>
                <ArrowRight className="w-4 h-4 text-orange-400" />
                <span className="px-2.5 py-1 rounded bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold">
                  {evt.newStatus}
                </span>
                {evt.note && (
                  <span className="text-slate-400 italic text-[11px] truncate max-w-md">
                    "{evt.note}"
                  </span>
                )}
              </div>

              {/* Collapsed Raw Payload */}
              <details className="text-[11px] text-slate-500 group">
                <summary className="cursor-pointer hover:text-slate-300 select-none">
                  View Raw JSON Event Payload
                </summary>
                <pre className="mt-2 p-3 bg-slate-950 border border-slate-800/80 rounded-lg text-orange-300/90 font-mono overflow-x-auto">
                  {JSON.stringify(evt, null, 2)}
                </pre>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
