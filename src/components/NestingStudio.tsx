import React, { useState, useEffect } from 'react';
import { 
  Grid, 
  Layers, 
  Sliders, 
  Scissors, 
  Maximize2, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  RefreshCw,
  PieChart,
  FileSpreadsheet,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Code
} from 'lucide-react';
import { saveAutosaveState } from '../utils/scenarioStorage';

export interface NestingPart {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  quantity: number;
  color?: string;
  canRotate?: boolean;
}

export interface PlacedPart {
  part: NestingPart;
  x: number;
  y: number;
  w: number;
  h: number;
  rotated: boolean;
  sheetIndex: number;
}

interface NestingStudioProps {
  initialParams?: any;
  onOpenScenarioModal?: () => void;
}

export const NestingStudio: React.FC<NestingStudioProps> = ({ initialParams, onOpenScenarioModal }) => {
  // Sheet config
  const [sheetWidth, setSheetWidth] = useState<number>(initialParams?.sheetWidth || 3660); // mm
  const [sheetHeight, setSheetHeight] = useState<number>(initialParams?.sheetHeight || 1830); // mm
  const [sawKerf, setSawKerf] = useState<number>(initialParams?.sawKerf || 3); // mm
  const [edgeMargin, setEdgeMargin] = useState<number>(initialParams?.edgeMargin || 10); // mm
  const [allowRotation, setAllowRotation] = useState<boolean>(
    initialParams?.allowRotation !== undefined ? initialParams.allowRotation : true
  );

  // Initial parts list
  const [parts, setParts] = useState<NestingPart[]>(
    initialParams?.parts || [
      { id: 'p1', name: 'دیواره چپ یونیت زمینی', width: 720, height: 550, quantity: 4, color: '#3b82f6', canRotate: true },
      { id: 'p2', name: 'دیواره راست یونیت دیواری', width: 900, height: 320, quantity: 4, color: '#10b981', canRotate: true },
      { id: 'p3', name: 'درب کابینت ۲-تکه', width: 716, height: 296, quantity: 6, color: '#f59e0b', canRotate: false },
      { id: 'p4', name: 'طاق و کف کابینت', width: 568, height: 550, quantity: 6, color: '#8b5cf6', canRotate: true },
      { id: 'p5', name: 'نمای تاشو کلاف تخت', width: 1520, height: 780, quantity: 2, color: '#ec4899', canRotate: false },
      { id: 'p6', name: 'کفی و دیواره کمد جانبی', width: 2200, height: 500, quantity: 2, color: '#06b6d4', canRotate: true },
    ]
  );

  useEffect(() => {
    if (initialParams) {
      if (initialParams.sheetWidth) setSheetWidth(initialParams.sheetWidth);
      if (initialParams.sheetHeight) setSheetHeight(initialParams.sheetHeight);
      if (initialParams.sawKerf) setSawKerf(initialParams.sawKerf);
      if (initialParams.edgeMargin) setEdgeMargin(initialParams.edgeMargin);
      if (initialParams.allowRotation !== undefined) setAllowRotation(initialParams.allowRotation);
      if (initialParams.parts) setParts(initialParams.parts);
    }
  }, [initialParams]);

  useEffect(() => {
    saveAutosaveState('nesting', {
      sheetWidth,
      sheetHeight,
      sawKerf,
      edgeMargin,
      allowRotation,
      parts,
    });
  }, [sheetWidth, sheetHeight, sawKerf, edgeMargin, allowRotation, parts]);

  const [copied, setCopied] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [newPart, setNewPart] = useState({ name: 'قطعه سفارشی جدید', width: 600, height: 400, quantity: 2 });

  // 2D Guillotine / Shelf Nesting Packing Algorithm
  const computeNestingLayout = () => {
    const usableW = sheetWidth - 2 * edgeMargin;
    const usableH = sheetHeight - 2 * edgeMargin;

    // Expand items by quantity
    const expandedList: NestingPart[] = [];
    parts.forEach((p) => {
      for (let i = 0; i < p.quantity; i++) {
        expandedList.push({ ...p });
      }
    });

    // Sort by largest area / height first
    expandedList.sort((a, b) => Math.max(b.width, b.height) - Math.max(a.width, a.height));

    const sheets: PlacedPart[][] = [[]];
    let currentSheetIndex = 0;

    let currentX = edgeMargin;
    let currentY = edgeMargin;
    let maxRowH = 0;

    expandedList.forEach((item) => {
      let pw = item.width;
      let ph = item.height;
      let rotated = false;

      // Check if rotating fits better in usable width/height
      if (allowRotation && item.canRotate && pw > usableW && ph <= usableW) {
        pw = item.height;
        ph = item.width;
        rotated = true;
      }

      // Check if fits in current row
      if (currentX + pw + sawKerf <= sheetWidth - edgeMargin) {
        // Fits in row
        if (currentY + ph + sawKerf <= sheetHeight - edgeMargin) {
          sheets[currentSheetIndex].push({
            part: item,
            x: currentX,
            y: currentY,
            w: pw,
            h: ph,
            rotated,
            sheetIndex: currentSheetIndex,
          });
          currentX += pw + sawKerf;
          maxRowH = Math.max(maxRowH, ph);
        } else {
          // Open new sheet
          currentSheetIndex++;
          sheets.push([]);
          currentX = edgeMargin;
          currentY = edgeMargin;
          maxRowH = ph;

          sheets[currentSheetIndex].push({
            part: item,
            x: currentX,
            y: currentY,
            w: pw,
            h: ph,
            rotated,
            sheetIndex: currentSheetIndex,
          });
          currentX += pw + sawKerf;
        }
      } else {
        // Move to next row
        currentX = edgeMargin;
        currentY += maxRowH + sawKerf;
        maxRowH = ph;

        if (currentY + ph + sawKerf <= sheetHeight - edgeMargin) {
          sheets[currentSheetIndex].push({
            part: item,
            x: currentX,
            y: currentY,
            w: pw,
            h: ph,
            rotated,
            sheetIndex: currentSheetIndex,
          });
          currentX += pw + sawKerf;
        } else {
          // Open new sheet
          currentSheetIndex++;
          sheets.push([]);
          currentX = edgeMargin;
          currentY = edgeMargin;
          maxRowH = ph;

          sheets[currentSheetIndex].push({
            part: item,
            x: currentX,
            y: currentY,
            w: pw,
            h: ph,
            rotated,
            sheetIndex: currentSheetIndex,
          });
          currentX += pw + sawKerf;
        }
      }
    });

    return sheets;
  };

  const sheetsResult = computeNestingLayout();

  // Statistics
  const totalSheetAreaM2 = (sheetWidth / 1000) * (sheetHeight / 1000) * sheetsResult.length;
  let totalPlacedAreaM2 = 0;
  sheetsResult.forEach((st) => {
    st.forEach((item) => {
      totalPlacedAreaM2 += (item.w / 1000) * (item.h / 1000);
    });
  });

  const efficiencyPct = totalSheetAreaM2 > 0 ? ((totalPlacedAreaM2 / totalSheetAreaM2) * 100).toFixed(1) : '0';
  const wasteAreaM2 = (totalSheetAreaM2 - totalPlacedAreaM2).toFixed(2);

  const generateSolidWorksNestingMacro = () => {
    let macro = `' ==============================================================================\n`;
    macro += `' SolidWorks Parametric VBA Macro - Nesting & Sheet Cutting Layout\n`;
    macro += `' Total Sheets: ${sheetsResult.length} | Sheet Dim: ${sheetWidth}x${sheetHeight}mm | Efficiency: ${efficiencyPct}%\n`;
    macro += `' ==============================================================================\n`;
    macro += `Sub main()\n`;
    macro += `    Dim swApp As Object\n`;
    macro += `    Dim Part As Object\n`;
    macro += `    Dim boolstatus As Boolean\n`;
    macro += `    Dim longstatus As Long, longwarnings As Long\n\n`;
    macro += `    Set swApp = Application.SldWorks\n\n`;

    sheetsResult.forEach((st, idx) => {
      const swW = sheetWidth / 1000;
      const swH = sheetHeight / 1000;
      macro += `    ' --- CREATE SHEET #${idx + 1} ASSEMBLY PART ---\n`;
      macro += `    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)\n`;
      macro += `    If Part Is Nothing Then Set Part = swApp.ActiveDoc\n`;
      macro += `    boolstatus = Part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)\n`;
      macro += `    Part.SketchManager.InsertSketch True\n`;
      macro += `    Part.SketchManager.CreateCornerRectangle 0, 0, 0, ${swW}, ${swH}, 0\n`;
      macro += `    Part.SketchManager.InsertSketch True\n`;
      macro += `    Part.FeatureManager.FeatureExtrude2 True, False, False, 0, 0, 0.016, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False\n\n`;

      macro += `    ' --- SKETCH CUT PATTERNS FOR SHEET #${idx + 1} (${st.length} PARTS) ---\n`;
      macro += `    boolstatus = Part.Extension.SelectByID2("", "FACE", ${swW / 2}, ${swH / 2}, 0.016, False, 0, Nothing, 0)\n`;
      macro += `    Part.SketchManager.InsertSketch True\n`;

      st.forEach((p, pIdx) => {
        const px = p.x / 1000;
        const py = p.y / 1000;
        const pw = p.w / 1000;
        const ph = p.h / 1000;
        macro += `    ' Part #${pIdx + 1}: ${p.part.name} (${p.w}x${p.h}mm)\n`;
        macro += `    Part.SketchManager.CreateCornerRectangle ${px}, ${py}, 0, ${px + pw}, ${py + ph}, 0\n`;
      });

      macro += `    Part.SketchManager.InsertSketch True\n`;
      macro += `    ' Create Cut-Extrude 0.5mm score lines for CNC / Saw\n`;
      macro += `    Part.FeatureManager.FeatureCut4 True, False, False, 0, 0, 0.002, 0.002, False, False, False, False, 0, 0, False, False, False, False, False, True, True, True, True, False, 0, 0, False, False\n\n`;
    });

    macro += `    Part.ViewZoomtofit2\n`;
    macro += `    MsgBox "نقشه چیدمان چوب و نستیگ با موفقیت در SolidWorks ایجاد شد!", vbInformation, "استودیو نستیگ صنعت چوب"\n`;
    macro += `End Sub\n`;
    return macro;
  };

  const macroCode = generateSolidWorksNestingMacro();

  const handleAddPart = () => {
    if (newPart.width <= 0 || newPart.height <= 0) return;
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    setParts([
      ...parts,
      {
        id: 'p-' + Date.now(),
        name: newPart.name,
        width: newPart.width,
        height: newPart.height,
        quantity: newPart.quantity,
        color: randomColor,
        canRotate: true,
      },
    ]);
  };

  const handleDeletePart = (id: string) => {
    setParts(parts.filter((p) => p.id !== id));
  };

  const exportCSV = () => {
    let csv = `نام قطعه,عرض (mm),طول (mm),تعداد,چرخش مجاز\n`;
    parts.forEach((p) => {
      csv += `${p.name},${p.width},${p.height},${p.quantity},${p.canRotate ? 'بله' : 'خیر'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mdf_nesting_cutlist.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
            <Scissors className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">پورتال چیدمان و بهینه‌سازی برش ورق MDF (MDF Cut Optimizer & Nesting)</h2>
            <p className="text-xs text-slate-500">
              چیدمان هوشمند دو بعدی قطعات روی ورق با کمترین ضایعات، ضخامت تیغ اره، جهت راه‌چوب و خروجی نقشه چیدمان
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenScenarioModal && (
            <button
              onClick={onOpenScenarioModal}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
              title="ذخیره یا بارگذاری پروژه‌ها از LocalStorage"
            >
              <FolderOpen className="w-4 h-4 text-blue-200" />
              مدیریت پروژه‌ها / ذخیره سناریو
            </button>
          )}

          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            خروجی لیست برش CSV
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Settings & Parts Column (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
          {/* Sheet Specs */}
          <div className="space-y-3 border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              مشخصات ورق خامی MDF و تیغ اره
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold">طول ورق خام (mm):</label>
                <select
                  value={sheetWidth}
                  onChange={(e) => setSheetWidth(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                >
                  <option value={3660}>۳۶۶۰ mm (ورق بزرگ)</option>
                  <option value={2440}>۲۴۴۰ mm (ورق استاندارد)</option>
                  <option value={2800}>۲۸۰۰ mm</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">عرض ورق خام (mm):</label>
                <select
                  value={sheetHeight}
                  onChange={(e) => setSheetHeight(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
                >
                  <option value={1830}>۱۸۳۰ mm (ورق بزرگ)</option>
                  <option value={1220}>۱۲۲۰ mm (ورق استاندارد)</option>
                  <option value={2100}>۲۱۰ Error/Custom</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">ضخامت تیغ اره (mm):</label>
                <input
                  type="number"
                  value={sawKerf}
                  onChange={(e) => setSawKerf(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">دوربری ورق (mm):</label>
                <input
                  type="number"
                  value={edgeMargin}
                  onChange={(e) => setEdgeMargin(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
                />
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowRotation}
                  onChange={(e) => setAllowRotation(e.target.checked)}
                  className="rounded text-amber-600"
                />
                <span>اجازه چرخش ۹۰ درجه قطعات (بدون جهت راه‌چوب)</span>
              </label>
            </div>
          </div>

          {/* Add Part Form */}
          <div className="space-y-3 border-b border-slate-200 pb-4">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-600" />
              افزودن قطعه جدید به چیدمان
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="col-span-2 space-y-1">
                <label className="text-slate-600 font-bold">نام قطعه:</label>
                <input
                  type="text"
                  value={newPart.name}
                  onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">عرض (mm):</label>
                <input
                  type="number"
                  value={newPart.width}
                  onChange={(e) => setNewPart({ ...newPart, width: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">طول (mm):</label>
                <input
                  type="number"
                  value={newPart.height}
                  onChange={(e) => setNewPart({ ...newPart, height: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="col-span-2 space-y-1">
                <label className="text-slate-600 font-bold">تعداد:</label>
                <input
                  type="number"
                  min="1"
                  value={newPart.quantity}
                  onChange={(e) => setNewPart({ ...newPart, quantity: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleAddPart}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" />
              افزودن قطعه
            </button>
          </div>

          {/* Parts List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-700">لیست قطعات در حال چیدمان ({parts.length} ردیف):</h3>
            <div className="max-h-60 overflow-y-auto space-y-2 text-xs pr-1">
              {parts.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color || '#3b82f6' }} />
                    <div>
                      <span className="font-bold text-slate-800 block">{p.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {p.width} × {p.height} mm ({p.quantity} عدد)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeletePart(p.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Nesting Graphical Canvas Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Summary Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-right">
            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">بازدهی مصرف ورق:</span>
              <span className="text-lg font-black text-emerald-600 font-mono">{efficiencyPct}%</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">تعداد ورق کامل مورد نیاز:</span>
              <span className="text-lg font-black text-indigo-600 font-mono">{sheetsResult.length} ورق</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">مساحت ضایعات و پرتی:</span>
              <span className="text-lg font-black text-rose-600 font-mono">{wasteAreaM2} m²</span>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm space-y-1">
              <span className="text-[11px] text-slate-500 font-bold block">مساحت کل قطعات:</span>
              <span className="text-lg font-black text-amber-600 font-mono">{totalPlacedAreaM2.toFixed(2)} m²</span>
            </div>
          </div>

          {/* Sheets Visual Canvas with Zoom Controls */}
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white border border-slate-200 p-3.5 rounded-2xl shadow-sm">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Grid className="w-4 h-4 text-amber-600" />
                کنترل زوم و مقیاس نمای چیدمان ورق‌ها
              </span>
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition flex items-center gap-1 text-xs font-bold"
                  title="زوم این (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4 text-emerald-600" />
                  بزرگنمایی
                </button>
                <span className="px-2 text-xs font-mono font-bold text-slate-700">{Math.round(zoomLevel * 100)}%</span>
                <button
                  onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition flex items-center gap-1 text-xs font-bold"
                  title="زوم اوت (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4 text-indigo-600" />
                  کوچکنمایی
                </button>
                <button
                  onClick={() => setZoomLevel(1.0)}
                  className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-700 transition text-xs font-bold"
                  title="بازنشانی زوم"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                </button>
              </div>
            </div>

            {sheetsResult.map((placedParts, sheetIdx) => {
              const baseScale = 0.22;
              const scale = baseScale * zoomLevel; // Apply zoom level
              const canvasW = sheetWidth * scale;
              const canvasH = sheetHeight * scale;

              return (
                <div key={sheetIdx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                      <Grid className="w-4 h-4 text-amber-600" />
                      نقشه چیدمان روی ورق شماره {sheetIdx + 1} ({sheetWidth}×{sheetHeight}mm)
                    </h4>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {placedParts.length} قطعه چیده شده
                    </span>
                  </div>

                  {/* MDF Canvas Frame */}
                  <div className="overflow-x-auto p-2 bg-slate-900 rounded-xl">
                    <div
                      className="relative border-2 border-amber-500/80 bg-amber-950/40 rounded-lg shadow-inner mx-auto overflow-hidden transition-all duration-300"
                      style={{ width: `${canvasW}px`, height: `${canvasH}px` }}
                    >
                      {/* Grid overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />

                      {/* Render Each Placed Part Box */}
                      {placedParts.map((item, pIdx) => {
                        const px = item.x * scale;
                        const py = item.y * scale;
                        const pw = item.w * scale;
                        const ph = item.h * scale;

                        return (
                          <div
                            key={pIdx}
                            className="absolute border border-white/80 rounded flex flex-col items-center justify-center p-1 shadow-md text-white font-bold text-[10px] truncate transition hover:scale-[1.02] hover:z-20 cursor-pointer"
                            style={{
                              left: `${px}px`,
                              top: `${py}px`,
                              width: `${pw}px`,
                              height: `${ph}px`,
                              backgroundColor: item.part.color || '#3b82f6',
                            }}
                            title={`${item.part.name} (${item.w}×${item.h}mm) ${item.rotated ? '[چرخش ۹۰°]' : ''}`}
                          >
                            <span className="truncate max-w-full">{item.part.name}</span>
                            <span className="font-mono text-[9px] text-white/90">
                              {item.w}×{item.h} {item.rotated ? '🔄' : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* SolidWorks Nesting Macro Export Box */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                  <Code className="w-4 h-4 text-emerald-600" />
                  کد ماکروی سالیدورک چیدمان و نستیگ ورق‌ها (.SWP VBA)
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(macroCode);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'کپی شد!' : 'کپی کد ماکرو'}
                </button>
              </div>

              <pre className="p-4 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto max-h-64 border border-slate-800 leading-relaxed dir-ltr text-left">
                {macroCode}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
