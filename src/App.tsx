import React, { useState, useEffect } from 'react';
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
import { Studio3DEditor } from './components/Studio3DEditor';
import { getAutosaveState } from './utils/scenarioStorage';
import { solidWorksConnector, ConnectionStatus } from './services/SolidWorksConnector';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSwConnected, setIsSwConnected] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  
  // Connection monitoring
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    status: 'disconnected',
    message: 'بررسی اتصال...',
    timestamp: new Date(),
  });

  // Scenario Management Modal State
  const [isScenarioModalOpen, setIsScenarioModalOpen] = useState<boolean>(false);
  const [loadedScenarioState, setLoadedScenarioState] = useState<{
    tab: ActiveTab;
    data: any;
    key: number;
  } | null>(null);

  // Check SOLIDWORKS connection on mount and periodically
  useEffect(() => {
    const checkSolidWorksConnection = async () => {
      try {
        const status = await solidWorksConnector.checkConnection();
        setConnectionStatus(status);
        setIsSwConnected(status.connected);
        
        if (status.connected) {
          setShowNotification('✅ اتصال به سرور SOLIDWORKS برقرار شد');
          setTimeout(() => setShowNotification(null), 3000);
        }
      } catch (error) {
        console.error('خطا در بررسی اتصال:', error);
        setConnectionStatus({
          connected: false,
          status: 'error',
          message: 'خطا در برقراری ارتباط با سرور SOLIDWORKS',
          timestamp: new Date(),
        });
      }
    };

    checkSolidWorksConnection();
    const interval = setInterval(checkSolidWorksConnection, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

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
      {/* Connection Status Alert */}
      {!connectionStatus.connected && (
        <div className="w-full bg-yellow-500 text-white p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="text-sm font-semibold">{connectionStatus.message}</span>
          </div>
          <button
            onClick={async () => {
              const status = await solidWorksConnector.checkConnection();
              setConnectionStatus(status);
            }}
            className="text-white hover:bg-yellow-600 px-3 py-1 rounded text-sm font-bold"
          >
            تلاش مجدد
          </button>
        </div>
      )}

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

        {/* NEW: 3D Studio Cabinet Editor */}
        {activeTab === '3d_studio' && (
          <Studio3DEditor 
            onSave={(config) => {
              setShowNotification('✅ تغییرات کابینت 3D ذخیره شد');
              setTimeout(() => setShowNotification(null), 3000);
            }}
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
            ✨ اکنون با 3D Studio Interactive
          </span>
          <span className="font-mono text-[11px] text-slate-400">VBA Macro (.SWP) | Python win32com | PyAutoGUI Controller</span>
        </div>
      </footer>
    </div>
  );
}
