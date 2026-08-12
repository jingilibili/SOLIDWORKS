import React from 'react';
import { ActiveTab } from '../types';
import { 
  Box, 
  Wrench, 
  Cog, 
  Bot, 
  BookOpen, 
  LayoutDashboard, 
  Link2, 
  Sparkles, 
  Download,
  FolderKanban,
  Package,
  Mic,
  Bed
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSwConnected: boolean;
  onConnectSw: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSwConnected,
  onConnectSw,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد اصلی', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'cabinet', label: 'طراحی کابینت', icon: <Box className="w-4 h-4" /> },
    { id: 'murphy_bed', label: 'تخت تاشو و اتاق خواب', icon: <Bed className="w-4 h-4" /> },
    { id: 'standard_parts', label: 'قطعات استاندارد', icon: <Package className="w-4 h-4" /> },
    { id: 'hardware', label: 'یراق و اتصالات', icon: <Wrench className="w-4 h-4" /> },
    { id: 'cnc', label: 'تراشکاری CNC', icon: <Cog className="w-4 h-4" /> },
    { id: 'voice_cad', label: 'دستیار صوتی', icon: <Mic className="w-4 h-4" /> },
    { id: 'wizard', label: 'طراح گام‌به‌گام', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'manual', label: 'دانشنامه سالیدورک', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'solidworks_link', label: 'اتصال SW و فایل EXE', icon: <Link2 className="w-4 h-4" /> },
    { id: 'ai_assistant', label: 'پاسخگوی هوشمند CAD', icon: <Bot className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-[#1e293b] text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-sm">
            SW
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              دستیار هوشمند سالیدورک
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30">
                نسخه کارگاهی v2.5
              </span>
            </h1>
            <p className="text-[11px] text-slate-300">
              طراحی پارامتریک کابینت، یراق‌آلات، تراش CNC و اتصال مستقیم
            </p>
          </div>
        </div>

        {/* Status Badge & Action Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className={`w-2.5 h-2.5 rounded-full ${isSwConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>وضعیت: {isSwConnected ? 'متصل به SolidWorks COM API' : 'آفلاین (پایگاه داده محلی)'}</span>
          </div>

          <button
            onClick={onConnectSw}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSwConnected ? 'تست اتصال' : '🔗 اتصال به SolidWorks'}
          </button>

          <button
            onClick={() => setActiveTab('solidworks_link')}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-600"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            خروجی .EXE
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-[#0f172a] border-t border-slate-700/80 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-1 py-1.5">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
