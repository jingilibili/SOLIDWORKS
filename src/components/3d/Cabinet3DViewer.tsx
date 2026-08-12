import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CabinetParams } from '../../types';

interface Cabinet3DViewerProps {
  params: CabinetParams;
}

export const Cabinet3DViewer: React.FC<Cabinet3DViewerProps> = ({ params }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [doorOpenAngle, setDoorOpenAngle] = useState<number>(0);
  const [exploded, setExploded] = useState<boolean>(false);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);

  const doorMeshRef = useRef<THREE.Group | null>(null);
  const leftDoorMeshRef = useRef<THREE.Group | null>(null);
  const explodeOffset = exploded ? 0.15 : 0; // meters offset for explode view

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions in meters for Three.js scene
    const w = params.width / 1000;
    const h = (params.height - params.toeKickHeight) / 1000;
    const d = params.depth / 1000;
    const t = params.materialThickness / 1000;
    const backT = params.backPanelThickness / 1000;
    const toeH = params.toeKickHeight / 1000;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // dark slate

    const width = containerRef.current.clientWidth || 600;
    const height = containerRef.current.clientHeight || 450;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(w * 2, h * 1.8, d * 3);
    camera.lookAt(0, h / 2, 0);

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
    dirLight1.position.set(5, 8, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.5); // accent cyan
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(3, 30, 0x38bdf8, 0x334155);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Cabinet Group
    const cabinetGroup = new THREE.Group();
    scene.add(cabinetGroup);

    // Materials
    const woodColor = new THREE.Color(params.finishColor || '#d2b48c');
    const cabinetMat = new THREE.MeshStandardMaterial({
      color: woodColor,
      roughness: 0.4,
      metalness: 0.1,
    });

    const darkInnerMat = new THREE.MeshStandardMaterial({
      color: 0x27272a,
      roughness: 0.6,
    });

    const metalMat = new THREE.MeshStandardMaterial({
      color: 0xd4d4d8,
      metalness: 0.8,
      roughness: 0.2,
    });

    // 1. Left Side Panel
    const sideGeo = new THREE.BoxGeometry(t, h, d);
    const leftSide = new THREE.Mesh(sideGeo, cabinetMat);
    leftSide.position.set(-w / 2 + t / 2 - explodeOffset, h / 2 + toeH, 0);
    cabinetGroup.add(leftSide);

    // 2. Right Side Panel
    const rightSide = new THREE.Mesh(sideGeo, cabinetMat);
    rightSide.position.set(w / 2 - t / 2 + explodeOffset, h / 2 + toeH, 0);
    cabinetGroup.add(rightSide);

    // 3. Bottom Panel
    const botGeo = new THREE.BoxGeometry(w - 2 * t, t, d);
    const bottomPanel = new THREE.Mesh(botGeo, cabinetMat);
    bottomPanel.position.set(0, toeH + t / 2 - explodeOffset, 0);
    cabinetGroup.add(bottomPanel);

    // 4. Top Panel / Rail
    const topPanel = new THREE.Mesh(botGeo, cabinetMat);
    topPanel.position.set(0, h + toeH - t / 2 + explodeOffset, 0);
    cabinetGroup.add(topPanel);

    // 5. Back Panel
    const backGeo = new THREE.BoxGeometry(w - 2 * t, h - 2 * t, backT);
    const backPanel = new THREE.Mesh(backGeo, darkInnerMat);
    backPanel.position.set(0, h / 2 + toeH, -d / 2 + backT / 2 - explodeOffset * 1.5);
    cabinetGroup.add(backPanel);

    // 6. Shelves
    if (params.shelfCount > 0) {
      const shelfGeo = new THREE.BoxGeometry(w - 2 * t - 0.002, t, d - 0.03);
      const stepY = (h - 2 * t) / (params.shelfCount + 1);
      for (let i = 1; i <= params.shelfCount; i++) {
        const shelf = new THREE.Mesh(shelfGeo, cabinetMat);
        shelf.position.set(0, toeH + t + i * stepY, 0.01);
        cabinetGroup.add(shelf);
      }
    }

    // 7. Toe Kick (پاخور)
    if (toeH > 0) {
      const toeGeo = new THREE.BoxGeometry(w, toeH, t);
      const toePanel = new THREE.Mesh(toeGeo, cabinetMat);
      toePanel.position.set(0, toeH / 2, d / 2 - t / 2);
      cabinetGroup.add(toePanel);
    }

    // 8. Doors & Hinges
    const radOpen = (doorOpenAngle * Math.PI) / 180;

    if (params.doorCount === 1) {
      const doorW = w - 0.003;
      const doorH = h - 0.003;

      const rightDoorPivot = new THREE.Group();
      rightDoorPivot.position.set(w / 2 - t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

      const doorMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), cabinetMat);
      doorMesh.position.set(-doorW / 2, 0, 0);
      rightDoorPivot.add(doorMesh);

      // Handle
      const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12), metalMat);
      handleMesh.position.set(-doorW + 0.04, 0, t / 2 + 0.015);
      rightDoorPivot.add(handleMesh);

      rightDoorPivot.rotation.y = radOpen;
      cabinetGroup.add(rightDoorPivot);
      doorMeshRef.current = rightDoorPivot;
    } else if (params.doorCount === 2) {
      const doorW = w / 2 - 0.003;
      const doorH = h - 0.003;

      // Left Door
      const leftDoorPivot = new THREE.Group();
      leftDoorPivot.position.set(-w / 2 + t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

      const doorLeftMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), cabinetMat);
      doorLeftMesh.position.set(doorW / 2, 0, 0);
      leftDoorPivot.add(doorLeftMesh);

      const handleLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12), metalMat);
      handleLeft.position.set(doorW - 0.04, 0, t / 2 + 0.015);
      leftDoorPivot.add(handleLeft);

      leftDoorPivot.rotation.y = -radOpen;
      cabinetGroup.add(leftDoorPivot);
      leftDoorMeshRef.current = leftDoorPivot;

      // Right Door
      const rightDoorPivot = new THREE.Group();
      rightDoorPivot.position.set(w / 2 - t, toeH + h / 2, d / 2 + t / 2 + explodeOffset);

      const doorRightMesh = new THREE.Mesh(new THREE.BoxGeometry(doorW, doorH, t), cabinetMat);
      doorRightMesh.position.set(-doorW / 2, 0, 0);
      rightDoorPivot.add(doorRightMesh);

      const handleRight = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.12), metalMat);
      handleRight.position.set(-doorW + 0.04, 0, t / 2 + 0.015);
      rightDoorPivot.add(handleRight);

      rightDoorPivot.rotation.y = radOpen;
      cabinetGroup.add(rightDoorPivot);
      doorMeshRef.current = rightDoorPivot;
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
  }, [params, doorOpenAngle, exploded]);

  return (
    <div className="relative w-full h-[450px] bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col">
      {/* 3D Canvas Area */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Control Overlay Bar */}
      <div className="absolute bottom-3 right-3 left-3 flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 backdrop-blur-md rounded-lg border border-slate-700/60 text-xs text-slate-200">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 cursor-pointer font-medium">
            🚪 بازشدن درب:
            <input
              type="range"
              min="0"
              max="110"
              value={doorOpenAngle}
              onChange={(e) => setDoorOpenAngle(Number(e.target.value))}
              className="w-24 accent-sky-500 cursor-pointer"
            />
            <span className="text-sky-400 font-mono">{doorOpenAngle}°</span>
          </label>

          <button
            onClick={() => setExploded(!exploded)}
            className={`px-2.5 py-1 rounded transition font-medium ${
              exploded ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            💥 نمای انفجاری (Explode)
          </button>
        </div>

        <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
          <span>عرض: <strong className="text-emerald-400">{params.width}mm</strong></span>
          <span>ارتفاع: <strong className="text-emerald-400">{params.height}mm</strong></span>
          <span>عمق: <strong className="text-emerald-400">{params.depth}mm</strong></span>
          <span>ورق: <strong className="text-amber-400">{params.materialThickness}mm</strong></span>
        </div>
      </div>
    </div>
  );
};
