import React, { useState, useEffect } from 'react';
import { Officer, ScreeningCase, SystemSettings, AuditEvent } from './types';
import { StorageService, DEFAULT_OFFICER, DEFAULT_SETTINGS } from './services/storageService';
import { SCENARIO_GENUINE, SCENARIO_TEXT_TAMPERING, SCENARIO_PHOTO_REPLACEMENT, SCENARIO_CROSS_DOC_MISMATCH } from './data/mockScenarios';
import { Header } from './components/Header';
import { SplashScreen } from './components/SplashScreen';
import { LoginScreen } from './components/LoginScreen';
import { Dashboard } from './components/Dashboard';
import { NewScreening } from './components/NewScreening';
import { ScreeningWorkflow } from './components/ScreeningPipeline/ScreeningWorkflow';
import { CasesList } from './components/CasesList';
import { AnalyticsScreen } from './components/AnalyticsScreen';
import { OfflineQueueScreen } from './components/OfflineQueueScreen';
import { SecurityAuditScreen } from './components/SecurityAuditScreen';
import { ProfileSettings } from './components/ProfileSettings';
import { EvidenceReplayModal } from './components/EvidenceReplayModal';
import { ArchitectureDiagramModal } from './components/ArchitectureDiagramModal';
import { JudgeDemoModal } from './components/JudgeDemoModal';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const [officer, setOfficer] = useState<Officer>(DEFAULT_OFFICER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [cases, setCases] = useState<ScreeningCase[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<ScreeningCase[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEvent[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  // Active screening & modals state
  const [activePipelineCase, setActivePipelineCase] = useState<ScreeningCase | null>(null);
  const [replayCaseData, setReplayCaseData] = useState<ScreeningCase | null>(null);
  const [showJudgeDemoModal, setShowJudgeDemoModal] = useState<boolean>(false);
  const [showArchitectureModal, setShowArchitectureModal] = useState<boolean>(false);

  // Initialize data on mount
  useEffect(() => {
    const loadedCases = StorageService.getCases();
    const loadedQueue = StorageService.getOfflineQueue();
    const loadedAudit = StorageService.getAuditLogs();
    const loadedSettings = StorageService.getSettings();
    const loadedOfficer = StorageService.getOfficer();
    const isSimOffline = StorageService.isOfflineSimulated();

    setCases(loadedCases);
    setOfflineQueue(loadedQueue);
    setAuditLogs(loadedAudit);
    setSettings(loadedSettings);
    setOfficer(loadedOfficer);
    setIsOffline(isSimOffline);
  }, []);

  const handleLogin = (loggedOfficer: Officer) => {
    setOfficer(loggedOfficer);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    StorageService.addAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      caseId: 'AUTH_SESSION',
      actor: loggedOfficer.id,
      action: 'OFFICER_SESSION_AUTHENTICATED',
      detail: `Officer ${loggedOfficer.name} (${loggedOfficer.badgeNumber}) logged into terminal at ${loggedOfficer.station}.`,
      sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const handleToggleOffline = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
    StorageService.setOfflineSimulated(nextState);
    StorageService.addAuditEvent({
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      caseId: 'NETWORK_STATE',
      actor: officer.id,
      action: nextState ? 'NETWORK_OFFLINE_SIMULATION_ACTIVATED' : 'NETWORK_ONLINE_RESTORED',
      detail: nextState
        ? 'Edge disconnected mode active: Local models and offline caching engaged.'
        : 'Network connection restored. Sync pipeline ready.',
      sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    });
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSaveCase = (updatedCase: ScreeningCase) => {
    if (isOffline) {
      StorageService.addToOfflineQueue(updatedCase);
      setOfflineQueue(StorageService.getOfflineQueue());
    } else {
      StorageService.saveCase(updatedCase);
    }
    setCases(StorageService.getCases());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleSyncOffline = () => {
    const result = StorageService.syncOfflineQueue();
    setOfflineQueue([]);
    setCases(StorageService.getCases());
    setAuditLogs(StorageService.getAuditLogs());
    return result;
  };

  const handleStartNewScreening = () => {
    setCurrentScreen('new_screening');
  };

  const handleStartPipeline = (caseData: ScreeningCase) => {
    setActivePipelineCase(caseData);
    setCurrentScreen('screening_pipeline');
  };

  const handleSelectCase = (caseId: string) => {
    const found = cases.find(c => c.id === caseId) || StorageService.getCaseById(caseId);
    if (found) {
      setActivePipelineCase(found);
      setCurrentScreen('screening_pipeline');
    }
  };

  const handleReplayCase = (caseId: string) => {
    const found = cases.find(c => c.id === caseId) || StorageService.getCaseById(caseId);
    if (found) {
      setReplayCaseData(found);
    }
  };

  const handleLaunchScenarioFromDemo = (scenarioTag: 'GENUINE' | 'TEXT_TAMPERING' | 'PHOTO_REPLACEMENT' | 'CROSS_DOC_MISMATCH') => {
    let targetCase: ScreeningCase;
    if (scenarioTag === 'GENUINE') targetCase = JSON.parse(JSON.stringify(SCENARIO_GENUINE));
    else if (scenarioTag === 'TEXT_TAMPERING') targetCase = JSON.parse(JSON.stringify(SCENARIO_TEXT_TAMPERING));
    else if (scenarioTag === 'PHOTO_REPLACEMENT') targetCase = JSON.parse(JSON.stringify(SCENARIO_PHOTO_REPLACEMENT));
    else targetCase = JSON.parse(JSON.stringify(SCENARIO_CROSS_DOC_MISMATCH));

    targetCase.id = `TX-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    targetCase.createdAt = new Date().toISOString();
    delete targetCase.officerDecision;

    if (!isAuthenticated) {
      setIsAuthenticated(true);
    }
    handleStartPipeline(targetCase);
  };

  const handleResetDemoData = () => {
    StorageService.resetToDemoState();
    setCases(StorageService.getCases());
    setOfflineQueue(StorageService.getOfflineQueue());
    setAuditLogs(StorageService.getAuditLogs());
    setSettings(DEFAULT_SETTINGS);
    setOfficer(DEFAULT_OFFICER);
    setIsOffline(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 1. Splash Screen */}
      {currentScreen === 'splash' && (
        <SplashScreen onComplete={() => setCurrentScreen('login')} />
      )}

      {/* 2. Login Screen */}
      {currentScreen === 'login' && (
        <LoginScreen
          onLogin={handleLogin}
          onStartJudgeDemo={() => setShowJudgeDemoModal(true)}
        />
      )}

      {/* 3. Main Authenticated Application Area */}
      {currentScreen !== 'splash' && currentScreen !== 'login' && (
        <>
          <Header
            currentScreen={currentScreen}
            onNavigate={(screen) => {
              if (screen === 'new_screening') handleStartNewScreening();
              else setCurrentScreen(screen);
            }}
            officer={officer}
            onLogout={handleLogout}
            isOffline={isOffline}
            onToggleOffline={handleToggleOffline}
            offlineQueueCount={offlineQueue.length}
            onStartJudgeDemo={() => setShowJudgeDemoModal(true)}
            onOpenArchitecture={() => setShowArchitectureModal(true)}
          />

          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
            {currentScreen === 'dashboard' && (
              <Dashboard
                cases={cases}
                onStartNewScreening={handleStartNewScreening}
                onSelectCase={handleSelectCase}
                onReplayCase={handleReplayCase}
                onStartJudgeDemo={() => setShowJudgeDemoModal(true)}
                isOffline={isOffline}
                offlineQueueCount={offlineQueue.length}
                onSyncOffline={handleSyncOffline}
              />
            )}

            {currentScreen === 'new_screening' && (
              <NewScreening
                onStartPipeline={handleStartPipeline}
                onCancel={() => setCurrentScreen('dashboard')}
                isOffline={isOffline}
              />
            )}

            {currentScreen === 'screening_pipeline' && activePipelineCase && (
              <ScreeningWorkflow
                initialCase={activePipelineCase}
                onSaveCase={handleSaveCase}
                onBackToDashboard={() => setCurrentScreen('dashboard')}
                onOpenReplay={handleReplayCase}
                isOffline={isOffline}
              />
            )}

            {currentScreen === 'cases' && (
              <CasesList
                cases={cases}
                onSelectCase={handleSelectCase}
                onReplayCase={handleReplayCase}
              />
            )}

            {currentScreen === 'analytics' && (
              <AnalyticsScreen cases={cases} />
            )}

            {currentScreen === 'offline_queue' && (
              <OfflineQueueScreen
                queue={offlineQueue}
                isOffline={isOffline}
                onToggleOffline={handleToggleOffline}
                onSync={handleSyncOffline}
                onSelectCase={handleSelectCase}
              />
            )}

            {currentScreen === 'security_audit' && (
              <SecurityAuditScreen auditLogs={auditLogs} />
            )}

            {currentScreen === 'profile_settings' && (
              <ProfileSettings
                officer={officer}
                onUpdateOfficer={setOfficer}
                settings={settings}
                onUpdateSettings={setSettings}
                onResetDemo={handleResetDemoData}
              />
            )}
          </main>
        </>
      )}

      {/* MODALS */}
      {/* Evidence Replay Modal */}
      {replayCaseData && (
        <EvidenceReplayModal
          caseData={replayCaseData}
          onClose={() => setReplayCaseData(null)}
        />
      )}

      {/* Architecture & Moat Modal */}
      {showArchitectureModal && (
        <ArchitectureDiagramModal
          onClose={() => setShowArchitectureModal(false)}
        />
      )}

      {/* SIH Judge Demo Modal */}
      {showJudgeDemoModal && (
        <JudgeDemoModal
          onClose={() => setShowJudgeDemoModal(false)}
          onSelectScenario={handleLaunchScenarioFromDemo}
          onToggleOffline={handleToggleOffline}
          isOffline={isOffline}
          onOpenReplay={handleReplayCase}
        />
      )}
    </div>
  );
}
