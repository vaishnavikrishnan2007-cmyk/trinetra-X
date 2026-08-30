import React from 'react';
import { Officer } from '../types';
import { Shield, Wifi, WifiOff, Play, Cpu, LogOut, UserCheck, Clock } from 'lucide-react';

interface HeaderProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
  officer: Officer;
  onLogout: () => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  offlineQueueCount: number;
  onStartJudgeDemo: () => void;
  onOpenArchitecture: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  officer,
  onLogout,
  isOffline,
  onToggleOffline,
  offlineQueueCount,
  onStartJudgeDemo,
  onOpenArchitecture,
}) => {
  const [time, setTime] = React.useState<string>(new Date().toLocaleTimeString('en-IN', { hour12: false }));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-IN', { hour12: false }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'new_screening', label: 'New Screening' },
    { id: 'cases', label: 'Cases & Dossiers' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'offline_queue', label: `Offline Queue ${offlineQueueCount > 0 ? `(${offlineQueueCount})` : ''}` },
    { id: 'security_audit', label: 'Security & Audit' },
    { id: 'profile_settings', label: 'Settings' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#11141D]/95 border-b border-[#1E293B] backdrop-blur-md">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between px-4 py-1 bg-[#0D1117] border-b border-[#1E293B] text-[10px] font-mono text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-red-500 font-bold">
            <Shield className="w-3.5 h-3.5" />
            <span>MHA // SASHASTRA SEEMA BAL (SSB)</span>
          </div>
          <span className="text-slate-700 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline">
            ICP: <strong className="text-white">{officer.station}</strong>
          </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-slate-400 hidden lg:inline">
            NODE: <strong className="text-cyan-400">SSB-BPC-429</strong>
          </span>
          <span className="text-slate-700 hidden lg:inline">|</span>
          <span className="text-slate-400 hidden xl:inline">
            ICAO 9303 FORENSIC ENGINE v2.6.4
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Offline Mode Toggle Button */}
          <button
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[10px] font-semibold transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 animate-pulse'
                : 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60 hover:bg-emerald-900/50'
            }`}
            title="Toggle simulated network disconnect to test offline local screening"
          >
            {isOffline ? <WifiOff className="w-3 h-3 text-amber-400" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span>{isOffline ? 'OFFLINE EDGE' : 'ONLINE (MHA NET)'}</span>
            {offlineQueueCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-amber-500 text-slate-950 font-bold rounded">
                {offlineQueueCount}
              </span>
            )}
          </button>

          {/* Clock */}
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{time} IST</span>
          </div>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="px-2 py-1 bg-red-600 rounded text-white font-mono font-black text-xs tracking-widest uppercase shadow-md shadow-red-950/50 flex items-center gap-1 group-hover:bg-red-500 transition-colors">
              <Shield className="w-3.5 h-3.5 fill-current" />
              <span>TRINETRA-X</span>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono font-bold text-slate-200 uppercase tracking-tight">
                  Border Forensics Console
                </span>
                <span className="px-1 py-0.2 text-[9px] font-mono font-bold bg-[#161B22] border border-[#30363D] text-cyan-400 rounded">
                  SIH 2026
                </span>
              </div>
            </div>
          </div>

          {/* Primary Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const isActive = currentScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-all ${
                    isActive
                      ? 'bg-[#161B22] text-cyan-300 border border-[#30363D] shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#161B22]/50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Architecture / SIH Tech Moat Button */}
          <button
            onClick={onOpenArchitecture}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D] transition-colors"
            title="View Technical Architecture & SIH Innovation Moat"
          >
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture</span>
          </button>

          {/* SIH Judge Demo Button */}
          <button
            onClick={onStartJudgeDemo}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-mono font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-md shadow-orange-950/40 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            title="Launch guided Smart India Hackathon evaluator demonstration"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>JUDGE DEMO</span>
          </button>

          {/* Officer Info & Logout */}
          <div className="hidden md:flex items-center gap-2.5 pl-2 border-l border-[#1E293B]">
            <div className="text-right">
              <div className="text-xs font-bold text-slate-200 leading-tight">{officer.name}</div>
              <div className="text-[10px] font-mono text-cyan-400">{officer.badgeNumber}</div>
            </div>
            <img
              src={officer.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
              alt={officer.name}
              className="w-7 h-7 rounded border border-[#30363D] object-cover"
            />
            <button
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-red-400 hover:bg-[#161B22] rounded transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="flex lg:hidden overflow-x-auto px-2 py-1 bg-[#0D1117] border-t border-[#1E293B] scrollbar-none">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`px-2.5 py-1 text-xs font-mono whitespace-nowrap rounded ${
              currentScreen === item.id ? 'bg-[#161B22] text-cyan-300 font-bold border border-[#30363D]' : 'text-slate-400'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
