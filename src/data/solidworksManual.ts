import { KnowledgeItem } from '../types';

export const SOLIDWORKS_MANUAL_DATA: KnowledgeItem[] = [
  {
    id: 'sketch_basics',
    title: 'اصول دو بعدی و قیود هندسی (Sketch Relations)',
    category: 'sketch',
    summaryPersian: 'یادگیری کامل رسم اسکچ، تعریف ابعاد هوشمند (Smart Dimension) و اعمال قیود هندسی خودکار جهت مشکی شدن خطوط (Fully Defined).',
    detailedContentPersian: `محیط Sketch پایه و اساس تمام مدلسازی‌ها در سالیدورک است.

اصول کلیدی:
1. هیچ‌گاه مدل را با خطوط آبی (Under Defined) رها نکنید؛ خطوط باید با اندازه و قید مشکی (Fully Defined) شوند.
2. از مبدأ احداث (Origin) برای نقطه شروع اولین اسکچ استفاده کنید.
3. قیود مهم: Horizontal, Vertical, Coincident, Collinear, Concentric, Tangent, Parallel, Perpendicular.
4. ابزار Smart Dimension امکان اندازه‌گذاری هوشمند افقی، عمودی، مایل و زاویه‌ای را به صورت خودکار فراهم می‌کند.`,
    shortcuts: ['Ctrl + 8 (Normal To)', 'S (Shortcut Bar)', 'D (OK/Confirm Corner)', 'Escape (Clear Tool)'],
    steps: [
      'صفحه رسم (Front, Top, Right) را انتخاب کنید.',
      'روی دکمه Sketch کلیک کنید.',
      'اشکال پایه را رسم کرده و قیود هندسی را بررسی کنید.',
      'با Smart Dimension ابعاد را کامل کنید تا رنگ خطوط از آبی به مشکی تغییر کند.'
    ]
  },
  {
    id: 'part_features',
    title: 'دستورات سه بعدی سازی (3D Features: Extrude, Revolve, Sweep, Loft)',
    category: 'part',
    summaryPersian: 'آموزش کامل ابزارهای حجیم‌سازی، دوران، جاروب (Sweep) و ایجاد سطوح بین مقاطع (Loft) همراه با Fillet و Chamfer.',
    detailedContentPersian: `دستورات اصلی مدلسازی در تب Features قرار دارند:

1. Extruded Boss/Base: مستقیم‌ترین روش برای حجم دادن به یک مقطع دوبعدی.
2. Revolved Boss/Base: ایجاد احجام تقارن محوری با دوران حول یک خط مرکز (Centerline) برای قطعات تراشکاری.
3. Swept Boss/Base: حرکت دادن یک مقطع (Profile) در امتداد یک مسیر (Path).
4. Lofted Boss/Base: اتصال چندین مقطع دوبعدی مختلف به یکدیگر.
5. Extruded Cut & Revolved Cut: ایجاد سوراخ‌ها، شیارها و حفره‌های داخلی.
6. Hole Wizard: ایجاد استاندارد سوراخ‌های رزوه، خزینه و قلاویز.`,
    shortcuts: ['Ctrl + B (Rebuild Model)', 'F (Zoom to Fit)', 'Z / Shift+Z (Zoom In/Out)'],
    steps: [
      'ایجاد اسکچ اولیه بر روی یکی از صفحات اصلی.',
      'انتخاب دستور حجیم‌سازی مناسب (مثلاً Extrude یا Revolved Boss).',
      'تعیین شرایط انتهایی (Blind, Through All, Up To Surface, Mid Plane).',
      'تأیید و اعمال گردی‌ها (Fillet) و فازها (Chamfer).'
    ]
  },
  {
    id: 'cabinetry_woodwork',
    title: 'طراحی کابینت و صنعت چوب و MDF در سالیدورک',
    category: 'cabinetry',
    summaryPersian: 'نحوه مدلسازی پارامتریک یونیت‌های کابینت، محاسبات بادخور درب، نوار پی‌وی‌سی، فیبر پشت و خروجی جدول برش (Cut List).',
    detailedContentPersian: `طراحی تخصصی کابینت در سالیدورک به ۲ روش انجام می‌شود:
روش اول: Multi-Body Part (روش پیشنهادی و بسیار سریع)
در یک قطعه منفرد، بدنه چپ، بدنه راست، کف، سقف و طاق‌ها را به صورت اجسام مجزا (Uncheck Merge Result) می‌کشید. سپس با Cut List تمام قطعات با ابعاد دقیق برش لیست می‌شوند.

روش دوم: Assembly Modeling
ساخت جداگانه دیواره‌ها، درب‌ها و طبقات و مونتاژ آن‌ها با قیود Mate.

نکات فنی کابینت‌سازی ایران:
- ضخامت استاندارد بدنه: 16mm یا 18mm MDF
- بادخور درب‌ها: 3mm در عرض و ارتفاع برای سهولت بازوبست و نوار PVC.
- شیار فیبر پشت: شیار 4mm به عمق 8mm در فاصله 15mm از پشت بدنه.
- پاخور (Toe Kick): ارتفاع 100mm تا 120mm برای کابینت‌های زمینی.`,
    shortcuts: ['Ctrl + Tab (Switch Window)', 'Alt + Drag (Smart Mates)'],
    steps: [
      'رسم مقطع باکس اصلی کابینت.',
      'اکسترود دیواره‌ها بدون فعال بودن Merge Result.',
      'ایجاد شیار فیبر پشت با Extruded Cut.',
      'جانمایی طبقات و درب‌ها با بادخور مناسب.',
      'استخراج جدول Cut List جهت فرستادن به دستگاه برش یا نرم‌افزار Corte Certo / CutMaster.'
    ]
  },
  {
    id: 'cnc_lathe_turning',
    title: 'طراحی قطعات تراشکاری CNC و آماده‌سازی ماشین‌کاری',
    category: 'cnc',
    summaryPersian: 'نحوه مدلسازی شفت‌های پله‌ای، رزوه زنی، فاز ورودی و خروجی G-Code برای دستگاه تراش CNC.',
    detailedContentPersian: `طراحی قطعات ده‌وار (Rotational Parts) برای تراشکاری CNC:

1. همیشه نیم‌رخ بالای محور تقارن (Upper Half Profile) را ترسیم کنید.
2. از دستور Revolved Boss/Base استفاده کنید.
3. سوراخ مرکز و مرغک را با Hole Wizard یا Revolved Cut ایجاد کنید.
4. ابزار Thread در سالیدورک امکان تولید انواع رزوه‌های متریف (Metric M)، اینچی (BSW) و ذوزنقه‌ای (Acme) را فراهم می‌کند.
5. برای شیارهای جای خوار، اورینگ یا گریس از اکسترود کات محلی استفاده کنید.`,
    shortcuts: ['Ctrl + 1 (Front View)', 'Ctrl + 7 (Isometric View)'],
    steps: [
      'کشیدن خط سنترالاین افقی.',
      'رسم نیم‌رخ شفت پله‌ای.',
      'اندازه‌گذاری شعاعی یا قطری (با کلیک روی سنترالاین، اندازه به صورت قطر ظاهر می‌شود).',
      'اعمال Revolved Boss و ایجاد فازهای 1×45 درجه.'
    ]
  },
  {
    id: 'hardware_fittings',
    title: 'جانمایی و مدلسازی یراق‌آلات (لولا، ریل، مینی‌فیکس، دستگیره)',
    category: 'hardware',
    summaryPersian: 'استاندارد سوراخ‌کاری و جای‌گذاری لولا گازور 35mm، ریل‌های ساچمه‌ای و اتصالات الیت (Minifix).',
    detailedContentPersian: `استانداردهای یراق‌آلات MDF:

1. لولا گازور (Cup Hinge):
   - قطر کاسه سوراخ: 35mm
   - عمق سوراخ روی درب: 11.5mm تا 12mm
   - فاصله مرکز سوراخ تا لبه درب: 22.5mm
   - فاصله پیچ‌های پایه روی بدنه یونیت: 37mm از لبه جلو.

2. ریل‌های کشو (Drawer Slides):
   - بادخور مورد نیاز ریل ساچمه‌ای: 12.7mm در هر سمت (جمعاً 25.4mm تا 26mm از عرض دهانه کم می‌شود).
   - عمق‌های استاندارد: 300, 350, 400, 450, 500, 550 میلی‌متر.

3. اتصالات الیت / مینی‌فیکس (Minifix):
   - سوراخ خرچنگی روی صفحه: قطر 15mm، عمق 12.5mm، فاصله مرکز سوراخ تا لبه 24mm یا 34mm.
   - سوراخ میله در ضخامت نر قطعه: قطر 8mm.`,
    shortcuts: ['Tab (Hide Component in Assembly)', 'Shift + Tab (Show Component)'],
    steps: [
      'ایجاد بلاک یا قطعه یراق‌آلات.',
      'تعیین نقاط مرجع (Mating References) برای جانمایی سریع.',
      'ایجاد سوراخ‌های راهنما روی بدنه یونیت با استفاده از Hole Series یا Smart Fasteners.'
    ]
  },
  {
    id: 'macros_automation',
    title: 'آموزش اتوماسیون، ماکرونویسی و لینک پایتون با API سالیدورک',
    category: 'macros',
    summaryPersian: 'نحوه ساخت ماکرو VBA (.swp)، اتصال پایتون از طریق win32com و اجرای خودکار دستورات.',
    detailedContentPersian: `روش‌های خودکارسازی سالیدورک:

روش 1: ماکروهای داخلی VBA (.swp / .bas)
از منوی Tools > Macro > New یک ماکرو ایجاد کرده و کدهای VBA سالیدورک را در آن قرار دهید.

روش 2: اسکریپت پایتون با COM API (روش فوق‌العاده قوی)
با کتابخانه pywin32 در پایتون می‌توانید به راحتی تمام توابع SldWorks.Application را فراخوانی کنید.

کد نمونه پایتون:
import win32com.client
swApp = win32com.client.Dispatch("SldWorks.Application")
swApp.Visible = True
part = swApp.NewDocument("C:\\ProgramData\\SolidWorks\\SolidWorks 2024\\templates\\Part.prtdot", 0, 0, 0)

روش 3: کنترل موس و کیبورد (PyAutoGUI)
اگر دسترسی COM محدود باشد، اسکریپت‌های PyAutoGUI منوهای سالیدورک را کلیک کرده و ابعاد را تایپ می‌کنند.`,
    shortcuts: ['Alt + F11 (VBA Editor)', 'Tools > Macro > Record'],
    steps: [
      'ضبط ماکروی اولیه با دکمه Record Macro.',
      'ویرایش متغیرها و جایگزینی ابعاد پارامتریک.',
      'ذخیره فایل ماکرو و ساخت دکمه اختصاصی در نوار ابزار سالیدورک.'
    ]
  },
  {
    id: 'troubleshooting_errors',
    title: 'عیب‌یابی و رفع خطاهای رایج سالیدورک (Troubleshooting)',
    category: 'troubleshooting',
    summaryPersian: 'راهنمای حل خطاهای Rebuild Error، Zero Thickness Geometry، Mate Conflicts و بهم ریختگی گرافیک.',
    detailedContentPersian: `خطاهای متداول سالیدورک و راه حل آن‌ها:

1. خطای Zero-Thickness Geometry:
علت: وقتی دو هندسه سه بعدی طوری مماس می‌شوند که در یک خط یا نقطه ضخامت صفر ایجاد می‌شود.
راه‌حل: چک باکس Merge Result را بردارید یا مقداری بسیار کوچک (مثلاً 0.01mm) تداخل ایجاد کنید.

2. خطای Over-Defined Sketch (قرمز یا زرد شدن اسکچ):
علت: وجود قیود یا ابعاد متضاد با یکدیگر.
راه‌حل: ابزار Display/Delete Relations را بزنید و روی Diagnose کلیک کنید یا ابعاد اضافی را خاموش (Driven) کنید.

3. خطای Mate Conflicts (قرمزی در مونتاژ):
علت: تداخل بین قیود مونتاژ.
راه‌حل: از ابزار Mate Controller استفاده کنید یا قیدهای ناسازگار را Suppress کنید.

4. مشکل کندی و هنگ کردن مدل‌های سنگین:
راه‌حل: فعال کردن Large Assembly Mode، کاهش میزان Detail در تصویر، و استفاده از SpeedPak.`,
    shortcuts: ['Ctrl + Q (Forced Rebuild)', 'Ctrl + R (Redraw Screen)'],
    steps: [
      'بررسی آیکون علامت تعجب زرد یا علامت ضربدر قرمز در درخت طراحی (FeatureManager).',
      'راست کلیک روی فپچر خطا دار و انتخاب What\'s Wrong?.',
      'اصلاح اسکچ یا مرجع ویرایش شده.'
    ]
  }
];
