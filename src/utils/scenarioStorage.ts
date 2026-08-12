/**
 * LocalStorage Design Scenario Management Utility
 * Allows saving, loading, exporting, importing, and autosaving user designs.
 */

export interface DesignScenario {
  id: string;
  title: string;
  tab: 'cabinet' | 'murphy_bed' | 'room_planner' | 'laser_cnc' | 'nesting' | 'cnc' | 'standard_parts';
  description: string;
  updatedAt: string; // ISO String
  data: any;
  tags?: string[];
}

const SCENARIO_STORAGE_KEY = 'sw_master_saved_scenarios_v1';
const AUTOSAVE_PREFIX = 'sw_master_autosave_v1_';

/**
 * Retrieve all saved scenarios from localStorage
 */
export function getSavedScenarios(): DesignScenario[] {
  try {
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (!raw) return getDefaultPresetScenarios();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getDefaultPresetScenarios();
  } catch (err) {
    console.error('Error reading saved scenarios from localStorage:', err);
    return getDefaultPresetScenarios();
  }
}

/**
 * Save or update a scenario in localStorage
 */
export function saveScenario(
  input: Omit<DesignScenario, 'id' | 'updatedAt'> & { id?: string }
): DesignScenario {
  const scenarios = getSavedScenarios();
  const now = new Date().toISOString();
  
  const existingIndex = input.id ? scenarios.findIndex((s) => s.id === input.id) : -1;

  let savedItem: DesignScenario;

  if (existingIndex >= 0) {
    savedItem = {
      ...scenarios[existingIndex],
      title: input.title,
      description: input.description,
      tab: input.tab,
      data: input.data,
      tags: input.tags || scenarios[existingIndex].tags || [],
      updatedAt: now,
    };
    scenarios[existingIndex] = savedItem;
  } else {
    savedItem = {
      id: input.id || 'scen-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      title: input.title || 'پروژه طراحی جدید',
      description: input.description || 'سناریوی طراحی ذخیره شده کاربر',
      tab: input.tab,
      data: input.data,
      tags: input.tags || ['کاربری'],
      updatedAt: now,
    };
    scenarios.unshift(savedItem);
  }

  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios));
  } catch (err) {
    console.error('Failed to save scenario to localStorage:', err);
  }

  return savedItem;
}

/**
 * Delete a scenario by ID
 */
export function deleteScenario(id: string): DesignScenario[] {
  const scenarios = getSavedScenarios();
  const filtered = scenarios.filter((s) => s.id !== id);
  try {
    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Failed to delete scenario from localStorage:', err);
  }
  return filtered;
}

/**
 * Get a single scenario by ID
 */
export function getScenarioById(id: string): DesignScenario | undefined {
  return getSavedScenarios().find((s) => s.id === id);
}

/**
 * Export all scenarios as a downloadable JSON string
 */
export function exportAllScenariosJSON(): string {
  const scenarios = getSavedScenarios();
  return JSON.stringify(
    {
      app: 'SolidWorks Master Assistant',
      version: '2.5',
      exportedAt: new Date().toISOString(),
      scenarios,
    },
    null,
    2
  );
}

/**
 * Import scenarios from a JSON string
 */
export function importScenariosFromJSON(jsonText: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonText);
    const items = parsed.scenarios || (Array.isArray(parsed) ? parsed : null);
    if (!items || !Array.isArray(items)) {
      return { success: false, count: 0, error: 'فرمت فایل پشتیبان نامعتبر است.' };
    }

    const current = getSavedScenarios();
    let importedCount = 0;

    items.forEach((item: any) => {
      if (item.title && item.tab && item.data) {
        const newItem: DesignScenario = {
          id: item.id || 'scen-imp-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
          title: item.title,
          description: item.description || '',
          tab: item.tab,
          data: item.data,
          tags: item.tags || ['واردشده'],
          updatedAt: item.updatedAt || new Date().toISOString(),
        };
        const idx = current.findIndex((c) => c.id === newItem.id);
        if (idx >= 0) {
          current[idx] = newItem;
        } else {
          current.unshift(newItem);
        }
        importedCount++;
      }
    });

    localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(current));
    return { success: true, count: importedCount };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'خطا در پردازش فایل.' };
  }
}

/**
 * Autosave current active tab state to localStorage
 */
export function saveAutosaveState(tab: string, data: any): void {
  try {
    const payload = {
      timestamp: new Date().toISOString(),
      data,
    };
    localStorage.setItem(AUTOSAVE_PREFIX + tab, JSON.stringify(payload));
  } catch (err) {
    // silent catch for localStorage quota or privacy mode
  }
}

/**
 * Get autosaved state for a given tab
 */
export function getAutosaveState<T>(tab: string): { timestamp: string; data: T } | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_PREFIX + tab);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

/**
 * Clear autosaved state for a tab
 */
export function clearAutosaveState(tab: string): void {
  try {
    localStorage.removeItem(AUTOSAVE_PREFIX + tab);
  } catch (err) {
    // silent
  }
}

/**
 * Initial Default Presets if storage is empty
 */
function getDefaultPresetScenarios(): DesignScenario[] {
  return [
    {
      id: 'preset-cab-01',
      title: 'کابینت زمینی سینک ۶۰cm (استاندارد)',
      tab: 'cabinet',
      description: 'کابینت ۲ درب های‌گلاس با پاخور ۱۰۰mm و شیار فیبر ۳mm',
      updatedAt: new Date().toISOString(),
      tags: ['پیش‌فرض', 'کابینت'],
      data: {
        id: 'cab-preset-1',
        name: 'کابینت زمینی سینک ۶۰cm',
        cabinetType: 'base',
        width: 600,
        height: 800,
        depth: 550,
        materialThickness: 16,
        backPanelThickness: 3,
        toeKickHeight: 100,
        doorCount: 2,
        shelfCount: 1,
        doorType: 'full_overlay',
        hingeBrand: 'Blum',
        hasDrawers: false,
        drawerCount: 0,
        finishColor: '#ffffff',
        edgeBandingThickness: 2,
        handleType: 'g_profile',
      },
    },
    {
      id: 'preset-bed-01',
      title: 'تخت تاشو دیواری ۱۶۰×۲۰۰ (کلاف سنگین)',
      tab: 'murphy_bed',
      description: 'کلاف پروفیل ۳۰×۵۰ با جک ۱۲۰۰ نیوتن و کمدهای ۶۰cm جانبی',
      updatedAt: new Date().toISOString(),
      tags: ['پیش‌فرض', 'تخت تاشو'],
      data: {
        id: 'bed-preset-1',
        name: 'تخت تاشو دوبل ۱۶۰×۲۰۰ - طرح الوند',
        bedType: 'double_160',
        orientation: 'vertical',
        width: 1600,
        length: 2000,
        depth: 450,
        boxHeight: 2200,
        steelProfileSize: '30x50x2',
        metalLegType: 'automatic',
        slatType: 'metal_ribs',
        slatRibCount: 8,
        pistonForceN: 1200,
        pistonCount: 2,
        mechanismBrand: 'ایران جک H1200',
        hasLeftSideWardrobe: true,
        leftWardrobeWidth: 600,
        hasRightSideWardrobe: true,
        rightWardrobeWidth: 600,
        topCabinetHeight: 500,
        materialThickness: 16,
        finishColor: '#38bdf8',
      },
    },
    {
      id: 'preset-cnc-01',
      title: 'پایه نبشی فلزی جک (ورق ۳mm - لیزر)',
      tab: 'laser_cnc',
      description: 'پایه ورقکاری فولادی ST37 همراه با ۴ سوراخ گرد و سوراخ کشویی مرکز',
      updatedAt: new Date().toISOString(),
      tags: ['پیش‌فرض', 'برش لیزر'],
      data: {
        id: 'sm-preset-1',
        partName: 'پایه نبشی فولادی اتصالی جک',
        width: 220,
        height: 140,
        thickness: 3.0,
        material: 'ST37_Steel',
        cornerRadius: 15,
        hasBend: true,
        bendAngle: 90,
        bendFlangeHeight: 50,
        holes: [
          { id: 'h1', type: 'round', diameter: 10, x: -70, y: 35 },
          { id: 'h2', type: 'round', diameter: 10, x: -70, y: -35 },
          { id: 'h3', type: 'round', diameter: 10, x: 70, y: 35 },
          { id: 'h4', type: 'round', diameter: 10, x: 70, y: -35 },
          { id: 'h5', type: 'slot', diameter: 12, length: 30, x: 0, y: 0 },
        ],
      },
    },
  ];
}
