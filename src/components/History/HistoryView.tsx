import React, { useState } from 'react';
import {
  Database,
  Download,
  Search,
  Key,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { CosmosInteractionDocument } from '../../types';
import { generateInteractionMarkdownReport } from '../../utils/career-intelligence';

interface HistoryViewProps {
  documents: CosmosInteractionDocument[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ documents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredDocs = documents.filter((doc) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      doc.id.toLowerCase().includes(term) ||
      (doc.companyName && doc.companyName.toLowerCase().includes(term)) ||
      (doc.jobTitle && doc.jobTitle.toLowerCase().includes(term)) ||
      doc.missingSkills.some((s) => s.toLowerCase().includes(term)) ||
      doc.matchedSkills.some((s) => s.toLowerCase().includes(term))
    );
  });

  const handleDownloadMarkdown = (doc: CosmosInteractionDocument) => {
    const markdown = generateInteractionMarkdownReport(doc);
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI_Career_Intelligence_${doc.companyName || 'Analysis'}_${doc.id}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJson = (doc: CosmosInteractionDocument) => {
    const jsonStr = JSON.stringify(doc, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cosmos_Interaction_${doc.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/95 border border-[#EFE8E5] rounded-[2.5rem] p-7 sm:p-10 shadow-[0_20px_50px_rgba(71,13,146,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FCDDD5] text-[#5A1844] text-xs font-semibold mb-3">
              <Database className="w-3.5 h-3.5 text-[#B62C22]" />
              <span>Azure Cosmos DB • Container: "AIInteractions"</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14080E] tracking-tight">
              AI Interaction History & Audit Feed
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B6066]">
              Historical records of all Gemini ATS analyses, skill gap calculations, and interview questions. Partitioned by <code className="text-[#5A1844] font-mono">/user_id</code>.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-[#5A1844] bg-[#FFF8F6] border border-[#FCDDD5] px-4 py-2 rounded-full">
            <Key className="w-3.5 h-3.5 text-[#B62C22]" />
            <span>Partition Key: <strong className="text-[#14080E]">/user_id</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white/95 border border-[#EFE8E5] rounded-3xl p-4 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#6B6066] absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company, role, or skill..."
            className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-full pl-10 pr-4 py-2 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
          />
        </div>

        <div className="text-xs text-[#6B6066] font-mono">
          Showing <span className="text-[#14080E] font-bold">{filteredDocs.length}</span> audit records
        </div>
      </div>

      {/* History Feed / Table */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white/80 border border-[#EFE8E5] rounded-3xl p-12 text-center text-[#6B6066]">
          No interaction documents match your search criteria.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocs.map((doc) => (
            <div
              key={doc.id}
              className="bg-white/95 border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-[2rem] p-6 sm:p-7 transition duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] space-y-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#F5EFEB] pb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-[#14080E]">
                      {doc.companyName || 'AnthroScale AI Platforms'}
                    </span>
                    <span className="text-[#6B6066]">•</span>
                    <span className="text-xs text-[#6B6066] font-medium">
                      {doc.jobTitle || 'Principal Cloud & AI Application Engineer'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-[#6B6066] font-mono">
                    <span>ID: {doc.id}</span>
                    <button
                      onClick={() => handleCopyId(doc.id)}
                      className="text-[#6B6066] hover:text-[#14080E]"
                      title="Copy Document ID"
                    >
                      {copiedId === doc.id ? <Check className="w-3 h-3 text-[#0E7A4A]" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#B62C22]" />
                      {new Date(doc.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Score & Actions */}
                <div className="flex items-center gap-2.5">
                  <div
                    className={`px-3.5 py-1.5 rounded-full font-mono text-xs font-black border ${
                      doc.matchScore >= 80
                        ? 'bg-[#EAF8F1] text-[#0E7A4A] border-[#D0F1E1]'
                        : doc.matchScore >= 60
                        ? 'bg-[#FFF0ED] text-[#B62C22] border-[#FCDDD5]'
                        : 'bg-[#F7EFF5] text-[#5A1844] border-[#EBDCE6]'
                    }`}
                  >
                    Match: {doc.matchScore}%
                  </div>

                  {/* Download Buttons */}
                  <button
                    onClick={() => handleDownloadMarkdown(doc)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#FFFBF9] text-[#14080E] text-xs font-bold transition border border-[#EFE8E5]"
                    title="Download Formatted Markdown Report"
                  >
                    <Download className="w-3.5 h-3.5 text-[#5A1844]" />
                    <span>Markdown</span>
                  </button>

                  <button
                    onClick={() => handleDownloadJson(doc)}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white hover:bg-[#FFFBF9] text-[#14080E] text-xs font-bold transition border border-[#EFE8E5]"
                    title="Download Cosmos DB JSON Document"
                  >
                    <Code className="w-3.5 h-3.5 text-[#470D92]" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {/* Skills summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[11px] font-bold text-[#0E7A4A] uppercase tracking-wider block mb-2">
                    Matched Skills ({doc.matchedSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.matchedSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-[#EAF8F1] text-[#0E7A4A] border border-[#D0F1E1] text-[10px] font-bold">
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-[#B62C22] uppercase tracking-wider block mb-2">
                    Missing Skills ({doc.missingSkills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {doc.missingSkills.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-[#FFF0ED] text-[#B62C22] border border-[#FCDDD5] text-[10px] font-bold">
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
