import React, { useState } from 'react';
import { ActiveTab, CabinetParams } from './types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSwConnected, setIsSwConnected] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);

  const handleConnectSw = () => {
    // Test connectivity simulation
    setIsSwConnected(true);
    setShowNotification('اتصال با موفقیت به SolidWorks COM API برقرار گردید!');
    setTimeout(() => setShowNotification(null), 4000);
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] text-[#1e293b] font-sans dir-rtl text-right antialiased selection:bg-blue-600 selection:text-white flex flex-col">
      {/* Top Bar Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSwConnected={isSwConnected}
        onConnectSw={handleConnectSw}
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
          <RoomPlannerStudio onOpenShoppingList={() => setActiveTab('procurement')} />
        )}

        {activeTab === 'cabinet' && <CabinetStudio />}

        {activeTab === 'murphy_bed' && <MurphyBedStudio />}

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
