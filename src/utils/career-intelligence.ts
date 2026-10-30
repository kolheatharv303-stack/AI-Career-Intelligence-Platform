/**
 * Pure career intelligence logic, ATS matching algorithms, status state machines,
 * and token estimation utilities for the AI Career Intelligence Platform.
 */

export type ApplicationStage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface MatchAnalysis {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gapsSummary: string;
}

export interface CandidateProfile {
  candidateName: string;
  email: string;
  skills: {
    technical: string[];
    soft: string[];
    tools: string[];
  };
  experienceYears?: number;
}

/**
 * State machine defining valid application status transitions across Kanban stages.
 */
export const VALID_STATUS_TRANSITIONS: Record<ApplicationStage, ApplicationStage[]> = {
  Applied: ['Screening', 'Interview', 'Rejected'],
  Screening: ['Interview', 'Offer', 'Rejected'],
  Interview: ['Offer', 'Rejected'],
  Offer: ['Rejected'], // Offer accepted or rejected
  Rejected: ['Applied', 'Screening'], // Can re-engage candidate
};

/**
 * Validates whether a state transition is legal according to lifecycle rules.
 */
export function isValidStatusTransition(current: ApplicationStage, next: ApplicationStage): boolean {
  if (current === next) return false;
  const allowed = VALID_STATUS_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * Computes ATS skill match ratio and clamped score (0-100).
 */
export function calculateAtsMatchScore(
  candidateSkills: string[],
  requiredJobSkills: string[]
): { score: number; matched: string[]; missing: string[] } {
  if (!requiredJobSkills.length) {
    return { score: 100, matched: candidateSkills, missing: [] };
  }

  const normalizedCandidate = candidateSkills.map((s) => s.trim().toLowerCase());
  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of requiredJobSkills) {
    const trimmed = req.trim();
    const lower = trimmed.toLowerCase();
    if (normalizedCandidate.some((c) => c === lower || c.includes(lower) || lower.includes(c))) {
      matched.push(trimmed);
    } else {
      missing.push(trimmed);
    }
  }

  const ratio = matched.length / requiredJobSkills.length;
  // Score clamped between 0 and 100
  const score = Math.round(ratio * 100);

  return { score, matched, missing };
}

/**
 * Estimates LLM token usage for prompt and completion.
 */
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  // Standard heuristic: 1 token ~= 4 chars or 0.75 words
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words * 1.35);
}

/**
 * Verifies Cosmos DB AIInteractions document structure before saving.
 */
export function validateCosmosInteractionDocument(doc: {
  userId?: string;
  resumeId?: string;
  matchScore?: number;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!doc.userId) errors.push('Missing required partition key userId');
  if (!doc.resumeId) errors.push('Missing required resumeId');
  if (doc.matchScore === undefined || doc.matchScore < 0 || doc.matchScore > 100) {
    errors.push('matchScore must be an integer between 0 and 100');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface DashboardMetrics {
  totalApplications: number;
  averageMatchScore: number;
  interviewsPending: number;
  skillGapsIdentified: number;
}

/**
 * Computes dashboard overview metrics from current applications and Cosmos history.
 */
export function computeDashboardMetrics(
  applications: Array<{ status: ApplicationStage }>,
  history: Array<{ matchScore: number; missingSkills?: string[] }>
): DashboardMetrics {
  const totalApplications = applications.length;
  const interviewsPending = applications.filter(
    (a) => a.status === 'Interview' || a.status === 'Screening'
  ).length;

  const totalScore = history.reduce((acc, h) => acc + (h.matchScore || 0), 0);
  const averageMatchScore = history.length > 0 ? Math.round(totalScore / history.length) : 0;

  const allMissingSkills = new Set<string>();
  history.forEach((h) => {
    (h.missingSkills || []).forEach((skill) => allMissingSkills.add(skill.trim().toLowerCase()));
  });

  return {
    totalApplications,
    averageMatchScore,
    interviewsPending,
    skillGapsIdentified: allMissingSkills.size,
  };
}

/**
 * Formats a Cosmos interaction record into a downloadable Markdown report.
 */
export function generateInteractionMarkdownReport(doc: {
  id: string;
  companyName?: string;
  jobTitle?: string;
  matchScore: number;
  timestamp: string;
  matchedSkills?: string[];
  missingSkills?: string[];
  recommendations?: Array<{ title: string; description: string; skillsAddressed?: string[] }>;
  generatedQuestions?: Array<{ question: string; category: string; rationale: string; sampleAnswerGuideline?: string }>;
  tokensUsed?: number;
}): string {
  const dateStr = new Date(doc.timestamp).toLocaleString();
  return `# AI Career Intelligence Analysis Report

**Analysis Document ID:** \`${doc.id}\`  
**Target Position:** ${doc.jobTitle || 'Senior Software Engineer'}  
**Target Company:** ${doc.companyName || 'Technology Partner'}  
**Analysis Timestamp:** ${dateStr}  
**ATS Match Percentage:** **${doc.matchScore}%**  
**LLM Tokens Consumed:** ${doc.tokensUsed || 'N/A'} (Gemini 2.5 Flash)  

---

## 🎯 Skills Analysis
### ✅ Matched Competencies (${(doc.matchedSkills || []).length})
${(doc.matchedSkills || []).map((s) => `- ${s}`).join('\n') || '_None listed_'}

### ⚠️ Skill Gaps & Missing Requirements (${(doc.missingSkills || []).length})
${(doc.missingSkills || []).map((s) => `- **${s}**`).join('\n') || '_No critical gaps detected_'}

---

## 💡 Recommended Portfolio Bridge Projects
${(doc.recommendations || [])
  .map(
    (p, i) => `### ${i + 1}. ${p.title}
${p.description}
*Skills Addressed:* ${(p.skillsAddressed || []).join(', ')}
`
  )
  .join('\n') || '_No specific projects recommended_'}

---

## 🎤 Tailored Interview Preparation Questions
${(doc.generatedQuestions || [])
  .map(
    (q, i) => `### Question ${i + 1} (${q.category})
**${q.question}**

*Rationale:* ${q.rationale}  
${q.sampleAnswerGuideline ? `*Preparation Guideline:* ${q.sampleAnswerGuideline}` : ''}
`
  )
  .join('\n\n') || '_No questions generated_'}

---
*Report generated by AI Career Intelligence Platform • Multi-Cloud Architecture (AWS RDS + Azure Cosmos DB + Firebase + Gemini)*
`;
}
