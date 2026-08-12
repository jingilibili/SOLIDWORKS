import React, { useState } from 'react';
import { 
  ShoppingCart, 
  PackageCheck, 
  Printer, 
  Download, 
  Copy, 
  Check, 
  Calculator, 
  Layers, 
  Wrench, 
  Hammer, 
  Plus, 
  Trash2, 
  RotateCcw,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';

export interface ProcurementItem {
  id: string;
  category: 'sheets' | 'pvc' | 'hardware' | 'fasteners' | 'metal_bed';
  namePersian: string;
  unit: 'ورق' | 'متر' | 'عدد' | 'جفت' | 'بسته' | 'شاخه' | 'کیلوگرم';
  quantity: number;
  unitPriceToman: number;
  notes: string;
}

const DEFAULT_PROCUREMENT_PRESETS: { [key: string]: { title: string; items: ProcurementItem[] } } = {
  kitchen_full: {
    title: 'خرید کامل مواد و یراق‌آلات آشپزخانه ۱۲ متری L-Shape',
    items: [
      { id: '1', category: 'sheets', namePersian: 'ورق MDF سفید صابونی (۱۶ میلیمتر - ۳۶۶×۱۸۳)', unit: 'ورق', quantity: 6, unitPriceToman: 1850000, notes: 'بدنه و یونیت‌های داخلی' },
      { id: '2', category: 'sheets', namePersian: 'ورق MDF هایگلاس / طرح‌دار (۱۶ میلیمتر)', unit: 'ورق', quantity: 4, unitPriceToman: 2600000, notes: 'درب‌ها و نماهای بیرونی' },
      { id: '3', category: 'sheets', namePersian: 'ورق فیبر پشت سفید (۳ میلیمتر)', unit: 'ورق', quantity: 3, unitPriceToman: 420000, notes: 'پشت یونیت‌ها' },
      { id: '4', category: 'sheets', namePersian: 'صفحه کابینت ۵ سانتی شرکتی (۶۰×۴۱۰)', unit: 'شاخه', quantity: 2, unitPriceToman: 3400000, notes: 'صفحه رویه کابینت زمینی' },
      { id: '5', category: 'pvc', namePersian: 'نوار PVC ضخامت ۲ میلیمتر (همرنگ نمای هایگلاس)', unit: 'متر', quantity: 180, unitPriceToman: 12000, notes: 'لبه درب‌ها و نمای اصلی' },
      { id: '6', category: 'pvc', namePersian: 'نوار PVC ضخامت ۱ میلیمتر (سفید بدنه)', unit: 'متر', quantity: 240, unitPriceToman: 6500, notes: 'لبه بدنه و طبقات داخلی' },
      { id: '7', category: 'hardware', namePersian: 'لولا گازور آرام‌بند پمپ برنجی (بلوم/فانتونی)', unit: 'عدد', quantity: 32, unitPriceToman: 48000, notes: 'درب یونیت‌ها' },
      { id: '8', category: 'hardware', namePersian: 'لولا ۱۸۰ درجه / زاویه‌دار (یونیت کنج L)', unit: 'عدد', quantity: 4, unitPriceToman: 85000, notes: 'کنج بازشو' },
      { id: '9', category: 'hardware', namePersian: 'ریل ساچمه‌ای ۳ زمانه ۴۵ سانتیمتر سنگین', unit: 'جفت', quantity: 6, unitPriceToman: 185000, notes: 'کشوهای زمینی' },
      { id: '10', category: 'hardware', namePersian: 'دستگیره پروفیل G آلومینیوم آنودایز', unit: 'متر', quantity: 8, unitPriceToman: 140000, notes: 'دستگیره مخفی' },
      { id: '11', category: 'hardware', namePersian: 'پایه کابینت قابل تنظیم ۱۴ سانتیمتر', unit: 'عدد', quantity: 24, unitPriceToman: 14000, notes: 'زیر یونیت‌های زمینی' },
      { id: '12', category: 'fasteners', namePersian: 'پیچ MDF سایز ۴×۵۰ (بسته ۵۰۰ تایی)', unit: 'بسته', quantity: 2, unitPriceToman: 125000, notes: 'اتصال بدنه' },
      { id: '13', category: 'fasteners', namePersian: 'پیچ MDF سایز ۴×۱۶ (بسته ۱۰۰۰ تایی)', unit: 'بسته', quantity: 1, unitPriceToman: 110000, notes: 'اتصال لولا و ریل' },
      { id: '14', category: 'fasteners', namePersian: 'پین و قفل مینی‌فیکس الیت (Hafele)', unit: 'بسته', quantity: 1, unitPriceToman: 280000, notes: 'اتصالات مخفی الیت' },
      { id: '15', category: 'fasteners', namePersian: 'گونیا و جک نگهدارنده دیواری (فیتینگ)', unit: 'عدد', quantity: 12, unitPriceToman: 22000, notes: 'نصب دیواری' }
    ]
  },
  bedroom_murphy: {
    title: 'خرید کلاف فلزی، چوب و یراق‌آلات تخت تاشو ۱۶۰ و کمدهای جانبی',
    items: [
      { id: '101', category: 'metal_bed', namePersian: 'پروفیل قوطی فولادی ۳۰×۵۰ با ضخامت ۲ میلیمتر', unit: 'شاخه', quantity: 3, unitPriceToman: 780000, notes: 'کلاف فلزی دور و پل‌های تخت' },
      { id: '102', category: 'metal_bed', namePersian: 'جک هیدرولیک نیتروژنی ۱۲۰۰ نیوتن (مخصوص تخت ۱۶۰)', unit: 'جفت', quantity: 1, unitPriceToman: 950000, notes: 'مکانیزم بازشو با گارانتی' },
      { id: '103', category: 'metal_bed', namePersian: 'پایه فلزی تاشو اتوماتیک چرخشی', unit: 'جفت', quantity: 1, unitPriceToman: 650000, notes: 'پایه جلوی تخت' },
      { id: '104', category: 'sheets', namePersian: 'ورق MDF صابونی سفید بدنه (۱۶ میلیمتر)', unit: 'ورق', quantity: 4, unitPriceToman: 1850000, notes: 'باکس اصلی و کمدها' },
      { id: '105', category: 'sheets', namePersian: 'ورق MDF نما و درب‌ها (۱۶ میلیمتر)', unit: 'ورق', quantity: 3, unitPriceToman: 2400000, notes: 'درب تاشو و کمدهای طرفین' },
      { id: '106', category: 'pvc', namePersian: 'نوار PVC ضخامت ۲ میلیمتر', unit: 'متر', quantity: 95, unitPriceToman: 12000, notes: 'لبه نماها' },
      { id: '107', category: 'hardware', namePersian: 'لولا گازور ۱۸۰ درجه آرام‌بند', unit: 'عدد', quantity: 12, unitPriceToman: 52000, notes: 'درب کمدهای جانبی' },
      { id: '108', category: 'fasteners', namePersian: 'پیچ و رولپلاک سنگین مهار دیواری (بولپلاک)', unit: 'عدد', quantity: 8, unitPriceToman: 35000, notes: 'مهار ایمنی باکس تخت به دیوار' },
      { id: '109', category: 'fasteners', namePersian: 'سیم جوش Co2 و الکترود جوشکاری', unit: 'بسته', quantity: 1, unitPriceToman: 240000, notes: 'جوشکاری کلاف فلزی' }
    ]
  }
};

export function ProcurementStudio() {
  const [items, setItems] = useState<ProcurementItem[]>(DEFAULT_PROCUREMENT_PRESETS.kitchen_full.items);
  const [presetKey, setPresetKey] = useState<string>('kitchen_full');
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // New Item Input State
  const [newItemName, setNewItemName] = useState<string>('');
  const [newItemCategory, setNewItemCategory] = useState<ProcurementItem['category']>('hardware');
  const [newItemUnit, setNewItemUnit] = useState<ProcurementItem['unit']>('عدد');
  const [newItemQty, setNewItemQty] = useState<number>(1);
  const [newItemPrice, setNewItemPrice] = useState<number>(0);
  const [newItemNotes, setNewItemNotes] = useState<string>('');

  const handleAddItem = () => {
    if (!newItemName.trim()) {
      alert('لطفاً نام نام قطعه/ماده را وارد کنید.');
      return;
    }
    const item: ProcurementItem = {
      id: 'custom-' + Date.now(),
      category: newItemCategory,
      namePersian: newItemName,
      unit: newItemUnit,
      quantity: newItemQty,
      unitPriceToman: newItemPrice,
      notes: newItemNotes
    };
    setItems((prev) => [...prev, item]);
    setNewItemName('');
    setNewItemPrice(0);
    setNewItemNotes('');
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleQtyChange = (id: string, qty: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: Math.max(0, qty) } : i)));
  };

  const handlePriceChange = (id: string, price: number) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, unitPriceToman: Math.max(0, price) } : i)));
  };

  const handleSelectPreset = (key: string) => {
    setPresetKey(key);
    if (DEFAULT_PROCUREMENT_PRESETS[key]) {
      setItems([...DEFAULT_PROCUREMENT_PRESETS[key].items]);
    }
  };

  const calculateTotalCost = () => {
    return items.reduce((sum, item) => sum + item.quantity * item.unitPriceToman, 0);
  };

  const formatToman = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const generateTextSummary = () => {
    const total = calculateTotalCost();
    let text = `==================================================\n`;
    text += `📋 لیست اقلام خرید کارگاهی و برآورد هزینه (SolidWorks Master)\n`;
    text += `تاریخ برآورد: ${new Date().toLocaleDateString('fa-IR')}\n`;
    text += `==================================================\n\n`;

    items.forEach((item, index) => {
      const itemTotal = item.quantity * item.unitPriceToman;
      text += `${index + 1}. ${item.namePersian}\n`;
      text += `   مقدار: ${item.quantity} ${item.unit} | قیمت واحد: ${formatToman(item.unitPriceToman)} | جمع: ${formatToman(itemTotal)}\n`;
      if (item.notes) text += `   توضیحات: ${item.notes}\n`;
      text += `--------------------------------------------------\n`;
    });

    text += `\n💰 برآورد کل هزینه خرید: ${formatToman(total)}\n`;
    return text;
  };

  const filteredItems = items.filter((item) =>
    item.namePersian.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-right">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-200">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">لیست کامل اقلام خرید و برآورد هزینه (Procurement & Shopping List)</h2>
            <p className="text-xs text-slate-500">
              استخراج متراژ نوار PVC، تعداد ورق MDF، پیچ، لولا، ریل، پروفیل قوطی کلاف و محاسبه بودجه خرید کارگاهی
            </p>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600 font-bold">پروژه نمونه:</span>
          <select
            value={presetKey}
            onChange={(e) => handleSelectPreset(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-emerald-600 shadow-sm"
          >
            <option value="kitchen_full">آشپزخانه ۱۲ متری کامل L-Shape</option>
            <option value="bedroom_murphy">تخت تاشو ۱۶۰ + کمدهای اتاق خواب</option>
          </select>
        </div>
      </div>

      {/* Summary Total Cards Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-medium opacity-90">
            <span>برآورد کل هزینه خرید:</span>
            <Calculator className="w-4 h-4" />
          </div>
          <div className="text-xl font-extrabold font-mono dir-ltr text-right">
            {formatToman(calculateTotalCost())}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">تعداد عناوین اقلام خرید:</span>
          <span className="text-lg font-bold text-slate-800 font-mono">{items.length} آیتم کارگاهی</span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">مجموع ورق‌های MDF لازم:</span>
          <span className="text-lg font-bold text-emerald-700 font-mono">
            {items.filter((i) => i.category === 'sheets').reduce((s, i) => s + i.quantity, 0)} ورق
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-500 block">مجموع متراژ نوار PVC:</span>
          <span className="text-lg font-bold text-blue-700 font-mono">
            {items.filter((i) => i.category === 'pvc').reduce((s, i) => s + i.quantity, 0)} متر
          </span>
        </div>
      </div>

      {/* Main Content Box */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-[#0f172a]">جدول تفکیکی اقلام، متراژها و قیمت واحدهای بازار</h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در اقلام..."
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-emerald-600 shadow-sm"
            />

            <button
              onClick={() => {
                navigator.clipboard.writeText(generateTextSummary());
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'کپی شد!' : 'کپی لیست خرید'}
            </button>

            <button
              onClick={() => {
                const text = generateTextSummary();
                const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Shopping_List_${new Date().toISOString().slice(0, 10)}.txt`;
                a.click();
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              دانلود لیست خرید
            </button>
          </div>
        </div>

        {/* Procurement Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-800 border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="p-3">ردیف</th>
                <th className="p-3">نام ماده / قطعه / یراق</th>
                <th className="p-3">دسته بندی</th>
                <th className="p-3">تعداد / مقدار</th>
                <th className="p-3">واحد</th>
                <th className="p-3">قیمت واحد (تومان)</th>
                <th className="p-3">جمع کل (تومان)</th>
                <th className="p-3">توضیحات و برند</th>
                <th className="p-3 text-center">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.map((item, idx) => {
                const totalItemPrice = item.quantity * item.unitPriceToman;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{item.namePersian}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.category === 'sheets' ? 'bg-amber-100 text-amber-800' :
                        item.category === 'pvc' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'metal_bed' ? 'bg-purple-100 text-purple-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.category === 'sheets' ? 'ورق MDF' :
                         item.category === 'pvc' ? 'نوار PVC' :
                         item.category === 'metal_bed' ? 'کلاف فلزی' :
                         item.category === 'hardware' ? 'یراق‌آلات' : 'پیچ و اتصالات'}
                      </span>
                    </td>
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity}
                        onChange={(e) => handleQtyChange(item.id, Number(e.target.value))}
                        className="w-20 p-1 bg-white border border-slate-300 rounded text-center font-mono font-bold text-slate-800"
                      />
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{item.unit}</td>
                    <td className="p-3">
                      <input
                        type="number"
                        step="1000"
                        value={item.unitPriceToman}
                        onChange={(e) => handlePriceChange(item.id, Number(e.target.value))}
                        className="w-32 p-1 bg-white border border-slate-300 rounded text-center font-mono text-slate-800"
                      />
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-700 text-left dir-ltr">
                      {formatToman(totalItemPrice)}
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">{item.notes}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Add New Item Form */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            افزودن قطعه یا آیتم خرید جدید به لیست:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 text-xs">
            <div className="lg:col-span-2 space-y-1">
              <label className="text-slate-600 font-semibold">نام قطعه/ماده:</label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="مثال: صفحه کابینت ۵ سانت..."
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">دسته‌بندی:</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="sheets">ورق MDF</option>
                <option value="pvc">نوار PVC</option>
                <option value="hardware">یراق‌آلات</option>
                <option value="fasteners">پیچ و اتصالات</option>
                <option value="metal_bed">کلاف فلزی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">تعداد/مقدار:</label>
              <input
                type="number"
                value={newItemQty}
                onChange={(e) => setNewItemQty(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-center"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold">قیمت واحد (تومان):</label>
              <input
                type="number"
                value={newItemPrice}
                onChange={(e) => setNewItemPrice(Number(e.target.value))}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-mono text-center"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleAddItem}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition shadow-sm"
              >
                + افزودن آیتم
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
