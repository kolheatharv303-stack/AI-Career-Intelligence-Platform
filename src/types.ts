export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}

export interface ParsedProfile {
  candidateName: string;
  email: string;
  phone?: string;
  location?: string;
  professionalSummary: string;
  skills: {
    technical: string[];
    soft: string[];
    toolsAndFrameworks: string[];
  };
  experience: {
    company: string;
    role: string;
    duration: string;
    highlights: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    year: string;
  }[];
  certifications: string[];
}

export interface ResumeRecord {
  id: string;
  userId: string;
  filename: string;
  rawText: string;
  parsedProfile: ParsedProfile;
  createdAt: string;
}

export interface JobDescriptionRecord {
  id: string;
  userId: string;
  companyName: string;
  title: string;
  rawText: string;
  createdAt: string;
}

export interface SuggestedProject {
  title: string;
  description: string;
  skillsAddressed: string[];
}

export interface InterviewQuestion {
  question: string;
  category: string;
  rationale: string;
  sampleAnswerGuideline: string;
}

export interface MatchAnalysisResult {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gapsSummary: string;
  suggestedProjects: SuggestedProject[];
  generatedQuestions: InterviewQuestion[];
}

export interface CosmosInteractionDocument {
  id: string;
  userId: string;
  resumeId: string;
  jobId?: string;
  companyName?: string;
  jobTitle?: string;
  timestamp: string;
  matchScore: number;
  missingSkills: string[];
  matchedSkills: string[];
  recommendations: SuggestedProject[];
  generatedQuestions: InterviewQuestion[];
  tokensUsed: number;
  modelVersion: string;
  rawAnalysis?: Record<string, unknown>;
}

export type ApplicationStatus = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';

export interface ApplicationRecord {
  id: string;
  userId: string;
  jobId: string;
  companyName: string;
  jobTitle: string;
  status: ApplicationStatus;
  updatedAt: string;
  note?: string;
  salary?: string;
  location?: string;
}

export interface FirebaseBroadcastEvent {
  eventType: string;
  applicationId: string;
  userId: string;
  jobId: string;
  companyName: string;
  jobTitle: string;
  oldStatus: string;
  newStatus: string;
  note?: string;
  timestamp: string;
  deliveredVia: string;
}
