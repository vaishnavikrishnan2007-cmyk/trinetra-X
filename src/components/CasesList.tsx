import React, { useState } from 'react';
import { ScreeningCase, CaseStatus } from '../types';
import { FileText, Search, Filter, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Download, Share2, Printer, Eye, Lock, Clock, User } from 'lucide-react';

interface CasesListProps {
  cases: ScreeningCase[];
  onSelectCase: (caseId: string) => void;
  onReplayCase: (caseId: string) => void;
}

export const CasesList: React.FC<CasesListProps> = ({ cases, onSelectCase, onReplayCase }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [docTypeFilter, setDocTypeFilter] = useState<string>('ALL');
  const [selectedCaseForDrawer, setSelectedCaseForDrawer] = useState<ScreeningCase | null>(null);

  const filteredCases = cases.filter(c => {
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'CLEAR' && c.status === 'CLEAR') ||
      (statusFilter === 'REVIEW' && (c.status === 'SECONDARY_REVIEW' || c.status === 'PENDING_REVIEW')) ||
      (statusFilter === 'HIGH_RISK' && (c.risk.level === 'HIGH' || c.status === 'ESCALATED'));

    const matchesDocType = docTypeFilter === 'ALL' || c.documentType === docTypeFilter;

    const query = searchQuery.toLowerCase();
    const matchesSearch =
      c.id.toLowerCase().includes(query) ||
      c.documentType.toLowerCase().includes(query) ||
      (c.ocrFields && c.ocrFields.some(f => f.value.toLowerCase().includes(query)));

    return matchesStatus && matchesDocType && matchesSearch;
  });

  const getStatusBadge = (status: CaseStatus, score: number) => {
    if (status === 'CLEAR') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
          <span>CLEAR ({score})</span>
        </span>
      );
    }
    if (status === 'SECONDARY_REVIEW' || status === 'PENDING_REVIEW') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
          <AlertTriangle className="w-2.5 h-2.5 text-amber-400" />
          <span>REVIEW ({score})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-mono font-semibold bg-red-500/10 text-red-300 border border-red-500/30">
        <ShieldAlert className="w-2.5 h-2.5 text-red-400" />
        <span>HIGH RISK ({score})</span>
      </span>
    );
  };

  const handlePrintDossier = (c: ScreeningCase) => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-bold font-mono text-white">
            Border Screening Dossiers & Case Repository
          </h1>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Immutable records of all passenger screening runs, forensic logs, and officer decision signatures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-[#0D1117] border border-[#1E293B] rounded text-xs font-mono text-cyan-400">
            Total Dossiers: <strong>{cases.length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg flex flex-col md:flex-row items-center justify-between gap-2.5">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Case ID, name, passport..."
            className="w-full pl-8 pr-2.5 py-1 bg-[#0A0C10] border border-[#30363D] rounded text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 bg-[#0A0C10] border border-[#30363D] rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="CLEAR">Clear</option>
            <option value="REVIEW">Review Required</option>
            <option value="HIGH_RISK">High Risk / Escalated</option>
          </select>

          {/* Doc Type Filter */}
          <select
            value={docTypeFilter}
            onChange={(e) => setDocTypeFilter(e.target.value)}
            className="px-2.5 py-1 bg-[#0A0C10] border border-[#30363D] rounded text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Document Types</option>
            <option value="PASSPORT">Passport</option>
            <option value="VISA">Visa</option>
            <option value="NATIONAL_ID">National ID</option>
            <option value="DRIVING_LICENSE">Driving License</option>
          </select>
        </div>
      </div>

      {/* Main Dossier Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {filteredCases.map(item => {
          const nameField = item.ocrFields?.find(f => f.key === 'surname' || f.key === 'name')?.value || 'N/A';
          const givenName = item.ocrFields?.find(f => f.key === 'givenNames')?.value || '';
          const fullName = givenName ? `${givenName} ${nameField}` : nameField;
          const passportNo = item.ocrFields?.find(f => f.key === 'passportNumber')?.value || item.mrzData?.passportNumber || 'N/A';

          return (
            <div
              key={item.id}
              onClick={() => setSelectedCaseForDrawer(item)}
              className="p-3 bg-[#161B22] border border-[#1E293B] hover:border-cyan-500/40 rounded-lg space-y-2.5 cursor-pointer shadow-md transition-all group"
            >
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-cyan-400 group-hover:text-cyan-300">
                    {item.id}
                  </span>
                  {item.scenarioTag && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                      {item.scenarioTag}
                    </span>
                  )}
                </div>
                {getStatusBadge(item.status, item.risk.score)}
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-10 h-12 bg-[#0A0C10] rounded border border-[#1E293B] overflow-hidden shrink-0">
                  <img
                    src={item.faceVerification?.documentFaceUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                    alt="Traveler"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-mono text-xs overflow-hidden">
                  <div className="font-bold text-white truncate text-xs">{fullName}</div>
                  <div className="text-[10px] text-slate-400">{item.documentType} • {passportNo}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5 truncate">
                    Station: {item.station}
                  </div>
                </div>
              </div>

              <div className="p-2 bg-[#0A0C10] rounded border border-[#1E293B] text-[10px] font-sans text-slate-300 leading-snug">
                <strong className="text-slate-400 font-mono text-[9px] block mb-0.5 uppercase">PRIMARY EVIDENCE TRIGGER:</strong>
                {item.risk.whyFlagged[0] || 'All verification parameters clean'}
              </div>

              <div className="pt-1.5 border-t border-[#1E293B] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 text-[9px]">
                  {new Date(item.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} IST
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReplayCase(item.id);
                    }}
                    className="p-1 bg-[#0D1117] hover:bg-[#1F242C] text-slate-300 rounded border border-[#30363D]"
                    title="Evidence Replay"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectCase(item.id);
                    }}
                    className="px-2 py-0.5 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 rounded font-bold text-[10px] flex items-center gap-1 border border-[#30363D]"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCases.length === 0 && (
        <div className="p-8 text-center bg-[#161B22] border border-[#1E293B] rounded-lg font-mono text-slate-400 text-xs">
          No screening dossiers match your search and filter criteria.
        </div>
      )}

      {/* Dossier Detail Drawer Modal */}
      {selectedCaseForDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#1E293B] rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold font-mono text-white">
                    Dossier: {selectedCaseForDrawer.id}
                  </h3>
                  {getStatusBadge(selectedCaseForDrawer.status, selectedCaseForDrawer.risk.score)}
                </div>
                <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                  Officer: {selectedCaseForDrawer.officerName} • Station: {selectedCaseForDrawer.station}
                </p>
              </div>
              <button
                onClick={() => setSelectedCaseForDrawer(null)}
                className="px-2 py-1 bg-[#0D1117] hover:bg-[#1F242C] text-slate-300 text-xs font-mono rounded border border-[#30363D]"
              >
                Close
              </button>
            </div>

            {/* Content Summary */}
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 bg-[#0A0C10] rounded-lg border border-[#1E293B] grid grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-500 text-[9px] uppercase">DOCUMENT TYPE</span>
                  <div className="text-slate-200 font-bold text-xs">{selectedCaseForDrawer.documentType}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase">RISK SCORE</span>
                  <div className="text-slate-200 font-bold text-xs">{selectedCaseForDrawer.risk.score}/100 ({selectedCaseForDrawer.risk.level})</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase">RECOMMENDED ACTION</span>
                  <div className="text-cyan-400 font-bold text-xs">{selectedCaseForDrawer.risk.recommendedAction}</div>
                </div>
                <div>
                  <span className="text-slate-500 text-[9px] uppercase">OFFICER DECISION</span>
                  <div className="text-emerald-400 font-bold text-xs">{selectedCaseForDrawer.officerDecision || 'PENDING'}</div>
                </div>
              </div>

              <div className="p-2.5 bg-[#0A0C10] rounded-lg border border-[#1E293B]">
                <span className="text-slate-500 text-[9px] uppercase block mb-1">EVIDENCE SUMMARY & FLAGS:</span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-300 font-sans text-xs">
                  {selectedCaseForDrawer.risk.whyFlagged.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 bg-[#0A0C10] rounded-lg border border-[#1E293B]">
                <span className="text-slate-500 text-[9px] uppercase block mb-0.5">DIGITAL INTEGRITY SHA-256 HASH:</span>
                <div className="text-cyan-400 text-[10px] break-all">{selectedCaseForDrawer.documentSha256}</div>
              </div>

              <div className="p-2.5 bg-[#0A0C10] rounded-lg border border-[#1E293B]">
                <span className="text-slate-500 text-[9px] uppercase block mb-0.5">OFFICER NOTES:</span>
                <p className="text-slate-300 font-sans text-xs">
                  {selectedCaseForDrawer.officerNotes || 'No notes entered.'}
                </p>
              </div>
            </div>

            {/* Drawer Actions */}
            <div className="pt-2.5 border-t border-[#1E293B] flex items-center justify-between gap-2">
              <button
                onClick={() => handlePrintDossier(selectedCaseForDrawer)}
                className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#1F242C] text-slate-200 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Dossier</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const id = selectedCaseForDrawer.id;
                    setSelectedCaseForDrawer(null);
                    onReplayCase(id);
                  }}
                  className="px-3 py-1.5 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Replay Timeline</span>
                </button>

                <button
                  onClick={() => {
                    const id = selectedCaseForDrawer.id;
                    setSelectedCaseForDrawer(null);
                    onSelectCase(id);
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1.5"
                >
                  <span>Full Investigation Console</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
