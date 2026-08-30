export type DocumentType = 'PASSPORT' | 'VISA' | 'NATIONAL_ID' | 'DRIVING_LICENSE' | 'PERMIT';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type CaseStatus = 'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATED' | 'PENDING_REVIEW' | 'FLAGGED';

export type ValidationStatus = 'PASS' | 'WARNING' | 'FAIL';

export interface Officer {
  id: string;
  name: string;
  badgeNumber: string;
  role: 'BORDER_OFFICER' | 'SUPERVISOR' | 'INVESTIGATOR' | 'AUDITOR';
  station: string;
  avatarUrl?: string;
}

export interface ImageQualityReport {
  blurScore: number; // 0-100 (higher is sharper)
  resolution: { width: number; height: number; dpi: number };
  lightingScore: number; // 0-100 (glare/shadow check)
  rotationAngle: number; // degrees
  boundaryConfidence: number; // 0-100
  status: 'OPTIMAL' | 'ACCEPTABLE' | 'POOR_RECAPTURE_REQUIRED';
  issues: string[];
}

export interface OCRField {
  key: string;
  label: string;
  value: string;
  confidence: number; // percentage 0-100
  isLowConfidence?: boolean;
  mrzMatch?: boolean;
}

export interface MRZData {
  rawLine1: string;
  rawLine2: string;
  documentType: string;
  issuingCountry: string;
  surname: string;
  givenNames: string;
  passportNumber: string;
  passportCheckDigit: string;
  passportCheckPassed: boolean;
  nationality: string;
  dateOfBirth: string; // YYMMDD
  dobFormatted?: string;
  expiryFormatted?: string;
  dobCheckDigit: string;
  dobCheckPassed: boolean;
  gender: string;
  expiryDate: string; // YYMMDD
  expiryCheckDigit: string;
  expiryCheckPassed: boolean;
  compositeCheckDigit: string;
  compositeCheckPassed: boolean;
  allChecksumsValid: boolean;
}

export type ParsedMRZResult = MRZData;

export interface RuleCheck {
  id: string;
  ruleName: string;
  category: 'ICAO_FORMAT' | 'EXPIRY' | 'CHECKSUM' | 'INTERNAL_CONSISTENCY' | 'VISA_VALIDITY';
  status: ValidationStatus;
  detail: string;
  isDeterministic: boolean;
}

export interface TamperBox {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  label: string;
  severity: 'RED' | 'ORANGE' | 'YELLOW';
  confidence: number; // 0-100
  reason: string;
  forensicCategory: 'TEXT_MANIPULATION' | 'PHOTO_REPLACEMENT' | 'STAMP_ANOMALY' | 'COMPRESSION_INCONSISTENCY' | 'EDGE_DISCONTINUITY';
}

export interface TamperingForensicReport {
  overallTamperScore: number; // 0-100 (higher means more suspicious)
  photoAnomalyScore: number; // 0-100
  textManipulationScore: number; // 0-100
  stampAnomalyScore: number; // 0-100
  compressionVariance: number; // 0-100 (ELA)
  metadataStatus: 'CLEAN' | 'EXIF_EDIT_DETECTED' | 'SOFTWARE_ALTERATION_TAG' | 'NO_METADATA';
  metadataDetails?: string;
  regions: TamperBox[];
  summary: string;
}

export interface FaceVerificationResult {
  documentFaceUrl: string;
  presentedFaceUrl: string;
  similarityScore: number; // 0-100
  livenessScore: number; // 0-100
  matchStatus: 'MATCH' | 'REVIEW' | 'LOW_SIMILARITY';
  landmarkConfidence: number; // 0-100
  explanation: string;
  decisionSupportNote: string;
}

export interface CrossDocumentConsistency {
  primaryDoc: { type: DocumentType; number: string; name: string; dob: string; nationality: string };
  secondaryDoc?: { type: DocumentType; number: string; name: string; dob: string; nationality: string; stayDurationDays?: number; validity?: string };
  isConsistent: boolean;
  mismatchedFields: { field: string; primaryValue: string; secondaryValue: string; severity: 'HIGH' | 'MEDIUM' }[];
  summary: string;
}

export interface RiskFactor {
  factor: string;
  category: 'TAMPERING' | 'RULES' | 'CROSS_DOC' | 'FACE' | 'OCR';
  points: number; // e.g. +25, -10
  description: string;
}

export interface RiskAssessment {
  score: number; // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  weightsUsed: {
    documentValidity: number; // e.g. 25
    ocrMrzConsistency: number; // 20
    tamperingEvidence: number; // 25
    faceVerification: number; // 20
    crossDocConsistency: number; // 10
  };
  recommendedAction: 'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATE';
  whyFlagged: string[];
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  caseId: string;
  actor: string;
  action: string;
  detail: string;
  sha256Hash: string;
}

export interface ScreeningCase {
  id: string; // e.g., TX-2026-00421
  createdAt: string;
  completedAt?: string;
  officerId: string;
  officerName: string;
  station: string;
  documentType: DocumentType;
  documentImageUrl: string;
  presentedFaceImageUrl?: string;
  
  // Pipeline Data
  imageQuality: ImageQualityReport;
  ocrFields: OCRField[];
  mrzData?: MRZData;
  ruleChecks: RuleCheck[];
  tampering: TamperingForensicReport;
  faceVerification?: FaceVerificationResult;
  crossDocument?: CrossDocumentConsistency;
  risk: RiskAssessment;
  
  // Officer Review
  status: CaseStatus;
  officerDecision?: 'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATE';
  officerNotes?: string;
  officerSignature?: string;
  
  // Sync and Audit
  isOfflineCreated?: boolean;
  isSynced?: boolean;
  syncedAt?: string;
  documentSha256: string;
  auditTrail: AuditEvent[];
  
  // Scenario tag
  scenarioTag?: 'GENUINE' | 'TEXT_TAMPERING' | 'PHOTO_REPLACEMENT' | 'CROSS_DOC_MISMATCH' | 'CUSTOM_UPLOAD';
}

export interface SystemSettings {
  language: string;
  theme: 'dark' | 'light';
  processingMode: 'HYBRID_AI_RULES' | 'RULES_ONLY_FAILSAFE' | 'DEEP_FORENSIC';
  offlineModeActive: boolean;
  autoSyncWhenOnline: boolean;
  riskWeights: {
    documentValidity: number;
    ocrMrzConsistency: number;
    tamperingEvidence: number;
    faceVerification: number;
    crossDocConsistency: number;
  };
  thresholds: {
    highRiskCutoff: number; // default 65
    mediumRiskCutoff: number; // default 35
    faceSimilarityThreshold: number; // default 80
    ocrConfidenceThreshold: number; // default 85
  };
  checkpointStation: string;
}
