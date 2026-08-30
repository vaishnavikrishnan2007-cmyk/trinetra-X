import React, { useState } from 'react';
import { Officer, SystemSettings } from '../types';
import { StorageService } from '../services/storageService';
import { User, Sliders, Shield, Save, RotateCcw, CheckCircle2, Globe, Cpu, Check } from 'lucide-react';

interface ProfileSettingsProps {
  officer: Officer;
  onUpdateOfficer: (officer: Officer) => void;
  settings: SystemSettings;
  onUpdateSettings: (settings: SystemSettings) => void;
  onResetDemo: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({
  officer,
  onUpdateOfficer,
  settings,
  onUpdateSettings,
  onResetDemo,
}) => {
  const [localOfficer, setLocalOfficer] = useState<Officer>(officer);
  const [localSettings, setLocalSettings] = useState<SystemSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const stations = [
    'ICP Raxaul (Indo-Nepal Border)',
    'ICP Petrapole (Indo-Bangladesh Border)',
    'ICP Moreh (Indo-Myanmar Border)',
    'ICP Attari (Indo-Pak Border)',
    'ICP Sonauli (Indo-Nepal Border)',
  ];

  const handleSave = () => {
    onUpdateOfficer(localOfficer);
    onUpdateSettings(localSettings);
    StorageService.saveOfficer(localOfficer);
    StorageService.saveSettings(localSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleResetDemoData = () => {
    if (confirm('Are you sure you want to reset all cases, queues, and settings back to pristine SIH 2026 demo baseline?')) {
      onResetDemo();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="p-3 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold font-mono text-white">
            Officer Profile & System Configuration
          </h1>
          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
            Configure risk engine scoring weights, ICAO 9303 thresholds, and checkpoint hardware parameters.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold rounded flex items-center gap-1.5 shadow"
        >
          <Save className="w-3.5 h-3.5" />
          <span>Save Changes</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-2.5 bg-emerald-950/80 border border-emerald-700 text-emerald-300 rounded text-xs font-mono flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>System configuration and officer profile successfully updated.</span>
        </div>
      )}

      {/* Officer Station Profile */}
      <div className="p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-2.5">
        <h2 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          <span>1. Authenticated Officer Profile</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Officer Name</label>
            <input
              type="text"
              value={localOfficer.name}
              onChange={(e) => setLocalOfficer({ ...localOfficer, name: e.target.value })}
              className="w-full p-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Badge / Service Number</label>
            <input
              type="text"
              value={localOfficer.badgeNumber}
              onChange={(e) => setLocalOfficer({ ...localOfficer, badgeNumber: e.target.value })}
              className="w-full p-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 text-[11px]">Operational Role</label>
            <select
              value={localOfficer.role}
              onChange={(e) => setLocalOfficer({ ...localOfficer, role: e.target.value as any })}
              className="w-full p-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
            >
              <option value="BORDER_OFFICER">Border Verification Officer</option>
              <option value="SUPERVISOR">ICP Supervisor / Secondary Desk</option>
              <option value="SYSTEM_ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <label className="text-slate-400 block mb-1 text-[11px]">Integrated Check Post (ICP) Station</label>
            <select
              value={localOfficer.station}
              onChange={(e) => setLocalOfficer({ ...localOfficer, station: e.target.value })}
              className="w-full p-2 bg-[#0A0C10] border border-[#30363D] rounded text-slate-100 focus:outline-none focus:border-cyan-500 text-xs"
            >
              {stations.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Risk Engine Weights Configuration */}
      <div className="p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            <span>2. Explainable Risk Engine Weights (Sum: 100%)</span>
          </h2>
          <span className="text-[10px] font-mono text-slate-500">MHA Policy Directive #409</span>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {/* Tampering Evidence Weight */}
          <div>
            <div className="flex justify-between text-slate-300 mb-0.5 text-[11px]">
              <span>Physical Tampering Forensics & ELA:</span>
              <span className="font-bold text-cyan-400">{localSettings.riskWeights.tamperingEvidence}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={localSettings.riskWeights.tamperingEvidence}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                riskWeights: { ...localSettings.riskWeights, tamperingEvidence: Number(e.target.value) }
              })}
              className="w-full accent-cyan-500 h-1"
            />
          </div>

          {/* ICAO 9303 Checksum Weight */}
          <div>
            <div className="flex justify-between text-slate-300 mb-0.5 text-[11px]">
              <span>Deterministic ICAO 9303 Checksums:</span>
              <span className="font-bold text-cyan-400">{localSettings.riskWeights.documentValidity}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={localSettings.riskWeights.documentValidity}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                riskWeights: { ...localSettings.riskWeights, documentValidity: Number(e.target.value) }
              })}
              className="w-full accent-cyan-500 h-1"
            />
          </div>

          {/* Face Biometrics Weight */}
          <div>
            <div className="flex justify-between text-slate-300 mb-0.5 text-[11px]">
              <span>Face Biometric Verification (1:1):</span>
              <span className="font-bold text-cyan-400">{localSettings.riskWeights.faceVerification}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={40}
              value={localSettings.riskWeights.faceVerification}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                riskWeights: { ...localSettings.riskWeights, faceVerification: Number(e.target.value) }
              })}
              className="w-full accent-cyan-500 h-1"
            />
          </div>

          {/* OCR / MRZ Consistency */}
          <div>
            <div className="flex justify-between text-slate-300 mb-0.5 text-[11px]">
              <span>OCR Visual vs. MRZ Consistency:</span>
              <span className="font-bold text-cyan-400">{localSettings.riskWeights.ocrMrzConsistency}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={30}
              value={localSettings.riskWeights.ocrMrzConsistency}
              onChange={(e) => setLocalSettings({
                ...localSettings,
                riskWeights: { ...localSettings.riskWeights, ocrMrzConsistency: Number(e.target.value) }
              })}
              className="w-full accent-cyan-500 h-1"
            />
          </div>
        </div>
      </div>

      {/* Thresholds & Cutoffs */}
      <div className="p-3.5 bg-[#161B22] border border-[#1E293B] rounded-lg shadow-md space-y-2.5">
        <h2 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5" />
          <span>3. Operational Classification Thresholds</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-mono text-xs">
          <div className="p-2.5 bg-[#0A0C10] rounded border border-[#1E293B]">
            <span className="text-slate-400 block mb-0.5 text-[10px]">High Risk Escalation Cutoff</span>
            <div className="text-base font-bold text-red-400">Score &gt;= {localSettings.thresholds.highRiskCutoff}/100</div>
            <span className="text-[9px] text-slate-500">Auto-triggers supervisor notification</span>
          </div>

          <div className="p-2.5 bg-[#0A0C10] rounded border border-[#1E293B]">
            <span className="text-slate-400 block mb-0.5 text-[10px]">Face Similarity Match Minimum</span>
            <div className="text-base font-bold text-emerald-400">&gt;= {localSettings.thresholds.faceSimilarityThreshold}%</div>
            <span className="text-[9px] text-slate-500">ICAO 9303 biometric standard</span>
          </div>
        </div>
      </div>

      {/* Reset to Pristine Demo Baseline */}
      <div className="p-3.5 bg-[#161B22] border border-red-900/40 rounded-lg shadow-md flex items-center justify-between">
        <div>
          <h3 className="font-mono font-bold text-xs text-red-400">Reset Demo Environment</h3>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
            Restores initial sample cases (Arun Kumar, Vikram Sharma, Rohan Mehta, Priya Sharma).
          </p>
        </div>

        <button
          onClick={handleResetDemoData}
          className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800 text-xs font-mono font-bold rounded flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Baseline</span>
        </button>
      </div>
    </div>
  );
};
