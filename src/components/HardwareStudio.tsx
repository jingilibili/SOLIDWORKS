import React, { useState } from 'react';
import { HardwareParams, SolidWorksMacroOutput } from '../types';
import { DEFAULT_HARDWARE_PRESETS } from '../data/hardwarePresets';
import { generateHardwareMacro } from '../utils/macroGenerators';
import { Hardware3DViewer } from './3d/Hardware3DViewer';
import { 
  Wrench, 
  Copy, 
  Download, 
  Check, 
  Code, 
  Terminal, 
  Play, 
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const HardwareStudio: React.FC = () => {
  const [params, setParams] = useState<HardwareParams>(DEFAULT_HARDWARE_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'vba' | 'python' | 'pyautogui' | 'bat'>('vba');
  const [copied, setCopied] = useState<boolean>(false);

  const macroOutput: SolidWorksMacroOutput = generateHardwareMacro(params);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Title Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl border border-teal-200">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">استودیو طراحی یراق‌آلات و اتصالات</h2>
            <p className="text-xs text-slate-500">
              مدلسازی دقیق لولا گازور، ریل ساچمه‌ای، مینی‌فیکس، دستگیره و اتصالات با خروجی ماکروی سالیدورک
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">الگوی یراق:</span>
          <select
            onChange={(e) => {
              const preset = DEFAULT_HARDWARE_PRESETS.find((p) => p.id === e.target.value);
              if (preset) setParams(preset);
            }}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-blue-600 shadow-sm"
          >
            {DEFAULT_HARDWARE_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Parameters vs 3D Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-[#0f172a] pb-2 border-b border-slate-200 flex items-center justify-between">
            <span>⚙️ مشخصات فنی یراق</span>
            <span className="text-xs font-semibold text-teal-600">ابعاد به میلیمتر (mm)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-600 font-medium">نام قطعه:</label>
              <input
                type="text"
                value={params.name}
                onChange={(e) => setParams({ ...params, name: e.target.value })}
                className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:border-blue-600 shadow-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-slate-600 font-medium">طول (Length):</label>
                <input
                  type="number"
                  value={params.length}
                  onChange={(e) => setParams({ ...params, length: Number(e.target.value) })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium">عرض (Width):</label>
                <input
                  type="number"
                  value={params.width}
                  onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
                />
              </div>

              <div>
                <label className="text-slate-600 font-medium">ارتفاع (Height):</label>
                <input
                  type="number"
                  value={params.height}
                  onChange={(e) => setParams({ ...params, height: Number(e.target.value) })}
                  className="w-full mt-1 bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-blue-600 shadow-sm"
                />
              </div>
            </div>

            {params.category === 'hinge' && (
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div>
                  <label className="text-slate-300 font-medium">قطر کاسه لولا (mm):</label>
                  <input
                    type="number"
                    value={params.cupDiameter || 35}
                    onChange={(e) => setParams({ ...params, cupDiameter: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">عمق سوراخ کاسه (mm):</label>
                  <input
                    type="number"
                    value={params.cupDepth || 11.5}
                    onChange={(e) => setParams({ ...params, cupDepth: Number(e.target.value) })}
                    className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>
            )}

            {params.category === 'handle' && (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <label className="text-slate-300 font-medium">فاصله مرکز دو پیچ / آکس دستگیره (Hole Pitch mm):</label>
                <select
                  value={params.holePitch || 128}
                  onChange={(e) => setParams({ ...params, holePitch: Number(e.target.value) })}
                  className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-2 text-sky-400 font-mono font-bold"
                >
                  <option value={96}>96 mm (دستگیره کوتاه)</option>
                  <option value={128}>128 mm (استاندارد متوسط)</option>
                  <option value={160}>160 mm (دستگیره بلند)</option>
                  <option value={192}>192 mm (دستگیره لوکس)</option>
                  <option value={224}>224 mm (دستگیره متری)</option>
                </select>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-medium">جنس و پوشش سطحی:</label>
              <input
                type="text"
                value={params.finishMaterial}
                onChange={(e) => setParams({ ...params, finishMaterial: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 3D Hardware Viewer (7 cols) */}
        <div className="lg:col-span-7">
          <Hardware3DViewer params={params} />
        </div>
      </div>

      {/* Code Exporter Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('vba')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'vba' ? 'bg-teal-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              کد ماکرو VBA (.swp)
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'python' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              کد پایتون (Python COM)
            </button>
            <button
              onClick={() => setActiveTab('pyautogui')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'pyautogui' ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              کنترل موس (PyAutoGUI)
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const text =
                  activeTab === 'vba'
                    ? macroOutput.vbaCode
                    : activeTab === 'python'
                    ? macroOutput.pythonComCode
                    : activeTab === 'pyautogui'
                    ? macroOutput.pyautoguiCode
                    : macroOutput.batLauncherCode;
                handleCopy(text);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'کپی شد' : 'کپی'}
            </button>

            <button
              onClick={() => {
                const ext = activeTab === 'vba' ? 'swp' : 'py';
                const text =
                  activeTab === 'vba'
                    ? macroOutput.vbaCode
                    : activeTab === 'python'
                    ? macroOutput.pythonComCode
                    : macroOutput.pyautoguiCode;
                handleDownload(`hardware_macro.${ext}`, text);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-950 text-teal-300 font-mono text-xs rounded-xl overflow-x-auto max-h-80 border border-slate-800 dir-ltr text-left">
          {activeTab === 'vba' && macroOutput.vbaCode}
          {activeTab === 'python' && macroOutput.pythonComCode}
          {activeTab === 'pyautogui' && macroOutput.pyautoguiCode}
        </pre>
      </div>
    </div>
  );
};
