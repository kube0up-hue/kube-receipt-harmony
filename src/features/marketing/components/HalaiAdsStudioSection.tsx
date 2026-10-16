import React, { useState } from "react";
import {
  LayoutGrid,
  ArrowRight,
  Share2,
  Sparkles,
  Upload,
  Play,
  Layers,
  Wand2,
  Check,
  Download,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

interface HalaiAdsStudioSectionProps {
  onBackToStudio: () => void;
  onSendAdToStudio2?: (adPrompt: string) => void;
}

export const HalaiAdsStudioSection: React.FC<HalaiAdsStudioSectionProps> = ({
  onBackToStudio,
  onSendAdToStudio2,
}) => {
  const [packType, setPackType] = useState<"9pack" | "5pack">("9pack");
  const [targetType, setTargetType] = useState<"product" | "service">("product");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [adCategory, setAdCategory] = useState("مشروبات وقهوة");
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productImage, setProductImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPack, setGeneratedPack] = useState<any[]>([]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const demoPack = [
        { id: 1, title: "لقطة استوديو سينمائية", style: "إضاءة نيون فخمة", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=720&q=80" },
        { id: 2, title: "ستايل ستريت الرياض", style: "طريق تركي الأول لايف ستايل", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80" },
        { id: 3, title: "ماكرو قطرات وثلج بلوري", style: "ASMR حسي عالي النقاء", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=720&q=80" },
        { id: 4, title: "كاجوال مكتبي دوامات", style: "طاقة الصباح والتركيز", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=720&q=80" },
        { id: 5, title: "خلفية رخامية فاخرة", style: "عطور ومنتجات راقية", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=720&q=80" },
        { id: 6, title: "صانع محتوى تيك توك UGC", style: "ريلز وسناب شات عفوي", ratio: aspectRatio, img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720" },
        { id: 7, title: "عرض شتوي وجلسة خارجية", style: "موسم الرياض وأجواء البرد", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=720&q=80" },
        { id: 8, title: "بوستر عرض وتخفيضات", style: "كود خصم وتحويل مباشر", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=720&q=80" },
        { id: 9, title: "لقطة نهاية سينمائية مع الشعار", style: "هيبة البراند وثبات المنتج", ratio: aspectRatio, img: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=720&q=80" },
      ];
      setGeneratedPack(demoPack.slice(0, packType === "9pack" ? 9 : 5));
      setIsGenerating(false);
      toast.success("تم توليد باقة الإعلانات بنجاح!");
    }, 2900);
  };

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
            <LayoutGrid className="w-4 h-4 text-[#ff2a4b]" />
            <span>استديو الإعلانات (Ads Studio 9x)</span>
          </h1>
          <span className="hidden md:inline-flex rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
            باقة متكاملة
          </span>
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Right Sidebar (Halai 380px Sidebar with Vertical Demo Video) */}
        <aside className="w-full lg:w-[380px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Top Video Demo Card */}
            <div className="flex items-stretch gap-3 shrink-0">
              <div className="relative w-[116px] shrink-0 aspect-[9/16] rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
                <iframe
                  src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/d18181057f78349d64aca886a540a611/iframe?muted=true&preload=true&loop=true&autoplay=true"
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                  title="Ads Studio Demo"
                />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h2 className="text-xl font-black uppercase text-white leading-tight">
                  استديو <span className="text-[#00e575]">الإعلانات</span>
                </h2>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1">
                  توليد 9 إعلانات تجارية متنوعة لمنتجك بضغطة واحدة لمضاعفة مبيعات متجرك.
                </p>
              </div>
            </div>

            {/* Pack Type: 9 صور قياسي / 5 صور احترافي HD */}
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setPackType("9pack")}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  packType === "9pack" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                <div>٩ صور</div>
                <div className="text-[10px] font-normal opacity-80">قياسي</div>
              </button>
              <button
                type="button"
                onClick={() => setPackType("5pack")}
                className={`py-2 px-2 rounded-lg text-center transition-all ${
                  packType === "5pack" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                <div>٥ صور</div>
                <div className="text-[10px] font-normal opacity-80">احترافي HD</div>
              </button>
            </div>

            {/* Target: منتج / خدمة */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setTargetType("product")}
                className={`py-2 rounded-xl border text-center transition-all ${
                  targetType === "product"
                    ? "bg-white/15 border-white/40 text-white"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                منتج
              </button>
              <button
                type="button"
                onClick={() => setTargetType("service")}
                className={`py-2 rounded-xl border text-center transition-all ${
                  targetType === "service"
                    ? "bg-white/15 border-white/40 text-white"
                    : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                }`}
              >
                خدمة
              </button>
            </div>

            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">اختر الفئة</label>
              <select
                value={adCategory}
                onChange={(e) => setAdCategory(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              >
                {["مشروبات وقهوة", "أغذية ومطاعم", "عطور وتجميل", "أزياء ومجوهرات", "تقنية وإلكترونيات"].map((c) => (
                  <option key={c} value={c} className="bg-zinc-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Aspect Ratio: أشهرها 9:16 */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">المقاس</label>
              <div className="grid grid-cols-5 gap-1">
                {[
                  { id: "9:16", label: "الأشهر 9:16" },
                  { id: "1:1", label: "1:1" },
                  { id: "3:4", label: "3:4" },
                  { id: "4:3", label: "4:3" },
                  { id: "16:9", label: "16:9" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setAspectRatio(item.id)}
                    className={`py-1.5 rounded-xl border text-[10px] transition-all font-mono ${
                      aspectRatio === item.id
                        ? "bg-white text-black font-bold border-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Product Image Dropzone */}
            <label className="border border-dashed border-white/20 hover:border-white/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setProductImage(file.name);
                    toast.success("تم إرفاق صورة المنتج: " + file.name);
                  }
                }}
              />
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-300">
                {productImage ? productImage : "ارفع صورة المنتج (PNG أو JPG شفاف)"}
              </span>
            </label>

            {/* Product Details Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">اسم وتفاصيل المنتج</label>
              <input
                type="text"
                value={productTitle}
                onChange={(e) => setProductTitle(e.target.value)}
                placeholder="مثال: كولد برو كيني مركز KUBE"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none"
              />
            </div>

            {/* Generate CTA Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري توليد باقة الإعلانات...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد باقة الإعلانات</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10">15</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Left Canvas: Generated Campaigns (Halai Parity) */}
        <main className="flex-1 w-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-[#00e575]" />
                <span>حملاتك الإعلانية (Campaign Variations)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                توليد أنماط وزوايا مختلفة ومتطابقة لهوية البراند لتحقيق أعلى معدل نقرات (CTR).
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {generatedPack.length} إعلان
            </span>
          </div>

          {generatedPack.length === 0 ? (
            /* Empty State */
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                <LayoutGrid className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">لا توجد حملات بعد</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  اختر الفئة وارفع صورة المنتج من الشريط الجانبي وسننشئ لك باقة إعلانية متكاملة فوراً.
                </p>
              </div>
            </div>
          ) : (
            /* 9-Pack Variations Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {generatedPack.map((ad) => (
                <div
                  key={ad.id}
                  className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-lg group hover:border-white/20 transition-all"
                >
                  <div className="relative aspect-[9/16] bg-black">
                    <img src={ad.img} alt={ad.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 start-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-[#00e575]">
                      {ad.style}
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <h4 className="text-xs font-bold text-white">{ad.title}</h4>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        onClick={() => toast.success("تم تنزيل الإعلان بدقة عالية")}
                        className="flex-1 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Download className="w-3 h-3" />
                        <span>تحميل</span>
                      </button>
                      {onSendAdToStudio2 && (
                        <button
                          onClick={() => onSendAdToStudio2(ad.title + " " + ad.style)}
                          className="px-2 py-1 rounded-lg bg-[#00e575]/20 hover:bg-[#00e575]/30 text-[#00e575] border border-[#00e575]/30 text-[11px] font-semibold transition-all"
                          title="تحويل إلى فيديو في استديو 2.0"
                        >
                          <Wand2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
