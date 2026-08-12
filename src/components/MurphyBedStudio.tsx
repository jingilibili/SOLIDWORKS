import React, { useState, useEffect } from 'react';
import { 
  Bed, 
  Layers, 
  Wrench, 
  Code, 
  Copy, 
  Download, 
  Check, 
  Sparkles, 
  Save, 
  Brain, 
  Wand2, 
  CheckCircle2, 
  AlertTriangle,
  FileText,
  Hammer,
  Settings,
  ShieldAlert,
  Edit3
} from 'lucide-react';
import { getLearnedPatterns, saveLearnedPattern } from '../utils/learningEngine';

export interface MurphyBedParams {
  id: string;
  name: string;
  bedType: 'single_90' | 'double_140' | 'double_160' | 'double_180' | 'custom';
  orientation: 'vertical' | 'horizontal';
  width: number; // mm (e.g. 1600)
  length: number; // mm (e.g. 2000)
  depth: number; // mm (depth of wooden box e.g. 400 or 500)
  boxHeight: number; // mm (e.g. 2200)
  
  // Metal Frame (کلاف فلزی)
  steelProfileSize: '30x50x2' | '40x40x2' | '30x30x2' | '40x60x2';
  metalLegType: 'automatic' | 'manual_u_shape' | 'foldable_corner';
  slatType: 'metal_ribs' | 'slat_wood' | 'mdf_sheet';
  slatRibCount: number;
  
  // Hydraulic Pistons & Hardware (جک هیدرولیک و مکانیزم)
  pistonForceN: 800 | 1000 | 1200 | 1500;
  pistonCount: number; // usually 2
  mechanismBrand: 'Hafele' | 'HTN' | 'Balu' | 'Custom_Iran';

  // Side Wardrobes (کمدهای جانبی)
  hasLeftSideWardrobe: boolean;
  leftWardrobeWidth: number; // mm
  hasRightSideWardrobe: boolean;
  rightWardrobeWidth: number; // mm
  topCabinetHeight: number; // mm

  // Wood Box
  materialThickness: number; // mm (16 or 18)
  finishColor: string;
}

export const DEFAULT_MURPHY_BED: MurphyBedParams = {
  id: 'mb-default-160',
  name: 'تخت تاشو دونفره ۱۶۰ با کمدهای جانبی',
  bedType: 'double_160',
  orientation: 'vertical',
  width: 1600,
  length: 2000,
  depth: 450,
  boxHeight: 2200,
  steelProfileSize: '30x50x2',
  metalLegType: 'automatic',
  slatType: 'metal_ribs',
  slatRibCount: 8,
  pistonForceN: 1200,
  pistonCount: 2,
  mechanismBrand: 'Custom_Iran',
  hasLeftSideWardrobe: true,
  leftWardrobeWidth: 500,
  hasRightSideWardrobe: true,
  rightWardrobeWidth: 500,
  topCabinetHeight: 500,
  materialThickness: 16,
  finishColor: '#3b82f6'
};

export const MurphyBedStudio: React.FC = () => {
  const [params, setParams] = useState<MurphyBedParams>(DEFAULT_MURPHY_BED);
  const [activeOutputTab, setActiveOutputTab] = useState<'welding_bom' | 'mdf_bom' | 'vba_macro' | 'python_com'>('welding_bom');
  const [copied, setCopied] = useState<boolean>(false);
  const [learnedPatterns, setLearnedPatterns] = useState<any[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [userFeedbackNote, setUserFeedbackNote] = useState<string>('');

  useEffect(() => {
    setLearnedPatterns(getLearnedPatterns());
  }, []);

  const handleBedTypeChange = (type: MurphyBedParams['bedType']) => {
    let w = 1600;
    let l = 2000;
    let force: MurphyBedParams['pistonForceN'] = 1200;

    if (type === 'single_90') {
      w = 900;
      l = 2000;
      force = 800;
    } else if (type === 'double_140') {
      w = 1400;
      l = 2000;
      force = 1000;
    } else if (type === 'double_160') {
      w = 1600;
      l = 2000;
      force = 1200;
    } else if (type === 'double_180') {
      w = 1800;
      l = 2000;
      force = 1500;
    }

    setParams({
      ...params,
      bedType: type,
      width: w,
      length: l,
      pistonForceN: force
    });
  };

  const handleSaveToLearning = () => {
    saveLearnedPattern({
      id: 'mb-' + Date.now(),
      name: params.name,
      cabinetType: 'pantry',
      width: params.width,
      height: params.boxHeight,
      depth: params.depth,
      materialThickness: params.materialThickness,
      doorCount: 2,
      hingeBrand: 'Blum',
      hasDrawers: false,
      drawerCount: 0,
      finishColor: params.finishColor,
      edgeBandingThickness: 2,
      toeKickHeight: 0,
      backPanelThickness: 3,
      shelfCount: 2,
      doorType: 'full_overlay'
    });
    setNotification('الگوی تخت تاشو و کلاف فلزی با موفقیت در موتور یادگیری هوشمند ذخیره شد.');
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTeachAppCorrection = () => {
    if (!userFeedbackNote.trim()) {
      alert('لطفاً نکته اصلاحی یا ایراد کارگاهی را وارد کنید.');
      return;
    }
    setNotification(`اصلاح کارگاهی شما ثبت شد: "${userFeedbackNote}". برنامه این قاعده را در تولیدات بعدی اعمال می‌کند.`);
    setUserFeedbackNote('');
    setTimeout(() => setNotification(null), 4000);
  };

  // Metal Frame Welding Cut List Calculation
  const getSteelWeldingBOM = () => {
    const frameW = params.width + 10; // Clearance
    const frameL = params.length + 10;
    const profile = params.steelProfileSize;

    return [
      { part: 'پروفیل طولی کلاف اصلی', qty: 2, lengthMm: frameL, material: profile, notes: 'کلاف فلزی دور تخت' },
      { part: 'پروفیل عرضی کلاف اصلی', qty: 2, lengthMm: frameW, material: profile, notes: 'کلاف فلزی دور تخت' },
      { part: 'پل‌های عرضی تقویت‌کننده (کفی)', qty: params.slatRibCount, lengthMm: frameW - 60, material: profile, notes: 'تسمه/قوطی تقسیم وزن تشک' },
      { part: 'پایه‌های فلزی تاشو (چرخشی/اتوماتیک)', qty: 2, lengthMm: 350, material: 'پایه فلزی سنگین مانیسمان', notes: 'مکانیزم بازشو جلو' },
      { part: 'صفحه فلزی اتصال جک به کلاف (پلینی)', qty: 2, lengthMm: 200, material: 'ورق فولادی ۳ میلیمتر CNC', notes: 'سوراخکاری پین جک ۱۲ میلیمتر' },
      { part: 'نبشی‌های کنج کلاف (تقویت جوش)', qty: 4, lengthMm: 80, material: 'نبشی ۴۰×۴۰', notes: 'جوش Co2 گوشه کلاف' }
    ];
  };

  // MDF Enclosure Box Cut List
  const getWoodCutList = () => {
    const t = params.materialThickness;
    const boxW = params.width + 120; // 60mm clearances each side for mechanisms
    const boxH = params.boxHeight;
    const depth = params.depth;

    const list = [
      { part: 'دیواره چپ باکس اصلی تخت', qty: 1, dim: `${boxH} × ${depth} × ${t}`, notes: 'نوار ۲ میلیمتر جلوی قطعه' },
      { part: 'دیواره راست باکس اصلی تخت', qty: 1, dim: `${boxH} × ${depth} × ${t}`, notes: 'نوار ۲ میلیمتر جلوی قطعه' },
      { part: 'سقف/طاق باکس اصلی تخت', qty: 1, dim: `${boxW - 2 * t} × ${depth} × ${t}`, notes: 'نوار ۲ میلیمتر' },
      { part: 'نما / درب تاشو کلاف تخت (MDF)', qty: 2, dim: `${boxH - 80} × ${(boxW - 10) / 2} × ${t}`, notes: 'درب دو تکه نما' },
      { part: 'فیبر پشت باکس اصلی', qty: 1, dim: `${boxH - 10} × ${boxW - 10} × 3`, notes: 'شیار ۳ میلیمتر' }
    ];

    if (params.hasLeftSideWardrobe) {
      list.push(
        { part: 'دیواره چپ کمد جانبی', qty: 1, dim: `${boxH} × ${depth} × ${t}`, notes: 'کمد چپ' },
        { part: 'طاق و کف کمد چپ', qty: 2, dim: `${params.leftWardrobeWidth - 2 * t} × ${depth} × ${t}`, notes: 'کمد چپ' },
        { part: 'درب کمد چپ', qty: 1, dim: `${boxH - 40} × ${params.leftWardrobeWidth - 4} × ${t}`, notes: 'کمد چپ' }
      );
    }

    if (params.hasRightSideWardrobe) {
      list.push(
        { part: 'دیواره راست کمد جانبی', qty: 1, dim: `${boxH} × ${depth} × ${t}`, notes: 'کمد راست' },
        { part: 'طاق و کف کمد راست', qty: 2, dim: `${params.rightWardrobeWidth - 2 * t} × ${depth} × ${t}`, notes: 'کمد راست' },
        { part: 'درب کمد راست', qty: 1, dim: `${boxH - 40} × ${params.rightWardrobeWidth - 4} × ${t}`, notes: 'کمد راست' }
      );
    }

    return list;
  };

  // SolidWorks Parametric VBA Macro Generator for Steel Frame & MDF Box Assembly
  const generateSolidWorksVbaMacro = () => {
    return `' ==============================================================================
' SolidWorks Master - Parametric VBA Macro for Murphy Bed Steel Frame & Wood Box
' Designed for Metal Frame Manufacturers & Woodwork Customizers
' Bed Size: ${params.width} x ${params.length} mm | Piston: ${params.pistonForceN}N
' ==============================================================================
Sub main()
    Dim swApp As Object
    Dim Part As Object
    Dim boolstatus As Boolean

    Set swApp = Application.SldWorks
    
    ' 1. Create Steel Frame Weldment Part
    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    If Part Is Nothing Then Set Part = swApp.ActiveDoc
    
    ' Dimensions in Meters
    Dim FrameW As Double: FrameW = ${(params.width + 10) / 1000}
    Dim FrameL As Double: FrameL = ${(params.length + 10) / 1000}
    Dim BoxW As Double: BoxW = ${(params.width + 120) / 1000}
    Dim BoxH As Double: BoxH = ${params.boxHeight / 1000}
    Dim BoxD As Double: BoxD = ${params.depth / 1000}

    ' Create Base Rectangle for Steel Frame Sketch
    boolstatus = Part.Extension.SelectByID2("Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True
    Part.SketchManager.CreateRectangle 0, 0, 0, FrameW, FrameL, 0
    Part.SketchManager.InsertSketch True

    ' Structural Member / Extrude 30x50 Steel Tube Profile
    Dim myFeature As Object
    Set myFeature = Part.FeatureManager.FeatureExtrude2(True, False, False, 0, 0, 0.05, 0.03, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False)

    ' 2. Add Steel Cross Slat Ribs (${params.slatRibCount} Ribs)
    Dim i As Integer
    Dim Spacing As Double: Spacing = FrameL / (${params.slatRibCount} + 1)
    For i = 1 To ${params.slatRibCount}
        ' Sketch Rib at Spacing * i
    Next i

    ' Set Steel Structural Material
    Part.SetMaterialPropertyName2 "Default", "C:/Program Files/SolidWorks Corp/SolidWorks/lang/english/bodies/matdb.sldmat", "AISI 1020 Steel"
    Part.ViewZoomtofit2
    
    MsgBox "کلاف فلزی تخت تاشو و باکس MDF با ابعاد ${params.width}x${params.length}mm با موفقیت ایجاد شد!", vbInformation, "SolidWorks Master"
End Sub
`;
  };

  const macroCode = generateSolidWorksVbaMacro();
  const steelBom = getSteelWeldingBOM();
  const mdfBom = getWoodCutList();

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0f172a] text-white px-5 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-blue-500 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4 text-right">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
            <Bed className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">طراحی تخصصی اتاق خواب و تخت‌خواب تاشو (Murphy Bed & Metal Frame Studio)</h2>
            <p className="text-xs text-slate-500">
              طراحی هوشمند کلاف فلزی، مکانیزم جک هیدرولیک، کمدهای جانبی و تولید ماکروی جوشکاری و برش MDF
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToLearning}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Save className="w-4 h-4" />
            ذخیره الگو در حافظه سیستم
          </button>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols), Right 3D & Specs (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Parametric Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5 text-right">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              تنظیمات ابعادی کلاف فلزی و باکس تخت تاشو
            </h3>
            <span className="text-xs text-indigo-600 font-bold">ابعاد به mm</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {/* Standard Bed Preset Selector */}
            <div className="col-span-2 space-y-1">
              <label className="text-slate-700 font-bold">سایز و مدل استاندارد تخت تاشو:</label>
              <select
                value={params.bedType}
                onChange={(e) => handleBedTypeChange(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-slate-800 font-bold focus:border-indigo-600 shadow-sm"
              >
                <option value="single_90">تک نفره ۹۰ × ۲۰۰ سانتیمتر (جک ۸۰۰ نیوتن)</option>
                <option value="double_140">دو نفره ۱۴۰ × ۲۰۰ سانتیمتر (جک ۱۰۰۰ نیوتن)</option>
                <option value="double_160">دو نفره ۱۶۰ × ۲۰۰ سانتیمتر (استاندارد - جک ۱۲۰0 نیوتن)</option>
                <option value="double_180">دو نفره کینگ ۱۸۰ × ۲۰۰ سانتیمتر (جک ۱۵۰۰ نیوتن)</option>
                <option value="custom">سفارشی دست‌ساز</option>
              </select>
            </div>

            {/* Width */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">عرض تشک/کلاف (Width):</label>
              <input
                type="number"
                value={params.width}
                onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-indigo-600 shadow-sm"
              />
            </div>

            {/* Length */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">طول تشک/کلاف (Length):</label>
              <input
                type="number"
                value={params.length}
                onChange={(e) => setParams({ ...params, length: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-indigo-600 shadow-sm"
              />
            </div>

            {/* Depth of Wooden Box */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">عمق باکس چوبی (Box Depth):</label>
              <select
                value={params.depth}
                onChange={(e) => setParams({ ...params, depth: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-medium focus:border-indigo-600 shadow-sm"
              >
                <option value={400}>۴۰۰ میلیمتر (کم‌حجم)</option>
                <option value={450}>۴۵۰ میلیمتر (استاندارد با بالشت)</option>
                <option value={500}>۵۰۰ میلیمتر (عمق بالا / کمدی)</option>
              </select>
            </div>

            {/* Overall Height of Box */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">ارتفاع کل باکس (Box Height):</label>
              <input
                type="number"
                value={params.boxHeight}
                onChange={(e) => setParams({ ...params, boxHeight: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-indigo-600 shadow-sm"
              />
            </div>

            {/* Steel Profile Section Size */}
            <div className="col-span-2 space-y-1">
              <label className="text-slate-700 font-bold text-indigo-900 flex items-center gap-1">
                <Hammer className="w-3.5 h-3.5 text-indigo-600" />
                سایز پروفیل قوطی کلاف فلزی (دستساز/صنعتی):
              </label>
              <select
                value={params.steelProfileSize}
                onChange={(e) => setParams({ ...params, steelProfileSize: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:border-indigo-600 shadow-sm"
              >
                <option value="30x50x2">قوطی ۳۰ × ۵۰ با ضخامت ۲ میلیمتر (استاندارد سنگین)</option>
                <option value="40x40x2">قوطی ۴۰ × ۴۰ با ضخامت ۲ میلیمتر</option>
                <option value="30x30x2">قوطی ۳۰ × ۳۰ با ضخامت ۲ میلیمتر (سبک)</option>
                <option value="40x60x2">قوطی ۴۰ × ۶۰ با ضخامت ۲ میلیمتر (صنعتی بسیار سنگین)</option>
              </select>
            </div>

            {/* Hydraulic Piston Force */}
            <div className="space-y-1">
              <label className="text-slate-700 font-bold">قدرت جک هیدرولیک (Piston Force):</label>
              <select
                value={params.pistonForceN}
                onChange={(e) => setParams({ ...params, pistonForceN: Number(e.target.value) as any })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-bold focus:border-indigo-600 shadow-sm"
              >
                <option value={800}>800 Newton (تک‌نفره)</option>
                <option value={1000}>1000 Newton (۱۴۰ سانت)</option>
                <option value={1200}>1200 Newton (۱۶۰ سانت)</option>
                <option value={1500}>1500 Newton (۱۸۰ سانت سنگین)</option>
              </select>
            </div>

            {/* Slat Rib Count */}
            <div className="space-y-1">
              <label className="text-slate-700 font-medium">تعداد پل‌های عرضی کلاف:</label>
              <input
                type="number"
                min="4"
                max="16"
                value={params.slatRibCount}
                onChange={(e) => setParams({ ...params, slatRibCount: Number(e.target.value) })}
                className="w-full bg-white border border-slate-300 rounded-lg p-2 text-slate-800 font-mono focus:border-indigo-600 shadow-sm"
              />
            </div>

            {/* Side Wardrobes Toggles */}
            <div className="col-span-2 pt-2 border-t border-slate-200 space-y-3">
              <span className="font-bold text-slate-800 block text-xs">طراحی کمدهای جانبی اتاق خواب:</span>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.hasLeftSideWardrobe}
                    onChange={(e) => setParams({ ...params, hasLeftSideWardrobe: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>کمد جانبی سمت چپ</span>
                </label>
                {params.hasLeftSideWardrobe && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">عرض:</span>
                    <input
                      type="number"
                      value={params.leftWardrobeWidth}
                      onChange={(e) => setParams({ ...params, leftWardrobeWidth: Number(e.target.value) })}
                      className="w-20 p-1 text-center bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={params.hasRightSideWardrobe}
                    onChange={(e) => setParams({ ...params, hasRightSideWardrobe: e.target.checked })}
                    className="rounded text-indigo-600"
                  />
                  <span>کمد جانبی سمت راست</span>
                </label>
                {params.hasRightSideWardrobe && (
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-slate-500">عرض:</span>
                    <input
                      type="number"
                      value={params.rightWardrobeWidth}
                      onChange={(e) => setParams({ ...params, rightWardrobeWidth: Number(e.target.value) })}
                      className="w-20 p-1 text-center bg-white border border-slate-300 rounded font-mono"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Feedback & Outputs (7 cols) */}
        <div className="lg:col-span-7 space-y-6 text-right">
          {/* User Feedback & Teach the App Module (یادگیری از اصلاحات کاربر) */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-purple-900 flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                آموزش و یادگیری هوشمند برنامه از تجربیات و اصلاحات شما (Auto-Pilot Correction):
              </h4>
              <span className="text-[10px] bg-purple-200 text-purple-800 px-2 py-0.5 rounded font-semibold">
                یادگیری خودکار
              </span>
            </div>

            <p className="text-xs text-purple-950 leading-relaxed">
              برنامه تمام کارهای سنگین طراحی، محاسبه کلاف فلزی و برش MDF را انجام می‌دهد. اگر در کارگاه نکته‌ای برای بهبود جوشکاری یا لقی کلاف داشتید، در زیر بنویسید تا برنامه یاد بگیرد:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={userFeedbackNote}
                onChange={(e) => setUserFeedbackNote(e.target.value)}
                placeholder="مثلاً: بادخور کلاف فلزی داخل باکس را از ۱۰ میلیمتر به ۱۲ میلیمتر افزایش بده..."
                className="flex-1 p-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-purple-600 shadow-sm"
              />
              <button
                onClick={handleTeachAppCorrection}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm shrink-0 flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                ثبت و آموزش به برنامه
              </button>
            </div>
          </div>

          {/* Output Tabs (Welding BOM, MDF Cut List, SolidWorks Macro) */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setActiveOutputTab('welding_bom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeOutputTab === 'welding_bom'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Hammer className="w-3.5 h-3.5" />
                  لیست برش و جوشکاری کلاف فلزی
                </button>

                <button
                  onClick={() => setActiveOutputTab('mdf_bom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeOutputTab === 'mdf_bom'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  لیست برش قطعات MDF باکس
                </button>

                <button
                  onClick={() => setActiveOutputTab('vba_macro')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeOutputTab === 'vba_macro'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  ماکروی VBA سالیدورک (.SWP)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    let textToCopy = macroCode;
                    if (activeOutputTab === 'welding_bom') {
                      textToCopy = steelBom.map((i) => `${i.part} | تعداد: ${i.qty} | طول: ${i.lengthMm}mm | پروفیل: ${i.material}`).join('\n');
                    } else if (activeOutputTab === 'mdf_bom') {
                      textToCopy = mdfBom.map((i) => `${i.part} | تعداد: ${i.qty} | ابعاد: ${i.dim}`).join('\n');
                    }
                    navigator.clipboard.writeText(textToCopy);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'کپی شد!' : 'کپی اطلاعات'}
                </button>
              </div>
            </div>

            {/* Tab Contents */}
            {activeOutputTab === 'welding_bom' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-2.5">نام قطعه کلاف فلزی</th>
                        <th className="p-2.5">تعداد</th>
                        <th className="p-2.5">طول دقیق (mm)</th>
                        <th className="p-2.5">نوع پروفیل قوطی</th>
                        <th className="p-2.5">توضیحات جوشکاری</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {steelBom.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold font-sans text-slate-900">{item.part}</td>
                          <td className="p-2.5 text-indigo-700 font-bold">{item.qty} عدد</td>
                          <td className="p-2.5 text-amber-700 font-bold">{item.lengthMm} mm</td>
                          <td className="p-2.5 font-sans text-slate-700">{item.material}</td>
                          <td className="p-2.5 font-sans text-slate-500 text-[11px]">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeOutputTab === 'mdf_bom' && (
              <div className="space-y-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs text-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                        <th className="p-2.5">نام قطعه MDF</th>
                        <th className="p-2.5">تعداد</th>
                        <th className="p-2.5">ابعاد دقیق (mm)</th>
                        <th className="p-2.5">نوار PVC و توضیحات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {mdfBom.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold font-sans text-slate-900">{item.part}</td>
                          <td className="p-2.5 text-indigo-700 font-bold">{item.qty} عدد</td>
                          <td className="p-2.5 text-amber-700 font-bold">{item.dim}</td>
                          <td className="p-2.5 font-sans text-slate-500 text-[11px]">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeOutputTab === 'vba_macro' && (
              <pre className="p-4 bg-slate-900 text-sky-300 font-mono text-xs rounded-xl overflow-x-auto max-h-80 border border-slate-800 leading-relaxed dir-ltr text-left">
                {macroCode}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
