import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  Target,
  Trello,
  Database,
  Layers,
  Code2,
  ShieldCheck,
  UserCheck,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { AuthState } from '../types';

export type ActiveNavTab = 'dashboard' | 'analyzer' | 'kanban' | 'history' | 'architecture' | 'code';

interface HeaderProps {
  activeTab: ActiveNavTab;
  setActiveTab: (tab: ActiveNavTab) => void;
  auth: AuthState;
  onOpenAuthModal: () => void;
  realtimeEventCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  auth,
  onOpenAuthModal,
  realtimeEventCount,
}) => {
  return (
    <header className="border-b border-[#EFE8E5] bg-[#FFFBF9]/90 backdrop-blur-md sticky top-0 z-30 transition-colors">
      {/* Top Meta Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-b border-[#F2ECE8] flex flex-wrap items-center justify-between text-xs text-[#6B6066] gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FFF0ED] text-[#B62C22] border border-[#FCDDD5] font-semibold text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#B62C22] animate-pulse"></span>
            FastAPI 3.11+ Core Online
          </span>
          <span className="hidden sm:inline-block text-[#D9CCC5]">|</span>
          <span className="hidden sm:inline-block text-[#6B6066] font-medium">
            AWS RDS PostgreSQL • Azure Cosmos DB • Firebase RTDB • Gemini 2.5 Flash
          </span>
        </div>

        {/* Right side JWT Auth Indicator */}
        <div className="flex items-center space-x-3">
          {auth.user ? (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenAuthModal}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EFE8E5] hover:border-[#D9CCC5] text-[#14080E] font-mono text-xs shadow-xs transition"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#5A1844]" />
                <span className="font-semibold">{auth.user.fullName}</span>
                <span className="text-[10px] text-[#0E7A4A] font-bold">• Active JWT</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="nixtio-gradient-btn inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full font-semibold text-xs shadow-sm cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In / JWT</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center space-x-3 cursor-pointer select-none"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#470D92] via-[#5A1844] to-[#B62C22] flex items-center justify-center shadow-md shadow-[#470D92]/20 border border-white/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#14080E] tracking-tight">AI Career Intelligence</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-mono font-bold tracking-wider bg-[#FFF2EE] text-[#B62C22] border border-[#FCDDD5]">
                  Platform
                </span>
              </div>
              <p className="text-xs text-[#6B6066] hidden sm:block">
                Modern Warm SaaS Engine • Real-time Roadmap Execution
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-1.5 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                activeTab === 'dashboard'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('analyzer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                activeTab === 'analyzer'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Match Room</span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition relative ${
                activeTab === 'kanban'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <Trello className="w-4 h-4" />
              <span>Kanban</span>
              <span className="w-2 h-2 rounded-full bg-[#B62C22] animate-ping"></span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                activeTab === 'history'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Cosmos History</span>
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                activeTab === 'architecture'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Architecture</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition ${
                activeTab === 'code'
                  ? 'nixtio-gradient-btn shadow-sm'
                  : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#F8F2EF]'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python Source</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
