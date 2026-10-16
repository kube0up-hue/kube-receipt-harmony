import React, { useState } from "react";
import {
  Video,
  Upload,
  ArrowRight,
  Share2,
  Sparkles,
  Play,
  Volume2,
  VolumeX,
  Sliders,
  Maximize2,
  Download,
  Copy,
  Check,
  Zap,
  Folder,
  ArrowLeftRight,
  ChevronDown,
  ChevronLeft,
  HelpCircle,
  Film,
  Image as ImageIcon,
  Clock,
  Gem,
} from "lucide-react";
import { toast } from "sonner";
import { dispatchStudioGeneration } from "@/features/marketing/providers/ai-providers";

interface HalaiVideoGenerateSectionProps {
  onBackToStudio: () => void;
  onSendToStudio2?: (prompt: string) => void;
}

const VIDEO_MODELS = [
  {
    id: "seedance_25",
    name: "سي دانس 2.5",
    badge: "جديد",
    cost: 30,
    desc: "فيديو سينمائي حتى 30 ثانية بصوت أصلي، مع مراجع صور وفيديو وصوت",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720",
    provider: "volcano_bytedance" as const,
  },
  {
    id: "omni_flash_11",
    name: "أومني فلاش 1.1",
    badge: "جديد",
    cost: 28,
    desc: "فيديو بصوت متزامن حتى دقة 4K — نص وصورة ومراجع وتعديل فيديو",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
    provider: "google_vertex" as const,
  },
  {
    id: "seedance_20",
    name: "سي دانس 2.0",
    badge: "الأشهر",
    cost: 26,
    desc: "أقوى نموذج سينمائي مع صوت طبيعي وفيزياء واقعية لانسكاب المشروبات",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720",
    provider: "volcano_bytedance" as const,
  },
  {
    id: "veo_31",
    name: "فيو 3.1 برو",
    badge: "سينمائي 4K",
    cost: 35,
    desc: "محرك جوجل الفائق لإنتاج الإعلانات التجارية السينمائية بدقة 4K وحركة واقعية",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
    provider: "google_vertex" as const,
  },
  {
    id: "kling_3",
    name: "كلينج 3.0 تيربو",
    badge: "حركة سريعة",
    cost: 30,
    desc: "توليد حركة ديناميكية سلسة 60fps لسوائل القهوة وشخصيات البراند بدون أي تشوه",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
    provider: "kling_ai" as const,
  },
];

export const HalaiVideoGenerateSection: React.FC<HalaiVideoGenerateSectionProps> = ({
  onBackToStudio,
}) => {
  const [selectedModel, setSelectedModel] = useState("seedance_25");
  const [mode, setMode] = useState<"standard" | "references">("standard");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [duration, setDuration] = useState("8s");
  const [resolution, setResolution] = useState("720p");
  const [hasAudio, setHasAudio] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [firstFrame, setFirstFrame] = useState<string | null>(null);
  const [lastFrame, setLastFrame] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

  const activeModel = VIDEO_MODELS.find((m) => m.id === selectedModel) || VIDEO_MODELS[0];

  // Swap first frame and last frame
  const handleSwapFrames = () => {
    const temp = firstFrame;
    setFirstFrame(lastFrame);
    setLastFrame(temp);
    toast.success("تم تبديل الإطار الأول والأخير");
  };

  // Truthful Generation Call with Real Error Reporting (NO FAKE SUCCESS)
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("يرجى كتابة وصف المشهد بالتفصيل أو استخدام إطار مرجعي");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await dispatchStudioGeneration({
        task: "video_ugc_motion",
        provider: activeModel.provider,
        prompt: prompt.trim(),
        aspectRatio: (aspectRatio as any) || "9:16",
        resolution: resolution === "1080p" ? "1080p" : "720p",
        durationSeconds: parseInt(duration) || 8,
      });

      if (res.success && res.outputUrl) {
        const newVideo = {
          id: "v_" + Date.now(),
          prompt: prompt.trim(),
          model: activeModel.name,
          ratio: aspectRatio,
          duration: duration,
          thumb: res.outputUrl,
          videoUrl: res.outputUrl,
          created: "الآن",
        };
        setVideos([newVideo, ...videos]);
        toast.success(`تم توليد الفيديو بنجاح بواسطة ${res.providerUsed || activeModel.name}`);
      } else {
        // Truthful, clear Arabic error explaining why the model could not generate
        if (res.errorType === "BALANCE") {
          toast.error(
            `تنبيه الرصيد: ${res.errorMessage || "رصيد هذا النموذج مستنفد. يرجى شحن الرصيد في لوحة التحكم لتفعيل الريندر."}`,
            { duration: 7000 }
          );
        } else if (res.errorType === "QUOTA") {
          toast.error(
            `تنبيه الحصة: ${res.errorMessage || "تم تجاوز حصة الطلبات المتاحة لموديل الفيديو حالياً (429)."}`,
            { duration: 7000 }
          );
        } else if (res.errorType === "AUTH") {
          toast.error(`خطأ في المفتاح: ${res.errorMessage || "مفتاح API غير صالح أو غير مصرح به."}`);
        } else {
          toast.error(
            res.errorMessage ||
              `يتطلب توليد مقاطع الفيديو عبر ${activeModel.name} تفعيل خادم معالجة الريندر وشحن الرصيد. لم يتم التوليد الوهمي حفاظاً على الدقة.`
          );
        }
      }
    } catch (err: any) {
      toast.error(err.message || "حدث خطأ غير متوقع أثناء معالجة طلب الفيديو");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadVideo = async (videoUrl: string, videoPrompt: string) => {
    try {
      toast.info("جاري تجهيز وتنزيل الفيديو...");
      const a = document.createElement("a");
      a.href = videoUrl;
      a.download = `kube-video-${Date.now()}.mp4`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("تم بدء تنزيل الفيديو");
    } catch {
      window.open(videoUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col relative flex-1 min-h-[calc(100vh-4rem)] bg-[#0d0e10] text-white" dir="rtl">
      {/* Top Breadcrumb Bar */}
      <div className="sticky top-14 md:top-16 z-30 backdrop-blur-md bg-[#141416]/95 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
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
            <Video className="w-4 h-4 text-[#00e575]" />
            <span>توليد الفيديو بالذكاء الاصطناعي (AI Video Generator)</span>
          </h1>
          <span className="hidden md:inline-flex rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
            {activeModel.name}
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

      {/* Main Workspace Layout (Halai Sticky Control Deck on Right, Generation Canvas on Left) */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-4 p-3 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Right Sidebar Control Deck (100% Halai AI Parity) */}
        <aside className="w-full lg:w-[340px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-7rem)]">
          <div className="flex flex-col h-full bg-[#141416] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-3.5 space-y-3.5 overflow-y-auto no-scrollbar">
            
            {/* 1. Model Card Banner with Dragon & Green Signal */}
            <div className="relative aspect-[2.1] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black group">
              <img
                src={activeModel.thumb}
                alt={activeModel.name}
                className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
              
              {/* Question Help Icon Top Left */}
              <button
                type="button"
                className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-zinc-300 hover:text-white"
                title="معلومات النموذج"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              {/* Banner Caption Bottom */}
              <div className="absolute inset-x-0 bottom-0 p-3 text-right">
                <div className="flex items-center gap-1.5">
                  {/* Green Sound / Signal Bars */}
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 h-1.5 bg-[#00e575] rounded-full" />
                    <span className="w-0.5 h-3 bg-[#00e575] rounded-full" />
                    <span className="w-0.5 h-2 bg-[#00e575] rounded-full" />
                  </span>
                  <h3 className="text-sm font-bold text-white">{activeModel.name}</h3>
                </div>
                <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">
                  {activeModel.desc}
                </p>
              </div>
            </div>

            {/* 2. Mode Tabs: [قياسي] & [مراجع] */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode("standard")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  mode === "standard"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Film className="w-3.5 h-3.5" />
                <span>قياسي</span>
              </button>
              <button
                type="button"
                onClick={() => setMode("references")}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl transition-all ${
                  mode === "references"
                    ? "bg-white text-black shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>مراجع</span>
              </button>
            </div>

            {/* 3. Dual Frame Upload Boxes (First Frame & Last Frame with Swap Icon ⇄) */}
            <div className="relative grid grid-cols-2 gap-2">
              {/* Right Box: الإطار الأول */}
              <div className="relative aspect-square rounded-2xl border border-white/10 bg-white/5 p-2 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-start">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-medium">
                    اختياري
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 my-auto text-center">
                  {firstFrame ? (
                    <img src={firstFrame} alt="الإطار الأول" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-zinc-500" />
                      <span className="text-[11px] text-zinc-300 font-medium">الإطار الأول</span>
                    </>
                  )}
                </div>
                {/* Action Buttons: Folder + Upload */}
                <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => toast.info("استعراض المكتبة")}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                    title="المكتبة"
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                  <label className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer" title="رفع ملف">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setFirstFrame(reader.result as string);
                          reader.readAsDataURL(file);
                          toast.success("تم اختيار الإطار الأول");
                        }
                      }}
                    />
                    <Upload className="w-3.5 h-3.5" />
                  </label>
                </div>
              </div>

              {/* Middle Floating Swap Button ⇄ */}
              <button
                type="button"
                onClick={handleSwapFrames}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/80 hover:bg-black border border-white/20 hover:border-white/40 flex items-center justify-center text-zinc-300 hover:text-white shadow-xl active:scale-95 transition-all"
                title="تبديل الإطار الأول والأخير"
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>

              {/* Left Box: الإطار الأخير */}
              <div className="relative aspect-square rounded-2xl border border-white/10 bg-white/5 p-2 flex flex-col justify-between hover:border-white/20 transition-all">
                <div className="flex items-center justify-start">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 font-medium">
                    اختياري
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center gap-1 my-auto text-center">
                  {lastFrame ? (
                    <img src={lastFrame} alt="الإطار الأخير" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                  ) : (
                    <>
                      <ImageIcon className="w-6 h-6 text-zinc-500" />
                      <span className="text-[11px] text-zinc-300 font-medium">الإطار الأخير</span>
                    </>
                  )}
                </div>
                {/* Action Buttons: Folder + Upload */}
                <div className="flex items-center justify-center gap-2 pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => toast.info("استعراض المكتبة")}
                    className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white"
                    title="المكتبة"
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                  <label className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white cursor-pointer" title="رفع ملف">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => setLastFrame(reader.result as string);
                          reader.readAsDataURL(file);
                          toast.success("تم اختيار الإطار الأخير");
                        }
                      }}
                    />
                    <Upload className="w-3.5 h-3.5" />
                  </label>
                </div>
              </div>
            </div>

            {/* 4. Prompt Textarea with Expand Icon ⤢ */}
            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2.5 focus-within:border-white/30 transition-all">
              <button
                type="button"
                onClick={() => toast.info("تكبير نافذة الوصف")}
                className="absolute top-2 left-2 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
                title="تكبير"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="صف مشهدك بالتفصيل. استخدم @ للإشارة إلى الوسائط"
                className="w-full bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none resize-none pt-4 pe-2"
              />
            </div>

            {/* 5. Collapsible: إعدادات إضافية */}
            <div className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                  <span>إعدادات إضافية</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showAdvanced ? "rotate-180" : ""}`} />
              </button>

              {showAdvanced && (
                <div className="p-3 pt-1 space-y-3 border-t border-white/5 text-xs">
                  {/* Sound Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">الصوت المتزامن:</span>
                    <button
                      type="button"
                      onClick={() => setHasAudio(!hasAudio)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] ${
                        hasAudio ? "bg-[#00e575]/20 border-[#00e575]/40 text-[#00e575]" : "bg-white/5 border-white/10 text-zinc-400"
                      }`}
                    >
                      {hasAudio ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                      <span>{hasAudio ? "مفعّل" : "معطّل"}</span>
                    </button>
                  </div>
                  {/* Aspect Ratio in Advanced */}
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-400">النسبة:</span>
                    <div className="flex gap-1">
                      {["9:16", "16:9", "1:1"].map((r) => (
                        <button
                          key={r}
                          onClick={() => setAspectRatio(r)}
                          className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                            aspectRatio === r ? "bg-white text-black font-bold" : "bg-white/5 text-zinc-400"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 6. Model Selection Row: [الموديل: سي دانس 2.5] */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="w-full p-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400 font-medium">الموديل</span>
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-end gap-0.5 h-3">
                      <span className="w-0.5 h-1 bg-[#00e575] rounded-full" />
                      <span className="w-0.5 h-2.5 bg-[#00e575] rounded-full" />
                      <span className="w-0.5 h-1.5 bg-[#00e575] rounded-full" />
                    </span>
                    <span className="text-xs font-bold text-white">{activeModel.name}</span>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 text-zinc-400" />
              </button>

              {showModelPicker && (
                <div className="absolute bottom-full mb-2 inset-x-0 bg-[#18191c] border border-white/15 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                  {VIDEO_MODELS.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setShowModelPicker(false);
                      }}
                      className={`w-full p-2 rounded-xl flex items-center justify-between text-xs transition-all ${
                        selectedModel === m.id ? "bg-white/10 text-white font-bold" : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <span>{m.name}</span>
                      <span className="text-[10px] text-[#00e575] font-mono">{m.cost} نقطة</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 7. Bottom Docked Controls: [720p] [9:16] [8s] + Generate Button */}
            <div className="pt-1">
              <div className="flex items-center justify-between gap-1.5 p-1 rounded-2xl bg-white/5 border border-white/10 text-xs mb-2">
                {/* Resolution Pill with Gem Icon */}
                <button
                  type="button"
                  onClick={() => setResolution(resolution === "720p" ? "1080p" : "720p")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-zinc-300 font-mono text-[11px]"
                >
                  <Gem className="w-3 h-3 text-[#00e575]" />
                  <span>{resolution}</span>
                </button>
                {/* Ratio Pill */}
                <button
                  type="button"
                  onClick={() => setAspectRatio(aspectRatio === "9:16" ? "16:9" : "9:16")}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-zinc-300 font-mono text-[11px]"
                >
                  <span>{aspectRatio}</span>
                </button>
                {/* Duration Pill with Clock */}
                <button
                  type="button"
                  onClick={() => setDuration(duration === "8s" ? "15s" : "8s")}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-white/10 text-zinc-300 font-mono text-[11px]"
                >
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{duration}</span>
                </button>
              </div>

              {/* Generate Button */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>جاري معالجة الفيديو...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>توليد الفيديو</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10">
                      {activeModel.cost}
                    </span>
                  </>
                )}
              </button>
            </div>

          </div>
        </aside>

        {/* Left Canvas: Generated Videos & Feed (100% Matching "مقاطعك" from Halai) */}
        <main className="flex-1 w-full bg-[#141416] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[560px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>مقاطعك</span>
              <button type="button" className="text-zinc-500 hover:text-zinc-300">
                <HelpCircle className="w-4 h-4" />
              </button>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {videos.length} مقطع
            </span>
          </div>

          {videos.length === 0 ? (
            /* Empty State 100% Matching Halai */
            <div className="py-24 flex flex-col items-center justify-center text-center space-y-4">
              {/* Stacked camera illustration */}
              <div className="relative w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-2xl">
                <div className="absolute inset-1 rounded-2xl bg-white/[0.03] -rotate-6" />
                <Video className="w-9 h-9 text-zinc-400 relative z-10" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-sm font-bold text-white">لا توجد فيديوهات بعد</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  ابدأ بتوليد أو استيراد أول أصل لك ليظهر هنا
                </p>
              </div>

              {/* Sample Prompts */}
              <div className="pt-4 flex flex-wrap gap-2 justify-center max-w-md">
                {[
                  "سكب بطيء لقهوة V60 مع تصاعد البخار وإضاءة دافئة 4K",
                  "انسياب مكعب ثلج نحتي في كأس كولد برو كيني مركز 60fps",
                  "شاب سعودي يستمتع بكوب فلات وايت في كافيه KUBE بالرياض",
                ].map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPrompt(s)}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-zinc-300 transition-all text-start"
                  >
                    💡 {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Videos Feed */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {videos.map((vid) => (
                <div
                  key={vid.id}
                  className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden group shadow-lg"
                >
                  <div className="relative aspect-[9/16] bg-black">
                    <img src={vid.thumb} alt={vid.prompt} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 start-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-white">
                      {vid.duration}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-xs text-white line-clamp-2 font-medium">{vid.prompt}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-white/5">
                      <span>{vid.model}</span>
                      <button
                        onClick={() => handleDownloadVideo(vid.videoUrl || vid.thumb, vid.prompt)}
                        className="flex items-center gap-1 text-[#00e575] hover:underline"
                      >
                        <Download className="w-3 h-3" />
                        <span>تحميل</span>
                      </button>
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
