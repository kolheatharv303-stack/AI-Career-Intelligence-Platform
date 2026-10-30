import React from 'react';
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Volume2,
  Activity,
  ShieldCheck,
  Building,
  Target,
  Zap,
  CheckCircle2,
  Layers,
  Flame,
  Database,
  Cloud,
} from 'lucide-react';

interface HeroSectionProps {
  onStartForFree: () => void;
  onExplorePaths: () => void;
  averageMatchScore: number;
  totalApplications: number;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartForFree,
  onExplorePaths,
  averageMatchScore,
  totalApplications,
}) => {
  return (
    <section className="relative overflow-hidden bg-white/80 border border-[#EFE8E5] rounded-[2.5rem] p-6 sm:p-10 lg:p-14 shadow-[0_20px_50px_rgba(71,13,146,0.04)] mb-12">
      {/* Background delicate warm glow gradients */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-gradient-to-br from-[#FFE9E5] to-[#F7D8E0] rounded-full blur-3xl opacity-60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-gradient-to-tr from-[#FFF0ED] to-[#FCEAE5] rounded-full blur-2xl opacity-70 pointer-events-none" />

      {/* Main Two-Column Hero Split */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column: Typography & Action Group (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Top Focus Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF5F2] border border-[#FCDDD5] text-[#5A1844] text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#B62C22] animate-pulse" />
            <span className="tracking-wide">AI Career Intelligence • Multi-Cloud Cloud Engine</span>
          </div>

          {/* Oversized Clean Sans-Serif Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[#14080E] tracking-tight leading-[1.12]">
            AI career intelligence for{' '}
            <span className="nixtio-gradient-text">real-time roadmap</span> execution
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#6B6066] leading-relaxed max-w-xl">
            Evaluate resumes against high-demand technical roles, detect critical skill gaps with Gemini 2.5 Flash,
            generate portfolio roadmaps, and sync real-time interview stages across open workspaces.
          </p>

          {/* CTA Group: Primary Pill + Secondary Outline + Inline Micro-Copy */}
          <div className="pt-2 space-y-4">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              {/* Primary Pill Gradient Button */}
              <button
                onClick={onStartForFree}
                className="nixtio-gradient-btn px-7 py-4 rounded-full font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg cursor-pointer"
              >
                <span>Start for free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Secondary Pill Outline Button */}
              <button
                onClick={onExplorePaths}
                className="px-7 py-4 rounded-full bg-white hover:bg-[#FFF9F7] text-[#14080E] hover:text-[#5A1844] font-bold text-sm sm:text-base border border-[#EFE8E5] hover:border-[#D9CCC5] shadow-xs transition duration-200 cursor-pointer"
              >
                Explore paths
              </button>
            </div>

            {/* Micro-copy inline checkmarks */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-[#6B6066] pt-1">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-[#B62C22]" /> Free trial
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-[#B62C22]" /> No card required
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Check className="w-3.5 h-3.5 text-[#B62C22]" /> Instant access
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Layered Mockup / Floating Intelligence Widget (5 Cols) */}
        <div className="lg:col-span-5 relative">
          {/* Subtle connecting dotted vector lines */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="15%"
              y1="10%"
              x2="50%"
              y2="30%"
              stroke="#D9CCC5"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1="85%"
              y1="18%"
              x2="60%"
              y2="45%"
              stroke="#D9CCC5"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
            <line
              x1="12%"
              y1="85%"
              x2="40%"
              y2="75%"
              stroke="#D9CCC5"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          </svg>

          {/* Orbiting Badge Top-Left: Target Role Node */}
          <div className="absolute -top-4 -left-4 sm:-left-6 z-20 bg-white/95 backdrop-blur-md border border-[#EFE8E5] rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-2 animate-bounce-slow">
            <div className="w-7 h-7 rounded-xl bg-[#FFF2EE] flex items-center justify-center text-[#B62C22]">
              <Target className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-[#6B6066] font-medium leading-none">Target Match</div>
              <div className="text-xs font-bold text-[#14080E] mt-0.5">AnthroScale AI</div>
            </div>
          </div>

          {/* Orbiting Badge Top-Right: Real-time Live Sync Node */}
          <div className="absolute -top-2 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md border border-[#EFE8E5] rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#470D92] to-[#5A1844] flex items-center justify-center text-white">
              <Flame className="w-4 h-4 text-orange-300" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-[#6B6066] font-medium leading-none">Firebase Sync</div>
              <div className="text-xs font-bold text-[#5A1844] mt-0.5">Live Bus Active</div>
            </div>
          </div>

          {/* Orbiting Badge Bottom-Left: Interview Feedback Node */}
          <div className="absolute -bottom-4 -left-2 sm:-left-4 z-20 bg-white/95 backdrop-blur-md border border-[#EFE8E5] rounded-2xl px-3.5 py-2 shadow-md flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#E8F8F0] flex items-center justify-center text-[#0E7A4A]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-[10px] text-[#6B6066] font-medium leading-none">Architecture Round</div>
              <div className="text-xs font-bold text-[#0E7A4A] mt-0.5">Candidate Advanced</div>
            </div>
          </div>

          {/* Central Intelligence Card: Soft white rounded container */}
          <div className="bg-white/95 backdrop-blur-md border border-[#EFE8E5] rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-15px_rgba(71,13,146,0.08)] space-y-5 relative z-10">
            {/* Header with Live Status & Audio/Waveform Pulse */}
            <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#470D92] via-[#5A1844] to-[#B62C22] flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-[#14080E] text-sm leading-tight">Live Career Intelligence</h3>
                  <p className="text-[11px] text-[#6B6066] font-mono">Gemini 2.5 Flash Telemetry</p>
                </div>
              </div>

              {/* Audio/Waveform Indicator Bars */}
              <div className="flex items-center gap-1 bg-[#FFF5F2] px-2.5 py-1.5 rounded-full border border-[#FCDDD5]">
                <Volume2 className="w-3.5 h-3.5 text-[#B62C22]" />
                <div className="flex items-end gap-0.5 h-3">
                  <span className="w-0.5 h-1.5 bg-[#B62C22] rounded-full animate-pulse" />
                  <span className="w-0.5 h-3 bg-[#5A1844] rounded-full animate-pulse delay-75" />
                  <span className="w-0.5 h-2 bg-[#470D92] rounded-full animate-pulse delay-150" />
                  <span className="w-0.5 h-2.5 bg-[#B62C22] rounded-full animate-pulse delay-100" />
                </div>
                <span className="text-[10px] font-mono text-[#5A1844] font-semibold ml-0.5">Active</span>
              </div>
            </div>

            {/* Role Readiness Score: 92% Highlight Box */}
            <div className="bg-[#FFFBF9] border border-[#F3EAE6] rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-[#6B6066] uppercase tracking-wider block">
                  Role Readiness Score
                </span>
                <div className="text-2xl font-black text-[#14080E] font-mono mt-0.5">
                  92% <span className="text-xs text-[#0E7A4A] font-semibold font-sans">Strong Fit</span>
                </div>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#470D92] to-[#B62C22] p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center font-mono font-black text-[#470D92] text-sm">
                  92%
                </div>
              </div>
            </div>

            {/* Structured Analysis Bubbles */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#F7FDF9] border border-[#DCF4E7] text-[#0E7A4A]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[11px]">Matched: Python, AWS RDS, FastAPI, Docker</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#E4F8ED] px-2 py-0.5 rounded">6/8 Found</span>
              </div>

              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-[#FFF7F6] border border-[#FCDDD5] text-[#B62C22]">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-[11px]">Missing: Azure Cosmos DB Partitioning</span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-[#FFE9E5] px-2 py-0.5 rounded">Gap Alert</span>
              </div>

              {/* Actionable Project Pill */}
              <div className="p-3 rounded-xl bg-[#FAF6FB] border border-[#EFE2F3] text-[#5A1844] text-[11px] flex items-center justify-between">
                <span className="font-medium">Recommended Project: Event Sourcing Bridge</span>
                <span className="font-bold font-mono text-[10px] text-[#470D92] underline cursor-pointer">
                  Roadmap →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof & Banner Strip (Bottom of Hero) */}
      <div className="mt-12 pt-8 border-t border-[#EFE8E5] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Highlight banner pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FFF5F2] border border-[#FCDDD5] text-xs font-bold text-[#5A1844]">
            <Zap className="w-3.5 h-3.5 text-[#B62C22]" />
            <span>Unlock real-time role intelligence — Full Multi-Cloud Access</span>
          </div>

          <div className="text-xs text-[#6B6066] font-medium">
            Over <strong className="text-[#14080E] font-bold">10,000+</strong> candidates & talent teams empowered
          </div>
        </div>

        {/* Bottom row: Muted partner/company badges in a clean, spaced flex-row */}
        <div className="flex flex-wrap items-center justify-between gap-6 pt-2 text-[#6B6066]/70 grayscale hover:grayscale-0 transition duration-300">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider font-mono">
            <Cloud className="w-4 h-4 text-[#5A1844]" />
            <span>AWS RDS POSTGRESQL</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider font-mono">
            <Database className="w-4 h-4 text-[#470D92]" />
            <span>AZURE COSMOS DB</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider font-mono">
            <Flame className="w-4 h-4 text-[#B62C22]" />
            <span>GOOGLE FIREBASE</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider font-mono">
            <Sparkles className="w-4 h-4 text-[#5A1844]" />
            <span>GOOGLE GEMINI 2.5</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider font-mono">
            <Building className="w-4 h-4 text-[#14080E]" />
            <span>ANTHROSCALE AI</span>
          </div>
        </div>
      </div>
    </section>
  );
};
