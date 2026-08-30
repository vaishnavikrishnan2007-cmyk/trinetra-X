import React, { useState } from 'react';
import { TamperBox, DocumentType } from '../types';
import { ZoomIn, ZoomOut, Maximize2, Layers, AlertTriangle, Eye, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface DocumentForensicsCanvasProps {
  documentType: DocumentType;
  tamperBoxes: TamperBox[];
  activeBoxId?: string | null;
  onSelectBox?: (box: TamperBox | null) => void;
  scenarioTag?: string;
  isElaMode?: boolean;
  onToggleEla?: () => void;
  documentData?: {
    name?: string;
    passportNumber?: string;
    dob?: string;
    nationality?: string;
    expiry?: string;
    portraitUrl?: string;
  };
}

export const DocumentForensicsCanvas: React.FC<DocumentForensicsCanvasProps> = ({
  documentType,
  tamperBoxes,
  activeBoxId,
  onSelectBox,
  scenarioTag = 'GENUINE',
  isElaMode = false,
  onToggleEla,
  documentData,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [showGuillocheGrid, setShowGuillocheGrid] = useState<boolean>(true);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(true);

  const name = documentData?.name || (scenarioTag === 'TEXT_TAMPERING' ? 'SHARMA<<VIKRAM' : scenarioTag === 'PHOTO_REPLACEMENT' ? 'MEHTA<<ROHAN' : scenarioTag === 'CROSS_DOC_MISMATCH' ? 'SHARMA<<PRIYA' : 'KUMAR<<ARUN');
  const docNumber = documentData?.passportNumber || (scenarioTag === 'TEXT_TAMPERING' ? 'P8492015' : scenarioTag === 'PHOTO_REPLACEMENT' ? 'P7654321' : scenarioTag === 'CROSS_DOC_MISMATCH' ? 'P3920194' : 'P1234567');
  const dob = documentData?.dob || (scenarioTag === 'TEXT_TAMPERING' ? '12/04/2001' : scenarioTag === 'PHOTO_REPLACEMENT' ? '20/02/1995' : scenarioTag === 'CROSS_DOC_MISMATCH' ? '12/04/2005' : '12/04/1998');
  const expiry = documentData?.expiry || (scenarioTag === 'TEXT_TAMPERING' ? '15/08/2032' : scenarioTag === 'PHOTO_REPLACEMENT' ? '12/05/2030' : scenarioTag === 'CROSS_DOC_MISMATCH' ? '11/04/2035' : '17/09/2031');
  const nationality = documentData?.nationality || 'IND';

  const isTextTampered = scenarioTag === 'TEXT_TAMPERING';
  const isPhotoTampered = scenarioTag === 'PHOTO_REPLACEMENT';

  return (
    <div className="relative flex flex-col w-full bg-[#161B22] border border-[#1E293B] rounded-lg overflow-hidden shadow-xl">
      {/* Top Forensic Control Toolbar */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#0D1117] border-b border-[#1E293B]">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/50 text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            OPTICAL FORENSIC VIEWER — 300 DPI
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
            DOC_TYPE: <strong className="text-slate-200">{documentType}</strong>
          </span>
        </div>

        {/* Layer Controls */}
        <div className="flex items-center gap-1">
          {onToggleEla && (
            <button
              onClick={onToggleEla}
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded transition-all ${
                isElaMode
                  ? 'bg-purple-900/90 border border-purple-400 text-purple-200 shadow-sm font-bold'
                  : 'bg-[#161B22] hover:bg-[#1F242C] border border-[#30363D] text-slate-300'
              }`}
              title="Toggle Error Level Analysis (ELA) compression variance heatmap"
            >
              <Layers className="w-3 h-3" />
              <span>ELA HEATMAP {isElaMode ? '[ON]' : '[OFF]'}</span>
            </button>
          )}

          <button
            onClick={() => setShowBoundingBoxes(!showBoundingBoxes)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              showBoundingBoxes ? 'bg-[#161B22] text-cyan-300 border border-[#30363D] font-bold' : 'bg-[#0D1117] text-slate-500 border border-[#1E293B]'
            }`}
            title="Toggle suspicious bounding boxes"
          >
            <Eye className="w-3 h-3" />
            <span className="hidden md:inline">ANOMALIES</span>
          </button>

          <button
            onClick={() => setShowGuillocheGrid(!showGuillocheGrid)}
            className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded transition-colors ${
              showGuillocheGrid ? 'bg-[#161B22] text-slate-300 border border-[#30363D]' : 'bg-[#0D1117] text-slate-500 border border-[#1E293B]'
            }`}
            title="Toggle Micro-print Guilloche Security Grid"
          >
            <span className="hidden md:inline">GUILLOCHE</span>
          </button>

          <div className="h-3.5 w-px bg-[#1E293B] mx-1"></div>

          <button
            onClick={() => setZoom(Math.max(0.8, zoom - 0.2))}
            className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono text-slate-400 w-8 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2.0, zoom + 0.2))}
            className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1 rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D] transition-colors"
            title="Reset Zoom"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="relative w-full min-h-[360px] sm:min-h-[420px] max-h-[560px] overflow-auto flex items-center justify-center p-4 bg-[#0A0C10] select-none tactical-grid">
        <div
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          className="relative transition-transform duration-200 ease-out shadow-2xl rounded border border-slate-700/80 overflow-hidden w-full max-w-[620px] aspect-[1.42/1] bg-gradient-to-br from-amber-50/90 via-slate-100 to-amber-100/80 text-slate-900"
        >
          {/* ELA Heatmap Shader Overlay */}
          {isElaMode && (
            <div className="absolute inset-0 z-30 pointer-events-none mix-blend-color-dodge bg-gradient-to-tr from-purple-950/80 via-transparent to-pink-900/60 opacity-90">
              {/* Artificial High Compression Hotspots for tampered zones */}
              {isTextTampered && (
                <div className="absolute top-[44%] left-[46%] w-[28%] h-[12%] bg-red-500/80 blur-sm rounded animate-pulse" />
              )}
              {isPhotoTampered && (
                <div className="absolute top-[20%] left-[6%] w-[32%] h-[52%] border-4 border-red-500/90 bg-red-600/40 blur-[2px] rounded animate-pulse" />
              )}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/85 text-purple-300 font-mono text-[9px] rounded border border-purple-500/50">
                ELA VARIANCE HEATMAP (High-frequency luminance difference)
              </div>
            </div>
          )}

          {/* Guilloche Security Micro-Pattern Background SVG */}
          {showGuillocheGrid && (
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none">
              <defs>
                <pattern id="guilloche" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 0,20 Q 10,0 20,20 T 40,20 M 0,20 Q 10,40 20,20 T 40,20" fill="none" stroke="#0891b2" strokeWidth="0.5" />
                  <circle cx="20" cy="20" r="15" fill="none" stroke="#ca8a04" strokeWidth="0.4" strokeDasharray="1,2" />
                </pattern>
                <pattern id="microtext" width="120" height="12" patternUnits="userSpaceOnUse">
                  <text x="0" y="8" fill="#0284c7" fontSize="5" fontFamily="monospace" opacity="0.4">REPUBLICOFINDIA•PASSPORT•SSB•SECURITY•DOC9303</text>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#guilloche)" />
              <rect width="100%" height="100%" fill="url(#microtext)" />
            </svg>
          )}

          {/* Document Header Zone */}
          <div className="relative px-5 pt-3 pb-1.5 border-b border-amber-900/20 flex justify-between items-center">
            <div>
              <div className="text-[10px] tracking-widest font-serif font-bold text-amber-950 uppercase">
                Republic of India / Passport
              </div>
              <div className="text-[8px] font-mono text-slate-600 tracking-wider">
                PASSPORT NO / PASSEPORT NO: <span className="font-bold text-slate-900">{docNumber}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[8px] font-mono text-slate-500 uppercase">Type / Country</div>
                <div className="text-[9px] font-bold font-mono text-slate-800">P / {nationality}</div>
              </div>
              {/* Emblem icon */}
              <div className="w-6 h-6 rounded-full border border-amber-800/40 bg-amber-200/50 flex items-center justify-center text-[9px] font-serif font-bold text-amber-900 shadow-inner">
                IND
              </div>
            </div>
          </div>

          {/* Document Main Data & Portrait Section */}
          <div className="relative p-4 grid grid-cols-12 gap-3 items-start">
            {/* Portrait Section (Cols 1-4) */}
            <div className="col-span-4 relative flex flex-col items-center">
              <div className={`relative w-26 h-34 rounded border-2 overflow-hidden shadow-md ${
                isPhotoTampered ? 'border-red-600' : 'border-slate-400 bg-slate-200'
              }`}>
                <img
                  src={
                    isPhotoTampered
                      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80'
                      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80'
                  }
                  alt="Document Portrait"
                  className="w-full h-full object-cover"
                />

                {/* Stamp overlay across the photo */}
                <div className="absolute bottom-2 -right-4 w-16 h-16 rounded-full border-2 border-dashed border-red-800/60 flex items-center justify-center pointer-events-none transform -rotate-12">
                  <span className="text-[6px] font-mono text-red-900 font-bold tracking-tighter opacity-80">
                    PASSPORT OFFICE • {nationality}
                  </span>
                </div>

                {/* Ghost watermark indicator */}
                <div className="absolute top-1 right-1 px-1 py-0.5 bg-white/70 backdrop-blur-[1px] text-[6px] font-mono text-slate-700 rounded">
                  ICAO 9303
                </div>
              </div>

              <div className="mt-1 text-[7px] font-mono text-slate-500 uppercase tracking-tight">
                Holder's Signature
              </div>
              <div className="font-serif italic text-[11px] text-slate-800 font-bold tracking-wide -mt-0.5">
                {name.split('<<')[0] || 'A. Kumar'}
              </div>
            </div>

            {/* Biographical Visual Zone (Cols 5-12) */}
            <div className="col-span-8 grid grid-cols-2 gap-y-1.5 gap-x-2.5 text-slate-800">
              <div className="col-span-2">
                <div className="text-[7px] font-mono text-slate-500 uppercase">Surname / Given Names</div>
                <div className="text-xs font-bold font-mono text-slate-950 tracking-wider">
                  {name.replace('<<', ' ')}
                </div>
              </div>

              <div>
                <div className="text-[7px] font-mono text-slate-500 uppercase">Nationality</div>
                <div className="text-[11px] font-bold font-mono text-slate-900">INDIAN (IND)</div>
              </div>

              <div>
                <div className="text-[7px] font-mono text-slate-500 uppercase">Sex / Sexe</div>
                <div className="text-[11px] font-bold font-mono text-slate-900">M</div>
              </div>

              {/* Date of Birth Field (with controlled tampering effect if Scenario B) */}
              <div className="relative">
                <div className="text-[7px] font-mono text-slate-500 uppercase flex items-center justify-between">
                  <span>Date of Birth</span>
                  {isTextTampered && (
                    <span className="text-[6px] text-red-600 font-bold font-mono">[FONT ANOMALY]</span>
                  )}
                </div>
                <div
                  className={`text-[11px] font-bold font-mono tracking-wider ${
                    isTextTampered
                      ? 'text-red-700 bg-red-100/80 px-1 rounded border border-red-400 font-sans tracking-normal shadow-sm'
                      : 'text-slate-900'
                  }`}
                >
                  {dob}
                </div>
              </div>

              <div>
                <div className="text-[7px] font-mono text-slate-500 uppercase">Place of Birth</div>
                <div className="text-[11px] font-bold font-mono text-slate-900">NEW DELHI, IND</div>
              </div>

              <div>
                <div className="text-[7px] font-mono text-slate-500 uppercase">Date of Issue</div>
                <div className="text-[11px] font-bold font-mono text-slate-900">18/09/2021</div>
              </div>

              <div>
                <div className="text-[7px] font-mono text-slate-500 uppercase">Date of Expiry</div>
                <div className="text-[11px] font-bold font-mono text-slate-900">{expiry}</div>
              </div>
            </div>
          </div>

          {/* Machine Readable Zone (MRZ TD3 - 2 Lines) */}
          <div className="absolute bottom-0 inset-x-0 bg-slate-200/95 border-t border-slate-400/80 px-3 py-1.5 font-mono text-[9px] sm:text-[10px] text-slate-950 tracking-[0.14em] font-semibold leading-relaxed">
            <div>
              {`P<IND<${name.replace(/\s+/g, '<')}`.padEnd(44, '<').substring(0, 44)}
            </div>
            <div>
              {`${docNumber}<${isTextTampered ? '3' : '8'}IND${isTextTampered ? '880412' : '980412'}4M${expiry.replace(/\//g, '').substring(4, 6)}${expiry.replace(/\//g, '').substring(2, 4)}${expiry.replace(/\//g, '').substring(0, 2)}7<<<<<<<<<<<<<<<0`.substring(0, 44)}
            </div>
          </div>

          {/* Interactive Bounding Boxes Overlays */}
          {showBoundingBoxes && tamperBoxes.map(box => {
            const isSelected = activeBoxId === box.id;
            const isRed = box.severity === 'RED';

            return (
              <div
                key={box.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBox?.(box);
                }}
                style={{
                  top: `${box.y}%`,
                  left: `${box.x}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                }}
                className={`absolute z-40 cursor-pointer rounded transition-all ${
                  isRed
                    ? 'border-2 border-red-500 bg-red-500/15 shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                    : 'border-2 border-amber-500 bg-amber-500/15 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                } ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-[1.02]' : 'hover:scale-[1.01]'}`}
              >
                {/* Tag label pin */}
                <div
                  className={`absolute -top-5 left-0 px-1 py-0.2 rounded text-[8px] font-mono font-bold whitespace-nowrap flex items-center gap-1 shadow-md ${
                    isRed ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
                  }`}
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  <span>{box.label.substring(0, 28)}</span>
                  <span className="opacity-90">({box.confidence.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forensic Inspection Drawer / Box Callout */}
      {activeBoxId && (
        <div className="px-3 py-2 bg-[#0D1117] border-t border-[#1E293B] text-xs font-mono flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          {(() => {
            const currentBox = tamperBoxes.find(b => b.id === activeBoxId);
            if (!currentBox) return null;
            const isRed = currentBox.severity === 'RED';
            return (
              <>
                <div className="flex items-start gap-2">
                  <div className={`p-1 rounded mt-0.5 ${isRed ? 'bg-red-950/80 border border-red-500 text-red-400' : 'bg-amber-950/80 border border-amber-500 text-amber-400'}`}>
                    <ShieldAlert className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 flex items-center gap-2 text-[11px]">
                      <span>{currentBox.label}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] ${isRed ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
                        CONFIDENCE: {currentBox.confidence.toFixed(1)}%
                      </span>
                      <span className="text-slate-500 text-[9px]">CATEGORY: {currentBox.forensicCategory}</span>
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 font-sans leading-relaxed">
                      <strong className="text-slate-200">Forensic Evidence: </strong>
                      {currentBox.reason}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectBox?.(null)}
                  className="self-end md:self-center px-2 py-0.5 text-[10px] rounded bg-[#161B22] hover:bg-[#1F242C] text-slate-300 border border-[#30363D]"
                >
                  Dismiss Callout
                </button>
              </>
            );
          })()}
        </div>
      )}

      {tamperBoxes.length === 0 && (
        <div className="px-3 py-1.5 bg-emerald-950/30 border-t border-emerald-900/40 text-[11px] font-mono text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>ZERO FORENSIC ANOMALIES DETECTED — Micro-patterns, font baselines & photo boundary verified clean.</span>
        </div>
      )}
    </div>
  );
};
