import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomLayoutConfig, CabinetUnitLayout } from '../RoomPlannerStudio';
import { exportGroupToOBJ, exportGroupToSTL, downloadTextFile } from '../../utils/exporter3D';
import { Download, Maximize2, RotateCcw, Eye, ZoomIn, ZoomOut } from 'lucide-react';

interface Room3DViewerProps {
  config: RoomLayoutConfig;
  units: CabinetUnitLayout[];
  selectedUnitId?: string | null;
  onSelectUnit?: (id: string) => void;
}

export const Room3DViewer: React.FC<Room3DViewerProps> = ({
  config,
  units,
  selectedUnitId,
  onSelectUnit,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomGroupRef = useRef<THREE.Group | null>(null);
  const [exploded, setExploded] = useState<boolean>(false);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);

  const handleExport3D = (format: 'obj' | 'stl') => {
    if (!roomGroupRef.current) return;
    const cleanName = `room_layout_${config.roomType}_${config.layoutShape}`;
    if (format === 'obj') {
      const objData = exportGroupToOBJ(roomGroupRef.current, `${cleanName}.obj`);
      downloadTextFile(objData, `${cleanName}.obj`);
    } else {
      const stlData = exportGroupToSTL(roomGroupRef.current, `${cleanName}.stl`);
      downloadTextFile(stlData, `${cleanName}.stl`);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const explodeOffset = exploded ? 0.25 : 0;

    // Room Dimensions in meters
    const w1 = config.wall1Length / 1000;
    const w2 = config.wall2Length / 1000;
    const cH = config.ceilingHeight / 1000;

    // Three.js Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate

    const width = containerRef.current.clientWidth || 700;
    const height = containerRef.current.clientHeight || 480;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const distMult = 1 / zoomFactor;
    camera.position.set(w1 * 0.8 * distMult, cH * 1.2 * distMult, Math.max(w1, w2) * 1.5 * distMult);
    camera.lookAt(w1 / 2, cH / 3, 0);

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
    dirLight1.position.set(6, 10, 8);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const pointLight = new THREE.PointLight(0x38bdf8, 0.6, 10);
    pointLight.position.set(w1 / 2, cH - 0.2, w2 / 2);
    scene.add(pointLight);

    // Room Group
    const roomGroup = new THREE.Group();
    roomGroupRef.current = roomGroup;
    scene.add(roomGroup);

    // --- MATERIALS WITH DISTINCT VIBRANT COLORS ---
    // Floor Tile
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.1,
    });

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.7,
      side: THREE.DoubleSide,
    });

    // Base Cabinets (Vibrant Blue/Cyan)
    const baseCarcassMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Sky blue
      roughness: 0.4,
    });
    const baseDoorMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8, // Light cyan
      roughness: 0.2,
      metalness: 0.1,
    });

    // Countertop (Dark Quartz / Marble)
    const counterMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Dark slate quartz
      roughness: 0.2,
      metalness: 0.2,
    });

    // Wall Cabinets (Vibrant Emerald Green)
    const wallCarcassMat = new THREE.MeshStandardMaterial({
      color: 0x059669, // Emerald dark
      roughness: 0.4,
    });
    const wallDoorMat = new THREE.MeshStandardMaterial({
      color: 0x34d399, // Bright emerald green
      roughness: 0.2,
    });

    // Tall Pantry & Fridge (Deep Indigo & Stainless Steel)
    const tallMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5, // Indigo
      roughness: 0.3,
    });
    const fridgeBodyMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8, // Stainless Steel
      metalness: 0.8,
      roughness: 0.2,
    });

    // Sink (Silver Chrome)
    const chromeMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.9,
      roughness: 0.1,
    });

    // Gas Stove (Black Glass + Red Flame rings)
    const stoveMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.1,
    });
    const flameMat = new THREE.MeshStandardMaterial({
      color: 0xef4444, // Vibrant Red
      emissive: 0xd97706,
    });

    // Murphy Bed & Bedroom Wood
    const woodBedMat = new THREE.MeshStandardMaterial({
      color: 0xd97706, // Warm Amber Wood
      roughness: 0.5,
    });
    const bedSteelMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7, // Steel blue
      metalness: 0.8,
    });

    // Selected Highlight Material
    const selectedMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, // Amber yellow glow
      emissive: 0x78350f,
    });

    // --- 1. FLOOR GRID & TILES ---
    const floorGeo = new THREE.PlaneGeometry(w1 + 0.5, w2 + 0.5);
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.set(w1 / 2, 0, w2 / 2);
    roomGroup.add(floorMesh);

    const gridHelper = new THREE.GridHelper(Math.max(w1, w2) + 1, 20, 0x38bdf8, 0x475569);
    gridHelper.position.set(w1 / 2, 0.001, w2 / 2);
    roomGroup.add(gridHelper);

    // --- 2. ROOM WALLS ---
    // Wall 1 (Main back wall along X)
    const wall1Geo = new THREE.BoxGeometry(w1, cH, 0.08);
    const wall1Mesh = new THREE.Mesh(wall1Geo, wallMat);
    wall1Mesh.position.set(w1 / 2, cH / 2, -0.04);
    roomGroup.add(wall1Mesh);

    // Wall 2 (Side wall along Z if L/U shape)
    if (config.layoutShape === 'l_shape' || config.layoutShape === 'u_shape') {
      const wall2Geo = new THREE.BoxGeometry(0.08, cH, w2);
      const wall2Mesh = new THREE.Mesh(wall2Geo, wallMat);
      wall2Mesh.position.set(-0.04, cH / 2, w2 / 2);
      roomGroup.add(wall2Mesh);
    }

    // --- 3. UNITS RENDERER ---
    units.forEach((unit) => {
      const uW = unit.widthMm / 1000;
      const uH = unit.heightMm / 1000;
      const uD = unit.depthMm / 1000;
      const uX = unit.xPosMm / 1000 + uW / 2;

      const isSelected = unit.id === selectedUnitId;
      const activeCarcassMat = isSelected ? selectedMat : baseCarcassMat;

      const unitGroup = new THREE.Group();

      if (unit.wallIndex === 1) {
        // Wall 1 Positioning
        let uY = uH / 2;
        let uZ = uD / 2;

        if (unit.unitType === 'wall_standard') {
          uY = 1.45 + uH / 2; // Floating above countertop
          uZ = uD / 2;
        }

        unitGroup.position.set(uX, uY + (isSelected ? 0.05 : 0), uZ + (isSelected ? 0.05 : 0));
      } else if (unit.wallIndex === 2) {
        // Wall 2 Positioning (along Z axis)
        let uY = uH / 2;
        let uZ = uX; // xPos on wall 2 is distance along Z
        let uXpos = uD / 2;

        if (unit.unitType === 'wall_standard') {
          uY = 1.45 + uH / 2;
        }

        unitGroup.position.set(uXpos, uY, uZ);
        unitGroup.rotation.y = Math.PI / 2;
      }

      // Render based on Unit Type
      if (unit.unitType === 'base_sink') {
        // Sink Unit
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH - 0.05, uD), activeCarcassMat);
        unitGroup.add(body);

        // Countertop
        const counter = new THREE.Mesh(new THREE.BoxGeometry(uW + 0.02, 0.05, uD + 0.03), counterMat);
        counter.position.set(0, uH / 2 - 0.025, 0.015);
        unitGroup.add(counter);

        // Stainless Sink Bowl
        const sinkBowl = new THREE.Mesh(new THREE.BoxGeometry(uW * 0.65, 0.02, uD * 0.6), chromeMat);
        sinkBowl.position.set(0, uH / 2 + 0.001, 0);
        unitGroup.add(sinkBowl);

        // Doors
        const doorL = new THREE.Mesh(new THREE.BoxGeometry(uW / 2 - 0.005, uH - 0.15, 0.018), baseDoorMat);
        doorL.position.set(-uW / 4, -0.025, uD / 2 + 0.01);
        unitGroup.add(doorL);

        const doorR = new THREE.Mesh(new THREE.BoxGeometry(uW / 2 - 0.005, uH - 0.15, 0.018), baseDoorMat);
        doorR.position.set(uW / 4, -0.025, uD / 2 + 0.01);
        unitGroup.add(doorR);
      } else if (unit.unitType === 'base_gas') {
        // Gas Stove Unit
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH - 0.05, uD), activeCarcassMat);
        unitGroup.add(body);

        // Cooktop
        const counter = new THREE.Mesh(new THREE.BoxGeometry(uW + 0.02, 0.05, uD + 0.03), stoveMat);
        counter.position.set(0, uH / 2 - 0.025, 0.015);
        unitGroup.add(counter);

        // Burner Rings
        for (let bx of [-0.18, 0.18]) {
          for (let bz of [-0.1, 0.1]) {
            const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.01, 16), flameMat);
            ring.position.set(bx, uH / 2 + 0.005, bz);
            unitGroup.add(ring);
          }
        }
      } else if (unit.unitType === 'base_drawer') {
        // 3 Drawer Base Cabinet
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH - 0.05, uD), activeCarcassMat);
        unitGroup.add(body);

        const counter = new THREE.Mesh(new THREE.BoxGeometry(uW + 0.02, 0.05, uD + 0.03), counterMat);
        counter.position.set(0, uH / 2 - 0.025, 0.015);
        unitGroup.add(counter);

        // 3 Drawers
        const dH = (uH - 0.15) / 3;
        for (let i = 0; i < 3; i++) {
          const drawerFront = new THREE.Mesh(new THREE.BoxGeometry(uW - 0.01, dH - 0.005, 0.018), baseDoorMat);
          drawerFront.position.set(0, -uH / 2 + 0.1 + i * dH + dH / 2, uD / 2 + 0.01 + i * explodeOffset);
          unitGroup.add(drawerFront);

          const handle = new THREE.Mesh(new THREE.BoxGeometry(uW * 0.4, 0.012, 0.02), chromeMat);
          handle.position.set(0, -uH / 2 + 0.1 + i * dH + dH / 2, uD / 2 + 0.025 + i * explodeOffset);
          unitGroup.add(handle);
        }
      } else if (unit.unitType === 'wall_standard') {
        // Wall Mounted Cabinet (Emerald Green)
        const wallMatToUse = isSelected ? selectedMat : wallCarcassMat;
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH, uD), wallMatToUse);
        unitGroup.add(body);

        const doorL = new THREE.Mesh(new THREE.BoxGeometry(uW / 2 - 0.004, uH - 0.01, 0.018), wallDoorMat);
        doorL.position.set(-uW / 4, 0, uD / 2 + 0.01 + explodeOffset);
        unitGroup.add(doorL);

        const doorR = new THREE.Mesh(new THREE.BoxGeometry(uW / 2 - 0.004, uH - 0.01, 0.018), wallDoorMat);
        doorR.position.set(uW / 4, 0, uD / 2 + 0.01 + explodeOffset);
        unitGroup.add(doorR);
      } else if (unit.unitType === 'tall_fridge') {
        // Refrigerator Enclosure
        const boxMat = isSelected ? selectedMat : tallMat;
        const outerBox = new THREE.Mesh(new THREE.BoxGeometry(uW, uH, uD), boxMat);
        unitGroup.add(outerBox);

        // Refrigerator Appliance inside
        const fridgeBody = new THREE.Mesh(new THREE.BoxGeometry(uW - 0.08, uH - 0.2, uD - 0.05), fridgeBodyMat);
        fridgeBody.position.set(0, -0.05, 0.02);
        unitGroup.add(fridgeBody);
      } else if (unit.unitType === 'tall_pantry') {
        // Tall Pantry Unit
        const pantryMat = isSelected ? selectedMat : tallMat;
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH, uD), pantryMat);
        unitGroup.add(body);

        // Top door & bottom door
        const doorTop = new THREE.Mesh(new THREE.BoxGeometry(uW - 0.008, uH * 0.4, 0.018), baseDoorMat);
        doorTop.position.set(0, uH * 0.25, uD / 2 + 0.01);
        unitGroup.add(doorTop);

        const doorBot = new THREE.Mesh(new THREE.BoxGeometry(uW - 0.008, uH * 0.5, 0.018), baseDoorMat);
        doorBot.position.set(0, -uH * 0.2, uD / 2 + 0.01);
        unitGroup.add(doorBot);
      } else if (unit.unitType === 'murphy_bed') {
        // Murphy Bed Box & Mattress
        const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(uW, uH, uD), woodBedMat);
        unitGroup.add(boxMesh);

        // Bed Frame Face
        const bedFace = new THREE.Mesh(new THREE.BoxGeometry(uW - 0.1, uH - 0.2, 0.025), bedSteelMat);
        bedFace.position.set(0, 0, uD / 2 + 0.01);
        unitGroup.add(bedFace);
      } else {
        // Generic Cabinet / Wardrobe
        const body = new THREE.Mesh(new THREE.BoxGeometry(uW, uH, uD), activeCarcassMat);
        unitGroup.add(body);
      }

      roomGroup.add(unitGroup);
    });

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

      roomGroup.rotation.y += deltaX * 0.008;
      roomGroup.rotation.x += deltaY * 0.008;

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
  }, [config, units, selectedUnitId, exploded, zoomFactor]);

  return (
    <div className="relative w-full h-[480px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      {/* 3D Canvas Area */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Header Info */}
      <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-center gap-2 font-bold">
        <Eye className="w-4 h-4 text-sky-400" />
        <span>نمای سه‌بعدی تعاملی چیدمان {config.roomType === 'kitchen' ? 'آشپزخانه' : 'اتاق خواب'}</span>
      </div>

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
          <button
            onClick={() => setExploded(!exploded)}
            className={`px-3 py-1.5 rounded-lg transition font-bold ${
              exploded ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            💥 تفکیک یونیت‌ها (Explode View)
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
          <span>دیوار اصلی: <strong className="text-sky-400">{config.wall1Length}mm</strong></span>
          <span>دیوار دوم: <strong className="text-emerald-400">{config.wall2Length}mm</strong></span>
          <span>تعداد یونیت‌ها: <strong className="text-amber-400">{units.length} ماژول</strong></span>
        </div>
      </div>
    </div>
  );
};
