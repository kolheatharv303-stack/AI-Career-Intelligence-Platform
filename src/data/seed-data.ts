import {
  ApplicationRecord,
  CosmosInteractionDocument,
  JobDescriptionRecord,
  ResumeRecord,
  User,
} from '../types';

export const SEED_USER: User = {
  id: 'usr_89f02c4b-3d61-4fa2-bc4a-932b1a03e1e9',
  email: 'alex.morgan@cloudintel.io',
  fullName: 'Alex Morgan',
  createdAt: '2026-10-15T09:30:00Z',
};

export const SAMPLE_RESUME_TEXT = `ALEX MORGAN
Principal Software & Cloud Engineer
San Francisco, CA | alex.morgan@cloudintel.io | (415) 555-0192 | github.com/alexmorgan-cloud

EXECUTIVE SUMMARY:
Principal Cloud & Distributed Systems Engineer with 8+ years designing high-throughput asynchronous backend systems, cloud architectures, and machine learning inference pipelines. Deep expertise in Python (FastAPI, asyncio, SQLAlchemy 2.0), relational database modeling on AWS RDS PostgreSQL, containerization (Docker, Kubernetes), and CI/CD automation. Passionate about low-latency APIs and resilient multi-cloud architectures.

CORE SKILLS:
- Languages & Frameworks: Python (FastAPI, Flask, asyncio), TypeScript, Node.js, Go
- Relational Databases: AWS RDS PostgreSQL, asyncpg, SQLAlchemy 2.0, Alembic, MySQL
- Distributed & NoSQL: Redis, DynamoDB, Apache Kafka, Elasticsearch
- Cloud & Infrastructure: AWS (RDS, ECS, Lambda, S3, IAM, CloudWatch), Docker, Kubernetes, Terraform
- Real-Time & Auth: WebSockets, Google Firebase, JWT, OAuth2, Passlib bcrypt
- AI & LLMs: Google Gemini API, LangChain, RAG Pipelines, Vector Embeddings

PROFESSIONAL EXPERIENCE:
Senior Staff Backend Engineer | CloudScale Systems Inc. | 2022 - Present
- Architected asynchronous FastAPI microservices processing 120M+ monthly requests with sub-45ms p99 response times.
- Spearheaded database migration to AWS RDS PostgreSQL with connection pooling (asyncpg), reducing p95 database latency by 38%.
- Integrated Google Gemini 2.5 Flash for automated document extraction pipelines, lowering processing cost by 62%.

Backend Systems Engineer | DataStream Labs | 2019 - 2022
- Developed event-driven message consumers using Kafka and Redis streams handling 15,000 events/sec.
- Designed RESTful API contracts with Pydantic schemas and automated OpenAPI specifications.
- Implemented role-based access control (RBAC) and OAuth2/JWT token authentication service.

EDUCATION:
B.S. in Computer Science | University of California, Berkeley (2018)`;

export const SAMPLE_JOB_TEXT = `Position: Principal Cloud & AI Application Engineer
Company: AnthroScale AI Platforms
Location: Remote / Hybrid

About The Role:
We are seeking an exceptional Principal Cloud & AI Application Engineer to lead the architectural development of our enterprise AI Career & Talent Intelligence Platform. You will design, build, and deploy high-reliability, asynchronous backend services that orchestrate relational databases, distributed document stores, real-time sync systems, and LLM reasoning models.

Key Responsibilities:
- Design modular, production-ready backend architectures in Python (FastAPI 3.11+, Pydantic v2, asyncio).
- Lead relational data modeling on AWS RDS PostgreSQL using SQLAlchemy 2.0 (asyncio) and asyncpg.
- Implement distributed document storage and audit pipelines in Azure Cosmos DB (SQL/Core API).
- Broadcast real-time application updates and candidate pipeline events using Google Firebase Admin SDK.
- Engineer generative AI features using Google Gemini API with strict structured JSON output schemas.
- Mentor engineering teams, establish security best practices (JWT, bcrypt), and enforce multi-cloud resilience.

Required Qualifications:
- 7+ years building production backend systems with Python and asynchronous web frameworks (FastAPI).
- Hands-on expertise with AWS RDS PostgreSQL, query optimization, connection pooling, and migrations.
- Working experience with Azure Cosmos DB (SQL/Core API) partition key strategy and Request Unit (RU) optimization.
- Experience with Google Firebase Admin SDK (Firestore / Realtime Database) for real-time client push events.
- Demonstrated production experience with Google Gemini API or LLM structured output generation.
- Strong knowledge of container orchestration (Docker, Kubernetes) and CI/CD pipelines.`;

export const SEED_RESUME: ResumeRecord = {
  id: 'res_47a19e22-12f5-49c8-98e1-d309be041c21',
  userId: SEED_USER.id,
  filename: 'Alex_Morgan_Principal_Cloud_Engineer.pdf',
  rawText: SAMPLE_RESUME_TEXT,
  parsedProfile: {
    candidateName: 'Alex Morgan',
    email: 'alex.morgan@cloudintel.io',
    phone: '(415) 555-0192',
    location: 'San Francisco, CA',
    professionalSummary:
      'Principal Cloud & Distributed Systems Engineer with 8+ years designing high-throughput asynchronous backend systems, cloud architectures, and machine learning inference pipelines.',
    skills: {
      technical: [
        'Python',
        'FastAPI',
        'asyncio',
        'SQLAlchemy 2.0',
        'AWS RDS PostgreSQL',
        'asyncpg',
        'Docker',
        'Kubernetes',
        'Google Gemini API',
        'JWT Auth',
      ],
      soft: [
        'System Architecture',
        'Engineering Leadership',
        'Technical Mentorship',
        'Cross-Functional Collaboration',
      ],
      toolsAndFrameworks: ['Git', 'Terraform', 'Postman', 'Docker Compose', 'Linux'],
    },
    experience: [
      {
        company: 'CloudScale Systems Inc.',
        role: 'Senior Staff Backend Engineer',
        duration: '2022 - Present',
        highlights: [
          'Architected asynchronous FastAPI microservices processing 120M+ monthly requests.',
          'Spearheaded database migration to AWS RDS PostgreSQL with connection pooling.',
        ],
      },
      {
        company: 'DataStream Labs',
        role: 'Backend Systems Engineer',
        duration: '2019 - 2022',
        highlights: [
          'Developed event-driven message consumers using Kafka and Redis streams.',
          'Designed RESTful API contracts with Pydantic schemas and automated OpenAPI specs.',
        ],
      },
    ],
    education: [
      {
        institution: 'University of California, Berkeley',
        degree: 'B.S. in Computer Science',
        year: '2018',
      },
    ],
    certifications: ['AWS Certified Solutions Architect - Professional', 'Google Cloud Professional Cloud Architect'],
  },
  createdAt: '2026-10-20T11:00:00Z',
};

export const SEED_JOB: JobDescriptionRecord = {
  id: 'job_b91048a1-8d23-41bb-b072-5a4891e4811a',
  userId: SEED_USER.id,
  companyName: 'AnthroScale AI Platforms',
  title: 'Principal Cloud & AI Application Engineer',
  rawText: SAMPLE_JOB_TEXT,
  createdAt: '2026-10-22T14:15:00Z',
};

export const SEED_APPLICATIONS: ApplicationRecord[] = [
  {
    id: 'app_1092a-43f1',
    userId: SEED_USER.id,
    jobId: SEED_JOB.id,
    companyName: 'AnthroScale AI Platforms',
    jobTitle: 'Principal Cloud & AI Application Engineer',
    status: 'Interview',
    updatedAt: '2026-10-28T16:20:00Z',
  },
  {
    id: 'app_8471b-90e2',
    userId: SEED_USER.id,
    jobId: 'job_custom_2',
    companyName: 'Vertex Data Systems',
    jobTitle: 'Staff Distributed Systems Architect',
    status: 'Applied',
    updatedAt: '2026-10-25T11:45:00Z',
  },
  {
    id: 'app_3819c-11d4',
    userId: SEED_USER.id,
    jobId: 'job_custom_3',
    companyName: 'HyperScale Cloud Infrastructure',
    jobTitle: 'Principal Cloud Engineer (AWS / Python)',
    status: 'Offer',
    updatedAt: '2026-10-27T18:00:00Z',
  },
  {
    id: 'app_9201d-77a8',
    userId: SEED_USER.id,
    jobId: 'job_custom_4',
    companyName: 'Legacy Fintech Corp',
    jobTitle: 'Lead Python Services Engineer',
    status: 'Rejected',
    updatedAt: '2026-10-18T10:00:00Z',
  },
];

export const SEED_COSMOS_DOCUMENTS: CosmosInteractionDocument[] = [
  {
    id: 'doc_cosmos_98a71b3e',
    userId: SEED_USER.id,
    resumeId: SEED_RESUME.id,
    jobId: SEED_JOB.id,
    timestamp: '2026-10-28T16:20:00Z',
    matchScore: 88,
    matchedSkills: [
      'Python (FastAPI)',
      'AWS RDS PostgreSQL',
      'SQLAlchemy 2.0 (asyncio)',
      'asyncpg',
      'Google Gemini API',
      'JWT Auth & Passlib',
      'Docker & Containerization',
    ],
    missingSkills: [
      'Azure Cosmos DB (SQL/Core API) partition keys',
      'Google Firebase Admin SDK Realtime Broadcaster',
    ],
    recommendations: [
      {
        title: 'Multi-Cloud Event Sourcing Bridge',
        description:
          'Construct an event-driven telemetry ingest pipeline utilizing Azure Cosmos DB Change Feed and Google Firebase Realtime Database triggers.',
        skillsAddressed: ['Azure Cosmos DB', 'Firebase Admin SDK', 'Event Sourcing'],
      },
      {
        title: 'High-Throughput RDS PostgreSQL Connection Pool Benchmarking',
        description:
          'Benchmark SQLAlchemy 2.0 asyncpg pool_recycle and statement cache under high concurrency loads simulating 10k RPS.',
        skillsAddressed: ['AWS RDS PostgreSQL', 'Connection Pooling', 'Performance Optimization'],
      },
    ],
    generatedQuestions: [
      {
        question:
          'How do you model partition keys in Azure Cosmos DB to prevent hot partitions and minimize Request Units (RUs) during heavy write bursts?',
        category: 'Distributed Systems',
        rationale:
          'Candidate has extensive relational RDS experience but needs to demonstrate distributed NoSQL data modeling proficiency.',
        sampleAnswerGuideline:
          'Discuss high-cardinality partition keys, synthetic compound keys, physical partition distribution, and batch write strategies.',
      },
      {
        question:
          'Explain how you guarantee transaction atomicity across AWS RDS PostgreSQL commits and Google Firebase Admin broadcast events.',
        category: 'Architecture & Reliability',
        rationale:
          'Tests dual-write consistency patterns when updating relational database state and pushing real-time socket events.',
        sampleAnswerGuideline:
          'Detail the Transactional Outbox pattern, idempotent message listeners, dead-letter queues, and compensation workflows.',
      },
      {
        question:
          'How does the Python asyncio event loop manage CPU-bound password hashing with bcrypt, and how does your FastAPI backend prevent loop latency spikes?',
        category: 'Concurrency & Security',
        rationale: 'Directly validates deep understanding of asynchronous Python runtime constraints in auth pipelines.',
        sampleAnswerGuideline:
          'Explain delegating CPU-bound operations to ThreadPoolExecutor using run_in_executor to avoid blocking the asyncio event loop.',
      },
    ],
    tokensUsed: 1420,
    modelVersion: 'gemini-2.5-flash',
  },
];
