import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  Sparkles,
  ArrowRight,
  Database,
  Cloud,
  Flame,
  CheckCircle2,
  Copy,
  Check,
  LogOut,
  X,
} from 'lucide-react';
import { AuthState } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  auth: AuthState;
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (email: string, pass: string, name: string) => Promise<void>;
  onLogout: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  auth,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('alex.morgan@cloudintel.io');
  const [password, setPassword] = useState('CloudPioneers2026!');
  const [fullName, setFullName] = useState('Alex Morgan');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      if (isRegisterMode) {
        await onRegister(email, password, fullName);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToken = () => {
    if (auth.token) {
      navigator.clipboard.writeText(auth.token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#14080E]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-[#EFE8E5] rounded-[2.5rem] max-w-4xl w-full shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close authentication modal"
          className="absolute top-5 right-5 z-10 w-9 h-9 rounded-full bg-[#FFFBF9] hover:bg-[#F2ECE8] text-[#6B6066] hover:text-[#14080E] flex items-center justify-center transition border border-[#EFE8E5]"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Left Side: Modern Branded Split-Screen Hero with Nixtio Gradient */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#470D92] via-[#5A1844] to-[#B62C22] p-8 sm:p-10 text-white flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#EFE8E5] relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">AI Career Intelligence</h2>
              <p className="text-xs text-white/80 mt-1 font-mono uppercase tracking-wider">
                FastAPI + Multi-Cloud Architecture
              </p>
            </div>

            <p className="text-xs text-white/90 leading-relaxed">
              Enterprise security layer powered by salted bcrypt password hashing and Bearer JWTs verified via Axios request interceptors.
            </p>

            {/* Cloud Badges */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center gap-2.5 text-xs text-white/95 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2 rounded-2xl">
                <Cloud className="w-4 h-4 text-amber-300 shrink-0" />
                <span>AWS RDS PostgreSQL (Auth & ACID)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/95 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2 rounded-2xl">
                <Database className="w-4 h-4 text-blue-200 shrink-0" />
                <span>Azure Cosmos DB (/user_id)</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-white/95 bg-white/10 backdrop-blur-xs border border-white/20 px-3.5 py-2 rounded-2xl">
                <Flame className="w-4 h-4 text-orange-300 shrink-0" />
                <span>Google Firebase Real-Time Sync</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/20 text-[11px] text-white/80 font-mono">
            Token Storage: Safe Memory + Encrypted Storage
          </div>
        </div>

        {/* Right Side: Form or Active Session Inspector */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-[#FFFBF9]">
          {auth.user ? (
            <div className="space-y-6">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF8F1] text-[#0E7A4A] border border-[#D0F1E1] text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Authenticated Session Active
                </span>
                <h3 className="text-2xl font-black text-[#14080E] mt-2">Active Bearer JWT Token</h3>
                <p className="text-xs text-[#6B6066]">
                  Axios interceptor automatically attaches this token to all HTTP outgoing requests.
                </p>
              </div>

              {/* User details card */}
              <div className="bg-white border border-[#EFE8E5] rounded-3xl p-5 space-y-2.5 text-xs font-mono shadow-xs">
                <div className="flex justify-between text-[#6B6066]">
                  <span>Candidate:</span>
                  <span className="text-[#14080E] font-bold">{auth.user.fullName}</span>
                </div>
                <div className="flex justify-between text-[#6B6066]">
                  <span>Email:</span>
                  <span className="text-[#14080E]">{auth.user.email}</span>
                </div>
                <div className="flex justify-between text-[#6B6066]">
                  <span>Partition Key (user_id):</span>
                  <span className="text-[#5A1844] font-bold truncate max-w-[200px]">{auth.user.id}</span>
                </div>
              </div>

              {/* JWT string inspector */}
              <div>
                <div className="flex items-center justify-between text-xs text-[#6B6066] mb-1.5 font-mono">
                  <span>Bearer Token Value</span>
                  <button
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 text-xs text-[#B62C22] hover:text-[#5A1844] font-bold"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#0E7A4A]" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-3.5 bg-white border border-[#EFE8E5] rounded-2xl font-mono text-[11px] text-[#5A1844] break-all max-h-24 overflow-y-auto select-all">
                  {auth.token}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[#EFE8E5]">
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#FFF0ED] hover:bg-[#FCDDD5] text-[#B62C22] text-xs font-bold transition"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
                <button
                  onClick={onClose}
                  className="nixtio-gradient-btn px-6 py-2.5 rounded-full text-xs font-bold transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Tab Selector: Sign In vs Sign Up */}
              <div className="flex bg-[#F5EFEB] p-1 rounded-full border border-[#EFE8E5] text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(false)}
                  className={`flex-1 py-2 rounded-full transition ${
                    !isRegisterMode ? 'bg-white text-[#14080E] shadow-xs' : 'text-[#6B6066] hover:text-[#14080E]'
                  }`}
                >
                  Sign In (POST /auth/login)
                </button>
                <button
                  type="button"
                  onClick={() => setIsRegisterMode(true)}
                  className={`flex-1 py-2 rounded-full transition ${
                    isRegisterMode ? 'bg-white text-[#14080E] shadow-xs' : 'text-[#6B6066] hover:text-[#14080E]'
                  }`}
                >
                  Register (POST /auth/register)
                </button>
              </div>

              {errorMessage && (
                <div className="p-3.5 bg-[#FFF0ED] border border-[#FCDDD5] rounded-2xl text-[#B62C22] text-xs">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label className="block text-xs font-bold text-[#14080E] mb-1.5">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#6B6066] absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Alex Morgan"
                        className="w-full bg-white border border-[#EFE8E5] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#14080E] mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#6B6066] absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex.morgan@cloudintel.io"
                      className="w-full bg-white border border-[#EFE8E5] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#14080E] mb-1.5">
                    Password (Passlib bcrypt verification)
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#6B6066] absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-[#EFE8E5] rounded-2xl pl-10 pr-4 py-3 text-xs text-[#14080E] focus:outline-none focus:border-[#5A1844]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="nixtio-gradient-btn w-full py-3.5 rounded-full font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isLoading ? (
                    'Authenticating with Backend...'
                  ) : (
                    <>
                      <span>{isRegisterMode ? 'Create Account & Issue JWT' : 'Sign In with Bearer Token'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
