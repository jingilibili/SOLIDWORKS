// =========================================================
// سیستم پشتیبان‌گیری، بازگردانی و به‌روزرسانی کتابخانه‌های برنامه
// SolidWorks Master Backup, Restore & Library Update Engine
// =========================================================

import { getSavedModelTemplates, saveModelTemplate, CustomModelTemplate } from './modelLibrary';
import { getSavedScenarios, saveAutosaveState } from './scenarioStorage';
import { getLearnedPatterns } from './learningEngine';
import { LearnedPattern } from '../types';

export interface AppFullBackupPackage {
  appVersion: string;
  backupDate: string;
  timestamp: number;
  customModels: CustomModelTemplate[];
  savedScenarios: Record<string, any>;
  learnedPatterns: LearnedPattern[];
  userPreferences: {
    theme: string;
    defaultMaterialThickness: number;
    swPort: number;
  };
}

/**
 * خروجی گرفتن جامع از تمام اطلاعات، مدل‌های سفارشی و تنظیمات برنامه در قالب فایل JSON
 */
export function exportAppFullBackup(): { jsonData: string; filename: string } {
  const customModels = getSavedModelTemplates();
  const savedScenarios = getSavedScenarios();
  const learnedPatterns = getLearnedPatterns();

  const backupPackage: AppFullBackupPackage = {
    appVersion: '2026.2.0',
    backupDate: new Date().toISOString(),
    timestamp: Date.now(),
    customModels,
    savedScenarios,
    learnedPatterns,
    userPreferences: {
      theme: 'dark',
      defaultMaterialThickness: 16,
      swPort: 8080
    }
  };

  const jsonData = JSON.stringify(backupPackage, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `SolidWorks_Master_Full_Backup_${dateStr}.json`;

  return { jsonData, filename };
}

/**
 * بازیابی و به‌روزرسانی کتابخانه‌ها و یونیت‌ها از فایل بکاپ JSON
 */
export function importAppFullBackup(
  jsonString: string,
  mode: 'merge' | 'replace' = 'merge'
): { success: boolean; messagePersian: string; restoredCount: number } {
  try {
    const data = JSON.parse(jsonString) as AppFullBackupPackage;

    if (!data.customModels && !data.savedScenarios) {
      return {
        success: false,
        messagePersian: 'فایل وارد شده ساختار بکاپ معتبر SolidWorks Master را ندارد.',
        restoredCount: 0
      };
    }

    let count = 0;

    // Restore Custom Models
    if (Array.isArray(data.customModels)) {
      if (mode === 'replace') {
        localStorage.setItem('sw_master_model_library_v2', JSON.stringify(data.customModels));
        count += data.customModels.length;
      } else {
        const existing = getSavedModelTemplates();
        data.customModels.forEach((m) => {
          if (!existing.some((ex) => ex.id === m.id)) {
            saveModelTemplate(m);
            count++;
          }
        });
      }
    }

    // Restore Saved Scenarios
    if (data.savedScenarios && typeof data.savedScenarios === 'object') {
      const existingScenarios = getSavedScenarios();
      const updated = mode === 'replace' ? data.savedScenarios : { ...existingScenarios, ...data.savedScenarios };
      localStorage.setItem('sw_master_scenarios_v1', JSON.stringify(updated));
    }

    // Restore Learned AI Patterns
    if (Array.isArray(data.learnedPatterns)) {
      if (mode === 'replace') {
        localStorage.setItem('solidworks_cabinet_learned_patterns_v1', JSON.stringify(data.learnedPatterns));
      } else {
        const existingPatterns = getLearnedPatterns();
        const combined = [...existingPatterns];
        data.learnedPatterns.forEach((p) => {
          if (!combined.some((ex) => ex.id === p.id)) {
            combined.push(p);
          }
        });
        localStorage.setItem('solidworks_cabinet_learned_patterns_v1', JSON.stringify(combined));
      }
    }

    return {
      success: true,
      messagePersian: `اطلاعات با موفقیت ${mode === 'replace' ? 'جایگزین' : 'ادغام'} شدند. تعداد ${count} مدل و الگوی جدید به‌روزرسانی گردید.`,
      restoredCount: count
    };
  } catch (error) {
    return {
      success: false,
      messagePersian: `خطا در خواندن فایل پشتیبان: ${(error as Error).message}`,
      restoredCount: 0
    };
  }
}

/**
 * به‌روزرسانی کتابخانه استانداردها و مدل‌های پیش‌فرض به آخرین نسخه کارخانه‌ای
 */
export function updateDefaultLibrariesToLatest(): { success: boolean; messagePersian: string } {
  try {
    // Reset or seed learning weights to modern 2026 standard ratios
    const updatedDefaults = {
      pantry_gap_mm: 2.0,
      hinge_cup_margin_mm: 11.5,
      drawer_slide_clearance_mm: 12.7,
      island_overhang_mm: 300,
      slim_shaker_frame_mm: 12
    };
    localStorage.setItem('sw_master_learned_weights', JSON.stringify(updatedDefaults));

    return {
      success: true,
      messagePersian: 'کتابخانه‌ها، ضرایب بادخور و الگوهای پیش‌فرض به نسخه ۲۰۲۶ به‌روزرسانی شدند.'
    };
  } catch (err) {
    return {
      success: false,
      messagePersian: 'خطا در به روزرسانی کتابخانه‌ها'
    };
  }
}
