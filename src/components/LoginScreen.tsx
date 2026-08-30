import React, { useState } from 'react';
import { Officer } from '../types';
import { Shield, Lock, User, Key, CheckCircle2, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';

interface LoginScreenProps {
  onLogin: (officer: Officer) => void;
  onStartJudgeDemo: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onStartJudgeDemo }) => {
  const [officerId, setOfficerId] = useState<string>('SSB-OFF-9042');
  const [password, setPassword] = useState<string>('••••••••••••');
  const [mfaCode, setMfaCode] = useState<string>('849201');
  const [showMfa, setShowMfa] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOfficerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officerId) {
      setError('Please enter Officer ID');
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: officerId,
        name: officerId.includes('1010') ? 'Supervisor A. Verma' : 'Inspector R. Sen',
        badgeNumber: officerId.includes('1010') ? 'SSB-SUP-1010' : 'SSB-II-4921',
        role: officerId.includes('1010') ? 'SUPERVISOR' : 'BORDER_OFFICER',
        station: 'ICP Raxaul (Indo-Nepal Border)',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      });
    }, 600);
  };

  const setDemoUser = (type: 'OFFICER' | 'SUPERVISOR') => {
    if (type === 'OFFICER') {
      setOfficerId('SSB-OFF-9042');
      setPassword('VerifiedPass2026#');
      setMfaCode('849201');
    } else {
      setOfficerId('SSB-SUP-1010');
      setPassword('SupervisorSecureKey!');
      setMfaCode('391024');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(14,165,233,0.08),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Quick Judge Demo Trigger Banner */}
      <div className="mb-4 w-full max-w-md bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span><strong>SIH 2026 Evaluator?</strong> Jump straight to live demo.</span>
        </div>
        <button
          onClick={onStartJudgeDemo}
          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-mono font-bold rounded shadow transition-all"
        >
          START DEMO
        </button>
      </div>

      <div className="w-full max-w-md bg-[#161B22] border border-[#1E293B] rounded-lg p-5 sm:p-6 shadow-xl relative z-10">
        {/* Header Branding */}
        <div className="flex items-center justify-between border-b border-[#1E293B] pb-3.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-900 flex items-center justify-center border border-cyan-400/40 shadow-sm">
              <Shield className="w-4 h-4 text-cyan-200" />
            </div>
            <div>
              <div className="text-base font-mono font-extrabold text-white tracking-wider">
                TRINETRA-X
              </div>
              <div className="text-[9px] font-mono text-cyan-400 font-medium">
                SECURE OFFICER TERMINAL
              </div>
            </div>
          </div>
          <span className="px-1.5 py-0.5 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 font-mono text-[9px] rounded flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            AES-256 SESSION
          </span>
        </div>

        {error && (
          <div className="mb-3 p-2 bg-red-950/60 border border-red-800 text-red-300 text-xs font-mono rounded flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleOfficerLogin} className="space-y-3 font-mono text-xs">
          <div>
            <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1.5 text-[11px]">
              <User className="w-3 h-3 text-cyan-400" />
              <span>Officer ID / Service Number</span>
            </label>
            <input
              type="text"
              value={officerId}
              onChange={(e) => setOfficerId(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono"
              placeholder="e.g. SSB-OFF-9042"
              required
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-medium flex items-center gap-1.5 text-[11px]">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>Security Credential</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono"
              placeholder="••••••••••••"
              required
            />
          </div>

          {showMfa && (
            <div>
              <div className="flex items-center justify-between mb-1 text-[11px]">
                <label className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Key className="w-3 h-3 text-cyan-400" />
                  <span>Hardware MFA / TOTP Token</span>
                </label>
                <span className="text-[9px] text-emerald-400">SYNCED (0:24)</span>
              </div>
              <input
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full px-3 py-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500 text-xs font-mono tracking-widest"
                placeholder="6-digit token"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 mt-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded transition-all shadow-md flex items-center justify-center gap-1.5 text-xs"
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                VERIFYING CREDENTIALS...
              </span>
            ) : (
              <>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>AUTHENTICATE & ENTER CONSOLE</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Fillers */}
        <div className="mt-4 pt-3.5 border-t border-[#1E293B]">
          <div className="text-[10px] font-mono text-slate-400 mb-1.5 font-medium">
            Demo Credentials (1-Click Fill):
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoUser('OFFICER')}
              className="p-1.5 rounded bg-[#0A0C10] hover:bg-[#1F242C] border border-[#1E293B] text-left transition-colors"
            >
              <div className="text-[10px] font-mono text-cyan-400 font-bold">Inspector R. Sen</div>
              <div className="text-[8px] font-mono text-slate-500">Border Verification Officer</div>
            </button>

            <button
              type="button"
              onClick={() => setDemoUser('SUPERVISOR')}
              className="p-1.5 rounded bg-[#0A0C10] hover:bg-[#1F242C] border border-[#1E293B] text-left transition-colors"
            >
              <div className="text-[10px] font-mono text-cyan-400 font-bold">Supervisor A. Verma</div>
              <div className="text-[8px] font-mono text-slate-500">ICP Supervisor / Escalations</div>
            </button>
          </div>
        </div>

        {/* System metadata */}
        <div className="mt-4 text-center text-[9px] font-mono text-slate-500 flex items-center justify-center gap-2">
          <span>STATION: ICP RAXAUL</span>
          <span>•</span>
          <span>AIR-GAPPED COMPATIBLE</span>
        </div>
      </div>
    </div>
  );
};
