import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { HardwareParams } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Hardware3DViewerProps {
  params: HardwareParams;
}

export const Hardware3DViewer: React.FC<Hardware3DViewerProps> = ({ params }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoomFactor, setZoomFactor] = useState<number>(1.0);

  useEffect(() => {
    if (!containerRef.current) return;

    const l = params.length / 1000;
    const w = params.width / 1000;
    const h = params.height / 1000;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // very dark slate

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 350;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 10);
    const distMult = 1 / zoomFactor;
    camera.position.set(l * 1.5 * distMult, h * 3 * distMult, w * 2.5 * distMult);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    const grid = new THREE.GridHelper(1, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = -h / 2;
    scene.add(grid);

    const group = new THREE.Group();
    scene.add(group);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0xcbd5e1,
      metalness: 0.9,
      roughness: 0.2,
    });

    const brassMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      metalness: 0.8,
      roughness: 0.3,
    });

    if (params.category === 'hinge') {
      // Hinge Base Plate
      const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(l * 0.6, h * 0.3, w * 0.5), steelMat);
      baseMesh.position.set(-l * 0.2, 0, 0);
      group.add(baseMesh);

      // Hinge Arm
      const armMesh = new THREE.Mesh(new THREE.BoxGeometry(l * 0.5, h * 0.4, w * 0.3), steelMat);
      armMesh.position.set(0, h * 0.3, 0);
      group.add(armMesh);

      // Hinge Cup
      if (params.cupDiameter) {
        const cupR = (params.cupDiameter / 2) / 1000;
        const cupH = (params.cupDepth || 11.5) / 1000;
        const cupMesh = new THREE.Mesh(new THREE.CylinderGeometry(cupR, cupR, cupH, 32), brassMat);
        cupMesh.position.set(l * 0.25, -cupH / 2, 0);
        group.add(cupMesh);
      }
    } else if (params.category === 'handle') {
      // Linear Handle Bar
      const handleMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, l, 24), steelMat);
      handleMesh.rotation.z = Math.PI / 2;
      group.add(handleMesh);

      // Standoff Feet
      const pitch = (params.holePitch || 128) / 1000;
      const footGeo = new THREE.CylinderGeometry(0.005, 0.005, h, 16);
      const foot1 = new THREE.Mesh(footGeo, steelMat);
      foot1.position.set(-pitch / 2, -h / 2, 0);
      group.add(foot1);

      const foot2 = new THREE.Mesh(footGeo, steelMat);
      foot2.position.set(pitch / 2, -h / 2, 0);
      group.add(foot2);
    } else {
      // Standard Fitting Box Body
      const boxMesh = new THREE.Mesh(new THREE.BoxGeometry(l, h, w), steelMat);
      group.add(boxMesh);
    }

    // Drag rotate
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
      const dx = e.clientX - prevX;
      const dy = e.clientY - prevY;
      group.rotation.y += dx * 0.01;
      group.rotation.x += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => (isDragging = false);

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
      if (!isDragging) group.rotation.y += 0.005;
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

  return (
    <div className="relative w-full h-[350px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Zoom Controls Bar */}
      <div className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur p-1 rounded-lg border border-slate-700 shadow-lg text-xs font-bold text-white flex items-center gap-1 z-10">
        <button
          onClick={() => setZoomFactor((z) => Math.min(3.5, z + 0.25))}
          className="p-1 hover:bg-slate-800 rounded text-slate-200 transition"
          title="بزرگنمایی (Zoom In)"
        >
          <ZoomIn className="w-3.5 h-3.5 text-sky-400" />
        </button>
        <span className="px-1 text-[10px] font-mono text-sky-300">{Math.round(zoomFactor * 100)}%</span>
        <button
          onClick={() => setZoomFactor((z) => Math.max(0.4, z - 0.25))}
          className="p-1 hover:bg-slate-800 rounded text-slate-200 transition"
          title="کوچکنمایی (Zoom Out)"
        >
          <ZoomOut className="w-3.5 h-3.5 text-sky-400" />
        </button>
        <button
          onClick={() => setZoomFactor(1.0)}
          className="p-1 hover:bg-slate-800 rounded text-slate-200 transition"
          title="بازنشانی زوم"
        >
          <RotateCcw className="w-3 h-3 text-slate-400" />
        </button>
      </div>
      <div className="absolute bottom-2 right-2 left-2 p-2 bg-slate-900/80 backdrop-blur rounded text-xs text-slate-300 flex justify-between items-center font-mono">
        <span>یراق: <strong className="text-sky-400">{params.name}</strong></span>
        <span>ابعاد: {params.length}×{params.width}×{params.height} mm</span>
      </div>
    </div>
  );
};
