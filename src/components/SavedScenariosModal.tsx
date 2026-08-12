import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FolderOpen, 
  Trash2, 
  Download, 
  Upload, 
  Search, 
  Sparkles, 
  Clock, 
  Tag, 
  CheckCircle2, 
  Box, 
  Bed, 
  Home, 
  Flame, 
  Scissors, 
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { 
  DesignScenario, 
  getSavedScenarios, 
  saveScenario, 
  deleteScenario, 
  exportAllScenariosJSON, 
  importScenariosFromJSON,
  getAutosaveState
} from '../utils/scenarioStorage';
import { ActiveTab } from '../types';

interface SavedScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  currentTabData: any;
  onLoadScenario: (tab: ActiveTab, data: any) => void;
}

export const SavedScenariosModal: React.FC<SavedScenariosModalProps> = ({
  isOpen,
  onClose,
  activeTab,
  currentTabData,
  onLoadScenario,
}) => {
  const [scenarios, setScenarios] = useState<DesignScenario[]>([]);
  const [filterTab, setFilterTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Save new scenario form
  const [saveTitle, setSaveTitle] = useState<string>('');
  const [saveDesc, setSaveDesc] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);

  // Autosave check
  const autosaved = getAutosaveState<any>(activeTab);

  useEffect(() => {
    if (isOpen) {
      setScenarios(getSavedScenarios());
      // Default title based on tab
      const tabNames: Record<string, string> = {
        cabinet: 'پروژه طراحی کابینت',
        murphy_bed: 'پروژه تخت تاشو و کمد',
        room_planner: 'پلان چیدمان متراژ',
        laser_cnc: 'طراحی یراق فلزی و لیزر',
        nesting: 'چیدمان برش MDF',
      };
      setSaveTitle(tabNames[activeTab] || 'پروژه طراحی کاربری');
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSaveCurrentScenario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTitle.trim()) return;

    const targetTab = ['cabinet', 'murphy_bed', 'room_planner', 'laser_cnc', 'nesting'].includes(activeTab) 
      ? (activeTab as any) 
      : 'cabinet';

    saveScenario({
      title: saveTitle.trim(),
      description: saveDesc.trim() || 'سناریوی ذخیره‌شده از محیط طراحی',
      tab: targetTab,
      data: currentTabData || {},
      tags: ['ذخیره‌شده'],
    });

    setScenarios(getSavedScenarios());
    showToast('سناریوی طراحی با موفقیت در حافظه مرورگر ذخیره شد!');
    setSaveDesc('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('آیا از حذف این سناریوی طراحی اطمینان دارید؟')) {
      const updated = deleteScenario(id);
      setScenarios(updated);
      showToast('سناریو با موفقیت حذف گردید.');
    }
  };

  const handleLoad = (scenario: DesignScenario) => {
    onLoadScenario(scenario.tab as ActiveTab, scenario.data);
    showToast(`سناریوی "${scenario.title}" با موفقیت بارگذاری شد.`);
    setTimeout(() => onClose(), 600);
  };

  const handleExportJSON = () => {
    const jsonStr = exportAllScenariosJSON();
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SolidWorks_Master_Design_Scenarios_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    showToast('فایل پشتیبان تمام سناریوها دانلود شد.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = importScenariosFromJSON(event.target?.result as string);
      if (result.success) {
        setScenarios(getSavedScenarios());
        showToast(`${result.count} سناریوی طراحی با موفقیت بازگردانی شدند!`);
      } else {
        alert(result.error || 'خطا در بارگذاری فایل پشتیبان.');
      }
    };
    reader.readAsText(file);
  };

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredScenarios = scenarios.filter((sc) => {
    const matchesTab = filterTab === 'all' || sc.tab === filterTab;
    const matchesSearch = 
      sc.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      sc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'cabinet': return <Box className="w-4 h-4 text-amber-600" />;
      case 'murphy_bed': return <Bed className="w-4 h-4 text-sky-600" />;
      case 'room_planner': return <Home className="w-4 h-4 text-emerald-600" />;
      case 'laser_cnc': return <Flame className="w-4 h-4 text-cyan-600" />;
      case 'nesting': return <Scissors className="w-4 h-4 text-indigo-600" />;
      default: return <FolderOpen className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'cabinet': return 'کابینت';
      case 'murphy_bed': return 'تخت تاشو';
      case 'room_planner': return 'پلان متراژ';
      case 'laser_cnc': return 'ورقکاری و لیزر';
      case 'nesting': return 'چیدمان MDF';
      default: return tab;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl text-right">
      <div className="bg-white border border-slate-200 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 text-blue-400 rounded-xl border border-blue-500/30">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">مدیریت پروژه‌ها و سناریوهای طراحی (Local Storage)</h3>
              <p className="text-xs text-slate-400">
                ذخیره آفلاین طراحی‌های ناتمام، بازگردانی سناریوهای قبلی و پشتیبان‌گیری کامل
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Notification */}
        {notification && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{notification}</span>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          {/* Form to Save Current State */}
          <form onSubmit={handleSaveCurrentScenario} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                <Save className="w-4 h-4 text-blue-600" />
                ذخیره طراحی فعال جاری ({getTabLabel(activeTab)})
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">
                ذخیره مستقیم در حافظه مرورگر دستگاه شما
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-1 space-y-1">
                <label className="text-slate-700 font-bold">نام پروژه / سناریو:</label>
                <input
                  type="text"
                  required
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="مثلاً: کابینت ممبران خانه آقای نادری"
                  className="w-full bg-white border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-slate-700 font-bold">توضیحات و یادداشت (اختیاری):</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={saveDesc}
                    onChange={(e) => setSaveDesc(e.target.value)}
                    placeholder="توضیحات ابعاد، جنس، بادخور یا سفارش مشتری..."
                    className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shrink-0 transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    ذخیره سناریو
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Autosave Recover Card if present */}
          {autosaved && (
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <span className="font-bold block">آخرین تغییرات ذخیره‌شده اتوماتیک ({getTabLabel(activeTab)}):</span>
                  <span className="text-[11px] text-amber-700 font-mono">
                    تاریخ: {new Date(autosaved.timestamp).toLocaleString('fa-IR')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onLoadScenario(activeTab, autosaved.data);
                  showToast('تغییرات اتوماتیک قبلی بازگردانی شدند.');
                }}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition flex items-center gap-1 shrink-0"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                بازگردانی خودکار
              </button>
            </div>
          )}

          {/* Toolbar: Filter & Search & Backup Import/Export */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {/* Tab Filter */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilterTab('all')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  filterTab === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                همه ({scenarios.length})
              </button>
              <button
                onClick={() => setFilterTab('cabinet')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  filterTab === 'cabinet' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                کابینت
              </button>
              <button
                onClick={() => setFilterTab('murphy_bed')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  filterTab === 'murphy_bed' ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                تخت تاشو
              </button>
              <button
                onClick={() => setFilterTab('laser_cnc')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  filterTab === 'laser_cnc' ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                لیزر و فلز
              </button>
            </div>

            {/* Backup Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                title="دانلود تمامی سناریوها در قالب فایل JSON"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                خروجی JSON
              </button>

              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                ورودی JSON
                <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
              </label>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در نام پروژه، ابعاد یا یادداشت‌ها..."
              className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Scenarios Grid */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700">لیست سناریوهای ذخیره‌شده ({filteredScenarios.length}):</h4>

            {filteredScenarios.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-300 rounded-2xl text-slate-500 space-y-2">
                <FolderOpen className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold">هیچ سناریوی ذخیره‌شده‌ای با این مشخصات یافت نشد.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredScenarios.map((sc) => (
                  <div
                    key={sc.id}
                    onClick={() => handleLoad(sc)}
                    className="bg-white border border-slate-200 hover:border-blue-400 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 rounded-lg text-[11px] font-bold text-slate-700">
                          {getTabIcon(sc.tab)}
                          {getTabLabel(sc.tab)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(sc.id, e)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition opacity-60 group-hover:opacity-100"
                            title="حذف سناریو"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <h5 className="text-sm font-bold text-[#0f172a] group-hover:text-blue-600 transition">
                        {sc.title}
                      </h5>

                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                        {sc.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400 font-mono">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(sc.updatedAt).toLocaleDateString('fa-IR')}
                      </span>

                      <span className="text-blue-600 font-bold group-hover:translate-x-[-2px] transition flex items-center gap-1">
                        بارگذاری در محیط کار ←
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-between text-xs text-slate-500">
          <span>تعداد کل پروژه‌ها: {scenarios.length} سناریو</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
