import React from 'react';
import { X, Cpu, Shield, CheckCircle2, ArrowRight, Database, Lock, Eye, Award, Layers, Zap } from 'lucide-react';

interface ArchitectureDiagramModalProps {
  onClose: () => void;
}

export const ArchitectureDiagramModal: React.FC<ArchitectureDiagramModalProps> = ({ onClose }) => {
  const pipelineSteps = [
    { number: '01', title: 'Optical Ingestion', desc: '300 DPI frame normalization, boundary reticle detection, blur & glare scoring.' },
    { number: '02', title: 'OCR-B & MRZ Parser', desc: 'ICAO Doc 9303 TD1/TD2/TD3 parsing with per-character confidence scores.' },
    { number: '03', title: 'Deterministic Rules', desc: 'Non-AI strict 7-3-1 weight check digits & expiry date arithmetic validation.' },
    { number: '04', title: 'Physical Tampering', desc: 'Error Level Analysis (ELA), micro-pattern continuity, and photo boundary slice detection.' },
    { number: '05', title: '1:1 Face Biometrics', desc: 'Deep landmark metric comparison (68-point) between document photo and live traveler.' },
    { number: '06', title: 'Cross-Doc Graph', desc: 'Entity resolution reconciling Passport, Visa, and National ID biographical records.' },
    { number: '07', title: 'Explainable Risk Engine', desc: 'Transparent point-delta ledger with zero black-box scoring. Flags exact reasons.' },
    { number: '08', title: 'Officer Decision & Audit', desc: 'Human authority confirmation digitally signed and committed to SHA-256 ledger.' },
  ];

  const innovationMoat = [
    {
      pillar: 'Evidence-First AI',
      trinetrax: 'Presents highlighted bounding boxes, ELA heatmaps, and checksum math directly to the officer.',
      conventional: 'Outputs opaque confidence score (e.g. "92% Fake") with zero explanation.',
    },
    {
      pillar: 'Deterministic + AI Hybrid',
      trinetrax: 'Rules validate 100% of mathematical check digits without probabilistic hallucinations.',
      conventional: 'Relies solely on end-to-end neural networks which frequently miss off-by-one check digits.',
    },
    {
      pillar: 'Human-in-the-Loop',
      trinetrax: 'Officer retains 100% final statutory authority. AI is strictly decision-support.',
      conventional: 'Attempts autonomous rejection, violating constitutional and immigration legal frameworks.',
    },
    {
      pillar: 'Offline-First Edge Resilience',
      trinetrax: 'Full screening pipeline runs on local edge hardware with cryptographic sync queues.',
      conventional: 'Hard crash when remote satellite or fiber optic border link goes down.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#1E293B] rounded-lg max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0A0C10] border-b border-[#1E293B]">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-gradient-to-br from-cyan-600 to-blue-700 rounded text-white font-bold">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold font-mono text-white">
                  TRINETRA-X Technical Architecture & SIH 2026 Innovation Moat
                </h2>
                <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  SYSTEM DESIGN
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                8-Stage Multi-Signal Evidence Pipeline • ICAO 9303 Compliant • Offline Edge Resilient
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Core Pipeline Visual Flow */}
          <div className="p-3.5 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                <span>The 8-Stage Multi-Signal Forensic Pipeline</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-500">Sub-5 Second Execution</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {pipelineSteps.map(step => (
                <div
                  key={step.number}
                  className="p-2.5 bg-[#161B22] border border-[#1E293B] rounded space-y-1 font-mono text-xs hover:border-cyan-500/50 transition-colors"
                >
                  <div className="flex items-center justify-between text-cyan-400 font-bold">
                    <span className="text-[11px]">STAGE {step.number}</span>
                    <span className="text-[9px] text-slate-500">STAGE</span>
                  </div>
                  <div className="font-bold text-slate-100 text-xs">{step.title}</div>
                  <p className="text-[10px] font-sans text-slate-400 leading-snug">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* SIH Innovation Moat Comparison Table */}
          <div className="p-3.5 bg-[#0A0C10] border border-[#1E293B] rounded-lg space-y-2.5">
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="text-xs font-bold font-mono text-white">
                SIH 2026 Evaluation Matrix — Why TRINETRA-X Stands Out
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-[#161B22] text-slate-400 border-b border-[#1E293B] text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-2.5">Evaluation Pillar</th>
                    <th className="py-2 px-2.5 text-cyan-300">TRINETRA-X Approach</th>
                    <th className="py-2 px-2.5 text-slate-500">Generic / AI-Slop Tools</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1E293B]">
                  {innovationMoat.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#161B22]/40">
                      <td className="py-2 px-2.5 font-bold text-slate-200 text-xs">{row.pillar}</td>
                      <td className="py-2 px-2.5 text-emerald-300 font-sans text-xs">{row.trinetrax}</td>
                      <td className="py-2 px-2.5 text-slate-400 font-sans text-xs">{row.conventional}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Border Security Standards Compliance */}
          <div className="p-3 bg-[#0A0C10] border border-[#1E293B] rounded-lg grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px]">ICAO Doc 9303 Standard (TD1/TD2/TD3)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px]">AES-256 GCM Air-Gapped Storage</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="text-[11px]">MHA RBAC Audit Trail Verification</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#0A0C10] border-t border-[#1E293B] flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1 bg-[#161B22] hover:bg-[#1F242C] text-white font-mono text-xs font-bold rounded border border-[#30363D]"
          >
            Close Architecture
          </button>
        </div>
      </div>
    </div>
  );
};
