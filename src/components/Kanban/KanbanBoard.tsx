import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  Flame,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Radio,
  X,
} from 'lucide-react';
import { ApplicationRecord, ApplicationStatus } from '../../types';
import { realtimeSync } from '../../services/firebaseClient';

interface KanbanBoardProps {
  applications: ApplicationRecord[];
  onUpdateStatus: (applicationId: string, status: ApplicationStatus, note?: string) => Promise<void>;
  onCreateApplication: (payload: { companyName: string; jobTitle: string; status: ApplicationStatus }) => Promise<void>;
}

// 4 Kanban Columns as requested
const KANBAN_COLUMNS: { id: ApplicationStatus | 'Offer'; label: string; stages: ApplicationStatus[]; color: string }[] = [
  { id: 'Applied', label: '1. Applied', stages: ['Applied'], color: 'border-[#DCE9FA] bg-[#F0F6FD] text-[#1E56A0]' },
  { id: 'Screening', label: '2. Screening', stages: ['Screening'], color: 'border-[#D9EFF7] bg-[#EEF8FC] text-[#0A7B9B]' },
  { id: 'Interview', label: '3. Interview', stages: ['Interview'], color: 'border-[#EBDCE6] bg-[#F7EFF5] text-[#5A1844]' },
  { id: 'Offer', label: '4. Offer / Rejected', stages: ['Offer', 'Rejected'], color: 'border-[#D0F1E1] bg-[#EAF8F1] text-[#0E7A4A]' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onUpdateStatus,
  onCreateApplication,
}) => {
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied');
  const [realtimeNotification, setRealtimeNotification] = useState<string | null>(null);

  // Integrated Firebase Realtime Listener: syncs changes across open tabs without reload
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((event) => {
      setRealtimeNotification(
        `Firebase Push: ${event.companyName} stage updated to ${event.newStatus}`
      );
      setTimeout(() => setRealtimeNotification(null), 3500);
    });

    return () => unsubscribe();
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedAppId(id);
  };

  const handleDragOver = (e: React.DragEvent, columnLabel: string) => {
    e.preventDefault();
    setDragOverColumn(columnLabel);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: ApplicationStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId) {
      await onUpdateStatus(appId, targetStatus, 'Stage updated via Kanban drag-and-drop');
      setDraggedAppId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newTitle.trim()) return;
    await onCreateApplication({
      companyName: newCompany,
      jobTitle: newTitle,
      status: newStatus,
    });
    setNewCompany('');
    setNewTitle('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Real-time sync toast notification */}
      {realtimeNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#14080E] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#FCDDD5] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Flame className="w-4 h-4 text-[#B62C22] animate-pulse" />
          <span>{realtimeNotification}</span>
        </div>
      )}

      {/* Kanban Header & Real-time Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0ED] text-[#B62C22] border border-[#FCDDD5] text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              Firebase Client Listener Active
            </span>
            <span className="text-xs text-[#6B6066] font-mono hidden sm:inline">
              Real-time cross-tab synchronization
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14080E] tracking-tight">Application Pipeline Kanban</h2>
          <p className="text-xs sm:text-sm text-[#6B6066]">
            Drag cards between stages or use quick-action buttons. Dispatches instant push events to Firebase Admin SDK.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="nixtio-gradient-btn px-6 py-3 rounded-full font-bold text-xs sm:text-sm shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* 4 Kanban Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {KANBAN_COLUMNS.map((column) => {
          const colApps = applications.filter((app) => column.stages.includes(app.status));
          const isTarget = dragOverColumn === column.label;

          return (
            <div
              key={column.label}
              onDragOver={(e) => handleDragOver(e, column.label)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.stages[0])}
              className={`bg-white/95 border rounded-[2rem] p-5 flex flex-col min-h-[520px] transition duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] ${
                isTarget
                  ? 'border-[#5A1844] bg-[#FFF8F6]'
                  : 'border-[#EFE8E5] hover:border-[#D9CCC5]'
              }`}
            >
              {/* Column Title Bar */}
              <div className="flex items-center justify-between pb-3.5 border-b border-[#F5EFEB] mb-4">
                <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono border ${column.color}`}>
                  {column.label}
                </span>
                <span className="w-6 h-6 rounded-full bg-[#FFFBF9] border border-[#EFE8E5] text-[#14080E] text-xs font-mono font-bold flex items-center justify-center">
                  {colApps.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-3.5 flex-1">
                {colApps.length === 0 ? (
                  <div className="h-32 rounded-2xl border-2 border-dashed border-[#EFE8E5] flex items-center justify-center text-xs text-[#6B6066] italic bg-[#FFFBF9]/50">
                    Drop candidate cards here
                  </div>
                ) : (
                  colApps.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app.id)}
                      className="bg-[#FFFBF9] border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-2xl p-4.5 space-y-3 transition shadow-xs cursor-grab active:cursor-grabbing group hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-[#14080E] text-xs leading-snug">{app.companyName}</h4>
                          <p className="text-[11px] text-[#6B6066] mt-0.5">{app.jobTitle}</p>
                        </div>
                        <span
                          className={`text-[9px] font-mono uppercase font-bold px-2 py-0.5 rounded-full border ${
                            app.status === 'Offer'
                              ? 'bg-[#EAF8F1] text-[#0E7A4A] border-[#D0F1E1]'
                              : app.status === 'Rejected'
                              ? 'bg-[#FFF0ED] text-[#B62C22] border-[#FCDDD5]'
                              : 'bg-white text-[#14080E] border-[#EFE8E5]'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      {app.note && (
                        <p className="text-[11px] text-[#6B6066] italic bg-white p-2.5 rounded-xl border border-[#F2ECE8]">
                          "{app.note}"
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-[#6B6066] font-mono pt-2 border-t border-[#F5EFEB]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-[#B62C22]" />
                          {new Date(app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {/* Status Mover Quick Buttons */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                          {(['Applied', 'Screening', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[])
                            .filter((st) => st !== app.status)
                            .slice(0, 2)
                            .map((st) => (
                              <button
                                key={st}
                                onClick={() => onUpdateStatus(app.id, st, `Promoted to ${st}`)}
                                className="px-2 py-0.5 rounded-full bg-white hover:bg-[#5A1844] hover:text-white text-[#6B6066] text-[9px] font-mono border border-[#EFE8E5] transition"
                                title={`Move to ${st}`}
                              >
                                → {st}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#EFE8E5] rounded-3xl max-w-md w-full p-7 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <h3 className="text-base font-bold text-[#14080E] flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#B62C22]" />
                Add New Job Application
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#6B6066] hover:text-[#14080E]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#14080E] mb-1">Company Name</label>
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder="e.g. AnthroScale Platforms"
                  className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl px-4 py-2.5 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14080E] mb-1">Position / Job Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Principal Cloud Engineer"
                  className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl px-4 py-2.5 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#14080E] mb-1">Initial Kanban Stage</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}
                  className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl px-4 py-2.5 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                >
                  <option value="Applied">1. Applied</option>
                  <option value="Screening">2. Screening</option>
                  <option value="Interview">3. Interview</option>
                  <option value="Offer">4. Offer</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-full bg-[#F5EFEB] text-[#6B6066] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="nixtio-gradient-btn px-6 py-2.5 rounded-full text-xs font-bold"
                >
                  Create & Commit to RDS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
