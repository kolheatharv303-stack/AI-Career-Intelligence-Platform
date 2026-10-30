import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  User,
  Mail,
  Lock,
  Copy,
  Check,
  CheckCircle2,
  LogOut,
} from 'lucide-react';
import { AuthState } from '../types';

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
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isRegisterMode) {
        await onRegister(email, password, fullName);
      } else {
        await onLogin(email, password);
      }
      onClose();
    } finally {
      setLoading(false);
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
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">JWT Authentication Manager</h3>
              <p className="text-xs text-slate-400 font-mono">PyJWT + Passlib (bcrypt)</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm">
            ✕
          </button>
        </div>

        {auth.user ? (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Bearer Token Active
                </span>
                <span className="text-[10px] font-mono text-slate-500">Algorithm: HS256</span>
              </div>

              <div className="text-xs space-y-1 text-slate-300 font-mono">
                <div>User ID: <span className="text-white">{auth.user.id}</span></div>
                <div>Name: <span className="text-white">{auth.user.fullName}</span></div>
                <div>Email: <span className="text-white">{auth.user.email}</span></div>
              </div>

              <div className="pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Bearer JWT Token String</span>
                  <button
                    onClick={handleCopyToken}
                    className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="p-2 bg-slate-900 rounded font-mono text-[10px] text-indigo-300 break-all select-all max-h-24 overflow-y-auto">
                  {auth.token}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/50 text-rose-300 text-xs font-medium transition"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign Out
              </button>

              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
              >
                Close Manager
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-medium">
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  !isRegisterMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In (POST /auth/login)
              </button>
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className={`flex-1 py-1.5 rounded-lg transition ${
                  isRegisterMode ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Register (POST /auth/register)
              </button>
            </div>

            {isRegisterMode && (
              <div>
                <label className="block text-xs text-slate-300 mb-1">Full Name:</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1">Email Address:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1">Password (Passlib bcrypt):</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : isRegisterMode ? 'Register in RDS & Issue JWT' : 'Verify Password & Issue JWT'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
