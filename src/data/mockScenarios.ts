import { ScreeningCase, DocumentType, ParsedMRZResult } from '../types';
import { parseAndValidateTD3MRZ } from '../services/mrzValidator';
import { calculateExplainableRisk } from '../services/riskEngine';

// Fictional avatars and document sample representations
export const MOCK_ASSETS = {
  genuinePortrait: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  imposterPortrait: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
  liveTravelerArun: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
  liveTravelerImposter: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
  officerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

// SCENARIO 1: GENUINE DOCUMENT (ARUN KUMAR)
const scenario1MRZ = parseAndValidateTD3MRZ(
  'P<IND<<KUMAR<<ARUN<<<<<<<<<<<<<<<<<<<<<<<<<',
  'P1234567<8IND9804124M3109177<<<<<<<<<<<<<<<0'
);

export const SCENARIO_GENUINE: ScreeningCase = {
  id: 'TX-2026-00418',
  createdAt: '2026-08-28T06:45:10Z',
  completedAt: '2026-08-28T06:45:14Z',
  officerId: 'SSB-OFF-9042',
  officerName: 'Inspector R. Sen',
  station: 'ICP Raxaul (Indo-Nepal Border)',
  documentType: 'PASSPORT',
  documentImageUrl: '/samples/passport_genuine.svg',
  presentedFaceImageUrl: MOCK_ASSETS.liveTravelerArun,
  scenarioTag: 'GENUINE',
  documentSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  
  imageQuality: {
    blurScore: 94,
    resolution: { width: 1920, height: 1280, dpi: 300 },
    lightingScore: 92,
    rotationAngle: 0.2,
    boundaryConfidence: 98,
    status: 'OPTIMAL',
    issues: [],
  },

  ocrFields: [
    { key: 'surname', label: 'Surname', value: 'KUMAR', confidence: 99.4, mrzMatch: true },
    { key: 'givenNames', label: 'Given Name(s)', value: 'ARUN', confidence: 99.1, mrzMatch: true },
    { key: 'passportNumber', label: 'Passport No.', value: 'P1234567', confidence: 98.9, mrzMatch: true },
    { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.5, mrzMatch: true },
    { key: 'dob', label: 'Date of Birth', value: '12/04/1998', confidence: 98.7, mrzMatch: true },
    { key: 'gender', label: 'Sex', value: 'MALE', confidence: 99.8, mrzMatch: true },
    { key: 'expiry', label: 'Date of Expiry', value: '17/09/2031', confidence: 99.2, mrzMatch: true },
    { key: 'issuingCountry', label: 'Issuing Country', value: 'IND', confidence: 99.9, mrzMatch: true },
  ],

  mrzData: scenario1MRZ,

  ruleChecks: [
    { id: 'r1', ruleName: 'Passport Expiry Window', category: 'EXPIRY', status: 'PASS', detail: 'Document valid for 5+ years (expires 17/09/2031)', isDeterministic: true },
    { id: 'r2', ruleName: 'Passport No. Check Digit', category: 'CHECKSUM', status: 'PASS', detail: '7-3-1 Weight calculation matches check digit 8', isDeterministic: true },
    { id: 'r3', ruleName: 'DOB Check Digit', category: 'CHECKSUM', status: 'PASS', detail: 'Calculation matches check digit 4', isDeterministic: true },
    { id: 'r4', ruleName: 'Expiry Check Digit', category: 'CHECKSUM', status: 'PASS', detail: 'Calculation matches check digit 7', isDeterministic: true },
    { id: 'r5', ruleName: 'Composite MRZ Checksum', category: 'CHECKSUM', status: 'PASS', detail: 'Overall line 2 composite payload matches digit 0', isDeterministic: true },
    { id: 'r6', ruleName: 'ICAO Doc 9303 TD3 Structure', category: 'ICAO_FORMAT', status: 'PASS', detail: '44-char twin line geometry compliant with standard font OCR-B', isDeterministic: true },
    { id: 'r7', ruleName: 'Visual-MRZ Field Concordance', category: 'INTERNAL_CONSISTENCY', status: 'PASS', detail: 'Zero discrepancy between visual zone typography and machine readable zone', isDeterministic: true },
  ],

  tampering: {
    overallTamperScore: 6,
    photoAnomalyScore: 4,
    textManipulationScore: 3,
    stampAnomalyScore: 2,
    compressionVariance: 8,
    metadataStatus: 'CLEAN',
    regions: [],
    summary: 'Continuous micro-text guilloche lines, uniform JPEG quantization grid, zero splice artifacts.',
  },

  faceVerification: {
    documentFaceUrl: MOCK_ASSETS.genuinePortrait,
    presentedFaceUrl: MOCK_ASSETS.liveTravelerArun,
    similarityScore: 96.4,
    livenessScore: 99.1,
    matchStatus: 'MATCH',
    landmarkConfidence: 98.2,
    explanation: 'Deep metric embeddings confirm high concordance across 68 facial landmarks (inter-pupillary distance, jawline curvature).',
    decisionSupportNote: 'Biometric score exceeds threshold of 80.0%. Subject portrait matches traveler presentation.',
  },

  crossDocument: {
    primaryDoc: { type: 'PASSPORT', number: 'P1234567', name: 'ARUN KUMAR', dob: '12/04/1998', nationality: 'IND' },
    secondaryDoc: { type: 'VISA', number: 'V9876543', name: 'ARUN KUMAR', dob: '12/04/1998', nationality: 'IND', stayDurationDays: 90, validity: '31/12/2026' },
    isConsistent: true,
    mismatchedFields: [],
    summary: 'Passport and Visa biographical records are 100% concordant with valid visa stay duration.',
  },

  risk: {
    score: 6,
    level: 'LOW',
    factors: [
      { factor: 'Clean Document Surface & ELA Forensics', category: 'TAMPERING', points: -5, description: 'Zero splice lines, intact guilloche security patterns.' },
      { factor: 'Valid ICAO Document Architecture & Checksums', category: 'RULES', points: -10, description: 'All check digits pass 7-3-1 weight validation.' },
      { factor: 'High-Confidence Facial Landmark Match', category: 'FACE', points: -5, description: '96.4% biometric facial similarity confirmed.' },
      { factor: 'Multi-Document Identity Consistency', category: 'CROSS_DOC', points: -5, description: 'Passport and visa biographical records concordant.' },
    ],
    weightsUsed: { documentValidity: 25, ocrMrzConsistency: 20, tamperingEvidence: 25, faceVerification: 20, crossDocConsistency: 10 },
    recommendedAction: 'CLEAR',
    whyFlagged: ['All biometric, forensic, and deterministic checks within expected operational tolerance.'],
  },

  status: 'CLEAR',
  officerDecision: 'CLEAR',
  officerNotes: 'Routine primary inspection cleared. All automated and physical tamper checks passed.',
  officerSignature: 'OFF-9042-VERIFIED',
  auditTrail: [
    { id: 'a1', timestamp: '2026-08-28T06:45:10Z', caseId: 'TX-2026-00418', actor: 'SSB-OFF-9042', action: 'CASE_INITIALIZED', detail: 'Document ingested via Flatbed Scanner Station 04', sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
    { id: 'a2', timestamp: '2026-08-28T06:45:11Z', caseId: 'TX-2026-00418', actor: 'SYSTEM_OCR', action: 'OCR_EXTRACTION_COMPLETED', detail: 'Mean confidence 99.1%. MRZ TD3 parsed.', sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b' },
    { id: 'a3', timestamp: '2026-08-28T06:45:12Z', caseId: 'TX-2026-00418', actor: 'SYSTEM_FORENSICS', action: 'TAMPER_ANALYSIS_COMPLETED', detail: 'ELA variance 8.0 (Normal). 0 anomalies.', sha256Hash: 'f1e2d3c4b5a697887766554433221100ffeeddccbbaa99887766554433221100' },
    { id: 'a4', timestamp: '2026-08-28T06:45:13Z', caseId: 'TX-2026-00418', actor: 'SYSTEM_BIOMETRICS', action: 'FACE_VERIFICATION_COMPLETED', detail: 'Similarity score 96.4%. Landmark match.', sha256Hash: '11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff' },
    { id: 'a5', timestamp: '2026-08-28T06:45:14Z', caseId: 'TX-2026-00418', actor: 'SSB-OFF-9042', action: 'OFFICER_DECISION_SUBMITTED', detail: 'Status set to CLEAR by Inspector R. Sen', sha256Hash: 'aabbccddeeff00112233445566778899aabbccddeeff00112233445566778899' },
  ],
};

// SCENARIO 2: CONTROLLED TEXT TAMPERING (MODIFIED DATE OF BIRTH & FONT ANOMALY)
const scenario2MRZ = parseAndValidateTD3MRZ(
  'P<IND<<SHARMA<<VIKRAM<<<<<<<<<<<<<<<<<<<<<<<',
  'P8492015<3IND8804124M3208159<<<<<<<<<<<<<<<2'
);

export const SCENARIO_TEXT_TAMPERING: ScreeningCase = {
  id: 'TX-2026-00421',
  createdAt: '2026-08-28T07:12:05Z',
  completedAt: '2026-08-28T07:12:15Z',
  officerId: 'SSB-OFF-9042',
  officerName: 'Inspector R. Sen',
  station: 'ICP Raxaul (Indo-Nepal Border)',
  documentType: 'PASSPORT',
  documentImageUrl: '/samples/passport_tampered_text.svg',
  presentedFaceImageUrl: MOCK_ASSETS.genuinePortrait,
  scenarioTag: 'TEXT_TAMPERING',
  documentSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',

  imageQuality: {
    blurScore: 89,
    resolution: { width: 1920, height: 1280, dpi: 300 },
    lightingScore: 88,
    rotationAngle: -0.4,
    boundaryConfidence: 96,
    status: 'OPTIMAL',
    issues: [],
  },

  ocrFields: [
    { key: 'surname', label: 'Surname', value: 'SHARMA', confidence: 98.6, mrzMatch: true },
    { key: 'givenNames', label: 'Given Name(s)', value: 'VIKRAM', confidence: 98.2, mrzMatch: true },
    { key: 'passportNumber', label: 'Passport No.', value: 'P8492015', confidence: 97.4, mrzMatch: true },
    { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.1, mrzMatch: true },
    { key: 'dob', label: 'Date of Birth (Visual)', value: '12/04/2001', confidence: 71.3, isLowConfidence: true, mrzMatch: false },
    { key: 'gender', label: 'Sex', value: 'MALE', confidence: 99.4, mrzMatch: true },
    { key: 'expiry', label: 'Date of Expiry', value: '15/08/2032', confidence: 98.1, mrzMatch: true },
    { key: 'issuingCountry', label: 'Issuing Country', value: 'IND', confidence: 99.5, mrzMatch: true },
  ],

  mrzData: {
    ...scenario2MRZ,
    dobFormatted: '12/04/1988', // MRZ says 1988, visual was altered to 2001!
    dateOfBirth: '880412',
    dobCheckPassed: false, // Checksum mismatch flagged
  },

  ruleChecks: [
    { id: 'r1', ruleName: 'Passport Expiry Window', category: 'EXPIRY', status: 'PASS', detail: 'Document valid until 15/08/2032', isDeterministic: true },
    { id: 'r2', ruleName: 'MRZ vs Visual DOB Concordance', category: 'INTERNAL_CONSISTENCY', status: 'FAIL', detail: 'Visual Zone shows 12/04/2001 while MRZ encoded line contains 880412 (12/04/1988)', isDeterministic: true },
    { id: 'r3', ruleName: 'DOB MRZ Check Digit', category: 'CHECKSUM', status: 'FAIL', detail: 'Expected check digit does not match encoded weight sum (possible manual MRZ line scrape)', isDeterministic: true },
    { id: 'r4', ruleName: 'Passport No. Check Digit', category: 'CHECKSUM', status: 'PASS', detail: '7-3-1 calculation verified for P8492015', isDeterministic: true },
    { id: 'r5', ruleName: 'Typography Baseline & Kerning', category: 'ICAO_FORMAT', status: 'WARNING', detail: 'Font glyph mismatch on digit "0" and "1" in Date of Birth visual field. Mismatched stroke weight.', isDeterministic: true },
  ],

  tampering: {
    overallTamperScore: 86,
    photoAnomalyScore: 12,
    textManipulationScore: 94,
    stampAnomalyScore: 18,
    compressionVariance: 82,
    metadataStatus: 'EXIF_EDIT_DETECTED',
    metadataDetails: 'Software tag found in header: "Adobe Photoshop CS6 / Inverted Quantization Table"',
    regions: [
      {
        id: 'tb-1',
        x: 48,
        y: 46,
        width: 24,
        height: 8,
        label: 'TEXT MANIPULATION: DOB ALTERATION',
        severity: 'RED',
        confidence: 94.2,
        reason: 'Font weight divergence (Arial Bold vs OCR-B Standard) and high localized JPEG Error Level Analysis (ELA) compression variance. Ink density discontinuity.',
        forensicCategory: 'TEXT_MANIPULATION',
      },
      {
        id: 'tb-2',
        x: 35,
        y: 84,
        width: 32,
        height: 6,
        label: 'MRZ CHECKSUM DISCONTINUITY',
        severity: 'ORANGE',
        confidence: 88.7,
        reason: 'Physical abrasive erasure marks detected under optical band illumination in MRZ Line 2 char positions 13-20.',
        forensicCategory: 'EDGE_DISCONTINUITY',
      },
    ],
    summary: 'Localized digital text splice in Date of Birth visual box and mechanical alteration of MRZ Line 2. Severe anomaly score 86/100.',
  },

  faceVerification: {
    documentFaceUrl: MOCK_ASSETS.genuinePortrait,
    presentedFaceUrl: MOCK_ASSETS.liveTravelerArun,
    similarityScore: 92.1,
    livenessScore: 98.4,
    matchStatus: 'MATCH',
    landmarkConfidence: 94.5,
    explanation: 'Facial landmarks match traveler presentation. Tampering is localized strictly to biographical age/date fields.',
    decisionSupportNote: 'Face match alone does NOT mitigate severe document physical tampering.',
  },

  crossDocument: {
    primaryDoc: { type: 'PASSPORT', number: 'P8492015', name: 'VIKRAM SHARMA', dob: '12/04/2001', nationality: 'IND' },
    secondaryDoc: { type: 'VISA', number: 'V1029384', name: 'VIKRAM SHARMA', dob: '12/04/1988', nationality: 'IND', stayDurationDays: 30, validity: '10/11/2026' },
    isConsistent: false,
    mismatchedFields: [
      { field: 'Date of Birth (DOB)', primaryValue: '12/04/2001 (Passport)', secondaryValue: '12/04/1988 (Visa Database)', severity: 'HIGH' },
    ],
    summary: 'Critical 13-year age discrepancy between presented passport visual box (2001) and visa issuance record (1988).',
  },

  risk: {
    score: 78,
    level: 'HIGH',
    factors: [
      { factor: 'Visual Tampering Evidence Detected', category: 'TAMPERING', points: 25, description: '2 suspicious anomaly regions (Text manipulation in DOB field & MRZ erasure traces).' },
      { factor: 'Deterministic Rule Validation Failure', category: 'RULES', points: 25, description: 'MRZ vs Visual DOB concordance failed + MRZ checksum mismatch.' },
      { factor: 'Cross-Document Identity Conflict', category: 'CROSS_DOC', points: 10, description: 'Date of Birth mismatch: Passport (2001) ≠ Visa (1988).' },
      { factor: 'Sub-threshold OCR Confidence', category: 'OCR', points: 12, description: 'Visual DOB font divergence reduced OCR confidence to 71.3%.' },
      { factor: 'High-Confidence Facial Landmark Match', category: 'FACE', points: -5, description: 'Facial portrait matches presenter.' },
      { factor: 'Valid Document Expiry & Number Format', category: 'RULES', points: -5, description: 'Passport number format is valid.' },
    ],
    weightsUsed: { documentValidity: 25, ocrMrzConsistency: 20, tamperingEvidence: 25, faceVerification: 20, crossDocConsistency: 10 },
    recommendedAction: 'SECONDARY_REVIEW',
    whyFlagged: [
      'Visual forensics flagged DOB field with 94.2% text alteration anomaly.',
      'MRZ encoded DOB (1988) contradicts visual field (2001).',
      'Cross-document database record mismatch with accompanying visa.',
    ],
  },

  status: 'SECONDARY_REVIEW',
  officerDecision: 'SECONDARY_REVIEW',
  officerNotes: 'Referred to Secondary Interrogation Desk 02 for physical UV lamp test and forensic microscopic inspection of DOB font overlay.',
  officerSignature: 'OFF-9042-ESCALATED',
  auditTrail: [
    { id: 'a1', timestamp: '2026-08-28T07:12:05Z', caseId: 'TX-2026-00421', actor: 'SSB-OFF-9042', action: 'CASE_INITIALIZED', detail: 'Ingested via Border Cam Scanner A3', sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
    { id: 'a2', timestamp: '2026-08-28T07:12:07Z', caseId: 'TX-2026-00421', actor: 'SYSTEM_OCR', action: 'OCR_LOW_CONFIDENCE_FLAG', detail: 'Visual DOB confidence 71.3% below threshold 85%', sha256Hash: '5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d' },
    { id: 'a3', timestamp: '2026-08-28T07:12:09Z', caseId: 'TX-2026-00421', actor: 'SYSTEM_RULES', action: 'RULE_FAILURE_DETECTED', detail: 'MRZ DOB mismatch: MRZ(1988) vs Visual(2001)', sha256Hash: '4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b' },
    { id: 'a4', timestamp: '2026-08-28T07:12:11Z', caseId: 'TX-2026-00421', actor: 'SYSTEM_FORENSICS', action: 'TAMPER_ALERT_GENERATED', detail: 'Box TB-1 (DOB) confidence 94.2%. ELA anomaly spike.', sha256Hash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b' },
    { id: 'a5', timestamp: '2026-08-28T07:12:15Z', caseId: 'TX-2026-00421', actor: 'SSB-OFF-9042', action: 'OFFICER_DECISION_SUBMITTED', detail: 'Officer selected SECONDARY REVIEW with forensic docket attachment.', sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b' },
  ],
};

// SCENARIO 3: CONTROLLED PHOTO REPLACEMENT & FACE IMPERSONATION
const scenario3MRZ = parseAndValidateTD3MRZ(
  'P<IND<<MEHTA<<ROHAN<<<<<<<<<<<<<<<<<<<<<<<<<',
  'P7654321<1IND9502206M3005128<<<<<<<<<<<<<<<4'
);

export const SCENARIO_PHOTO_REPLACEMENT: ScreeningCase = {
  id: 'TX-2026-00425',
  createdAt: '2026-08-28T07:28:40Z',
  completedAt: '2026-08-28T07:28:55Z',
  officerId: 'SSB-OFF-9042',
  officerName: 'Inspector R. Sen',
  station: 'ICP Raxaul (Indo-Nepal Border)',
  documentType: 'PASSPORT',
  documentImageUrl: '/samples/passport_tampered_photo.svg',
  presentedFaceImageUrl: MOCK_ASSETS.liveTravelerImposter,
  scenarioTag: 'PHOTO_REPLACEMENT',
  documentSha256: '7c8b1a3d9e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b',

  imageQuality: {
    blurScore: 91,
    resolution: { width: 1920, height: 1280, dpi: 300 },
    lightingScore: 90,
    rotationAngle: 0.1,
    boundaryConfidence: 97,
    status: 'OPTIMAL',
    issues: [],
  },

  ocrFields: [
    { key: 'surname', label: 'Surname', value: 'MEHTA', confidence: 99.1, mrzMatch: true },
    { key: 'givenNames', label: 'Given Name(s)', value: 'ROHAN', confidence: 98.8, mrzMatch: true },
    { key: 'passportNumber', label: 'Passport No.', value: 'P7654321', confidence: 99.2, mrzMatch: true },
    { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.6, mrzMatch: true },
    { key: 'dob', label: 'Date of Birth', value: '20/02/1995', confidence: 98.4, mrzMatch: true },
    { key: 'gender', label: 'Sex', value: 'MALE', confidence: 99.7, mrzMatch: true },
    { key: 'expiry', label: 'Date of Expiry', value: '12/05/2030', confidence: 98.9, mrzMatch: true },
    { key: 'issuingCountry', label: 'Issuing Country', value: 'IND', confidence: 99.8, mrzMatch: true },
  ],

  mrzData: scenario3MRZ,

  ruleChecks: [
    { id: 'r1', ruleName: 'Passport Expiry Window', category: 'EXPIRY', status: 'PASS', detail: 'Document valid until 12/05/2030', isDeterministic: true },
    { id: 'r2', ruleName: 'MRZ Checksums', category: 'CHECKSUM', status: 'PASS', detail: 'All line 2 check digits verified', isDeterministic: true },
    { id: 'r3', ruleName: 'Ghost Portrait vs Main Portrait Concordance', category: 'INTERNAL_CONSISTENCY', status: 'FAIL', detail: 'Secondary laser-etched ghost portrait in security window differs in facial structure from primary color portrait.', isDeterministic: true },
    { id: 'r4', ruleName: 'Security Hologram Overlay Alignment', category: 'INTERNAL_CONSISTENCY', status: 'FAIL', detail: 'National emblem holographic kinegram pattern severed across left portrait perimeter border.', isDeterministic: true },
  ],

  tampering: {
    overallTamperScore: 91,
    photoAnomalyScore: 96,
    textManipulationScore: 10,
    stampAnomalyScore: 88,
    compressionVariance: 89,
    metadataStatus: 'SOFTWARE_ALTERATION_TAG',
    metadataDetails: 'Border boundary blending matrix detected. Sharp pixel gradient at edge perimeter (x:8%, y:22%, w:28%, h:45%).',
    regions: [
      {
        id: 'tb-p1',
        x: 8,
        y: 22,
        width: 28,
        height: 48,
        label: 'PHOTO REPLACEMENT: PHYSICAL PHOTO INSERTION',
        severity: 'RED',
        confidence: 96.1,
        reason: 'Perimeter cutting blade edge artifacts, micro-embossing discontinuity across security seal, and ELA noise frequency mismatch between background and headshot.',
        forensicCategory: 'PHOTO_REPLACEMENT',
      },
      {
        id: 'tb-p2',
        x: 32,
        y: 35,
        width: 12,
        height: 18,
        label: 'EMBOSSED STAMP DISCONTINUITY',
        severity: 'ORANGE',
        confidence: 89.4,
        reason: 'Ink ring lines do not align across the photo-paper boundary (2.8mm displacement shift).',
        forensicCategory: 'STAMP_ANOMALY',
      },
    ],
    summary: 'Severe Photo Replacement Detected. The original passport photograph was chemically removed and replaced with an imposter headshot.',
  },

  faceVerification: {
    documentFaceUrl: MOCK_ASSETS.imposterPortrait,
    presentedFaceUrl: MOCK_ASSETS.liveTravelerImposter,
    similarityScore: 38.2,
    livenessScore: 98.7,
    matchStatus: 'LOW_SIMILARITY',
    landmarkConfidence: 96.0,
    explanation: 'Deep metric distance of 0.89 indicates separate biological identities. Significant divergence in nasal bridge angle, jawline perimeter, and inter-canthal distance.',
    decisionSupportNote: 'Biometric match FAILED (38.2% << 80.0% threshold). The bearer presenting the document is NOT the original registered passport holder.',
  },

  crossDocument: {
    primaryDoc: { type: 'PASSPORT', number: 'P7654321', name: 'ROHAN MEHTA', dob: '20/02/1995', nationality: 'IND' },
    secondaryDoc: { type: 'VISA', number: 'V5544332', name: 'ROHAN MEHTA', dob: '20/02/1995', nationality: 'IND', stayDurationDays: 60, validity: '20/10/2027' },
    isConsistent: true,
    mismatchedFields: [],
    summary: 'Document textual records align, but bearer biometrics fail identity match with document photo.',
  },

  risk: {
    score: 88,
    level: 'HIGH',
    factors: [
      { factor: 'Photo Replacement & Forensic Splice Traces', category: 'TAMPERING', points: 25, description: 'Photo border cutting artifacts + severed stamp lines (96.1% confidence).' },
      { factor: 'Biometric Face Mismatch / Bearer Impersonation', category: 'FACE', points: 20, description: '38.2% face similarity between presenter and document photo.' },
      { factor: 'Ghost Portrait & Hologram Discontinuity', category: 'RULES', points: 20, description: 'Laser-perforated ghost image does not match surface photo.' },
      { factor: 'Severed Security Stamp Seal', category: 'TAMPERING', points: 15, description: '2.8mm radial misalignment across boundary.' },
      { factor: 'Valid MRZ Format & Expiry', category: 'RULES', points: -5, description: 'MRZ checksums intact on genuine stolen substrate.' },
    ],
    weightsUsed: { documentValidity: 25, ocrMrzConsistency: 20, tamperingEvidence: 25, faceVerification: 20, crossDocConsistency: 10 },
    recommendedAction: 'ESCALATE',
    whyFlagged: [
      'Critical Photo Replacement forensic anomaly (96.1% confidence).',
      'Biometric comparison failed: 38.2% facial similarity (Bearer Impersonation).',
      'Severed security stamp ring and ghost portrait discrepancy.',
    ],
  },

  status: 'ESCALATED',
  officerDecision: 'ESCALATE',
  officerNotes: 'Immediate detainment requested. High-confidence photo substitution on stolen genuine passport substrate. Traveler detained at ICP Gate 03 for interrogation.',
  officerSignature: 'OFF-9042-FLAGGED-IMMEDIATE',
  auditTrail: [
    { id: 'a1', timestamp: '2026-08-28T07:28:40Z', caseId: 'TX-2026-00425', actor: 'SSB-OFF-9042', action: 'CASE_INITIALIZED', detail: 'Ingested via ICP Counter 02 High-Speed Scanner', sha256Hash: '7c8b1a3d9e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b' },
    { id: 'a2', timestamp: '2026-08-28T07:28:43Z', caseId: 'TX-2026-00425', actor: 'SYSTEM_FORENSICS', action: 'PHOTO_TAMPER_ALERT', detail: 'Photo replacement bounding box detected. Perimeter splice confidence 96.1%', sha256Hash: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b7c8b1a3d9e2f4a5b6c7d8e9f0a1b2c' },
    { id: 'a3', timestamp: '2026-08-28T07:28:47Z', caseId: 'TX-2026-00425', actor: 'SYSTEM_BIOMETRICS', action: 'BIOMETRIC_FAIL_ALERT', detail: 'Face similarity 38.2% << threshold 80.0%. Bearer impersonation.', sha256Hash: '2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b7c8b1a3d9e' },
    { id: 'a4', timestamp: '2026-08-28T07:28:51Z', caseId: 'TX-2026-00425', actor: 'SYSTEM_RISK_ENGINE', action: 'HIGH_RISK_ASSESSED', detail: 'Risk score 88/100 (HIGH). Recommendation: ESCALATE.', sha256Hash: '0e1f2a3b4c5d6e7f8a9b7c8b1a3d9e2f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d' },
    { id: 'a5', timestamp: '2026-08-28T07:28:55Z', caseId: 'TX-2026-00425', actor: 'SSB-OFF-9042', action: 'OFFICER_ESCALATION_SUBMITTED', detail: 'Officer confirmed ESCALATE. Alert transmitted to Supervisory Desk.', sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b' },
  ],
};

// SCENARIO 4: CROSS-DOCUMENT INCONSISTENCY (Passport vs Visa Mismatch)
const scenario4MRZ = parseAndValidateTD3MRZ(
  'P<IND<<SHARMA<<PRIYA<<<<<<<<<<<<<<<<<<<<<<<<',
  'P3920194<4IND0504128F3504112<<<<<<<<<<<<<<<6'
);

export const SCENARIO_CROSS_DOC_MISMATCH: ScreeningCase = {
  id: 'TX-2026-00429',
  createdAt: '2026-08-28T07:35:12Z',
  completedAt: '2026-08-28T07:35:25Z',
  officerId: 'SSB-OFF-9042',
  officerName: 'Inspector R. Sen',
  station: 'ICP Raxaul (Indo-Nepal Border)',
  documentType: 'PASSPORT',
  documentImageUrl: '/samples/passport_cross_doc.svg',
  presentedFaceImageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
  scenarioTag: 'CROSS_DOC_MISMATCH',
  documentSha256: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c',

  imageQuality: {
    blurScore: 92,
    resolution: { width: 1920, height: 1280, dpi: 300 },
    lightingScore: 91,
    rotationAngle: 0.0,
    boundaryConfidence: 99,
    status: 'OPTIMAL',
    issues: [],
  },

  ocrFields: [
    { key: 'surname', label: 'Surname', value: 'SHARMA', confidence: 99.2, mrzMatch: true },
    { key: 'givenNames', label: 'Given Name(s)', value: 'PRIYA', confidence: 99.0, mrzMatch: true },
    { key: 'passportNumber', label: 'Passport No.', value: 'P3920194', confidence: 99.4, mrzMatch: true },
    { key: 'nationality', label: 'Nationality', value: 'IND', confidence: 99.7, mrzMatch: true },
    { key: 'dob', label: 'Date of Birth', value: '12/04/2005', confidence: 98.9, mrzMatch: true },
    { key: 'gender', label: 'Sex', value: 'FEMALE', confidence: 99.8, mrzMatch: true },
    { key: 'expiry', label: 'Date of Expiry', value: '11/04/2035', confidence: 99.1, mrzMatch: true },
    { key: 'issuingCountry', label: 'Issuing Country', value: 'IND', confidence: 99.9, mrzMatch: true },
  ],

  mrzData: scenario4MRZ,

  ruleChecks: [
    { id: 'r1', ruleName: 'Passport Expiry Window', category: 'EXPIRY', status: 'PASS', detail: 'Document valid until 11/04/2035', isDeterministic: true },
    { id: 'r2', ruleName: 'Passport MRZ Checksums', category: 'CHECKSUM', status: 'PASS', detail: 'All checksums pass 7-3-1 weight test', isDeterministic: true },
    { id: 'r3', ruleName: 'Cross-Document Identity Consistency', category: 'INTERNAL_CONSISTENCY', status: 'FAIL', detail: 'Discrepancy found between Passport (DOB: 12/04/2005, Name: PRIYA SHARMA) and Visa (DOB: 12/04/1995, Name: PRIYA R. SHARMA)', isDeterministic: true },
    { id: 'r4', ruleName: 'Visa Entry Validity Window', category: 'VISA_VALIDITY', status: 'WARNING', detail: 'Visa stay duration (180 days) exceeds permitted tourist category maximum (90 days)', isDeterministic: true },
  ],

  tampering: {
    overallTamperScore: 14,
    photoAnomalyScore: 8,
    textManipulationScore: 12,
    stampAnomalyScore: 9,
    compressionVariance: 11,
    metadataStatus: 'CLEAN',
    regions: [],
    summary: 'Physical document substrate appears authentic, but cross-referencing against the electronic visa database reveals major biographical conflict.',
  },

  faceVerification: {
    documentFaceUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    presentedFaceUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    similarityScore: 95.8,
    livenessScore: 99.0,
    matchStatus: 'MATCH',
    landmarkConfidence: 97.4,
    explanation: 'Facial landmarks match traveler presentation. Biometrics concordant.',
    decisionSupportNote: 'Face match verified. However, cross-document identity divergence requires mandatory investigation.',
  },

  crossDocument: {
    primaryDoc: { type: 'PASSPORT', number: 'P3920194', name: 'PRIYA SHARMA', dob: '12/04/2005', nationality: 'IND' },
    secondaryDoc: { type: 'VISA', number: 'V6677889', name: 'PRIYA R. SHARMA', dob: '12/04/1995', nationality: 'IND', stayDurationDays: 180, validity: '15/12/2026' },
    isConsistent: false,
    mismatchedFields: [
      { field: 'Date of Birth (DOB)', primaryValue: '12/04/2005 (Passport)', secondaryValue: '12/04/1995 (Visa e-Record)', severity: 'HIGH' },
      { field: 'Given Name Format', primaryValue: 'PRIYA', secondaryValue: 'PRIYA R.', severity: 'MEDIUM' },
      { field: 'Visa Stay Window', primaryValue: '90 Days Standard', secondaryValue: '180 Days Over-claim', severity: 'MEDIUM' },
    ],
    summary: 'Direct biographical conflict: Passport records date of birth as 2005 (Age 21), while Visa application record indicates 1995 (Age 31).',
  },

  risk: {
    score: 72,
    level: 'HIGH',
    factors: [
      { factor: 'Cross-Document Identity Conflict', category: 'CROSS_DOC', points: 25, description: '10-year DOB divergence between Passport (2005) and Visa (1995).' },
      { factor: 'Visa Category Overstay Risk / Rule Warning', category: 'RULES', points: 15, description: 'Visa duration inconsistent with tourist clearance category.' },
      { factor: 'Clean Document Surface & ELA Forensics', category: 'TAMPERING', points: -5, description: 'Physical passport page exhibits zero structural splice anomalies.' },
      { factor: 'High-Confidence Facial Landmark Match', category: 'FACE', points: -5, description: '95.8% biometric similarity confirmed.' },
    ],
    weightsUsed: { documentValidity: 25, ocrMrzConsistency: 20, tamperingEvidence: 25, faceVerification: 20, crossDocConsistency: 10 },
    recommendedAction: 'SECONDARY_REVIEW',
    whyFlagged: [
      'Cross-document database conflict: 10-year discrepancy in Date of Birth (2005 vs 1995).',
      'Name variance: PRIYA SHARMA vs PRIYA R. SHARMA in linked Visa record.',
      'Visa stay duration warning flagged for consular verification.',
    ],
  },

  status: 'SECONDARY_REVIEW',
  officerDecision: 'SECONDARY_REVIEW',
  officerNotes: 'Case referred for Visa Consular record verification to resolve 10-year date-of-birth discrepancy.',
  officerSignature: 'OFF-9042-HOLD',
  auditTrail: [
    { id: 'a1', timestamp: '2026-08-28T07:35:12Z', caseId: 'TX-2026-00429', actor: 'SSB-OFF-9042', action: 'CASE_INITIALIZED', detail: 'Ingested via Multi-Doc Scanner ICP-04', sha256Hash: '4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c' },
    { id: 'a2', timestamp: '2026-08-28T07:35:16Z', caseId: 'TX-2026-00429', actor: 'SYSTEM_CONSISTENCY', action: 'CROSS_DOC_MISMATCH_DETECTED', detail: 'DOB conflict: Passport(12/04/2005) vs Visa(12/04/1995)', sha256Hash: '6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e' },
    { id: 'a3', timestamp: '2026-08-28T07:35:20Z', caseId: 'TX-2026-00429', actor: 'SYSTEM_RISK_ENGINE', action: 'RISK_ASSESSMENT_COMPLETED', detail: 'Risk score 72/100 (HIGH). Recommendation: SECONDARY_REVIEW', sha256Hash: '7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6b' },
    { id: 'a4', timestamp: '2026-08-28T07:35:25Z', caseId: 'TX-2026-00429', actor: 'SSB-OFF-9042', action: 'OFFICER_DECISION_SUBMITTED', detail: 'Officer marked SECONDARY REVIEW for Consular cross-check.', sha256Hash: '0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e' },
  ],
};

export const INITIAL_CASES: ScreeningCase[] = [
  SCENARIO_GENUINE,
  SCENARIO_TEXT_TAMPERING,
  SCENARIO_PHOTO_REPLACEMENT,
  SCENARIO_CROSS_DOC_MISMATCH,
];
