import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CncLatheParams } from '../../types';

interface CncLathe3DViewerProps {
  params: CncLatheParams;
}

export const CncLathe3DViewer: React.FC<CncLathe3DViewerProps> = ({ params }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const totalL = params.overallLength / 1000;
    const maxR = (params.maxDiameter / 2) / 1000;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);

    const width = containerRef.current.clientWidth || 500;
    const height = containerRef.current.clientHeight || 350;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 10);
    camera.position.set(totalL * 1.5, maxR * 3, totalL * 1.5);
    camera.lookAt(totalL / 2, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight1.position.set(3, 5, 4);
    scene.add(dirLight1);

    const grid = new THREE.GridHelper(1, 20, 0x38bdf8, 0x1e293b);
    grid.position.y = -maxR - 0.01;
    scene.add(grid);

    const shaftGroup = new THREE.Group();
    scene.add(shaftGroup);

    const steelMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      metalness: 0.9,
      roughness: 0.25,
    });

    const threadMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.7,
      roughness: 0.4,
    });

    let currentX = 0;
    params.segments.forEach((seg) => {
      const len = seg.length / 1000;
      const startR = (seg.startDiameter / 2) / 1000;
      const endR = (seg.endDiameter / 2) / 1000;

      const cylGeo = new THREE.CylinderGeometry(endR, startR, len, 32);
      cylGeo.rotateZ(Math.PI / 2);

      const mat = seg.type === 'thread' ? threadMat : steelMat;
      const mesh = new THREE.Mesh(cylGeo, mat);
      mesh.position.set(currentX + len / 2, 0, 0);
      shaftGroup.add(mesh);

      currentX += len;
    });

    // Bore hole inner circle indicator
    if (params.boreDiameter > 0) {
      const boreR = (params.boreDiameter / 2) / 1000;
      const boreH = params.boreDepth / 1000;
      const boreGeo = new THREE.CylinderGeometry(boreR, boreR, boreH, 24);
      boreGeo.rotateZ(Math.PI / 2);
      const boreMat = new THREE.MeshBasicMaterial({ color: 0x020617, wireframe: true });
      const boreMesh = new THREE.Mesh(boreGeo, boreMat);
      boreMesh.position.set(boreH / 2, 0, 0);
      shaftGroup.add(boreMesh);
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
      shaftGroup.rotation.y += dx * 0.01;
      shaftGroup.rotation.x += dy * 0.01;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onMouseUp = () => (isDragging = false);

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isDragging) shaftGroup.rotation.x += 0.008; // revolve view
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [params]);

  return (
    <div className="relative w-full h-[350px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-xl flex flex-col">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 right-2 left-2 p-2 bg-slate-900/80 backdrop-blur rounded text-xs text-slate-300 flex justify-between items-center font-mono">
        <span>شفت CNC: <strong className="text-sky-400">{params.partName}</strong></span>
        <span>طول کل: {params.overallLength}mm | حداکثر قطر: {params.maxDiameter}mm</span>
      </div>
    </div>
  );
};
