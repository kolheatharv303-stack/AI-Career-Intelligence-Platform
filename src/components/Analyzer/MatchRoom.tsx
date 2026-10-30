import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  Play,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  HelpCircle,
  RefreshCw,
  Database,
  ArrowRight,
  Target,
  Check,
  Zap,
} from 'lucide-react';
import { MatchAnalysisResult, ResumeRecord } from '../../types';

interface MatchRoomProps {
  resumes: ResumeRecord[];
  onUploadResume: (fileOrText: File | string, filename?: string) => Promise<void>;
  onRunMatch: (resumeId: string, jobText: string) => Promise<MatchAnalysisResult>;
  onViewCosmosHistory: () => void;
}

export const MatchRoom: React.FC<MatchRoomProps> = ({
  resumes,
  onUploadResume,
  onRunMatch,
  onViewCosmosHistory,
}) => {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [jobText, setJobText] = useState<string>(
    `Position: Principal Cloud & AI Application Engineer\nCompany: AnthroScale AI Platforms\nLocation: Remote / Hybrid\n\nAbout The Role:\nWe are seeking a Principal Cloud & AI Application Engineer to lead the architectural development of our enterprise AI Career Intelligence Platform.\n\nKey Requirements:\n- 7+ years building production backend systems with Python (FastAPI 3.11+, Pydantic v2, asyncio).\n- Hands-on expertise with AWS RDS PostgreSQL, query optimization, and asyncpg connection pooling.\n- Demonstrated experience with Azure Cosmos DB (SQL/Core API) partition keys and RU cost tuning.\n- Experience with Google Firebase Admin SDK (Firestore / RTDB) for real-time client push events.\n- Production experience with Google Gemini API using structured JSON output schemas.`
  );

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [results, setResults] = useState<MatchAnalysisResult | null>(null);
  const [openQuestionIdx, setOpenQuestionIdx] = useState<number | null>(0);
  const [isDragOver, setIsDragOver] = useState(false);

  // Resume Upload Modal or Direct Paste
  const [isManualPaste, setIsManualPaste] = useState(false);
  const [manualResumeText, setManualResumeText] = useState('');
  const [manualFilename, setManualFilename] = useState('Custom_Resume.pdf');

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const handleExecuteAnalysis = async () => {
    if (!selectedResume || !jobText.trim()) return;
    setIsAnalyzing(true);
    setAnalysisStep('Submitting to Gemini 2.5 Flash via google-genai SDK...');

    try {
      setTimeout(() => setAnalysisStep('Enforcing response_mime_type="application/json"...'), 400);
      setTimeout(() => setAnalysisStep('Storing run into Azure Cosmos DB ("AIInteractions")...'), 800);

      const result = await onRunMatch(selectedResume.id, jobText);
      setResults(result);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await onUploadResume(file, file.name);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await onUploadResume(file, file.name);
    }
  };

  const handleSaveManualResume = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualResumeText.trim()) return;
    await onUploadResume(manualResumeText, manualFilename);
    setIsManualPaste(false);
    setManualResumeText('');
  };

  // Helper for Circular Gauge
  const score = results?.matchScore || 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="space-y-8">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FCDDD5] text-[#5A1844] text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#B62C22]" />
            <span>Gemini 2.5 Flash ATS Workspace</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#14080E] tracking-tight">
            Resume & Job Analyzer ("Match Room")
          </h2>
          <p className="text-xs sm:text-sm text-[#6B6066] mt-1 max-w-2xl">
            Evaluate candidate fit, identify missing competencies, generate portfolio bridge recommendations,
            and construct tailored interview prep questions.
          </p>
        </div>

        <button
          onClick={handleExecuteAnalysis}
          disabled={isAnalyzing}
          className="nixtio-gradient-btn px-7 py-3.5 rounded-full font-bold text-sm shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Analyzing with Gemini...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run AI Match Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Dual-Input Workspace: Left Resume + Right Job Description */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Resume Dropzone & Text Area */}
        <div className="lg:col-span-6 bg-white/95 border border-[#EFE8E5] rounded-3xl p-6 shadow-[0_10px_30px_rgba(71,13,146,0.03)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-[#F5EFEB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#B62C22]" />
                <h3 className="font-bold text-[#14080E] text-sm">Candidate Resume (AWS RDS)</h3>
              </div>

              <button
                type="button"
                onClick={() => setIsManualPaste(!isManualPaste)}
                className="text-xs font-bold text-[#470D92] hover:text-[#B62C22] transition"
              >
                {isManualPaste ? 'Select Existing' : '+ Paste / Upload'}
              </button>
            </div>

            {isManualPaste ? (
              <form onSubmit={handleSaveManualResume} className="space-y-3">
                <input
                  type="text"
                  value={manualFilename}
                  onChange={(e) => setManualFilename(e.target.value)}
                  placeholder="Resume filename (e.g. Alex_Morgan.pdf)"
                  className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl px-4 py-2.5 text-xs text-[#14080E] font-mono focus:outline-none focus:border-[#5A1844]"
                  required
                />
                <textarea
                  value={manualResumeText}
                  onChange={(e) => setManualResumeText(e.target.value)}
                  rows={8}
                  placeholder="Paste complete candidate resume text here..."
                  className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4 text-xs text-[#14080E] font-mono resize-none focus:outline-none focus:border-[#5A1844]"
                  required
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsManualPaste(false)}
                    className="px-4 py-2 rounded-full bg-[#F5EFEB] text-[#6B6066] text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="nixtio-gradient-btn px-5 py-2 rounded-full text-xs font-bold"
                  >
                    Save to RDS
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Drag-and-drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-3xl p-6 text-center transition cursor-pointer ${
                    isDragOver
                      ? 'border-[#5A1844] bg-[#FFF5F2]'
                      : 'border-[#EFE8E5] hover:border-[#D9CCC5] bg-[#FFFBF9]'
                  }`}
                >
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="resume-file-input" className="cursor-pointer block">
                    <Upload className="w-8 h-8 mx-auto text-[#6B6066] mb-2" />
                    <p className="text-xs font-bold text-[#14080E]">
                      Drop candidate PDF/TXT resume here or <span className="text-[#B62C22] underline">browse files</span>
                    </p>
                    <p className="text-[10px] text-[#6B6066] mt-1 font-mono">Max size: 10MB • Extracted via pypdf / Gemini</p>
                  </label>
                </div>

                {/* Selected Resume Selector / Inspector */}
                <div>
                  <label className="block text-xs font-bold text-[#6B6066] mb-1.5 uppercase tracking-wider">
                    Active Resume in RDS:
                  </label>
                  <select
                    value={selectedResumeId}
                    onChange={(e) => setSelectedResumeId(e.target.value)}
                    className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl px-4 py-2.5 text-xs text-[#14080E] font-medium focus:outline-none focus:border-[#5A1844]"
                  >
                    {resumes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.filename} — ({r.parsedProfile.candidateName})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedResume && (
                  <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-mono">
                      <span className="text-[#5A1844] font-bold">{selectedResume.parsedProfile.candidateName}</span>
                      <span className="text-[#6B6066]">{selectedResume.parsedProfile.location || 'Remote'}</span>
                    </div>
                    <p className="text-[11px] text-[#6B6066] line-clamp-2">
                      {selectedResume.parsedProfile.professionalSummary}
                    </p>
                    <div className="pt-2 border-t border-[#F2ECE8] flex flex-wrap gap-1.5">
                      {selectedResume.parsedProfile.skills.technical.slice(0, 6).map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[10px] bg-white text-[#14080E] border border-[#EFE8E5] font-mono">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-[10px] text-[#6B6066] font-mono flex items-center justify-between pt-2 border-t border-[#F5EFEB]">
            <span>Storage: AWS RDS PostgreSQL</span>
            <span>ID: {selectedResume?.id || 'res_none'}</span>
          </div>
        </div>

        {/* Right 6 Cols: Job Description Workspace */}
        <div className="lg:col-span-6 bg-white/95 border border-[#EFE8E5] rounded-3xl p-6 shadow-[0_10px_30px_rgba(71,13,146,0.03)] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#5A1844]" />
                <h3 className="font-bold text-[#14080E] text-sm">Target Job Description</h3>
              </div>
              <span className="text-[11px] font-mono text-[#6B6066]">
                {jobText.trim().split(/\s+/).length} words
              </span>
            </div>

            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              rows={12}
              placeholder="Paste requirements, responsibilities, and qualifications..."
              className="w-full bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4 text-xs text-[#14080E] font-mono leading-relaxed resize-none focus:outline-none focus:border-[#5A1844]"
            />
          </div>

          <div className="text-[10px] text-[#6B6066] font-mono flex items-center justify-between pt-2 border-t border-[#F5EFEB]">
            <span>Input Format: Plaintext / Markdown</span>
            <span className="text-[#B62C22] font-semibold">Structured JSON Schema Ready</span>
          </div>
        </div>
      </div>

      {/* Analysis Progress Banner if loading */}
      {isAnalyzing && (
        <div className="bg-white border border-[#EFE8E5] rounded-3xl p-6 shadow-xl flex items-center gap-4 animate-pulse">
          <RefreshCw className="w-6 h-6 text-[#5A1844] animate-spin shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-[#14080E]">Gemini 2.5 Flash Processing</h4>
            <p className="text-xs text-[#6B6066] font-mono mt-0.5">{analysisStep}</p>
          </div>
        </div>
      )}

      {/* Results Display Section in Warm Nixtio Card */}
      {results && (
        <section className="bg-white/95 border border-[#EFE8E5] rounded-3xl p-6 sm:p-8 shadow-[0_20px_50px_rgba(71,13,146,0.05)] space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#F5EFEB] pb-6">
            <div>
              <span className="text-xs font-mono font-bold text-[#0E7A4A] uppercase tracking-wider">
                ATS Evaluation Report
              </span>
              <h3 className="text-2xl font-black text-[#14080E] mt-1">Semantic Match & Gap Intelligence</h3>
              <p className="text-xs text-[#6B6066]">
                Audited & Persisted to Azure Cosmos DB container <code className="text-[#470D92] font-mono">"AIInteractions"</code>
              </p>
            </div>

            <button
              onClick={onViewCosmosHistory}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FFF5F2] hover:bg-[#FFEAE5] border border-[#FCDDD5] text-[#5A1844] text-xs font-bold transition"
            >
              <Database className="w-3.5 h-3.5 text-[#B62C22]" />
              View Cosmos DB History Record →
            </button>
          </div>

          {/* Top Row: Gauge + Pill Badges */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Circular Gauge: 4 Cols */}
            <div className="lg:col-span-4 bg-[#FFFBF9] border border-[#EFE8E5] rounded-3xl p-6 flex flex-col items-center justify-center text-center shadow-xs">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke="#EFE8E5"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r={radius}
                    stroke={score >= 80 ? '#0E7A4A' : score >= 60 ? '#B62C22' : '#5A1844'}
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-3xl font-black font-mono text-[#14080E]">{score}%</span>
                  <span className="text-[10px] text-[#6B6066] uppercase font-bold tracking-wider">ATS Score</span>
                </div>
              </div>

              <div className="mt-4">
                <span
                  className={`px-4 py-1 rounded-full text-xs font-bold font-mono border ${
                    score >= 80
                      ? 'bg-[#EAF8F1] text-[#0E7A4A] border-[#D0F1E1]'
                      : score >= 60
                      ? 'bg-[#FFF0ED] text-[#B62C22] border-[#FCDDD5]'
                      : 'bg-[#F7EFF5] text-[#5A1844] border-[#EBDCE6]'
                  }`}
                >
                  {score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Fit' : 'Substantial Gap'}
                </span>
                <p className="text-[11px] text-[#6B6066] mt-2">Calculated by Gemini ATS heuristic parsing</p>
              </div>
            </div>

            {/* Red & Green Skill Pills: 8 Cols */}
            <div className="lg:col-span-8 space-y-4">
              {/* Matched Skills (Green) */}
              <div className="bg-[#F8FCFA] border border-[#DCF4E7] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#0E7A4A] uppercase font-mono flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Matched Skills ({results.matchedSkills.length})
                  </span>
                  <span className="text-[10px] text-[#6B6066] font-mono">Verified in Resume</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#EAF8F1] border border-[#D0F1E1] text-[#0E7A4A] text-xs font-mono font-bold shadow-xs"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills (Red) */}
              <div className="bg-[#FFF8F7] border border-[#FCDDD5] rounded-3xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-[#B62C22] uppercase font-mono flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Missing / Gap Skills ({results.missingSkills.length})
                  </span>
                  <span className="text-[10px] text-[#6B6066] font-mono">Required by Target Job</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {results.missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full bg-[#FFF0ED] border border-[#FCDDD5] text-[#B62C22] text-xs font-mono font-bold shadow-xs"
                    >
                      ✕ {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actionable Suggestions Card (Recommended Projects) */}
          <div className="bg-[#FFFBF9] border border-[#FCDDD5] rounded-3xl p-6 sm:p-7 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FFF0ED] text-[#B62C22] flex items-center justify-center">
                <Lightbulb className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-[#14080E]">Actionable Suggestions: Portfolio Bridge Projects</h4>
                <p className="text-xs text-[#6B6066]">
                  Targeted projects designed by Gemini to bridge missing skills before interviews.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {results.suggestedProjects.map((project, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-2xl p-5 space-y-2 transition shadow-xs"
                >
                  <span className="text-xs font-bold text-[#5A1844]">{project.title}</span>
                  <p className="text-xs text-[#6B6066] leading-relaxed">{project.description}</p>
                  <div className="pt-2 flex flex-wrap gap-1 text-[10px] font-mono text-[#6B6066]">
                    <span className="text-[#14080E] font-bold">Addresses:</span>
                    {project.skillsAddressed.map((s, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-full bg-[#FFF0ED] text-[#B62C22] font-semibold">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Collapsible Accordion: AI Interview Prep Questions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="w-4 h-4 text-[#5A1844]" />
              <h4 className="text-base font-bold text-[#14080E]">AI-Generated Interview Prep Questions</h4>
              <span className="text-xs text-[#6B6066]">({results.generatedQuestions.length} probing questions)</span>
            </div>

            <div className="space-y-3">
              {results.generatedQuestions.map((q, idx) => {
                const isOpen = openQuestionIdx === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-[#EFE8E5] rounded-2xl overflow-hidden transition"
                  >
                    <button
                      onClick={() => setOpenQuestionIdx(isOpen ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between hover:bg-[#FFFBF9] transition select-none cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#FFF2EE] text-[#B62C22] font-mono text-xs flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-xs font-bold text-[#5A1844] font-mono uppercase tracking-wider mr-2">
                            [{q.category}]
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-[#14080E]">{q.question}</span>
                        </div>
                      </div>

                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-[#6B6066] shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B6066] shrink-0" />
                      )}
                    </button>

                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-[#F5EFEB] space-y-3 text-xs bg-[#FFFBF9]">
                        <div>
                          <span className="text-[#6B6066] font-bold uppercase tracking-wider text-[10px] block mb-1">
                            Why the Interviewer Asks This:
                          </span>
                          <p className="text-[#14080E] italic">{q.rationale}</p>
                        </div>

                        {q.sampleAnswerGuideline && (
                          <div className="bg-white border border-[#EFE8E5] p-4 rounded-xl">
                            <span className="text-[#0E7A4A] font-bold uppercase tracking-wider text-[10px] block mb-1">
                              Recommended Answer Strategy:
                            </span>
                            <p className="text-[#14080E] leading-relaxed">{q.sampleAnswerGuideline}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
