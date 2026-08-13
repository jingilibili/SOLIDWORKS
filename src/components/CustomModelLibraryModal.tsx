import React, { useState, useEffect } from 'react';
import { 
  X, 
  BookOpen, 
  Plus, 
  Save, 
  Trash2, 
  Download, 
  Upload, 
  Sparkles, 
  Check, 
  AlertCircle,
  FolderPlus,
  Maximize2,
  Box,
  Layers,
  ArrowRight
} from 'lucide-react';
import { 
  CustomModelTemplate, 
  getSavedModelTemplates, 
  saveModelTemplate, 
  deleteModelTemplate, 
  adaptModelToNewDimensions 
} from '../utils/modelLibrary';
import { RoomLayoutConfig, CabinetUnitLayout } from './RoomPlannerStudio';

interface CustomModelLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRoomConfig?: RoomLayoutConfig;
  currentUnits?: CabinetUnitLayout[];
  onApplyAdaptedModel?: (adaptedConfig: RoomLayoutConfig, adaptedUnits: CabinetUnitLayout[], summary: string) => void;
}

export const CustomModelLibraryModal: React.FC<CustomModelLibraryModalProps> = ({
  isOpen,
  onClose,
  currentRoomConfig,
  currentUnits,
  onApplyAdaptedModel,
}) => {
  const [templates, setTemplates] = useState<CustomModelTemplate[]>([]);
  const [activeTab, setActiveTab] = useState<'browse' | 'create'>('browse');
  
  // Save New Model State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'kitchen' | 'bedroom' | 'cabinet_unit'>('kitchen');
  const [newTags, setNewTags] = useState<string>('مدرن, شخصی');
  const [notification, setNotification] = useState<string | null>(null);

  // Adapt Selected Model State
  const [selectedTpl, setSelectedTpl] = useState<CustomModelTemplate | null>(null);
  const [targetWall1, setTargetWall1] = useState<number>(3800);
  const [targetWall2, setTargetWall2] = useState<number>(2800);

  useEffect(() => {
    if (isOpen) {
      setTemplates(getSavedModelTemplates());
      if (currentRoomConfig) {
        setTargetWall1(currentRoomConfig.wall1Length);
        setTargetWall2(currentRoomConfig.wall2Length);
      }
    }
  }, [isOpen, currentRoomConfig]);

  if (!isOpen) return null;

  const handleSaveCurrentAsModel = () => {
    if (!newTitle.trim()) {
      alert('لطفاً نامی برای مدل یا قالب وارد کنید.');
      return;
    }

    if (!currentRoomConfig || !currentUnits || currentUnits.length === 0) {
      alert('هیچ طرح یا یونیتی برای ذخیره یافت نشد.');
      return;
    }

    const saved = saveModelTemplate({
      title: newTitle,
      category: newCategory,
      description: newDesc || 'قالب شخصی سفارشی‌شده کاربر',
      originalDimensions: {
        wall1Length: currentRoomConfig.wall1Length,
        wall2Length: currentRoomConfig.wall2Length,
        wall3Length: currentRoomConfig.wall3Length,
        ceilingHeight: currentRoomConfig.ceilingHeight,
      },
      units: currentUnits,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
    });

    setTemplates(getSavedModelTemplates());
    setNotification(`✅ مدل «${saved.title}» با موفقیت در کتابخانه شخصی ذخیره شد.`);
    setNewTitle('');
    setNewDesc('');
    setActiveTab('browse');
    setTimeout(() => setNotification(null), 4000);
  };

  const handleDeleteModel = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('آیا از حذف این مدل از کتابخانه مطمئن هستید؟')) {
      const updated = deleteModelTemplate(id);
      setTemplates(updated);
      if (selectedTpl?.id === id) setSelectedTpl(null);
    }
  };

  const handleApplySelectedTpl = () => {
    if (!selectedTpl || !onApplyAdaptedModel) return;

    const res = adaptModelToNewDimensions(selectedTpl, targetWall1, targetWall2);
    onApplyAdaptedModel(res.adaptedConfig, res.adaptedUnits, res.summaryPersian);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-800">
        {/* Modal Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <div>
              <h2 className="text-base font-bold">کتابخانه مدل‌ها و قالب‌های اختصاصی (Parametric Library)</h2>
              <p className="text-xs text-slate-400 font-normal">
                ذخیره، بازیابی و پیاده‌سازی هوشمند انطباقی مدل‌های کامل کابینت و سرویس خواب برای ابعاد مختلف
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Nav Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 'browse'
                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Box className="w-4 h-4" />
            مرور کتابخانه مدل‌ها ({templates.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2.5 rounded-t-xl font-bold text-xs flex items-center gap-2 transition ${
              activeTab === 'create'
                ? 'bg-white text-blue-600 border-t-2 border-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FolderPlus className="w-4 h-4 text-emerald-600" />
            💾 ذخیره طرح فعلی به عنوان مدل جدید
          </button>
        </div>

        {notification && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 px-6 py-2.5 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            {notification}
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'browse' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((tpl) => {
                const isSelected = selectedTpl?.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setSelectedTpl(tpl)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-500 ring-2 ring-blue-500/30 shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              tpl.category === 'kitchen'
                                ? 'bg-amber-100 text-amber-800'
                                : tpl.category === 'bedroom'
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {tpl.category === 'kitchen' ? 'آشپزخانه' : tpl.category === 'bedroom' ? 'اتاق خواب' : 'یونیت مجزا'}
                          </span>
                          <h3 className="text-xs font-bold text-slate-900">{tpl.title}</h3>
                        </div>

                        <button
                          onClick={(e) => handleDeleteModel(tpl.id, e)}
                          className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                          title="حذف از کتابخانه"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">{tpl.description}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600 font-medium">
                      <span>ابعاد اصلی: <strong>{tpl.originalDimensions.wall1Length}mm</strong></span>
                      <span>ماژول‌ها: <strong>{tpl.units?.length || 0} یونیت</strong></span>
                    </div>

                    {/* Tags */}
                    {tpl.tags && tpl.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {tpl.tags.map((tag, idx) => (
                          <span key={idx} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded-md font-semibold">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Create / Save Tab */
            <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-2 border-b border-slate-200 pb-2">
                <Save className="w-4 h-4 text-emerald-600" />
                مشخصات مدل جدید جهت ذخیره‌سازی در کتابخانه شخصی
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">نام مدل / قالب:</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: آشپزخانه مدرن ممبران L-Shape الوند..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">دسته‌بندی:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 font-medium"
                  >
                    <option value="kitchen">آشپزخانه (کابینت و یراق)</option>
                    <option value="bedroom">اتاق خواب (سرویس خواب / تخت تاشو)</option>
                    <option value="cabinet_unit">یونیت مجزای سفارشی</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">توضیحات و مشخصات کاربردی:</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="توضیحات مربوط به متریال، برند یراق‌آلات، نحوه چیدمان..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-xs font-bold text-slate-700">تگ‌ها (با کاما جدا کنید):</label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={(e) => setNewTags(e.target.value)}
                    placeholder="مدرن, ممبران, های‌گلاس, تخت تاشو..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {currentRoomConfig && currentUnits && (
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 space-y-1">
                  <span className="font-bold">اطلاعات طرح آماده ذخیره:</span>
                  <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-700 mt-1">
                    <span>طول دیوار اصلی: {currentRoomConfig.wall1Length}mm</span>
                    <span>تعداد کل یونیت‌ها: {currentUnits.length} ماژول</span>
                    <span>نوع چیدمان: {currentRoomConfig.layoutShape}</span>
                  </div>
                </div>
              )}

              <button
                onClick={handleSaveCurrentAsModel}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md"
              >
                <Save className="w-4 h-4" />
                تأیید و ذخیره مدل در کتابخانه شخصی
              </button>
            </div>
          )}

          {/* Adaptation Config Controls when a Model is Selected */}
          {selectedTpl && activeTab === 'browse' && (
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 animate-fade-in border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  پیاده‌سازی انطباقی مدل «{selectedTpl.title}» روی ابعاد جدید:
                </span>
                <span className="text-[10px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-md font-mono">
                  Parametric Smart Scale
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-300 font-bold">طول جدید دیوار اصلی (mm):</label>
                  <input
                    type="number"
                    step="100"
                    value={targetWall1}
                    onChange={(e) => setTargetWall1(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                  />
                  <p className="text-[10px] text-slate-400">
                    ابعاد اصلی مدل: {selectedTpl.originalDimensions.wall1Length}mm
                  </p>
                </div>

                {selectedTpl.originalDimensions.wall2Length && (
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-300 font-bold">طول جدید دیوار دوم (mm):</label>
                    <input
                      type="number"
                      step="100"
                      value={targetWall2}
                      onChange={(e) => setTargetWall2(Number(e.target.value))}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  برنامه به‌صورت هوشمند کم و اضافه شدن یونیت‌ها را بر اساس ابعاد جدید محاسبه می‌کند.
                </p>

                <button
                  onClick={handleApplySelectedTpl}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 shadow-md"
                >
                  <ArrowRight className="w-4 h-4" />
                  اعمال هوشمند مدل روی استودیو
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
