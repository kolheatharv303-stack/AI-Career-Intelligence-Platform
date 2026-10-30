import React, { useState } from 'react';
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Play,
  FileText,
  Target,
  ArrowRight,
  RefreshCw,
  Flame,
  Database,
  Building,
  Briefcase,
  Sliders,
  Award,
  Layers,
  HelpCircle,
  Lightbulb,
  ExternalLink,
} from 'lucide-react';
import {
  ApplicationRecord,
  ApplicationStatus,
  AuthState,
  CosmosInteractionDocument,
  FirebaseBroadcastEvent,
  JobDescriptionRecord,
  MatchAnalysisResult,
  ResumeRecord,
} from '../types';
import { calculateAtsMatchScore, isValidStatusTransition } from '../utils/career-intelligence';

interface LiveSandboxViewProps {
  auth: AuthState;
  resumes: ResumeRecord[];
  jobs: JobDescriptionRecord[];
  applications: ApplicationRecord[];
  cosmosHistory: CosmosInteractionDocument[];
  onUploadResume: (filename: string, text: string) => Promise<void>;
  onRunMatch: (resumeId: string, jobText: string, jobId?: string) => Promise<MatchAnalysisResult>;
  onUpdateStatus: (applicationId: string, targetStatus: ApplicationStatus, note?: string) => Promise<void>;
  onViewCosmos: () => void;
  onViewFirebase: () => void;
}

export const LiveSandboxView: React.FC<LiveSandboxViewProps> = ({
  auth,
  resumes,
  jobs,
  applications,
  cosmosHistory,
  onUploadResume,
  onRunMatch,
  onUpdateStatus,
  onViewCosmos,
  onViewFirebase,
}) => {
  // Sandbox State
  const [selectedResumeId, setSelectedResumeId] = useState<string>(resumes[0]?.id || '');
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [customJobText, setCustomJobText] = useState<string>(jobs[0]?.rawText || '');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState<MatchAnalysisResult | null>(null);

  // Resume Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadText, setUploadText] = useState('');
  const [uploadFilename, setUploadFilename] = useState('Senior_Staff_Cloud_Engineer.pdf');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Application Pipeline Update State
  const [updatingAppId, setUpdatingAppId] = useState<string | null>(null);
  const [transitionNote, setTransitionNote] = useState('Candidate passed panel review.');

  const selectedResume = resumes.find((r) => r.id === selectedResumeId) || resumes[0];

  const handleExecuteMatch = async () => {
    if (!selectedResume) return;
    setIsMatching(true);
    try {
      const result = await onRunMatch(selectedResume.id, customJobText, selectedJobId);
      setMatchResult(result);
    } finally {
      setIsMatching(false);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadText.trim()) return;
    setIsUploading(true);
    try {
      await onUploadResume(uploadFilename, uploadText);
      setShowUploadModal(false);
      setUploadText('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleStageChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingAppId(appId);
    try {
      await onUpdateStatus(appId, newStatus, transitionNote);
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <div className="space-y-10">
      {/* Step 1: Endpoint POST /resumes/upload & Resume Selection */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                POST /resumes/upload
              </span>
              <span className="text-xs text-slate-500 font-mono">AWS RDS PostgreSQL</span>
            </div>
            <h3 className="text-lg font-bold text-white">1. Candidate Resume Entity Parser</h3>
            <p className="text-xs text-slate-400">
              Extracts text from PDF/TXT, calls Gemini structured JSON parser, and commits to RDS.
            </p>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            Upload New Resume (PDF / TXT)
          </button>
        </div>

        {/* Resumes Carousel / Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resumes.map((resume) => {
            const isSelected = resume.id === selectedResumeId;
            return (
              <div
                key={resume.id}
                onClick={() => setSelectedResumeId(resume.id)}
                className={`cursor-pointer rounded-xl p-4 transition border ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span className="font-semibold text-xs text-white truncate max-w-[180px]">
                      {resume.filename}
                    </span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                </div>

                <p className="text-[11px] text-slate-400 font-medium">{resume.parsedProfile.candidateName}</p>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">
                  {resume.parsedProfile.professionalSummary}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {resume.parsedProfile.skills.technical.slice(0, 4).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-1.5 py-0.5 text-[9px] rounded bg-slate-800 text-slate-300 font-mono"
                    >
                      {skill}
                    </span>
                  ))}
                  {resume.parsedProfile.skills.technical.length > 4 && (
                    <span className="text-[9px] text-slate-500 font-mono">
                      +{resume.parsedProfile.skills.technical.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Step 2: Endpoint POST /ai/match (Gemini ATS Analysis & Azure Cosmos DB Audit) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase">
                POST /ai/match
              </span>
              <span className="text-xs text-slate-500 font-mono">Google Gemini 2.5 Flash + Azure Cosmos DB</span>
            </div>
            <h3 className="text-lg font-bold text-white">2. AI Job Matching & Gap Intelligence Engine</h3>
            <p className="text-xs text-slate-400">
              Evaluates resume against job description using Gemini structured JSON outputs and writes run to Cosmos DB.
            </p>
          </div>

          <button
            onClick={handleExecuteMatch}
            disabled={isMatching}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-500/25 transition disabled:opacity-50"
          >
            {isMatching ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Invoking Gemini & Cosmos DB...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run AI Match Analysis
              </>
            )}
          </button>
        </div>

        {/* Input Comparison: Target Job Description Text */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Target Job Description (Text Input):
              </label>
              <textarea
                value={customJobText}
                onChange={(e) => setCustomJobText(e.target.value)}
                rows={10}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 font-mono leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
                placeholder="Paste full job description requirements here..."
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Selected Resume: {selectedResume?.filename}</span>
              <span>{customJobText.split(/\s+/).length} words</span>
            </div>
          </div>

          {/* Match Analysis Results Display */}
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-5 min-h-[300px]">
            {isMatching ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                <p className="text-sm font-semibold text-white">Gemini 2.5 Flash evaluating ATS compatibility...</p>
                <p className="text-xs text-slate-500 font-mono">
                  Enforcing response_mime_type="application/json" output schema
                </p>
              </div>
            ) : matchResult ? (
              <div className="space-y-6">
                {/* Score & Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black font-mono shadow-lg ${
                        matchResult.matchScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-emerald-500/10'
                          : matchResult.matchScore >= 60
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {matchResult.matchScore}%
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">ATS Semantic Match Score</h4>
                      <p className="text-xs text-slate-400">
                        Saved to Azure Cosmos DB Container:{' '}
                        <span className="text-blue-400 font-mono">AIInteractions</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={onViewCosmos}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-950/50 hover:bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs font-mono transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    Inspect Cosmos Record
                  </button>
                </div>

                {/* Skills Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <h5 className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Matched Skills ({matchResult.matchedSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/50 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3">
                    <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Missing Skills ({matchResult.missingSkills.length})
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[10px] rounded bg-rose-950/60 text-rose-300 border border-rose-800/50 font-mono"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gaps Summary */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-lg p-3">
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Executive Gap Assessment
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">{matchResult.gapsSummary}</p>
                </div>

                {/* Suggested Bridge Projects */}
                {matchResult.suggestedProjects?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                      Recommended Portfolio Bridge Projects:
                    </h5>
                    <div className="space-y-2">
                      {matchResult.suggestedProjects.map((p, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs">
                          <span className="font-semibold text-indigo-300">{p.title}</span>
                          <p className="text-slate-400 text-[11px] mt-0.5">{p.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generated Interview Questions */}
                {matchResult.generatedQuestions?.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      Tailored Candidate Interview Questions:
                    </h5>
                    <div className="space-y-2">
                      {matchResult.generatedQuestions.map((q, idx) => (
                        <div key={idx} className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs">
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                            <span className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300 font-semibold">
                              {q.category}
                            </span>
                          </div>
                          <p className="font-medium text-slate-200">{q.question}</p>
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            <span className="text-slate-400">Rationale:</span> {q.rationale}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                <Target className="w-10 h-10 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-300">Ready for Match Evaluation</h4>
                <p className="text-xs text-slate-500 max-w-sm">
                  Click "Run AI Match Analysis" to trigger Gemini's structured output schema and write the run to Azure Cosmos DB.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Step 3: Endpoint PATCH /applications/{id}/status (RDS Update & Firebase Real-Time Broadcast) */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-orange-500/20 text-orange-300 border border-orange-500/30 uppercase">
                PATCH /applications/&#123;id&#125;/status
              </span>
              <span className="text-xs text-slate-500 font-mono">AWS RDS + Google Firebase Admin SDK Broadcast</span>
            </div>
            <h3 className="text-lg font-bold text-white">3. Application Lifecycle & Real-Time Firebase Broadcast</h3>
            <p className="text-xs text-slate-400">
              Updates relational status in AWS RDS and broadcasts an immediate push event to Firebase Firestore & RTDB.
            </p>
          </div>

          <button
            onClick={onViewFirebase}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/40 hover:bg-orange-900/50 border border-orange-700/50 text-orange-300 text-xs font-medium transition"
          >
            <Flame className="w-3.5 h-3.5" />
            Open Live Firebase Event Stream
          </button>
        </div>

        {/* Transition Note Input */}
        <div className="mb-4">
          <label className="block text-xs text-slate-400 mb-1">
            Interviewer / Recruiter Transition Note (Included in Firebase Broadcast Payload):
          </label>
          <input
            type="text"
            value={transitionNote}
            onChange={(e) => setTransitionNote(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Applications Stage Pipeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Applied', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[]).map((stage) => {
            const stageApps = applications.filter((a) => a.status === stage);
            const stageColor =
              stage === 'Applied'
                ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                : stage === 'Interview'
                ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                : stage === 'Offer'
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/40 bg-rose-500/10 text-rose-400';

            return (
              <div key={stage} className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${stageColor}`}>
                    {stage}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{stageApps.length}</span>
                </div>

                <div className="space-y-3 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-600 italic">No applications in this stage</div>
                  ) : (
                    stageApps.map((app) => (
                      <div
                        key={app.id}
                        className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg p-3 text-xs space-y-2 transition shadow-sm"
                      >
                        <div>
                          <h4 className="font-semibold text-white leading-tight">{app.companyName}</h4>
                          <p className="text-[11px] text-slate-400">{app.jobTitle}</p>
                        </div>

                        <div className="text-[10px] text-slate-500 font-mono">
                          Updated: {new Date(app.updatedAt).toLocaleTimeString()}
                        </div>

                        {/* Stage Transition Buttons */}
                        <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1">
                          {(['Applied', 'Interview', 'Offer', 'Rejected'] as ApplicationStatus[])
                            .filter((target) => target !== stage)
                            .map((target) => (
                              <button
                                key={target}
                                disabled={updatingAppId === app.id}
                                onClick={() => handleStageChange(app.id, target)}
                                className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition border border-slate-700/60 disabled:opacity-50"
                                title={`Broadcast status update to ${target}`}
                              >
                                → {target}
                              </button>
                            ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Resume Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-400" />
                Upload Resume (POST /resumes/upload)
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFileUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Filename:</label>
                <input
                  type="text"
                  value={uploadFilename}
                  onChange={(e) => setUploadFilename(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 font-mono"
                  placeholder="e.g. Alex_Morgan_Resume.pdf"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Resume Text (or paste extracted text):
                </label>
                <textarea
                  value={uploadText}
                  onChange={(e) => setUploadText(e.target.value)}
                  rows={8}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono leading-relaxed resize-none"
                  placeholder="Paste complete candidate resume text..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadText.trim()}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition disabled:opacity-50"
                >
                  {isUploading ? 'Extracting & Parsing with Gemini...' : 'Commit to RDS & Parse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
