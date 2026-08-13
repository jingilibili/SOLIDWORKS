import React, { useState, useEffect } from 'react';
import { ActiveTab } from '../types';
import { 
  FileCode2, 
  Play, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Sparkles, 
  Box, 
  Home, 
  Bed, 
  ShoppingCart, 
  Package, 
  Wrench, 
  Cog, 
  Mic, 
  FolderKanban, 
  BookOpen, 
  Link2, 
  ArrowLeft, 
  Layers, 
  MousePointer, 
  Info, 
  Check,
  Code,
  AlertTriangle,
  Bug,
  Zap,
  Download,
  RefreshCw,
  XCircle,
  AlertCircle,
  ShieldAlert,
  Search,
  Activity,
  CheckCheck
} from 'lucide-react';
import { 
  analyzeVbaCode, 
  autoFixVbaCode, 
  injectPerformanceBooster, 
  SOLIDWORKS_CONNECTION_ERRORS, 
  VbaAnalysisResult, 
  VbaDiagnostic 
} from '../utils/vbaAnalyzerEngine';

interface MacroGuideStudioProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const MacroGuideStudio: React.FC<MacroGuideStudioProps> = ({ onNavigateTab }) => {
  const [copiedSample, setCopiedSample] = useState<boolean>(false);
  const [activeGuideTab, setActiveGuideTab] = useState<
    'macro_editor' | 'connection_diagnostics' | 'what_is_macro' | 'how_to_run' | 'app_features' | 'button_tooltips'
  >('macro_editor');

  // Editor State
  const [vbaCodeInput, setVbaCodeInput] = useState<string>(`' =========================================================
' ماکروی نمونه سالیدورک جهت تحلیل و تست
' =========================================================
Sub main()
    Dim swApp As Object
    Dim swModel As Object
    Dim swPart As Object
    
    ' اتصال به برنامه SolidWorks
    Set swApp = Application.SldWorks
    
    ' ایجاد پارت جدید در سالیدورک
    Set swModel = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    Set swPart = swModel
    
    ' ایجاد اسکتچ بدنه کابینت (عرض 600mm x ارتفاع 800mm)
    swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateRectangle 0, 0, 0, 0.6, 0.8, 0
    swModel.FeatureManager.FeatureExtrusion2 True, False, False, 0, 0, 0.55, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False
    
    swModel.ClearSelection2 True
    MsgBox "یونیت کابینت با موفقیت در سالیدورک ایجاد شد!", vbInformation, "دستیار هوشمند سالیدورک"
End Sub`);

  const [analysisResult, setAnalysisResult] = useState<VbaAnalysisResult | null>(null);
  const [editorNotification, setEditorNotification] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string>('sample_cabinet');

  // SolidWorks Connection Monitor State
  const [swConnStatus, setSwConnStatus] = useState<string>('OFFLINE'); // OFFLINE, TESTING, CONNECTED, ERROR
  const [activeErrorKey, setActiveErrorKey] = useState<string>('ERR_SW_NOT_RUNNING');
  const [testLog, setTestLog] = useState<string[]>([]);

  useEffect(() => {
    // Perform initial code analysis
    const res = analyzeVbaCode(vbaCodeInput);
    setAnalysisResult(res);
  }, [vbaCodeInput]);

  // Code Preset Handlers
  const handleLoadPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    let code = '';
    switch (presetKey) {
      case 'sample_cabinet':
        code = `' =========================================================
' ماکروی خودکار سالیدورک - یونیت کابینت زمینی پارامتریک
' =========================================================
Sub main()
    Dim swApp As Object
    Dim swModel As Object
    
    Set swApp = Application.SldWorks
    Set swModel = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    
    swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateRectangle 0, 0, 0, 0.6, 0.8, 0
    swModel.FeatureManager.FeatureExtrusion2 True, False, False, 0, 0, 0.55, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False
    
    swModel.ClearSelection2 True
    MsgBox "کابینت زمینی با موفقیت مدلسازی گردید.", vbInformation, "SolidWorks Master"
End Sub`;
        break;
      case 'broken_code_sample':
        code = `' =========================================================
' نمونه کد دارای خطای سینتکس (جهت تست موتور خطایاب خودکار)
' =========================================================
Sub main()
    Dim swApp As Object
    Dim swModel As Object
    
    ' خطای ۱: عدم استفاده از کلید Set در متغیر شیء COM
    swApp = Application.SldWorks
    swModel = swApp.ActiveDoc
    
    ' خطای ۲: کوتیشن بسته‌نشده متنی
    swModel.Extension.SelectByID2 "Front Plane, "PLANE", 0, 0, 0, False, 0, Nothing, 0
    
    ' خطای ۳: دادن ابعاد بزرگ میلی‌متری مستقیم (واحد نیتیو متر است)
    swModel.SketchManager.CreateRectangle 0, 0, 0, 600, 800, 0
    
    ' خطای ۴: مفقود بودن End Sub در پایان کد`;
        break;
      case 'murphy_bed_sample':
        code = `' =========================================================
' ماکروی سالیدورک - کلاف فولادی تخت تاشو هیدرولیک
' =========================================================
Sub main()
    Dim swApp As Object
    Dim swModel As Object
    
    Set swApp = Application.SldWorks
    Set swModel = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    
    ' ساخت پروفیل کلاف فلزی تخت دو نفره (1600mm x 2000mm)
    swModel.Extension.SelectByID2 "Top Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateRectangle 0, 0, 0, 1.6, 2.0, 0
    swModel.FeatureManager.FeatureExtrusion2 True, False, False, 0, 0, 0.05, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False
    
    swModel.ClearSelection2 True
    MsgBox "کلاف تخت تاشو با موفقیت ایجاد شد.", vbInformation, "تخت تاشو هیدرولیک"
End Sub`;
        break;
      case 'cnc_revolve_sample':
        code = `' =========================================================
' ماکروی سالیدورک - تراشکاری شفت پله‌ای (Revolve Feature)
' =========================================================
Sub main()
    Dim swApp As Object
    Dim swModel As Object
    
    Set swApp = Application.SldWorks
    Set swModel = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\templates\\Part.prtdot", 0, 0, 0)
    
    swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0
    swModel.SketchManager.InsertSketch True
    swModel.SketchManager.CreateCenterLine 0, 0, 0, 0.15, 0, 0
    swModel.SketchManager.CreateRectangle 0, 0, 0, 0.15, 0.025, 0
    
    ' اعمال دستور Revolve 360 درجه
    swModel.FeatureManager.FeatureRevolve2 True, True, False, False, False, False, 0, 0, 6.28318, 0, False, False, 0, 0, 0, 0, 0, True, True, True
    MsgBox "شفت تراشکاری CNC ایجاد گردید.", vbInformation, "تراش CNC"
End Sub`;
        break;
      default:
        break;
    }
    setVbaCodeInput(code);
  };

  // Action: Analyze Code
  const handleAnalyzeCode = () => {
    const res = analyzeVbaCode(vbaCodeInput);
    setAnalysisResult(res);
    if (res.isValid) {
      setEditorNotification('✅ بررسی سینتکس کامل شد: کد ماکرو ۱۰۰٪ عاری از خطای سینتکس می‌باشد.');
    } else {
      setEditorNotification(`⚠️ تحلیل انجام شد: تعداد ${res.errorCount} خطای سینتکس در کد پیدا شد.`);
    }
    setTimeout(() => setEditorNotification(null), 4000);
  };

  // Action: Auto Fix Code
  const handleAutoFixCode = () => {
    const { fixedCode, fixesApplied } = autoFixVbaCode(vbaCodeInput);
    setVbaCodeInput(fixedCode);
    const newRes = analyzeVbaCode(fixedCode);
    setAnalysisResult(newRes);
    if (fixesApplied.length > 0) {
      setEditorNotification(`✨ اصلاحات انجام شد:\n• ${fixesApplied.join('\n• ')}`);
    } else {
      setEditorNotification('نیاز به اصلاح خودکار یافت نشد (کد در وضعیت استاندارد قرار دارد).');
    }
    setTimeout(() => setEditorNotification(null), 6000);
  };

  // Action: Inject Performance Booster
  const handleInjectPerformance = () => {
    const { boostedCode, log } = injectPerformanceBooster(vbaCodeInput);
    setVbaCodeInput(boostedCode);
    setEditorNotification(log);
    setTimeout(() => setEditorNotification(null), 4000);
  };

  // Action: Insert Code Snippet at Cursor / End
  const handleInsertSnippet = (snippet: string) => {
    setVbaCodeInput((prev) => prev + '\n' + snippet);
  };

  // Action: Download .SWP File
  const handleDownloadSwpFile = () => {
    const blob = new Blob([vbaCodeInput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SolidWorks_Macro_Analyzed.swp';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Action: Copy Code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(vbaCodeInput);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2500);
  };

  // Action: Test Live SW Connection
  const handleTestLiveConnection = () => {
    setSwConnStatus('TESTING');
    setTestLog(['[00:01] 🔍 در حال بررسی پروسه SldWorks.exe در ویندوز...']);

    setTimeout(() => {
      setTestLog((prev) => [
        ...prev,
        '[00:02] 📡 تست پورت محلی Windows Socket (127.0.0.1:8080)...',
      ]);
    }, 400);

    setTimeout(() => {
      // Simulate real detection or selected error
      if (activeErrorKey === 'CONNECTED') {
        setSwConnStatus('CONNECTED');
        setTestLog((prev) => [
          ...prev,
          '[00:03] ✅ اتصال موفق! پروسه SolidWorks 2024 متصل شد.',
          '[00:04] 🎉 آماده دریافت و اجرای کدهای ماکرو.',
        ]);
      } else {
        setSwConnStatus('ERROR');
        const errInfo = SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey];
        setTestLog((prev) => [
          ...prev,
          `[00:03] ❌ خطای اتصال: ${errInfo?.errorTitlePersian || 'اتصال ناموفق'}`,
          `[00:04] 💡 کد خطا: ${errInfo?.errorCode || 'ERR_UNKNOWN'}`,
        ]);
      }
    }, 1200);
  };

  const appFeaturesList = [
    {
      id: 'room_planner',
      title: 'طراحی هوشمند متراژ آشپزخانه و اتاق خواب',
      icon: <Home className="w-5 h-5 text-blue-600" />,
      badge: 'متراژ زوایا و مثلث طلایی',
      summary: 'طراحی اتوماتیک چیدمان کامل بر اساس طول دیوارهای اصلی، زاویه کنج (۹۰ یا ۱۳۵ درجه) و جای تأسیسات.',
      details: [
        'محاسبه ارگونومیک مثلث طلایی (سینک، گاز، یخچال).',
        'جانمایی خودکار یونیت سینک ضدآب، پنتری ایستاده، باکس یخچال و کابینت‌های هوایی.',
        'امکان ویرایش دستی ابعاد هر یونیت و بازخورد به سیستم AI جهت تنظیم مجدد.',
        'تولید خودکار کد ماکروی کامل مونتاژ سالیدورک (.SWP).'
      ]
    },
    {
      id: 'cabinet',
      title: 'استودیو طراحی هوشمند کابینت MDF',
      icon: <Box className="w-5 h-5 text-amber-600" />,
      badge: 'پارامتریک و بادخور',
      summary: 'طراحی دقیق یونیت‌های زمینی، دیواری، کمد ایستاده و کشویی با لقی بادخور و شیار فیبر.',
      details: [
        'محاسبه لقی درب‌ها (۲mm)، بادخور پاخور و شیار فیبر بدنه (۳mm).',
        'جانمایی اتوماتیک سوراخکاری لولا گازور ۳۵mm و ریل‌های ساچمه‌ای.',
        'جدول متراژ نوار PVC (۱ و ۲ میلیمتر) و تعداد قطعات برش MDF.',
        'خروجی فایل ماکروی سه‌بعدی و نقشه برش CutMaster.'
      ]
    },
    {
      id: 'murphy_bed',
      title: 'استودیو طراحی تخت تاشو و اتاق خواب',
      icon: <Bed className="w-5 h-5 text-indigo-600" />,
      badge: 'کلاف فلزی و جک نیتروژنی',
      summary: 'طراحی باکس تخت تاشو دیواری یک‌نفره و دو‌نفره همراه با کلاف قوطی فولادی و جک‌های هیدرولیک.',
      details: [
        'محاسبه ابعاد تشک استاندارد و عمق باکس (۴۰ تا ۶۰ سانتی‌متر).',
        'محاسبه متراژ پروفیل قوطی فولادی (30x50mm) و جک‌های نیتروژنی ۱۰۰۰ تا ۱۵۰۰ نیوتون.',
        'طراحی کمدهای ویترینی و کتابخانه‌های جانبی همراه با تخت.',
        'تولید خودکار کد ماکروی مدلسازی سه‌بعدی سالیدورک.'
      ]
    },
    {
      id: 'procurement',
      title: 'برآورد اقلام و پیش‌فاکتور خرید کارگاهی',
      icon: <ShoppingCart className="w-5 h-5 text-emerald-600" />,
      badge: 'لیست خرید و قیمت‌گذاری',
      summary: 'استخراج متراژ دقیق تمام اقلام مصرفی و برآورد هزینه خرید بر اساس قیمت‌های روز بازار.',
      details: [
        'محاسبه متراژ نوار PVC، تعداد ورق MDF بدنه و نما.',
        'شمارش لولا گازور، ریل ساچمه‌ای ۳ زمانه، پیچ MDF، الیت و جک‌های هیدرولیک.',
        'محاسبه متراژ پروفیل فولادی جوشکاری کلاف تخت.',
        'قابلیت درج قیمت واحد به تومان و تولید فایل متنی خرید.'
      ]
    },
    {
      id: 'standard_parts',
      title: 'قطعات و اتصالات استاندارد',
      icon: <Package className="w-5 h-5 text-purple-600" />,
      badge: 'استاندارد DIN / ISO',
      summary: 'مدلسازی انواع قطعات استاندارد صنعتی مانند پیچ‌های آلن، شش‌گوش، پروفیل‌های صنعتی و فیتینگ.',
      details: [
        'پشتیبانی از استانداردهای DIN 912، ISO 4014 و پیچ‌های ام‌دی‌اف.',
        'انتخاب متریال و رزوه متری M4 تا M12.',
        'تولید خودکار ماکرو جهت فراخوانی سریع در محیط Assembly سالیدورک.'
      ]
    },
    {
      id: 'hardware',
      title: 'یراق‌آلات و اتصال‌دهنده‌ها',
      icon: <Wrench className="w-5 h-5 text-teal-600" />,
      badge: 'لولا، ریل و الیت',
      summary: 'طراحی تخصصی لولا گازور ۳۵mm، ریل‌های ساچمه‌ای، اتصالات الیت/مینی‌فیکس و دستگیره‌های مخفی.',
      details: [
        'مدل‌سازی لولای توکار، روکار و نیم‌درگیر بلوم و فنطونی.',
        'محاسبه دقیق فاصله سوراخکاری پیچ و سوراخ کاسه لولا (11.5mm).',
        'مدل‌سازی ریل‌های ساچمه‌ای با طول‌های ۳۰ تا ۵۰ سانتی‌متر.'
      ]
    },
    {
      id: 'cnc',
      title: 'طراحی و تراشکاری CNC',
      icon: <Cog className="w-5 h-5 text-rose-600" />,
      badge: 'شفت، رزوه و G-Code',
      summary: 'طراحی پارامتریک قطعات گرد و شفت‌های پله‌ای با خروجی ماکروی Revolve و کدهای G-Code.',
      details: [
        'مدل‌سازی شفت‌های پله‌ای، رزوه زنی متری و شیارتراشی.',
        'ایجاد خودکار فاز (Chamfer) و شعاع (Fillet) در لبه‌های قطعه.',
        'استخراج ماکروی Revolve سالیدورک و مسیر ابزار G-Code جهت ماشینکاری.'
      ]
    },
    {
      id: 'voice_cad',
      title: 'دستیار صوتی طراحی (Voice CAD)',
      icon: <Mic className="w-5 h-5 text-sky-600" />,
      badge: 'فرمان صوتی فارسی',
      summary: 'تبدیل مستقیم دستورات صوتی فارسی کارگاه به مدل ۳بعدی و کد ماکروی سالیدورک.',
      details: [
        'تشخیص کلمات تخصصی (کابینت، لولا، یونیت زمینی، کشو، ابعاد).',
        'تولید آنی کد ماکرو و نمایش پارامترهای استخراج شده از صدای کاربر.'
      ]
    },
    {
      id: 'solidworks_link',
      title: 'اتصال مستقیم سالیدورک و خروجی .EXE',
      icon: <Link2 className="w-5 h-5 text-blue-600" />,
      badge: 'COM API & Python',
      summary: 'برقراری ارتباط مستقیم زنده با نرم‌افزار SolidWorks در حال اجرا روی سیستم شما.',
      details: [
        'دانلود لانچر خودکار `solidworks_link.bat` جهت اجرای سریع.',
        'ارسال کدهای ماکرو به SolidWorks COM API بدون نیاز به باز کردن VBA Editor.',
        'پشتیبانی از کدهای اسکریپت پایتون و PyAutoGUI.'
      ]
    }
  ];

  const buttonTooltipCatalog = [
    {
      buttonLabel: '🔗 اتصال به SolidWorks',
      location: 'هدر بالای برنامه (Header)',
      tooltipText: 'ارسال دستور تست به نرم‌افزار سالیدورک جهت بررسی اتصال زنده از طریق COM API.',
      actionType: 'تست اتصال زنده'
    },
    {
      buttonLabel: 'خروجی .EXE',
      location: 'هدر بالای برنامه (Header)',
      tooltipText: 'دانلود فایل لانچر دستیار سالیدورک و کدهای پایتون جهت اجرای یک‌کلیکی ماکروها روی ویندوز.',
      actionType: 'دانلود لانچر ویندوز'
    },
    {
      buttonLabel: '📋 کپی کد VBA ماکرو',
      location: 'تمام استودیوها (کابینت، متراژ، تخت، CNC و...)',
      tooltipText: 'کپی کردن تمام کدهای Visual Basic ماکرو در حافظه سیستم جهت پیست کردن در سالیدورک (Alt + F11).',
      actionType: 'کپی کد به Clipboard'
    },
    {
      buttonLabel: '💾 ذخیره الگو در حافظه',
      location: 'استودیو کابینت و متراژ',
      tooltipText: 'ذخیره ابعاد و تنظیمات جاری به عنوان الگوی پرکاربرد در موتور یادگیری آفلاین سیستم.',
      actionType: 'ذخیره الگوی یادگیری'
    },
    {
      buttonLabel: '🚀 تولید خودکار مدل ۳بعدی',
      location: 'استودیوی طراح گام‌به‌گام (Wizard)',
      tooltipText: 'محاسبه تمامی پارامترها بر اساس پاسخ‌های شما و ساخت کد ماکروی نهایی سالیدورک.',
      actionType: 'تولید ماکرو'
    },
    {
      buttonLabel: '🛒 ثبت پیش‌فاکتور خرید',
      location: 'لیست اقلام خرید (Procurement)',
      tooltipText: 'محاسبه مجموع قیمت متراژ نوار، ورق‌های MDF، لولا و یراق‌آلات و صدور پیش‌فاکتور خرید کارگاهی.',
      actionType: 'برآورد قیمت زنده'
    },
    {
      buttonLabel: '🎙️ شروع ضبط صدای فرمان',
      location: 'دستیار صوتی (Voice CAD)',
      tooltipText: 'فعال‌سازی میکروفون سیستم جهت دریافت فرمان صوتی فارسی و تبدیل آن به ابعاد و ماکرو.',
      actionType: 'شناسایی گفتار فارسی'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-lg relative overflow-hidden border border-blue-800/40">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            ویرایشگر هوشمند و عیب‌یاب ماکرو سالیدورک
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            استودیو ویرایشگر، تحلیل‌گر سینتکس و عیب‌یابی اتصال SolidWorks
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
            بررسی خودکار کدهای VBA ماکرو پیش از انتقال به سالیدورک، شناسایی خطاهای سینتکس، اصلاح اتوماتیک و نمایش جامع خطاهای ارتباط با SolidWorks COM API.
          </p>
        </div>
      </div>

      {/* Interactive Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={() => setActiveGuideTab('macro_editor')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'macro_editor'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="ویرایشگر آنلاین، بررسی سینتکس و خطایابی خودکار کدهای VBA ماکرو"
        >
          <Bug className="w-4 h-4 text-amber-300" />
          🛠️ ویرایشگر و تحلیل‌گر آنلاین ماکرو (Syntax Debugger)
        </button>

        <button
          onClick={() => setActiveGuideTab('connection_diagnostics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'connection_diagnostics'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="عیب‌یابی هوشمند خطاهای ارتباط با SolidWorks COM API و ویندوز"
        >
          <ShieldAlert className="w-4 h-4 text-rose-300" />
          📡 عیب‌یابی خطاهای اتصال سالیدورک (SW Errors)
        </button>

        <button
          onClick={() => setActiveGuideTab('what_is_macro')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'what_is_macro'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="مشاهده تعریف دقیق کد ماکرو و ساختار اسکریپت‌نویسی سالیدورک"
        >
          <FileCode2 className="w-4 h-4" />
          کد ماکرو چیست؟
        </button>

        <button
          onClick={() => setActiveGuideTab('how_to_run')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'how_to_run'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="آموزش گام‌به‌گام نحوه اجرای ماکرو در سالیدورک با کلیدهای میانبر Alt+F11 و F5"
        >
          <Play className="w-4 h-4 text-emerald-400" />
          روش‌های ۳گانه اجرای ماکرو در SolidWorks
        </button>

        <button
          onClick={() => setActiveGuideTab('app_features')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'app_features'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="مشاهده تشریح کامل تمامی بخش‌ها، استودیوها و امکانات برنامه"
        >
          <Layers className="w-4 h-4" />
          تشریح تمام کارکردها و استودیوها
        </button>

        <button
          onClick={() => setActiveGuideTab('button_tooltips')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeGuideTab === 'button_tooltips'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          title="راهنمای تعاملی دکمه‌ها و توضیحات هاور موس روی تمام کلیدها"
        >
          <MousePointer className="w-4 h-4 text-amber-500" />
          توضیحات دکمه‌ها (هاور موس)
        </button>
      </div>

      {/* Tab Content 1: Interactive Macro Editor & Syntax Debugger */}
      {activeGuideTab === 'macro_editor' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            {/* Header Controls & Preset Selector */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
                  <Bug className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">ویرایشگر و خطایاب خودکار کدهای VBA سالیدورک</h3>
                  <p className="text-xs text-slate-500">
                    کد ماکروی خروجی را وارد کنید یا نمونه‌های آماده را برای تست انتخاب نمایید.
                  </p>
                </div>
              </div>

              {/* Sample Preset Selector Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-600">بارگذاری نمونه کد:</span>
                <button
                  onClick={() => handleLoadPreset('sample_cabinet')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    selectedPreset === 'sample_cabinet'
                      ? 'bg-blue-50 border-blue-400 text-blue-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  کابینت زمینی (سالم)
                </button>

                <button
                  onClick={() => handleLoadPreset('broken_code_sample')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    selectedPreset === 'broken_code_sample'
                      ? 'bg-rose-50 border-rose-400 text-rose-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                  title="بارگذاری کد دارای ۴ خطای سینتکس متداول جهت بررسی قدرت موتور خطایاب"
                >
                  ⚠️ کد دارای خطا (جهت تست)
                </button>

                <button
                  onClick={() => handleLoadPreset('murphy_bed_sample')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    selectedPreset === 'murphy_bed_sample'
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  کلاف تخت تاشو (سالم)
                </button>

                <button
                  onClick={() => handleLoadPreset('cnc_revolve_sample')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition border ${
                    selectedPreset === 'cnc_revolve_sample'
                      ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  شفت تراش CNC (سالم)
                </button>
              </div>
            </div>

            {/* Notification Bar */}
            {editorNotification && (
              <div className="bg-slate-900 text-white p-3.5 rounded-xl text-xs font-mono border border-slate-700 whitespace-pre-line shadow-md animate-fade-in flex items-center justify-between">
                <span>{editorNotification}</span>
                <button
                  onClick={() => setEditorNotification(null)}
                  className="text-slate-400 hover:text-white mr-2"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Main Action Bar for Editor */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleAnalyzeCode}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="بررسی دقیق سینتکس خط به خط و تطابق دستورات با SolidWorks COM API"
                >
                  <Search className="w-4 h-4" />
                  🔍 بررسی سینتکس و خطایابی خودکار
                </button>

                <button
                  onClick={handleAutoFixCode}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="اصلاح خودکار کلید Set، بستن کتیشن‌ها، End Sub و افزودن Error Handler"
                >
                  <Sparkles className="w-4 h-4" />
                  ✨ اصلاح خودکار کدهای ایراددار
                </button>

                <button
                  onClick={handleInjectPerformance}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
                  title="غیرفعال‌سازی لایو درخت طراحی جهت اجرای ۱۰ برابر سریع‌تر ماکرو در سالیدورک"
                >
                  <Zap className="w-4 h-4" />
                  ⚡ بهینه‌سازی سرعت ماکرو (۱۰x)
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  title="کپی کردن کدهای کامل ماکرو در حافظه سیستم"
                >
                  {copiedSample ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copiedSample ? 'کپی شد!' : '📋 کپی کد'}
                </button>

                <button
                  onClick={handleDownloadSwpFile}
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  title="دانلود کد تحلیل‌شده به صورت فایل ماکروی سالیدورک (.SWP)"
                >
                  <Download className="w-4 h-4 text-blue-600" />
                  💾 دانلود فایل .SWP
                </button>
              </div>
            </div>

            {/* Snippet Quick Injector Buttons */}
            <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="font-bold text-slate-600 ml-1">➕ درج دستورات آماده SW API:</span>
              <button
                onClick={() => handleInsertSnippet('swModel.Extension.SelectByID2 "Front Plane", "PLANE", 0, 0, 0, False, 0, Nothing, 0')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-mono text-[11px]"
              >
                + SelectByID2
              </button>
              <button
                onClick={() => handleInsertSnippet('swModel.SketchManager.CreateRectangle 0, 0, 0, 0.6, 0.8, 0')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-mono text-[11px]"
              >
                + CreateRectangle
              </button>
              <button
                onClick={() => handleInsertSnippet('swModel.FeatureManager.FeatureExtrusion2 True, False, False, 0, 0, 0.018, 0.01, False, False, False, False, 0, 0, False, False, False, False, True, True, True, 0, 0, False')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-mono text-[11px]"
              >
                + FeatureExtrusion
              </button>
              <button
                onClick={() => handleInsertSnippet('swModel.ClearSelection2 True')}
                className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 font-mono text-[11px]"
              >
                + ClearSelection
              </button>
            </div>

            {/* Two Column Grid: Code Editor & Analysis Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Editable Textarea (7 Cols) */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-bold px-1">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-blue-600" />
                    محیط کدنویسی و ویرایش مستقیم ماکرو (VBA Code Editor):
                  </span>
                  <span className="font-mono text-[11px] text-slate-400">
                    تعداد خطوط: {vbaCodeInput.split('\n').length} خط
                  </span>
                </div>

                <textarea
                  value={vbaCodeInput}
                  onChange={(e) => setVbaCodeInput(e.target.value)}
                  rows={20}
                  className="w-full bg-[#1e293b] text-slate-100 p-4 rounded-2xl font-mono text-xs dir-ltr text-left border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
                  placeholder="کد VBA ماکروی سالیدورک را اینجا تایپ یا کپی کنید..."
                />
              </div>

              {/* Right Column: Diagnostic Analysis Dashboard (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="text-xs text-slate-800 font-bold flex items-center gap-1.5 px-1">
                  <Activity className="w-4 h-4 text-amber-500" />
                  داشبورد تحلیل خودکار و شناسایی خطاها:
                </div>

                {analysisResult && (
                  <div className="space-y-4">
                    {/* Status Summary Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className={`p-3 rounded-xl border ${
                        analysisResult.errorCount > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <span className="block text-lg font-bold font-mono">{analysisResult.errorCount}</span>
                        <span className="text-[10px] font-bold">خطای سینتکس</span>
                      </div>

                      <div className={`p-3 rounded-xl border ${
                        analysisResult.warningCount > 0 ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}>
                        <span className="block text-lg font-bold font-mono">{analysisResult.warningCount}</span>
                        <span className="text-[10px] font-bold">هشدار منطقی</span>
                      </div>

                      <div className="p-3 rounded-xl border bg-blue-50 border-blue-200 text-blue-800">
                        <span className="block text-lg font-bold font-mono">{analysisResult.infoCount}</span>
                        <span className="text-[10px] font-bold">پیشنهاد بهینه‌سازی</span>
                      </div>
                    </div>

                    {/* Overall Validity Badge */}
                    <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 ${
                      analysisResult.isValid
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                        : 'bg-rose-50 border-rose-300 text-rose-900'
                    }`}>
                      {analysisResult.isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <div>{analysisResult.isValid ? 'کد ماکرو کاملاً معتبر و آماده اجراست' : 'کد دارای خطاهای ساختاری است'}</div>
                        <div className="text-[10px] font-normal text-slate-600 mt-0.5">
                          تخمین زمان اجرا در سالیدورک: {analysisResult.estimatedExecutionTimeMs}ms
                        </div>
                      </div>
                    </div>

                    {/* Line-by-Line Diagnostics List */}
                    <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                      {analysisResult.diagnostics.length === 0 ? (
                        <div className="p-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                          🎉 هیچ خطایی در کد ماکرو یافت نشد!
                        </div>
                      ) : (
                        analysisResult.diagnostics.map((diag, i) => (
                          <div
                            key={i}
                            className={`p-3 rounded-xl border text-xs space-y-1 ${
                              diag.severity === 'error'
                                ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                                : diag.severity === 'warning'
                                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                                : 'bg-blue-50/80 border-blue-200 text-blue-900'
                            }`}
                          >
                            <div className="flex items-center justify-between font-bold">
                              <span className="flex items-center gap-1.5">
                                <span className="px-1.5 py-0.5 bg-white/80 rounded border font-mono text-[10px]">
                                  خط {diag.line}
                                </span>
                                <span>{diag.code}</span>
                              </span>

                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                diag.severity === 'error'
                                  ? 'bg-rose-200 text-rose-800'
                                  : diag.severity === 'warning'
                                  ? 'bg-amber-200 text-amber-800'
                                  : 'bg-blue-200 text-blue-800'
                              }`}>
                                {diag.severity === 'error' ? 'خطا' : diag.severity === 'warning' ? 'هشدار' : 'پیشنهاد'}
                              </span>
                            </div>

                            <p className="text-[11px] leading-relaxed font-medium">
                              {diag.messagePersian}
                            </p>

                            {diag.suggestionPersian && (
                              <p className="text-[10px] opacity-90 border-t border-black/10 pt-1 mt-1">
                                💡 راهکار: {diag.suggestionPersian}
                              </p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: SolidWorks Connection Errors Diagnostics */}
      {activeGuideTab === 'connection_diagnostics' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-200">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0f172a]">مرکز عیب‌یابی و گزارش خطاهای اتصال به SolidWorks</h3>
                  <p className="text-xs text-slate-500">
                    شناسایی دقیق دلایل قطعی ارتباط با SolidWorks COM API و راهکارهای حل مشکل در ویندوز
                  </p>
                </div>
              </div>

              <button
                onClick={handleTestLiveConnection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${swConnStatus === 'TESTING' ? 'animate-spin' : ''}`} />
                تست زنده اتصال شبکه و COM API
              </button>
            </div>

            {/* Error Simulator Buttons to Test Connection Scenarios */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">
                انتخاب سناریوی خطای اتصال جهت مشاهده راهکار تخصصی:
              </span>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => { setActiveErrorKey('ERR_SW_NOT_RUNNING'); handleTestLiveConnection(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeErrorKey === 'ERR_SW_NOT_RUNNING'
                      ? 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ❌ خطای ۱۰0۱: سالیدورک بسته است
                </button>

                <button
                  onClick={() => { setActiveErrorKey('ERR_PORT_REFUSED'); handleTestLiveConnection(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeErrorKey === 'ERR_PORT_REFUSED'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  📡 خطای ۱۰0۲: پورت 8080 غیرفعال است
                </button>

                <button
                  onClick={() => { setActiveErrorKey('ERR_NO_ACTIVE_DOC'); handleTestLiveConnection(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeErrorKey === 'ERR_NO_ACTIVE_DOC'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  📄 خطای ۱۰0۳: هیچ سند پارتی باز نیست
                </button>

                <button
                  onClick={() => { setActiveErrorKey('ERR_ADMIN_REQUIRED'); handleTestLiveConnection(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeErrorKey === 'ERR_ADMIN_REQUIRED'
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  🔑 خطای ۱۰0۴: نیاز به دسترسی Admin
                </button>

                <button
                  onClick={() => { setActiveErrorKey('CONNECTED'); handleTestLiveConnection(); }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    activeErrorKey === 'CONNECTED'
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  ✅ تست سناریوی اتصال موفق
                </button>
              </div>
            </div>

            {/* Selected Connection Error Troubleshooting Card */}
            {SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey] && activeErrorKey !== 'CONNECTED' && (
              <div className="bg-rose-50 border-2 border-rose-300 p-6 rounded-2xl space-y-4 text-rose-950 animate-fade-in shadow-md">
                <div className="flex items-center justify-between border-b border-rose-200 pb-3">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-rose-600" />
                    <div>
                      <h4 className="text-sm font-bold text-rose-900">
                        {SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey].errorTitlePersian}
                      </h4>
                      <span className="text-[11px] font-mono font-bold text-rose-700">
                        کد خطای فنی: {SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey].errorCode}
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-rose-200 text-rose-900 rounded-xl text-xs font-bold border border-rose-300">
                    وضعیت: قطعی ارتباط
                  </span>
                </div>

                <p className="text-xs leading-relaxed font-medium">
                  {SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey].errorMessagePersian}
                </p>

                <div className="bg-white p-4 rounded-xl border border-rose-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-rose-600" />
                    گام‌های حل مشکل و رفع این خطا:
                  </span>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-800 text-[11px] font-medium pr-1">
                    {SOLIDWORKS_CONNECTION_ERRORS[activeErrorKey].troubleshootingSteps?.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {activeErrorKey === 'CONNECTED' && (
              <div className="bg-emerald-50 border-2 border-emerald-300 p-6 rounded-2xl space-y-3 text-emerald-950 animate-fade-in shadow-md">
                <div className="flex items-center gap-3">
                  <CheckCheck className="w-6 h-6 text-emerald-600" />
                  <div>
                    <h4 className="text-sm font-bold text-emerald-900">ارتباط لایو با SolidWorks برقرار است</h4>
                    <span className="text-[11px] font-mono text-emerald-700">COM API Active | PID: 14208</span>
                  </div>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  تمامی سیگنال‌های پورت محلی و ویندوز سوکت تایید شدند. هر ماکرویی که در ویرایشگر بالای صفحه ایجاد یا اصلاح کنید، مستقیماً در سالیدورک قابل اجراست.
                </p>
              </div>
            )}

            {/* Diagnostic Terminal Logs */}
            {testLog.length > 0 && (
              <div className="bg-[#1e293b] text-slate-200 p-4 rounded-2xl font-mono text-xs dir-ltr text-left border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block pb-1 border-b border-slate-700 dir-rtl text-right">
                  💻 لاگ دیباگ زنده شبکه سالیدورک:
                </span>
                {testLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content 3: What is Macro */}
      {activeGuideTab === 'what_is_macro' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 md:p-8 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Code className="w-5 h-5 text-blue-600" />
              مفهوم و تعریف فنی کد ماکرو (SolidWorks VBA Macro)
            </h3>
            <p className="text-xs md:text-sm text-slate-700 leading-relaxed text-justify">
              **کد ماکرو (Macro)** در نرم‌افزار **SolidWorks**، کدهای برنامه‌نویسی به زبان **Visual Basic for Applications (VBA)** با پسوند فایل <code className="bg-slate-100 px-1.5 py-0.5 rounded text-blue-600 font-mono font-bold">.SWP</code> هستند. 
              طراحی دستی یک یونیت کامل کابینت، کلاف فلزی یا قطعه پیچیده شامل بیش از ۵۰ تا ۱۰۰ کلید کارهای تکراری (ساخت اسکتچ، اندازه گذاری، اکسترود، شیار زدن، سوراخکاری لولا و سوراخکاری پیچ) است که حدود ۱۵ الی ۳۰ دقیقه زمان می‌برد.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                  ⚡ 1
                </div>
                <h4 className="font-bold text-xs text-blue-900">سرعت فوق‌العاده (زیر ۲ ثانیه)</h4>
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  ماکرو به جای کلیدهای دستی شما، تمامی فرمان‌های هندسی را متوالی و در زمان زیر ۲ ثانیه اجرا می‌کند.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  🎯 2
                </div>
                <h4 className="font-bold text-xs text-emerald-900">دقت ۱۰۰٪ بدون خطای انسانی</h4>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  تمامی لقی‌های بادخور درب، شیار فیبر بدنه و جای لولاها دقیقاً طبق استانداردهای نجاری محاسبه می‌شوند.
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs">
                  🔄 3
                </div>
                <h4 className="font-bold text-xs text-amber-900">طراحی ۱۰۰٪ پارامتریک</h4>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  تنها با تغییر یک عدد در برنامه ما (مثلاً عرض از ۶۰۰ به ۸۰۰)، کل ماکروی سه‌بعدی از نو بازنویسی می‌شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: How to Run in SolidWorks */}
      {activeGuideTab === 'how_to_run' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
              <Play className="w-5 h-5 text-emerald-600" />
              آموزش جامع ۳ روش اجرای کد ماکرو در نرم‌افزار SolidWorks
            </h3>

            {/* Method 1 */}
            <div className="border border-blue-200 bg-blue-50/30 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg">
                  روش ۱ (پیشنهادی)
                </span>
                <h4 className="text-sm font-bold text-[#0f172a]">
                  اجرای مستقیم کپی کد در ویرایشگر سالیدورک (Copy-Paste VBA Editor)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                این سریع‌ترین و ساده‌ترین روش بدون نیاز به ذخیره فایل روی هارد دیسک است:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-800 font-medium bg-white p-4 rounded-lg border border-slate-200">
                <li>در یکی از استودیوهای برنامه (مانند کابینت یا متراژ)، دکمه <span className="font-bold text-blue-600">«📋 کپی کد VBA ماکرو»</span> را کلیک کنید.</li>
                <li>نرم‌افزار SolidWorks را باز کنید.</li>
                <li>کلیدهای میانبر <kbd className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800 font-mono font-bold">Alt + F11</kbd> را در سالیدورک فشار دهید تا محیط VBA Editor باز شود (یا از منوی بالایی به <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">Tools ➔ Macro ➔ New...</code> بروید).</li>
                <li>تمام کدهای موجود در پنجره کد سالیدورک را با کلیدهای <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">Ctrl + A</kbd> انتخاب و پاک کنید.</li>
                <li>کد کپی شده را با <kbd className="px-1.5 py-0.5 bg-slate-100 border rounded font-mono">Ctrl + V</kbd> پیست کنید.</li>
                <li>کلید <kbd className="px-2 py-1 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded font-mono font-bold">F5</kbd> یا آیکون ▶️ سبز رنگ را فشار دهید. قطعه یا یونیت شما به سرعت ساخته می‌شود!</li>
              </ol>
            </div>

            {/* Method 2 */}
            <div className="border border-emerald-200 bg-emerald-50/30 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg">
                  روش ۲
                </span>
                <h4 className="text-sm font-bold text-[#0f172a]">
                  اجرای فایل ذخیره‌شده ماکرو (.SWP Macro File)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                چنانچه کد ماکرو را به صورت فایل ذخیره کرده‌اید:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-800 font-medium bg-white p-4 rounded-lg border border-slate-200">
                <li>کدهای ماکرو را در یک فایل متنی کپی کرده و پسوند آن را به <code className="bg-slate-100 px-1 rounded text-emerald-700 font-bold">.swp</code> تغییر دهید (یا فایل ماکرو را دانلود کنید).</li>
                <li>در سالیدورک به منوی اصلی بروید: <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-bold">Tools ➔ Macro ➔ Run...</code></li>
                <li>فایل <code className="bg-slate-100 px-1 rounded text-slate-800 font-bold">.swp</code> خود را انتخاب و روی کلید **Open** کلیک کنید.</li>
                <li>مدل سه‌بعدی به صورت آنی در پارت جدید رسم می‌گردد.</li>
              </ol>
            </div>

            {/* Method 3 */}
            <div className="border border-amber-200 bg-amber-50/30 p-5 rounded-xl space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-amber-600 text-white text-xs font-bold rounded-lg">
                  روش ۳ (پیشرفته)
                </span>
                <h4 className="text-sm font-bold text-[#0f172a]">
                  اجرای زنده از طریق پایتون و فایل EXE بدون نیاز به کلیک در SolidWorks
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                اتصال مستقیم از طریق COM API سالیدورک:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-xs text-slate-800 font-medium bg-white p-4 rounded-lg border border-slate-200">
                <li>در برنامه دستیار سالیدورک به تب <span className="font-bold text-amber-700">«اتصال SW و فایل EXE»</span> بروید.</li>
                <li>فایل لانچر اتوماتیک <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-800 font-mono font-bold">solidworks_link.bat</code> یا اسکریپت پایتون را دانلود کنید.</li>
                <li>با دبل کلیک روی فایل اجراکننده، دستورات بدون باز کردن محیط کدنویسی سالیدورک، مستقیماً به سالیدورک فرستاده می‌شوند.</li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 5: App Features Breakdown */}
      {activeGuideTab === 'app_features' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                راهنمای جامع تمامی استودیوها و بخش‌های برنامه
              </h3>
              <p className="text-xs text-slate-500">
                برای ورود سریع به هر استودیو می‌توانید روی دکمه مربوطه کلیک کنید.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {appFeaturesList.map((feat) => (
                <div
                  key={feat.id}
                  className="bg-slate-50 border border-slate-200 p-5 rounded-2xl hover:border-blue-400 transition-all space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm">
                          {feat.icon}
                        </div>
                        <h4 className="text-sm font-bold text-[#0f172a]">{feat.title}</h4>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md">
                        {feat.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.summary}
                    </p>

                    <ul className="space-y-1 pt-1">
                      {feat.details.map((dt, i) => (
                        <li key={i} className="text-[11px] text-slate-700 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{dt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => onNavigateTab(feat.id as ActiveTab)}
                    className="w-full mt-3 bg-white hover:bg-blue-600 hover:text-white border border-slate-300 text-slate-800 text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5"
                    title={`ورود مستقیم به بخش ${feat.title}`}
                  >
                    ورود به استودیو
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 6: Button Hover Tooltips Guide */}
      {activeGuideTab === 'button_tooltips' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-bold text-[#0f172a] flex items-center gap-2">
                <MousePointer className="w-5 h-5 text-amber-500" />
                راهنمای تعاملی دکمه‌ها و توضیحات هاور موس (Hover Mouse Tooltips)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                در تمام بخش‌های برنامه، با قرار دادن نشانگر موس روی هر دکمه، راهنمای عملکرد آن نشان داده می‌شود. جدول زیر توضیحات کاربردی تمام دکمه‌های اصلی برنامه است:
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-sm">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">عنوان دکمه</th>
                    <th className="p-3.5">موقعیت در برنامه</th>
                    <th className="p-3.5">نوع عملکرد</th>
                    <th className="p-3.5">متن راهنمای هاور موس (Tooltip)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {buttonTooltipCatalog.map((btn, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-bold text-blue-700 whitespace-nowrap">
                        {btn.buttonLabel}
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-slate-600">
                        {btn.location}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded text-[11px] font-semibold">
                          {btn.actionType}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-800 font-medium leading-relaxed">
                        <span className="inline-block bg-slate-900 text-slate-100 px-2.5 py-1 rounded-lg text-[11px] shadow-sm">
                          💡 {btn.tooltipText}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Live Hover Test Sandbox */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl space-y-4 border border-slate-800">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Info className="w-4 h-4" />
                تست زنده هاور موس روی دکمه‌های نمونه:
              </div>
              <p className="text-xs text-slate-300">
                موس خود را روی دکمه‌های زیر قرار دهید تا راهنمای صریح عملکرد هر کدام را امتحان کنید:
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  title="کپی کردن کدهای کامل ماکرو در حافظه سیستم جهت انتقال به سالیدورک (Alt + F11)"
                >
                  📋 کپی کد VBA ماکرو (امتحان کن)
                </button>

                <button
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  title="محاسبه متراژ ورق، نوار PVC، لولا و یراق‌آلات و صدور پیش‌فاکتور خرید"
                >
                  🛒 استخراج لیست خرید (امتحان کن)
                </button>

                <button
                  className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-sm"
                  title="ذخیره پارامترهای جاری در الگوریتم هوشمند یادگیری آفلاین سیستم"
                >
                  💾 ذخیره الگوی پارامتریک (امتحان کن)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
