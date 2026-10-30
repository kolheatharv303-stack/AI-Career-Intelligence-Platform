import React, { useState } from 'react';
import {
  FileText,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface EndpointDoc {
  method: 'POST' | 'GET' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  authRequired: boolean;
  requestBody?: string;
  responseBody: string;
  curlExample: string;
}

export const ApiDocsView: React.FC = () => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);

  const endpoints: EndpointDoc[] = [
    {
      method: 'POST',
      path: '/auth/register',
      summary: 'Register User Account',
      description: 'Creates candidate user in AWS RDS PostgreSQL, hashes password with salted bcrypt, and generates Bearer JWT.',
      authRequired: false,
      requestBody: `{
  "email": "candidate@example.com",
  "password": "SecurePassword123!",
  "full_name": "Alex Morgan"
}`,
      responseBody: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": {
    "id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9",
    "email": "candidate@example.com",
    "full_name": "Alex Morgan",
    "created_at": "2026-10-29T10:45:00Z"
  }
}`,
      curlExample: `curl -X POST "http://localhost:8000/auth/register" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"candidate@example.com","password":"SecurePassword123!","full_name":"Alex Morgan"}'`,
    },
    {
      method: 'POST',
      path: '/auth/login',
      summary: 'Authenticate User',
      description: 'Validates email and bcrypt password hash against AWS RDS and returns Bearer JWT.',
      authRequired: false,
      requestBody: `{
  "email": "candidate@example.com",
  "password": "SecurePassword123!"
}`,
      responseBody: `{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400,
  "user": { ... }
}`,
      curlExample: `curl -X POST "http://localhost:8000/auth/login" \\
  -H "Content-Type: application/json" \\
  -d '{"email":"candidate@example.com","password":"SecurePassword123!"}'`,
    },
    {
      method: 'POST',
      path: '/resumes/upload',
      summary: 'Upload & Parse Resume',
      description: 'Extracts raw text from PDF/TXT stream, invokes Google Gemini for structured profile entities, and commits to AWS RDS PostgreSQL.',
      authRequired: true,
      requestBody: `(multipart/form-data: file=@resume.pdf)`,
      responseBody: `{
  "id": "res_47a19e22-12f5-49c8-98e1-d309be041c21",
  "user_id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9",
  "filename": "resume.pdf",
  "raw_text_length": 2450,
  "parsed_profile": {
    "candidate_name": "Alex Morgan",
    "professional_summary": "...",
    "skills": { "technical": ["Python", "FastAPI"], "soft": [], "tools_and_frameworks": [] },
    "experience": [ ... ],
    "education": [ ... ],
    "certifications": [ ... ]
  },
  "created_at": "2026-10-29T10:46:00Z"
}`,
      curlExample: `curl -X POST "http://localhost:8000/resumes/upload" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -F "file=@Alex_Morgan_Resume.pdf"`,
    },
    {
      method: 'POST',
      path: '/ai/match',
      summary: 'AI ATS Match & Cosmos Audit Log',
      description: 'Compares resume in RDS against job description text using Gemini structured JSON outputs. Persists complete run into Azure Cosmos DB ("AIInteractions" container).',
      authRequired: true,
      requestBody: `{
  "resume_id": "res_47a19e22-12f5-49c8-98e1-d309be041c21",
  "job_description_text": "We are seeking a Principal Cloud & AI Application Engineer with expertise in AWS RDS, Azure Cosmos DB, Firebase, and Gemini...",
  "job_id": "job_optional_uuid"
}`,
      responseBody: `{
  "interaction_id": "doc_cosmos_98a71b3e",
  "user_id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9",
  "resume_id": "res_47a19e22-12f5-49c8-98e1-d309be041c21",
  "analysis": {
    "match_score": 88,
    "matched_skills": ["Python", "AWS RDS", "FastAPI"],
    "missing_skills": ["Azure Cosmos DB", "Firebase Broadcaster"],
    "strengths": ["Deep backend systems experience"],
    "gaps_summary": "Strong core foundation, recommend Azure Cosmos DB bridge project.",
    "suggested_projects": [ ... ],
    "generated_questions": [ ... ]
  },
  "tokens_used": 1420,
  "stored_in_cosmos": true,
  "timestamp": "2026-10-29T10:47:00Z"
}`,
      curlExample: `curl -X POST "http://localhost:8000/ai/match" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"resume_id":"res_47a19e22-12f5-49c8-98e1-d309be041c21","job_description_text":"..."}'`,
    },
    {
      method: 'PATCH',
      path: '/applications/{id}/status',
      summary: 'Update Application Status & Firebase Push',
      description: 'Updates application stage in AWS RDS (Applied -> Interview -> Offer -> Rejected) and immediately broadcasts real-time push event via Firebase Admin SDK.',
      authRequired: true,
      requestBody: `{
  "status": "Interview",
  "note": "Candidate advanced to system architecture round"
}`,
      responseBody: `{
  "id": "app_1092a-43f1",
  "user_id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9",
  "job_id": "job_b91048a1-8d23-41bb-b072-5a4891e4811a",
  "status": "Interview",
  "updated_at": "2026-10-29T10:48:00Z"
}`,
      curlExample: `curl -X PATCH "http://localhost:8000/applications/app_1092a-43f1/status" \\
  -H "Authorization: Bearer $ACCESS_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"status":"Interview","note":"Candidate advanced"}'`,
    },
    {
      method: 'GET',
      path: '/ai/history',
      summary: 'Fetch AI Interaction History',
      description: 'Queries Azure Cosmos DB "AIInteractions" container partitioned by current user_id to retrieve past match scores, audit logs, and questions.',
      authRequired: true,
      responseBody: `[
  {
    "id": "doc_cosmos_98a71b3e",
    "user_id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9",
    "match_score": 88,
    "missing_skills": ["Azure Cosmos DB"],
    "tokens_used": 1420,
    "timestamp": "2026-10-29T10:47:00Z"
  }
]`,
      curlExample: `curl -X GET "http://localhost:8000/ai/history?limit=20" \\
  -H "Authorization: Bearer $ACCESS_TOKEN"`,
    },
  ];

  const handleCopy = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <Terminal className="w-3.5 h-3.5" />
              OpenAPI 3.1 & Interactive API Documentation
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              FastAPI Endpoints Reference & cURL Generator
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Interactive specifications for all 5 required operations with request bodies, response schemas, and cURL commands.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>FastAPI Swagger UI: <code className="text-indigo-400">/docs</code></span>
            <span>•</span>
            <span>ReDoc: <code className="text-indigo-400">/redoc</code></span>
          </div>
        </div>
      </div>

      {/* Endpoints Accordion */}
      <div className="space-y-4">
        {endpoints.map((ep, idx) => {
          const isExpanded = expandedIdx === idx;
          const methodColor =
            ep.method === 'POST'
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : ep.method === 'PATCH'
              ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
              : 'bg-blue-500/10 text-blue-400 border-blue-500/30';

          return (
            <div
              key={idx}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden transition"
            >
              <div
                onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                className="p-4 sm:p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 select-none"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded font-mono text-xs font-bold border ${methodColor}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{ep.path}</span>
                  <span className="text-xs text-slate-400 hidden sm:inline-block">— {ep.summary}</span>
                </div>

                <div className="flex items-center gap-3">
                  {ep.authRequired && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-400 border border-indigo-800">
                      Bearer JWT
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="p-5 border-t border-slate-800 bg-slate-950/60 space-y-4">
                  <p className="text-xs text-slate-300">{ep.description}</p>

                  {/* cURL Example */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-1">
                      <span>cURL Command</span>
                      <button
                        onClick={() => handleCopy(idx, ep.curlExample)}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                      >
                        {copiedIdx === idx ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedIdx === idx ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-emerald-300 overflow-x-auto">
                      {ep.curlExample}
                    </pre>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ep.requestBody && (
                      <div>
                        <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                          Request Body
                        </span>
                        <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-300 overflow-x-auto max-h-[220px]">
                          {ep.requestBody}
                        </pre>
                      </div>
                    )}

                    <div className={ep.requestBody ? '' : 'md:col-span-2'}>
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-1">
                        Response Payload (200 OK)
                      </span>
                      <pre className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs font-mono text-indigo-300 overflow-x-auto max-h-[220px]">
                        {ep.responseBody}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
