import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Play, WifiOff, Wifi, RefreshCw, X, ShieldAlert, AlertTriangle } from 'lucide-react';

interface JudgeDemoModalProps {
  onClose: () => void;
  onSelectScenario: (scenario: 'GENUINE' | 'TEXT_TAMPERING' | 'PHOTO_REPLACEMENT' | 'CROSS_DOC_MISMATCH') => void;
  onToggleOffline: () => void;
  isOffline: boolean;
  onOpenReplay: (caseId: string) => void;
}

export const JudgeDemoModal: React.FC<JudgeDemoModalProps> = ({
  onClose,
  onSelectScenario,
  onToggleOffline,
  isOffline,
  onOpenReplay,
}) => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const demoSteps = [
    {
      step: 1,
      title: 'Step 1: Genuine Baseline (Arun Kumar)',
      desc: 'Evaluate how TRINETRA-X processes a completely clean passport. Checksums match, font baselines are uniform, face match is 96.4%, risk is 6/100.',
      actionLabel: 'Launch Genuine Scenario A',
      action: () => {
        onSelectScenario('GENUINE');
        onClose();
      },
    },
    {
      step: 2,
      title: 'Step 2: Controlled Text Tampering (Vikram Sharma)',
      desc: 'Evaluate DOB alteration (1988 changed to 2001). See the red bounding box on the altered font, ELA heatmap spike, and ICAO 9303 checksum mismatch.',
      actionLabel: 'Launch Text Tampering Scenario B',
      action: () => {
        onSelectScenario('TEXT_TAMPERING');
        onClose();
      },
    },
    {
      step: 3,
      title: 'Step 3: Controlled Photo Replacement (Rohan Mehta)',
      desc: 'Evaluate a stolen substrate with replaced headshot. Shows broken circular security stamp ring, photo boundary anomaly, and 38.2% face match failure.',
      actionLabel: 'Launch Photo Replacement Scenario C',
      action: () => {
        onSelectScenario('PHOTO_REPLACEMENT');
        onClose();
      },
    },
    {
      step: 4,
      title: 'Step 4: Cross-Document Relational Mismatch (Priya Sharma)',
      desc: 'Evaluate multi-document graph linking Passport with Visa. Detects a 10-year discrepancy between document records.',
      actionLabel: 'Launch Cross-Doc Scenario D',
      action: () => {
        onSelectScenario('CROSS_DOC_MISMATCH');
        onClose();
      },
    },
    {
      step: 5,
      title: 'Step 5: Test Edge Resilience (Cut Internet Connection)',
      desc: 'Simulate remote ICP network disconnection. Verify that OCR, deterministic MRZ rules, and local risk scoring execute with 100% autonomy.',
      actionLabel: isOffline ? 'Internet Severed (Click to Restore)' : 'Cut Connection (Simulate Offline)',
      action: () => {
        onToggleOffline();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0C10] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-amber-500 to-orange-600 rounded text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white">
                SIH 2026 Guided Evaluator Demonstration
              </h2>
              <p className="text-[10px] font-mono text-amber-400">
                "We don't just say fake. We show the officer exactly why."
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

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          <p className="text-[11px] font-sans text-slate-300 leading-relaxed">
            Follow this 5-step evaluator path to test all core criteria evaluated in Smart India Hackathon: Real-world problem, realistic data, working pipeline, measurable sub-5s speed, and authentic offline edge capability.
          </p>

          <div className="space-y-2 font-mono text-xs">
            {demoSteps.map(st => (
              <div
                key={st.step}
                className="p-3 bg-[#0A0C10] rounded border border-[#1E293B] space-y-1.5 hover:border-[#30363D] transition-colors"
              >
                <div className="flex items-center justify-between text-slate-200">
                  <span className="font-bold text-amber-400 text-xs">{st.title}</span>
                  <span className="text-[9px] text-slate-500">CRITERIA {st.step}</span>
                </div>
                <p className="text-[10px] font-sans text-slate-400 leading-snug">
                  {st.desc}
                </p>
                <button
                  onClick={st.action}
                  className="mt-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded text-xs flex items-center gap-1.5 shadow transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>{st.actionLabel}</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#0A0C10] border-t border-[#1E293B] flex justify-between items-center text-xs font-mono text-slate-400">
          <span>Current Network: <strong className={isOffline ? 'text-amber-400' : 'text-emerald-400'}>{isOffline ? 'OFFLINE' : 'ONLINE'}</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#161B22] hover:bg-[#1F242C] text-white rounded font-bold text-xs border border-[#30363D]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
