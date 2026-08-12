import React, { useState } from 'react';
import { ActiveTab } from './types';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { RoomPlannerStudio } from './components/RoomPlannerStudio';
import { CabinetStudio } from './components/CabinetStudio';
import { MurphyBedStudio } from './components/MurphyBedStudio';
import { ProcurementStudio } from './components/ProcurementStudio';
import { StandardPartsStudio } from './components/StandardPartsStudio';
import { HardwareStudio } from './components/HardwareStudio';
import { CncLatheStudio } from './components/CncLatheStudio';
import { VoiceCadAssistant } from './components/VoiceCadAssistant';
import { StepByStepWizard } from './components/StepByStepWizard';
import { ManualKB } from './components/ManualKB';
import { MacroGuideStudio } from './components/MacroGuideStudio';
import { SolidWorksLinkModal } from './components/SolidWorksLinkModal';
import { AiAssistant } from './components/AiAssistant';
import { NestingStudio } from './components/NestingStudio';
import { LaserCncStudio } from './components/LaserCncStudio';
import { SavedScenariosModal } from './components/SavedScenariosModal';
import { getAutosaveState } from './utils/scenarioStorage';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSwConnected, setIsSwConnected] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  // Scenario Management Modal State
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [loadedScenarioState, setLoadedScenarioState] = useState<{
    tab: ActiveTab;
    data: any;
    key: number;
  } | null>(null);

  const handleConnectSw = () => {
    setIsSwConnected(true);
    setShowNotification('اتصال با موفقیت به SolidWorks COM API برقرار گردید!');
    setTimeout(() => setShowNotification(null), 4000);
  };

  const handleLoadScenario = (targetTab: ActiveTab, data: any) => {
    setLoadedScenarioState({ tab: targetTab, data, key: Date.now() });
    setActiveTab(targetTab);
    setShowNotification(`سناریوی جدید در بخش "${targetTab}" بارگذاری گردید.`);
    setTimeout(() => setShowNotification(null), 3500);
  };

  // Helper to extract active tab data for saving
  const getCurrentTabData = () => {
    if (loadedScenarioState?.tab === activeTab) {
      return loadedScenarioState.data;
    }
    const autosaved = getAutosaveState<any>(activeTab);
    return autosaved?.data || null;
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1e293b] font-sans dir-rtl text-right antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSwConnected={isSwConnected}
        onConnectSw={handleConnectSw}
        onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
      />

      {/* Notification Toast */}
      {showNotification && (
        <div className="fixed bottom-5 left-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-400 animate-bounce">
          <span>✅</span>
          {showNotification}
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {activeTab === 'dashboard' && (
          <Dashboard
            setActiveTab={setActiveTab}
            isSwConnected={isSwConnected}
            onConnectSw={handleConnectSw}
          />
        )}

        {activeTab === 'room_planner' && (
          <RoomPlannerStudio
            key={loadedScenarioState?.tab === 'room_planner' ? loadedScenarioState.key : 'rp-default'}
            initialParams={loadedScenarioState?.tab === 'room_planner' ? loadedScenarioState.data : undefined}
            onOpenShoppingList={() => setActiveTab('procurement')}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
            onOpenSwModal={() => setActiveTab('solidworks_link')}
          />
        )}

        {activeTab === 'cabinet' && (
          <CabinetStudio
            key={loadedScenarioState?.tab === 'cabinet' ? loadedScenarioState.key : 'cab-default'}
            initialParams={loadedScenarioState?.tab === 'cabinet' ? loadedScenarioState.data : undefined}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeTab === 'murphy_bed' && (
          <MurphyBedStudio
            key={loadedScenarioState?.tab === 'murphy_bed' ? loadedScenarioState.key : 'mb-default'}
            initialParams={loadedScenarioState?.tab === 'murphy_bed' ? loadedScenarioState.data : undefined}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeTab === 'nesting' && (
          <NestingStudio
            key={loadedScenarioState?.tab === 'nesting' ? loadedScenarioState.key : 'nest-default'}
            initialParams={loadedScenarioState?.tab === 'nesting' ? loadedScenarioState.data : undefined}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeTab === 'laser_cnc' && (
          <LaserCncStudio
            key={loadedScenarioState?.tab === 'laser_cnc' ? loadedScenarioState.key : 'laser-default'}
            initialParams={loadedScenarioState?.tab === 'laser_cnc' ? loadedScenarioState.data : undefined}
            onOpenScenarioModal={() => setIsScenarioModalOpen(true)}
          />
        )}

        {activeTab === 'procurement' && <ProcurementStudio />}

        {activeTab === 'standard_parts' && <StandardPartsStudio />}

        {activeTab === 'hardware' && <HardwareStudio />}

        {activeTab === 'cnc' && <CncLatheStudio />}

        {activeTab === 'voice_cad' && (
          <VoiceCadAssistant
            onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
          />
        )}

        {activeTab === 'wizard' && <StepByStepWizard />}

        {activeTab === 'macro_guide' && (
          <MacroGuideStudio onNavigateTab={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'manual' && <ManualKB />}

        {activeTab === 'solidworks_link' && (
          <SolidWorksLinkModal
            isSwConnected={isSwConnected}
            onConnectSw={handleConnectSw}
          />
        )}

        {activeTab === 'ai_assistant' && <AiAssistant />}
      </main>

      {/* LocalStorage Saved Scenarios Modal */}
      <SavedScenariosModal
        isOpen={isScenarioModalOpen}
        onClose={() => setIsScenarioModalOpen(false)}
        activeTab={activeTab}
        currentTabData={getCurrentTabData()}
        onLoadScenario={handleLoadScenario}
      />

      {/* Footer */}
      <footer className="bg-[#1e293b] border-t border-slate-700 py-4 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span className="font-medium">دستیار هوشمند سالیدورک (SolidWorks Master) — نسخه پیشرفته و کارگاهی</span>
          <span className="font-semibold text-blue-400 border border-blue-500/30 px-3 py-1 rounded-lg bg-blue-500/10">
            made by M.Naderi
          </span>
          <span className="font-mono text-[11px] text-slate-400">VBA Macro (.SWP) | Python win32com | PyAutoGUI Controller</span>
        </div>
      </footer>
    </div>
  );
}
