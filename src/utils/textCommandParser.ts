import { CabinetParams } from '../types';
import { RoomLayoutConfig } from '../components/RoomPlannerStudio';

export interface CommandParseResult<T> {
  success: boolean;
  updatedData: T;
  summaryPersian: string;
  modifiedKeys: string[];
}

/**
 * Normalizes Persian digits to English numbers and trims input
 */
export function normalizePersianText(text: string): string {
  return text
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d).toString())
    .toLowerCase()
    .trim();
}

/**
 * Intelligent Persian Natural Language Command Parser for Cabinet Studio
 */
export function parseCabinetTextCommand(
  text: string,
  currentParams: CabinetParams
): CommandParseResult<CabinetParams> {
  const norm = normalizePersianText(text);
  const updated: CabinetParams = { ...currentParams };
  const modifiedKeys: string[] = [];
  const summaries: string[] = [];

  // 1. Cabinet Type Recognition
  if (norm.includes('دیواری') || norm.includes('هوایی')) {
    if (updated.cabinetType !== 'wall') {
      updated.cabinetType = 'wall';
      updated.height = 700;
      updated.depth = 350;
      modifiedKeys.push('cabinetType', 'height', 'depth');
      summaries.push('نوع به کابینت دیواری (هوایی) تغییر کرد');
    }
  } else if (norm.includes('ایستاده') || norm.includes('کمد') || norm.includes('سوپر')) {
    if (updated.cabinetType !== 'pantry') {
      updated.cabinetType = 'pantry';
      updated.height = 2100;
      updated.depth = 580;
      modifiedKeys.push('cabinetType', 'height', 'depth');
      summaries.push('نوع به کابینت ایستاده/سوپرمارکت تغییر کرد');
    }
  } else if (norm.includes('کشویی') || norm.includes('کشو دار') || norm.includes('دراور')) {
    if (updated.cabinetType !== 'drawer_chest') {
      updated.cabinetType = 'drawer_chest';
      updated.hasDrawers = true;
      updated.drawerCount = 3;
      modifiedKeys.push('cabinetType', 'hasDrawers', 'drawerCount');
      summaries.push('نوع به یونیت کشویی/دراور تغییر کرد');
    }
  } else if (norm.includes('زمینی') || norm.includes('پایین')) {
    if (updated.cabinetType !== 'base') {
      updated.cabinetType = 'base';
      updated.height = 850;
      updated.depth = 550;
      modifiedKeys.push('cabinetType', 'height', 'depth');
      summaries.push('نوع به کابینت زمینی تغییر کرد');
    }
  }

  // Helper to extract numbers following or preceding a keyword
  const extractNumNearKeyword = (keywords: string[]): number | null => {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        // Find pattern like "عرض 800" or "عرض 80" or "800 میلی متر"
        const index = norm.indexOf(kw);
        const sub = norm.substring(index, index + 35);
        const nums = sub.match(/\d+/g)?.map(Number);
        if (nums && nums.length > 0) {
          let val = nums[0];
          // If user gave value in cm (e.g. 80 cm), convert to mm
          if (val > 0 && val <= 250 && !sub.includes('میلی')) {
            val = val * 10;
          }
          return val;
        }
      }
    }
    return null;
  };

  // 2. Width (عرض / پهنا / طول)
  const parsedWidth = extractNumNearKeyword(['عرض', 'پهنا', 'طول']);
  if (parsedWidth && parsedWidth >= 200 && parsedWidth <= 3000) {
    updated.width = parsedWidth;
    modifiedKeys.push('width');
    summaries.push(`عرض به ${parsedWidth}mm تنظیم شد`);
  }

  // 3. Height (ارتفاع / قد / بلندی)
  const parsedHeight = extractNumNearKeyword(['ارتفاع', 'قد', 'بلندی']);
  if (parsedHeight && parsedHeight >= 300 && parsedHeight <= 3000) {
    updated.height = parsedHeight;
    modifiedKeys.push('height');
    summaries.push(`ارتفاع به ${parsedHeight}mm تنظیم شد`);
  }

  // 4. Depth (عمق / گرایی)
  const parsedDepth = extractNumNearKeyword(['عمق']);
  if (parsedDepth && parsedDepth >= 150 && parsedDepth <= 1200) {
    updated.depth = parsedDepth;
    modifiedKeys.push('depth');
    summaries.push(`عمق به ${parsedDepth}mm تنظیم شد`);
  }

  // 5. Door Count (تعداد درب / دو درب / تک درب)
  if (norm.includes('تک درب') || norm.includes('یک درب') || norm.includes('۱ درب')) {
    updated.doorCount = 1;
    modifiedKeys.push('doorCount');
    summaries.push('تعداد درب: ۱ عدد');
  } else if (norm.includes('دو درب') || norm.includes('۲ درب') || norm.includes('بی درب')) {
    updated.doorCount = 2;
    modifiedKeys.push('doorCount');
    summaries.push('تعداد درب: ۲ عدد');
  } else if (norm.includes('بدون درب') || norm.includes('بدون در')) {
    updated.doorCount = 0;
    modifiedKeys.push('doorCount');
    summaries.push('بدون درب (یونیت باز)');
  } else {
    const doorNum = extractNumNearKeyword(['تعداد درب', 'درب']);
    if (doorNum !== null && doorNum >= 0 && doorNum <= 4) {
      updated.doorCount = doorNum;
      modifiedKeys.push('doorCount');
      summaries.push(`تعداد درب: ${doorNum} عدد`);
    }
  }

  // 6. Shelves (طبقه / طبقات)
  const shelfNum = extractNumNearKeyword(['طبقه', 'طبقات']);
  if (shelfNum !== null && shelfNum >= 0 && shelfNum <= 8) {
    updated.shelfCount = shelfNum;
    modifiedKeys.push('shelfCount');
    summaries.push(`تعداد طبقات: ${shelfNum} عدد`);
  }

  // 7. Material Colors & Finishes
  if (norm.includes('بلوط') || norm.includes('چوب روشن')) {
    updated.finishColor = '#d97706';
    modifiedKeys.push('finishColor');
    summaries.push('رنگ فینیش: روکش چوب بلوط');
  } else if (norm.includes('گردو') || norm.includes('چوب تیره')) {
    updated.finishColor = '#b45309';
    modifiedKeys.push('finishColor');
    summaries.push('رنگ فینیش: چوب گردوی تیره');
  } else if (norm.includes('سفید') || norm.includes('سفید براق')) {
    updated.finishColor = '#f8fafc';
    modifiedKeys.push('finishColor');
    summaries.push('رنگ فینیش: سفید های‌گلاس');
  } else if (norm.includes('زمرد') || norm.includes('سبز')) {
    updated.finishColor = '#059669';
    modifiedKeys.push('finishColor');
    summaries.push('رنگ فینیش: سبز زمردی');
  } else if (norm.includes('مشکی') || norm.includes('دودی')) {
    updated.finishColor = '#1e293b';
    modifiedKeys.push('finishColor');
    summaries.push('رنگ فینیش: مشکی مات / دودی');
  }

  const success = modifiedKeys.length > 0;
  return {
    success,
    updatedData: updated,
    summaryPersian: success
      ? `اصلاحات متنی اعمال شد: ${summaries.join(' | ')}`
      : 'متن ورودی حاوی مشخصات قابل تغییر (عرض، ارتفاع، عمق، تعداد درب، رنگ و ...) نبود.',
    modifiedKeys
  };
}

/**
 * Intelligent Persian Natural Language Command Parser for Room Layout Studio
 */
export function parseRoomTextCommand(
  text: string,
  currentConfig: RoomLayoutConfig
): CommandParseResult<RoomLayoutConfig> {
  const norm = normalizePersianText(text);
  const updated: RoomLayoutConfig = { ...currentConfig };
  const modifiedKeys: string[] = [];
  const summaries: string[] = [];

  // Layout shape
  if (norm.includes('یو شکل') || norm.includes('u shape') || norm.includes('شکل u') || norm.includes('۳ دیوار') || norm.includes('سه دیوار')) {
    updated.layoutShape = 'u_shape';
    if (!updated.wall3Length) updated.wall3Length = 2400;
    modifiedKeys.push('layoutShape', 'wall3Length');
    summaries.push('چیدمان به شکل U تغییر یافت');
  } else if (norm.includes('ال شکل') || norm.includes('l shape') || norm.includes('شکل l') || norm.includes('دو دیوار')) {
    updated.layoutShape = 'l_shape';
    modifiedKeys.push('layoutShape');
    summaries.push('چیدمان به شکل L تغییر یافت');
  } else if (norm.includes('مستقیم') || norm.includes('خطی') || norm.includes('تک دیوار')) {
    updated.layoutShape = 'straight';
    modifiedKeys.push('layoutShape');
    summaries.push('چیدمان به شکل مستقیم/خطی تغییر یافت');
  }

  // Extract wall length near keyword
  const extractWallLength = (keywords: string[]): number | null => {
    for (const kw of keywords) {
      if (norm.includes(kw)) {
        const idx = norm.indexOf(kw);
        const sub = norm.substring(idx, idx + 35);
        const nums = sub.match(/\d+/g)?.map(Number);
        if (nums && nums.length > 0) {
          let val = nums[0];
          if (val > 0 && val <= 1000 && !sub.includes('میلی')) {
            val = val * 10; // cm to mm if cm provided (e.g. 350cm -> 3500mm)
          }
          return val;
        }
      }
    }
    return null;
  };

  const w1 = extractWallLength(['دیوار ۱', 'دیوار اول', 'دیوار اصلی']);
  if (w1 && w1 >= 1000 && w1 <= 10000) {
    updated.wall1Length = w1;
    modifiedKeys.push('wall1Length');
    summaries.push(`طول دیوار ۱: ${w1}mm`);
  }

  const w2 = extractWallLength(['دیوار ۲', 'دیوار دوم', 'دیوار فرعی']);
  if (w2 && w2 >= 1000 && w2 <= 10000) {
    updated.wall2Length = w2;
    modifiedKeys.push('wall2Length');
    summaries.push(`طول دیوار ۲: ${w2}mm`);
  }

  const w3 = extractWallLength(['دیوار ۳', 'دیوار سوم']);
  if (w3 && w3 >= 1000 && w3 <= 10000) {
    updated.wall3Length = w3;
    modifiedKeys.push('wall3Length');
    summaries.push(`طول دیوار ۳: ${w3}mm`);
  }

  const success = modifiedKeys.length > 0;
  return {
    success,
    updatedData: updated,
    summaryPersian: success
      ? `اصلاحات چیدمان اعمال شد: ${summaries.join(' | ')}`
      : 'دستور متنی حاوی مشخصات قابل تغییر دیوارها یا نوع چیدمان نبود.',
    modifiedKeys
  };
}
