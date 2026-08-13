// =========================================================
// موتور تحلیل سینتکس و خطایابی خودکار کدهای VBA سالیدورک
// SolidWorks VBA Macro Syntax & Static Analyzer Engine
// =========================================================

export interface VbaDiagnostic {
  line: number;
  severity: 'error' | 'warning' | 'info';
  code: string;
  messagePersian: string;
  suggestionPersian?: string;
  fixAvailable?: boolean;
  fixType?: 'add_set' | 'add_end_sub' | 'add_error_handler' | 'add_meter_conv' | 'add_option_explicit' | 'fix_quotes';
}

export interface VbaAnalysisResult {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  infoCount: number;
  diagnostics: VbaDiagnostic[];
  linesOfCode: number;
  estimatedExecutionTimeMs: number;
  hasErrorHandler: boolean;
  usesSolidWorksApi: boolean;
  detectedFunctions: string[];
}

export interface SwConnectionStatus {
  isConnected: boolean;
  statusText: string;
  errorCode?: string;
  errorTitlePersian?: string;
  errorMessagePersian?: string;
  troubleshootingSteps?: string[];
  latencyMs?: number;
  solidWorksVersion?: string;
  port?: number;
}

/**
 * کدهای VBA ماکرو را خط به خط و به‌صورت ساختاری تحلیل می‌کند.
 */
export function analyzeVbaCode(code: string): VbaAnalysisResult {
  const diagnostics: VbaDiagnostic[] = [];
  const lines = code.split('\n');
  const linesOfCode = lines.length;

  let subCount = 0;
  let endSubCount = 0;
  let funcCount = 0;
  let endFuncCount = 0;
  let ifCount = 0;
  let endIfCount = 0;
  let forCount = 0;
  let nextCount = 0;
  let withCount = 0;
  let endWithCount = 0;
  let selectCaseCount = 0;
  let endSelectCount = 0;

  let hasOptionExplicit = false;
  let hasErrorHandler = false;
  let usesSolidWorksApi = false;
  const detectedFunctions: string[] = [];

  const swObjects = ['swapp', 'swmodel', 'swpart', 'swassembly', 'swdrawing', 'swfeat', 'swsketch', 'swcomp', 'swext'];

  lines.forEach((lineContent, index) => {
    const lineNumber = index + 1;
    const trimmed = lineContent.trim();

    // Skip comment lines in VBA (starts with ' or Rem)
    if (trimmed.startsWith("'") || trimmed.toLowerCase().startsWith('rem ')) {
      return;
    }

    const lower = trimmed.toLowerCase();

    // Track Option Explicit
    if (lower.startsWith('option explicit')) {
      hasOptionExplicit = true;
    }

    // Track Error Handler
    if (lower.includes('on error goto') || lower.includes('on error resume next')) {
      hasErrorHandler = true;
    }

    // Track SW API
    if (
      lower.includes('application.sldworks') ||
      lower.includes('swapp.') ||
      lower.includes('swmodel.') ||
      lower.includes('selectbyid2')
    ) {
      usesSolidWorksApi = true;
    }

    // Count block structures
    if (/^sub\s+/i.test(trimmed)) {
      subCount++;
      const matchName = trimmed.match(/^sub\s+([a-zA-Z0-9_]+)/i);
      if (matchName) detectedFunctions.push(matchName[1]);
    }
    if (/^end\s+sub$/i.test(trimmed) || trimmed.toLowerCase() === 'end sub') {
      endSubCount++;
    }

    if (/^function\s+/i.test(trimmed)) {
      funcCount++;
      const matchName = trimmed.match(/^function\s+([a-zA-Z0-9_]+)/i);
      if (matchName) detectedFunctions.push(matchName[1]);
    }
    if (/^end\s+function$/i.test(trimmed) || trimmed.toLowerCase() === 'end function') {
      endFuncCount++;
    }

    if (/^if\s+.*then$/i.test(trimmed) || (/^if\s+/i.test(trimmed) && trimmed.endsWith('then'))) {
      ifCount++;
    }
    if (/^end\s+if$/i.test(trimmed) || trimmed.toLowerCase() === 'end if') {
      endIfCount++;
    }

    if (/^for\s+/i.test(trimmed)) {
      forCount++;
    }
    if (/^next(\s+[a-zA-Z0-9_]+)?$/i.test(trimmed)) {
      nextCount++;
    }

    if (/^with\s+/i.test(trimmed)) {
      withCount++;
    }
    if (/^end\s+with$/i.test(trimmed) || trimmed.toLowerCase() === 'end with') {
      endWithCount++;
    }

    if (/^select\s+case\s+/i.test(trimmed)) {
      selectCaseCount++;
    }
    if (/^end\s+select$/i.test(trimmed) || trimmed.toLowerCase() === 'end select') {
      endSelectCount++;
    }

    // Check 1: Missing 'Set' keyword for object assignment in VBA
    // e.g. swApp = Application.SldWorks or swModel = swApp.ActiveDoc
    swObjects.forEach((objName) => {
      const assignmentRegex = new RegExp(`^(${objName}\\s*=\\s*.*)`, 'i');
      if (assignmentRegex.test(trimmed) && !trimmed.toLowerCase().startsWith('set ')) {
        diagnostics.push({
          line: lineNumber,
          severity: 'error',
          code: 'ERR_MISSING_SET',
          messagePersian: `در متغیر شیء «${objName}» کلید Set فراموش شده است. متغیرهای COM در VBA نیاز به کلمه کلیدی Set دارند.`,
          suggestionPersian: `عبارت را به صورت «Set ${trimmed}» اصلاح کنید.`,
          fixAvailable: true,
          fixType: 'add_set',
        });
      }
    });

    // Check 2: Unclosed string literal
    const quoteCount = (trimmed.match(/"/g) || []).length;
    if (quoteCount % 2 !== 0) {
      diagnostics.push({
        line: lineNumber,
        severity: 'error',
        code: 'ERR_UNCLOSED_STRING',
        messagePersian: 'رشته متنی بسته‌نشده در این خط وجود دارد (تعداد کوتیشن " فرد است).',
        suggestionPersian: 'علامت " انتهایی را در پایان عبارت متنی اضافه کنید.',
        fixAvailable: true,
        fixType: 'fix_quotes',
      });
    }

    // Check 3: SelectByID2 argument count check
    if (trimmed.includes('SelectByID2')) {
      const match = trimmed.match(/SelectByID2\s*\(?([^)]+)\)?/i);
      if (match) {
        const args = match[1].split(',');
        if (args.length > 0 && args.length < 9) {
          diagnostics.push({
            line: lineNumber,
            severity: 'warning',
            code: 'WARN_SW_SELECTBYID2_ARGS',
            messagePersian: `متد SelectByID2 نیاز به ۹ آرگومان دارد (شما ${args.length} آرگومان وارد کرده‌اید).`,
            suggestionPersian:
              'فرمت صحیح: SelectByID2(Name, Type, X, Y, Z, Append, Mark, Callout, SelectOption)',
          });
        }
      }
    }

    // Check 4: Check if dimensions in millimeters were passed directly without meter scaling in SW API
    // SolidWorks API native unit is Meters! Passing 600 means 600 Meters!
    if (/CreateRectangle\s+[\d\.]+\s*,\s*[\d\.]+\s*,\s*[\d\.]+\s*,\s*([0-9]{3,})\s*,/i.test(trimmed)) {
      diagnostics.push({
        line: lineNumber,
        severity: 'warning',
        code: 'WARN_LARGE_MM_DIMENSION',
        messagePersian: 'عدد بزرگ میلی‌متری مستقیم به متد هندسی سالیدورک داده شده است. واحد نیتیو سالیدورک **متر** است!',
        suggestionPersian: 'عدد را بر ۱۰۰۰ تقسیم کنید (مثلاً ۶۰۰mm را به صورت ۰.۶m یا 600 / 1000 وارد کنید).',
        fixAvailable: true,
        fixType: 'add_meter_conv',
      });
    }

    // Check 5: Division by zero check
    if (/\/0(?![0-9\.] )/i.test(trimmed)) {
      diagnostics.push({
        line: lineNumber,
        severity: 'error',
        code: 'ERR_DIV_BY_ZERO',
        messagePersian: 'تقسیم بر صفر متناقض در این خط یافت شد.',
        suggestionPersian: 'مخرج کسر را بررسی کنید و مقدار غیرصفر قرار دهید.',
      });
    }
  });

  // Global Checks
  if (subCount > endSubCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_SUB',
      messagePersian: `تعداد ${subCount - endSubCount} بلاک Sub بسته نشده است. کلید End Sub مفقود می‌باشد.`,
      suggestionPersian: 'در انتهای رویه، عبارت End Sub را اضافه کنید.',
      fixAvailable: true,
      fixType: 'add_end_sub',
    });
  }

  if (funcCount > endFuncCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_FUNC',
      messagePersian: `تعداد ${funcCount - endFuncCount} تابع Function بسته نشده است. کلید End Function مفقود می‌باشد.`,
      suggestionPersian: 'در انتهای تابع، عبارت End Function را اضافه کنید.',
    });
  }

  if (ifCount > endIfCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_IF',
      messagePersian: `تعداد ${ifCount - endIfCount} دستور شرطی If بسته نشده است. کلید End If مفقود می‌باشد.`,
      suggestionPersian: 'دستورات If چندخطی نیاز به End If در انتها دارند.',
    });
  }

  if (forCount > nextCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_FOR',
      messagePersian: `تعداد ${forCount - nextCount} حلقه For بسته نشده است. کلمه Next مفقود می‌باشد.`,
      suggestionPersian: 'برای پایان حلقه For، کلمه کلیدی Next را اضافه نمایید.',
    });
  }

  if (withCount > endWithCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_WITH',
      messagePersian: `بلاک With بسته نشده است. عبارت End With مفقود است.`,
      suggestionPersian: 'در انتهای بلاک، عبارت End With را درج کنید.',
    });
  }

  if (selectCaseCount > endSelectCount) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'error',
      code: 'ERR_UNCLOSED_SELECT',
      messagePersian: `دستور Select Case بسته نشده است. کلمه End Select مفقود است.`,
      suggestionPersian: 'عبارت End Select را اضافه کنید.',
    });
  }

  if (!hasOptionExplicit) {
    diagnostics.push({
      line: 1,
      severity: 'info',
      code: 'INFO_MISSING_OPTION_EXPLICIT',
      messagePersian: 'توصیه: عبارت Option Explicit در ابتدای فایل قرار ندارد.',
      suggestionPersian: 'اضافه کردن Option Explicit باعث جلوگیری از خطاهای تایپی نام متغیرها در ویندوز می‌شود.',
      fixAvailable: true,
      fixType: 'add_option_explicit',
    });
  }

  if (!hasErrorHandler) {
    diagnostics.push({
      line: linesOfCode,
      severity: 'info',
      code: 'INFO_MISSING_ERROR_HANDLER',
      messagePersian: 'توصیه کارگاهی: بلاک مدیریت خطای شبکه/سالیدورک (On Error GoTo ErrorHandler) در ماکرو وجود ندارد.',
      suggestionPersian: 'افزودن مدیریت خطا باعث می‌شود در صورت رخ دادن باگ در سالیدورک، پیغام خطای خوانا نمایش داده شود.',
      fixAvailable: true,
      fixType: 'add_error_handler',
    });
  }

  const errorCount = diagnostics.filter((d) => d.severity === 'error').length;
  const warningCount = diagnostics.filter((d) => d.severity === 'warning').length;
  const infoCount = diagnostics.filter((d) => d.severity === 'info').length;

  return {
    isValid: errorCount === 0,
    errorCount,
    warningCount,
    infoCount,
    diagnostics,
    linesOfCode,
    estimatedExecutionTimeMs: Math.max(120, linesOfCode * 15),
    hasErrorHandler,
    usesSolidWorksApi,
    detectedFunctions,
  };
}

/**
 * کدهای دارای ایراد را بر اساس نوع خطا اصلاح خودکار می‌کند.
 */
export function autoFixVbaCode(code: string): { fixedCode: string; fixesApplied: string[] } {
  let fixedCode = code;
  const fixesApplied: string[] = [];

  // Fix 1: Add Option Explicit if missing
  if (!/option explicit/i.test(fixedCode)) {
    fixedCode = `Option Explicit\n\n` + fixedCode;
    fixesApplied.push('افزودن دستور Option Explicit جهت الزام تعریف متغیرها');
  }

  // Fix 2: Add Set to unassigned COM object variables
  const swObjects = ['swApp', 'swModel', 'swPart', 'swAssembly', 'swDrawing', 'swFeat', 'swSketch', 'swComp', 'swExt'];
  swObjects.forEach((obj) => {
    const regex = new RegExp(`^(\\s*)(${obj}\\s*=\\s*.*)`, 'gim');
    if (regex.test(fixedCode)) {
      fixedCode = fixedCode.replace(regex, (match, p1, p2) => {
        if (!p2.toLowerCase().startsWith('set ')) {
          return `${p1}Set ${p2}`;
        }
        return match;
      });
      fixesApplied.push(`افزودن کلمه کلیدی «Set» برای متغیر COM سالیدورک (${obj})`);
    }
  });

  // Fix 3: Fix unclosed quote at line ends
  const lines = fixedCode.split('\n');
  const fixedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("'")) return line;
    const qCount = (line.match(/"/g) || []).length;
    if (qCount % 2 !== 0) {
      fixesApplied.push('بستن کوتیشن متنی در انتهای خط');
      return line + '"';
    }
    return line;
  });
  fixedCode = fixedLines.join('\n');

  // Fix 4: Add End Sub if missing
  const subMatch = fixedCode.match(/sub\s+/gi) || [];
  const endSubMatch = fixedCode.match(/end\s+sub/gi) || [];
  if (subMatch.length > endSubMatch.length) {
    fixedCode += `\nEnd Sub\n`;
    fixesApplied.push('افزودن دستور End Sub در انتهای کد ماکرو');
  }

  // Fix 5: Add Error Handling block if missing
  if (!/on error goto/i.test(fixedCode) && /sub main/i.test(fixedCode)) {
    fixedCode = fixedCode.replace(
      /Sub main\(\)/i,
      `Sub main()\n    On Error GoTo ErrorHandler\n`
    );

    const errorHandlerBlock = `
    Exit Sub

ErrorHandler:
    MsgBox "خطا در اجرای ماکروی سالیدورک: " & Err.Description, vbCritical, "خطای SolidWorks COM API"
End Sub`;

    // Replace the last End Sub with error handler block
    const lastEndSubIdx = fixedCode.lastIndexOf('End Sub');
    if (lastEndSubIdx !== -1) {
      fixedCode = fixedCode.substring(0, lastEndSubIdx) + errorHandlerBlock;
      fixesApplied.push('افزودن دستور On Error GoTo ErrorHandler و پیغام خطای هوشمند');
    }
  }

  return { fixedCode, fixesApplied };
}

/**
 * کدهای بهینه‌سازی سرعت و کارایی ماکرو در سالیدورک را تزریق می‌کند.
 */
export function injectPerformanceBooster(code: string): { boostedCode: string; log: string } {
  if (!/sub main\(\)/i.test(code)) {
    return { boostedCode: code, log: 'رویه Sub main() یافت نشد.' };
  }

  const perfSnippet = `
    ' [بهینه‌ساز سرعت سالیدورک]: غیرفعال‌سازی گرافیک لایو حین اجرای ماکرو
    swApp.SetUserPreferenceToggle swUserPreferenceToggle_e.swPerformanceFeatureTreeAnimation, False
    swModel.FeatureManager.EnableFeatureTree = False
`;

  const resetPerfSnippet = `
    ' [بازگردانی تنظیمات گرافیکی سالیدورک]
    swModel.FeatureManager.EnableFeatureTree = True
    swModel.GraphicsRedraw2
`;

  let boosted = code.replace(/Sub main\(\)/i, `Sub main()\n${perfSnippet}`);
  if (boosted.includes('Exit Sub')) {
    boosted = boosted.replace('Exit Sub', `${resetPerfSnippet}\n    Exit Sub`);
  } else {
    const lastEndSubIdx = boosted.lastIndexOf('End Sub');
    if (lastEndSubIdx !== -1) {
      boosted = boosted.substring(0, lastEndSubIdx) + resetPerfSnippet + '\nEnd Sub';
    }
  }

  return {
    boostedCode: boosted,
    log: '⚡ تنظیمات افزایش سرعت (غیرفعال‌سازی انیمیشن درخت طراحی و رندر لحظه‌ای) با موفقیت تزریق شد.',
  };
}

/**
 * کاتالوگ جامع خطاهای اتصال سالیدورک همراه با راهکارهای رفع خطای فارسی
 */
export const SOLIDWORKS_CONNECTION_ERRORS: Record<string, SwConnectionStatus> = {
  ERR_SW_NOT_RUNNING: {
    isConnected: false,
    statusText: 'پروسه SolidWorks در حال اجرا نیست',
    errorCode: 'SW_ERR_1001',
    errorTitlePersian: 'عدم شناسایی نرم‌افزار SolidWorks روی سیستم',
    errorMessagePersian: 'هیچ پروسه فعال SldWorks.exe در Task Manager ویندوز یافت نشد.',
    troubleshootingSteps: [
      'نرم‌افزار SolidWorks را روی کامپیوتر خود اجرا کنید.',
      'تا بارگذاری کامل صفحه اصلی SolidWorks منتظر بمانید.',
      'دکمه «تست مجدد اتصال» در بالای برنامه را کلیک کنید.',
    ],
  },
  ERR_PORT_REFUSED: {
    isConnected: false,
    statusText: 'پورت ارتباطی 8080 مسدود یا غیرفعال است',
    errorCode: 'SW_ERR_1002',
    errorTitlePersian: 'عدم پاسخگویی لایو سوکت ویندوز (127.0.0.1:8080)',
    errorMessagePersian: 'اتصال شبکه محلی با سرویس پایتون/COM سالیدورک برقرار نشد (Connection Refused).',
    troubleshootingSteps: [
      'فایل لانچر solidworks_link.bat را دانلود و اجرا کنید.',
      'بررسی کنید که آنتی‌ویروس یا فایروال ویندوز پورت 8080 را مسدود نکرده باشد.',
      'دستور `python solidworks_link.py` را در CMD ویندوز اجرا کنید.',
    ],
  },
  ERR_NO_ACTIVE_DOC: {
    isConnected: false,
    statusText: 'هیچ سند یا پارتی در SolidWorks باز نیست',
    errorCode: 'SW_ERR_1003',
    errorTitlePersian: 'عدم وجود Document فعال در سالیدورک',
    errorMessagePersian: 'نرم‌افزار سالیدورک باز است، اما هیچ فایل Part (.sldprt) یا Assembly (.sldasm) باز نشده است.',
    troubleshootingSteps: [
      'در سالیدورک به منوی File -> New بروید و یک Part جدید ایجاد کنید.',
      'یا گزینه ساخت خودکار سند جدید در کدهای ماکرو را فعال نمایید.',
    ],
  },
  ERR_ADMIN_REQUIRED: {
    isConnected: false,
    statusText: 'محدودیت سطح دسترسی Administrator در ویندوز',
    errorCode: 'SW_ERR_1004',
    errorTitlePersian: 'خطای دسترسی COM API (Permission Denied)',
    errorMessagePersian: 'برنامه سالیدورک و مرورگر دارای سطح دسترسی متفاوت (Elevated vs User) هستند.',
    troubleshootingSteps: [
      'هر دو برنامه مرورگر و سالیدورک را بسته‌اید؟',
      'روی آیکون SolidWorks کلیک راست کرده و گزینه "Run as Administrator" را بزنید.',
    ],
  },
  ERR_VBA_DISABLED: {
    isConnected: false,
    statusText: 'قابلیت اجرای ماکروی VBA در سالیدورک غیرفعال است',
    errorCode: 'SW_ERR_1005',
    errorTitlePersian: 'غیرفعال بودن افزونه Microsoft VBA در SolidWorks',
    errorMessagePersian: 'تنظیمات امنیت ماکرو در سالیدورک مانع از اجرای اسکریپت‌های COM می‌شود.',
    troubleshootingSteps: [
      'در سالیدورک به منوی Tools -> Options -> System Options -> Security بروید.',
      'گزینه Enable Macro Execution را روی حالت Allow قرار دهید.',
    ],
  },
};
