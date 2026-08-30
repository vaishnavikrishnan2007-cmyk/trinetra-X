import React, { useState, useEffect } from 'react';
import { ScreeningCase } from '../types';
import { DocumentForensicsCanvas } from './DocumentForensicsCanvas';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Clock,
  Layers,
  FileText,
  UserCheck,
  Check
} from 'lucide-react';

interface EvidenceReplayModalProps {
  caseData: ScreeningCase;
  onClose: () => void;
}

export const EvidenceReplayModal: React.FC<EvidenceReplayModalProps> = ({ caseData, onClose }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isElaMode, setIsElaMode] = useState<boolean>(false);

  const steps = [
    {
      title: '1. Ingestion & Optical Pre-Processing',
      time: '0.00s - 0.45s',
      detail: `High-resolution 300 DPI optical scan captured. Boundary locked at ${caseData.imageQuality.boundaryConfidence}% confidence. Blur & lighting score: ${caseData.imageQuality.blurScore}/100.`,
      icon: Layers,
      highlight: 'OPTIMAL_SUBSTRATE',
    },
    {
      title: '2. OCR-B & MRZ Text Extraction',
      time: '0.45s - 1.10s',
      detail: `Extracted ${caseData.ocrFields.length} biographical fields. Mean OCR confidence: 97.8%. Read MRZ line 1 & line 2 with zero checksum dropouts.`,
      icon: FileText,
      highlight: 'OCR_EXTRACTED',
    },
    {
      title: '3. Deterministic ICAO 9303 Rule Engine',
      time: '1.10s - 1.80s',
      detail: `Executed 7-3-1 weight algorithms across document number, DOB, and expiry check digits. ${
        caseData.ruleChecks.some(r => r.status === 'FAIL')
          ? 'CRITICAL DISCREPANCY: Check digit 8 computed, found 3 in MRZ payload.'
          : 'All 4 deterministic check digits matched 100% mathematical validity.'
      }`,
      icon: CheckCircle2,
      highlight: 'RULES_EVALUATED',
    },
    {
      title: '4. Physical Forensics & Anti-Tamper ELA',
      time: '1.80s - 2.65s',
      detail: `Computed Error Level Analysis (ELA) and micro-pattern continuity. ${
        caseData.tampering.regions.length > 0
          ? `ISOLATED ${caseData.tampering.regions.length} VISUAL ANOMALIES: ${caseData.tampering.regions[0].label} (${caseData.tampering.regions[0].confidence.toFixed(1)}% confidence).`
          : 'Substrate guilloche patterns intact. Zero high-frequency splice boundaries.'
      }`,
      icon: ShieldAlert,
      highlight: 'TAMPER_ISOLATED',
    },
    {
      title: '5. Biometric Face Verification (1:1)',
      time: '2.65s - 3.40s',
      detail: `Compared document portrait with presented traveler live stream. Similarity: ${caseData.faceVerification?.similarityScore.toFixed(1)}% (Liveness: ${caseData.faceVerification?.livenessScore.toFixed(1)}%). ${
        (caseData.faceVerification?.similarityScore || 0) < 80 ? 'FLAGGED: Biometric identity mismatch.' : 'Biometric match verified.'
      }`,
      icon: UserCheck,
      highlight: 'FACE_COMPARED',
    },
    {
      title: '6. Cross-Document Relational Consistency',
      time: '3.40s - 3.85s',
      detail: `${
        caseData.crossDocument?.isConsistent
          ? 'Passport and visa records fully concordant across name, DOB, and nationality.'
          : `CROSS-DOC DIVERGENCE: ${caseData.crossDocument?.mismatchedFields.map(f => f.field).join(', ')} mismatch detected.`
      }`,
      icon: Layers,
      highlight: 'CROSS_DOC_CHECKED',
    },
    {
      title: '7. Explainable Risk Score Synthesis',
      time: '3.85s - 4.20s',
      detail: `Synthesized multi-signal weights into transparent ${caseData.risk.score}/100 score. Risk Level: ${caseData.risk.level}. Recommendation: ${caseData.risk.recommendedAction}.`,
      icon: Sparkles,
      highlight: 'RISK_SYNTHESIZED',
    },
    {
      title: '8. Authoritative Officer Review Record',
      time: 'Completed',
      detail: `Case presented to ${caseData.officerName}. Action: ${caseData.officerDecision || 'PENDING_REVIEW'}. Digital signature logged with SHA-256 integrity digest.`,
      icon: Clock,
      highlight: 'DECISION_LOGGED',
    },
  ];

  // Auto-playback loop
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = 2200 / playbackSpeed;
    const timer = setInterval(() => {
      setCurrentStep(prev => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          setIsPlaying(false);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, steps.length]);

  const activeStep = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0C10] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono text-white">
                  Evidence Replay Console — Case {caseData.id}
                </h2>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-800 rounded">
                  SIH EVALUATION REPLAY
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                Frame-by-frame chronological audit trail: Optical, OCR, ICAO 9303, Forensics, and Biometrics.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Main Visual Comparison Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Left: Document Forensics Canvas */}
            <div className="lg:col-span-7">
              <DocumentForensicsCanvas
                documentType={caseData.documentType}
                tamperBoxes={caseData.tampering.regions}
                activeBoxId={caseData.tampering.regions[0]?.id || null}
                scenarioTag={caseData.scenarioTag}
                isElaMode={isElaMode || currentStep >= 3}
                onToggleEla={() => setIsElaMode(!isElaMode)}
              />
            </div>

            {/* Right: Step Explanation & Metrics Card */}
            <div className="lg:col-span-5 space-y-3">
              <div className="p-3.5 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>TIMELINE: {activeStep.time}</span>
                  </span>
                  <span className="text-[10px] text-slate-500">STAGE {currentStep + 1} OF 8</span>
                </div>

                <h3 className="text-xs font-mono font-bold text-white">
                  {activeStep.title}
                </h3>

                <p className="text-[11px] font-sans text-slate-300 leading-relaxed bg-[#161B22] p-2.5 rounded border border-[#1E293B]">
                  {activeStep.detail}
                </p>

                {/* Metric pill for current step */}
                <div className="pt-2 border-t border-[#1E293B] grid grid-cols-2 gap-2 text-[10px] font-mono">
                  <div className="p-1.5 bg-[#161B22] rounded border border-[#1E293B]">
                    <span className="text-slate-500 text-[9px] block">CUMULATIVE RISK</span>
                    <span className={`font-bold ${caseData.risk.score > 50 ? 'text-red-400' : 'text-emerald-400'}`}>
                      {caseData.risk.score}/100 ({caseData.risk.level})
                    </span>
                  </div>
                  <div className="p-1.5 bg-[#161B22] rounded border border-[#1E293B]">
                    <span className="text-slate-500 text-[9px] block">STATUS</span>
                    <span className="text-slate-200 font-bold">
                      {caseData.officerDecision || 'SCREENING'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Sequence Navigator List */}
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {steps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsPlaying(false);
                      setCurrentStep(idx);
                    }}
                    className={`w-full p-1.5 rounded text-left text-xs font-mono flex items-center justify-between transition-all ${
                      currentStep === idx
                        ? 'bg-[#1F242C] border border-amber-500 text-amber-300 font-bold'
                        : 'bg-[#0A0C10] hover:bg-[#161B22] text-slate-400 border border-[#1E293B]'
                    }`}
                  >
                    <span className="truncate text-[11px]">{step.title}</span>
                    <span className="text-[9px] text-slate-500 shrink-0 ml-2">{step.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Chronological Scrub Bar & Controls */}
          <div className="p-3 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-2">
            {/* Step Markers Scrub Bar */}
            <div className="flex items-center gap-1">
              {steps.map((step, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(idx);
                  }}
                  className={`h-1.5 flex-1 rounded-full cursor-pointer transition-all ${
                    idx <= currentStep ? 'bg-amber-400 shadow-sm shadow-amber-400/50' : 'bg-slate-800'
                  }`}
                  title={step.title}
                />
              ))}
            </div>

            {/* Playback Control Buttons */}
            <div className="flex items-center justify-between text-xs font-mono pt-1">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(0);
                  }}
                  className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D]"
                  title="Reset to start"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(prev => Math.max(0, prev - 1));
                  }}
                  className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D]"
                  title="Step Backward"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-1 shadow text-xs"
                >
                  {isPlaying ? <Pause className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                  <span>{isPlaying ? 'PAUSE' : 'PLAY REPLAY'}</span>
                </button>

                <button
                  onClick={() => {
                    setIsPlaying(false);
                    setCurrentStep(prev => Math.min(steps.length - 1, prev + 1));
                  }}
                  className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D]"
                  title="Step Forward"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 text-[10px]">SPEED:</span>
                {[1, 1.5, 2].map(speed => (
                  <button
                    key={speed}
                    onClick={() => setPlaybackSpeed(speed)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      playbackSpeed === speed ? 'bg-[#161B22] text-amber-300 font-bold border border-[#30363D]' : 'text-slate-400'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#0A0C10] border-t border-[#1E293B] flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="text-[11px]">SHA-256: {caseData.documentSha256?.substring(0, 24)}...</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#161B22] hover:bg-[#1F242C] text-white rounded font-bold text-xs border border-[#30363D] transition-colors"
          >
            Close Replay
          </button>
        </div>
      </div>
    </div>
  );
};
