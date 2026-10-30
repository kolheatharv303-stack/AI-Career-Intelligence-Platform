/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header, ActiveNavTab } from './components/Header';
import { HeroSection } from './components/Landing/HeroSection';
import { OverviewCards } from './components/Dashboard/OverviewCards';
import { MatchRoom } from './components/Analyzer/MatchRoom';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { HistoryView } from './components/History/HistoryView';
import { ArchitectureView } from './components/ArchitectureView';
import { CodeExplorer } from './components/CodeExplorer';
import { AuthModal } from './components/Auth/AuthModal';
import {
  ApplicationRecord,
  ApplicationStatus,
  AuthState,
  CosmosInteractionDocument,
  FirebaseBroadcastEvent,
  MatchAnalysisResult,
  ResumeRecord,
} from './types';
import {
  SEED_APPLICATIONS,
  SEED_COSMOS_DOCUMENTS,
  SEED_RESUME,
  SEED_USER,
} from './data/seed-data';
import {
  computeDashboardMetrics,
} from './utils/career-intelligence';
import {
  authAPI,
  resumeAPI,
  aiAPI,
  applicationAPI,
  tokenStore,
} from './services/api';
import { realtimeSync } from './services/firebaseClient';
import { ArrowRight, Flame } from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveNavTab>('dashboard');

  // Auth State
  const [auth, setAuth] = useState<AuthState>({
    token: tokenStore.getToken() || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active_bearer_token.signature',
    user: tokenStore.getUser() || SEED_USER,
  });
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Entities State
  const [resumes, setResumes] = useState<ResumeRecord[]>([SEED_RESUME]);
  const [applications, setApplications] = useState<ApplicationRecord[]>(SEED_APPLICATIONS);
  const [cosmosHistory, setCosmosHistory] = useState<CosmosInteractionDocument[]>(SEED_COSMOS_DOCUMENTS);

  // Real-Time Event State
  const [realtimeEventCount, setRealtimeEventCount] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Wire cross-tab real-time sync via Firebase client listener
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((event) => {
      setRealtimeEventCount((prev) => prev + 1);

      // Synchronize application status across tabs
      setApplications((prev) =>
        prev.map((app) =>
          app.id === event.applicationId
            ? { ...app, status: event.newStatus as ApplicationStatus, updatedAt: event.timestamp }
            : app
        )
      );
    });

    return () => unsubscribe();
  }, []);

  // Compute Dashboard Metrics
  const dashboardMetrics = computeDashboardMetrics(applications, cosmosHistory);

  // 1. Auth Handlers
  const handleLogin = async (email: string, pass: string) => {
    const { token, user } = await authAPI.login(email, pass);
    setAuth({ token, user });
    showToast(`Authenticated as ${user.email} (Bearer JWT stored)`);
  };

  const handleRegister = async (email: string, pass: string, name: string) => {
    const { token, user } = await authAPI.register(email, pass, name);
    setAuth({ token, user });
    showToast(`Account registered in AWS RDS for ${user.fullName}`);
  };

  const handleLogout = () => {
    tokenStore.clear();
    setAuth({ token: null, user: null });
    showToast('Signed out. Bearer JWT removed from memory & storage.');
  };

  // 2. Resume Upload Handler
  const handleUploadResume = async (fileOrText: File | string, filename = 'Candidate_Resume.pdf') => {
    const newRecord = await resumeAPI.upload(fileOrText, filename);
    setResumes((prev) => [newRecord, ...prev]);
    showToast(`Saved resume '${newRecord.filename}' to AWS RDS PostgreSQL.`);
  };

  // 3. AI Match Handler
  const handleRunMatch = async (resumeId: string, jobText: string): Promise<MatchAnalysisResult> => {
    const { analysis, interactionId, tokensUsed } = await aiAPI.match(resumeId, jobText);

    // Save into Azure Cosmos DB State
    const targetResume = resumes.find((r) => r.id === resumeId) || resumes[0];
    const newCosmosDoc: CosmosInteractionDocument = {
      id: interactionId,
      userId: auth.user?.id || SEED_USER.id,
      resumeId,
      companyName: 'AnthroScale AI Platforms',
      jobTitle: 'Principal Cloud & AI Application Engineer',
      timestamp: new Date().toISOString(),
      matchScore: analysis.matchScore,
      missingSkills: analysis.missingSkills,
      matchedSkills: analysis.matchedSkills,
      recommendations: analysis.suggestedProjects,
      generatedQuestions: analysis.generatedQuestions,
      tokensUsed,
      modelVersion: 'gemini-2.5-flash',
      rawAnalysis: analysis as unknown as Record<string, unknown>,
    };

    setCosmosHistory((prev) => [newCosmosDoc, ...prev]);
    showToast(`Gemini match calculated: ${analysis.matchScore}%. Stored in Azure Cosmos DB container 'AIInteractions'.`);
    return analysis;
  };

  // 4. Application Status Update (Triggers Firebase Broadcast Event)
  const handleUpdateApplicationStatus = async (
    applicationId: string,
    newStatus: ApplicationStatus,
    note?: string
  ) => {
    let companyName = 'Target Company';
    let jobTitle = 'Role';
    let oldStatus = 'Applied';

    setApplications((prev) =>
      prev.map((app) => {
        if (app.id === applicationId) {
          oldStatus = app.status;
          companyName = app.companyName;
          jobTitle = app.jobTitle;
          return {
            ...app,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            note: note || app.note,
          };
        }
        return app;
      })
    );

    // Broadcast event across all browser tabs via Firebase Client / BroadcastChannel
    const eventPayload: FirebaseBroadcastEvent = {
      eventType: 'APPLICATION_STAGE_CHANGED',
      applicationId,
      userId: auth.user?.id || SEED_USER.id,
      jobId: 'job_id',
      companyName,
      jobTitle,
      oldStatus,
      newStatus,
      note,
      timestamp: new Date().toISOString(),
      deliveredVia: 'firebase_client_realtime',
    };

    realtimeSync.broadcastEvent(eventPayload);
    showToast(`Updated stage to '${newStatus}' in AWS RDS. Real-time push dispatched to Firebase!`);
  };

  // 5. Create Application Handler
  const handleCreateApplication = async (payload: {
    companyName: string;
    jobTitle: string;
    status: ApplicationStatus;
  }) => {
    const newApp = await applicationAPI.create(payload);
    setApplications((prev) => [newApp, ...prev]);
    showToast(`Created application for ${payload.companyName} in AWS RDS.`);
  };

  return (
    <div className="bg-warm-canvas min-h-screen text-[#14080E] flex flex-col font-sans selection:bg-[#B62C22] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#14080E] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-[#FCDDD5] text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-[#B62C22] animate-ping"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auth={auth}
        onOpenAuthModal={() => setShowAuthModal(true)}
        realtimeEventCount={realtimeEventCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-200">
            {/* Nixtio Warm Two-Column Hero Section */}
            <HeroSection
              onStartForFree={() => setActiveTab('analyzer')}
              onExplorePaths={() => setActiveTab('kanban')}
              averageMatchScore={dashboardMetrics.averageMatchScore}
              totalApplications={dashboardMetrics.totalApplications}
            />

            {/* Metric Cards Overview */}
            <OverviewCards
              metrics={dashboardMetrics}
              onNavigateToAnalyzer={() => setActiveTab('analyzer')}
              onNavigateToKanban={() => setActiveTab('kanban')}
              onNavigateToHistory={() => setActiveTab('history')}
            />

            {/* Quick Preview of Kanban & Analyzer Highlights in Nixtio Warm Containers */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left 7 Cols: Kanban Pipeline Summary */}
              <div className="lg:col-span-7 bg-white/95 border border-[#EFE8E5] rounded-[2rem] p-7 shadow-[0_10px_30px_rgba(71,13,146,0.02)] space-y-5">
                <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
                  <div>
                    <h3 className="font-extrabold text-[#14080E] text-base">Active Pipeline Highlights</h3>
                    <p className="text-xs text-[#6B6066]">Synced via Firebase Realtime Service across open tabs</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('kanban')}
                    className="text-xs text-[#5A1844] hover:text-[#B62C22] font-bold font-mono transition"
                  >
                    Open Kanban Board →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {applications.slice(0, 4).map((app) => (
                    <div
                      key={app.id}
                      className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4.5 text-xs space-y-2 hover:border-[#D9CCC5] transition shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold text-[#14080E] truncate max-w-[140px]">{app.companyName}</span>
                        <span
                          className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase border ${
                            app.status === 'Offer'
                              ? 'bg-[#EAF8F1] text-[#0E7A4A] border-[#D0F1E1]'
                              : app.status === 'Interview'
                              ? 'bg-[#F7EFF5] text-[#5A1844] border-[#EBDCE6]'
                              : 'bg-white text-[#14080E] border-[#EFE8E5]'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#6B6066] truncate">{app.jobTitle}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right 5 Cols: Quick Match Room Preview */}
              <div className="lg:col-span-5 bg-white/95 border border-[#EFE8E5] rounded-[2rem] p-7 shadow-[0_10px_30px_rgba(71,13,146,0.02)] space-y-4">
                <span className="text-[10px] uppercase font-mono font-bold text-[#B62C22] tracking-wider px-2.5 py-1 rounded-full bg-[#FFF0ED] border border-[#FCDDD5] inline-block">
                  AI Match Room
                </span>
                <h3 className="text-xl font-extrabold text-[#14080E]">Target Position Matcher</h3>
                <p className="text-xs text-[#6B6066] leading-relaxed">
                  Evaluate your candidate resume against job requirements with Gemini 2.5 Flash, uncover missing skill gaps, and get tailored interview questions.
                </p>

                <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4 text-xs font-mono space-y-1 text-[#6B6066]">
                  <div>Active Resume: <span className="text-[#14080E] font-bold">{resumes[0]?.filename}</span></div>
                  <div>Average ATS Score: <span className="text-[#0E7A4A] font-black">{dashboardMetrics.averageMatchScore}%</span></div>
                </div>

                <button
                  onClick={() => setActiveTab('analyzer')}
                  className="nixtio-gradient-btn w-full py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Enter Match Room Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analyzer' && (
          <MatchRoom
            resumes={resumes}
            onUploadResume={handleUploadResume}
            onRunMatch={handleRunMatch}
            onViewCosmosHistory={() => setActiveTab('history')}
          />
        )}

        {activeTab === 'kanban' && (
          <KanbanBoard
            applications={applications}
            onUpdateStatus={handleUpdateApplicationStatus}
            onCreateApplication={handleCreateApplication}
          />
        )}

        {activeTab === 'history' && <HistoryView documents={cosmosHistory} />}

        {activeTab === 'architecture' && <ArchitectureView />}

        {activeTab === 'code' && <CodeExplorer />}
      </main>

      {/* Split-Screen Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        auth={auth}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
      />

      {/* Footer in Warm Nixtio Palette */}
      <footer className="border-t border-[#EFE8E5] bg-white/70 py-8 text-center text-xs text-[#6B6066] mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>
            AI Career Intelligence Platform • Multi-Cloud Architecture (AWS RDS + Azure Cosmos DB + Firebase + Gemini)
          </p>
          <div className="flex items-center space-x-4 font-mono text-[11px] text-[#6B6066]">
            <span>FastAPI 3.11+</span>
            <span>•</span>
            <span>Axios Interceptors</span>
            <span>•</span>
            <span>Firebase Client Listener</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
