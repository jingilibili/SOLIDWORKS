import React, { useState } from 'react';
import { CncLatheParams, CncSegment, SolidWorksMacroOutput } from '../types';
import { DEFAULT_CNC_PRESETS } from '../data/cncPresets';
import { generateCncLatheMacro } from '../utils/macroGenerators';
import { CncLathe3DViewer } from './3d/CncLathe3DViewer';
import { 
  Cog, 
  Copy, 
  Download, 
  Check, 
  Plus, 
  Trash2, 
  Code, 
  Terminal, 
  Layers
} from 'lucide-react';

export const CncLatheStudio: React.FC = () => {
  const [params, setParams] = useState<CncLatheParams>(DEFAULT_CNC_PRESETS[0]);
  const [activeTab, setActiveTab] = useState<'vba' | 'python' | 'gcode'>('vba');
  const [copied, setCopied] = useState<boolean>(false);

  // Recalculate total length & max diameter from segments
  const totalLength = params.segments.reduce((acc, s) => acc + s.length, 0);
  const maxDiameter = Math.max(...params.segments.map((s) => Math.max(s.startDiameter, s.endDiameter)), 10);

  const updatedParams = {
    ...params,
    overallLength: totalLength,
    maxDiameter,
  };

  const macroOutput: SolidWorksMacroOutput = generateCncLatheMacro(updatedParams);

  const handleAddSegment = () => {
    const newSeg: CncSegment = {
      id: `seg_${Date.now()}`,
      type: 'cylinder',
      startDiameter: 30,
      endDiameter: 30,
      length: 20,
    };
    setParams({ ...params, segments: [...params.segments, newSeg] });
  };

  const handleRemoveSegment = (id: string) => {
    if (params.segments.length <= 1) return;
    setParams({ ...params, segments: params.segments.filter((s) => s.id !== id) });
  };

  const handleSegmentChange = (id: string, field: keyof CncSegment, val: any) => {
    setParams({
      ...params,
      segments: params.segments.map((s) => (s.id === id ? { ...s, [field]: val } : s)),
    });
  };

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

  // Generate G-Code Toolpath Preview
  const generateGCodePreview = (): string => {
    let gcode = `(G-CODE CNC LATHE TURNING PROGRAM)\n`;
    gcode += `(PART: ${params.partName})\n`;
    gcode += `(MATERIAL: ${params.material})\n`;
    gcode += `G21 (METRIC UNITS)\n`;
    gcode += `G90 G94 (ABSOLUTE PROGRAMMING)\n`;
    gcode += `G28 U0 W0 (HOME POSITION)\n`;
    gcode += `M03 S1200 T0101 (SPINDLE ON 1200 RPM)\n`;
    gcode += `G00 X${maxDiameter + 5} Z5.0 (APPROACH)\n\n`;

    let zPos = 0;
    params.segments.forEach((seg, idx) => {
      gcode += `(--- SEGMENT ${idx + 1}: ${seg.type.toUpperCase()} ---)\n`;
      if (seg.type === 'thread') {
        gcode += `G76 P020060 Q100 R0.05\n`;
        gcode += `G76 X${seg.startDiameter - 2} Z-${zPos + seg.length} P1250 Q200 F${seg.threadPitch || 2.0}\n`;
      } else {
        gcode += `G01 X${seg.startDiameter} Z-${zPos} F0.25\n`;
        gcode += `G01 X${seg.endDiameter} Z-${zPos + seg.length} F0.18\n`;
      }
      zPos += seg.length;
    });

    gcode += `\nG00 X${maxDiameter + 10} Z20.0 (RETRACT)\n`;
    gcode += `M05 M30 (PROGRAM END)\n`;
    return gcode;
  };

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Cog className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">استودیو طراحی قطعات تراشکاری CNC</h2>
            <p className="text-xs text-slate-500">
              تعریف پله‌های شفت، مخروط، شیار و رزوه به همراه تولید ماکروی Revolve و مسیر ابزار G-Code
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-medium">الگوهای شفت:</span>
          <select
            onChange={(e) => {
              const preset = DEFAULT_CNC_PRESETS.find((p) => p.id === e.target.value);
              if (preset) setParams(preset);
            }}
            className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg px-3 py-2 font-medium focus:outline-none focus:border-blue-600 shadow-sm"
          >
            {DEFAULT_CNC_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.partName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Grid: Profile Segments Manager vs 3D Viewer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Segment List Controls (6 cols) */}
        <div className="lg:col-span-6 bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h3 className="text-sm font-bold text-[#0f172a]">📐 مدیریت پله‌ها و مشخصات نیم‌رخ تراشکاری</h3>
            <button
              onClick={handleAddSegment}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              افزودن پله جدید
            </button>
          </div>

          {/* Part Name & Material */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium">نام قطعه:</label>
              <input
                type="text"
                value={params.partName}
                onChange={(e) => setParams({ ...params, partName: e.target.value })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">جنس قطعهکار:</label>
              <select
                value={params.material}
                onChange={(e) => setParams({ ...params, material: e.target.value as any })}
                className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 focus:border-indigo-500"
              >
                <option value="Steel_1045">فولاد CK45 / St52</option>
                <option value="Aluminum_6061">آلومینیوم 6061 T6</option>
                <option value="Brass_C360">برنج تراشکاری C360</option>
                <option value="Stainless_304">استنلس استیل 304</option>
              </select>
            </div>
          </div>

          {/* Segments Loop */}
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {params.segments.map((seg, idx) => (
              <div key={seg.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-bold">
                  <span className="flex items-center gap-1.5 text-indigo-400">
                    <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-[10px]">
                      {idx + 1}
                    </span>
                    پله شماره {idx + 1}
                  </span>

                  <button
                    onClick={() => handleRemoveSegment(seg.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[11px] text-slate-400">نوع پله:</label>
                    <select
                      value={seg.type}
                      onChange={(e) => handleSegmentChange(seg.id, 'type', e.target.value)}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-200"
                    >
                      <option value="cylinder">استوانه (Cylinder)</option>
                      <option value="cone">مخروط (Cone)</option>
                      <option value="groove">شیار (Groove)</option>
                      <option value="thread">رزوه (Thread)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">قطر شروع (mm):</label>
                    <input
                      type="number"
                      value={seg.startDiameter}
                      onChange={(e) => handleSegmentChange(seg.id, 'startDiameter', Number(e.target.value))}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded p-1.5 text-sky-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">قطر پایان (mm):</label>
                    <input
                      type="number"
                      value={seg.endDiameter}
                      onChange={(e) => handleSegmentChange(seg.id, 'endDiameter', Number(e.target.value))}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded p-1.5 text-sky-400 font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400">طول پله (mm):</label>
                    <input
                      type="number"
                      value={seg.length}
                      onChange={(e) => handleSegmentChange(seg.id, 'length', Number(e.target.value))}
                      className="w-full mt-0.5 bg-slate-900 border border-slate-700 rounded p-1.5 text-amber-400 font-mono"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bore Hole Inputs */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-slate-300 font-medium">قطر سوراخ مرغک/سنتر (mm):</label>
              <input
                type="number"
                value={params.boreDiameter}
                onChange={(e) => setParams({ ...params, boreDiameter: Number(e.target.value) })}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">عمق سوراخ مرغک (mm):</label>
              <input
                type="number"
                value={params.boreDepth}
                onChange={(e) => setParams({ ...params, boreDepth: Number(e.target.value) })}
                className="w-full mt-1 bg-slate-900 border border-slate-700 rounded p-1.5 text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right 3D Lathe Viewer (6 cols) */}
        <div className="lg:col-span-6">
          <CncLathe3DViewer params={updatedParams} />
        </div>
      </div>

      {/* Code Exporter */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('vba')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'vba' ? 'bg-indigo-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              ماکرو Revolve سالیدورک (.SWP)
            </button>
            <button
              onClick={() => setActiveTab('python')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'python' ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              اسکریپت پایتون (Python COM)
            </button>
            <button
              onClick={() => setActiveTab('gcode')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'gcode' ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'
              }`}
            >
              کد تراشکاری CNC (G-Code)
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
                    : generateGCodePreview();
                handleCopy(text);
              }}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 text-slate-200 text-xs font-semibold rounded border border-slate-700"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'کپی شد' : 'کپی'}
            </button>

            <button
              onClick={() => {
                const ext = activeTab === 'vba' ? 'swp' : activeTab === 'python' ? 'py' : 'nc';
                const text =
                  activeTab === 'vba'
                    ? macroOutput.vbaCode
                    : activeTab === 'python'
                    ? macroOutput.pythonComCode
                    : generateGCodePreview();
                handleDownload(`cnc_turning_macro.${ext}`, text);
              }}
              className="flex items-center gap-1 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود
            </button>
          </div>
        </div>

        <pre className="p-4 bg-slate-950 text-indigo-300 font-mono text-xs rounded-xl overflow-x-auto max-h-80 border border-slate-800 dir-ltr text-left">
          {activeTab === 'vba' && macroOutput.vbaCode}
          {activeTab === 'python' && macroOutput.pythonComCode}
          {activeTab === 'gcode' && generateGCodePreview()}
        </pre>
      </div>
    </div>
  );
};
