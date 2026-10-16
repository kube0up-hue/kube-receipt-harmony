import React, { useState } from "react";
import {
  Sparkles,
  Image as ImageIcon,
  Upload,
  ArrowRight,
  Sliders,
  Ratio,
  Layers,
  Wand2,
  Share2,
  Download,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { dispatchStudioGeneration } from "@/features/marketing/providers/ai-providers";

interface HalaiImageGenerateSectionProps {
  onBackToStudio: () => void;
  onSendToStudio2?: (prompt: string) => void;
}

const IMAGE_MODELS = [
  { id: "gpt_image_25", name: "جي بي تي إيماج 2.5", badge: "دقة فائقة", cost: 4, provider: "openai" as const },
  { id: "nano_banana_2", name: "نانو بنانا 2", badge: "جديد", cost: 3, provider: "google_vertex" as const },
  { id: "flux_max_2", name: "فلوكس ماكس 2", badge: "واقعية", cost: 3, provider: "fal_ai" as const },
  { id: "seedream_45", name: "سيدريم 4.5", badge: "فني", cost: 2, provider: "fal_ai" as const },
];

const RESOLUTIONS = ["1K", "2K", "4K"];
const ASPECT_RATIOS = [
  { id: "1:1", label: "1:1", ratio: "aspect-square" },
  { id: "9:16", label: "9:16", ratio: "aspect-[9/16]" },
  { id: "16:9", label: "16:9", ratio: "aspect-[16/9]" },
  { id: "4:3", label: "4:3", ratio: "aspect-[4/3]" },
  { id: "3:4", label: "3:4", ratio: "aspect-[3/4]" },
];

const SAMPLE_GENERATED_GALLERY = [
  {
    id: "g1",
    prompt: "كوب فلات وايت مع رسمة بجعة احترافية ورغوة مخملية على طاولة رخامية دافئة في مقهى بالرياض 4K",
    model: "نانو بنانا 2",
    ratio: "1:1",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
  {
    id: "g2",
    prompt: "كولد برو مثلج مع مكعبات ثلج بلورية وقطرات ندى متكاثفة على الزجاج وإضاءة شمس ذهبية",
    model: "جي بي تي إيماج 2.5",
    ratio: "3:4",
    img: "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
  {
    id: "g3",
    prompt: "كرواسون لوز فرنسي مقرمش محشو بكريمة اللوز مع سكر ناعم وإضاءة استوديو تجارية ناعمة",
    model: "فلوكس ماكس 2",
    ratio: "1:1",
    img: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
  {
    id: "g4",
    prompt: "تغليف كيس قهوة مختصة KUBE أسود مطفي مع لمسات حمراء أنيقة وحبات بن مبعثرة حوله",
    model: "نانو بنانا 2",
    ratio: "3:4",
    img: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
  {
    id: "g5",
    prompt: "شاب سعودي أنيق في مقهى راقي بطريق تركي الأول يحمل كوب قهوة KUBE مع خلفية ضبابية",
    model: "جي بي تي إيماج 2.5",
    ratio: "1:1",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
  {
    id: "g6",
    prompt: "أجواء مقهى KUBE المودرن مع إضاءة دافئة وبار القهوة المتطور وتصميم مينيماليست",
    model: "سيدريم 4.5",
    ratio: "16:9",
    img: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=720&q=80",
    isSample: true,
  },
];

export const HalaiImageGenerateSection: React.FC<HalaiImageGenerateSectionProps> = ({
  onBackToStudio,
  onSendToStudio2,
}) => {
  const [selectedModel, setSelectedModel] = useState("gpt_image_25");
  const [resolution, setResolution] = useState("1K");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [batchCount, setBatchCount] = useState(1);
  const [prompt, setPrompt] = useState("");
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [gallery, setGallery] = useState(SAMPLE_GENERATED_GALLERY);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeModelObj = IMAGE_MODELS.find((m) => m.id === selectedModel) || IMAGE_MODELS[0];
  const totalCost = activeModelObj.cost * batchCount;

  // Real, genuine generation with strict verification - NO FAKE SUCCESS
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("يرجى كتابة وصف للصورة المراد توليدها أولاً");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await dispatchStudioGeneration({
        task: "image_packshot_4k",
        provider: activeModelObj.provider,
        prompt: prompt.trim(),
        aspectRatio: (aspectRatio as any) || "1:1",
        resolution: resolution === "4K" ? "4K" : "1080p",
      });

      if (res.success && res.outputUrl) {
        const newCard = {
          id: "g_" + Date.now(),
          prompt: prompt.trim(),
          model: activeModelObj.name,
          ratio: aspectRatio,
          img: res.outputUrl,
          isSample: false,
        };
        setGallery([newCard, ...gallery]);
        toast.success(`تم توليد الصورة بنجاح بواسطة ${res.providerUsed || activeModelObj.name}`);
      } else {
        // Truthful, informative error message explaining the real status
        if (res.errorType === "BALANCE") {
          toast.error(`تنبيه الرصيد: ${res.errorMessage || "رصيد هذا النموذج مستنفد. يرجى شحن الرصيد في لوحة التحكم."}`, {
            duration: 7000,
          });
        } else if (res.errorType === "QUOTA") {
          toast.error(`تنبيه الحصة: ${res.errorMessage || "تم تجاوز حصة الاستخدام المتاحة لهذا النموذج (429)."}`, {
            duration: 7000,
          });
        } else if (res.errorType === "AUTH") {
          toast.error(`خطأ في المفتاح: ${res.errorMessage || "مفتاح API غير صالح أو غير مصرح به (401/403)."}`);
        } else {
          toast.error(res.errorMessage || "فشل الاتصال بمحرك التوليد. يرجى التحقق من مفاتيح API في الإعدادات.");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير متوقع أثناء معالجة طلب التوليد");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = async (imgUrl: string, itemPrompt: string) => {
    try {
      toast.info("جاري تحميل الصورة بدقة عالية...");
      const res = await fetch(imgUrl);
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `kube-ai-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success("تم تنزيل الصورة بنجاح!");
    } catch {
      // Fallback direct download
      const a = document.createElement("a");
      a.href = imgUrl;
      a.target = "_blank";
      a.download = `kube-ai-image-${Date.now()}.png`;
      a.click();
    }
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("تم نسخ البرومبت بنجاح");
    setTimeout(() => setCopiedId(null), 2000);
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
            <ImageIcon className="w-4 h-4 text-[#ff2a4b]" />
            <span>توليد الصور بالذكاء الاصطناعي (AI Image Generator)</span>
          </h1>
          <span className="hidden md:inline-flex rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
            {activeModelObj.name}
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

      {/* Main Workspace: Masonry Image Gallery */}
      <div className="flex-1 pb-44 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {gallery.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/60 shadow-xl transition-all hover:border-white/20 hover:scale-[1.01]"
            >
              <img
                src={item.img}
                alt={item.prompt}
                className="w-full h-auto object-cover min-h-[260px] max-h-[420px]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-[#00e575] border border-white/10">
                    {item.model}
                  </span>
                  <span className="rounded-md bg-black/60 backdrop-blur-md px-2 py-1 text-[10px] font-mono text-zinc-300 border border-white/10">
                    {item.ratio}
                  </span>
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-white line-clamp-3 leading-relaxed font-medium">
                    {item.prompt}
                  </p>
                  <div className="flex items-center gap-1.5 pt-1">
                    <button
                      onClick={() => handleCopyPrompt(item.prompt, item.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold border border-white/15 transition-all"
                      title="نسخ نص البرومبت"
                    >
                      {copiedId === item.id ? <Check className="w-3 h-3 text-[#00e575]" /> : <Copy className="w-3 h-3" />}
                      <span>نسخ</span>
                    </button>
                    <button
                      onClick={() => handleDownloadImage(item.img, item.prompt)}
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/15 text-[11px] font-semibold transition-all"
                      title="تنزيل الصورة بدقة كاملة"
                    >
                      <Download className="w-3 h-3 text-[#00e575]" />
                      <span>تحميل</span>
                    </button>
                    {onSendToStudio2 && (
                      <button
                        onClick={() => onSendToStudio2(item.prompt)}
                        className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#ff2a4b]/20 hover:bg-[#ff2a4b]/30 text-[#ff3b56] border border-[#ff2a4b]/30 text-[11px] font-semibold transition-all"
                        title="تحويل إلى فيديو في استديو 2.0"
                      >
                        <Wand2 className="w-3 h-3" />
                        <span>فيديو</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Generation Dock (100% Halai AI Parity) */}
      <div className="fixed bottom-4 inset-x-4 sm:inset-x-8 max-w-4xl mx-auto z-40 animate-in slide-in-from-bottom-4 duration-300">
        <div className="relative rounded-2xl md:rounded-3xl bg-[#18191c]/98 border border-white/15 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.95)] p-3 sm:p-4 space-y-3">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
            {/* Model Selector Pill */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              {IMAGE_MODELS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all text-xs whitespace-nowrap ${
                    selectedModel === m.id
                      ? "bg-white text-black shadow-sm font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>

            {/* Quality Pill */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              {RESOLUTIONS.map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                    resolution === res ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {res}
                </button>
              ))}
            </div>

            {/* Aspect Ratio Pill */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              {ASPECT_RATIOS.map((ar) => (
                <button
                  key={ar.id}
                  onClick={() => setAspectRatio(ar.id)}
                  className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                    aspectRatio === ar.id ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {ar.label}
                </button>
              ))}
            </div>

            {/* Batch Count */}
            <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
              {[1, 2, 4].map((count) => (
                <button
                  key={count}
                  onClick={() => setBatchCount(count)}
                  className={`px-2 py-1 rounded-lg font-semibold transition-all text-xs ${
                    batchCount === count ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {count}×
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input & Reference Upload */}
          <div className="flex items-center gap-2">
            {/* Image Upload Dropzone */}
            <label
              className={`w-11 h-11 shrink-0 rounded-2xl border flex items-center justify-center cursor-pointer transition-all ${
                referenceImage
                  ? "border-[#00e575] bg-[#00e575]/10 text-[#00e575]"
                  : "border-white/15 bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
              }`}
              title="إرفاق صورة مرجعية أو منتج"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = () => setReferenceImage(reader.result as string);
                    reader.readAsDataURL(file);
                    toast.success("تم إرفاق الصورة المرجعية");
                  }
                }}
              />
              <Upload className="w-5 h-5" />
            </label>

            {/* Textarea */}
            <div className="relative flex-1">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
                placeholder="صف المشهد الذي تتخيله... (مثال: كوب فلات وايت KUBE مع رغوة مخملية ورخام داكن 4K)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-white/30 transition-colors"
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="h-11 px-5 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shrink-0 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>توليد...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد</span>
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-black/10">
                    {totalCost}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
