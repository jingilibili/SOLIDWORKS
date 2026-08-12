import React, { useState } from 'react';
import { SOLIDWORKS_MANUAL_DATA } from '../data/solidworksManual';
import { KnowledgeItem } from '../types';
import { 
  BookOpen, 
  Search, 
  Code, 
  AlertTriangle, 
  Key, 
  ListChecks, 
  ChevronDown, 
  ChevronUp,
  Sparkles
} from 'lucide-react';

export const ManualKB: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(SOLIDWORKS_MANUAL_DATA[0].id);

  const categories = [
    { id: 'all', label: 'همه موضوعات' },
    { id: 'sketch', label: 'محیط اسکتچ (Sketch)' },
    { id: 'part', label: 'مدلسازی سه بعدی (Part)' },
    { id: 'cabinetry', label: 'صنعت چوب و کابینت' },
    { id: 'cnc', label: 'تراشکاری CNC' },
    { id: 'hardware', label: 'یراق‌آلات' },
    { id: 'macros', label: 'ماکرونویسی و API' },
    { id: 'troubleshooting', label: 'رفع خطاها (Errors)' },
  ];

  const filteredItems = SOLIDWORKS_MANUAL_DATA.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.summaryPersian.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.detailedContentPersian.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Title & Search Bar */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-200">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0f172a]">دانشنامه و راهنمای کامل آفلاین سالیدورک (Manual & KB)</h2>
            <p className="text-xs text-slate-500">
              آموزش جامع دستورات، استانداردهای کابینت و تراشکاری، کلیدهای میانبر و عیب‌یابی خطاهای سالیدورک
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute right-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="جستجو در تمام فصل‌های راهنمای سالیدورک (مثلاً: لولا، تراشکاری، قید، Rebuild error)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-300 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-600 shadow-sm"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Topics List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm transition-all"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="p-5 cursor-pointer flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded">
                      {item.category.toUpperCase()}
                    </span>
                    <h3 className="text-base font-bold text-[#0f172a]">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{item.summaryPersian}</p>
                </div>

                <div className="p-2 text-slate-500 bg-slate-100 rounded-lg">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-6 pb-6 pt-2 border-t border-slate-200 space-y-4 text-xs text-slate-700">
                  <div className="whitespace-pre-line leading-relaxed text-slate-800 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {item.detailedContentPersian}
                  </div>

                  {/* Shortcuts section */}
                  {item.shortcuts && item.shortcuts.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#0f172a] flex items-center gap-1.5 text-amber-700">
                        <Key className="w-4 h-4" />
                        میانبرهای مهم صفحه کلید (Keyboard Shortcuts):
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {item.shortcuts.map((sc, i) => (
                          <span key={i} className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded font-mono font-bold">
                            {sc}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Steps section */}
                  {item.steps && item.steps.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-bold text-[#0f172a] flex items-center gap-1.5 text-emerald-700">
                        <ListChecks className="w-4 h-4" />
                        مراحل گام‌به‌گام زمان طراحی:
                      </h4>
                      <ol className="list-decimal list-inside space-y-1 text-slate-700">
                        {item.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
