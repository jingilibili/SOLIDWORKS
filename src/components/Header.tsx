import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { getSavedScenarios } from '../utils/scenarioStorage';
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
  Bed,
  Home,
  ShoppingCart,
  FileCode2,
  Scissors,
  Flame,
  FolderOpen
} from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isSwConnected: boolean;
  onConnectSw: () => void;
  onOpenScenarioModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isSwConnected,
  onConnectSw,
  onOpenScenarioModal,
}) => {
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      const scenarios = getSavedScenarios();
      setSavedCount(scenarios.length);
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    return () => window.removeEventListener('storage', updateCount);
  }, []);
  const tabs: { id: ActiveTab; label: string; tooltip: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد اصلی', tooltip: 'نمای کلی و دسترسی سریع به تمام استودیوهای طراحی', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'macro_guide', label: 'راهنمای ماکرو سالیدورک', tooltip: 'آموزش کامل ماکرو چیست، نحوه اجرای آن در سالیدورک و راهنمای کارکردها', icon: <FileCode2 className="w-4 h-4 text-emerald-400" /> },
    { id: 'room_planner', label: 'طراحی هوشمند متراژ', tooltip: 'چیدمان اتوماتیک پلان آشپزخانه و اتاق خواب بر اساس ابعاد و زوایا', icon: <Home className="w-4 h-4" /> },
    { id: 'cabinet', label: 'طراحی کابینت', tooltip: 'طراحی یونیت‌های MDF، بادخور درب، نوار PVC و جدول برش', icon: <Box className="w-4 h-4" /> },
    { id: 'murphy_bed', label: 'تخت تاشو و اتاق خواب', tooltip: 'طراحی کلاف فولادی، جک هیدرولیک و کمدهای جانبی تخت دیواری', icon: <Bed className="w-4 h-4" /> },
    { id: 'nesting', label: 'چیدمان برش MDF', tooltip: 'بهینه‌سازی چیدمان قطعات روی ورق MDF و کمترین ضایعات (Nesting Grid)', icon: <Scissors className="w-4 h-4 text-amber-400" /> },
    { id: 'laser_cnc', label: 'ورقکاری و برش لیزر', tooltip: 'طراحی یراق‌آلات فلزی، سوراخکاری لیزر و ماکروی SheetMetal سالیدورک', icon: <Flame className="w-4 h-4 text-cyan-400" /> },
    { id: 'procurement', label: 'لیست اقلام خرید', tooltip: 'استخراج متراژ نوار، تعداد ورق MDF، لولا، ریل و برآورد بودجه', icon: <ShoppingCart className="w-4 h-4" /> },
    { id: 'standard_parts', label: 'قطعات استاندارد', tooltip: 'مدلسازی پیچ‌های DIN/ISO، پروفیل‌های صنعتی و اتصالات', icon: <Package className="w-4 h-4" /> },
    { id: 'hardware', label: 'یراق و اتصالات', tooltip: 'مدلسازی لولا گازور ۳۵mm، ریل ۳ زمانه، الیت و دستگیره مخفی', icon: <Wrench className="w-4 h-4" /> },
    { id: 'cnc', label: 'تراشکاری CNC', tooltip: 'طراحی شفت‌های پله‌ای، رزوه زنی، فاز و تولید مسیر ابزار G-Code', icon: <Cog className="w-4 h-4" /> },
    { id: 'voice_cad', label: 'دستیار صوتی', tooltip: 'دریافت فرمان صوتی فارسی و تبدیل مستقیم به کد ماکروی CAD', icon: <Mic className="w-4 h-4" /> },
    { id: 'wizard', label: 'طراح گام‌به‌گام', tooltip: 'پاسخ به سوالات ساده و تولید اتوماتیک ماکروی سه‌بعدی', icon: <FolderKanban className="w-4 h-4" /> },
    { id: 'manual', label: 'دانشنامه سالیدورک', tooltip: 'آموزش کامل دستورات، کلیدهای میانبر و عیب‌یابی خطاهای سالیدورک', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'solidworks_link', label: 'اتصال SW و فایل EXE', tooltip: 'دانلود فایل‌های اتصال مستقیم، اسکریپت پایتون و لانچر ویندوز', icon: <Link2 className="w-4 h-4" /> },
    { id: 'ai_assistant', label: 'پاسخگوی هوشمند CAD', tooltip: 'مشاوره آنلاین هوش مصنوعی درباره محاسبات فنی و استانداردهای طراحی', icon: <Bot className="w-4 h-4" /> },
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
          {onOpenScenarioModal && (
            <button
              onClick={onOpenScenarioModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              title="مدیریت و بارگذاری سناریوهای طراحی ذخیره شده در مرورگر"
            >
              <FolderOpen className="w-3.5 h-3.5 text-emerald-200" />
              <span>پروژه‌های ذخیره‌شده</span>
              <span className="bg-emerald-800 text-emerald-100 px-1.5 py-0.2 text-[10px] rounded-full font-mono">
                {savedCount}
              </span>
            </button>
          )}

          <div 
            className="flex items-center gap-2 text-xs text-slate-200 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700"
            title="وضعیت برقراری ارتباط زنده با نرم‌افزار SolidWorks روی سیستم شما"
          >
            <span className={`w-2.5 h-2.5 rounded-full ${isSwConnected ? 'bg-green-400 animate-pulse' : 'bg-amber-400'}`} />
            <span>وضعیت: {isSwConnected ? 'متصل به SolidWorks COM API' : 'آفلاین (پایگاه داده محلی)'}</span>
          </div>

          <button
            onClick={onConnectSw}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors shadow-sm flex items-center gap-1.5"
            title="ارسال سیگنال تست ارتباط برای شناسایی پروسه SolidWorks در حال اجرا"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isSwConnected ? 'تست اتصال' : '🔗 اتصال به SolidWorks'}
          </button>

          <button
            onClick={() => setActiveTab('solidworks_link')}
            className="bg-slate-700 hover:bg-slate-600 text-slate-100 px-3.5 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 border border-slate-600"
            title="دانلود فایل لانچر خودکار .EXE و اسکریپت‌های پایتون جهت اجرای یک‌کلیکی روی ویندوز"
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
                title={tab.tooltip}
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
