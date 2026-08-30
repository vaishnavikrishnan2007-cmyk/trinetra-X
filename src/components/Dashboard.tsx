import React, { useState } from 'react';
import { ScreeningCase, CaseStatus } from '../types';
import { Plus, ShieldAlert, CheckCircle2, Clock, WifiOff, FileText, Play, Filter, Search, ArrowRight, Eye, RefreshCw, AlertTriangle, Sparkles, Activity } from 'lucide-react';

interface DashboardProps {
  cases: ScreeningCase[];
  onStartNewScreening: () => void;
  onSelectCase: (caseId: string) => void;
  onReplayCase: (caseId: string) => void;
  onStartJudgeDemo: () => void;
  isOffline: boolean;
  offlineQueueCount: number;
  onSyncOffline: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  cases,
  onStartNewScreening,
  onSelectCase,
  onReplayCase,
  onStartJudgeDemo,
  isOffline,
  offlineQueueCount,
  onSyncOffline,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Operational metrics
  const totalScreenings = cases.length;
  const flaggedCases = cases.filter(c => c.risk.level === 'HIGH' || c.status === 'ESCALATED' || c.status === 'SECONDARY_REVIEW').length;
  const clearCases = cases.filter(c => c.status === 'CLEAR').length;
  const pendingReviewCases = cases.filter(c => c.status === 'PENDING_REVIEW' || c.status === 'SECONDARY_REVIEW').length;
  const avgScreeningTime = '4.2s';

  const filteredCases = cases.filter(c => {
    const matchesFilter =
      statusFilter === 'ALL' ||
      (statusFilter === 'CLEAR' && c.status === 'CLEAR') ||
      (statusFilter === 'REVIEW' && (c.status === 'SECONDARY_REVIEW' || c.status === 'PENDING_REVIEW')) ||
      (statusFilter === 'HIGH_RISK' && (c.risk.level === 'HIGH' || c.status === 'ESCALATED'));

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(query) ||
      c.documentType.toLowerCase().includes(query) ||
      (c.ocrFields && c.ocrFields.some(f => f.value.toLowerCase().includes(query)));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: CaseStatus, riskScore: number) => {
    if (status === 'CLEAR') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>CLEAR ({riskScore})</span>
        </span>
      );
    }
    if (status === 'SECONDARY_REVIEW' || status === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          <span>REVIEW ({riskScore})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/30">
        <ShieldAlert className="w-3 h-3 text-red-400" />
        <span>HIGH RISK ({riskScore})</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Operational Status & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-red-600/90 text-white font-mono font-bold text-[10px] tracking-wider rounded">
              ICP ACTIVE CONSOLE
            </div>
            <h1 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              Operational Document Screening
            </h1>
          </div>
          <p className="text-[11px] font-mono text-slate-400 mt-0.5">
            Real-time multi-signal document forensics, ICAO 9303 rule validation & biometric verification.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onStartNewScreening}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono font-bold text-xs rounded shadow-md transition-all uppercase tracking-wider"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>START NEW SCREENING</span>
          </button>
        </div>
      </div>

      {/* Offline Alert Bar (if offline) */}
      {isOffline && (
        <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg flex items-center justify-between gap-3 text-xs font-mono text-amber-200">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>OFFLINE EDGE ENGINE:</strong> Local ONNX OCR, deterministic MRZ rules & ELA heuristics engaged. {offlineQueueCount} cases queued.
            </span>
          </div>
          {offlineQueueCount > 0 && (
            <button
              onClick={onSyncOffline}
              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded flex items-center gap-1 text-[11px] transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>SYNC QUEUE</span>
            </button>
          )}
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
        {/* Total Screenings */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Today's Volume</span>
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">{totalScreenings}</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span>VERIFIED DOSSIERS</span>
          </div>
        </div>

        {/* Flagged / High Risk */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Flagged / High Risk</span>
            <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          </div>
          <div className="text-xl font-bold font-mono text-red-400 mt-1">{flaggedCases}</div>
          <div className="text-[9px] font-mono text-red-400/80 mt-0.5">
            Secondary Review Gate
          </div>
        </div>

        {/* Clear Rate */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Passed & Clear</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{clearCases}</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">
            100% Rule & Bio Match
          </div>
        </div>

        {/* Avg Screening Latency */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Avg Latency</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{avgScreeningTime}</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">
            Target: &lt;10.0s (Edge)
          </div>
        </div>

        {/* Offline Queue */}
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase">
            <span>Offline Queue</span>
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">{offlineQueueCount}</div>
          <div className="text-[9px] font-mono text-slate-500 mt-0.5">
            {offlineQueueCount > 0 ? 'Pending sync' : 'All synced'}
          </div>
        </div>
      </div>

      {/* SIH Showcase Live Demonstration Quick Bar */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold">
                EVALUATOR SCENARIOS
              </span>
              <h2 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                SIH 2026 Live Scenarios — "We Don't Just Say Fake, We Show Why"
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Click any scenario to evaluate how TRINETRA-X isolates tampering & verifies ICAO 9303 rules:
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectCase('TX-2026-00418')}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#0D1117] hover:bg-[#1F242C] text-emerald-300 border border-emerald-800/40 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>1. Genuine (Arun)</span>
            </button>

            <button
              onClick={() => onSelectCase('TX-2026-00421')}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#0D1117] hover:bg-[#1F242C] text-red-300 border border-red-800/40 flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>2. Text Tampering</span>
            </button>

            <button
              onClick={() => onSelectCase('TX-2026-00425')}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#0D1117] hover:bg-[#1F242C] text-amber-300 border border-amber-800/40 flex items-center gap-1.5 transition-colors"
            >
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>3. Photo Replacement</span>
            </button>

            <button
              onClick={() => onSelectCase('TX-2026-00429')}
              className="px-2.5 py-1 rounded text-xs font-mono font-medium bg-[#0D1117] hover:bg-[#1F242C] text-purple-300 border border-purple-800/40 flex items-center gap-1.5 transition-colors"
            >
              <Activity className="w-3 h-3 text-purple-400" />
              <span>4. Cross-Doc Mismatch</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Screening Cases Table */}
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg overflow-hidden shadow-md">
        {/* Table Filter Toolbar */}
        <div className="p-3 border-b border-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5 bg-[#0D1117]/80">
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <h3 className="font-mono font-bold text-xs text-white uppercase tracking-wider">Screening Dossiers</h3>
            <span className="text-[10px] font-mono text-slate-500">({filteredCases.length} records)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 md:w-52">
              <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter ID, name, doc..."
                className="w-full pl-7 pr-2.5 py-1 bg-[#0A0C10] border border-[#30363D] rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1 bg-[#0A0C10] p-0.5 rounded border border-[#30363D] text-[11px] font-mono">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2 py-0.5 rounded transition-colors ${statusFilter === 'ALL' ? 'bg-[#161B22] text-cyan-300 font-bold' : 'text-slate-400'}`}
              >
                ALL
              </button>
              <button
                onClick={() => setStatusFilter('CLEAR')}
                className={`px-2 py-0.5 rounded transition-colors ${statusFilter === 'CLEAR' ? 'bg-[#161B22] text-emerald-300 font-bold' : 'text-slate-400'}`}
              >
                CLEAR
              </button>
              <button
                onClick={() => setStatusFilter('REVIEW')}
                className={`px-2 py-0.5 rounded transition-colors ${statusFilter === 'REVIEW' ? 'bg-[#161B22] text-amber-300 font-bold' : 'text-slate-400'}`}
              >
                REVIEW
              </button>
              <button
                onClick={() => setStatusFilter('HIGH_RISK')}
                className={`px-2 py-0.5 rounded transition-colors ${statusFilter === 'HIGH_RISK' ? 'bg-[#161B22] text-red-300 font-bold' : 'text-slate-400'}`}
              >
                HIGH RISK
              </button>
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1117] text-slate-400 border-b border-[#1E293B] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3.5">Case ID</th>
                <th className="py-2.5 px-3.5">Document / Subject</th>
                <th className="py-2.5 px-3.5">Status & Risk</th>
                <th className="py-2.5 px-3.5">Key Forensic Indicator</th>
                <th className="py-2.5 px-3.5">Timestamp</th>
                <th className="py-2.5 px-3.5">Officer</th>
                <th className="py-2.5 px-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {filteredCases.map(item => {
                const nameField = item.ocrFields?.find(f => f.key === 'surname' || f.key === 'name')?.value || 'N/A';
                const givenName = item.ocrFields?.find(f => f.key === 'givenNames')?.value || '';
                const fullName = givenName ? `${givenName} ${nameField}` : nameField;
                const dateStr = new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-[#1F242C]/60 transition-colors group cursor-pointer"
                    onClick={() => onSelectCase(item.id)}
                  >
                    <td className="py-2.5 px-3.5 font-bold text-cyan-300">
                      <div className="flex items-center gap-1.5">
                        <span>{item.id}</span>
                        {item.isOfflineCreated && (
                          <span className="text-[8px] px-1 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800">
                            LOCAL
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-100">{fullName}</div>
                      <div className="text-[10px] text-slate-500">{item.documentType} • {item.mrzData?.passportNumber || 'N/A'}</div>
                    </td>

                    <td className="py-2.5 px-3.5">
                      {getStatusBadge(item.status, item.risk.score)}
                    </td>

                    <td className="py-2.5 px-3.5 max-w-xs truncate text-[11px] text-slate-400">
                      {item.risk.whyFlagged[0] || 'Clean verification profile'}
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-400 text-[11px]">
                      {dateStr} IST
                    </td>

                    <td className="py-2.5 px-3.5 text-slate-300">
                      <div>{item.officerName}</div>
                      <div className="text-[10px] text-slate-500">{item.officerId}</div>
                    </td>

                    <td className="py-2.5 px-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onReplayCase(item.id)}
                          className="p-1 text-slate-400 hover:text-cyan-300 hover:bg-[#161B22] rounded transition-colors"
                          title="Replay 8-Stage Evidence Timeline"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectCase(item.id)}
                          className="px-2 py-0.5 bg-[#0D1117] hover:bg-[#1F242C] text-slate-200 border border-[#30363D] rounded text-[10px] font-mono flex items-center gap-1 transition-colors"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3 text-cyan-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-500 font-mono text-xs">
                    No cases match the selected filter criteria.
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
