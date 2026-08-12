// Cabinet Unit 3D Model with Interactive Editing
import * as THREE from 'three';

export interface CabinetDimensions {
  width: number;
  height: number;
  depth: number;
}

export interface CabinetUnitPosition {
  x: number;
  y: number;
  z: number;
}

export interface CabinetUnit {
  id: string;
  name: string;
  dimensions: CabinetDimensions;
  position: CabinetUnitPosition;
  material: THREE.Material;
  mesh: THREE.Mesh | null;
  isSelected: boolean;
}

export class CabinetUnitManager {
  private units: Map<string, CabinetUnit> = new Map();
  private scene: THREE.Scene;
  private raycaster: THREE.Raycaster;
  private mouse: THREE.Vector2;
  private selectedUnit: CabinetUnit | null = null;
  private dragPlane: THREE.Plane;
  private dragOffset: THREE.Vector3 = new THREE.Vector3();

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  }

  /**
   * ایجاد یک یونیت کابینت جدید در صحنه سه‌بعدی
   */
  createCabinetUnit(
    id: string,
    name: string,
    dimensions: CabinetDimensions,
    position: CabinetUnitPosition,
    color: number = 0x8b7355
  ): CabinetUnit {
    // ایجاد Geometry
    const geometry = new THREE.BoxGeometry(
      dimensions.width,
      dimensions.height,
      dimensions.depth
    );

    // ایجاد Material
    const material = new THREE.MeshPhongMaterial({
      color,
      emissive: 0x000000,
      shininess: 30,
    });

    // ایجاد Mesh
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(position.x, position.y, position.z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData = { unitId: id };

    // افزودن به صحنه
    this.scene.add(mesh);

    // ایجاد Unit Object
    const unit: CabinetUnit = {
      id,
      name,
      dimensions,
      position,
      material,
      mesh,
      isSelected: false,
    };

    this.units.set(id, unit);
    return unit;
  }

  /**
   * انتخاب یک یونیت برای ویرایش
   */
  selectUnit(unit: CabinetUnit): void {
    // غیرفعال‌سازی انتخاب قبلی
    if (this.selectedUnit) {
      this.deselectUnit(this.selectedUnit);
    }

    this.selectedUnit = unit;
    unit.isSelected = true;

    // تغییر رنگ برای نشان دادن انتخاب
    if (unit.mesh && unit.material instanceof THREE.MeshPhongMaterial) {
      unit.material.emissive.setHex(0x444444);
      unit.material.emissiveIntensity = 0.5;
    }

    // نشان دادن گیزموهای کنترل
    this.showControlGizmos(unit);
  }

  /**
   * لغو انتخاب یک یونیت
   */
  deselectUnit(unit: CabinetUnit): void {
    unit.isSelected = false;

    // بازگردان رنگ اصلی
    if (unit.mesh && unit.material instanceof THREE.MeshPhongMaterial) {
      unit.material.emissive.setHex(0x000000);
      unit.material.emissiveIntensity = 0;
    }

    this.hideControlGizmos();
  }

  /**
   * شروع درگ (جابجا کردن) یک یونیت
   */
  startDrag(camera: THREE.Camera, mouseX: number, mouseY: number): void {
    if (!this.selectedUnit || !this.selectedUnit.mesh) return;

    this.mouse.set(mouseX, mouseY);
    this.raycaster.setFromCamera(this.mouse, camera);

    // تنظیم صفحه درگ
    const unitPos = this.selectedUnit.mesh.position;
    this.dragPlane.setFromNormalAndCoplanarPoint(
      new THREE.Vector3(0, 1, 0),
      unitPos
    );

    // محاسبه نقطه تقاطع
    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.dragPlane, intersection);

    // محاسبه offset
    this.dragOffset.subVectors(unitPos, intersection);
  }

  /**
   * ادامه درگ (جابجا کردن) یک یونیت
   */
  continueDrag(camera: THREE.Camera, mouseX: number, mouseY: number): void {
    if (!this.selectedUnit || !this.selectedUnit.mesh) return;

    this.mouse.set(mouseX, mouseY);
    this.raycaster.setFromCamera(this.mouse, camera);

    const intersection = new THREE.Vector3();
    this.raycaster.ray.intersectPlane(this.dragPlane, intersection);
    intersection.add(this.dragOffset);

    // حداقل و حداکثر محدودیت‌های جابجایی
    this.selectedUnit.mesh.position.x = Math.max(-500, Math.min(500, intersection.x));
    this.selectedUnit.mesh.position.z = Math.max(-500, Math.min(500, intersection.z));

    // به‌روزرسانی موضع یونیت
    this.selectedUnit.position = {
      x: this.selectedUnit.mesh.position.x,
      y: this.selectedUnit.mesh.position.y,
      z: this.selectedUnit.mesh.position.z,
    };
  }

  /**
   * پایان درگ
   */
  endDrag(): void {
    if (this.selectedUnit) {
      console.log(
        `یونیت "${this.selectedUnit.name}" به موضع ${JSON.stringify(this.selectedUnit.position)} منتقل شد`
      );
    }
  }

  /**
   * تغییر ابعاد یونیت
   */
  resizeUnit(unit: CabinetUnit, newDimensions: CabinetDimensions): void {
    unit.dimensions = newDimensions;

    if (unit.mesh) {
      unit.mesh.geometry.dispose();
      unit.mesh.geometry = new THREE.BoxGeometry(
        newDimensions.width,
        newDimensions.height,
        newDimensions.depth
      );
    }
  }

  /**
   * حذف یک یونیت
   */
  deleteUnit(id: string): void {
    const unit = this.units.get(id);
    if (unit && unit.mesh) {
      this.scene.remove(unit.mesh);
      unit.mesh.geometry.dispose();
      (unit.mesh.material as THREE.Material).dispose();
    }
    this.units.delete(id);
  }

  /**
   * نشان دادن کنترل‌های گیزمو
   */
  private showControlGizmos(unit: CabinetUnit): void {
    if (!unit.mesh) return;

    // افزودن هایلایت و آرچر‌ها برای نشان دادن محورهای حرکت
    const wireframe = new THREE.BoxHelper(unit.mesh, 0xffff00);
    wireframe.userData = { isGizmo: true };
    this.scene.add(wireframe);
  }

  /**
   * پنهان کردن کنترل‌های گیزمو
   */
  private hideControlGizmos(): void {
    this.scene.children = this.scene.children.filter((child) => {
      if (child.userData?.isGizmo) {
        if (child instanceof THREE.BoxHelper) {
          child.dispose();
        }
        return false;
      }
      return true;
    });
  }

  /**
   * دریافت تمام یونیت‌ها
   */
  getAllUnits(): CabinetUnit[] {
    return Array.from(this.units.values());
  }

  /**
   * دریافت یک یونیت بر اساس ID
   */
  getUnit(id: string): CabinetUnit | undefined {
    return this.units.get(id);
  }

  /**
   * دریافت یونیت انتخاب‌شده
   */
  getSelectedUnit(): CabinetUnit | null {
    return this.selectedUnit;
  }

  /**
   * صادرات تنظیمات کابینت
   */
  exportCabinetConfig(): object {
    const config = Array.from(this.units.values()).map((unit) => ({
      id: unit.id,
      name: unit.name,
      dimensions: unit.dimensions,
      position: unit.position,
    }));
    return config;
  }

  /**
   * واردکردن تنظیمات کابینت
   */
  importCabinetConfig(
    config: Array<{
      id: string;
      name: string;
      dimensions: CabinetDimensions;
      position: CabinetUnitPosition;
    }>
  ): void {
    config.forEach((unitConfig) => {
      this.createCabinetUnit(
        unitConfig.id,
        unitConfig.name,
        unitConfig.dimensions,
        unitConfig.position
      );
    });
  }
}
