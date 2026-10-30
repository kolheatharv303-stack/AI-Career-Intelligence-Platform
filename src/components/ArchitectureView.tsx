import React, { useState } from 'react';
import {
  Cloud,
  Database,
  Flame,
  Sparkles,
  Server,
  Layers,
  CheckCircle2,
  Network,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const [selectedPillar, setSelectedPillar] = useState<'rds' | 'cosmos' | 'firebase' | 'gemini'>('rds');

  return (
    <div className="space-y-8">
      {/* Executive Architecture Banner */}
      <div className="bg-white/95 border border-[#EFE8E5] rounded-[2.5rem] p-7 sm:p-10 shadow-[0_20px_50px_rgba(71,13,146,0.03)]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FCDDD5] text-[#5A1844] text-xs font-semibold mb-4">
            <Layers className="w-3.5 h-3.5 text-[#B62C22]" />
            Enterprise Multi-Cloud Separation of Concerns
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#14080E] tracking-tight">
            High-Performance Asynchronous Cloud Architecture
          </h2>
          <p className="mt-3 text-[#6B6066] text-sm sm:text-base leading-relaxed">
            The platform decouples relational ACID operations (AWS RDS), unstructured LLM audit history
            (Azure Cosmos DB), sub-second status broadcast events (Google Firebase), and generative ATS intelligence
            (Google Gemini 2.5 Flash) behind a modular Python 3.11+ FastAPI service layer.
          </p>
        </div>

        {/* Dynamic Topology Flow Diagram */}
        <div className="mt-8 pt-8 border-t border-[#F5EFEB]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-center">
            {/* FastAPI Core */}
            <div className="md:col-span-1 bg-[#FFFBF9] border border-[#EFE8E5] rounded-3xl p-4.5 text-center shadow-xs">
              <div className="w-10 h-10 mx-auto rounded-2xl bg-[#EAF8F1] border border-[#D0F1E1] flex items-center justify-center text-[#0E7A4A] mb-2.5">
                <Server className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-[#14080E] text-sm">FastAPI Core</h3>
              <p className="text-[11px] text-[#6B6066] mt-1 font-mono">Python 3.11 + Pydantic v2</p>
              <div className="mt-2 text-[10px] inline-flex items-center gap-1 text-[#0E7A4A] bg-[#EAF8F1] px-2.5 py-0.5 rounded-full font-bold">
                <CheckCircle2 className="w-3 h-3" /> Non-blocking I/O
              </div>
            </div>

            {/* Cloud Pillars 2-5 */}
            <div
              onClick={() => setSelectedPillar('rds')}
              className={`cursor-pointer rounded-3xl p-4.5 transition border ${
                selectedPillar === 'rds'
                  ? 'bg-[#FFF2EE] border-[#B62C22] shadow-sm'
                  : 'bg-white border-[#EFE8E5] hover:border-[#D9CCC5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-[#FFF2EE] flex items-center justify-center text-[#B62C22]">
                  <Cloud className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#14080E] text-xs">AWS RDS</h4>
              </div>
              <p className="text-[11px] text-[#5A1844] font-semibold">PostgreSQL Relational</p>
              <p className="text-[10px] text-[#6B6066] mt-1">Users, Resumes, Jobs, Applications</p>
            </div>

            <div
              onClick={() => setSelectedPillar('cosmos')}
              className={`cursor-pointer rounded-3xl p-4.5 transition border ${
                selectedPillar === 'cosmos'
                  ? 'bg-[#F7EFF5] border-[#5A1844] shadow-sm'
                  : 'bg-white border-[#EFE8E5] hover:border-[#D9CCC5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-[#F7EFF5] flex items-center justify-center text-[#5A1844]">
                  <Database className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#14080E] text-xs">Azure Cosmos</h4>
              </div>
              <p className="text-[11px] text-[#470D92] font-semibold">NoSQL SQL/Core API</p>
              <p className="text-[10px] text-[#6B6066] mt-1">"AIInteractions" Partition: /user_id</p>
            </div>

            <div
              onClick={() => setSelectedPillar('firebase')}
              className={`cursor-pointer rounded-3xl p-4.5 transition border ${
                selectedPillar === 'firebase'
                  ? 'bg-[#FFF0ED] border-[#B62C22] shadow-sm'
                  : 'bg-white border-[#EFE8E5] hover:border-[#D9CCC5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-[#FFF0ED] flex items-center justify-center text-[#B62C22]">
                  <Flame className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#14080E] text-xs">Firebase Admin</h4>
              </div>
              <p className="text-[11px] text-[#B62C22] font-semibold">Real-Time Sync</p>
              <p className="text-[10px] text-[#6B6066] mt-1">Status Changed Broadcast Bus</p>
            </div>

            <div
              onClick={() => setSelectedPillar('gemini')}
              className={`cursor-pointer rounded-3xl p-4.5 transition border ${
                selectedPillar === 'gemini'
                  ? 'bg-[#F7EFF5] border-[#470D92] shadow-sm'
                  : 'bg-white border-[#EFE8E5] hover:border-[#D9CCC5]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-xl bg-[#F7EFF5] flex items-center justify-center text-[#470D92]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-[#14080E] text-xs">Google Gemini</h4>
              </div>
              <p className="text-[11px] text-[#5A1844] font-semibold">2.5 Flash Model</p>
              <p className="text-[10px] text-[#6B6066] mt-1">Structured JSON Output Schemas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Deep-Dive Pillar Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Selected Pillar Deep Technical Specification */}
        <div className="lg:col-span-2 bg-white/95 border border-[#EFE8E5] rounded-3xl p-7 shadow-xs">
          {selectedPillar === 'rds' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF2EE] flex items-center justify-center text-[#B62C22]">
                    <Cloud className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#14080E]">AWS RDS PostgreSQL Database</h3>
                    <p className="text-xs text-[#6B6066]">SQLAlchemy 2.0 (asyncio) + asyncpg Driver</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FFF0ED] text-[#B62C22] border border-[#FCDDD5]">
                  ACID Relational Core
                </span>
              </div>

              <p className="text-sm text-[#6B6066] leading-relaxed">
                Houses mission-critical relational entities with strict relational foreign-key integrity.
                Configured with non-blocking asyncpg connection pooling (<code className="text-[#5A1844]">pool_size=10</code>,{' '}
                <code className="text-[#5A1844]">max_overflow=20</code>,{' '}
                <code className="text-[#5A1844]">pool_recycle=1800s</code>).
              </p>

              {/* RDS Relational Schemas Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#B62C22] mb-2">
                    <span>table: users</span>
                    <span className="text-[#6B6066]">PK: id (UUID)</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#14080E] font-mono">
                    <li>• id: String(36) [PK]</li>
                    <li>• email: String(255) [Unique, Indexed]</li>
                    <li>• hashed_password: String(255) [bcrypt]</li>
                    <li>• full_name: String(150)</li>
                    <li>• created_at: DateTime(timezone=True)</li>
                  </ul>
                </div>

                <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#B62C22] mb-2">
                    <span>table: resumes</span>
                    <span className="text-[#6B6066]">FK: user_id</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#14080E] font-mono">
                    <li>• id: String(36) [PK]</li>
                    <li>• user_id: String(36) [FK users.id]</li>
                    <li>• raw_text: Text</li>
                    <li>• parsed_profile_json: JSON / JSONB</li>
                    <li>• created_at: DateTime(timezone=True)</li>
                  </ul>
                </div>

                <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#B62C22] mb-2">
                    <span>table: job_descriptions</span>
                    <span className="text-[#6B6066]">FK: user_id</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#14080E] font-mono">
                    <li>• id: String(36) [PK]</li>
                    <li>• user_id: String(36) [FK users.id]</li>
                    <li>• company_name: String(150)</li>
                    <li>• title: String(150)</li>
                    <li>• raw_text: Text</li>
                    <li>• created_at: DateTime(timezone=True)</li>
                  </ul>
                </div>

                <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-mono font-bold text-[#B62C22] mb-2">
                    <span>table: applications</span>
                    <span className="text-[#6B6066]">Enum Lifecycle</span>
                  </div>
                  <ul className="text-xs space-y-1.5 text-[#14080E] font-mono">
                    <li>• id: String(36) [PK]</li>
                    <li>• user_id: String(36) [FK users.id]</li>
                    <li>• job_id: String(36) [FK job_descriptions.id]</li>
                    <li>• status: Enum['Applied', 'Screening', 'Interview', 'Offer', 'Rejected']</li>
                    <li>• updated_at: DateTime(timezone=True)</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {selectedPillar === 'cosmos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F7EFF5] flex items-center justify-center text-[#5A1844]">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#14080E]">Azure Cosmos DB (SQL/Core API)</h3>
                    <p className="text-xs text-[#6B6066]">Distributed NoSQL for AI Interaction & Audit Logs</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F7EFF5] text-[#5A1844] border border-[#EBDCE6]">
                  Partition: /user_id
                </span>
              </div>

              <p className="text-sm text-[#6B6066] leading-relaxed">
                Stores high-volume, variable-schema AI telemetry, full match analysis outputs, generated interview
                questions, and token consumption metrics in the <code className="text-[#5A1844] font-bold">"AIInteractions"</code> container.
                Partitioning by <code className="text-[#5A1844] font-bold">/user_id</code> provides sub-10ms query isolation and horizontal scaling.
              </p>

              <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-4 font-mono text-xs">
                <div className="text-[#6B6066] mb-2">// Azure Cosmos DB Document Schema: AIInteractions</div>
                <pre className="text-[#5A1844] overflow-x-auto">{`{
  "id": "uuid4_document_id",
  "user_id": "usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9", // Partition Key
  "resume_id": "res_47a19e22-12f5-49c8-98e1-d309be041c21",
  "job_id": "job_b91048a1-8d23-41bb-b072-5a4891e4811a",
  "timestamp": "2026-10-29T10:45:00Z",
  "match_score": 92,
  "missing_skills": ["Azure Cosmos DB", "Firebase Realtime Broadcaster"],
  "matched_skills": ["Python", "FastAPI", "PostgreSQL", "Docker"],
  "recommendations": [ ... ],
  "generated_questions": [ ... ],
  "tokens_used": 1350,
  "model_version": "gemini-2.5-flash"
}`}</pre>
              </div>
            </div>
          )}

          {selectedPillar === 'firebase' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF0ED] flex items-center justify-center text-[#B62C22]">
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#14080E]">Google Firebase Admin SDK</h3>
                    <p className="text-xs text-[#6B6066]">Sub-Second Real-Time Status Broadcast Engine</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#FFF0ED] text-[#B62C22] border border-[#FCDDD5]">
                  Event Bus
                </span>
              </div>

              <p className="text-sm text-[#6B6066] leading-relaxed">
                When an application stage updates in AWS RDS, the FastAPI handler immediately
                dispatches a payload via Firebase Admin to Firestore (<code className="text-[#B62C22]">application_events</code>)
                and the Realtime Database (<code className="text-[#B62C22]">/users/&#123;user_id&#125;/status_events</code>).
              </p>
            </div>
          )}

          {selectedPillar === 'gemini' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F5EFEB] pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#F7EFF5] flex items-center justify-center text-[#470D92]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#14080E]">Google Gemini API (2.5 Flash)</h3>
                    <p className="text-xs text-[#6B6066]">Strict Structured JSON Output Schemas</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-[#F7EFF5] text-[#470D92] border border-[#EBDCE6]">
                  Strict Schemas
                </span>
              </div>

              <p className="text-sm text-[#6B6066] leading-relaxed">
                Utilizes Gemini 2.5 Flash with <code className="text-[#470D92]">response_mime_type="application/json"</code>{' '}
                and Pydantic validation models for ATS matching and entity extraction.
              </p>
            </div>
          )}
        </div>

        {/* Right Col: Readiness & Resilience */}
        <div className="space-y-5">
          <div className="bg-white/95 border border-[#EFE8E5] rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-[#14080E] uppercase tracking-wider mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-[#0E7A4A]" />
              Cloud Readiness & Fallbacks
            </h3>

            <div className="space-y-3">
              <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14080E]">AWS RDS (Postgres)</span>
                  <span className="text-[#0E7A4A] font-mono text-[11px] font-bold">Resilient Fallback</span>
                </div>
                <p className="text-[11px] text-[#6B6066] mt-1">
                  Asyncpg engine with automated SQLite async fallback for local zero-friction setup.
                </p>
              </div>

              <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14080E]">Azure Cosmos DB</span>
                  <span className="text-[#5A1844] font-mono text-[11px] font-bold">In-Memory Store</span>
                </div>
                <p className="text-[11px] text-[#6B6066] mt-1">
                  Partitioned in-memory document store keeps local development functional without Azure keys.
                </p>
              </div>

              <div className="bg-[#FFFBF9] border border-[#EFE8E5] rounded-2xl p-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#14080E]">Google Firebase</span>
                  <span className="text-[#B62C22] font-mono text-[11px] font-bold">Simulated Bus</span>
                </div>
                <p className="text-[11px] text-[#6B6066] mt-1">
                  Realtime BroadcastChannel syncs all status changes cross-tab in sub-second latency.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
