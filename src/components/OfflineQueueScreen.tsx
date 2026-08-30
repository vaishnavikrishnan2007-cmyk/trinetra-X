import React, { useState } from 'react';
import { ScreeningCase } from '../types';
import { WifiOff, Wifi, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, Database, ArrowRight, Server, FileText } from 'lucide-react';

interface OfflineQueueScreenProps {
  queue: ScreeningCase[];
  isOffline: boolean;
  onToggleOffline: () => void;
  onSync: () => { syncedCount: number; syncedCases: ScreeningCase[] };
  onSelectCase: (caseId: string) => void;
}

export const OfflineQueueScreen: React.FC<OfflineQueueScreenProps> = ({
  queue,
  isOffline,
  onToggleOffline,
  onSync,
  onSelectCase,
}) => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const handleSyncAll = () => {
    setIsSyncing(true);
    setTimeout(() => {
      const res = onSync();
      setIsSyncing(false);
      setSyncSuccessMsg(`Successfully synchronized ${res.syncedCount} offline cases to Central SSB Node with SHA-256 validation.`);
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-mono text-white">
              Edge Offline Queue & Node Synchronization
            </h1>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-800 rounded font-semibold">
              LOCAL STORAGE REPOSITORY
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Offline-first architecture ensures 100% border screening continuity even when remote ICP satellite links are severed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Network Simulator Toggle */}
          <button
            onClick={onToggleOffline}
            className={`px-2.5 py-1.5 rounded font-mono text-xs font-bold flex items-center gap-1.5 transition-all ${
              isOffline
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5 text-amber-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isOffline ? 'OFFLINE SIMULATED' : 'ONLINE (SSB NODE)'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Banner */}
      {syncSuccessMsg && (
        <div className="p-3 bg-emerald-950/60 border border-emerald-700 rounded-lg flex items-center gap-2 text-emerald-200 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* System Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Local Edge Status */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-[10px] uppercase">Local Checkpoint Node</span>
            <Database className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">
            ICP Raxaul Edge Unit 04
          </div>
          <div className="text-[9px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Local Storage Active • IndexedDB / Key-Value Cache</span>
          </div>
        </div>

        {/* Queued Records */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-[10px] uppercase">Queued Offline Records</span>
            <FileText className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {queue.length} Cases
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-1">
            Pending central reconciliation
          </div>
        </div>

        {/* Sync Action */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span className="text-[10px] uppercase">Central Node Reconciliation</span>
            <Server className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <button
            onClick={handleSyncAll}
            disabled={isSyncing || queue.length === 0}
            className="w-full mt-1.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-40 text-slate-950 font-mono font-bold text-xs rounded flex items-center justify-center gap-1.5 shadow transition-all uppercase tracking-wider"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'SYNCHRONIZING...' : 'SYNC ALL WITH CENTRAL NODE'}</span>
          </button>
        </div>
      </div>

      {/* Queued Records List */}
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg overflow-hidden shadow-md">
        <div className="p-3 border-b border-[#1E293B] flex items-center justify-between bg-[#0D1117]">
          <div className="font-mono font-bold text-xs text-white flex items-center gap-1.5 uppercase">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>Locally Cached Screening Dossiers</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">{queue.length} cases waiting</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1117] text-slate-400 border-b border-[#1E293B] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Document Type</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3">Officer Action</th>
                <th className="py-2.5 px-3">SHA-256 Digest</th>
                <th className="py-2.5 px-3">Created Time</th>
                <th className="py-2.5 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {queue.map(item => (
                <tr key={item.id} className="hover:bg-[#0D1117]/60 transition-colors">
                  <td className="py-2 px-3 font-bold text-amber-300">{item.id}</td>
                  <td className="py-2 px-3">{item.documentType}</td>
                  <td className="py-2 px-3">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      item.risk.score > 50 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.risk.score}/100
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className="font-bold text-slate-200 text-xs">
                      {item.officerDecision || 'PENDING'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[9px] text-slate-500 font-mono">
                    {item.documentSha256?.substring(0, 24)}...
                  </td>
                  <td className="py-2 px-3 text-slate-400 text-[10px]">
                    {new Date(item.createdAt).toLocaleTimeString('en-IN')} IST
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button
                      onClick={() => onSelectCase(item.id)}
                      className="px-2 py-0.5 bg-[#0D1117] hover:bg-[#1F242C] text-slate-200 rounded text-[10px] font-mono border border-[#30363D]"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}

              {queue.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs">Offline queue is currently empty. All edge records are in sync.</span>
                      <span className="text-[10px] text-slate-600">
                        To test offline screening, toggle "OFFLINE SIMULATED" at top right and perform a scan.
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
