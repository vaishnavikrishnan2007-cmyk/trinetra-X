import React, { useEffect } from 'react';
import { Shield, ArrowRight, Lock, Eye, CheckCircle2, Award } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(6,182,212,0.1),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b10_1px,transparent_1px),linear-gradient(to_bottom,#1e293b10_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 max-w-sm w-full flex flex-col items-center text-center">
        {/* Shield Icon Badge */}
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-600 via-blue-700 to-indigo-950 flex items-center justify-center shadow-xl shadow-cyan-500/10 border border-cyan-400/40">
            <Shield className="w-8 h-8 text-cyan-200" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-mono font-bold text-[9px] shadow">
            SIH 2026
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-300">
          TRINETRA-X
        </h1>
        <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wide mt-0.5">
          Evidence-First Border Document Screening Console
        </p>

        {/* Tagline */}
        <div className="mt-3 px-3 py-1 rounded-full bg-[#161B22] border border-[#1E293B] text-slate-300 text-xs font-mono">
          "Screen faster. Investigate smarter."
        </div>

        {/* Core Principles */}
        <div className="grid grid-cols-2 gap-1.5 mt-5 w-full text-[10px] font-mono text-slate-400">
          <div className="p-2 rounded bg-[#161B22] border border-[#1E293B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>AI + Rules + Evidence</span>
          </div>
          <div className="p-2 rounded bg-[#161B22] border border-[#1E293B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Human-in-the-Loop</span>
          </div>
          <div className="p-2 rounded bg-[#161B22] border border-[#1E293B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>ICAO Doc 9303 MRZ</span>
          </div>
          <div className="p-2 rounded bg-[#161B22] border border-[#1E293B] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Offline Edge Resilient</span>
          </div>
        </div>

        {/* Loading / Progress indicator */}
        <div className="w-full mt-6 flex flex-col items-center">
          <div className="w-40 h-1 bg-[#161B22] rounded-full overflow-hidden border border-[#1E293B]">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-[pulse_1.5s_ease-in-out_infinite]" style={{ width: '85%' }}></div>
          </div>
          <span className="text-[9px] font-mono text-slate-500 mt-1.5">
            INITIALIZING FORENSIC INTEGRITY & MRZ PARSERS...
          </span>
        </div>

        {/* Skip button */}
        <button
          onClick={onComplete}
          className="mt-4 flex items-center gap-1 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
        >
          <span>Proceed to Officer Login</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      {/* Footer Disclaimer */}
      <div className="absolute bottom-3 text-center text-[9px] font-mono text-slate-600">
        Smart India Hackathon 2026 • Ministry of Home Affairs • Sashastra Seema Bal (SSB)
      </div>
    </div>
  );
};
