import React, { useState } from 'react';
import {
  FileCode,
  Copy,
  Check,
  FolderTree,
  Terminal,
  Sparkles,
} from 'lucide-react';

interface CodeFile {
  name: string;
  path: string;
  category: 'core' | 'db' | 'models' | 'services' | 'api' | 'infra';
  description: string;
  language: string;
  code: string;
}

export const CodeExplorer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('backend/main.py');
  const [copied, setCopied] = useState(false);

  const files: CodeFile[] = [
    {
      name: 'main.py',
      path: 'backend/main.py',
      category: 'core',
      description: 'FastAPI application factory, lifespan startup sequence, CORS, and endpoint router mounting',
      language: 'python',
      code: `"""Production-grade FastAPI Backend for AI Career Intelligence Platform."""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.core.config import settings
from backend.db.session import init_db, close_db
from backend.db.cosmos_client import cosmos_manager
from backend.services.firebase_service import firebase_service
from backend.api.v1.api import api_router
from backend.api.v1.endpoints import auth, resumes, ai, applications

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize AWS RDS PostgreSQL relational engine
    await init_db()
    # 2. Initialize Azure Cosmos DB client & container
    await cosmos_manager.initialize()
    # 3. Initialize Google Firebase Admin SDK
    await firebase_service.initialize()
    yield
    # Shutdown sequence
    await close_db()
    await cosmos_manager.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router)
app.include_router(resumes.router)
app.include_router(ai.router)
app.include_router(applications.router)`,
    },
    {
      name: 'config.py',
      path: 'backend/core/config.py',
      category: 'core',
      description: 'Pydantic Settings v2 configuration for AWS RDS, Azure Cosmos DB, Firebase, and Gemini',
      language: 'python',
      code: `from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Career Intelligence Platform"
    APP_SECRET_KEY: str = "career-intel-jwt-secret-key"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440

    # 1. AWS RDS PostgreSQL
    AWS_RDS_POSTGRES_URL: str | None = None
    POSTGRES_POOL_SIZE: int = 10

    # 2. Azure Cosmos DB (SQL/Core API)
    AZURE_COSMOS_ENDPOINT: str | None = None
    AZURE_COSMOS_KEY: str | None = None
    AZURE_COSMOS_CONTAINER_NAME: str = "AIInteractions"
    AZURE_COSMOS_PARTITION_KEY: str = "/user_id"

    # 3. Google Firebase Admin SDK
    FIREBASE_CREDENTIALS_PATH: str | None = None

    # 4. Google Gemini API
    GEMINI_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()`,
    },
    {
      name: 'gemini_service.py',
      path: 'backend/services/gemini_service.py',
      category: 'services',
      description: 'Google Gemini SDK inference with strict response_mime_type="application/json"',
      language: 'python',
      code: `from google import genai
from google.genai import types
from backend.core.config import settings

class GeminiService:
    def __init__(self):
        self._client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self._model = settings.GEMINI_MODEL

    async def calculate_match(self, resume_text: str, parsed_profile: dict, job_description: str):
        prompt = f"Analyze resume against job. Return valid JSON match_score, missing_skills, questions."
        response = self._client.models.generate_content(
            model=self._model,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.1
            )
        )
        return json.loads(response.text.strip())`,
    },
  ];

  const currentFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Code Header */}
      <div className="bg-white/95 border border-[#EFE8E5] rounded-[2.5rem] p-7 sm:p-10 shadow-[0_20px_50px_rgba(71,13,146,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFF2EE] border border-[#FCDDD5] text-[#5A1844] text-xs font-semibold mb-3">
              <Terminal className="w-3.5 h-3.5 text-[#B62C22]" />
              <span>Python 3.11+ Backend Codebase</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#14080E] tracking-tight">
              Production-Grade Modular Source Architecture
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-[#6B6066]">
              FastAPI backend source files created in <code className="text-[#5A1844] font-mono">/backend/</code>.
            </p>
          </div>

          <div className="text-xs text-[#6B6066] font-mono bg-[#FFFBF9] px-4 py-2 rounded-full border border-[#EFE8E5]">
            Path: <span className="text-[#B62C22] font-bold">{currentFile.path}</span>
          </div>
        </div>
      </div>

      {/* Explorer Body */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 4 Cols: File Tree */}
        <div className="lg:col-span-4 bg-white/95 border border-[#EFE8E5] rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="text-xs font-bold text-[#14080E] uppercase tracking-wider px-2 flex items-center gap-2">
            <FolderTree className="w-3.5 h-3.5 text-[#B62C22]" />
            Project File Tree
          </div>

          <div className="space-y-1.5">
            {files.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-mono transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FFF2EE] text-[#B62C22] border border-[#FCDDD5] font-bold'
                      : 'text-[#6B6066] hover:text-[#14080E] hover:bg-[#FFFBF9]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <FileCode className={`w-3.5 h-3.5 ${isSelected ? 'text-[#B62C22]' : 'text-[#6B6066]'}`} />
                    <span className="truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FFFBF9] text-[#6B6066] uppercase border border-[#EFE8E5]">
                    {file.category}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Code Display */}
        <div className="lg:col-span-8 bg-[#14080E] border border-[#2B1723] rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h3 className="font-mono text-sm font-bold text-white">{currentFile.path}</h3>
              <p className="text-xs text-white/60 mt-0.5">{currentFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-mono transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Code
                </>
              )}
            </button>
          </div>

          <pre className="p-4 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto max-h-[500px]">
            {currentFile.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
