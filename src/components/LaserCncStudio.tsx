import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { 
  Flame, 
  Layers, 
  Settings, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Plus, 
  Trash2, 
  Code, 
  FileCode2, 
  Cpu, 
  Wrench,
  Maximize2,
  FolderOpen,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';
import { exportGroupToOBJ, exportGroupToSTL, downloadTextFile } from '../utils/exporter3D';
import { saveAutosaveState } from '../utils/scenarioStorage';

export interface LaserHole {
  id: string;
  type: 'round' | 'slot' | 'countersink';
  diameter: number; // mm
  length?: number; // mm for slot
  x: number; // mm from center
  y: number; // mm from center
}

export interface SheetMetalParams {
  id: string;
  partName: string;
  width: number; // mm
  height: number; // mm
  thickness: number; // mm (e.g. 2.0, 3.0, 4.0)
  material: 'ST37_Steel' | 'SS304_Stainless' | 'Aluminum_6061';
  cornerRadius: number; // mm
  hasBend: boolean;
  bendAngle: number; // deg e.g. 90
  bendFlangeHeight: number; // mm
  holes: LaserHole[];
}

export const DEFAULT_SHEET_METAL: SheetMetalParams = {
  id: 'sm-plate-01',
  partName: 'ورق اتصالی جک تخت تاشو (پایه نبشی فولادی)',
  width: 220,
  height: 140,
  thickness: 3.0,
  material: 'ST37_Steel',
  cornerRadius: 15,
  hasBend: true,
  bendAngle: 90,
  bendFlangeHeight: 50,
  holes: [
    { id: 'h1', type: 'round', diameter: 10, x: -70, y: 35 },
    { id: 'h2', type: 'round', diameter: 10, x: -70, y: -35 },
    { id: 'h3', type: 'round', diameter: 10, x: 70, y: 35 },
    { id: 'h4', type: 'round', diameter: 10, x: 70, y: -35 },
    { id: 'h5', type: 'slot', diameter: 12, length: 30, x: 0, y: 0 },
  ],
};

interface LaserCncStudioProps {
  initialParams?: SheetMetalParams;
  onOpenScenarioModal?: () => void;
}

export const LaserCncStudio: React.FC<LaserCncStudioProps> = ({ initialParams, onOpenScenarioModal }) => {
  const [params, setParams] = useState<SheetMetalParams>(initialParams || DEFAULT_SHEET_METAL);
  const [activeTab, setActiveTab] = useState<'3d_view' | 'vba_macro' | 'laser_bom'>('3d_view');
  const [copied, setCopied] = useState<boolean>(false);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);

  useEffect(() => {
    if (initialParams) {
      setParams(initialParams);
    }
  }, [initialParams]);

  useEffect(() => {
    saveAutosaveState('laser_cnc', params);
  }, [params]);

  // 3D Preview Ref
  const containerRef = useRef<HTMLDivElement>(null);
  const metalGroupRef = useRef<THREE.Group | null>(null);

  // Add new hole form
  const [newHole, setNewHole] = useState<Omit<LaserHole, 'id'>>({
    type: 'round',
    diameter: 8,
    length: 20,
    x: 0,
    y: 20,
  });

  // 3D Rendering Effect for Sheet Metal Part
  useEffect(() => {
    if (!containerRef.current) return;

    const w = params.width / 1000;
    const h = params.height / 1000;
    const t = params.thickness / 1000;
    const r = params.cornerRadius / 1000;
    const flangeH = params.bendFlangeHeight / 1000;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 400;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const distMult = 1 / zoomFactor;
    camera.position.set(w * 2 * distMult, h * 2 * distMult, (w + h) * 1.5 * distMult);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(2, 20, 0x38bdf8, 0x334155);
    grid.position.y = -h;
    scene.add(grid);

    const metalGroup = new THREE.Group();
    metalGroupRef.current = metalGroup;
    scene.add(metalGroup);

    // Metal Material
    const isStainless = params.material === 'SS304_Stainless';
    const isAlum = params.material === 'Aluminum_6061';

    const metalMat = new THREE.MeshStandardMaterial({
      color: isStainless ? 0xe2e8f0 : isAlum ? 0xc084fc : 0x94a3b8,
      metalness: 0.9,
      roughness: 0.25,
    });

    const holeEdgeMat = new THREE.MeshBasicMaterial({ color: 0x0284c7 });

    // Main Sheet Shape with holes
    const shape = new THREE.Shape();
    const hw = w / 2;
    const hh = h / 2;

    // Rounded rectangle path
    shape.moveTo(-hw + r, -hh);
    shape.lineTo(hw - r, -hh);
    shape.absarc(hw - r, -hh + r, r, -Math.PI / 2, 0, false);
    shape.lineTo(hw, hh - r);
    shape.absarc(hw - r, hh - r, r, 0, Math.PI / 2, false);
    shape.lineTo(-hw + r, hh);
    shape.absarc(-hw + r, hh - r, r, Math.PI / 2, Math.PI, false);
    shape.lineTo(-hw, -hh + r);
    shape.absarc(-hw + r, -hh + r, r, Math.PI, (3 * Math.PI) / 2, false);

    // Subtract Hole Path Cutouts
    params.holes.forEach((hole) => {
      const hx = hole.x / 1000;
      const hy = hole.y / 1000;
      const hr = hole.diameter / 2000;

      const holePath = new THREE.Path();
      if (hole.type === 'round' || hole.type === 'countersink') {
        holePath.absarc(hx, hy, hr, 0, Math.PI * 2, true);
      } else if (hole.type === 'slot') {
        const sl = (hole.length || 20) / 1000;
        holePath.moveTo(hx - sl / 2, hy - hr);
        holePath.lineTo(hx + sl / 2, hy - hr);
        holePath.absarc(hx + sl / 2, hy, hr, -Math.PI / 2, Math.PI / 2, false);
        holePath.lineTo(hx - sl / 2, hy + hr);
        holePath.absarc(hx - sl / 2, hy, hr, Math.PI / 2, (3 * Math.PI) / 2, false);
      }
      shape.holes.push(holePath);
    });

    const extrudeSettings = { depth: t, bevelEnabled: false };
    const sheetGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const sheetMesh = new THREE.Mesh(sheetGeo, metalMat);
    sheetMesh.position.z = -t / 2;
    metalGroup.add(sheetMesh);

    // Optional Flange Bend
    if (params.hasBend && flangeH > 0) {
      const flangeGeo = new THREE.BoxGeometry(w, flangeH, t);
      const flangeMesh = new THREE.Mesh(flangeGeo, metalMat);
      const radBend = (params.bendAngle * Math.PI) / 180;

      flangeMesh.position.set(0, hh + flangeH / 2, t / 2);
      flangeMesh.rotation.x = radBend;
      metalGroup.add(flangeMesh);
    }

    // Drag rotation
    let isDragging = false;
    let prevX = 0;
    let prevY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      metalGroup.rotation.y += (e.clientX - prevX) * 0.008;
      metalGroup.rotation.x += (e.clientY - prevY) * 0.008;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomFactor((prev) => Math.min(3.5, Math.max(0.4, prev + (e.deltaY < 0 ? 0.15 : -0.15))));
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    dom.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      dom.removeEventListener('wheel', onWheel);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [params, zoomFactor]);

  // Handle Add Hole
  const handleAddHole = () => {
    setParams({
      ...params,
      holes: [...params.holes, { ...newHole, id: 'h-' + Date.now() }],
    });
  };

  const handleDeleteHole = (id: string) => {
    setParams({ ...params, holes: params.holes.filter((h) => h.id !== id) });
  };

  // SolidWorks SheetMetal Parametric Macro Code
  const generateSolidWorksSheetMetalMacro = () => {
    return `' ==============================================================================
' SolidWorks Master - Sheet Metal Laser CNC VBA Macro
' Part: ${params.partName}
' Thickness: ${params.thickness}mm | Material: ${params.material}
' ==============================================================================
Sub main()
    Dim swApp As Object
    Dim Part As Object
    Dim boolstatus As Boolean

    Set swApp = Application.SldWorks
    Set Part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    If Part Is Nothing Then Set Part = swApp.ActiveDoc

    Dim W As Double: W = ${params.width / 1000}
    Dim H As Double: H = ${params.height / 1000}
    Dim T As Double: T = ${params.thickness / 1000}
    Dim R As Double: R = ${params.cornerRadius / 1000}

    ' 1. Create Base Flange Sketch
    boolstatus = Part.Extension.SelectByID2("Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True

    ' Create Base Rectangle
    Part.SketchManager.CreateCornerRectangle -W / 2, -H / 2, 0, W / 2, H / 2, 0
    Part.SketchManager.InsertSketch True

    ' Insert Sheet Metal Base Flange Feature
    Dim myFeature As Object
    Set myFeature = Part.FeatureManager.InsertSheetMetalBaseFlange2(T, False, 0.002, 0, 0, False, 0, 0, 0, Nothing, 0)

    ' 2. Add Laser Cut Holes
    boolstatus = Part.Extension.SelectByID2("", "FACE", 0, 0, T / 2, False, 0, Nothing, 0)
    Part.SketchManager.InsertSketch True

    ' Sketch Hole Cutouts
    ${params.holes
      .map(
        (h) => `Part.SketchManager.CreateCircleByRadius ${(h.x / 1000).toFixed(4)}, ${(h.y / 1000).toFixed(4)}, 0, ${(
          h.diameter / 2000
        ).toFixed(4)}`
      )
      .join('\n    ')}

    Part.FeatureManager.FeatureCut4 True, False, False, 1, 0, T, T, False, False, False, False, 0, 0, False, False, False, False, False, True, True, True, True, False, 0, 0, False

    ' Set Sheet Metal Material
    Part.SetMaterialPropertyName2 "Default", "C:/Program Files/SolidWorks Corp/SolidWorks/lang/english/bodies/matdb.sldmat", "${
      params.material === 'SS304_Stainless'
        ? 'AISI 304 Stainless Steel'
        : params.material === 'Aluminum_6061'
        ? '6061-T6 Aluminum'
        : 'ST37 Structural Steel'
    }"

    Part.ViewZoomtofit2
    MsgBox "قطعه ورقکاری و برش لیزر سی‌ان‌سی ${params.partName} با موفقیت در محیط Sheet Metal ساخته شد!", vbInformation, "SolidWorks Master"
End Sub
`;
  };

  const macroCode = generateSolidWorksSheetMetalMacro();

  // Export 3D
  const handleExport3D = (format: 'obj' | 'stl') => {
    if (!metalGroupRef.current) return;
    const name = params.partName.replace(/[^a-zA-Z0-9]/g, '_') || 'sheet_metal';
    if (format === 'obj') {
      const data = exportGroupToOBJ(metalGroupRef.current, `${name}.obj`);
      downloadTextFile(data, `${name}.obj`);
    } else {
      const data = exportGroupToSTL(metalGroupRef.current, `${name}.stl`);
      downloadTextFile(data, `${name}.stl`);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">استودیو برش لیزر سی‌ان‌سی و ورقکاری (CNC Laser & Sheet Metal Studio)</h2>
            <p className="text-xs text-slate-500">
              طراحی تخصصی یراق‌آلات فلزی، پایه‌های جک، نبشی‌های تقویت، سوراخکاری لیزر و تولید مستقیم ماکروی SheetMetal سالیدورک
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
            onClick={() => handleExport3D('obj')}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            دانلود .OBJ
          </button>
          <button
            onClick={() => handleExport3D('stl')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            دانلود .STL
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parametric Controls Column (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-600" />
              ابعاد و مشخصات قطعه فلزی
            </h3>
            <span className="text-xs text-cyan-600 font-bold">ابعاد به mm</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="col-span-2 space-y-1">
              <label className="text-slate-700 font-bold">نام قطعه فلزی:</label>
              <input
                type="text"
                value={params.partName}
                onChange={(e) => setParams({ ...params, partName: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-slate-800 font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold">طول قطعه (Width):</label>
              <input
                type="number"
                value={params.width}
                onChange={(e) => setParams({ ...params, width: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold">عرض قطعه (Height):</label>
              <input
                type="number"
                value={params.height}
                onChange={(e) => setParams({ ...params, height: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold">ضخامت ورق فلزی (Thickness):</label>
              <select
                value={params.thickness}
                onChange={(e) => setParams({ ...params, thickness: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono font-bold text-slate-800"
              >
                <option value={1.5}>۱.۵ mm</option>
                <option value={2.0}>۲.۰ mm</option>
                <option value={3.0}>۳.۰ mm (استاندارد یراق)</option>
                <option value={4.0}>۴.۰ mm</option>
                <option value={5.0}>۵.۰ mm (فولاد سنگین)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-bold">جنس ورق:</label>
              <select
                value={params.material}
                onChange={(e) => setParams({ ...params, material: e.target.value as any })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold text-slate-800"
              >
                <option value="ST37_Steel">فولاد ساختمانی ST37</option>
                <option value="SS304_Stainless">استیل ۳۰۴ ضدزنگ</option>
                <option value="Aluminum_6061">آلومینیوم 6061-T6</option>
              </select>
            </div>

            <div className="col-span-2 space-y-1">
              <label className="text-slate-700 font-bold">شعاع گردی کنج‌ها (Corner Radius mm):</label>
              <input
                type="number"
                value={params.cornerRadius}
                onChange={(e) => setParams({ ...params, cornerRadius: Number(e.target.value) })}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Laser Holes Generator */}
          <div className="space-y-3 border-t border-slate-200 pt-4">
            <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-600" />
              افزودن سوراخکاری سی‌ان‌سی لیزر
            </h3>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-bold">نوع سوراخ:</label>
                <select
                  value={newHole.type}
                  onChange={(e) => setNewHole({ ...newHole, type: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-bold"
                >
                  <option value="round">گرد ساده</option>
                  <option value="slot">لوبیا / کشویی (Slot)</option>
                  <option value="countersink">خزینه (Countersink)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">قطر سوراخ (mm):</label>
                <input
                  type="number"
                  value={newHole.diameter}
                  onChange={(e) => setNewHole({ ...newHole, diameter: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">موقعیت X (mm):</label>
                <input
                  type="number"
                  value={newHole.x}
                  onChange={(e) => setNewHole({ ...newHole, x: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-bold">موقعیت Y (mm):</label>
                <input
                  type="number"
                  value={newHole.y}
                  onChange={(e) => setNewHole({ ...newHole, y: Number(e.target.value) })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleAddHole}
              className="w-full py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              افزودن سوراخ لیزر
            </button>

            {/* List of Holes */}
            <div className="max-h-40 overflow-y-auto space-y-2 text-xs pt-1">
              {params.holes.map((h, idx) => (
                <div key={h.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="font-mono font-bold text-slate-800">
                    سوراخ #{idx + 1}: قطر {h.diameter}mm در X:{h.x} Y:{h.y} ({h.type === 'round' ? 'گرد' : 'کشویی'})
                  </span>
                  <button onClick={() => handleDeleteHole(h.id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Canvas & Output Macro Column (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 3D Interactive Metal Canvas */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                <Cpu className="w-4 h-4 text-cyan-600" />
                پیش‌نمایش سه بعدی قطعه فلزی و سوراخکاری لیزر
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                {params.holes.length} سوراخ لیزر • ضخامت {params.thickness}mm
              </span>
            </div>

            <div className="relative">
              <div ref={containerRef} className="w-full h-[360px] bg-slate-900 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing border border-slate-800" />
              
              {/* Floating Zoom Controls Bar */}
              <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-xs font-bold text-white flex items-center gap-1 z-10">
                <button
                  onClick={() => setZoomFactor((z) => Math.min(3.5, z + 0.25))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
                  title="بزرگنمایی (Zoom In)"
                >
                  <ZoomIn className="w-4 h-4 text-cyan-400" />
                </button>
                <span className="px-1 text-[11px] font-mono text-cyan-300">{Math.round(zoomFactor * 100)}%</span>
                <button
                  onClick={() => setZoomFactor((z) => Math.max(0.4, z - 0.25))}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
                  title="کوچکنمایی (Zoom Out)"
                >
                  <ZoomOut className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  onClick={() => setZoomFactor(1.0)}
                  className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
                  title="بازنشانی زوم"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>
            </div>
          </div>

          {/* SolidWorks SheetMetal Macro Output Box */}
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-xs font-bold text-[#0f172a] flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-600" />
                کد ماکروی سالیدورک SheetMetal VBA (.SWP)
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
                {copied ? 'کپی شد!' : 'کپی کد VBA'}
              </button>
            </div>

            <pre className="p-4 bg-slate-900 text-cyan-300 font-mono text-xs rounded-xl overflow-x-auto max-h-72 border border-slate-800 leading-relaxed dir-ltr text-left">
              {macroCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
