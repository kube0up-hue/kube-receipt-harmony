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
} from "lucide-react";
import { toast } from "sonner";

interface HalaiVideoGenerateSectionProps {
  onBackToStudio: () => void;
  onSendToStudio2?: (prompt: string) => void;
}

const VIDEO_MODELS = [
  {
    id: "gemini_omni",
    name: "أومني فلاش",
    badge: "جديد",
    cost: 28,
    desc: "فيديو 720p سريع مع صوت متزامن — نص وصورة ومراجع وتعديل فيديو",
    sampleVideo: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/manifest/video.m3u8",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
  },
  {
    id: "veo_31",
    name: "فيو 3.1 برو",
    badge: "سينمائي 4K",
    cost: 35,
    desc: "محرك جوجل الفائق لإنتاج الإعلانات التجارية السينمائية بدقة 4K وحركة واقعية",
    sampleVideo: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/manifest/video.m3u8",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
  },
  {
    id: "kling_3",
    name: "كلينج 3.0 تيربو",
    badge: "حركة سريعة",
    cost: 30,
    desc: "توليد حركة ديناميكية سلسة 60fps لسوائل القهوة وشخصيات البراند بدون أي تشوه",
    sampleVideo: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/manifest/video.m3u8",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720",
  },
  {
    id: "wan_26",
    name: "وان 2.6 برو",
    badge: "صورة لفيديو",
    cost: 26,
    desc: "تحويل صور منتجات ومشروبات كافيه KUBE إلى لقطات إعلانية متحركة ومبهرة",
    sampleVideo: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/manifest/video.m3u8",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
  },
];

export const HalaiVideoGenerateSection: React.FC<HalaiVideoGenerateSectionProps> = ({
  onBackToStudio,
}) => {
  const [selectedModel, setSelectedModel] = useState("gemini_omni");
  const [mode, setMode] = useState<"video" | "references" | "edit">("video");
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [duration, setDuration] = useState("8s");
  const [hasAudio, setHasAudio] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [referenceMedia, setReferenceMedia] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);

  const activeModel = VIDEO_MODELS.find((m) => m.id === selectedModel) || VIDEO_MODELS[0];

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast.error("يرجى كتابة وصف المشهد بالتفصيل");
      return;
    }
    setIsGenerating(true);
    setTimeout(() => {
      const newVideo = {
        id: "v_" + Date.now(),
        prompt: prompt,
        model: activeModel.name,
        ratio: aspectRatio,
        duration: duration,
        thumb: activeModel.thumb,
        created: "الآن",
      };
      setVideos([newVideo, ...videos]);
      setIsGenerating(false);
      toast.success("تم توليد الفيديو بنجاح بواسطة " + activeModel.name);
    }, 3200);
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

      {/* Main Workspace Layout (Sidebar on Right in RTL, Canvas on Left) */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Right Sidebar (Halai 320px Sticky Control Deck) */}
        <aside className="w-full lg:w-[320px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Model Card Banner */}
            <div className="relative aspect-[2.2] w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
              <img
                src={activeModel.thumb}
                alt={activeModel.name}
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#00e575] animate-ping" />
                  <h3 className="text-sm font-bold text-white">{activeModel.name}</h3>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/20 font-mono text-zinc-200">
                    {activeModel.badge}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-300 line-clamp-1 mt-0.5">{activeModel.desc}</p>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode("video")}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === "video" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                فيديو
              </button>
              <button
                type="button"
                onClick={() => setMode("references")}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === "references" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                مراجع
              </button>
              <button
                type="button"
                onClick={() => setMode("edit")}
                className={`py-1.5 rounded-lg transition-all ${
                  mode === "edit" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                تعديل
              </button>
            </div>

            {/* Model Selector Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                الموديل
              </label>
              <div className="grid grid-cols-1 gap-1">
                {VIDEO_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedModel(m.id)}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all ${
                      selectedModel === m.id
                        ? "bg-white/10 border-white/30 text-white shadow-sm"
                        : "bg-white/5 border-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <span>{m.name}</span>
                    <span className="text-[10px] font-mono text-[#00e575]">{m.cost} نقطة</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Controls: Dimensions & Duration */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">الأبعاد</label>
                <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {["9:16", "16:9", "1:1"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`py-1 rounded text-[10px] font-mono transition-all ${
                        aspectRatio === r ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">المدة</label>
                <div className="grid grid-cols-3 gap-1 bg-white/5 p-1 rounded-xl border border-white/10">
                  {["5s", "8s", "10s"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={`py-1 rounded text-[10px] font-mono transition-all ${
                        duration === d ? "bg-white/20 text-white font-bold" : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2 text-xs font-semibold">
                {hasAudio ? <Volume2 className="w-4 h-4 text-[#00e575]" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                <span>الصوت الأصلي المتزامن</span>
              </div>
              <button
                type="button"
                onClick={() => setHasAudio(!hasAudio)}
                className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                  hasAudio ? "bg-[#00e575]" : "bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-black transition-transform ${
                    hasAudio ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Reference Media Upload */}
            <label className="border border-dashed border-white/20 hover:border-white/40 rounded-2xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer bg-white/5 hover:bg-white/10 transition-all text-center">
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReferenceMedia(file.name);
                    toast.success("تم إرفاق الملف المرجعي: " + file.name);
                  }
                }}
              />
              <Upload className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-medium text-zinc-300">
                {referenceMedia ? referenceMedia : "إسقاط صورة أو مقطع مرجعي"}
              </span>
            </label>

            {/* Prompt Textarea */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">الوصف (البرومبت)</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder="صف مشهدك بالتفصيل. استخدم @ للإشارة إلى الوسائط..."
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
        </aside>

        {/* Left Canvas: Generated Videos & Feed */}
        <main className="flex-1 w-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Video className="w-4 h-4 text-[#00e575]" />
              <span>مقاطعك (Your Generations)</span>
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              {videos.length} مقطع مولد
            </span>
          </div>

          {videos.length === 0 ? (
            /* Empty State matching Halai */
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                <Video className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">لا توجد فيديوهات بعد</h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  اكتب وصفاً أو ارفع صورة لمنتج كافيه KUBE من الشريط الجانبي واضغط توليد لبدء إنتاج الفيديو.
                </p>
              </div>

              {/* Sample Prompts to get started */}
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
                  <div className="p-3 space-y-1">
                    <p className="text-xs text-white line-clamp-2 font-medium">{vid.prompt}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                      <span>{vid.model}</span>
                      <span>{vid.created}</span>
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
