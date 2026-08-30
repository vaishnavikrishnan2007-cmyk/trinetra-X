import React from 'react';
import { Officer } from '../types';
import { Terminal, ShieldCheck, Cpu, HardDrive } from 'lucide-react';

interface TerminalFooterProps {
  officer: Officer;
  isOffline: boolean;
  offlineQueueCount: number;
}

export const TerminalFooter: React.FC<TerminalFooterProps> = ({
  officer,
  isOffline,
  offlineQueueCount,
}) => {
  return (
    <footer className="sticky bottom-0 z-40 h-8 bg-[#11141D] border-t border-[#1E293B] px-4 flex items-center justify-between text-[10px] font-mono text-slate-400 select-none">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>{isOffline ? 'LOCAL EDGE MODE' : 'LATENCY: 38ms'}</span>
        </div>
        <span className="text-slate-700 hidden sm:inline">|</span>
        <div className="hidden sm:flex items-center gap-1 text-slate-300">
          <Cpu className="w-3 h-3 text-cyan-400" />
          <span>MODEL: TRN_X_v2.6_ONNX</span>
        </div>
        <span className="text-slate-700 hidden md:inline">|</span>
        <div className="hidden md:flex items-center gap-1 text-slate-400">
          <ShieldCheck className="w-3 h-3 text-red-500" />
          <span>AES-256-GCM / SHA-256 AUDIT CHAIN</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {offlineQueueCount > 0 && (
          <div className="flex items-center gap-1 text-amber-400 font-semibold">
            <HardDrive className="w-3 h-3 text-amber-400" />
            <span>QUEUED FOR SYNC: {offlineQueueCount}</span>
            <span className="text-slate-700">|</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-slate-300">
          <Terminal className="w-3 h-3 text-cyan-400" />
          <span>TERM: <strong className="text-white">SSB-BPC-429</strong></span>
        </div>
        <span className="text-slate-700 hidden lg:inline">|</span>
        <span className="hidden lg:inline text-slate-400">
          ICP: <strong className="text-slate-200">{officer.station}</strong>
        </span>
      </div>
    </footer>
  );
};
