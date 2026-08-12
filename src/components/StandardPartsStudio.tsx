import React, { useState } from 'react';
import { StandardPartItem } from '../types';
import { STANDARD_PARTS_CATALOG } from '../data/standardParts';
import { 
  Package, 
  Search, 
  Sliders, 
  Code, 
  Copy, 
  Download, 
  Check, 
  FileText, 
  Wrench, 
  Layers, 
  Settings2,
  Box
} from 'lucide-react';

export function StandardPartsStudio() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPart, setSelectedPart] = useState<StandardPartItem>(STANDARD_PARTS_CATALOG[0]);
  const [customParams, setCustomParams] = useState<StandardPartItem['parameters']>(
    STANDARD_PARTS_CATALOG[0].parameters
  );
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    { id: 'all', label: 'همه قطعات استاندارد' },
    { id: 'fastener', label: 'پیچ و مهره‌های صنعتی' },
    { id: 'fitting', label: 'اتصالات الیت و مینی‌فیکس' },
    { id: 'hardware', label: 'لولا و ریل‌های کشو' },
    { id: 'profile', label: 'پروفیل و قوطی فلزی' },
  ];

  const filteredParts = STANDARD_PARTS_CATALOG.filter((part) => {
    const matchesCat = selectedCategory === 'all' || part.category === selectedCategory;
    const matchesSearch =
      part.namePersian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.standardCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      part.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSelectPart = (part: StandardPartItem) => {
    setSelectedPart(part);
    setCustomParams({ ...part.parameters });
  };

  const generateDynamicMacro = () => {
    return `' ==============================================================================
' SolidWorks Parametric VBA Macro for ${selectedPart.namePersian}
' Standard Code: ${selectedPart.standardCode}
' Material: ${selectedPart.material}
' ==============================================================================
Sub main()
    Dim swApp As Object
    Dim Part As Object
    Dim boolstatus As Boolean
    Dim longstatus As Long, longwarnings As Long

    Set swApp = Application.SldWorks
    
    ' Create new Part Document using standard template
    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)
    If Part Is Nothing Then
        Set Part = swApp.ActiveDoc
    End If
    
    ' Define Parameters
    Dim LengthMm As Double: LengthMm = ${(customParams.length || 50) / 1000} ' converted to Meters
    Dim WidthMm As Double: WidthMm = ${(customParams.width || 10) / 1000}
    Dim HeightMm As Double: HeightMm = ${(customParams.height || 10) / 1000}
    Dim DiaMm As Double: DiaMm = ${(customParams.diameter || 6) / 1000}

    ' Select Front Plane and Start Sketch
    boolstatus = Part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True

    ' Draw Profile
    Part.SketchManager.CreateCircle 0, 0, 0, DiaMm / 2, 0, 0
    Part.SketchManager.InsertSketch True

    ' Feature Extrude
    Dim myFeature As Object
    Set myFeature = Part.FeatureManager.FeatureExtrude2(True, False, False, 0, 0, LengthMm, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)

    ' Set Material Property
    Part.SetMaterialPropertyName2 "Default", "C:/Program Files/SolidWorks Corp/SolidWorks/lang/english/bodies/matdb.sldmat", "${selectedPart.material}"
    
    Part.ViewZoomtofit2
    MsgBox "قطعه ${selectedPart.namePersian} با موفقیت در SolidWorks ایجاد شد!", vbInformation, "کتابخانه قطعات استاندارد"
End Sub
`;
  };

  const macroCode = generateDynamicMacro();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">کتابخانه قطعات استاندارد صنعتی و یراق‌آلات</h2>
            <p className="text-xs text-slate-500">
              مجموعه کامل پیچ و مهره (DIN/ISO)، اتصالات الیت، لولا، ریل و پروفیل‌های صنعتی با قابلیت سفارشی‌سازی ابعاد
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
            تعداد قطعات: {STANDARD_PARTS_CATALOG.length} ردیف استاندارد
          </span>
        </div>
      </div>

      {/* Main Grid: Catalog Browser (4 cols) & Parametric Editor + Code Output (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parts Catalog & Search (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-4 text-right">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی کد استاندارد، نام یا متریال..."
              className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Catalog Parts List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredParts.map((part) => {
              const isSelected = selectedPart.id === part.id;
              return (
                <div
                  key={part.id}
                  onClick={() => handleSelectPart(part)}
                  className={`p-3.5 rounded-xl border text-right cursor-pointer transition ${
                    isSelected
                      ? 'bg-blue-50/70 border-blue-500 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#0f172a]">{part.namePersian}</span>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {part.standardCode}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>جنس: {part.material}</span>
                    <span className="font-mono text-blue-600 font-semibold">
                      {part.parameters.length}×{part.parameters.diameter || part.parameters.width}mm
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Parametric Editor & SolidWorks Macro Output (8 cols) */}
        <div className="lg:col-span-8 space-y-6 text-right">
          {/* Parameter Customizer Box */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-[#0f172a]">
                  تنظیم سفارشی پارامترهای قطعه: {selectedPart.namePersian}
                </h3>
              </div>
              <span className="text-xs text-blue-700 font-mono font-bold bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                کد استاندارد: {selectedPart.standardCode}
              </span>
            </div>

            {/* Form Inputs Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              {/* Length */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">طول کلی (Length - mm):</label>
                <input
                  type="number"
                  value={customParams.length || 0}
                  onChange={(e) => setCustomParams({ ...customParams, length: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                />
              </div>

              {/* Diameter / Thread Size */}
              {customParams.diameter !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">قطر اسمی (Diameter - mm):</label>
                  <input
                    type="number"
                    value={customParams.diameter || 0}
                    onChange={(e) => setCustomParams({ ...customParams, diameter: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                  />
                </div>
              )}

              {/* Width */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">عرض / پهنا (Width - mm):</label>
                <input
                  type="number"
                  value={customParams.width || 0}
                  onChange={(e) => setCustomParams({ ...customParams, width: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                />
              </div>

              {/* Height */}
              <div className="space-y-1">
                <label className="text-slate-700 font-bold">ارتفاع / ضخامت (Height - mm):</label>
                <input
                  type="number"
                  value={customParams.height || 0}
                  onChange={(e) => setCustomParams({ ...customParams, height: Number(e.target.value) })}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                />
              </div>

              {/* Hole Count if available */}
              {customParams.holeCount !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">تعداد سوراخ‌ها:</label>
                  <input
                    type="number"
                    value={customParams.holeCount || 0}
                    onChange={(e) => setCustomParams({ ...customParams, holeCount: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                  />
                </div>
              )}

              {/* Hole Spacing if available */}
              {customParams.holeSpacing !== undefined && (
                <div className="space-y-1">
                  <label className="text-slate-700 font-bold">فاصله سوراخ‌ها (Pitch - mm):</label>
                  <input
                    type="number"
                    value={customParams.holeSpacing || 0}
                    onChange={(e) => setCustomParams({ ...customParams, holeSpacing: Number(e.target.value) })}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl font-mono text-slate-800 focus:border-blue-600 focus:outline-none shadow-sm"
                  />
                </div>
              )}
            </div>
          </div>

          {/* SolidWorks VBA Macro Generator Box */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-600" />
                کد ماکروی تولید خودکار قطعه در سالیدورک (SolidWorks VBA Macro)
              </h3>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(macroCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'کپی شد!' : 'کپی ماکرو'}
                </button>

                <button
                  onClick={() => {
                    const blob = new Blob([macroCode], { type: 'text/plain' });
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = `${selectedPart.id}.swp`;
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  دانلود .swp
                </button>
              </div>
            </div>

            <pre className="p-4 bg-slate-900 text-sky-300 font-mono text-xs rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed dir-ltr text-left">
              {macroCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
