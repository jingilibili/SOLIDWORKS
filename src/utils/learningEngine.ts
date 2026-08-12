import { CabinetParams, LearnedPattern } from '../types';

const STORAGE_KEY = 'solidworks_cabinet_learned_patterns_v1';

const DEFAULT_PATTERNS: LearnedPattern[] = [
  {
    id: 'pattern-base-standard',
    title: 'یونیت زمینی دو درب استاندراد (۹۰×۸۵)',
    cabinetType: 'base',
    width: 900,
    height: 850,
    depth: 550,
    materialThickness: 16,
    doorCount: 2,
    hingeBrand: 'Blum',
    usageCount: 14,
    lastUsedAt: new Date().toISOString()
  },
  {
    id: 'pattern-wall-standard',
    title: 'کابینت دیواری جک‌دار (۸۰×۷۰)',
    cabinetType: 'wall',
    width: 800,
    height: 700,
    depth: 350,
    materialThickness: 16,
    doorCount: 2,
    hingeBrand: 'Hettich',
    usageCount: 9,
    lastUsedAt: new Date().toISOString()
  },
  {
    id: 'pattern-pantry-tall',
    title: 'کمد ایستاده سوپرمارکتی (۶۰×۲۲۰)',
    cabinetType: 'pantry',
    width: 600,
    height: 2200,
    depth: 580,
    materialThickness: 18,
    doorCount: 2,
    hingeBrand: 'Blum',
    usageCount: 6,
    lastUsedAt: new Date().toISOString()
  }
];

export function getLearnedPatterns(): LearnedPattern[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PATTERNS));
      return DEFAULT_PATTERNS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading learned patterns from localStorage', e);
    return DEFAULT_PATTERNS;
  }
}

export function saveLearnedPattern(params: CabinetParams): LearnedPattern[] {
  const patterns = getLearnedPatterns();
  
  // Check if a similar pattern exists
  const existingIndex = patterns.findIndex(
    (p) =>
      p.cabinetType === (params.cabinetType || 'base') &&
      p.width === params.width &&
      p.height === params.height &&
      p.depth === params.depth &&
      p.materialThickness === params.materialThickness
  );

  if (existingIndex >= 0) {
    patterns[existingIndex].usageCount += 1;
    patterns[existingIndex].lastUsedAt = new Date().toISOString();
  } else {
    const newPattern: LearnedPattern = {
      id: 'pattern-' + Date.now(),
      title: `${params.name || 'کابینت سفارشی'} (${params.width}×${params.height}mm)`,
      cabinetType: params.cabinetType || 'base',
      width: params.width,
      height: params.height,
      depth: params.depth,
      materialThickness: params.materialThickness,
      doorCount: params.doorCount,
      hingeBrand: params.hingeBrand,
      usageCount: 1,
      lastUsedAt: new Date().toISOString()
    };
    patterns.unshift(newPattern);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (e) {
    console.error('Error saving pattern to localStorage', e);
  }

  return patterns;
}

export function deleteLearnedPattern(id: string): LearnedPattern[] {
  const patterns = getLearnedPatterns().filter((p) => p.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  } catch (e) {
    console.error('Error deleting pattern', e);
  }
  return patterns;
}

export function getSmartSuggestion(cabinetType: string = 'base'): Partial<CabinetParams> | null {
  const patterns = getLearnedPatterns();
  const filtered = patterns
    .filter((p) => p.cabinetType === cabinetType || !cabinetType)
    .sort((a, b) => b.usageCount - a.usageCount);

  if (filtered.length === 0) return null;

  const top = filtered[0];
  return {
    width: top.width,
    height: top.height,
    depth: top.depth,
    materialThickness: top.materialThickness,
    doorCount: top.doorCount,
    hingeBrand: top.hingeBrand as any
  };
}
