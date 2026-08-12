// 3D Studio Cabinet Editor - Main Component
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CabinetUnitManager, CabinetUnit, CabinetDimensions, CabinetUnitPosition } from '../models/CabinetUnit';

interface StudioEditorProps {
  onSave?: (config: object) => void;
}

export const Studio3DEditor: React.FC<StudioEditorProps> = ({ onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const managerRef = useRef<CabinetUnitManager | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // ایجاد صحنه
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // ایجاد دوربین
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 200, 300);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // ایجاد رندرر
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.shadowMap.enabled = true;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // افزودن نورپردازی
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -500;
    directionalLight.shadow.camera.right = 500;
    directionalLight.shadow.camera.top = 500;
    directionalLight.shadow.camera.bottom = -500;
    scene.add(directionalLight);

    // ایجاد صفحه کار (Grid)
    const gridHelper = new THREE.GridHelper(1000, 100);
    scene.add(gridHelper);

    // ایجاد مدیر یونیت‌های کابینت
    const manager = new CabinetUnitManager(scene);
    managerRef.current = manager;

    // نمونه‌های پیش‌فرض از یونیت‌های کابینت
    manager.createCabinetUnit(
      'unit-1',
      'کابینت پایین 60سانتی',
      { width: 600, height: 720, depth: 600 },
      { x: -300, y: 360, z: 0 },
      0x8b7355
    );

    manager.createCabinetUnit(
      'unit-2',
      'کابینت پایین 80سانتی',
      { width: 800, height: 720, depth: 600 },
      { x: 200, y: 360, z: 0 },
      0xa0826d
    );

    manager.createCabinetUnit(
      'unit-3',
      'کابینت بالایی 60سانتی',
      { width: 600, height: 360, depth: 300 },
      { x: -300, y: 1260, z: 0 },
      0x7a6b4f
    );

    // Animation Loop
    const animate = () => {
      requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Event Listeners
    const onMouseDown = (event: MouseEvent) => {
      if (!containerRef.current || !cameraRef.current || !managerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2(mouseX, mouseY);
      raycaster.setFromCamera(mouse, cameraRef.current);

      const allMeshes = managerRef.current
        .getAllUnits()
        .filter((u) => u.mesh)
        .map((u) => u.mesh!);

      const intersects = raycaster.intersectObjects(allMeshes);

      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const unitId = clickedObject.userData.unitId;
        const unit = managerRef.current.getUnit(unitId);

        if (unit) {
          managerRef.current.selectUnit(unit);
          setSelectedUnitId(unitId);
          setIsDragging(true);
          managerRef.current.startDrag(cameraRef.current, mouseX, mouseY);
        }
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging || !containerRef.current || !cameraRef.current || !managerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      managerRef.current.continueDrag(cameraRef.current, mouseX, mouseY);
    };

    const onMouseUp = () => {
      if (managerRef.current) {
        managerRef.current.endDrag();
        setIsDragging(false);
      }
    };

    const onWindowResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;

      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseup', onMouseUp);
    window.addEventListener('resize', onWindowResize);

    return () => {
      renderer.domElement.removeEventListener('mousedown', onMouseDown);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', onWindowResize);
      containerRef.current?.removeChild(renderer.domElement);
    };
  }, []);

  const handleSave = () => {
    if (managerRef.current && onSave) {
      const config = managerRef.current.exportCabinetConfig();
      onSave(config);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUnitId && managerRef.current) {
      managerRef.current.deleteUnit(selectedUnitId);
      setSelectedUnitId(null);
    }
  };

  const handleAddUnit = () => {
    if (managerRef.current) {
      const newId = `unit-${Date.now()}`;
      managerRef.current.createCabinetUnit(
        newId,
        'یونیت جدید',
        { width: 600, height: 720, depth: 600 },
        { x: 0, y: 360, z: 0 }
      );
    }
  };

  return (
    <div className="w-full h-screen flex flex-col">
      {/* ابزار نوار */}
      <div className="bg-gray-800 text-white p-4 flex gap-4">
        <button
          onClick={handleAddUnit}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
        >
          افزودن یونیت
        </button>
        <button
          onClick={handleDeleteSelected}
          disabled={!selectedUnitId}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded disabled:opacity-50"
        >
          حذف یونیت انتخاب‌شده
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          ذخیره تنظیمات
        </button>
        {selectedUnitId && (
          <span className="ml-auto">
            یونیت انتخاب‌شده: <strong>{selectedUnitId}</strong>
          </span>
        )}
      </div>

      {/* صحنه سه‌بعدی */}
      <div ref={containerRef} className="flex-1 bg-gray-100" />
    </div>
  );
};

export default Studio3DEditor;
