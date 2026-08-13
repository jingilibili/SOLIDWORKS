import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CabinetParams } from '../../types';
import { exportGroupToOBJ, exportGroupToSTL, downloadTextFile } from '../../utils/exporter3D';
import { Download, Sparkles, Eye, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Cabinet3DViewerProps {
  params: CabinetParams;
  onUpdateParams?: (updated: CabinetParams) => void;
  isAutoSyncing?: boolean;
}

export const Cabinet3DViewer: React.FC<Cabinet3DViewerProps> = ({ params, onUpdateParams, isAutoSyncing }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cabinetGroupRef = useRef<THREE.Group | null>(null);
  const [doorOpenAngle, setDoorOpenAngle] = useState<number>(0);
  const [exploded, setExploded] = useState<boolean>(false);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);
  const [isWireframe, setIsWireframe] = useState<boolean>(false);
  const [finishOverride, setFinishOverride] = useState<string | null>(null);
  const [show3DLabels, setShow3DLabels] = useState<boolean>(true);

  const doorMeshRef = useRef<THREE.Group | null>(null);
  const leftDoorMeshRef = useRef<THREE.Group | null>(null);

  const handleExport3D = (format: 'obj' | 'stl') => {
    if (!cabinetGroupRef.current) return;
    const cleanName = params.name.replace(/[^a-zA-Z0-9]/g, '_') || 'cabinet_model';
    if (format === 'obj') {
      const objData = exportGroupToOBJ(cabinetGroupRef.current, `${cleanName}.obj`);
      downloadTextFile(objData, `${cleanName}.obj`);
    } else {
      const stlData = exportGroupToSTL(cabinetGroupRef.current, `${cleanName}.stl`);
      downloadTextFile(stlData, `${cleanName}.stl`);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const isWall = params.cabinetType === 'wall';
    const isTall = params.cabinetType === 'tall';
    const isDrawer = params.cabinetType === 'drawer' || params.hasDrawers;

    const explodeOffset = exploded ? 0.18 : 0; // meters offset for explode view

    // Dimensions in meters for Three.js scene
    const realToeH = isWall ? 0 : params.toeKickHeight / 1000;
    const w = params.width / 1000;
    const h = (params.height - (isWall ? 0 : params.toeKickHeight)) / 1000;
    const d = params.depth / 1000;
    const t = params.materialThickness / 1000;
    const backT = params.backPanelThickness / 1000;
    const toeH = realToeH;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const distMult = 1 / zoomFactor;
    const camYPos = isWall ? h * 1.2 : h * 1.5;
    camera.position.set(w * 1.8 * distMult, camYPos * distMult, d * 2.8 * distMult);
    camera.lookAt(0, h / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6); // accent cyan
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(3, 30, 0x38bdf8, 0x334155);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Cabinet Group
    const cabinetGroup = new THREE.Group();
    cabinetGroupRef.current = cabinetGroup;
    scene.add(cabinetGroup);

    // --- COLOR CODED VIBRANT MATERIALS FOR CLEAR IDENTIFICATION ---
    // 1. Carcass Body Material (Distinct Melamine/Wood - Amber/Oak or Sky Blue for Wall)
    const carcassColor = isWall ? 0x0284c7 : 0xd97706; // Sky blue for wall, Warm Amber for base/tall
    const carcassMat = new THREE.MeshStandardMaterial({
      color: carcassColor,
      roughness: 0.4,
      metalness: 0.1,
      wireframe: isWireframe,
    });

    // 2. Front Door / Drawer Finish Color (Vibrant Finish Color)
    const doorColor = finishOverride || params.finishColor || (isWall ? '#38bdf8' : '#34d399');
    const doorMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(doorColor),
      roughness: 0.25,
      metalness: 0.1,
      wireframe: isWireframe,
    });

    // 3. Back Panel Material (Dark Fibreboard)
    const backPanelMat = new THREE.MeshStandardMaterial({
      color: 0x334155, // Dark slate fibreboard
      roughness: 0.7,
      wireframe: isWireframe,
    });

    // 4. Inner Shelves Material (Light Beech Wood)
    const shelfMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7, // Light beech wood
      roughness: 0.3,
      wireframe: isWireframe,
    });

    // 5. Countertop Material (Granite Marble Slab for Base Cabinet)
    const counterMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // Bright Quartz Marble
      roughness: 0.15,
      metalness: 0.1,
    });

    // 6. Metal Hardware (Chrome / Aluminum)
    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.9,
      roughness: 0.1,
    });

    // 7. Toe Kick Material (Dark Charcoal / Stainless)
    const toeKickMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.5,
    });

    // --- CARCASS PANELS ---
    // 1. Left Side Panel
    const sideGeo = new THREE.BoxGeometry(t, h, d);
    const leftSide = new THREE.Mesh(sideGeo, carcassMat);
    leftSide.position.set(-w / 2 + t / 2 - explodeOffset, h / 2 + toeH, 0);
    cabinetGroup.add(leftSide);

    // 2. Right Side Panel
    const rightSide = new THREE.Mesh(sideGeo, carcassMat);
    rightSide.position.set(w / 2 - t / 2 + explodeOffset, h / 2 + toeH, 0);
    cabinetGroup.add(rightSide);

    // 3. Bottom Panel
    const botGeo = new THREE.BoxGeometry(w - 2 * t, t, d);
    const bottomPanel = new THREE.Mesh(botGeo, carcassMat);
    bottomPanel.position.set(0, toeH + t / 2 - explodeOffset, 0);
    cabinetGroup.add(bottomPanel);

    // 4. Top Panel / Top Rails
    const topPanel = new THREE.Mesh(botGeo, carcassMat);
    topPanel.position.set(0, h + toeH - t / 2 + explodeOffset, 0);
    cabinetGroup.add(topPanel);

    // 5. Back Panel
    const backGeo = new THREE.BoxGeometry(w - 2 * t, h - 2 * t, backT);
    const backPanel = new THREE.Mesh(backGeo, backPanelMat);
    backPanel.position.set(0, h / 2 + toeH, -d / 2 + backT / 2 - explodeOffset * 1.5);
    cabinetGroup.add(backPanel);

    // --- SPECIFIC MODEL FEATURES ---
    // A) Base Cabinet Countertop (صفحه سنگ/ام‌دی‌اف روی کابینت زمینی)
    if (params.cabinetType === 'base' || params.cabinetType === 'sink' || params.cabinetType === 'corner') {
      const topSlabGeo = new THREE.BoxGeometry(w + 0.04, 0.05, d + 0.04);
      const topSlab = new THREE.Mesh(topSlabGeo, counterMat);
      topSlab.position.set(0, h + toeH + 0.025 + explodeOffset * 0.8, 0.02);
      cabinetGroup.add(topSlab);
    }

    // B) Wall Cabinet Hanging Brackets (پایه‌های آویز دیواری روی کابینت هوایی)
    if (isWall) {
      const bracketGeo = new THREE.BoxGeometry(0.06, 0.08, 0.03);
      const bracketLeft = new THREE.Mesh(bracketGeo, metalMat);
      bracketLeft.position.set(-w / 2 + 0.08, h + toeH - 0.06, -d / 2 - 0.015);
      cabinetGroup.add(bracketLeft);

      const bracketRight = new THREE.Mesh(bracketGeo, metalMat);
      bracketRight.position.set(w / 2 - 0.08, h + toeH - 0.06, -d / 2 - 0.015);
      cabinetGroup.add(bracketRight);
    }

    // C) Shelves
    if (params.shelfCount > 0) {
      const shelfGeo = new THREE.BoxGeometry(w - 2 * t - 0.002, t, d - 0.03);
      const stepY = (h - 2 * t) / (params.shelfCount + 1);
      for (let i = 1; i <= params.shelfCount; i++) {
        const shelf = new THREE.Mesh(shelfGeo, shelfMat);
        shelf.position.set(0, toeH + t + i * stepY, 0.01);
        cabinetGroup.add(shelf);
      }
    }

    // D) Toe Kick (پاخور)
    if (toeH > 0) {
      const toeGeo = new THREE.BoxGeometry(w, toeH, t);
      const toePanel = new THREE.Mesh(toeGeo, toeKickMat);
      toePanel.position.set(0, toeH / 2, d / 2 - t / 2);
      cabinetGroup.add(toePanel);
    }

    // E) FRONT FACES: DRAWERS vs HINGED DOORS
    const radOpen = (doorOpenAngle * Math.PI) / 180;

    if (isDrawer || params.drawerCount > 0) {
      // DRAWER MODEL (کابینت کشویی با کشوهای مستقل و ریل‌های فلزی)
      const numDrawers = Math.max(2, params.drawerCount || 3);
      const drawerHeight = (h - 0.02) / numDrawers;

      for (let i = 0; i < numDrawers; i++) {
        const drawerGroup = new THREE.Group();
        const yPos = toeH + t + i * drawerHeight + drawerHeight / 2;

        // Front Face
        const faceGeo = new THREE.BoxGeometry(w - 0.004, drawerHeight - 0.004, t);
        const faceMesh = new THREE.Mesh(faceGeo, doorMat);
        faceMesh.position.set(0, 0, 0);
        drawerGroup.add(faceMesh);

        // Metallic Handle
        const handleMesh = new THREE.Mesh(new THREE.BoxGeometry(w * 0.4, 0.012, 0.02), metalMat);
        handleMesh.position.set(0, 0, t / 2 + 0.012);
        drawerGroup.add(handleMesh);

        // Slide out on doorOpenAngle slider!
        const slideOutOffset = (doorOpenAngle / 100) * (d * 0.7);
        drawerGroup.position.set(0, yPos, d / 2 + t / 2 + slideOutOffset + explodeOffset);

        cabinetGroup.add(drawerGroup);
      }
    } else {
      // HINGED DOORS MODEL (کابینت درب‌دار مفصلی)
      if (params.doorCount === 1) {
        const doorW = w - 0.003;
        const doorH = h - 0.003;

        const rightDoorPivot = new THREE.Group();
        rightDoorPivot.position.set(w / 2 - t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

        const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), doorMat);
        doorMesh.position.set(-doorW / 2, 0, 0);
        rightDoorPivot.add(doorMesh);

        // Handle
        const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14), metalMat);
        handleMesh.position.set(-doorW + 0.04, 0, t / 2 + 0.015);
        rightDoorPivot.add(handleMesh);

        rightDoorPivot.rotation.y = radOpen;
        cabinetGroup.add(rightDoorPivot);
        doorMeshRef.current = rightDoorPivot;
      } else if (params.doorCount >= 2) {
        const doorW = w / 2 - 0.003;
        const doorH = h - 0.003;

        // Left Door
        const leftDoorPivot = new THREE.Group();
        leftDoorPivot.position.set(-w / 2 + t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

        const doorLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), doorMat);
        doorLeftMesh.position.set(doorW / 2, 0, 0);
        leftDoorPivot.add(doorLeftMesh);

        const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14), metalMat);
        handleLeft.position.set(doorW - 0.04, 0, t / 2 + 0.015);
        leftDoorPivot.add(handleLeft);

        leftDoorPivot.rotation.y = -radOpen;
        cabinetGroup.add(leftDoorPivot);
        leftDoorMeshRef.current = leftDoorPivot;

        // Right Door
        const rightDoorPivot = new THREE.Group();
        rightDoorPivot.position.set(w / 2 - t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

        const doorRightMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), doorMat);
        doorRightMesh.position.set(-doorW / 2, 0, 0);
        rightDoorPivot.add(doorRightMesh);

        const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.14), metalMat);
        handleRight.position.set(-doorW + 0.04, 0, t / 2 + 0.015);
        rightDoorPivot.add(handleRight);

        rightDoorPivot.rotation.y = radOpen;
        cabinetGroup.add(rightDoorPivot);
        doorMeshRef.current = rightDoorPivot;
      }
    }

    // Interactive mouse rotation
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;

      cabinetGroup.rotation.y += deltaX * 0.008;
      cabinetGroup.rotation.x += deltaY * 0.008;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      setZoomFactor((prev) => Math.min(3.5, Math.max(0.4, prev + (e.deltaY < 0 ? 0.15 : -0.15))));
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
    domElem.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    // Animation Loop
    let animFrameId: number;
    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      domElem.removeEventListener('mousedown', handleMouseDown);
      domElem.removeEventListener('wheel', handleWheel);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [params, doorOpenAngle, exploded, zoomFactor, isWireframe, finishOverride]);

  const getCabinetTypeLabel = () => {
    switch (params.cabinetType) {
      case 'base': return 'کابینت زمینی همراه با صفحه سنگ و پاخور';
      case 'wall': return 'کابینت دیواری/هوایی معلق همراه با پایه‌های آویز';
      case 'tall': return 'کابینت ایستاده/سوپرمارکتی پنتری';
      case 'drawer': return 'یونیت کشویی زمینی با ریل‌های کشو';
      case 'sink': return 'کابینت زمینی سینک ضدآب PVC';
      default: return 'کابینت سفارشی';
    }
  };

  return (
    <div className="relative w-full h-[460px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      {/* 3D Canvas Area */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Model Badge */}
      <div className="absolute top-3 right-3 bg-slate-950/85 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-center gap-2 font-bold shadow-lg">
        <Eye className="w-4 h-4 text-amber-400" />
        <span>{getCabinetTypeLabel()}</span>
      </div>

      {/* Floating Visual Modification Tools Bar */}
      <div className="absolute top-12 right-3 bg-slate-950/90 backdrop-blur-md p-2 rounded-xl border border-slate-700/60 shadow-xl text-xs text-slate-200 flex flex-wrap items-center gap-2 z-10">
        <span className="text-[11px] font-bold text-slate-400">🎨 روکش:</span>
        <button
          onClick={() => {
            setFinishOverride('#d97706');
            if (onUpdateParams) onUpdateParams({ ...params, finishColor: '#d97706' });
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${finishOverride === '#d97706' || params.finishColor === '#d97706' ? 'bg-amber-600 text-white border-amber-400' : 'bg-slate-800 text-amber-400 border-slate-700'}`}
        >
          چوب بلوط
        </button>
        <button
          onClick={() => {
            setFinishOverride('#b45309');
            if (onUpdateParams) onUpdateParams({ ...params, finishColor: '#b45309' });
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${finishOverride === '#b45309' || params.finishColor === '#b45309' ? 'bg-amber-800 text-white border-amber-500' : 'bg-slate-800 text-amber-600 border-slate-700'}`}
        >
          گردو تیره
        </button>
        <button
          onClick={() => {
            setFinishOverride('#f8fafc');
            if (onUpdateParams) onUpdateParams({ ...params, finishColor: '#f8fafc' });
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${finishOverride === '#f8fafc' || params.finishColor === '#f8fafc' ? 'bg-slate-200 text-slate-900 border-white' : 'bg-slate-800 text-slate-200 border-slate-700'}`}
        >
          سفید براق
        </button>
        <button
          onClick={() => {
            setFinishOverride('#059669');
            if (onUpdateParams) onUpdateParams({ ...params, finishColor: '#059669' });
          }}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${finishOverride === '#059669' || params.finishColor === '#059669' ? 'bg-emerald-600 text-white border-emerald-400' : 'bg-slate-800 text-emerald-400 border-slate-700'}`}
        >
          زمردی
        </button>
        <button
          onClick={() => setFinishOverride(null)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${!finishOverride ? 'bg-sky-600 text-white border-sky-400' : 'bg-slate-800 text-sky-400 border-slate-700'}`}
        >
          اصلی
        </button>

        <button
          onClick={() => setIsWireframe(!isWireframe)}
          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${isWireframe ? 'bg-purple-600 text-white border-purple-400' : 'bg-slate-800 text-purple-300 border-slate-700'}`}
        >
          {isWireframe ? 'شبکه‌ای (Wireframe)' : 'تپر رنگی (Solid)'}
        </button>
      </div>

      {/* Interactive 3D Dimension Quick-Sliders Overlay */}
      {onUpdateParams && (
        <div className="absolute top-28 right-3 bg-slate-950/85 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60 shadow-xl text-xs text-slate-200 space-y-2 z-10 w-60">
          <div className="text-[11px] font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-1">
            <span>🎛️ تغییر ابعاد مستقیم روی 3D:</span>
            {isAutoSyncing && (
              <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/40 animate-pulse">
                SW Live
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>عرض یونیت:</span>
              <strong className="text-emerald-400 font-mono">{params.width}mm</strong>
            </div>
            <input
              type="range"
              min="300"
              max="1200"
              step="10"
              value={params.width}
              onChange={(e) => onUpdateParams({ ...params, width: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>ارتفاع یونیت:</span>
              <strong className="text-emerald-400 font-mono">{params.height}mm</strong>
            </div>
            <input
              type="range"
              min="400"
              max="2400"
              step="10"
              value={params.height}
              onChange={(e) => onUpdateParams({ ...params, height: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>عمق یونیت:</span>
              <strong className="text-emerald-400 font-mono">{params.depth}mm</strong>
            </div>
            <input
              type="range"
              min="250"
              max="900"
              step="10"
              value={params.depth}
              onChange={(e) => onUpdateParams({ ...params, depth: Number(e.target.value) })}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Floating Zoom Controls Bar */}
      <div className="absolute top-3 left-3 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-slate-700/60 shadow-lg text-xs font-bold text-white flex items-center gap-1 z-10">
        <button
          onClick={() => setZoomFactor((z) => Math.min(3.5, z + 0.25))}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
          title="بزرگنمایی (Zoom In)"
        >
          <ZoomIn className="w-4 h-4 text-sky-400" />
        </button>
        <span className="px-1 text-[11px] font-mono text-sky-300">{Math.round(zoomFactor * 100)}%</span>
        <button
          onClick={() => setZoomFactor((z) => Math.max(0.4, z - 0.25))}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
          title="کوچکنمایی (Zoom Out)"
        >
          <ZoomOut className="w-4 h-4 text-sky-400" />
        </button>
        <button
          onClick={() => setZoomFactor(1.0)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-200 transition"
          title="بازنشانی زوم"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Control Overlay Bar */}
      <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-700/60 text-xs text-slate-200">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-bold">
            {params.hasDrawers || params.cabinetType === 'drawer' ? '📏 بازشدن کشوها:' : '🚪 بازشدن درب:'}
            <input
              type="range"
              min="0"
              max="100"
              value={doorOpenAngle}
              onChange={(e) => setDoorOpenAngle(Number(e.target.value))}
              className="w-24 accent-sky-500 cursor-pointer"
            />
            <span className="text-sky-400 font-mono">{doorOpenAngle}%</span>
          </label>

          <button
            onClick={() => setExploded(!exploded)}
            className={`px-3 py-1.5 rounded-lg transition font-bold ${
              exploded ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            💥 نمای انفجاری (Explode)
          </button>

          {/* 3D Export Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => handleExport3D('obj')}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              title="دانلود مدل سه‌بعدی متنی جهت نرم‌افزارهای 3ds Max، Blender و KeyShot"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود .OBJ
            </button>
            <button
              onClick={() => handleExport3D('stl')}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold transition flex items-center gap-1"
              title="دانلود مدل STL جهت پرینتر سه‌بعدی و سالیدورک"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود .STL
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 text-slate-300 font-mono text-[11px]">
          <span>عرض: <strong className="text-emerald-400">{params.width}mm</strong></span>
          <span>ارتفاع: <strong className="text-emerald-400">{params.height}mm</strong></span>
          <span>عمق: <strong className="text-emerald-400">{params.depth}mm</strong></span>
          <span>ورق: <strong className="text-amber-400">{params.materialThickness}mm</strong></span>
        </div>
      </div>
    </div>
  );
};
