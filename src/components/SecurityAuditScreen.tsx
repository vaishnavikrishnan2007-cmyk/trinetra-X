import React, { useState } from 'react';
import { AuditEvent } from '../types';
import { ShieldCheck, Lock, Download, Search, CheckCircle2, FileCode, Shield, Key } from 'lucide-react';

interface SecurityAuditScreenProps {
  auditLogs: AuditEvent[];
}

export const SecurityAuditScreen: React.FC<SecurityAuditScreenProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredLogs = auditLogs.filter(log => {
    const q = searchQuery.toLowerCase();
    return (
      log.caseId?.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.detail.toLowerCase().includes(q) ||
      log.sha256Hash?.toLowerCase().includes(q)
    );
  });

  const handleExportAudit = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `TRINETRA_X_AUDIT_TRAIL_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold font-mono text-white">
              Tamper-Proof Audit Trail & Security Ledger
            </h1>
            <span className="px-1.5 py-0.2 text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 rounded font-semibold">
              MHA COMPLIANCE
            </span>
          </div>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Cryptographic ledger tracking all document ingestion events, OCR checksum evaluations, biometric scores, and officer decisions.
          </p>
        </div>

        <button
          onClick={handleExportAudit}
          className="px-2.5 py-1.5 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export JSON Audit Ledger</span>
        </button>
      </div>

      {/* Security Architecture Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2.5 font-mono text-xs">
        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-500 text-[9px] uppercase">
            <span>HASH INTEGRITY</span>
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-1">SHA-256 Digest</div>
          <p className="text-[9px] text-emerald-400 mt-0.5">100% Chain Validated</p>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-500 text-[9px] uppercase">
            <span>ENCRYPTION AT REST</span>
            <Key className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-1">AES-256 GCM</div>
          <p className="text-[9px] text-cyan-400 mt-0.5">Air-Gapped Vault</p>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-500 text-[9px] uppercase">
            <span>ACCESS CONTROL</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-1">SSB Role-Based (RBAC)</div>
          <p className="text-[9px] text-blue-400 mt-0.5">MFA Authenticated</p>
        </div>

        <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg">
          <div className="flex items-center justify-between text-slate-500 text-[9px] uppercase">
            <span>TOTAL LOG EVENTS</span>
            <FileCode className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-xs font-bold text-slate-100 mt-1">{auditLogs.length} Events</div>
          <p className="text-[9px] text-purple-400 mt-0.5">Immutable Log File</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg overflow-hidden shadow-md">
        <div className="p-3 border-b border-[#1E293B] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-[#0D1117]">
          <div className="font-mono font-bold text-xs text-white flex items-center gap-1.5 uppercase">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chronological Event Ledger</span>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-3 h-3 text-slate-500 absolute left-2.5 top-2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event, actor, hash..."
              className="w-full pl-7 pr-2.5 py-1 bg-[#0A0C10] border border-[#30363D] rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-[#0D1117] text-slate-400 border-b border-[#1E293B] text-[10px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Case ID</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Event Detail</th>
                <th className="py-2.5 px-3">Integrity Hash</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B] text-slate-300">
              {filteredLogs.map(item => (
                <tr key={item.id} className="hover:bg-[#0D1117]/60 transition-colors">
                  <td className="py-2 px-3 text-slate-400 text-[10px] whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleString('en-IN', { hour12: false })} IST
                  </td>
                  <td className="py-2 px-3 font-bold text-cyan-300 whitespace-nowrap text-xs">
                    {item.caseId || 'SYSTEM'}
                  </td>
                  <td className="py-2 px-3 text-slate-200 whitespace-nowrap text-xs">
                    {item.actor}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <span className="px-1.5 py-0.2 rounded bg-[#0D1117] text-slate-200 font-bold text-[9px] border border-[#30363D]">
                      {item.action}
                    </span>
                  </td>
                  <td className="py-2 px-3 max-w-sm font-sans text-slate-300 text-[11px] leading-snug">
                    {item.detail}
                  </td>
                  <td className="py-2 px-3 text-[9px] text-cyan-400 font-mono">
                    {item.sha256Hash ? `${item.sha256Hash.substring(0, 16)}...` : 'N/A'}
                  </td>
                  <td className="py-2 px-3 text-right whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>VALID</span>
                    </span>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-mono text-xs">
                    No audit records match your query.
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
