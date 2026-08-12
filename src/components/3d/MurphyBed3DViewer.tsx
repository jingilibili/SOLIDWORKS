import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { MurphyBedParams } from '../MurphyBedStudio';

interface MurphyBed3DViewerProps {
  params: MurphyBedParams;
  customMechanismName?: string;
}

export const MurphyBed3DViewer: React.FC<MurphyBed3DViewerProps> = ({ params, customMechanismName }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bedFoldAngle, setBedFoldAngle] = useState<number>(75); // 0 = fully closed (vertical), 90 = fully open (horizontal)
  const [exploded, setExploded] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'solid' | 'wireframe'>('solid');

  const explodeOffset = exploded ? 0.18 : 0; // meters

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions in meters for Three.js scene
    const w = params.width / 1000;
    const l = params.length / 1000;
    const depth = params.depth / 1000;
    const boxH = params.boxHeight / 1000;
    const t = params.materialThickness / 1000;

    // Side wardrobes dimensions
    const leftW = params.hasLeftSideWardrobe ? params.leftWardrobeWidth / 1000 : 0;
    const rightW = params.hasRightSideWardrobe ? params.rightWardrobeWidth / 1000 : 0;

    // Box outer width
    const boxW = w + 0.12; // 60mm clearance each side

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera to see entire bed structure and side wardrobes
    const totalSpan = boxW + leftW + rightW;
    camera.position.set(totalSpan * 1.2, boxH * 1.2, l * 2.2);
    camera.lookAt(0, boxH / 2, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 10, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const accentLight = new THREE.DirectionalLight(0x38bdf8, 0.6); // cyan accent
    accentLight.position.set(-5, -2, -5);
    scene.add(accentLight);

    // Floor Grid
    const gridHelper = new THREE.GridHelper(6, 30, 0x38bdf8, 0x334155);
    gridHelper.position.y = 0;
    scene.add(gridHelper);

    // Master World Group
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // Materials
    const woodColor = new THREE.Color(params.finishColor || '#3b82f6');
    const woodMat = new THREE.MeshStandardMaterial({
      color: woodColor,
      roughness: 0.4,
      wireframe: viewMode === 'wireframe',
    });

    const darkInnerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      wireframe: viewMode === 'wireframe',
    });

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // silver metallic steel
      metalness: 0.85,
      roughness: 0.2,
      wireframe: viewMode === 'wireframe',
    });

    const mattressMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc, // white mattress
      roughness: 0.9,
      wireframe: viewMode === 'wireframe',
    });

    const pistonMat = new THREE.MeshStandardMaterial({
      color: 0xe11d48, // red/chrome piston
      metalness: 0.9,
      roughness: 0.1,
    });

    // ==========================================
    // 1. MAIN WOODEN ENCLOSURE BOX (باکس دیواری MDF)
    // ==========================================
    const boxGroup = new THREE.Group();
    worldGroup.add(boxGroup);

    // Left Box Side Panel
    const sideBoxGeo = new THREE.BoxGeometry(t, boxH, depth);
    const leftSideMesh = new THREE.Mesh(sideBoxGeo, woodMat);
    leftSideMesh.position.set(-boxW / 2 + t / 2 - explodeOffset, boxH / 2, depth / 2);
    boxGroup.add(leftSideMesh);

    // Right Box Side Panel
    const rightSideMesh = new THREE.Mesh(sideBoxGeo, woodMat);
    rightSideMesh.position.set(boxW / 2 - t / 2 + explodeOffset, boxH / 2, depth / 2);
    boxGroup.add(rightSideMesh);

    // Top Box Panel (طاق)
    const topBoxGeo = new THREE.BoxGeometry(boxW - 2 * t, t, depth);
    const topBoxMesh = new THREE.Mesh(topBoxGeo, woodMat);
    topBoxMesh.position.set(0, boxH - t / 2 + explodeOffset, depth / 2);
    boxGroup.add(topBoxMesh);

    // Bottom Kick/Header Panel
    const botBoxMesh = new THREE.Mesh(topBoxGeo, woodMat);
    botBoxMesh.position.set(0, t / 2 - explodeOffset, depth / 2);
    boxGroup.add(botBoxMesh);

    // Back MDF Board
    const backGeo = new THREE.BoxGeometry(boxW - 2 * t, boxH - 2 * t, 0.003);
    const backMesh = new THREE.Mesh(backGeo, darkInnerMat);
    backMesh.position.set(0, boxH / 2, -explodeOffset);
    boxGroup.add(backMesh);

    // ==========================================
    // 2. SIDE WARDROBES (کمدهای جانبی)
    // ==========================================
    if (params.hasLeftSideWardrobe && leftW > 0) {
      const leftWardrobeGroup = new THREE.Group();
      leftWardrobeGroup.position.set(-boxW / 2 - leftW / 2 - explodeOffset * 1.5, boxH / 2, depth / 2);

      const lWardGeo = new THREE.BoxGeometry(leftW, boxH, depth);
      const lWardMesh = new THREE.Mesh(lWardGeo, woodMat);
      leftWardrobeGroup.add(lWardMesh);

      // Door dividing line
      const lineGeo = new THREE.BoxGeometry(0.002, boxH - 0.02, depth + 0.002);
      const lineMesh = new THREE.Mesh(lineGeo, darkInnerMat);
      leftWardrobeGroup.add(lineMesh);

      boxGroup.add(leftWardrobeGroup);
    }

    if (params.hasRightSideWardrobe && rightW > 0) {
      const rightWardrobeGroup = new THREE.Group();
      rightWardrobeGroup.position.set(boxW / 2 + rightW / 2 + explodeOffset * 1.5, boxH / 2, depth / 2);

      const rWardGeo = new THREE.BoxGeometry(rightW, boxH, depth);
      const rWardMesh = new THREE.Mesh(rWardGeo, woodMat);
      rightWardrobeGroup.add(rWardMesh);

      boxGroup.add(rightWardrobeGroup);
    }

    // ==========================================
    // 3. PIVOTING BED FRAME ASSEMBLY (کلاف فلزی + تشک + پایه)
    // ==========================================
    // The main pivot axis is located at the bottom rear of the box
    const pivotHeight = 0.25; // 250mm from floor
    const pivotDepth = 0.12; // 120mm inside box

    const bedPivotGroup = new THREE.Group();
    bedPivotGroup.position.set(0, pivotHeight, pivotDepth);
    worldGroup.add(bedPivotGroup);

    // Rotate bed frame according to fold angle
    // Angle 0 = vertical (standing inside box) -> rotation.x = 0
    // Angle 90 = horizontal (open bed on floor) -> rotation.x = Math.PI / 2
    const foldRad = (bedFoldAngle * Math.PI) / 180;
    bedPivotGroup.rotation.x = foldRad;

    // Steel Bed Frame Structure (کلاف قوطی)
    const steelProfileThickness = 0.03; // 30mm x 50mm profile
    const frameGroup = new THREE.Group();
    bedPivotGroup.add(frameGroup);

    // Left Longitudinal Steel Tube
    const steelLongGeo = new THREE.BoxGeometry(steelProfileThickness, l, steelProfileThickness);
    const leftSteelMesh = new THREE.Mesh(steelLongGeo, steelMat);
    leftSteelMesh.position.set(-w / 2 + steelProfileThickness / 2, l / 2, steelProfileThickness / 2);
    frameGroup.add(leftSteelMesh);

    // Right Longitudinal Steel Tube
    const rightSteelMesh = new THREE.Mesh(steelLongGeo, steelMat);
    rightSteelMesh.position.set(w / 2 - steelProfileThickness / 2, l / 2, steelProfileThickness / 2);
    frameGroup.add(rightSteelMesh);

    // Top Cross Steel Tube
    const steelCrossGeo = new THREE.BoxGeometry(w, steelProfileThickness, steelProfileThickness);
    const topSteelMesh = new THREE.Mesh(steelCrossGeo, steelMat);
    topSteelMesh.position.set(0, l - steelProfileThickness / 2, steelProfileThickness / 2);
    frameGroup.add(topSteelMesh);

    // Bottom Cross Steel Tube
    const botSteelMesh = new THREE.Mesh(steelCrossGeo, steelMat);
    botSteelMesh.position.set(0, steelProfileThickness / 2, steelProfileThickness / 2);
    frameGroup.add(botSteelMesh);

    // Slat Cross Ribs (پل‌های عرضی)
    const ribCount = Math.max(4, params.slatRibCount);
    const stepRib = l / (ribCount + 1);
    const ribGeo = new THREE.BoxGeometry(w - 2 * steelProfileThickness, steelProfileThickness * 0.8, steelProfileThickness * 0.8);

    for (let i = 1; i <= ribCount; i++) {
      const ribMesh = new THREE.Mesh(ribGeo, steelMat);
      ribMesh.position.set(0, i * stepRib, steelProfileThickness / 2);
      frameGroup.add(ribMesh);
    }

    // Wooden Facade Board / Front Door (MDF Panel attached under frame)
    const frontDoorGeo = new THREE.BoxGeometry(boxW - 0.01, l, t);
    const frontDoorMesh = new THREE.Mesh(frontDoorGeo, woodMat);
    frontDoorMesh.position.set(0, l / 2, -t / 2 - explodeOffset);
    frameGroup.add(frontDoorMesh);

    // Mattress (تشک)
    const mattressThickness = 0.20; // 200mm
    const mattressGeo = new THREE.BoxGeometry(w - 0.04, l - 0.04, mattressThickness);
    const mattressMesh = new THREE.Mesh(mattressGeo, mattressMat);
    mattressMesh.position.set(0, l / 2, steelProfileThickness + mattressThickness / 2 + explodeOffset);
    frameGroup.add(mattressMesh);

    // Foldable Legs at the head/front end of bed (پایه‌های فلزی تاشو)
    const legLength = 0.35; // 350mm leg height
    const legGeo = new THREE.BoxGeometry(steelProfileThickness, legLength, steelProfileThickness);

    const leftLegMesh = new THREE.Mesh(legGeo, steelMat);
    leftLegMesh.position.set(-w / 2 + 0.08, l - 0.05, steelProfileThickness + legLength / 2);
    // Auto leg angle: when bed is open (90deg), leg stands perpendicular to floor
    leftLegMesh.rotation.x = -foldRad;
    frameGroup.add(leftLegMesh);

    const rightLegMesh = new THREE.Mesh(legGeo, steelMat);
    rightLegMesh.position.set(w / 2 - 0.08, l - 0.05, steelProfileThickness + legLength / 2);
    rightLegMesh.rotation.x = -foldRad;
    frameGroup.add(rightLegMesh);

    // Hydraulic Pistons (جک‌های نیتروژنی هیدرولیک)
    const pistonGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12);

    const leftPiston = new THREE.Mesh(pistonGeo, pistonMat);
    leftPiston.position.set(-boxW / 2 + 0.04, pivotHeight + 0.15, pivotDepth + 0.1);
    leftPiston.rotation.z = Math.PI / 4;
    worldGroup.add(leftPiston);

    const rightPiston = new THREE.Mesh(pistonGeo, pistonMat);
    rightPiston.position.set(boxW / 2 - 0.04, pivotHeight + 0.15, pivotDepth + 0.1);
    rightPiston.rotation.z = -Math.PI / 4;
    worldGroup.add(rightPiston);

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

      worldGroup.rotation.y += deltaX * 0.008;
      worldGroup.rotation.x += deltaY * 0.008;

      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', handleMouseDown);
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
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      renderer.dispose();
    };
  }, [params, bedFoldAngle, exploded, viewMode]);

  return (
    <div className="relative w-full h-[480px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      {/* 3D Canvas Element */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Info Tag */}
      <div className="absolute top-3 right-3 flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-200 shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
        <span className="font-bold text-indigo-300">
          پنل سه بعدی تخت تاشو {customMechanismName ? `(${customMechanismName})` : ''}
        </span>
      </div>

      {/* Interactive Control Overlay Bar */}
      <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/85 backdrop-blur-md rounded-xl border border-slate-700/60 text-xs text-slate-200 shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          {/* Fold / Unfold Motion Angle Slider */}
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-200">
            <span>🛏️ زاویه بازشو تخت:</span>
            <input
              type="range"
              min="0"
              max="90"
              value={bedFoldAngle}
              onChange={(e) => setBedFoldAngle(Number(e.target.value))}
              className="w-28 accent-indigo-500 cursor-pointer"
            />
            <span className="text-indigo-400 font-mono w-10 text-left">
              {bedFoldAngle === 0 ? 'بسته (0°)' : bedFoldAngle === 90 ? 'کاملاً باز (90°)' : `${bedFoldAngle}°`}
            </span>
          </label>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setBedFoldAngle(0)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                bedFoldAngle === 0 ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🔒 بسته (عمودی)
            </button>
            <button
              onClick={() => setBedFoldAngle(45)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                bedFoldAngle === 45 ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌗 نیمه‌باز (45°)
            </button>
            <button
              onClick={() => setBedFoldAngle(90)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition ${
                bedFoldAngle === 90 ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-700'
              }`}
            >
              🔓 باز کامل (90°)
            </button>
          </div>

          {/* Explode View Toggle */}
          <button
            onClick={() => setExploded(!exploded)}
            className={`px-2.5 py-1 rounded-lg transition text-[11px] font-bold ${
              exploded ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            💥 نمای تفکیکی (Explode)
          </button>

          {/* Wireframe Toggle */}
          <button
            onClick={() => setViewMode(viewMode === 'solid' ? 'wireframe' : 'solid')}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold border border-slate-700 transition"
          >
            {viewMode === 'solid' ? '🌐 نمای سیمی (Wireframe)' : '🎨 نمای توپر (Solid)'}
          </button>
        </div>

        {/* Real-time Dimensions Tag */}
        <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
          <span>تشک: <strong className="text-indigo-400">{params.width}×{params.length}mm</strong></span>
          <span>باکس: <strong className="text-emerald-400">{params.boxHeight}×{params.depth}mm</strong></span>
          <span>جک: <strong className="text-amber-400">{params.pistonForceN}N</strong></span>
        </div>
      </div>
    </div>
  );
};
