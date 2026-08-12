import React, { useState } from 'react';
import { CabinetParams, WizardStep } from '../types';
import { generateCabinetMacro } from '../utils/macroGenerators';
import { Cabinet3DViewer } from './3d/Cabinet3DViewer';
import { 
  FolderKanban, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Download,
  Box,
  Wrench,
  Cog
} from 'lucide-react';

export const StepByStepWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [wizardData, setWizardData] = useState<CabinetParams>({
    id: 'wizard_custom',
    name: 'کابینت سفارشی دستیار',
    width: 600,
    height: 800,
    depth: 550,
    materialThickness: 16,
    backPanelThickness: 3,
    toeKickHeight: 100,
    doorCount: 1,
    shelfCount: 1,
    doorType: 'full_overlay',
    hingeBrand: 'Blum',
    hasDrawers: false,
    drawerCount: 0,
    finishColor: '#D2B48C',
    edgeBandingThickness: 1,
  });

  const steps: WizardStep[] = [
    {
      id: 1,
      title: 'انتخاب نوع سازه',
      question: 'چه نوع پروژه یا یونیت کابینتی می‌خواهید طراحی کنید؟',
      description: 'دستیار بر اساس انتخاب شما ابعاد استاندارد کارگاهی را پیشنهاد می‌دهد.',
      field: 'type',
      type: 'select',
      options: [
        { label: 'کابینت زمینی تک درب / دو درب (Base Unit)', value: 'base', subtext: 'استاندارد ارتفاع 90cm با پاخور 10cm' },
        { label: 'کابینت هوایی / دیواری (Wall Unit)', value: 'wall', subtext: 'عمق 35cm بدون پاخور' },
        { label: 'باکس کشو ساچمه‌ای (Drawer Unit)', value: 'drawer', subtext: 'سه کشو با ریل ساچمه‌ای 50cm' },
      ],
      defaultValue: 'base',
      recommendationPersian: 'پیشنهاد کارگاهی: برای کابینت زمینی ارتفاع استاندارد با پاخور 900 میلیمتر و عمق 550 میلیمتر است.'
    },
    {
      id: 2,
      title: 'تعیین عرض یونیت',
      question: 'عرض کلی یونیت (Width) چقدر باشد؟',
      description: 'اندازه دهانه بیرونی کابینت از چپ تا راست به میلیمتر.',
      field: 'width',
      type: 'number',
      options: [
        { label: '400 میلیمتر (کابینت باریک / تک درب)', value: 400 },
        { label: '600 میلیمتر (عرض استاندارد تک درب)', value: 600 },
        { label: '900 میلیمتر (عرض استاندارد دو درب)', value: 900 },
      ],
      defaultValue: 600,
      recommendationPersian: 'نکته: یونیت‌های بالای 700 میلیمتر معمولاً به صورت دو درب طراحی می‌شوند تا درب سنگین نشود.'
    },
    {
      id: 3,
      title: 'تعیین ارتفاع و عمق',
      question: 'ارتفاع کل و عمق باکس چقدر باشد؟',
      description: 'ارتفاع شامل پاخور و عمق شامل ضخامت بدنه است.',
      field: 'height',
      type: 'number',
      defaultValue: 800,
      recommendationPersian: 'عمق استاندارد یونیت زمینی در ایران 550mm و برای یونیت دیواری 350mm است.'
    },
    {
      id: 4,
      title: 'انتخاب ضخامت ورق و فیبر',
      question: 'ضخامت ورق MDF و فیبر پشت را تعیین کنید:',
      description: 'استاندارد ورق‌های ام‌دی‌اف در بازار ایران 16 میلیمتر است.',
      field: 'materialThickness',
      type: 'select',
      options: [
        { label: 'MDF 16mm (استاندارد بازار ایران)', value: 16 },
        { label: 'MDF 18mm (ورق خارجی)', value: 18 },
      ],
      defaultValue: 16,
      recommendationPersian: 'فیبر پشت معمولاً 3 میلیمتر بوده و درون شیار 4mm در فاصله 15mm از پشت قرار می‌گیرد.'
    },
    {
      id: 5,
      title: 'تعداد درب‌ها و طبقات',
      question: 'چه تعداد درب و طبقه متحرک داخل یونیت نیاز دارید؟',
      description: 'بادخور و فاصله سوراخ‌های لولا به صورت خودکار محاسبه خواهد شد.',
      field: 'doorCount',
      type: 'select',
      options: [
        { label: '1 درب با 1 طبقه متحرک', value: 1 },
        { label: '2 درب تقارن با 1 طبقه متحرک', value: 2 },
        { label: 'بدون درب (باکس دکوری)', value: 0 },
      ],
      defaultValue: 1,
      recommendationPersian: 'سوراخ کاسه لولا گازور با قطر 35mm در فاصله 22.5mm از لبه درب ایجاد می‌شود.'
    }
  ];

  const currentStepObj = steps[currentStep];
  const isFinalStep = currentStep === steps.length - 1;

  const macroOut = generateCabinetMacro(wizardData);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">طراح تعاملی پرسش و پاسخ گام‌به‌گام سالیدورک</h2>
            <p className="text-xs text-slate-400">
              دستیار با پرسیدن ۵ سوال ساده، مدل ۳ بعدی و ماکروی سالیدورک شما را می‌سازد.
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1">
          {steps.map((s, idx) => (
            <div
              key={s.id}
              className={`w-8 h-2 rounded-full transition-all ${
                idx === currentStep
                  ? 'bg-purple-500 w-12'
                  : idx < currentStep
                  ? 'bg-purple-500/40'
                  : 'bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Main Step Wizard Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step Form Box (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-6">
          <div className="space-y-1 pb-4 border-b border-slate-200">
            <span className="text-xs font-bold text-blue-600">گام {currentStep + 1} از {steps.length}: {currentStepObj.title}</span>
            <h3 className="text-base font-bold text-[#0f172a]">{currentStepObj.question}</h3>
            <p className="text-xs text-slate-500">{currentStepObj.description}</p>
          </div>

          {/* Interactive Option Selectors */}
          {currentStepObj.type === 'select' && currentStepObj.options && (
            <div className="space-y-3">
              {currentStepObj.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (currentStepObj.field === 'materialThickness') {
                      setWizardData({ ...wizardData, materialThickness: opt.value });
                    } else if (currentStepObj.field === 'doorCount') {
                      setWizardData({ ...wizardData, doorCount: opt.value });
                    }
                  }}
                  className={`w-full text-right p-4 rounded-xl border transition-all flex items-center justify-between ${
                    (currentStepObj.field === 'materialThickness' && wizardData.materialThickness === opt.value) ||
                    (currentStepObj.field === 'doorCount' && wizardData.doorCount === opt.value)
                      ? 'bg-blue-50 border-blue-500 text-blue-900 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{opt.label}</div>
                    {opt.subtext && <div className="text-xs text-slate-500 mt-0.5">{opt.subtext}</div>}
                  </div>
                  <div className="w-5 h-5 rounded-full border border-slate-300 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  </div>
                </button>
              ))}
            </div>
          )}

          {currentStepObj.type === 'number' && (
            <div className="space-y-4">
              <label className="text-xs text-slate-600 font-medium">میزان ابعاد سفارشی شما (mm):</label>
              <input
                type="number"
                value={
                  currentStepObj.field === 'width'
                    ? wizardData.width
                    : currentStepObj.field === 'height'
                    ? wizardData.height
                    : 550
                }
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (currentStepObj.field === 'width') setWizardData({ ...wizardData, width: val });
                  else if (currentStepObj.field === 'height') setWizardData({ ...wizardData, height: val });
                }}
                className="w-full bg-white border border-slate-300 rounded-xl p-3 text-lg font-mono text-blue-700 focus:border-blue-600 shadow-sm"
              />
            </div>
          )}

          {/* Assistant Tip */}
          {currentStepObj.recommendationPersian && (
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
              {currentStepObj.recommendationPersian}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentStep === 0
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <ArrowRight className="w-4 h-4" />
              مرحله قبلی
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              {isFinalStep ? 'تکمیل و مشاهده مدل سه بعدی' : 'مرحله بعدی'}
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Preview (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <Cabinet3DViewer params={wizardData} />

          <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 shadow-sm">
            <h4 className="font-bold text-[#0f172a] flex items-center justify-between">
              <span>دانلود کد ماکروی تولید شده</span>
              <span className="text-blue-600 font-mono">{wizardData.width}×{wizardData.height}×{wizardData.depth} mm</span>
            </h4>
            <p className="text-slate-500">کد ماکروی آماده برای سالیدورک توسط دستیار هوشمند تولید گردید.</p>
            <button
              onClick={() => {
                const blob = new Blob([macroOut.vbaCode], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'wizard_cabinet_macro.swp';
                a.click();
              }}
              className="w-full py-2 bg-[#1e293b] hover:bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Download className="w-4 h-4 text-blue-400" />
              دانلود فایل ماکرو (.SWP)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
