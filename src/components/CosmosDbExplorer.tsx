import React, { useState } from 'react';
import {
  Database,
  Search,
  Key,
  Calendar,
  Sparkles,
  ChevronRight,
  Code,
  Layers,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import { CosmosInteractionDocument } from '../types';

interface CosmosDbExplorerProps {
  documents: CosmosInteractionDocument[];
}

export const CosmosDbExplorer: React.FC<CosmosDbExplorerProps> = ({ documents }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(documents[0]?.id || '');
  const [filterTerm, setFilterTerm] = useState('');

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || documents[0];

  const filteredDocs = documents.filter((doc) => {
    if (!filterTerm) return true;
    const term = filterTerm.toLowerCase();
    return (
      doc.id.toLowerCase().includes(term) ||
      doc.missingSkills.some((s) => s.toLowerCase().includes(term)) ||
      doc.matchedSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Cosmos Header */}
      <div className="bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-3">
              <Database className="w-3.5 h-3.5" />
              Azure Cosmos DB (SQL / Core API)
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Container: "AIInteractions" Explorer
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Distributed NoSQL document store housing candidate ATS match results, LLM reasoning audit trails, and token telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-blue-300 bg-blue-950/60 border border-blue-800/60 px-3 py-2 rounded-xl">
            <Key className="w-3.5 h-3.5 text-blue-400" />
            <span>Partition Key: <strong className="text-white">/user_id</strong></span>
          </div>
        </div>
      </div>

      {/* Explorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 5 Cols: Document List & Search */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Filter by skill or document ID..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="text-xs text-slate-400 font-mono flex items-center justify-between px-1">
            <span>Documents ({filteredDocs.length})</span>
            <span>Throughput: 400 RU/s</span>
          </div>

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredDocs.map((doc) => {
              const isSelected = doc.id === selectedDocId;
              return (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`cursor-pointer rounded-xl p-3.5 transition border ${
                    isSelected
                      ? 'bg-blue-950/40 border-blue-500/60 shadow-md shadow-blue-500/10'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs font-bold text-white truncate max-w-[200px]">
                      {doc.id}
                    </span>
                    <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
                      Score: {doc.matchScore}%
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(doc.timestamp).toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-indigo-400 font-semibold">{doc.tokensUsed} tokens</span>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {doc.missingSkills.slice(0, 3).map((s, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 text-[9px] rounded bg-rose-950/40 text-rose-300 border border-rose-900/40 font-mono"
                      >
                        -{s}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Selected Document Inspector */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6">
          {selectedDoc ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <Database className="w-4 h-4 text-blue-400" />
                    Document ID: {selectedDoc.id}
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-1">
                    Partition Key (user_id): <span className="text-white">{selectedDoc.userId}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-1 rounded">
                    ~2.8 Request Units (RU)
                  </span>
                </div>
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Match Score</span>
                  <div className="text-xl font-bold font-mono text-blue-400 mt-1">{selectedDoc.matchScore}%</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">LLM Tokens</span>
                  <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{selectedDoc.tokensUsed}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <span className="text-[10px] font-mono text-slate-500 uppercase">Model Version</span>
                  <div className="text-xs font-bold font-mono text-slate-300 mt-2 truncate">
                    {selectedDoc.modelVersion}
                  </div>
                </div>
              </div>

              {/* Recommendations & Generated Questions */}
              {selectedDoc.generatedQuestions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-white mb-2 uppercase font-mono tracking-wider text-slate-400">
                    Generated Interview Prep Questions
                  </h4>
                  <div className="space-y-2">
                    {selectedDoc.generatedQuestions.map((q, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs">
                        <div className="text-[10px] text-blue-400 font-semibold font-mono mb-1">{q.category}</div>
                        <p className="text-slate-200">{q.question}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Raw JSON View */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2 uppercase font-mono tracking-wider text-slate-400 flex items-center gap-2">
                  <Code className="w-3.5 h-3.5" />
                  Cosmos DB JSON Raw Document
                </h4>
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-blue-300/90 overflow-x-auto max-h-[350px]">
                  {JSON.stringify(selectedDoc, null, 2)}
                </pre>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500">Select a document to inspect payload</div>
          )}
        </div>
      </div>
    </div>
  );
};
