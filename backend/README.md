# AI Career Intelligence Platform - FastAPI Backend

Production-grade, modular, asynchronous FastAPI backend engineered for multi-cloud career intelligence, candidate resume parsing, ATS gap matching, and real-time application lifecycle tracking.

---

## 🏛️ Multi-Cloud Architecture & Separation of Concerns

```
+---------------------------------------------------------------------------------+
|                                CLIENT APPLICATIONS                              |
|                    (Web Dashboard, Mobile App, Recruiter Portal)                |
+----------------------------------------+----------------------------------------+
                                         | HTTP / JSON / Bearer JWT
                                         v
+---------------------------------------------------------------------------------+
|                       FASTAPI APPLICATION CORE (Python 3.11+)                   |
|   +-------------------+  +--------------------+  +--------------------------+   |
|   |  JWT Auth & CORS  |  | Pydantic v2 Engine |  | Non-blocking Async I/O   |   |
|   +-------------------+  +--------------------+  +--------------------------+   |
+----+----------------------------+-----------------------+---------------------+--+
     |                            |                       |                     |
     | SQLAlchemy 2.0 (asyncpg)   | azure-cosmos SDK      | firebase-admin SDK  | google-genai SDK
     v                            v                       v                     v
+------------------+     +------------------+    +------------------+  +------------------+
|     AWS RDS      |     |   AZURE COSMOS   |    | GOOGLE FIREBASE  |  |  GOOGLE GEMINI   |
|    POSTGRESQL    |     |      DB NoSQL    |    |   REALTIME SYNC  |  |    2.5 FLASH     |
| (Transactional)  |     |   (AI Audit Log) |    |  (Live Events)   |  | (Intelligence)   |
|                  |     |                  |    |                  |  |                  |
| - Users          |     | Container:       |    | - Firestore &    |  | - Resume Entity  |
| - Resumes        |     | "AIInteractions" |    |   Realtime DB    |  |   Extraction     |
| - JobDescriptions|     | Partition:       |    | - Stage Changed  |  | - ATS Scoring    |
| - Applications   |     | /user_id         |    |   Broadcasts     |  | - Missing Skills |
|                  |     |                  |    | - Instant Push   |  | - Interview Prep |
+------------------+     +------------------+    +------------------+  +------------------+
```

### Why This Separation of Concerns?
1. **AWS RDS (PostgreSQL)**:
   - Relational ACID integrity for core business assets: Users, Resumes, Job Descriptions, and Application status transitions.
   - Foreign key constraints ensure applications cannot reference non-existent users or jobs.
2. **Azure Cosmos DB (SQL/Core API)**:
   - Unstructured, schema-flexible document store for large LLM runs, prompt audit trails, recommendation payloads, and token consumption metrics.
   - Partitioned by `/user_id` for horizontal sub-10ms scale and fast candidate history queries.
3. **Google Firebase Admin SDK**:
   - Sub-second real-time event distribution. When a recruiter or automated rule changes an application status (`Applied` -> `Interview` -> `Offer` -> `Rejected`), Firebase dispatches the event instantly to connected client listeners.
4. **Google Gemini API (`gemini-2.5-flash`)**:
   - High-throughput, cost-efficient generative AI layer using strict structured JSON schemas (`response_mime_type="application/json"`).

---

## 📁 Project Directory Layout

```
backend/
├── main.py                     # Application factory, lifespan context, middleware, routers
├── requirements.txt            # Pinned dependencies
├── Dockerfile                  # Multi-stage production container build
├── docker-compose.yml          # Local orchestration with PostgreSQL
├── README.md                   # System documentation and cloud setup
├── core/
│   ├── __init__.py
│   ├── config.py              # Pydantic Settings v2 configuration
│   ├── security.py            # Bcrypt hashing & PyJWT token utilities
│   └── exceptions.py          # Domain exceptions & HTTP error mappings
├── db/
│   ├── __init__.py
│   ├── base.py                # SQLAlchemy 2.0 DeclarativeBase
│   ├── session.py             # AsyncEngine, async_sessionmaker, graceful SQLite fallback
│   ├── rds_models.py          # Relational models: User, Resume, JobDescription, Application
│   └── cosmos_client.py       # Azure Cosmos DB async manager with local resilient store
├── models/
│   ├── __init__.py
│   ├── user.py                # UserCreate, UserLogin, UserResponse, Token schemas
│   ├── resume.py              # ParsedProfileSchema, ResumeUploadResponse
│   ├── job.py                 # JobDescriptionCreate, JobDescriptionResponse
│   ├── application.py         # ApplicationStatusUpdate, ApplicationResponse
│   └── ai.py                  # MatchRequest, MatchResultSchema, AIInteractionDocument
├── services/
│   ├── __init__.py
│   ├── gemini_service.py      # Google Gemini structured outputs & ATS matching
│   ├── firebase_service.py    # Firebase Admin SDK event dispatcher
│   ├── cosmos_service.py      # Azure Cosmos DB document store operations
│   └── text_extractor.py      # PDF & TXT text extraction with byte-level validation
└── api/
    ├── __init__.py
    ├── deps.py                # FastAPI dependencies (get_db, get_current_user, etc.)
    └── v1/
        ├── __init__.py
        ├── api.py             # Router aggregation & cloud health checks
        └── endpoints/
            ├── __init__.py
            ├── auth.py        # POST /auth/register, POST /auth/login, GET /auth/me
            ├── resumes.py     # POST /resumes/upload, GET /resumes
            ├── ai.py          # POST /ai/match, GET /ai/history
            └── applications.py# PATCH /applications/{id}/status, POST /applications
```

---

## 🚀 API Endpoints Specification

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new user in RDS, hash password with bcrypt, return Bearer JWT |
| `POST` | `/auth/login` | Public | Authenticate user credentials, return Bearer JWT |
| `GET`  | `/auth/me` | Bearer | Get current authenticated user profile |
| `POST` | `/resumes/upload` | Bearer | Upload PDF/TXT, parse entities with Gemini, store in RDS |
| `GET`  | `/resumes` | Bearer | List resumes owned by current candidate |
| `POST` | `/ai/match` | Bearer | Run ATS match with Gemini, return score/missing skills/questions, store run in Cosmos DB |
| `GET`  | `/ai/history` | Bearer | Fetch past AI analysis runs from Azure Cosmos DB for current candidate |
| `PATCH`| `/applications/{id}/status` | Bearer | Update status in RDS and broadcast real-time event via Firebase Admin |
| `POST` | `/applications` | Bearer | Create application record linked to a job |
| `GET`  | `/health` | Public | System uptime & service diagnostics |
| `GET`  | `/api/v1/cloud/status` | Public | Multi-cloud integration connectivity status |

---

## ⚙️ Environment Variables (`.env`)

```ini
# Application Core
ENVIRONMENT="development"
DEBUG=True
APP_SECRET_KEY="your-32-character-secret-key-goes-here"
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AWS RDS PostgreSQL
AWS_RDS_POSTGRES_URL="postgresql+asyncpg://postgres:pass@your-rds-host.rds.amazonaws.com:5432/career_intelligence_db"
POSTGRES_POOL_SIZE=10
POSTGRES_MAX_OVERFLOW=20

# Azure Cosmos DB (SQL/Core API)
AZURE_COSMOS_ENDPOINT="https://your-cosmos-account.documents.azure.com:443/"
AZURE_COSMOS_KEY="your-cosmos-master-key=="
AZURE_COSMOS_DATABASE_NAME="CareerIntelligence"
AZURE_COSMOS_CONTAINER_NAME="AIInteractions"

# Google Firebase Admin SDK
FIREBASE_CREDENTIALS_PATH="/path/to/firebase-service-account.json"
FIREBASE_DATABASE_URL="https://your-app-default-rtdb.firebaseio.com"

# Google Gemini API
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-2.5-flash"
```

> **Zero-Config Resilient Fallbacks**: If any cloud credential is unset during local development, the backend automatically engages asynchronous local fallbacks (in-memory SQLite for RDS, in-memory partitioned store for Cosmos DB, simulated event stream for Firebase, and heuristic parsers for Gemini) without throwing startup crashes!
