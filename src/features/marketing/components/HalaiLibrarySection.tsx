import React, { useState } from "react";
import {
  Layers,
  Image as ImageIcon,
  Film,
  Grid,
  Volume2,
  Camera,
  Users,
  Bot,
  Sparkles,
  Wand2,
  Heart,
  Radio,
  FileText,
  Share2,
  ArrowRight,
  FolderOpen,
} from "lucide-react";
import { toast } from "sonner";

interface HalaiLibrarySectionProps {
  onBackToStudio: () => void;
  onStartCreation: () => void;
}

const LIBRARY_CATEGORIES = [
  { id: "all", name: "الكل", icon: Layers },
  { id: "photos", name: "صور", icon: ImageIcon },
  { id: "videos", name: "فيديو", icon: Film },
  { id: "apps", name: "تطبيقات", icon: Grid },
  { id: "audio", name: "صوتيات", icon: Volume2 },
  { id: "ads_studio", name: "استديو الإعلانات", icon: Grid },
  { id: "product_studio", name: "استديو المنتجات", icon: Camera },
  { id: "ugc_studio", name: "استديو UGC", icon: Users },
  { id: "characters", name: "الشخصيات", icon: Bot },
  { id: "marketing_studio", name: "استديو التسويق", icon: Sparkles },
  { id: "marketing_studio_2", name: "استديو التسويق 2.0", icon: Wand2 },
  { id: "shots", name: "لقطات", icon: Camera },
  { id: "favorites", name: "المفضلة", icon: Heart },
  { id: "mcp", name: "MCP", icon: Radio },
  { id: "references", name: "المراجع", icon: FileText },
  { id: "published", name: "المنشورة", icon: Share2 },
];

export const HalaiLibrarySection: React.FC<HalaiLibrarySectionProps> = ({
  onBackToStudio,
  onStartCreation,
}) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const activeCategoryObj =
    LIBRARY_CATEGORIES.find((c) => c.id === activeCategory) || LIBRARY_CATEGORIES[0];

  return (
    <div className="flex flex-col relative flex-1 min-h-[calc(100vh-4rem)] bg-[#141416] text-white" dir="rtl">
      {/* Top Breadcrumb Bar */}
      <div className="sticky top-14 md:top-16 z-30 backdrop-blur-md bg-[#18191c]/95 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 active:scale-95 transition-all"
          >
            <ArrowRight className="w-4 h-4 text-[#00e575]" />
            <span>العودة إلى استديو 2.0</span>
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#ff2a4b]" />
            <span>مكتبة الأصول (Asset Library)</span>
          </h1>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("تم نسخ رابط الصفحة المباشر");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">مشاركة</span>
        </button>
      </div>

      {/* Main Workspace Layout (Halai 220px Sidebar on Right) */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Right Sidebar: Categories Menu */}
        <aside className="w-full lg:w-[220px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-2 space-y-1 overflow-y-auto no-scrollbar">
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <h2 className="text-xs font-bold text-white">مكتبة الأصول</h2>
            </div>
            {LIBRARY_CATEGORIES.map((cat) => {
              const IconComponent = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex h-8 items-center gap-2 px-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-white/15 text-white font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-[#00e575]" : "text-zinc-500"}`} />
                  <span className="truncate">{cat.name}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Left Canvas: Assets Showcase or Empty State */}
        <main className="flex-1 w-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>{activeCategoryObj.name}</span>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">0 عنصر</span>
          </div>

          {/* Empty State matching Halai */}
          <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white">المكتبة فارغة</h3>
              <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                لم يتم حفظ أي أصول في تصنيف "{activeCategoryObj.name}" بعد. ابدأ بتوليد الصور أو الفيديوهات وستظهر هنا تلقائياً.
              </p>
            </div>
            <button
              onClick={onStartCreation}
              className="px-6 py-2.5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all active:scale-95 shadow-lg flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>ابدأ الإبداع</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};
