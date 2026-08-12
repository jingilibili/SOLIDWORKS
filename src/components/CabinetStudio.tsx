import React, { useState, useEffect } from 'react';
import { CabinetParams, SolidWorksMacroOutput, LearnedPattern } from '../types';
import { DEFAULT_CABINET_PRESETS } from '../data/cabinetPresets';
import { generateCabinetMacro } from '../utils/macroGenerators';
import { Cabinet3DViewer } from './3d/Cabinet3DViewer';
import { getLearnedPatterns, saveLearnedPattern, getSmartSuggestion } from '../utils/learningEngine';
import { saveAutosaveState, saveScenario } from '../utils/scenarioStorage';
import { 
  Box, 
  Copy, 
  Download, 
  Check, 
  ListOrdered, 
  Code, 
  Terminal, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Brain, 
  Wand2, 
  Save, 
  FolderOpen,
  BookOpen 
} from 'lucide-react';

interface CabinetStudioProps {
  initialParams?: CabinetParams;
  onOpenScenarioModal?: () => void;
}

export const CabinetStudio: React.FC<CabinetStudioProps> = ({ initialParams, onOpenScenarioModal }) => {
  const [params, setParams] = useState<CabinetParams>(initialParams || DEFAULT_CABINET_PRESETS[0]);
  const [activeOutputTab, setActiveOutputTab] = useState<'bom' | 'vba' | 'python' | 'pyautogui' | 'bat'>('bom');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [interactiveMode, setInteractiveMode] = useState<boolean>(false);
  const [learnedPatterns, setLearnedPatterns] = useState<LearnedPattern[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (initialParams) {
      setParams(initialParams);
    }
  }, [initialParams]);

  useEffect(() => {
    saveAutosaveState('cabinet', params);
  }, [params]);

  useEffect(() => {
    setLearnedPatterns(getLearnedPatterns());
  }, []);

  // Generate current macro outputs
  const macroOutput: SolidWorksMacroOutput = generateCabinetMacro(params);

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveToLearningEngine = () => {
    const updated = saveLearnedPattern(params);
    setLearnedPatterns(updated);
    setNotification('الگوی طراحی شما با موفقیت در سیستم یادگیری آفلاین ذخیره گردید!');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleApplySmartSuggestion = () => {
    const sug = getSmartSuggestion(params.cabinetType || 'base');
    if (sug) {
      setParams((prev) => ({ ...prev, ...sug }));
      setNotification('پیشنهاد هوشمند سیستم بر اساس سابقه و الگوهای یادگرفته‌شده اعمال شد.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  // Engineering Advisor Rules
  const getEngineeringWarnings = () => {
    const warnings: string[] = [];

    if (params.width > 600 && params.doorCount === 1) {
      warnings.push('⚠️ هشدار مهندسی: عرض تک‌درب بیش از ۶۰ سانتیمتر باعث افتادگی لولا در درازمدت می‌شود. پیشنهاد: استفاده از ۲ درب یا لولای سوم.');
    }

    if (params.width > 900 && params.materialThickness === 16 && params.shelfCount > 0) {
      warnings.push('⚠️ هشدار مهندسی: طبقه با عرض بیش از ۹۰ سانتیمتر با ورق ۱۶ میلیمتر ممکن است خمیدگی پیدا کند. پیشنهاد: ورق ۱۸ یا دوبل.');
    }

    if (params.toeKickHeight < 80 && (params.cabinetType === 'base' || !params.cabinetType)) {
      warnings.push('💡 توصیه ارگونومی: ارتفاع پاخور کمتر از ۸۰ میلیمتر فضای مناسب پنجه پا هنگام کار در آشپزخانه را محدود می‌کند.');
    }

    return warnings;
  };

  const warnings = getEngineeringWarnings();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-blue-500 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Studio Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">استودیو طراحی هوشمند کابینت آشپزخانه</h2>
            <p className="text-xs text-slate-500">
              طراحی پارامتریک انواع کابینت (زمینی، دیواری، ایستاده، کشویی) + یادگیری آفلاین الگوها + تولید ماکرو سالیدورک
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {onOpenScenarioModal && (
            <button
              onClick={onOpenScenarioModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="ذخیره یا بارگذاری پروژه‌ها از LocalStorage"
            >
              <FolderOpen className="w-4 h-4 text-blue-200" />
              مدیریت پروژه‌ها / ذخیره سناریو
            </button>
          )}

          <button
            onClick={() => setInteractiveMode(!interactiveMode)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
              interactiveMode
                ? 'bg-purple-50 text-purple-700 border-purple-300'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            {interactiveMode ? 'حالت فرم پارامتری' : 'حالت پرسش و پاسخ تعاملی'}
          </button>

          <button
            onClick={handleSaveToLearningEngine}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            ذخیره الگو در سیستم یادگیری
          </button>

          {/* Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-medium">الگوی پیش‌فرض:</span>
            <select
              onChange={(e) => {
                const preset = DEFAULT_CABINET_PRESETS.find((p) => p.id === e.target.value);
                if (preset) setParams(preset);
              }}
              className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-blue-600 shadow-sm"
            >
              {DEFAULT_CABINET_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Offline Pattern Suggestions Bar */}
      {learnedPatterns.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
            <Brain className="w-4 h-4 text-blue-600 shrink-0" />
            <span>الگوهای یادگرفته‌شده از طراحی‌های قبلی شما (آفلاین):</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {learnedPatterns.slice(0, 3).map((p) => (
              <button
                key={p.id}
                onClick={() =>
                  setParams((prev) => ({
                    ...prev,
                    width: p.width,
                    height: p.height,
                    depth: p.depth,
                    materialThickness: p.materialThickness,
                    doorCount: p.doorCount,
                    hingeBrand: p.hingeBrand as any,
                    cabinetType: p.cabinetType as any
                  }))
                }
                className="px-3 py-1 bg-white border border-blue-300 hover:border-blue-500 rounded-lg text-xs text-slate-800 font-semibold transition shadow-sm flex items-center gap-1"
              >
                <span>{p.title}</span>
                <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">
                  {p.usageCount} بار استفاده
                </span>
              </button>
            ))}

            <button
              onClick={handleApplySmartSuggestion}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
            >
              <Wand2 className="w-3.5 h-3.5" />
              تکمیل خودکار با هوش یادگیرنده
            </button>
          </div>
        </div>
      )}

      {/* Engineering Advisor Warnings */}
      {warnings.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>توصیه‌ها و هشدارهای مهندسی سالیدورک:</span>
          </div>
          <ul className="space-y-1 text-xs text-amber-900 font-medium list-disc list-inside">
            {warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Interactive Q&A Mode or Standard Parameter Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl space-y-5 shadow-sm text-right">
          <div className="pb-2 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a]">⚙️ تنظیم مشخصات و ابعاد پارامتری یونیت</h3>
            <span className="text-xs font-semibold text-blue-600">ابعاد به میلیمتر (mm)</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Cabinet Type */}
            <div className="col-span-2 space-y-1">
              <label className="text-slate-700 font-bold">نوع یونیت کابینت:</label>
              <select
                value={params.cabinetType || 'base'}
                onChange={(e) => {
                  const val = e.target.value as any;
                  let defaultH = params.height;
                  let defaultD = params.depth;

                  if (val === 'wall') {
                    defaultH = 700;
                    defaultD = 350;
                  } else if (val === 'pantry') {
                    defaultH = 2200;
                    defaultD = 580;
                  } else if (val === 'base') {
                    defaultH = 850;
                    defaultD = 550;
                  }

                  setParams({ ...params, cabinetType: val, height: defaultH, depth: defaultD });
                }}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:border-blue-600 shadow-sm"
              >
                <option value="base">کابینت زمینی (Base Cabinet)</option>
                <option value="wall">کابینت دیواری / هوایی (Wall Cabinet)</option>
                <option value="pantry">کمد ایستاده / سوپرمارکتی (Tall Pantry)</option>
                <option value="drawer_chest">باکس کشویی (Drawer Chest)</option>
                <option value="corner">یونیت کنج / L (Corner Cabinet)</option>
                <option value="sink">یونیت سینک ظرفشویی (Sink Unit)</option>
              </select>
            </div>

            {/* Width */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">عرض کلی (Width):</label>
              <input
                type="number"
                value={params.width}
                onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Height */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">ارتفاع کلی (Height):</label>
              <input
                type="number"
                value={params.height}
                onChange={(e) => setParams({ ...params, height: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Depth */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">عمق مفید (Depth):</label>
              <input
                type="number"
                value={params.depth}
                onChange={(e) => setParams({ ...params, depth: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Material Thickness */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">ضخامت ورق بدنه:</label>
              <select
                value={params.materialThickness}
                onChange={(e) => setParams({ ...params, materialThickness: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-blue-600 shadow-sm"
              >
                <option value={16}>۱۶ میلیمتر (استاندارد ایران)</option>
                <option value={18}>۱۸ میلیمتر (خارجی/سنگین)</option>
                <option value={25}>۲۵ میلیمتر (دوبل)</option>
              </select>
            </div>

            {/* Back Panel Thickness */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">فیبر پشت (Backing):</label>
              <select
                value={params.backPanelThickness}
                onChange={(e) => setParams({ ...params, backPanelThickness: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-blue-600 shadow-sm"
              >
                <option value={3}>۳ میلیمتر (فیبر شیاردار)</option>
                <option value={6}>۶ میلیمتر (MDF کمکی)</option>
                <option value={16}>۱۶ میلیمتر (پیچ مستحکم)</option>
              </select>
            </div>

            {/* Toe Kick Height */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">ارتفاع پاخور (Toe Kick):</label>
              <input
                type="number"
                value={params.toeKickHeight}
                onChange={(e) => setParams({ ...params, toeKickHeight: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Door Count */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">تعداد درب‌ها:</label>
              <select
                value={params.doorCount}
                onChange={(e) => setParams({ ...params, doorCount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-blue-600 shadow-sm"
              >
                <option value={0}>بدون درب (باکس دکوری)</option>
                <option value={1}>۱ درب (تک درب)</option>
                <option value={2}>۲ درب (تقارن دو درب)</option>
              </select>
            </div>

            {/* Shelf Count */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">تعداد طبقات متحرک:</label>
              <input
                type="number"
                min="0"
                max="5"
                value={params.shelfCount}
                onChange={(e) => setParams({ ...params, shelfCount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
              />
            </div>

            {/* Hinge Brand */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">برند و نوع لولا:</label>
              <select
                value={params.hingeBrand}
                onChange={(e) => setParams({ ...params, hingeBrand: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-blue-600 shadow-sm"
              >
                <option value="Blum">بلوم (Blum Soft-Close)</option>
                <option value="Fantoni">فانتونی (Fantoni)</option>
                <option value="Hettich">هتیش (Hettich)</option>
                <option value="Standard">معمولی / ایرانی</option>
              </select>
            </div>

            {/* Finish Color */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">رنگ / طرح MDF:</label>
              <input
                type="color"
                value={params.finishColor}
                onChange={(e) => setParams({ ...params, finishColor: e.target.value })}
                className="w-full h-9 bg-white border border-slate-300 rounded-lg cursor-pointer p-1 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interactive 3D WebGL Viewer (7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <Cabinet3DViewer params={params} />
        </div>
      </div>

      {/* Output Tabs Panel (Cut List, SolidWorks Macro, Python COM, PyAutoGUI, BAT) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 text-right">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          {/* Tabs header */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveOutputTab('bom')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeOutputTab === 'bom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              جدول برش MDF (Cut List)
            </button>

            <button
              onClick={() => setActiveOutputTab('vba')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeOutputTab === 'vba'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              کد ماکرو سالیدورک (.SWP)
            </button>

            <button
              onClick={() => setActiveOutputTab('python')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeOutputTab === 'python'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              اسکریپت پایتون (Python COM)
            </button>

            <button
              onClick={() => setActiveOutputTab('pyautogui')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeOutputTab === 'pyautogui'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Play className="w-4 h-4" />
              کنترل موس و کیبورد (PyAutoGUI)
            </button>

            <button
              onClick={() => setActiveOutputTab('bat')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeOutputTab === 'bat'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              فایل اجراکننده (.BAT)
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {activeOutputTab !== 'bom' && (
              <>
                <button
                  onClick={() => {
                    const text =
                      activeOutputTab === 'vba'
                        ? macroOutput.vbaCode
                        : activeOutputTab === 'python'
                        ? macroOutput.pythonComCode
                        : activeOutputTab === 'pyautogui'
                        ? macroOutput.pyautoguiCode
                        : macroOutput.batLauncherCode;
                    handleCopyCode(text);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCode ? 'کپی شد!' : 'کپی کد'}
                </button>

                <button
                  onClick={() => {
                    const ext =
                      activeOutputTab === 'vba'
                        ? 'swp'
                        : activeOutputTab === 'python' || activeOutputTab === 'pyautogui'
                        ? 'py'
                        : 'bat';
                    const text =
                      activeOutputTab === 'vba'
                        ? macroOutput.vbaCode
                        : activeOutputTab === 'python'
                        ? macroOutput.pythonComCode
                        : activeOutputTab === 'pyautogui'
                        ? macroOutput.pyautoguiCode
                        : macroOutput.batLauncherCode;
                    handleDownloadFile(`cabinet_macro.${ext}`, text);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  دانلود فایل
                </button>
              </>
            )}
          </div>
        </div>

        {/* Tab Content Display */}
        {activeOutputTab === 'bom' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="p-3">نام قطعه</th>
                    <th className="p-3">تعداد</th>
                    <th className="p-3">ابعاد دقیق (طول × عرض × ضخامت)</th>
                    <th className="p-3">جنس و مشخصات</th>
                    <th className="p-3">نوار پی‌وی‌سی (PVC Edge)</th>
                    <th className="p-3">توضیحات و شیار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-mono">
                  {macroOutput.bomItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-semibold font-sans text-slate-900">{item.partName}</td>
                      <td className="p-3 text-blue-700 font-bold">{item.quantity} عدد</td>
                      <td className="p-3 dir-ltr text-right text-amber-700 font-bold">{item.dimensions}</td>
                      <td className="p-3 font-sans text-slate-700">{item.material}</td>
                      <td className="p-3 font-sans text-emerald-700">{item.edgeBanding}</td>
                      <td className="p-3 font-sans text-slate-500 text-[11px]">{item.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                محاسبه بادخور درب و شیار فیبر بر اساس استانداردهای کارگاهی ایران انجام شده است.
              </div>
              <button
                onClick={() => {
                  const content = macroOutput.bomItems.map(i => `${i.partName},${i.quantity},${i.dimensions},${i.material},${i.edgeBanding}`).join('\n');
                  handleDownloadFile('Cabinet_CutList.csv', `نام قطعه,تعداد,ابعاد,جنس,نوار\n${content}`);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-300 flex items-center gap-1.5 font-sans font-semibold shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-amber-600" />
                خروجی CSV برای CutMaster / Corte Certo
              </button>
            </div>
          </div>
        )}

        {activeOutputTab !== 'bom' && (
          <div className="relative">
            <pre className="p-4 bg-slate-900 text-sky-300 font-mono text-xs rounded-xl overflow-x-auto max-h-96 border border-slate-800 leading-relaxed dir-ltr text-left">
              {activeOutputTab === 'vba' && macroOutput.vbaCode}
              {activeOutputTab === 'python' && macroOutput.pythonComCode}
              {activeOutputTab === 'pyautogui' && macroOutput.pyautoguiCode}
              {activeOutputTab === 'bat' && macroOutput.batLauncherCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
