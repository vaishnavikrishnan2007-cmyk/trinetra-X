import { ScreeningCase, AuditEvent, SystemSettings, Officer } from '../types';
import { INITIAL_CASES } from '../data/mockScenarios';

const STORAGE_KEYS = {
  CASES: 'trinetrax_cases',
  OFFLINE_QUEUE: 'trinetrax_offline_queue',
  AUDIT_LOG: 'trinetrax_audit_log',
  SETTINGS: 'trinetrax_settings',
  OFFICER: 'trinetrax_officer',
  OFFLINE_MODE_SIMULATED: 'trinetrax_offline_simulated',
};

export const DEFAULT_OFFICER: Officer = {
  id: 'SSB-OFF-9042',
  name: 'Inspector R. Sen',
  badgeNumber: 'SSB-II-4921',
  role: 'BORDER_OFFICER',
  station: 'ICP Raxaul (Indo-Nepal Border)',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
};

export const DEFAULT_SETTINGS: SystemSettings = {
  language: 'en-IN',
  theme: 'dark',
  processingMode: 'HYBRID_AI_RULES',
  offlineModeActive: false,
  autoSyncWhenOnline: true,
  riskWeights: {
    documentValidity: 25,
    ocrMrzConsistency: 20,
    tamperingEvidence: 25,
    faceVerification: 20,
    crossDocConsistency: 10,
  },
  thresholds: {
    highRiskCutoff: 65,
    mediumRiskCutoff: 35,
    faceSimilarityThreshold: 80,
    ocrConfidenceThreshold: 85,
  },
  checkpointStation: 'ICP Raxaul (Indo-Nepal Border)',
};

export class StorageService {
  static getCases(): ScreeningCase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASES);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
        return INITIAL_CASES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_CASES;
    }
  }

  static saveCase(newCase: ScreeningCase): void {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === newCase.id);
    if (index >= 0) {
      cases[index] = newCase;
    } else {
      cases.unshift(newCase);
    }
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));

    // Also record an audit event for this save
    this.addAuditEvent({
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      caseId: newCase.id,
      actor: newCase.officerId || DEFAULT_OFFICER.id,
      action: newCase.officerDecision ? `DECISION_${newCase.officerDecision}` : 'CASE_RECORDED',
      detail: `Case ${newCase.id} (${newCase.documentType}) saved with status ${newCase.status}, risk ${newCase.risk.score}/100.`,
      sha256Hash: newCase.documentSha256 || 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
    });
  }

  static getCaseById(id: string): ScreeningCase | undefined {
    const cases = this.getCases();
    return cases.find(c => c.id === id);
  }

  static getOfflineQueue(): ScreeningCase[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addToOfflineQueue(caseData: ScreeningCase): void {
    const queue = this.getOfflineQueue();
    queue.push({ ...caseData, isOfflineCreated: true, isSynced: false });
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    
    // Also save into local cases store
    this.saveCase({ ...caseData, isOfflineCreated: true, isSynced: false });
  }

  static clearOfflineQueue(): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
  }

  static syncOfflineQueue(): { syncedCount: number; syncedCases: ScreeningCase[] } {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { syncedCount: 0, syncedCases: [] };

    const cases = this.getCases();
    const syncedCases: ScreeningCase[] = [];
    const now = new Date().toISOString();

    for (const qCase of queue) {
      const updatedCase: ScreeningCase = {
        ...qCase,
        isSynced: true,
        syncedAt: now,
      };
      const idx = cases.findIndex(c => c.id === qCase.id);
      if (idx >= 0) {
        cases[idx] = updatedCase;
      } else {
        cases.unshift(updatedCase);
      }
      syncedCases.push(updatedCase);

      this.addAuditEvent({
        id: `audit-sync-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        caseId: qCase.id,
        actor: 'OFFLINE_SYNC_DAEMON',
        action: 'OFFLINE_CASE_SYNCHRONIZED',
        detail: `Queued offline case ${qCase.id} successfully synced to central SSB node with SHA-256 hash validation.`,
        sha256Hash: qCase.documentSha256,
      });
    }

    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.clearOfflineQueue();

    return { syncedCount: syncedCases.length, syncedCases };
  }

  static getAuditLogs(): AuditEvent[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOG);
      if (!data) {
        // Collect audit trail from initial cases
        const initLogs: AuditEvent[] = [];
        INITIAL_CASES.forEach(c => {
          if (c.auditTrail) initLogs.push(...c.auditTrail);
        });
        localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(initLogs));
        return initLogs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  static addAuditEvent(event: AuditEvent): void {
    const logs = this.getAuditLogs();
    logs.unshift(event);
    // Keep last 300 logs
    if (logs.length > 300) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOG, JSON.stringify(logs));
  }

  static getSettings(): SystemSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: SystemSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  static getOfficer(): Officer {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OFFICER);
      return data ? JSON.parse(data) : DEFAULT_OFFICER;
    } catch {
      return DEFAULT_OFFICER;
    }
  }

  static saveOfficer(officer: Officer): void {
    localStorage.setItem(STORAGE_KEYS.OFFICER, JSON.stringify(officer));
  }

  static isOfflineSimulated(): boolean {
    return localStorage.getItem(STORAGE_KEYS.OFFLINE_MODE_SIMULATED) === 'true';
  }

  static setOfflineSimulated(active: boolean): void {
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_SIMULATED, active ? 'true' : 'false');
  }

  static resetToDemoState(): void {
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    localStorage.setItem(STORAGE_KEYS.OFFICER, JSON.stringify(DEFAULT_OFFICER));
    localStorage.setItem(STORAGE_KEYS.OFFLINE_MODE_SIMULATED, 'false');
  }
}
