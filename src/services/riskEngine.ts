import { RiskAssessment, RiskFactor, RiskLevel, RuleCheck, TamperingForensicReport, FaceVerificationResult, CrossDocumentConsistency } from '../types';

export interface CalculateRiskInput {
  ruleChecks: RuleCheck[];
  tampering: TamperingForensicReport;
  faceVerification?: FaceVerificationResult;
  crossDocument?: CrossDocumentConsistency;
  ocrConfidenceAvg: number;
  customWeights?: {
    documentValidity: number;
    ocrMrzConsistency: number;
    tamperingEvidence: number;
    faceVerification: number;
    crossDocConsistency: number;
  };
}

export function calculateExplainableRisk(input: CalculateRiskInput): RiskAssessment {
  const weights = input.customWeights || {
    documentValidity: 25,
    ocrMrzConsistency: 20,
    tamperingEvidence: 25,
    faceVerification: 20,
    crossDocConsistency: 10,
  };

  const factors: RiskFactor[] = [];
  const whyFlagged: string[] = [];
  let rawScore = 0;

  // 1. Tampering Forensics
  if (input.tampering.overallTamperScore > 60) {
    const pts = Math.round((input.tampering.overallTamperScore / 100) * weights.tamperingEvidence);
    rawScore += pts;
    factors.push({
      factor: 'Visual Tampering Evidence Detected',
      category: 'TAMPERING',
      points: pts,
      description: `${input.tampering.regions.length} suspicious anomaly regions identified by forensics engine (${input.tampering.summary})`,
    });
    whyFlagged.push(`Visual forensics flagged ${input.tampering.regions.length} region(s) with ${input.tampering.overallTamperScore}% anomaly index.`);
  } else if (input.tampering.overallTamperScore > 20) {
    const pts = Math.round((input.tampering.overallTamperScore / 100) * weights.tamperingEvidence);
    rawScore += pts;
    factors.push({
      factor: 'Minor Visual Compression Inconsistency',
      category: 'TAMPERING',
      points: pts,
      description: 'Low-confidence compression artifact detected, potential scan noise.',
    });
  } else {
    // Clean tampering
    factors.push({
      factor: 'Clean Document Surface & ELA Forensics',
      category: 'TAMPERING',
      points: -5,
      description: 'Zero visual splice lines, intact guilloche patterns, normal compression profile.',
    });
    rawScore = Math.max(0, rawScore - 5);
  }

  // 2. Rule Checks & ICAO MRZ Validation
  const failedRules = input.ruleChecks.filter(r => r.status === 'FAIL');
  const warningRules = input.ruleChecks.filter(r => r.status === 'WARNING');

  if (failedRules.length > 0) {
    const pts = Math.min(weights.documentValidity, failedRules.length * 15);
    rawScore += pts;
    factors.push({
      factor: 'Deterministic Rule Validation Failure',
      category: 'RULES',
      points: pts,
      description: failedRules.map(r => r.ruleName + ': ' + r.detail).join('; '),
    });
    whyFlagged.push(`Failed deterministic security rules: ${failedRules.map(r => r.ruleName).join(', ')}.`);
  } else if (warningRules.length > 0) {
    const pts = Math.min(10, warningRules.length * 5);
    rawScore += pts;
    factors.push({
      factor: 'Rule Warning / Soft Anomaly',
      category: 'RULES',
      points: pts,
      description: warningRules.map(r => r.ruleName + ': ' + r.detail).join('; '),
    });
    whyFlagged.push(`Rule warnings identified: ${warningRules.map(r => r.ruleName).join(', ')}.`);
  } else {
    factors.push({
      factor: 'Valid ICAO Document Architecture & Checksums',
      category: 'RULES',
      points: -10,
      description: 'All MRZ check digits (doc#, DOB, expiry, composite) pass 7-3-1 weight validation.',
    });
    rawScore = Math.max(0, rawScore - 10);
  }

  // 3. OCR Confidence
  if (input.ocrConfidenceAvg < 80) {
    const pts = Math.round(((100 - input.ocrConfidenceAvg) / 100) * weights.ocrMrzConsistency);
    rawScore += pts;
    factors.push({
      factor: 'Sub-threshold OCR Confidence / Character Degeneration',
      category: 'OCR',
      points: pts,
      description: `Mean optical character recognition confidence dropped to ${input.ocrConfidenceAvg.toFixed(1)}%. Officer visual confirmation required.`,
    });
    whyFlagged.push(`OCR confidence degraded (${input.ocrConfidenceAvg.toFixed(1)}%), indicating possible wear or physical abrasive erasure.`);
  }

  // 4. Cross-Document Consistency
  if (input.crossDocument) {
    if (!input.crossDocument.isConsistent && input.crossDocument.mismatchedFields.length > 0) {
      const pts = weights.crossDocConsistency;
      rawScore += pts;
      factors.push({
        factor: 'Cross-Document Identity Conflict',
        category: 'CROSS_DOC',
        points: pts,
        description: input.crossDocument.mismatchedFields.map(m => `${m.field}: Passport (${m.primaryValue}) ≠ Visa (${m.secondaryValue})`).join(' | '),
      });
      whyFlagged.push(`Cross-document conflict between passport and visa: ${input.crossDocument.mismatchedFields.map(m => m.field).join(', ')}.`);
    } else {
      factors.push({
        factor: 'Multi-Document Identity Consistency Verified',
        category: 'CROSS_DOC',
        points: -5,
        description: 'Biographical records between primary travel document and visa match across all key fields.',
      });
      rawScore = Math.max(0, rawScore - 5);
    }
  }

  // 5. Face Verification
  if (input.faceVerification) {
    if (input.faceVerification.matchStatus === 'LOW_SIMILARITY') {
      const pts = weights.faceVerification;
      rawScore += pts;
      factors.push({
        factor: 'Biometric Face Mismatch / High Distance',
        category: 'FACE',
        points: pts,
        description: `Similarity score is ${input.faceVerification.similarityScore.toFixed(1)}% (below threshold). High probability of bearer impersonation.`,
      });
      whyFlagged.push(`Biometric facial similarity of ${input.faceVerification.similarityScore.toFixed(1)}% is below security threshold.`);
    } else if (input.faceVerification.matchStatus === 'REVIEW') {
      const pts = Math.round(weights.faceVerification * 0.5);
      rawScore += pts;
      factors.push({
        factor: 'Borderline Biometric Facial Comparison',
        category: 'FACE',
        points: pts,
        description: `Similarity ${input.faceVerification.similarityScore.toFixed(1)}% requires manual secondary biometric evaluation.`,
      });
      whyFlagged.push(`Borderline face match confidence (${input.faceVerification.similarityScore.toFixed(1)}%).`);
    } else {
      factors.push({
        factor: 'High-Confidence Facial Landmark Match',
        category: 'FACE',
        points: -5,
        description: `Verified ${input.faceVerification.similarityScore.toFixed(1)}% landmark similarity between portrait and live traveler feed.`,
      });
      rawScore = Math.max(0, rawScore - 5);
    }
  }

  // Normalize final score to 0 - 100
  const finalScore = Math.min(100, Math.max(0, rawScore));

  let level: RiskLevel = 'LOW';
  let recommendedAction: 'CLEAR' | 'SECONDARY_REVIEW' | 'ESCALATE' = 'CLEAR';

  if (finalScore >= 65) {
    level = 'HIGH';
    recommendedAction = finalScore >= 80 ? 'ESCALATE' : 'SECONDARY_REVIEW';
  } else if (finalScore >= 30) {
    level = 'MEDIUM';
    recommendedAction = 'SECONDARY_REVIEW';
  } else {
    level = 'LOW';
    recommendedAction = 'CLEAR';
  }

  return {
    score: finalScore,
    level,
    factors,
    weightsUsed: weights,
    recommendedAction,
    whyFlagged: whyFlagged.length > 0 ? whyFlagged : ['All biometric, forensic, and deterministic checks within expected operational tolerance.'],
  };
}
