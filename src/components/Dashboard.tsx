import React from 'react';
import { ActiveTab } from '../types';
import { 
  Box, 
  Wrench, 
  Cog, 
  FolderKanban, 
  BookOpen, 
  Bot, 
  Code, 
  CheckCircle, 
  ArrowLeft,
  Sparkles,
  Zap,
  Layers,
  FileCode2,
  Terminal,
  Home,
  ShoppingCart,
  Scissors,
  Flame,
  Compass
} from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: ActiveTab) => void;
  isSwConnected: boolean;
  onConnectSw: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  setActiveTab,
  isSwConnected,
  onConnectSw,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            دستیار هوشمند تمام‌عیار سالیدورک (Professional Polish Edition)
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold text-[#0f172a] leading-tight">
            از طراحی پارامتریک کابینت و یراق تا تراشکاری CNC؛
            <br />
            <span className="text-blue-600">
              مدلسازی خودکار و اتصال مستقیم به SolidWorks
            </span>
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed">
            این برنامه یک سیستم مهندسی پیشرفته برای سالیدورک است. ابعاد و مشخصات را وارد کنید؛ پیش‌نمایش سه بعدی زنده را مشاهده نمائید، جدول برش MDF و نقشه قطعات را استخراج کنید و با یک کلیک کدهای ماکرو را مستقیم در سالیدورک اجرا کنید.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('wizard')}
              className="px-6 py-2.5 bg-[#1e293b] hover:bg-black text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
            >
              <FolderKanban className="w-4 h-4 text-blue-400" />
              شروع طراح تعاملی گام‌به‌گام
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onConnectSw}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                isSwConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              <Zap className="w-4 h-4 text-amber-500" />
              {isSwConnected ? 'ارتباط برقرار است ✅' : 'تست ارتباط با SolidWorks API'}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Feature Launchers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0f172a] flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            بخش‌های اصلی طراحی پارامتریک و خودکارسازی
          </h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">دقت: میلیمتر</span>
            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">واحد: متریک</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Inspiration Gallery */}
          <div
            onClick={() => setActiveTab('inspiration_gallery')}
            className="group cursor-pointer bg-gradient-to-br from-indigo-900 to-slate-900 border border-indigo-700/60 hover:border-indigo-500 p-6 rounded-2xl transition-all shadow-md hover:shadow-xl space-y-3 text-white col-span-1 md:col-span-2 lg:col-span-1"
          >
            <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-amber-400 flex items-center justify-center border border-indigo-400/30 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
              <span>گالری الهام (Pinterest)</span>
              <span className="text-[10px] bg-amber-400 text-slate-900 font-extrabold px-1.5 py-0.5 rounded">ترند ۲۰۲۶</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              مشاهده مدل‌های جدید کابینت، ژاپاندی، اسلیم شیکر و چیدمان پینترست و ورود مستقیم به استودیو.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-amber-400 gap-1 group-hover:translate-x-[-4px] transition-transform">
              ورود به گالری و انتخاب سبک
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Room Planner Studio */}
          <div
            onClick={() => setActiveTab('room_planner')}
            className="group cursor-pointer bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 group-hover:scale-105 transition-transform">
              <Home className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0f172a] group-hover:text-blue-700 transition-colors">
              طراحی هوشمند متراژ
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              طراحی اتوماتیک چیدمان کامل آشپزخانه و اتاق خواب بر اساس ابعاد، زوایا و جای تأسیسات.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-blue-600 gap-1 group-hover:translate-x-[-4px] transition-transform">
              ورود به استودیو متراژ
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Cabinet Studio */}
          <div
            onClick={() => setActiveTab('cabinet')}
            className="group cursor-pointer bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200 group-hover:scale-105 transition-transform">
              <Box className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0f172a] group-hover:text-blue-700 transition-colors">
              طراحی هوشمند کابینت MDF
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              طراحی یونیت‌های زمینی و دیواری، محاسبه بادخور درب، جدول برش قطعات، نوار PVC و ماکرو.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-amber-600 gap-1 group-hover:translate-x-[-4px] transition-transform">
              ورود به استودیو کابینت
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Hardware & Fittings Studio */}
          <div
            onClick={() => setActiveTab('hardware')}
            className="group cursor-pointer bg-white hover:bg-blue-50/40 border border-slate-200 hover:border-blue-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-200 group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0f172a] group-hover:text-blue-700 transition-colors">
              طراحی یراق‌آلات و اتصالات
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              مدلسازی انواع لولا گازور 35mm، ریل ساچمه‌ای، اتصالات الیت / مینی‌فیکس و دستگیره.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-teal-600 gap-1 group-hover:translate-x-[-4px] transition-transform">
              ورود به استودیو یراق
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Procurement Shopping List */}
          <div
            onClick={() => setActiveTab('procurement')}
            className="group cursor-pointer bg-white hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-500 p-6 rounded-2xl transition-all shadow-sm hover:shadow-md space-y-3"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 group-hover:scale-105 transition-transform">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-[#0f172a] group-hover:text-emerald-700 transition-colors">
              لیست اقلام خرید و قیمت
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              استخراج متراژ نوار PVC، تعداد ورق MDF، لولا، ریل، پروفیل قوطی و برآورد بودجه خرید.
            </p>
            <div className="pt-2 flex items-center text-xs font-bold text-emerald-600 gap-1 group-hover:translate-x-[-4px] transition-transform">
              مشاهده لیست خرید
              <ArrowLeft className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

        {/* Secondary Tools & Assistant Shortcuts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Nesting Optimizer */}
          <div
            onClick={() => setActiveTab('nesting')}
            className="cursor-pointer bg-white hover:bg-amber-50/40 border border-slate-200 hover:border-amber-400 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">چیدمان برش MDF</h5>
              <p className="text-[10px] text-slate-500">پورتال Nesting و کمترین ضایعات</p>
            </div>
          </div>

          {/* Laser CNC & Sheet Metal */}
          <div
            onClick={() => setActiveTab('laser_cnc')}
            className="cursor-pointer bg-white hover:bg-cyan-50/40 border border-slate-200 hover:border-cyan-400 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl border border-cyan-200">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">ورقکاری و لیزر CNC</h5>
              <p className="text-[10px] text-slate-500">طراحی یراق، پایه و SheetMetal</p>
            </div>
          </div>

          {/* Standard Parts */}
          <div
            onClick={() => setActiveTab('standard_parts')}
            className="cursor-pointer bg-white hover:bg-blue-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">قطعات استاندارد</h5>
              <p className="text-[10px] text-slate-500">پیچ، اتصالات DIN و پروفیل</p>
            </div>
          </div>

          {/* Voice CAD */}
          <div
            onClick={() => setActiveTab('voice_cad')}
            className="cursor-pointer bg-white hover:bg-purple-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl border border-purple-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">دستیار صوتی فارسی</h5>
              <p className="text-[10px] text-slate-500">کنترل سالیدورک با صدا</p>
            </div>
          </div>

          {/* Step-by-Step Wizard */}
          <div
            onClick={() => setActiveTab('wizard')}
            className="cursor-pointer bg-white hover:bg-blue-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-200">
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">طراح گام‌به‌گام</h5>
              <p className="text-[10px] text-slate-500">طراحی پرسش و پاسخ</p>
            </div>
          </div>

          {/* Murphy Bed Studio */}
          <div
            onClick={() => setActiveTab('murphy_bed')}
            className="cursor-pointer bg-white hover:bg-indigo-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
          >
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-200">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">تخت تاشو و کلاف فلزی</h5>
              <p className="text-[10px] text-slate-500">طراحی کلاف، جک و کمد</p>
            </div>
          </div>

          {/* Offline Manual */}
          <div
            onClick={() => setActiveTab('manual')}
            className="cursor-pointer bg-white hover:bg-blue-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            title="آموزش دستورات، کلیدهای میانبر و عیب‌یابی خطاهای سالیدورک"
          >
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl border border-teal-200">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">دانشنامه آفلاین</h5>
              <p className="text-[10px] text-slate-500">دستورات و کلیدهای میانبر</p>
            </div>
          </div>

          {/* Macro Guide */}
          <div
            onClick={() => setActiveTab('macro_guide')}
            className="cursor-pointer bg-white hover:bg-emerald-50/30 border border-slate-200 p-4 rounded-2xl flex items-center gap-3 transition-all shadow-sm hover:shadow-md"
            title="کد ماکرو چیست و چگونه در سالیدورک اجرا می‌شود؟ راهنمای کامل"
          >
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-xs font-bold text-[#0f172a]">راهنمای جامع ماکرو</h5>
              <p className="text-[10px] text-slate-500">آموزش اجرا و کارکردها</p>
            </div>
          </div>
        </div>

      {/* Key Capabilities Bulletins */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h4 className="text-sm font-bold text-[#0f172a] flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-blue-600" />
          ویژگی‌های کلیدی دستیار سالیدورک
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-blue-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
              تولید مستقیم ماکرو (.SWP)
            </div>
            <p className="text-slate-600">تولید کدهای VBA آماده برای اجرای مستقیم در محیط سالیدورک.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-emerald-700 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-emerald-600" />
              اتصال پایتون با COM API
            </div>
            <p className="text-slate-600">اجرای اسکریپت‌های win32com بدون نیاز به مداخله دستی.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-amber-700 flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5 text-amber-600" />
              کنترل خودکار موس و کیبورد
            </div>
            <p className="text-slate-600">اسکریپت‌های PyAutoGUI برای زمانی که دسترسی API محدود باشد.</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-purple-700 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-purple-600" />
              تولید فایل EXE دسکتاپ
            </div>
            <p className="text-slate-600">امکان بسته‌بندی کل برنامه به صورت فایل نصبی برای ویندوز.</p>
          </div>
        </div>
      </div>

      {/* Control Bar Footer as matched in Professional Polish Theme */}
      <div className="flex flex-wrap gap-4 bg-blue-50 p-5 rounded-2xl border border-blue-100 items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-full text-white font-bold shrink-0">
            ⚡
          </div>
          <div>
            <div className="font-bold text-blue-950 text-sm">عملیات خودکار: هدایت مستقیم و اجرای ماکرو</div>
            <div className="text-xs text-blue-700">پس از انتخاب کلیک، برنامه کدهای تولید شده را آماده کرده و در محیط SolidWorks اجرا می‌کند.</div>
          </div>
        </div>
        <button
          onClick={onConnectSw}
          className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all shrink-0"
        >
          شروع طراحی در سالیدورک
        </button>
      </div>
    </div>
  );
};
