import { CabinetUnitLayout, RoomLayoutConfig } from '../components/RoomPlannerStudio';
import { CabinetParams } from '../types';

export interface CustomModelTemplate {
  id: string;
  title: string;
  category: 'kitchen' | 'bedroom' | 'cabinet_unit' | 'murphy_bed';
  description: string;
  originalDimensions: {
    wall1Length: number;
    wall2Length?: number;
    wall3Length?: number;
    ceilingHeight?: number;
  };
  units?: CabinetUnitLayout[];
  cabinetParams?: CabinetParams;
  createdAt: string;
  tags: string[];
}

const LIBRARY_STORAGE_KEY = 'sw_master_model_library_v2';

/**
 * Get all custom model templates from localStorage or defaults
 */
export function getSavedModelTemplates(): CustomModelTemplate[] {
  try {
    const raw = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (!raw) return getDefaultModelTemplates();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : getDefaultModelTemplates();
  } catch (err) {
    console.error('Error loading custom model templates:', err);
    return getDefaultModelTemplates();
  }
}

/**
 * Save a new model template to localStorage
 */
export function saveModelTemplate(template: Omit<CustomModelTemplate, 'id' | 'createdAt'>): CustomModelTemplate {
  const current = getSavedModelTemplates();
  const newTemplate: CustomModelTemplate = {
    ...template,
    id: 'model-tpl-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
    createdAt: new Date().toISOString(),
  };

  current.unshift(newTemplate);
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    console.error('Failed to save model template:', err);
  }
  return newTemplate;
}

/**
 * Delete a model template by ID
 */
export function deleteModelTemplate(id: string): CustomModelTemplate[] {
  const current = getSavedModelTemplates();
  const filtered = current.filter((m) => m.id !== id);
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete model template:', err);
  }
  return filtered;
}

/**
 * Smart Parametric Adaptation Engine:
 * Adapts a saved model template to target room dimensions.
 * Dynamically ADDS or REMOVES units to fit target space without gaps.
 */
export function adaptModelToNewDimensions(
  template: CustomModelTemplate,
  targetWall1: number,
  targetWall2?: number,
  targetWall3?: number
): {
  adaptedConfig: RoomLayoutConfig;
  adaptedUnits: CabinetUnitLayout[];
  summaryPersian: string;
  unitsAddedCount: number;
  unitsRemovedCount: number;
} {
  const origW1 = template.originalDimensions.wall1Length;
  const origW2 = template.originalDimensions.wall2Length || 2800;
  const origW3 = template.originalDimensions.wall3Length || 2400;

  const w2ToUse = targetWall2 !== undefined ? targetWall2 : origW2;
  const w3ToUse = targetWall3 !== undefined ? targetWall3 : origW3;

  const originalUnits: CabinetUnitLayout[] = template.units ? JSON.parse(JSON.stringify(template.units)) : [];

  let unitsAdded = 0;
  let unitsRemoved = 0;

  // Process Wall 1 adaptation
  const wall1Units = originalUnits.filter((u) => u.wallIndex === 1);
  const wall1CoreTotalWidth = wall1Units.reduce((acc, u) => acc + u.widthMm, 0);

  const diffW1 = targetWall1 - wall1CoreTotalWidth;

  let finalWall1Units: CabinetUnitLayout[] = [...wall1Units];

  if (diffW1 >= 450) {
    // Space is larger: Dynamically ADD new cabinet units!
    const addCount = Math.floor(diffW1 / 600);
    const remainder = diffW1 % 600;

    for (let i = 0; i < addCount; i++) {
      const newUnitId = `u-auto-add-w1-${Date.now()}-${i}`;
      finalWall1Units.push({
        id: newUnitId,
        unitType: 'base_standard',
        namePersian: `یونیت زمینی افزوده (۶۰ سانت - تطبیقی)`,
        wallIndex: 1,
        widthMm: 600,
        heightMm: 870,
        depthMm: 550,
        xPosMm: 0, // position re-calculated below
      });
      unitsAdded++;
    }

    if (remainder >= 300) {
      finalWall1Units.push({
        id: `u-auto-add-rem-${Date.now()}`,
        unitType: 'base_standard',
        namePersian: `یونیت زمینی تکمیلی (${remainder}mm - انطباقی)`,
        wallIndex: 1,
        widthMm: remainder,
        heightMm: 870,
        depthMm: 550,
        xPosMm: 0,
      });
      unitsAdded++;
    }
  } else if (diffW1 < 0) {
    // Space is smaller: Dynamically REMOVE non-essential standard units or shrink them
    let overflow = Math.abs(diffW1);

    // Keep key appliances (sink, gas, fridge) and drop base_standard first
    for (let i = finalWall1Units.length - 1; i >= 0; i--) {
      const unit = finalWall1Units[i];
      if (unit.unitType === 'base_standard' || unit.unitType === 'base_drawer') {
        if (overflow >= unit.widthMm) {
          overflow -= unit.widthMm;
          finalWall1Units.splice(i, 1);
          unitsRemoved++;
        } else {
          // Proportionally shrink unit
          unit.widthMm = Math.max(300, unit.widthMm - overflow);
          overflow = 0;
          break;
        }
      }
    }
  }

  // Recalculate xPosMm along Wall 1
  let currentX1 = 0;
  finalWall1Units.forEach((unit) => {
    unit.xPosMm = currentX1;
    currentX1 += unit.widthMm;
  });

  // Process Wall 2 adaptation (if present)
  let finalWall2Units = originalUnits.filter((u) => u.wallIndex === 2);
  if (finalWall2Units.length > 0) {
    const wall2Total = finalWall2Units.reduce((acc, u) => acc + u.widthMm, 0);
    const diffW2 = w2ToUse - wall2Total;

    if (diffW2 >= 500) {
      const extraWidth = Math.min(diffW2, 1200);
      finalWall2Units.push({
        id: `u-auto-add-w2-${Date.now()}`,
        unitType: 'base_standard',
        namePersian: `یونیت زمینی دیوار دوم (${extraWidth}mm - انطباقی)`,
        wallIndex: 2,
        widthMm: extraWidth,
        heightMm: 870,
        depthMm: 550,
        xPosMm: 0,
      });
      unitsAdded++;
    } else if (diffW2 < 0) {
      let overW2 = Math.abs(diffW2);
      for (let i = finalWall2Units.length - 1; i >= 0; i--) {
        if (finalWall2Units[i].unitType === 'base_standard') {
          if (overW2 >= finalWall2Units[i].widthMm) {
            overW2 -= finalWall2Units[i].widthMm;
            finalWall2Units.splice(i, 1);
            unitsRemoved++;
          } else {
            finalWall2Units[i].widthMm = Math.max(300, finalWall2Units[i].widthMm - overW2);
            break;
          }
        }
      }
    }

    let currentX2 = 0;
    finalWall2Units.forEach((u) => {
      u.xPosMm = currentX2;
      currentX2 += u.widthMm;
    });
  }

  // Wall 3 units
  const finalWall3Units = originalUnits.filter((u) => u.wallIndex === 3);

  const finalAdaptedUnits = [...finalWall1Units, ...finalWall2Units, ...finalWall3Units];

  const adaptedConfig: RoomLayoutConfig = {
    roomType: template.category === 'bedroom' ? 'bedroom' : 'kitchen',
    layoutShape: template.originalDimensions.wall3Length
      ? 'u_shape'
      : template.originalDimensions.wall2Length
      ? 'l_shape'
      : 'straight',
    wall1Length: targetWall1,
    wall2Length: w2ToUse,
    wall3Length: w3ToUse,
    cornerAngle: 90,
    ceilingHeight: template.originalDimensions.ceilingHeight || 2700,
    sinkLocationMm: 1200,
    gasLocationMm: 2800,
    fridgeWidthMm: 950,
    designStyle: 'modern_handleless',
    cabinetHeightType: 'full_height_to_ceiling',
    materialThickness: 16,
  };

  const summary = `مدل «${template.title}» با موفقیت روی ابعاد جدید (${targetWall1}mm) تطبیق داده شد. ${
    unitsAdded > 0 ? `[${unitsAdded} یونیت جدید اضافه شد]` : ''
  } ${unitsRemoved > 0 ? `[${unitsRemoved} یونیت برای تناسب فضا حذف شد]` : ''}`;

  return {
    adaptedConfig,
    adaptedUnits: finalAdaptedUnits,
    summaryPersian: summary,
    unitsAddedCount: unitsAdded,
    unitsRemovedCount: unitsRemoved,
  };
}

/**
 * Default Seed Templates
 */
function getDefaultModelTemplates(): CustomModelTemplate[] {
  return [
    {
      id: 'tpl-kitchen-l-shape',
      title: 'سرویس کامل آشپزخانه مدرن L-Shape',
      category: 'kitchen',
      description: 'شامل یخچال ساید، پنتری سوپرمارکتی، سینک PVC، یونیت کشویی و گاز صفحه‌ای توکار',
      originalDimensions: {
        wall1Length: 3800,
        wall2Length: 2800,
        ceilingHeight: 2700,
      },
      tags: ['آشپزخانه', 'L-Shape', 'مدرن', 'مثلث طلایی'],
      createdAt: new Date().toISOString(),
      units: [
        {
          id: 'u-tpl-fridge',
          unitType: 'tall_fridge',
          namePersian: 'باکس یخچال ساید (۹۵ سانت)',
          wallIndex: 1,
          widthMm: 950,
          heightMm: 2400,
          depthMm: 650,
          xPosMm: 0,
        },
        {
          id: 'u-tpl-pantry',
          unitType: 'tall_pantry',
          namePersian: 'کمد ایستاده سوپرمارکتی (پنتری)',
          wallIndex: 1,
          widthMm: 600,
          heightMm: 2400,
          depthMm: 600,
          xPosMm: 950,
        },
        {
          id: 'u-tpl-sink',
          unitType: 'base_sink',
          namePersian: 'یونیت زمینی سینک ظرفشویی (ضدآب PVC)',
          wallIndex: 1,
          widthMm: 900,
          heightMm: 870,
          depthMm: 550,
          xPosMm: 1550,
        },
        {
          id: 'u-tpl-drawer',
          unitType: 'base_drawer',
          namePersian: 'یونیت کشویی زمینی (۳ کشو آرام‌بند)',
          wallIndex: 1,
          widthMm: 600,
          heightMm: 870,
          depthMm: 550,
          xPosMm: 2450,
        },
        {
          id: 'u-tpl-corner',
          unitType: 'corner_l',
          namePersian: 'یونیت کنج L-Shape',
          wallIndex: 1,
          widthMm: 900,
          heightMm: 870,
          depthMm: 900,
          xPosMm: 3050,
        },
        {
          id: 'u-tpl-gas',
          unitType: 'base_gas',
          namePersian: 'یونیت گاز صفحه‌ای و فر توکار',
          wallIndex: 2,
          widthMm: 900,
          heightMm: 870,
          depthMm: 550,
          xPosMm: 900,
        },
        {
          id: 'u-tpl-base-std',
          unitType: 'base_standard',
          namePersian: 'یونیت زمینی ۲ درب استاندارد',
          wallIndex: 2,
          widthMm: 800,
          heightMm: 870,
          depthMm: 550,
          xPosMm: 1800,
        },
      ],
    },
    {
      id: 'tpl-murphy-bedroom-set',
      title: 'ست کامل سرویس خواب و تخت تاشو دیواری',
      category: 'bedroom',
      description: 'شامل تخت تاشو ۲ نفره، ۲ عدد کمد لباس جانبی و شلف بالای تخت',
      originalDimensions: {
        wall1Length: 3200,
        ceilingHeight: 2600,
      },
      tags: ['اتاق خواب', 'تخت تاشو', 'کمد لباس'],
      createdAt: new Date().toISOString(),
      units: [
        {
          id: 'u-bed-wardrobe-l',
          unitType: 'wardrobe',
          namePersian: 'کمد لباس جانبی چپ (۶۰cm)',
          wallIndex: 1,
          widthMm: 600,
          heightMm: 2400,
          depthMm: 500,
          xPosMm: 0,
        },
        {
          id: 'u-bed-main',
          unitType: 'murphy_bed',
          namePersian: 'تخت تاشو دیواری دوبل (۱۶۰×۲۰۰)',
          wallIndex: 1,
          widthMm: 1750,
          heightMm: 2200,
          depthMm: 450,
          xPosMm: 600,
        },
        {
          id: 'u-bed-wardrobe-r',
          unitType: 'wardrobe',
          namePersian: 'کمد لباس جانبی راست (۶۰cm)',
          wallIndex: 1,
          widthMm: 600,
          heightMm: 2400,
          depthMm: 500,
          xPosMm: 2350,
        },
      ],
    },
  ];
}
