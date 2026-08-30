import React, { useState, useEffect } from 'react';
import { ScreeningCase, CaseStatus, TamperBox } from '../../types';
import { DocumentForensicsCanvas } from '../DocumentForensicsCanvas';
import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Eye,
  FileText,
  UserCheck,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Clock,
  Sparkles,
  HelpCircle,
  Download,
  Share2,
  Lock,
  Play,
  RotateCcw,
  Check,
  X
} from 'lucide-react';

interface ScreeningWorkflowProps {
  initialCase: ScreeningCase;
  onSaveCase: (updatedCase: ScreeningCase) => void;
  onBackToDashboard: () => void;
  onOpenReplay: (caseId: string) => void;
  isOffline: boolean;
}

export const ScreeningWorkflow: React.FC<ScreeningWorkflowProps> = ({
  initialCase,
  onSaveCase,
  onBackToDashboard,
  onOpenReplay,
  isOffline,
}) => {
  const [currentStage, setCurrentStage] = useState<number>(1);
  const [isAutoProgressing, setIsAutoProgressing] = useState<boolean>(true);
  const [activeCase, setActiveCase] = useState<ScreeningCase>(initialCase);
  const [selectedTamperBox, setSelectedTamperBox] = useState<TamperBox | null>(null);
  const [isElaMode, setIsElaMode] = useState<boolean>(false);
  const [showWhyFlaggedModal, setShowWhyFlaggedModal] = useState<boolean>(false);
  
  // Officer Decision inputs
  const [officerAction, setOfficerAction] = useState<'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATE' | null>(
    activeCase.officerDecision || null
  );
  const [officerNotes, setOfficerNotes] = useState<string>(activeCase.officerNotes || '');
  const [isConfirmed, setIsConfirmed] = useState<boolean>(!!activeCase.officerDecision);

  const stages = [
    { id: 1, name: 'Image Quality', desc: 'Blur, lighting & borders' },
    { id: 2, name: 'OCR & MRZ', desc: 'ICAO 9303 extraction' },
    { id: 3, name: 'Rule Validation', desc: 'Deterministic checksums' },
    { id: 4, name: 'Tampering Forensics', desc: 'Visual anomaly analysis' },
    { id: 5, name: 'Face Verification', desc: 'Biometric landmark match' },
    { id: 6, name: 'Cross-Doc Graph', desc: 'Multi-document consistency' },
    { id: 7, name: 'Risk Assessment', desc: 'Explainable score engine' },
    { id: 8, name: 'Officer Review', desc: 'Human-in-the-loop decision' },
  ];

  // Auto-progression simulator when launching a fresh scan
  useEffect(() => {
    if (!isAutoProgressing) return;
    if (currentStage >= 8) {
      setIsAutoProgressing(false);
      return;
    }

    const timer = setTimeout(() => {
      setCurrentStage(prev => {
        if (prev < 8) return prev + 1;
        setIsAutoProgressing(false);
        return prev;
      });
    }, 1100);

    return () => clearTimeout(timer);
  }, [currentStage, isAutoProgressing]);

  const handleOfficerSubmit = (action: 'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATE') => {
    setOfficerAction(action);
    const updated: ScreeningCase = {
      ...activeCase,
      status: action === 'CLEAR' ? 'CLEAR' : action === 'SECONDARY_REVIEW' ? 'SECONDARY_REVIEW' : 'ESCALATED',
      officerDecision: action,
      officerNotes: officerNotes || `Officer selected ${action} at ${new Date().toLocaleTimeString('en-IN')}`,
      officerSignature: `${activeCase.officerId}-${action}-${Date.now().toString(36)}`,
      completedAt: new Date().toISOString(),
    };
    setActiveCase(updated);
    setIsConfirmed(true);
    onSaveCase(updated);
  };

  const getRiskBadge = (score: number, level: string) => {
    if (level === 'LOW') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded text-emerald-400 font-mono font-bold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>LOW RISK ({score}/100)</span>
        </div>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 rounded text-amber-400 font-mono font-bold text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          <span>MEDIUM RISK ({score}/100)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded text-red-400 font-mono font-bold text-xs">
        <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
        <span>HIGH RISK ({score}/100)</span>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Top Banner with Case Header & Stage Controls */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#0D1117] rounded border border-[#1E293B] text-cyan-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white">
                CASE: {activeCase.id}
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono font-semibold bg-[#0D1117] text-slate-300 rounded border border-[#30363D]">
                {activeCase.documentType}
              </span>
              {activeCase.scenarioTag && (
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  {activeCase.scenarioTag}
                </span>
              )}
            </div>
            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
              Officer: {activeCase.officerName} ({activeCase.officerId}) • {activeCase.station}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {getRiskBadge(activeCase.risk.score, activeCase.risk.level)}

          {isAutoProgressing ? (
            <button
              onClick={() => {
                setIsAutoProgressing(false);
                setCurrentStage(8);
              }}
              className="px-2.5 py-1 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 text-xs font-mono rounded border border-[#30363D] transition-colors flex items-center gap-1.5"
            >
              <span>Fast-Forward Analysis</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={() => onOpenReplay(activeCase.id)}
              className="px-2.5 py-1 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 text-xs font-mono rounded border border-[#30363D] transition-colors flex items-center gap-1.5"
              title="Open animated step-by-step evidence replay"
            >
              <Play className="w-3 h-3" />
              <span>Evidence Replay</span>
            </button>
          )}

          <button
            onClick={onBackToDashboard}
            className="px-2.5 py-1 bg-[#0A0C10] hover:bg-[#1F242C] text-slate-400 text-xs font-mono rounded border border-[#30363D] transition-colors"
          >
            Dashboard
          </button>
        </div>
      </div>

      {/* 8-Stage Progress Stepper Bar */}
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg p-2.5 shadow-md overflow-x-auto">
        <div className="flex items-center justify-between min-w-[720px] gap-1.5">
          {stages.map((stage) => {
            const isDone = currentStage > stage.id;
            const isCurrent = currentStage === stage.id;

            return (
              <button
                key={stage.id}
                onClick={() => {
                  setIsAutoProgressing(false);
                  setCurrentStage(stage.id);
                }}
                className={`flex-1 flex flex-col items-center text-center p-1.5 rounded transition-all ${
                  isCurrent
                    ? 'bg-[#0D1117] border border-cyan-500/80 shadow-sm text-cyan-300'
                    : isDone
                    ? 'text-slate-300 hover:bg-[#0D1117]/50'
                    : 'text-slate-600 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-center gap-1 mb-0.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                      isDone
                        ? 'bg-emerald-500 text-slate-950'
                        : isCurrent
                        ? 'bg-cyan-500 text-slate-950 animate-pulse'
                        : 'bg-[#0A0C10] text-slate-500 border border-[#30363D]'
                    }`}
                  >
                    {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : stage.id}
                  </div>
                  <span className="text-[11px] font-mono font-bold">{stage.name}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 truncate max-w-[85px]">
                  {stage.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* STAGE CONTENT SWITCHER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column: Interactive Forensics Canvas (Cols 1-7) */}
        <div className="lg:col-span-7 space-y-3">
          <DocumentForensicsCanvas
            documentType={activeCase.documentType}
            tamperBoxes={activeCase.tampering.regions}
            activeBoxId={selectedTamperBox?.id || null}
            onSelectBox={(box) => setSelectedTamperBox(box)}
            scenarioTag={activeCase.scenarioTag}
            isElaMode={isElaMode}
            onToggleEla={() => setIsElaMode(!isElaMode)}
          />

          {/* Quick Stage Description Card */}
          <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">STAGE {currentStage}/8:</span>
              <span className="text-slate-200 font-semibold">{stages[currentStage - 1].name}</span>
              <span className="text-slate-500 hidden sm:inline">— {stages[currentStage - 1].desc}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={currentStage <= 1}
                onClick={() => setCurrentStage(prev => Math.max(1, prev - 1))}
                className="p-1 rounded bg-[#0D1117] hover:bg-[#1F242C] disabled:opacity-30 text-slate-300 border border-[#30363D]"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>
              <button
                disabled={currentStage >= 8}
                onClick={() => setCurrentStage(prev => Math.min(8, prev + 1))}
                className="p-1 rounded bg-[#0D1117] hover:bg-[#1F242C] disabled:opacity-30 text-slate-300 border border-[#30363D]"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Active Stage Inspector Panel (Cols 8-12) */}
        <div className="lg:col-span-5 space-y-3">
          {/* STAGE 1: Image Quality Report */}
          {currentStage === 1 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Optical Ingestion Quality Check</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[10px] rounded font-bold">
                  {activeCase.imageQuality.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono text-xs">
                <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Sharpness / Blur Index</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {activeCase.imageQuality.blurScore}/100 (Clean)
                  </div>
                </div>

                <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Resolution & DPI</span>
                  <div className="text-sm font-bold text-slate-200 mt-0.5">
                    {activeCase.imageQuality.resolution.dpi} DPI (1920x1280)
                  </div>
                </div>

                <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Lighting & Glare Index</span>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    {activeCase.imageQuality.lightingScore}/100 (Balanced)
                  </div>
                </div>

                <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Document Boundary</span>
                  <div className="text-sm font-bold text-cyan-300 mt-0.5">
                    {activeCase.imageQuality.boundaryConfidence}% Locked
                  </div>
                </div>
              </div>

              <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                Optical frame passed all pre-processing filters. Document substrate is flat, un-skewed, and sufficient for OCR character segmentation.
              </p>

              <button
                onClick={() => setCurrentStage(2)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to OCR & MRZ Extraction</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 2: OCR Extraction */}
          {currentStage === 2 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Optical Character Recognition (OCR-B)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Mean: 97.8%</span>
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {activeCase.ocrFields.map((field) => (
                  <div
                    key={field.key}
                    className={`p-2 rounded border font-mono text-xs flex items-center justify-between ${
                      field.isLowConfidence
                        ? 'bg-red-950/30 border-red-800 text-red-300'
                        : 'bg-[#0D1117] border-[#1E293B] text-slate-200'
                    }`}
                  >
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase">{field.label}</span>
                      <div className="font-bold text-slate-100 text-xs">{field.value}</div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-bold ${field.confidence > 85 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {field.confidence.toFixed(1)}%
                      </span>
                      {field.isLowConfidence && (
                        <div className="text-[8px] text-red-400 font-semibold">Review required</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {activeCase.mrzData && (
                <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] font-mono text-[10px]">
                  <div className="text-slate-400 text-[9px] font-bold mb-1">PARSED MACHINE READABLE ZONE (ICAO 9303 TD3):</div>
                  <div className="text-cyan-300 tracking-wider break-all">{activeCase.mrzData.rawLine1}</div>
                  <div className="text-cyan-300 tracking-wider break-all">{activeCase.mrzData.rawLine2}</div>
                </div>
              )}

              <button
                onClick={() => setCurrentStage(3)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Deterministic Rule Validation</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 3: Rule Validation */}
          {currentStage === 3 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Deterministic Security Rules (ICAO 9303)</span>
                </div>
                <span className="text-[10px] font-mono text-amber-400">NO AI • STRICT LOGIC</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeCase.ruleChecks.map((rule) => {
                  const isPass = rule.status === 'PASS';
                  const isWarn = rule.status === 'WARNING';
                  return (
                    <div
                      key={rule.id}
                      className={`p-2.5 rounded border font-mono text-xs space-y-1 ${
                        isPass
                          ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                          : isWarn
                          ? 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                          : 'bg-red-950/40 border-red-800/70 text-red-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px]">{rule.ruleName}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            isPass
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isWarn
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {rule.status}
                        </span>
                      </div>
                      <p className="text-[10px] font-sans text-slate-300 leading-snug">
                        {rule.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentStage(4)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Tampering & Anomaly Forensics</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 4: Tampering & Anomaly Forensics */}
          {currentStage === 4 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Tampering & Forensics Engine</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  activeCase.tampering.overallTamperScore > 50 ? 'bg-red-500/10 text-red-400 border border-red-500/30' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                }`}>
                  Anomaly Score: {activeCase.tampering.overallTamperScore}/100
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Photo Replacement</span>
                  <div className={`font-bold text-xs mt-0.5 ${activeCase.tampering.photoAnomalyScore > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                    {activeCase.tampering.photoAnomalyScore}% Anomaly
                  </div>
                </div>

                <div className="p-2 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Text Manipulation</span>
                  <div className={`font-bold text-xs mt-0.5 ${activeCase.tampering.textManipulationScore > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                    {activeCase.tampering.textManipulationScore}% Anomaly
                  </div>
                </div>

                <div className="p-2 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">Stamp Discontinuity</span>
                  <div className={`font-bold text-xs mt-0.5 ${activeCase.tampering.stampAnomalyScore > 50 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {activeCase.tampering.stampAnomalyScore}% Anomaly
                  </div>
                </div>

                <div className="p-2 bg-[#0D1117] rounded border border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] uppercase">JPEG ELA Compression</span>
                  <div className={`font-bold text-xs mt-0.5 ${activeCase.tampering.compressionVariance > 50 ? 'text-red-400' : 'text-slate-300'}`}>
                    {activeCase.tampering.compressionVariance}% Variance
                  </div>
                </div>
              </div>

              <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] font-mono text-xs">
                <span className="text-slate-500 text-[9px] block mb-0.5 uppercase">METADATA / EXIF LAYER:</span>
                <div className="text-slate-200 font-semibold text-[11px]">{activeCase.tampering.metadataStatus}</div>
                {activeCase.tampering.metadataDetails && (
                  <p className="text-[10px] text-amber-300 mt-1">{activeCase.tampering.metadataDetails}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 block font-bold uppercase">
                  FLAGGED REGIONS ({activeCase.tampering.regions.length}):
                </span>
                {activeCase.tampering.regions.map(r => (
                  <div
                    key={r.id}
                    onClick={() => setSelectedTamperBox(r)}
                    className="p-2 rounded bg-red-950/30 border border-red-800 text-xs font-mono cursor-pointer hover:bg-red-950/50 transition-colors"
                  >
                    <div className="flex items-center justify-between text-red-300 font-bold text-[11px]">
                      <span>{r.label}</span>
                      <span>{r.confidence.toFixed(1)}%</span>
                    </div>
                    <p className="text-[10px] font-sans text-slate-300 mt-0.5">{r.reason}</p>
                  </div>
                ))}
                {activeCase.tampering.regions.length === 0 && (
                  <div className="p-2.5 rounded bg-emerald-950/30 border border-emerald-900 text-emerald-400 text-xs font-mono">
                    Zero visual anomalies detected. All physical printing layers concordant.
                  </div>
                )}
              </div>

              <button
                onClick={() => setCurrentStage(5)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Face Biometric Verification</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 5: Face Verification */}
          {currentStage === 5 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Face Biometric Verification (1:1)</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  activeCase.faceVerification?.matchStatus === 'MATCH' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {activeCase.faceVerification?.matchStatus || 'MATCH'}
                </span>
              </div>

              {/* Face Comparison Split View */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-2.5 bg-[#0D1117] rounded-lg border border-[#1E293B] text-center">
                  <div className="text-[9px] font-mono text-slate-400 mb-1 uppercase">Document Headshot</div>
                  <img
                    src={activeCase.faceVerification?.documentFaceUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                    alt="Doc Headshot"
                    className="w-22 h-26 object-cover rounded mx-auto border border-slate-700"
                  />
                  <div className="text-[9px] font-mono text-cyan-400 mt-1">Extracted at 300 DPI</div>
                </div>

                <div className="p-2.5 bg-[#0D1117] rounded-lg border border-[#1E293B] text-center">
                  <div className="text-[9px] font-mono text-slate-400 mb-1 uppercase">Presented Traveler</div>
                  <img
                    src={activeCase.faceVerification?.presentedFaceUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'}
                    alt="Presented Traveler"
                    className="w-22 h-26 object-cover rounded mx-auto border border-slate-700"
                  />
                  <div className="text-[9px] font-mono text-emerald-400 mt-1">Live Feed Reticle</div>
                </div>
              </div>

              <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] space-y-1 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Facial Similarity Score:</span>
                  <span className={`text-xs font-bold ${
                    (activeCase.faceVerification?.similarityScore || 0) >= 80 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {activeCase.faceVerification?.similarityScore.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Threshold Cutoff:</span>
                  <span>80.0% (ICAO 9303 Biometrics)</span>
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>Liveness Detection:</span>
                  <span className="text-emerald-400">99.1% (3D Depth Active)</span>
                </div>
              </div>

              <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
                {activeCase.faceVerification?.explanation}
              </p>

              <div className="p-2 bg-amber-950/30 border border-amber-800/50 rounded text-[10px] font-mono text-amber-300">
                <strong>Decision Support Note: </strong>
                {activeCase.faceVerification?.decisionSupportNote}
              </div>

              <button
                onClick={() => setCurrentStage(6)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Cross-Document Consistency</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 6: Cross-Document Consistency */}
          {currentStage === 6 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Cross-Document Identity Consistency</span>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                  activeCase.crossDocument?.isConsistent ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}>
                  {activeCase.crossDocument?.isConsistent ? 'CONSISTENT' : 'MISMATCH DETECTED'}
                </span>
              </div>

              <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] text-xs font-mono space-y-1.5">
                <div className="flex justify-between border-b border-[#1E293B] pb-1">
                  <span className="text-slate-500 text-[11px]">Primary Doc (Passport):</span>
                  <span className="text-slate-200 font-bold text-[11px]">{activeCase.crossDocument?.primaryDoc.number} ({activeCase.crossDocument?.primaryDoc.name})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-[11px]">Secondary Doc (Visa):</span>
                  <span className="text-slate-200 font-bold text-[11px]">{activeCase.crossDocument?.secondaryDoc?.number || 'V9876543'} ({activeCase.crossDocument?.secondaryDoc?.name || 'N/A'})</span>
                </div>
              </div>

              {/* Mismatched Fields Table */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-300 block uppercase">FIELD-LEVEL COMPARISON:</span>
                {activeCase.crossDocument?.mismatchedFields && activeCase.crossDocument.mismatchedFields.length > 0 ? (
                  activeCase.crossDocument.mismatchedFields.map((m, idx) => (
                    <div key={idx} className="p-2.5 bg-red-950/30 border border-red-800/70 rounded text-xs font-mono space-y-1">
                      <div className="flex items-center justify-between text-red-400 font-bold text-[11px]">
                        <span>{m.field}</span>
                        <span className="px-1.5 py-0.2 rounded bg-red-500/20 text-red-300 text-[9px]">SEVERITY: {m.severity}</span>
                      </div>
                      <div className="text-slate-300 text-[10px]">Primary Doc: <span className="font-bold text-white">{m.primaryValue}</span></div>
                      <div className="text-slate-300 text-[10px]">Secondary Doc: <span className="font-bold text-white">{m.secondaryValue}</span></div>
                    </div>
                  ))
                ) : (
                  <div className="p-2.5 bg-emerald-950/30 border border-emerald-900/60 rounded text-xs font-mono text-emerald-300">
                    ✓ All biographical records (Name, DOB, Nationality, Document Numbers) are 100% concordant across Passport and Visa registers.
                  </div>
                )}
              </div>

              <p className="text-[11px] font-sans text-slate-400 leading-relaxed">
                {activeCase.crossDocument?.summary}
              </p>

              <button
                onClick={() => setCurrentStage(7)}
                className="w-full py-2 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1.5"
              >
                <span>Proceed to Explainable Risk Engine</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 7: Explainable Risk Engine */}
          {currentStage === 7 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Explainable Risk Engine (Score Breakdown)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">WEIGHTED EVIDENCE</span>
              </div>

              {/* Large Score Meter */}
              <div className="p-3 bg-[#0D1117] rounded-lg border border-[#1E293B] flex items-center justify-between">
                <div>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">CALCULATED RISK SCORE</span>
                  <div className="text-2xl font-extrabold font-mono text-white mt-0.5">
                    {activeCase.risk.score} <span className="text-xs font-normal text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-mono text-slate-500 uppercase">RISK CLASSIFICATION</span>
                  <div className="mt-0.5">{getRiskBadge(activeCase.risk.score, activeCase.risk.level)}</div>
                </div>
              </div>

              {/* Evidence Waterfall Factor Ledger */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-slate-300 block uppercase">
                  CONTRIBUTING EVIDENCE FACTORS:
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {activeCase.risk.factors.map((factor, idx) => {
                    const isPositive = factor.points > 0;
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-xs font-mono flex items-start justify-between gap-2 ${
                          isPositive
                            ? 'bg-red-950/20 border-red-900/40 text-red-200'
                            : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-200'
                        }`}
                      >
                        <div>
                          <div className="font-bold text-slate-100 text-[11px]">{factor.factor}</div>
                          <p className="text-[9px] font-sans text-slate-400 mt-0.5">{factor.description}</p>
                        </div>
                        <span className={`px-1.5 py-0.2 rounded font-mono font-bold text-[10px] ${
                          isPositive ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                          {isPositive ? `+${factor.points}` : factor.points}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={() => setCurrentStage(8)}
                className="w-full py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-mono text-xs font-bold rounded shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                <span>Proceed to Human Officer Review</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* STAGE 8: Officer Review & Human-in-the-Loop Decision */}
          {currentStage === 8 && (
            <div className="p-4 bg-[#161B22] border border-[#1E293B] rounded-lg space-y-3 shadow-md">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
                <div className="font-mono font-bold text-xs text-cyan-400 flex items-center gap-1.5 uppercase">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Human-in-the-Loop Officer Decision</span>
                </div>
                <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/30 font-bold">
                  AI IS ADVISORY
                </span>
              </div>

              {/* AI Recommendation Box */}
              <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] space-y-1.5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">AI Evidence Recommendation:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    activeCase.risk.recommendedAction === 'CLEAR'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : activeCase.risk.recommendedAction === 'SECONDARY_REVIEW'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {activeCase.risk.recommendedAction}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-[#1E293B]">
                  <span className="text-slate-500 text-[9px] block mb-1 uppercase font-bold">PRIMARY EVIDENCE SUMMARY:</span>
                  <ul className="space-y-0.5 text-[10px] text-slate-300 font-sans list-disc list-inside">
                    {activeCase.risk.whyFlagged.map((why, i) => (
                      <li key={i}>{why}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Officer Decision Buttons */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono font-bold text-slate-300 block uppercase">
                  AUTHORITATIVE OFFICER ACTION:
                </label>

                <div className="grid grid-cols-3 gap-1.5 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => handleOfficerSubmit('CLEAR')}
                    className={`py-2 px-1 rounded font-bold border transition-all ${
                      officerAction === 'CLEAR'
                        ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400'
                        : 'bg-[#0D1117] hover:bg-emerald-950/40 text-emerald-400 border-emerald-900/60'
                    }`}
                  >
                    CLEAR
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOfficerSubmit('SECONDARY_REVIEW')}
                    className={`py-2 px-1 rounded font-bold border transition-all ${
                      officerAction === 'SECONDARY_REVIEW'
                        ? 'bg-amber-600 text-white border-amber-400 ring-2 ring-amber-400'
                        : 'bg-[#0D1117] hover:bg-amber-950/40 text-amber-400 border-amber-900/60'
                    }`}
                  >
                    SECONDARY
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOfficerSubmit('ESCALATE')}
                    className={`py-2 px-1 rounded font-bold border transition-all ${
                      officerAction === 'ESCALATE'
                        ? 'bg-red-600 text-white border-red-400 ring-2 ring-red-400'
                        : 'bg-[#0D1117] hover:bg-red-950/40 text-red-400 border-red-900/60'
                    }`}
                  >
                    ESCALATE
                  </button>
                </div>
              </div>

              {/* Officer Notes text area */}
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Officer Inspection Remarks / Dossier Notes:
                </label>
                <textarea
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  rows={2}
                  placeholder="Enter specific physical inspection observations or secondary desk assignment notes..."
                  className="w-full p-2 bg-[#0D1117] border border-[#30363D] rounded text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Confirmation status */}
              {isConfirmed && (
                <div className="p-2.5 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded text-xs font-mono flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="text-[11px]">Decision signed & saved to tamper-proof audit log.</span>
                  </div>
                  <span className="text-[9px] text-slate-400">{activeCase.officerSignature}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setShowWhyFlaggedModal(true)}
                  className="flex-1 py-1.5 bg-[#0D1117] hover:bg-[#1F242C] text-slate-300 font-mono text-xs rounded border border-[#30363D] flex items-center justify-center gap-1"
                >
                  <HelpCircle className="w-3 h-3 text-cyan-400" />
                  <span>"Why is this flagged?"</span>
                </button>

                <button
                  onClick={() => onOpenReplay(activeCase.id)}
                  className="flex-1 py-1.5 bg-[#0D1117] hover:bg-[#1F242C] text-cyan-300 font-mono text-xs font-bold rounded border border-[#30363D] flex items-center justify-center gap-1"
                >
                  <Play className="w-3 h-3" />
                  <span>Evidence Replay</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* "WHY IS THIS FLAGGED?" EXPLAINABLE MODAL */}
      {showWhyFlaggedModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#1E293B] rounded-lg max-w-lg w-full p-5 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-mono font-bold text-white text-sm">
                  Explainable Evidence Dossier — {activeCase.id}
                </h3>
              </div>
              <button
                onClick={() => setShowWhyFlaggedModal(false)}
                className="p-1 rounded bg-[#0D1117] hover:bg-[#1F242C] text-slate-400 hover:text-white border border-[#30363D]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
              TRINETRA-X operates on the <strong>AI + Rules + Evidence + Human</strong> paradigm. The final risk score of <strong>{activeCase.risk.score}/100</strong> was computed from these verifiable signals:
            </p>

            <div className="space-y-1.5 font-mono text-xs">
              {activeCase.risk.whyFlagged.map((item, i) => (
                <div key={i} className="p-2 rounded bg-[#0D1117] border border-[#1E293B] flex items-start gap-2">
                  <span className="text-cyan-400 font-bold text-xs">#{i + 1}</span>
                  <span className="text-slate-200 font-sans text-[11px]">{item}</span>
                </div>
              ))}
            </div>

            <div className="p-2.5 bg-[#0D1117] rounded border border-[#1E293B] text-[10px] font-mono text-slate-400">
              <div className="text-slate-200 font-bold mb-0.5">Auditable SHA-256 Digest:</div>
              <div className="text-cyan-400 break-all">{activeCase.documentSha256}</div>
            </div>

            <button
              onClick={() => setShowWhyFlaggedModal(false)}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold rounded uppercase tracking-wider"
            >
              Close Explanation
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
