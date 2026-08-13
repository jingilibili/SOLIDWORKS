import { CabinetUnitLayout, RoomLayoutConfig } from '../components/RoomPlannerStudio';

export interface TrianglePoint {
  x: number; // in meters
  y: number; // in meters
  z: number; // in meters
  namePersian: string;
  unitId: string;
}

export interface GoldenTriangleEvaluation {
  hasAllAppliances: boolean;
  sinkPoint?: TrianglePoint;
  gasPoint?: TrianglePoint;
  fridgePoint?: TrianglePoint;
  
  // Distances in meters
  distSinkToGas: number; // meters
  distSinkToFridge: number; // meters
  distGasToFridge: number; // meters
  totalPerimeter: number; // meters

  // Health Score (0 - 100)
  score: number;
  statusType: 'excellent' | 'warning' | 'critical';
  
  // Rule Violations & Suggestions
  warningsPersian: string[];
  recommendationsPersian: string[];
}

/**
 * Calculates 3D center coordinate of a unit in meters based on its wall index & wall position
 */
export function getUnit3DCenter(unit: CabinetUnitLayout, config: RoomLayoutConfig): TrianglePoint {
  const w1 = config.wall1Length / 1000;
  const uW = unit.widthMm / 1000;
  const uH = unit.heightMm / 1000;
  const uD = unit.depthMm / 1000;
  const uX = unit.xPosMm / 1000 + uW / 2;

  let x = 0;
  let y = uH / 2;
  let z = 0;

  if (unit.wallIndex === 1) {
    x = uX;
    z = uD / 2;
  } else if (unit.wallIndex === 2) {
    x = uD / 2;
    z = uX;
  } else if (unit.wallIndex === 3) {
    x = w1 - uD / 2;
    z = uX;
  }

  return {
    x,
    y,
    z,
    namePersian: unit.namePersian,
    unitId: unit.id,
  };
}

/**
 * Distance between two 3D points in meters
 */
export function calculate3DDistance(p1: TrianglePoint, p2: TrianglePoint): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = p1.z - p2.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * Evaluates Kitchen Layout according to international Golden Work Triangle rules
 */
export function evaluateGoldenTriangle(
  units: CabinetUnitLayout[],
  config: RoomLayoutConfig
): GoldenTriangleEvaluation {
  const sinkUnit = units.find((u) => u.unitType === 'base_sink');
  const gasUnit = units.find((u) => u.unitType === 'base_gas');
  const fridgeUnit = units.find((u) => u.unitType === 'tall_fridge');

  if (!sinkUnit || !gasUnit || !fridgeUnit) {
    return {
      hasAllAppliances: false,
      distSinkToGas: 0,
      distSinkToFridge: 0,
      distGasToFridge: 0,
      totalPerimeter: 0,
      score: 50,
      statusType: 'warning',
      warningsPersian: ['برای محاسبه مثلث طلایی، وجود هر سه عنصر سینک، اجاق گاز و یخچال الزامی است.'],
      recommendationsPersian: ['لطفاً ماژول‌های ناقص (سینک/گاز/یخچال) را به چیدمان اضافه کنید.'],
    };
  }

  const sinkPoint = getUnit3DCenter(sinkUnit, config);
  const gasPoint = getUnit3DCenter(gasUnit, config);
  const fridgePoint = getUnit3DCenter(fridgeUnit, config);

  const dSinkGas = calculate3DDistance(sinkPoint, gasPoint);
  const dSinkFridge = calculate3DDistance(sinkPoint, fridgePoint);
  const dGasFridge = calculate3DDistance(gasPoint, fridgePoint);

  const perimeter = dSinkGas + dSinkFridge + dGasFridge;

  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // 1. Check Individual Distance Limits (1.2m <= d <= 2.7m)
  if (dSinkGas < 1.2) {
    score -= 15;
    warnings.push(`⚠️ فاصله سینک تا اجاق گاز (${dSinkGas.toFixed(2)}m) کمتر از حد مجاز (۱.۲m) است. امکان پاشش آب روی روغنداغ یا شلوغی حین آشپزی وجود دارد.`);
    recommendations.push('حداقل ۶۰ سانتی‌متر فضای صفحه کابینت بین سینک و گاز قرار دهید.');
  } else if (dSinkGas > 2.7) {
    score -= 10;
    warnings.push(`⚠️ فاصله سینک تا اجاق گاز (${dSinkGas.toFixed(2)}m) بیشتر از حد استاندارد (۲.۷m) است. تردد غیرضروری را افزایش می‌دهد.`);
  }

  if (dSinkFridge < 1.2) {
    score -= 15;
    warnings.push(`⚠️ فاصله سینک تا یخچال (${dSinkFridge.toFixed(2)}m) فشرده است (کمتر از ۱.۲m). شستشوی مواد غذایی بلافاصله پس از خارج کردن از یخچال دچار مشکل می‌شود.`);
  } else if (dSinkFridge > 2.7) {
    score -= 10;
    warnings.push(`⚠️ فاصله سینک تا یخچال (${dSinkFridge.toFixed(2)}m) بیش از حد مجاز (۲.۷m) است.`);
  }

  if (dGasFridge < 1.2) {
    score -= 20;
    warnings.push(`⚠️ فاصله اجاق گاز تا یخچال (${dGasFridge.toFixed(2)}m) بسیار کم است (کمتر از ۱.۲m). حرارت گاز به موتور یخچال آسیب زده و مصرف برق را بالا می‌برد.`);
    recommendations.push('یخچال و اجاق گاز را ترجیحاً روی دو دیوار مجزا یا با فاصله حدالاقل ۱.۲m قرار دهید.');
  } else if (dGasFridge > 2.7) {
    score -= 10;
    warnings.push(`⚠️ فاصله اجاق گاز تا یخچال (${dGasFridge.toFixed(2)}m) بیشتر از ۲.۷m است.`);
  }

  // 2. Total Perimeter Rule (4.0m <= Perimeter <= 7.9m)
  if (perimeter < 4.0) {
    score -= 15;
    warnings.push(`⚠️ پیرامون مثلث طلایی (${perimeter.toFixed(2)}m) بسیار کوچک است. محیط کار خفه و فشرده است.`);
  } else if (perimeter > 7.9) {
    score -= 20;
    warnings.push(`⚠️ پیرامون مثلث طلایی (${perimeter.toFixed(2)}m) بیش از حد بزرگ است (حد مجاز ۷.۹m). آشپزی را خسته‌کننده می‌کند.`);
    recommendations.push('با تغییر جایگاه یخچال یا چیدمان L/U شکل، طول پیمایش را کاهش دهید.');
  }

  // 3. Adjacency Checks (Same Wall Side-by-Side without landing area)
  if (gasUnit.wallIndex === fridgeUnit.wallIndex && Math.abs(gasUnit.xPosMm - fridgeUnit.xPosMm) < 1200) {
    score -= 15;
    warnings.push('⚠️ اجاق گاز و یخچال روی یک دیوار و کاملاً مجاور هم هستند.');
  }

  score = Math.max(20, Math.min(100, score));

  let statusType: 'excellent' | 'warning' | 'critical' = 'excellent';
  if (score < 60) statusType = 'critical';
  else if (score < 85) statusType = 'warning';

  if (warnings.length === 0) {
    recommendations.push('چیدمان مثلث طلایی کاملاً منطبق بر استانداردهای بین‌المللی ارگونومی و ایمنی آشپزخانه است.');
  }

  return {
    hasAllAppliances: true,
    sinkPoint,
    gasPoint,
    fridgePoint,
    distSinkToGas: Number(dSinkGas.toFixed(2)),
    distSinkToFridge: Number(dSinkFridge.toFixed(2)),
    distGasToFridge: Number(dGasFridge.toFixed(2)),
    totalPerimeter: Number(perimeter.toFixed(2)),
    score,
    statusType,
    warningsPersian: warnings,
    recommendationsPersian: recommendations,
  };
}
