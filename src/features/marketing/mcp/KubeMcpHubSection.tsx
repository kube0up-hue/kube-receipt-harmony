import React, { useState } from "react";
import { Radio, Cpu, Sparkles, Copy, Check, ExternalLink, Github, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

export const CLAUDE_CONFIG_JSON = JSON.stringify(
  {
    mcpServers: {
      "kube-ai": {
        command: "node",
        args: ["c:/Users/x4iii/Downloads/kube/scripts/kube-mcp-server.cjs"],
        env: {
          KUBE_API_KEY: "kube_live_sec_prod_77192",
          KUBE_STUDIO_ENV: "production",
        },
      },
    },
  },
  null,
  2
);

export const CURSOR_CONFIG_JSON = JSON.stringify(
  {
    mcpServers: {
      "kube-ai": {
        type: "stdio",
        command: "node",
        args: ["c:/Users/x4iii/Downloads/kube/scripts/kube-mcp-server.cjs"],
        env: {
          KUBE_API_KEY: "kube_live_sec_prod_77192",
        },
      },
    },
  },
  null,
  2
);

export const CHATGPT_CONFIG_JSON = JSON.stringify(
  {
    name: "KUBE Studio MCP",
    url: "https://kubekitchen.app/api/mcp",
    auth: {
      type: "bearer",
      token: "kube_live_sec_prod_77192",
    },
  },
  null,
  2
);

export const CLI_CONFIG_COMMAND = "node c:/Users/x4iii/Downloads/kube/scripts/kube-mcp-server.cjs";

export const MCP_TOOLS_SHOWCASE = [
  {
    name: "kube_generate_video_ad",
    tag: "Veo 3.1 / Kling 3.0",
    title: "توليد إعلانات فيديو تجارية (14 قالباً إعلانياً)",
    desc: "توليد إعلان فيديو بدقة 4K بنسب عرض 9:16 و 16:9 مع هوك ثواني أولى سعودي وحركة سينمائية طبيعية.",
    samplePrompt: 'أبي فيديو إعلان 15 ثانية لقهوة كولد برو KUBE بأسلوب المقاهي المختصة 9:16',
  },
  {
    name: "kube_create_ugc_video",
    tag: "سلطان / نورة / ريما",
    title: "صناع محتوى UGC سعوديون افتراضيون",
    desc: "فيديوهات تيك توك وريلز مع مقدم سعودي يلقي سكريبت عامي واقعي مع تعابير وجه حقيقية ونطق دقيق.",
    samplePrompt: 'أنشئ فيديو UGC مع نورة تمدح فيه سرعة التوصيل وطعم الكولد برو في الصيف',
  },
  {
    name: "kube_product_studio_shot",
    tag: "Hasselblad 4K",
    title: "جلسات تصوير أستوديو للمنتجات 4K",
    desc: "تصوير فوتوغرافي ماكرو عالي الدقة على منصات رخام أسود، خشب جوز، وحجر ترافيرتين بإضاءة هاسيلبلاد تجارية.",
    samplePrompt: 'صور كوب فلات وايت على رخام أسود مع بخار خفيف وإضاءة سوفت بوكس 4K',
  },
  {
    name: "kube_create_ads_9pack",
    tag: "Funnel Ads",
    title: "باقة 9 إعلانات لوسائل التواصل دفعة واحدة",
    desc: "توليد 9 زوايا تسويقية متنوعة (ماكرو، صباحي، ستريت، مكتب، نيون، تجمعات) تغطي مسار الشراء بالكامل.",
    samplePrompt: 'ولّد باقة إعلانات 9-Pack كاملة لحملة عروض يوم التأسيس لكافيه KUBE',
  },
  {
    name: "kube_create_social_campaign",
    tag: "Barq & Namq Style",
    title: "صياغة حملات تسويقية وهوية سعودية",
    desc: "صياغة نصوص إعلانات وهوكات فيروسية لتويتر وتيك توك بلهجة نجدية ذكية مستوحاة من برق وSTC ونمق.",
    samplePrompt: 'اكتب لي 5 تغريدات ترويجية بلهجة برق لافتتاح فرعنا الجديد في طريق تركي الأول',
  },
  {
    name: "kube_query_generation_status",
    tag: "Long Polling 90s",
    title: "فحص ومتابعة الريندر السحابي الفوري",
    desc: "استرجاع روابط الفيديو والصور بدقة 4K فور انتهاء التوليد دون الحاجة لحلقات انتظار مرهقة للوكيل.",
    samplePrompt: 'الخادم ينتظر حتى 90 ثانية ليعيد النتيجة الجاهزة للوكيل مباشرة',
  },
];

const PLATFORMS = [
  { id: "claude", name: "Claude" },
  { id: "cursor", name: "Cursor" },
  { id: "chatgpt", name: "ChatGPT" },
  { id: "openclaw", name: "OpenClaw" },
  { id: "codex", name: "Codex" },
  { id: "hermes", name: "Hermes" },
] as const;

export function KubeMcpHubSection({ onOpenModal }: { onOpenModal: () => void }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("claude");
  const [copiedLink, setCopiedLink] = useState(false);

  const mcpUrl = "https://kubekitchen.app/api/mcp";

  const handleCopy = (text: string, label = "الرابط") => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success(`تم نسخ ${label} بنجاح!`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <section id="mcp-section" className="py-12 md:py-20 max-w-[1400px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-12">
      {/* Halai-Matched MCP Hero Header */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-4xl mx-auto">
        {/* Sub-nav Pills */}
        <div className="flex items-center gap-2 p-1 rounded-full bg-white/5 border border-white/10 mb-2">
          <span className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-semibold bg-white text-zinc-950">
            MCP
          </span>
          <button
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-medium text-zinc-400 hover:text-white transition-colors"
          >
            مهارات
          </button>
          <a
            href="https://github.com/hallah-ai/skills"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-xs text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>

        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-[1.15]">
          حوّل <span className="text-[#ff3b56]">CLAUDE</span> و <span className="text-purple-400">CURSOR</span> و <span className="text-emerald-400">CHATGPT</span> إلى استوديو إبداعي
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">
          اربط KUBE AI مباشرة مع عملاء الذكاء الاصطناعي عبر بروتوكول MCP المفتوح. ولّد إعلانات فيديو 4K وصور منتجات فوتوغرافية ومحتوى UGC في محادثتك بنقرة واحدة.
        </p>

        {/* Platform Selector Pills (Matching Halai's 6 platform pills) */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          {PLATFORMS.map((p) => {
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-full border text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-white text-zinc-950 border-white shadow-lg"
                    : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Halai's 3-Step Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-white/10 bg-[#141416]/90 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-semibold text-white">افتح الموصلات</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              في إعدادات حسابك في Claude أو Cursor، ادخل على صفحة الموصلات لإضافة موصل جديد.
            </p>
          </div>
          <div>
            <a
              href="https://claude.ai/settings/connectors"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white text-xs font-semibold transition-all active:scale-95"
            >
              <span>موصلات Claude</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-white/10 bg-[#141416]/90 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-semibold text-white">الصق رابط MCP</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              أضف رابط الموصل المباشر واحفظ التغييرات للربط التلقائي الفوري.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-zinc-950 font-mono text-[11px] text-zinc-300 overflow-x-auto no-scrollbar">
              <span className="truncate">{mcpUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(mcpUrl, "رابط MCP")}
              className="w-full inline-flex items-center justify-center gap-1.5 h-8 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#00e575]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "تم النسخ بنجاح" : "انسخ رابط MCP"}</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-white/10 bg-[#141416]/90 p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 text-white font-mono font-bold text-xs flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-semibold text-white">وافق ثم استخدم</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              اسمح لـ Claude باستخدام أدوات KUBE، وابدأ توليد الصور والفيديوهات مباشرة في الشات.
            </p>
          </div>
          <div>
            <a
              href="https://github.com/hallah-ai/skills"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-xl text-xs font-semibold text-zinc-300 hover:text-white border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
            >
              <Github className="w-3.5 h-3.5" />
              <span>افتح المستودع</span>
            </a>
          </div>
        </div>
      </div>

      {/* 6 Authorized MCP Tools Showcase Grid */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ff2a4b]" />
            <span>المهارات والأدوات المصرحة لخادم KUBE MCP:</span>
          </h3>
          <span className="text-xs font-mono text-zinc-500">6 أدوات رسمية جاهزة للاستدعاء</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MCP_TOOLS_SHOWCASE.map((tool) => (
            <div
              key={tool.name}
              className="p-5 rounded-2xl border border-white/10 bg-[#141416]/80 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#00e575] font-bold bg-[#00e575]/10 px-2.5 py-1 rounded-lg border border-[#00e575]/20">
                  {tool.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{tool.tag}</span>
              </div>
              <h4 className="text-xs font-black text-white">{tool.title}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{tool.desc}</p>
              <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-500">
                <span className="text-zinc-400 font-bold">مثال لأمر الوكيل: </span>
                "{tool.samplePrompt}"
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function KubeMcpModalContent() {
  const [platform, setPlatform] = useState<"claude" | "cursor" | "cli">("claude");

  const currentSnippet =
    platform === "claude" ? CLAUDE_CONFIG_JSON : platform === "cursor" ? CURSOR_CONFIG_JSON : CLI_CONFIG_COMMAND;

  const currentPath =
    platform === "claude"
      ? "%APPDATA%\\Claude\\claude_desktop_config.json"
      : platform === "cursor"
      ? ".cursor/mcp.json"
      : "Terminal command";

  const handleCopy = (text: string, label = "الكود") => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح!`);
  };

  return (
    <div className="space-y-6 text-right">
      <div className="pb-4 border-b border-white/10 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 animate-pulse" />
          <span>MODEL CONTEXT PROTOCOL (MCP) • V2.5</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-white">BETA</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-white">
          اربط KUBE AI مع Claude Desktop و Cursor و ChatGPT بأمر واحد
        </h3>
        <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
          بروتوكول Model Context Protocol يتيح لك استدعاء استوديوهات KUBE لتوليد الفيديو والصور والإعلانات من Cursor و Claude Desktop مباشرة دون الحاجة لفتح المتصفح.
        </p>
      </div>

      {/* Platform Selector Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {(["claude", "cursor", "cli"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                platform === p ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white bg-white/5"
              }`}
            >
              {p === "claude" ? "Claude Desktop" : p === "cursor" ? "Cursor / Windsurf" : "Node.js CLI"}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleCopy(currentSnippet, "إعدادات MCP")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 font-bold text-xs active:scale-95 transition-all"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>نسخ الإعدادات</span>
        </button>
      </div>

      {/* Config Box */}
      <div className="space-y-2">
        <span className="text-[11px] font-mono text-zinc-500 block">{currentPath}</span>
        <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto text-left ltr direction-ltr no-scrollbar">
          <code>{currentSnippet}</code>
        </pre>
      </div>

      {/* Supported Tools List */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-white block">الأدوات المصرحة في MCP (تطابق Halai 100%):</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
          {MCP_TOOLS_SHOWCASE.map((tool) => (
            <div key={tool.name} className="p-3 rounded-xl bg-zinc-900 border border-white/10 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-purple-400 font-bold text-[11px]">{tool.name}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-zinc-400">{tool.tag}</span>
              </div>
              <span className="text-[10px] text-zinc-400 block leading-tight">{tool.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
