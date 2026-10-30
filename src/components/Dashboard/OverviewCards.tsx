import React from 'react';
import {
  Briefcase,
  Target,
  CalendarCheck,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
import { DashboardMetrics } from '../../utils/career-intelligence';

interface OverviewCardsProps {
  metrics: DashboardMetrics;
  onNavigateToAnalyzer: () => void;
  onNavigateToKanban: () => void;
  onNavigateToHistory: () => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  metrics,
  onNavigateToAnalyzer,
  onNavigateToKanban,
  onNavigateToHistory,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#14080E] tracking-tight">Executive Dashboard Overview</h2>
          <p className="text-xs sm:text-sm text-[#6B6066]">Real-time pipeline metrics aggregated across AWS RDS & Azure Cosmos DB</p>
        </div>
      </div>

      {/* Metric Cards Grid in Nixtio Warm Porcelain Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Applications */}
        <div
          onClick={onNavigateToKanban}
          className="cursor-pointer group bg-white/95 border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-3xl p-6 transition-all duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] hover:shadow-[0_20px_40px_rgba(71,13,146,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6066]">Total Applications</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] text-[#B62C22] flex items-center justify-center group-hover:scale-105 transition">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-[#14080E] tracking-tight font-mono">
              {metrics.totalApplications}
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#0E7A4A] bg-[#EAF8F1] px-2.5 py-1 rounded-full border border-[#D0F1E1]">
              <TrendingUp className="w-3 h-3 mr-1" /> Active
            </span>
          </div>
          <p className="text-xs text-[#6B6066] mt-3 flex items-center justify-between pt-3 border-t border-[#F5EFEB]">
            <span>AWS RDS Relational</span>
            <span className="text-[#5A1844] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              View Kanban <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </p>
        </div>

        {/* Card 2: Average Match Score */}
        <div
          onClick={onNavigateToAnalyzer}
          className="cursor-pointer group bg-white/95 border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-3xl p-6 transition-all duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] hover:shadow-[0_20px_40px_rgba(71,13,146,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6066]">Average Match Score</span>
            <div className="w-10 h-10 rounded-2xl bg-[#EAF8F1] text-[#0E7A4A] flex items-center justify-center group-hover:scale-105 transition">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-[#0E7A4A] tracking-tight font-mono">
              {metrics.averageMatchScore}%
            </span>
            <span className="text-[11px] font-bold text-[#5A1844] bg-[#F7EFF5] px-2.5 py-1 rounded-full border border-[#EBDCE6]">
              ATS Optimized
            </span>
          </div>
          <p className="text-xs text-[#6B6066] mt-3 flex items-center justify-between pt-3 border-t border-[#F5EFEB]">
            <span>Gemini 2.5 Flash</span>
            <span className="text-[#0E7A4A] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              Run Match <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </p>
        </div>

        {/* Card 3: Interviews Pending */}
        <div
          onClick={onNavigateToKanban}
          className="cursor-pointer group bg-white/95 border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-3xl p-6 transition-all duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] hover:shadow-[0_20px_40px_rgba(71,13,146,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6066]">Interviews Pending</span>
            <div className="w-10 h-10 rounded-2xl bg-[#F7EFF5] text-[#5A1844] flex items-center justify-center group-hover:scale-105 transition">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-[#14080E] tracking-tight font-mono">
              {metrics.interviewsPending}
            </span>
            <span className="inline-flex items-center text-[11px] font-bold text-[#B62C22] bg-[#FFF0ED] px-2.5 py-1 rounded-full border border-[#FCDDD5]">
              In Pipeline
            </span>
          </div>
          <p className="text-xs text-[#6B6066] mt-3 flex items-center justify-between pt-3 border-t border-[#F5EFEB]">
            <span>Firebase Realtime</span>
            <span className="text-[#5A1844] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              View Stages <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </p>
        </div>

        {/* Card 4: Skill Gaps Identified */}
        <div
          onClick={onNavigateToHistory}
          className="cursor-pointer group bg-white/95 border border-[#EFE8E5] hover:border-[#D9CCC5] rounded-3xl p-6 transition-all duration-200 shadow-[0_10px_30px_rgba(71,13,146,0.02)] hover:shadow-[0_20px_40px_rgba(71,13,146,0.06)] relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B6066]">Skill Gaps Identified</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0ED] text-[#B62C22] flex items-center justify-center group-hover:scale-105 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-[#B62C22] tracking-tight font-mono">
              {metrics.skillGapsIdentified}
            </span>
            <span className="text-[11px] font-bold text-[#6B6066] bg-[#F7F2EF] px-2.5 py-1 rounded-full">
              Unique Gaps
            </span>
          </div>
          <p className="text-xs text-[#6B6066] mt-3 flex items-center justify-between pt-3 border-t border-[#F5EFEB]">
            <span>Azure Cosmos DB</span>
            <span className="text-[#B62C22] font-bold group-hover:translate-x-1 transition flex items-center gap-1">
              View Audit <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
