import React, { useState } from "react";
import { Radio, Cpu, Sparkles, Copy, Check } from "lucide-react";
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

export function KubeMcpHubSection({ onOpenModal }: { onOpenModal: () => void }) {
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
    <section id="mcp-section" className="py-12 md:py-20 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>MODEL CONTEXT PROTOCOL (MCP) • V2.5</span>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-white">رسمي</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            حوّل CLAUDE و CURSOR و CHATGPT إلى استوديو إبداعي
          </h2>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-2xl">
            اربط KUBE AI مع بيئة عملك اليومية عبر بروتوكول MCP المفتوح. اطلب من Claude أو Cursor أو أي وكيل ذكاء اصطناعي توليد إعلانات فيديو 4K، مقاطع صانعي محتوى UGC سعوديين، وجلسات تصوير منتجات بأمر محادثة مباشر وبدون مغادرة شاشتك.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenModal}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs active:scale-95 transition-all shadow-lg shadow-purple-600/20 flex items-center gap-2"
          >
            <Cpu className="w-4 h-4" />
            <span>فتح مركز الموصّلات والمهارات</span>
          </button>
        </div>
      </div>

      {/* 3 Step Integration Walkthrough Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono font-black text-xs flex items-center justify-center">01</span>
            <span className="text-[10px] text-zinc-500 font-mono">إعداد الاتصال</span>
          </div>
          <h4 className="text-sm font-black text-white">انسخ كود التكوين</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            اختر عميل الذكاء الاصطناعي (Claude Desktop أو Cursor أو CLI) وانسخ إعدادات الاتصال المشفرة مع مفتاح API الخاص بك.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/40 text-purple-400 font-mono font-black text-xs flex items-center justify-center">02</span>
            <span className="text-[10px] text-zinc-500 font-mono">حفظ الإعدادات</span>
          </div>
          <h4 className="text-sm font-black text-white">ألصق الكود في تطبيقك</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            افتح ملف <code className="text-purple-300 font-mono bg-purple-500/10 px-1 py-0.5 rounded text-[11px]">claude_desktop_config.json</code> أو إعدادات MCP في Cursor، وألصق الكود ثم أعد تشغيل التطبيق.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-7 h-7 rounded-lg bg-[#00e575]/20 border border-[#00e575]/40 text-[#00e575] font-mono font-black text-xs flex items-center justify-center">03</span>
            <span className="text-[10px] text-[#00e575] font-mono">جاهز للإبداع</span>
          </div>
          <h4 className="text-sm font-black text-white">أعطِ الأوامر باللغة الطبيعية</h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            اطلب: <span className="text-white font-medium">"أنشئ إعلان فيديو 15 ثانية لقهوة V60 إثيوبية مع صانع محتوى سعودي"</span> وسيقوم Claude باستدعاء خادم KUBE وتنفيذ الريندر فوراً!
          </p>
        </div>
      </div>

      {/* Interactive Configuration Box */}
      <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-zinc-950 via-zinc-900 to-black p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">تكوين عميل MCP:</span>
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black border border-white/10">
              {(["claude", "cursor", "cli"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    platform === p ? "bg-purple-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {p === "claude" ? "Claude Desktop" : p === "cursor" ? "Cursor / Windsurf" : "Node.js Stdio Bridge"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleCopy(currentSnippet, "إعدادات MCP")}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 font-bold text-xs active:scale-95 transition-all self-start sm:self-auto"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>نسخ الإعدادات بنقرة واحدة</span>
          </button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono">
            <span>{currentPath}</span>
            <span className="text-[#00e575] flex items-center gap-1">
              <Check className="w-3 h-3" /> متوافق 100% مع مواصفة Halai MCP v2.5
            </span>
          </div>
          <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto text-left ltr direction-ltr scrollbar-thin">
            <code>{currentSnippet}</code>
          </pre>
        </div>
      </div>

      {/* 6 Halai-matching Tool Showcase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>أدوات ومهارات KUBE AI المصرحة في MCP (نفس قدرات هلاي):</span>
          </h3>
          <span className="text-xs font-mono text-zinc-500">6 أدوات رسمية جاهزة للاستدعاء</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MCP_TOOLS_SHOWCASE.map((tool) => (
            <div
              key={tool.name}
              className="p-5 rounded-2xl border border-white/10 bg-zinc-900/60 hover:border-purple-500/40 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-purple-400 font-bold bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20">
                  {tool.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{tool.tag}</span>
              </div>
              <h4 className="text-xs font-black text-white">{tool.title}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{tool.desc}</p>
              <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-500">
                <span className="text-zinc-400 font-bold">مثال لأمر الذكاء الاصطناعي: </span>
                "{tool.samplePrompt}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* E-Commerce Store Connectors: Salla & Zid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8 space-y-4">
          <span className="text-xs font-mono text-[#00e575]">متوفر في متجر تطبيقات سلة</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">عزّز متجرك في سلة مع KUBE MCP</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم سلة مباشرة وبمزامنة فورية مع كاشير KUBE.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/5 text-zinc-300 border border-white/10">
              سلة POS متصلة بنجاح
            </span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8 space-y-4">
          <span className="text-xs font-mono text-[#00e575]">متوفر في متجر تطبيقات زد</span>
          <h3 className="text-xl sm:text-2xl font-black text-white">عزّز متجرك في زد مع KUBE MCP</h3>
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
            أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم زد مباشرة وبمزامنة فورية مع نظام KUBE ERP.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-3 py-1 rounded-lg bg-white/5 text-zinc-300 border border-white/10">
              زد ERP متصل بنجاح
            </span>
          </div>
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
        <pre className="p-4 rounded-2xl bg-black border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto text-left ltr direction-ltr scrollbar-thin">
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
