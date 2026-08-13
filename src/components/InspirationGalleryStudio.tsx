import React, { useState } from 'react';
import { 
  Sparkles, 
  Search, 
  Layers, 
  Compass, 
  ArrowLeft, 
  Download, 
  CheckCircle2, 
  ExternalLink, 
  Box, 
  Home, 
  Palette, 
  Ruler, 
  Sliders, 
  Bookmark, 
  Zap,
  Tag
} from 'lucide-react';
import { ActiveTab, CabinetParams } from '../types';
import { RoomLayoutConfig } from './RoomPlannerStudio';
import { saveModelTemplate } from '../utils/modelLibrary';

export interface InspirationItem {
  id: string;
  titlePersian: string;
  titleEnglish: string;
  category: 'japandi' | 'slim_shaker' | 'modern_gola' | 'kitchen_island' | 'neoclassic' | 'murphy_bed' | 'industrial';
  sourceName: string; // e.g. 'Pinterest Trends 2026', 'Houzz Select'
  sourceUrl: string;
  descriptionPersian: string;
  tags: string[];
  trendingScore: number; // e.g. 98%
  bgGradient: string;
  accentColor: string;
  colors: { name: string; hex: string }[];
  params: {
    materialThickness: number; // mm
    finishColor: string;
    handleStyle: string;
    hingeBrand: 'Blum' | 'Hettich' | 'Fantoni' | 'Standard';
    cabinetHeightType: 'standard_220' | 'full_height_to_ceiling' | 'double_decker';
    designStyle: 'japandi_minimalism' | 'slim_shaker' | 'modern_gola_handleless' | 'neoclassic_membrane' | 'industrial_wood_metal' | 'frameless_polyurethane' | 'classic_wood' | 'minimalist_two_tone';
    islandWidthMm?: number;
    islandDepthMm?: number;
    islandOverhangMm?: number;
    recommendedWidthMm: number;
    recommendedHeightMm: number;
    recommendedDepthMm: number;
  };
}

const INSPIRATION_DATABASE: InspirationItem[] = [
  {
    id: 'insp-japandi-1',
    titlePersian: 'آشپزخانه ژاپاندی مینیمال با چوب بلوط شنی و جزیره ماربل',
    titleEnglish: 'Japandi Minimalist Oak & Sand Marble Island',
    category: 'japandi',
    sourceName: 'Pinterest Design Trends 2026',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Japandi%20Kitchen%20Design%202026',
    descriptionPersian: 'تلفیق سادگی ژاپنی و گرمای اسکانینوی با روکش چوب طبیعی شنی، لبه‌های بدون دستگیره مایل، و جزیره مرکزی سنگ ماربل با پایه‌های آبشار.',
    tags: ['ژاپاندی', 'چوب_طبیعی', 'جزیره_ماربل', 'مینیمال', 'ترند_۲۰۲۶'],
    trendingScore: 99,
    bgGradient: 'from-amber-900/20 via-slate-900 to-slate-900',
    accentColor: '#D2B48C',
    colors: [
      { name: 'بلوط شنی (Sand Oak)', hex: '#D2B48C' },
      { name: 'سنگ ماربل گرم (Warm Calacatta)', hex: '#F5F5DC' },
      { name: 'خاکستری زیتونی (Olive Gray)', hex: '#556B2F' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#D2B48C',
      handleStyle: 'Bevel Push-to-Open & Hidden J-Pull',
      hingeBrand: 'Blum',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'japandi_minimalism',
      islandWidthMm: 2000,
      islandDepthMm: 950,
      islandOverhangMm: 350,
      recommendedWidthMm: 4200,
      recommendedHeightMm: 2700,
      recommendedDepthMm: 600
    }
  },
  {
    id: 'insp-slim-shaker-1',
    titlePersian: 'کابینت اسلیم شیکر سبز مریم‌گلی با فریم ۱۰ میلی‌متری',
    titleEnglish: 'Slim Shaker Sage Green 10mm Profile',
    category: 'slim_shaker',
    sourceName: 'Houzz Kitchen Ideas 2026',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Skinny%20Shaker%20Cabinet%20Sage%20Green',
    descriptionPersian: 'بازطراحی مدرن کابینت شیکر با زهوار بسیار باریک ۱۰mm اسلیم، رنگ سبز مریم‌گلی مات پلی‌اورتان و دستگیره‌های خطی طلایی مات.',
    tags: ['اسلیم_شیکر', 'سبز_مریم_گلی', 'فریم_باریک', 'پلی_اورتان'],
    trendingScore: 97,
    bgGradient: 'from-emerald-950/30 via-slate-900 to-slate-900',
    accentColor: '#87A96B',
    colors: [
      { name: 'سبز مریم‌گلی (Sage Green)', hex: '#87A96B' },
      { name: 'برنجی طلایی (Brassed Gold)', hex: '#D4AF37' },
      { name: 'کرم وانیلی (Vanilla Cream)', hex: '#FDF5E6' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#87A96B',
      handleStyle: 'Slim Brass Edge Profile',
      hingeBrand: 'Fantoni',
      cabinetHeightType: 'double_decker',
      designStyle: 'slim_shaker',
      islandWidthMm: 1800,
      islandDepthMm: 900,
      islandOverhangMm: 300,
      recommendedWidthMm: 3800,
      recommendedHeightMm: 2800,
      recommendedDepthMm: 600
    }
  },
  {
    id: 'insp-gola-1',
    titlePersian: 'مدرن گولا مشکی مات با دستگیره مخفی L و U شکل شاخه‌ای',
    titleEnglish: 'Modern Gola Handleless Matte Black & Walnut',
    category: 'modern_gola',
    sourceName: 'Architectural Digest 2026',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Gola%20Profile%20Kitchen%20Matte%20Black',
    descriptionPersian: 'پروفیل مشکی آلومینیومی گولا (Gola Profile) نصب‌شده روی یونیت‌های بدنه همراه با روکش گردوی آمریکایی و نورپردازی شیاری LED زیر صفحه.',
    tags: ['گولا', 'دستگیره_مخفی', 'مشکی_مات', 'گردو', 'نورپردازی_خطی'],
    trendingScore: 96,
    bgGradient: 'from-zinc-900 via-slate-900 to-slate-900',
    accentColor: '#3E2723',
    colors: [
      { name: 'گردوی آمریکایی (Walnut Wood)', hex: '#3E2723' },
      { name: 'مشکی کربن (Carbon Black)', hex: '#1C1C1C' },
      { name: 'نور گرم ۳۰۰۰K (Warm LED)', hex: '#FFD700' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#3E2723',
      handleStyle: 'Continuous Aluminium Gola Profile',
      hingeBrand: 'Blum',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'modern_gola_handleless',
      islandWidthMm: 2200,
      islandDepthMm: 1000,
      islandOverhangMm: 400,
      recommendedWidthMm: 4500,
      recommendedHeightMm: 2700,
      recommendedDepthMm: 600
    }
  },
  {
    id: 'insp-island-1',
    titlePersian: 'جزیره دوبل آشپزخانه با سینک توکار و صفحه آبشار کوارتز',
    titleEnglish: 'Luxury Waterfall Double Island Kitchen',
    category: 'kitchen_island',
    sourceName: 'Pinterest Luxury Kitchens',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Kitchen%20Island%20Waterfall%20Quartz',
    descriptionPersian: 'طراحی جزیره دوطبقه با اورپاش ۳۵ سانتی‌متری صندلی بار، سینک پیانو زیرکار و کشوهای سوپرمارکتی بلوم در دو طرف جزیره.',
    tags: ['جزیره_آشپزخانه', 'کوارتز_آبشار', 'سینک_زیرکار', 'صندلی_اپن'],
    trendingScore: 98,
    bgGradient: 'from-sky-950/30 via-slate-900 to-slate-900',
    accentColor: '#38bdf8',
    colors: [
      { name: 'خاکستری ذغالی (Charcoal Gray)', hex: '#262626' },
      { name: 'سنگ رگه‌دار کوارتز (Statuario Quartz)', hex: '#FFFFFF' },
      { name: 'مسی رزگلد (Rose Gold)', hex: '#B76E79' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#262626',
      handleStyle: 'Integrated J-Pull & Push-to-Open',
      hingeBrand: 'Blum',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'japandi_minimalism',
      islandWidthMm: 2400,
      islandDepthMm: 1100,
      islandOverhangMm: 350,
      recommendedWidthMm: 5000,
      recommendedHeightMm: 2800,
      recommendedDepthMm: 600
    }
  },
  {
    id: 'insp-neoclassic-1',
    titlePersian: 'نئوکلاسیک انزو سفید براق با درب ۲۵mm و حکاکی ابزار ایتالیایی',
    titleEnglish: 'Neoclassic Enzo Style White High Gloss 25mm',
    category: 'neoclassic',
    sourceName: 'Classic Interior Trends 2026',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Enzo%20Neoclassic%20Kitchen',
    descriptionPersian: 'درب‌های ضخیم ۲۵ میلی‌متری CNC خورده با رنگ پلی‌اورتان سفید ۵۰٪ براق، سرستون‌های خراطی‌شده ظریف و پاخور تاج ساده.',
    tags: ['انزو', 'نئوکلاسیک', 'پلی_اورتان', 'سفید_براق', 'تاج_و_پایه'],
    trendingScore: 94,
    bgGradient: 'from-blue-950/20 via-slate-900 to-slate-900',
    accentColor: '#E2E8F0',
    colors: [
      { name: 'سفید صدفی (Pearl White)', hex: '#F8FAFC' },
      { name: 'استیل خش‌دار (Brushed Steel)', hex: '#94A3B8' },
      { name: 'سنگ مشکی نجف‌آباد (Black Marble)', hex: '#0F172A' }
    ],
    params: {
      materialThickness: 25,
      finishColor: '#F8FAFC',
      handleStyle: 'Classic Ceramic & Knob Handles',
      hingeBrand: 'Fantoni',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'neoclassic_membrane',
      islandWidthMm: 1800,
      islandDepthMm: 900,
      islandOverhangMm: 300,
      recommendedWidthMm: 4000,
      recommendedHeightMm: 2700,
      recommendedDepthMm: 600
    }
  },
  {
    id: 'insp-bed-1',
    titlePersian: 'اتاق خواب هوشمند با تخت تاشو دو نفره عمودی و کمدهای پنهان',
    titleEnglish: 'Smart Vertical Wall Murphy Bed & Hidden Wardrobes',
    category: 'murphy_bed',
    sourceName: 'Pinterest Small Spaces 2026',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Murphy%20Bed%20Smart%20Bedroom%202026',
    descriptionPersian: 'طراحی کم‌جا و هوشمند تخت خواب تاشوی جک دار فولادی با قاب MDF ۱۸mm، میز تحریر تاشوی یکپارچه و کمدهای سوپر لباس جانبی.',
    tags: ['تخت_تاشو', 'اتاق_خواب_هوشمند', 'میز_تحریر', 'کم_جا'],
    trendingScore: 95,
    bgGradient: 'from-purple-950/30 via-slate-900 to-slate-900',
    accentColor: '#a855f7',
    colors: [
      { name: 'چوب بلوط روشن (Light Oak)', hex: '#E5D3B3' },
      { name: 'طوسی فیلی (Elephant Gray)', hex: '#64748B' },
      { name: 'آبی اقیانوسی (Ocean Navy)', hex: '#1E293B' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#E5D3B3',
      handleStyle: 'Recessed Pocket Handles',
      hingeBrand: 'Hettich',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'japandi_minimalism',
      recommendedWidthMm: 3200,
      recommendedHeightMm: 2600,
      recommendedDepthMm: 500
    }
  },
  {
    id: 'insp-industrial-1',
    titlePersian: 'صنعتی مدرن با شاسی فلزی مشکی، شیشه شیاردار مورانو و بتن اکسپوز',
    titleEnglish: 'Industrial Wood, Metal Frame & Fluted Glass',
    category: 'industrial',
    sourceName: 'Pinterest Industrial Interiors',
    sourceUrl: 'https://pinterest.com/search/pins/?q=Industrial%20Kitchen%20Fluted%20Glass',
    descriptionPersian: 'ترکیب فریم آلومینیومی مشکی، شیشه‌های راسته شیاردار (Fluted Glass)، شلیک بتن اکسپوز و چوب شاه‌بلوط کهنه.',
    tags: ['صنعتی', 'شیشه_شیاردار', 'فریم_مشکی', 'بتن_اکسپوز'],
    trendingScore: 92,
    bgGradient: 'from-orange-950/20 via-slate-900 to-slate-900',
    accentColor: '#f97316',
    colors: [
      { name: 'فریم پروفیل مشکی (Black Frame)', hex: '#18181B' },
      { name: 'شیشه شیاردار شفاف (Fluted Glass)', hex: '#CBD5E1' },
      { name: 'شاه‌بلوط کهنه (Aged Chestnut)', hex: '#451A03' }
    ],
    params: {
      materialThickness: 18,
      finishColor: '#451A03',
      handleStyle: 'Industrial Steel Bar Handle',
      hingeBrand: 'Blum',
      cabinetHeightType: 'full_height_to_ceiling',
      designStyle: 'industrial_wood_metal',
      islandWidthMm: 2100,
      islandDepthMm: 950,
      islandOverhangMm: 300,
      recommendedWidthMm: 4000,
      recommendedHeightMm: 2700,
      recommendedDepthMm: 600
    }
  }
];

interface InspirationGalleryStudioProps {
  onNavigateTab: (tab: ActiveTab) => void;
  onImportToRoomPlanner?: (config: Partial<RoomLayoutConfig>) => void;
  onImportToCabinetStudio?: (params: Partial<CabinetParams>) => void;
}

export const InspirationGalleryStudio: React.FC<InspirationGalleryStudioProps> = ({
  onNavigateTab,
  onImportToRoomPlanner,
  onImportToCabinetStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<InspirationItem | null>(null);
  const [savedSuccessMessage, setSavedSuccessMessage] = useState<string | null>(null);

  const categories = [
    { id: 'all', label: 'همه سبک‌های ۲۰۲۶', icon: <Compass className="w-4 h-4" /> },
    { id: 'japandi', label: '🌿 ژاپاندی (Japandi)', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'slim_shaker', label: '✨ اسلیم شیکر (Slim Shaker)', icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { id: 'modern_gola', label: '🖤 مدرن گولا (Gola Handleless)', icon: <Box className="w-4 h-4 text-cyan-400" /> },
    { id: 'kitchen_island', label: '🏝️ آشپزخانه جزیره‌دار', icon: <Home className="w-4 h-4 text-sky-400" /> },
    { id: 'neoclassic', label: '👑 نئوکلاسیک و انزو', icon: <Palette className="w-4 h-4 text-indigo-400" /> },
    { id: 'murphy_bed', label: '🛏️ تخت تاشو و اتاق خواب', icon: <Sliders className="w-4 h-4 text-purple-400" /> },
    { id: 'industrial', label: '🏭 صنعتی چوب و فلز', icon: <Tag className="w-4 h-4 text-orange-400" /> },
  ];

  const filteredItems = INSPIRATION_DATABASE.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.titlePersian.includes(searchQuery) ||
      item.titleEnglish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some((t) => t.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Action: Import into Room Planner Studio
  const handleImportToRoomPlanner = (item: InspirationItem) => {
    const roomConfig: Partial<RoomLayoutConfig> = {
      roomType: item.category === 'murphy_bed' ? 'bedroom' : 'kitchen',
      layoutShape: item.params.islandWidthMm ? 'island_layout' : 'l_shape',
      designStyle: item.params.designStyle,
      cabinetHeightType: item.params.cabinetHeightType,
      materialThickness: item.params.materialThickness,
      islandWidthMm: item.params.islandWidthMm || 1800,
      islandDepthMm: item.params.islandDepthMm || 900,
      islandOverhangMm: item.params.islandOverhangMm || 300,
      wall1Length: item.params.recommendedWidthMm,
      ceilingHeight: item.params.recommendedHeightMm
    };

    if (onImportToRoomPlanner) {
      onImportToRoomPlanner(roomConfig);
    }
    onNavigateTab('room_planner');
  };

  // Action: Import into Cabinet Studio
  const handleImportToCabinetStudio = (item: InspirationItem) => {
    const cabParams: Partial<CabinetParams> = {
      name: `${item.titlePersian} (الگو از گالری الهام)`,
      finishColor: item.params.finishColor,
      materialThickness: item.params.materialThickness,
      hingeBrand: item.params.hingeBrand,
      width: 800,
      height: item.category === 'murphy_bed' ? 2200 : 720,
      depth: item.category === 'murphy_bed' ? 500 : 550
    };

    if (onImportToCabinetStudio) {
      onImportToCabinetStudio(cabParams);
    }
    onNavigateTab('cabinet');
  };

  // Action: Save to Custom Model Templates Library
  const handleSaveToModelLibrary = (item: InspirationItem) => {
    saveModelTemplate({
      title: item.titlePersian,
      category: item.category === 'murphy_bed' ? 'bedroom' : 'kitchen',
      description: item.descriptionPersian,
      originalDimensions: {
        wall1Length: item.params.recommendedWidthMm,
        ceilingHeight: item.params.recommendedHeightMm
      },
      tags: item.tags
    });

    setSavedSuccessMessage(`الگوی «${item.titlePersian}» به کتابخانه مدل‌های سفارشی شما اضافه شد.`);
    setTimeout(() => setSavedSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-6 text-right pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/60 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>گالری ایده‌پردازی و ترندهای جدید کابینت ۲۰۲۶ (Pinterest & Houzz)</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              استودیوی الهام‌بخشی و انتخاب سبک طراحی داخلی
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              جدیدترین مدلهای طراحی کابینت، آشپزخانه جزیره‌دار، اسلیم شیکر، ژاپاندی و اتاق خواب‌های کم‌جا را بررسی کنید و تنها با یک کلیک، پارامترها و ابعاد آن را وارد استودیوهای طراحی و تولید ماکروی سالیدورک کنید.
            </p>
          </div>

          {/* Quick Search Input */}
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی سبک، رنگ، جزیره یا کلمه کلیدی..."
              className="w-full pl-3 pr-9 py-2.5 bg-slate-800/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition shadow-inner font-medium"
            />
          </div>
        </div>
      </div>

      {/* Toast Message */}
      {savedSuccessMessage && (
        <div className="p-4 bg-emerald-900/80 border border-emerald-500/50 text-emerald-200 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedSuccessMessage}</span>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-400'
                : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700'
            }`}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Inspiration Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col"
          >
            {/* Visual Card Header & Palette Preview */}
            <div className={`p-6 bg-gradient-to-b ${item.bgGradient} relative overflow-hidden flex flex-col justify-between h-52 border-b border-slate-800`}>
              <div className="flex items-center justify-between z-10">
                <span className="text-[10px] font-bold bg-slate-900/80 backdrop-blur-md text-amber-300 px-2.5 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  {item.sourceName}
                </span>

                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  امتیاز ترند: {item.trendingScore}٪
                </span>
              </div>

              {/* Decorative Geometric Preview Illustration */}
              <div className="my-auto text-center space-y-1 py-2 z-10">
                <h3 className="text-base font-black text-white group-hover:text-amber-300 transition-colors">
                  {item.titlePersian}
                </h3>
                <p className="text-[10px] font-mono text-slate-400 tracking-wider">
                  {item.titleEnglish}
                </p>
              </div>

              {/* Color Swatches */}
              <div className="flex items-center justify-between z-10 pt-2 border-t border-slate-800/60">
                <span className="text-[10px] text-slate-400 font-bold">پالت رنگی:</span>
                <div className="flex items-center gap-1.5">
                  {item.colors.map((c, idx) => (
                    <div
                      key={idx}
                      className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Description & Params Body */}
            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-slate-300 text-xs">
              <p className="leading-relaxed text-slate-300 text-[11px]">
                {item.descriptionPersian}
              </p>

              {/* Specs Badge */}
              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 font-mono text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">ضخامت ورق:</span>
                  <span className="font-bold text-white">{item.params.materialThickness}mm</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">دستگیره:</span>
                  <span className="font-bold text-amber-300 truncate block">{item.params.handleStyle}</span>
                </div>
              </div>

              {/* Tags List */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleImportToRoomPlanner(item)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 text-xs"
                >
                  <Home className="w-4 h-4" />
                  <span>ورود به طراحی هوشمند متراژ (Room Planner)</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleImportToCabinetStudio(item)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 text-[11px]"
                  >
                    <Box className="w-3.5 h-3.5 text-amber-400" />
                    <span>تک یونیت</span>
                  </button>

                  <button
                    onClick={() => handleSaveToModelLibrary(item)}
                    className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl border border-slate-700 transition flex items-center justify-center gap-1 text-[11px]"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                    <span>ذخیره الگو</span>
                  </button>
                </div>

                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-1.5 text-slate-400 hover:text-white text-[10px] flex items-center justify-center gap-1 transition text-center"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>مشاهده نمونه‌های مرتبط در Pinterest / Google</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
