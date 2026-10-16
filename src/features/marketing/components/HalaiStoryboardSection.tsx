import React, { useState } from "react";
import {
  Clapperboard,
  ArrowRight,
  Share2,
  Sparkles,
  Upload,
  Play,
  Copy,
  Check,
  Film,
  Camera,
  Layers,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";

interface HalaiStoryboardSectionProps {
  onBackToStudio: () => void;
  onSendSceneToStudio2?: (scenePrompt: string) => void;
}

export const HalaiStoryboardSection: React.FC<HalaiStoryboardSectionProps> = ({
  onBackToStudio,
  onSendSceneToStudio2,
}) => {
  const [mode, setMode] = useState<"storyboard" | "character">("storyboard");
  const [sceneCount, setSceneCount] = useState(4);
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [storyPrompt, setStoryPrompt] = useState("");
  const [referenceImg, setReferenceImg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScenes, setGeneratedScenes] = useState<any[]>([]);

  const handleGenerate = () => {
    if (!storyPrompt.trim()) {
      toast.error("يرجى كتابة وصف القصة أو الإعلان");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const demoScenes = [
        {
          index: 1,
          title: "المشهد 1: الخطاف (The Hook)",
          timing: "00:00 - 00:03",
          angle: "لقطة ماكرو مقربة 85mm",
          prompt: "سقوط قطرات القهوة وتطاير رذاذ الكريما مع صوت تحميص منعش يجذب انتباه المشاهد فوراً",
          img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=720&q=80",
        },
        {
          index: 2,
          title: "المشهد 2: الحاجة والحل (Need & Solution)",
          timing: "00:03 - 00:07",
          angle: "لقطة تتبع متوسطة POV",
          prompt: "شاب سعودي يدخل كافيه KUBE بحثاً عن التركيز والروقان قبل بدء الدوام أو المذاكرة",
          img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80",
        },
        {
          index: 3,
          title: "المشهد 3: الصنعة والإتقان (Craftsmanship)",
          timing: "00:07 - 00:11",
          angle: "حركة كاميرا دائرية 60fps",
          prompt: "الباريستا يرسم لوحة التيوليب المخملية بدقة مع سكب الحليب المبخر في كوب KUBE الأسود",
          img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=720&q=80",
        },
        {
          index: 4,
          title: "المشهد 4: الدعوة للعمل (Call To Action)",
          timing: "00:11 - 00:15",
          angle: "لقطة استوديو ثابتة مع إضاءة نيون",
          prompt: "ظهور شعار كافيه KUBE UP مع عبارة 'قهوتك اليوم من KUBE' ورمز كود الخصم",
          img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=720&q=80",
        },
      ];
      setGeneratedScenes(demoScenes.slice(0, sceneCount));
      setIsGenerating(false);
      toast.success("تم ابتكار وتوليد مشاهد الستوري بورد بنجاح!");
    }, 2800);
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
            <Clapperboard className="w-4 h-4 text-[#ff2a4b]" />
            <span>ستوري بورد (Storyboard Studio)</span>
          </h1>
          <span className="hidden md:inline-flex rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
            {sceneCount} مشاهد
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
        {/* Right Sidebar (Halai 380px Sidebar with Cloudflare Video) */}
        <aside className="w-full lg:w-[380px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Top Video Demo Card */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black aspect-[4/3] shrink-0">
              <iframe
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c43e443131757e6b7f81f374a372b878/iframe?muted=true&preload=true&loop=true&autoplay=true"
                className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                title="Storyboard demo"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent pointer-events-none" />
              <div className="absolute inset-x-0 bottom-0 p-4 text-start">
                <h2 className="text-[1.8rem] font-black uppercase tracking-tighter leading-tight">
                  <span className="text-[#00e575]">ستوري</span> <span className="text-white">بورد</span>
                </h2>
                <p className="text-zinc-300/90 text-xs font-medium leading-relaxed mt-1">
                  حوّل أي فكرة إلى ستوري بورد سينمائي متعدد المشاهد لحملات كافيه KUBE.
                </p>
              </div>
            </div>

            {/* Mode: ستوري بورد / شخصية */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">الوضع</label>
              <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setMode("storyboard")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "storyboard" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  ستوري بورد
                </button>
                <button
                  type="button"
                  onClick={() => setMode("character")}
                  className={`py-2 rounded-lg transition-all ${
                    mode === "character" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  شخصية
                </button>
              </div>
            </div>

            {/* Scene Count Buttons: 4 to 12 */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400">عدد المشاهد</label>
              <div className="grid grid-cols-5 gap-1">
                {[4, 5, 6, 8, 10].map((num) => (
                  <button
                    key={num}
                    onClick={() => setSceneCount(num)}
                    className={`py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                      sceneCount === num
                        ? "bg-[#00e575] text-black border-[#00e575] shadow-sm"
                        : "bg-white/5 border-white/10 text-zinc-300 hover:text-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratio Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400">أبعاد المشهد</label>
              <div className="grid grid-cols-5 gap-1">
                {["1:1", "4:3", "3:4", "16:9", "9:16"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setAspectRatio(r)}
                    className={`py-1.5 rounded-xl border text-[11px] font-mono transition-all ${
                      aspectRatio === r
                        ? "bg-white text-black font-bold border-white"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Image Dropzone */}
            <label className="border border-dashed border-white/20 hover:border-white/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReferenceImg(file.name);
                    toast.success("تم إرفاق صورة النمط أو المنتج: " + file.name);
                  }
                }}
              />
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-300">
                {referenceImg ? referenceImg : "صورة مرجعية للستايل أو المنتج"}
              </span>
            </label>

            {/* Prompt Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">قصة الإعلان</label>
              <textarea
                value={storyPrompt}
                onChange={(e) => setStoryPrompt(e.target.value)}
                rows={3}
                placeholder="صف القصة التي تريد تحويلها إلى ستوري بورد…"
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 resize-none transition-colors"
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
                  <span>جاري بناء السيناريو والمشاهد...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد ستوري بورد</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10">8</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Left Canvas: Storyboard Timeline (Halai Canvas Architecture) */}
        <main className="flex-1 w-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Clapperboard className="w-4 h-4 text-[#ff2a4b]" />
                <span>لوحة مشاهد الستوري بورد</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                توزيع لقطات الفيلم الإعلاني مع زوايا الكاميرا وحركات الحركة ونصوص البرومبت الجاهزة للتوليد.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {generatedScenes.length} مشاهد جاهزة
            </span>
          </div>

          {generatedScenes.length === 0 ? (
            /* Empty State */
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                <Clapperboard className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">لا يوجد ستوري بورد بعد</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  أنشئ ستوري بورد جديد من الشريط الجانبي وسيعرض هنا مقسماً إلى مشاهد درامية متسلسلة.
                </p>
              </div>
              <button
                onClick={() => {
                  setStoryPrompt("إعلان سينمائي 15 ثانية لمشروب كولد برو كيني مركز في مقهى KUBE بالرياض");
                  toast.info("تمت تعبئة فكرة قصة تجريبية، اضغط توليد ستوري بورد");
                }}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 transition-all"
              >
                💡 تجربة قصة إعلان مقهى جاهزة
              </button>
            </div>
          ) : (
            /* Storyboard Scenes Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
              {generatedScenes.map((sc) => (
                <div
                  key={sc.index}
                  className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden shadow-lg p-4 space-y-3"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black">
                    <img src={sc.img} alt={sc.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 start-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-[#00e575] font-mono">
                      {sc.timing}
                    </span>
                    <span className="absolute bottom-2 end-2 text-[10px] font-medium px-2 py-0.5 rounded bg-black/70 text-zinc-300">
                      {sc.angle}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{sc.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed mt-1">{sc.prompt}</p>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(sc.prompt);
                        toast.success("تم نسخ برومبت المشهد");
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                    >
                      <Copy className="w-3 h-3" />
                      <span>نسخ</span>
                    </button>
                    {onSendSceneToStudio2 && (
                      <button
                        onClick={() => onSendSceneToStudio2(sc.prompt)}
                        className="flex-1 py-1.5 rounded-lg bg-[#00e575]/20 hover:bg-[#00e575]/30 text-[#00e575] border border-[#00e575]/30 text-xs font-semibold flex items-center justify-center gap-1 transition-all"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>توليد المشهد</span>
                      </button>
                    )}
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
