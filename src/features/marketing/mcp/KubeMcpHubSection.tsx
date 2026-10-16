import React, { useState } from "react";
import {
  Radio,
  Sparkles,
  Copy,
  Check,
  ExternalLink,
  Github,
  ChevronDown,
  ChevronUp,
  Video,
  Users,
  Camera,
  LayoutGrid,
  Bot,
  Zap,
  ShieldCheck,
  Film,
  FileText,
  Clock,
  Layers,
  Sparkle,
} from "lucide-react";
import { toast } from "sonner";

// Developer Configurations (Hidden neatly in collapsible advanced tab)
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

export const MCP_TOOLS_SHOWCASE = [
  {
    name: "kube_generate_video_ad",
    tag: "Veo 3.1 / Kling 3.0",
    title: "توليد إعلانات فيديو تجارية (14 قالباً إعلانياً)",
    desc: "توليد إعلان فيديو بدقة 4K بنسب عرض 9:16 و 16:9 مع هوك ثواني أولى سعودي وحركة سينمائية طبيعية.",
    samplePrompt: "أبي فيديو إعلان 15 ثانية لقهوة كولد برو KUBE بأسلوب المقاهي المختصة 9:16",
  },
  {
    name: "kube_create_ugc_video",
    tag: "سلطان / نورة / ريما",
    title: "صناع محتوى UGC سعوديون افتراضيون",
    desc: "فيديوهات تيك توك وريلز مع مقدم سعودي يلقي سكريبت عامي واقعي مع تعابير وجه حقيقية ونطق دقيق.",
    samplePrompt: "أنشئ فيديو UGC مع نورة تمدح فيه سرعة التوصيل وطعم الكولد برو في الصيف",
  },
  {
    name: "kube_product_studio_shot",
    tag: "Hasselblad 4K",
    title: "جلسات تصوير أستوديو للمنتجات 4K",
    desc: "تصوير فوتوغرافي ماكرو عالي الدقة على منصات رخام أسود، خشب جوز، وحجر ترافيرتين بإضاءة هاسيلبلاد تجارية.",
    samplePrompt: "صور كوب فلات وايت على رخام أسود مع بخار خفيف وإضاءة سوفت بوكس 4K",
  },
  {
    name: "kube_create_ads_9pack",
    tag: "Funnel Ads",
    title: "باقة 9 إعلانات لوسائل التواصل دفعة واحدة",
    desc: "توليد 9 زوايا تسويقية متنوعة (ماكرو، صباحي، ستريت، مكتب، نيون، تجمعات) تغطي مسار الشراء بالكامل.",
    samplePrompt: "ولّد باقة إعلانات 9-Pack كاملة لحملة عروض يوم التأسيس لكافيه KUBE",
  },
  {
    name: "kube_create_social_campaign",
    tag: "Barq & Namq Style",
    title: "صياغة حملات تسويقية وهوية سعودية",
    desc: "صياغة نصوص إعلانات وهوكات فيروسية لتويتر وتيك توك بلهجة نجدية ذكية مستوحاة من برق وSTC ونمق.",
    samplePrompt: "اكتب لي 5 تغريدات ترويجية بلهجة برق لافتتاح فرعنا الجديد في طريق تركي الأول",
  },
  {
    name: "kube_query_generation_status",
    tag: "Long Polling 90s",
    title: "فحص ومتابعة الريندر السحابي الفوري",
    desc: "استرجاع روابط الفيديو والصور بدقة 4K فور انتهاء التوليد دون الحاجة لحلقات انتظار مرهقة للوكيل.",
    samplePrompt: "الخادم ينتظر حتى 90 ثانية ليعيد النتيجة الجاهزة للوكيل مباشرة",
  },
];

const PLATFORMS = [
  { id: "claude", name: "Claude", connectorUrl: "https://claude.ai/settings/connectors" },
  { id: "cursor", name: "Cursor", connectorUrl: "https://cursor.com" },
  { id: "chatgpt", name: "ChatGPT", connectorUrl: "https://chatgpt.com" },
  { id: "openclaw", name: "OpenClaw", connectorUrl: "https://openclaw.ai" },
  { id: "codex", name: "Codex", connectorUrl: "https://openai.com" },
  { id: "hermes", name: "Hermes", connectorUrl: "https://nousresearch.com" },
] as const;

const FAQ_ITEMS = [
  {
    q: "ما هو بروتوكول MCP (Model Context Protocol)؟",
    a: "هو معيار تقني مفتوح أطلقته Anthropic يسمح لروبوتات الذكاء الاصطناعي (مثل Claude و Cursor و ChatGPT) بالاتصال المباشر بمنصة KUBE AI لاستدعاء أدوات التوليد وتصميم الإعلانات وريندر الفيديو كأنها أداة داخلية مدمجة بالكامل.",
  },
  {
    q: "كيف أربط المنصة مع تطبيقي المفضل؟",
    a: "فقط افتح الموصلات (Connectors) في إعدادات التطبيق، ثم الصق رابط موصل KUBE المباشر، ووافق على منح الصلاحية. سيتعرف الذكاء الاصطناعي على كافة أدواتنا التسويقية فوراً.",
  },
  {
    q: "هل يتطلب التوليد عبر MCP أي اشتراك إضافي؟",
    a: "لا، الربط واستخدام موصلات MCP متاح بالكامل ومشمول ضمن حسابك المؤسسي المفعّل لكافة طاقم كافيه ومطبخ KUBE دون أي حدود.",
  },
  {
    q: "ما هي صيغ ومحركات الفيديو المدعومة عبر المحادثة؟",
    a: "يدعم خادم MCP محركات Google Veo 3.1، Kling AI 3.0 Turbo، WanX 2.6، و Flux 1.1 Pro Ultra، مما يتيح لك طلب إعلانات 4K بدقة 60fps ونسب 9:16 و 16:9 بمجرد توجيه أمر نصي.",
  },
  {
    q: "هل يحافظ الوكيل على أمان المفاتيح وبيانات الكافيه؟",
    a: "نعم، كافة الاتصالات مؤمنة ببروتوكول HTTPS/WSS ومشفرة طرفياً عبر توكنات مصادقةBearer مشفرة، دون تسريب أي بيانات اعتماد حساسة للمحادثة العامة.",
  },
];

/**
 * 100% Halai Real Page Parity MCP Hub
 * Clean, modern landing page matching Halai AI architecture with ZERO raw code blocks
 */
export function KubeMcpHubSection({ onOpenModal }: { onOpenModal?: () => void }) {
  const [selectedPlatform, setSelectedPlatform] = useState<string>("claude");
  const [copiedLink, setCopiedLink] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [showDevSettings, setShowDevSettings] = useState(false);

  const mcpUrl = "https://mcp.kubekitchen.app/mcp";

  const handleCopy = (text: string, label = "الرابط") => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    toast.success(`تم نسخ ${label} بنجاح!`);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const activePlatObj = PLATFORMS.find((p) => p.id === selectedPlatform) || PLATFORMS[0];

  return (
    <div className="w-full text-right space-y-16 py-4 md:py-8 max-w-6xl mx-auto px-2 sm:px-4">
      {/* 1. TOP NAV PILLS (Matching Halai's top bar) */}
      <div className="flex items-center justify-center gap-2">
        <div className="inline-flex items-center gap-1.5 p-1 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-md">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-black bg-white text-zinc-950 shadow-sm"
          >
            MCP
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("mcp-skills-section");
              if (el) el.scrollIntoView({ behavior: "smooth" });
              else toast.info("استعرض المهارات والأدوات المصرحة أدناه");
            }}
            className="inline-flex items-center gap-1.5 h-8 px-4 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            مهارات
          </button>
          <a
            href="https://github.com/hallah-ai/skills"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* 2. HERO SECTION (100% Halai Hero Typography & Layout) */}
      <div className="flex flex-col items-center text-center space-y-5 max-w-4xl mx-auto">
        <h1 className="font-black tracking-tight uppercase text-3xl sm:text-5xl md:text-6xl text-white leading-[1.15]">
          حوّل{" "}
          <span className="text-[#ff3b56]">CLAUDE</span>{" "}
          <span className="text-zinc-400">CURSOR</span>{" "}
          <span className="text-[#00e575]">CHATGPT</span>{" "}
          <span className="text-purple-400">OPENCLAW</span>{" "}
          إلى استوديو إبداعي.
        </h1>

        <p className="text-xs sm:text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl font-normal">
          اربط منظومة KUBE AI مباشرة مع عملاء الذكاء الاصطناعي عبر بروتوكول MCP المفتوح.
          ولّد إعلانات فيديو 4K وصور منتجات فوتوغرافية ومحتوى UGC في محادثتك بنقرة واحدة دون مغادرة بيئة عملك.
        </p>

        {/* 6 Platform Selector Pills */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-3">
          {PLATFORMS.map((p) => {
            const isActive = selectedPlatform === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedPlatform(p.id)}
                className={`inline-flex items-center gap-2 h-9 px-4 rounded-full border text-xs font-black whitespace-nowrap transition-all duration-200 active:scale-95 ${
                  isActive
                    ? "bg-white text-zinc-950 border-white shadow-lg shadow-white/10"
                    : "border-white/[0.08] bg-white/[0.03] text-zinc-300 hover:text-white hover:bg-white/[0.08]"
                }`}
              >
                <span>{p.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. 3-STEP SETUP CARDS (Halai Parity) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Step 1 */}
        <div className="rounded-3xl border border-white/10 bg-[#151618] p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <span className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 text-white font-mono font-black text-sm flex items-center justify-center">
              1
            </span>
            <h3 className="text-base font-bold text-white">افتح الموصلات</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              في إعدادات حسابك في {activePlatObj.name}، ادخل على صفحة الموصلات (Connectors) لإضافة موصل جديد.
            </p>
          </div>
          <div className="pt-2">
            <a
              href={activePlatObj.connectorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 hover:border-white/25 text-white text-xs font-bold transition-all active:scale-95"
            >
              <span>موصلات {activePlatObj.name}</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </div>

        {/* Step 2 */}
        <div className="rounded-3xl border border-white/10 bg-[#151618] p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <span className="w-8 h-8 rounded-xl bg-[#00e575]/20 border border-[#00e575]/40 text-[#00e575] font-mono font-black text-sm flex items-center justify-center">
              2
            </span>
            <h3 className="text-base font-bold text-white">الصق رابط MCP</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              أضف رابط الموصل المباشر واحفظ التغييرات للربط التلقائي الفوري.
            </p>
          </div>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl border border-white/10 bg-black/60 font-mono text-[11px] text-zinc-300">
              <span className="truncate">{mcpUrl}</span>
            </div>
            <button
              type="button"
              onClick={() => handleCopy(mcpUrl, "رابط MCP")}
              className="w-full inline-flex items-center justify-center gap-2 h-9 rounded-xl bg-white text-black font-black text-xs transition-all active:scale-95 hover:bg-zinc-200 shadow-md"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? "تم النسخ بنجاح" : "انسخ رابط MCP"}</span>
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="rounded-3xl border border-white/10 bg-[#151618] p-6 flex flex-col justify-between space-y-4 shadow-xl">
          <div className="space-y-3">
            <span className="w-8 h-8 rounded-xl bg-[#ff2a4b]/20 border border-[#ff2a4b]/40 text-[#ff3b56] font-mono font-black text-sm flex items-center justify-center">
              3
            </span>
            <h3 className="text-base font-bold text-white">وافق ثم استخدم</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              اسمح لـ {activePlatObj.name} باستخدام أدوات KUBE، وابدأ توليد الصور والفيديوهات مباشرة في الشات.
            </p>
          </div>
          <div className="pt-2">
            <a
              href="https://github.com/hallah-ai/skills"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-bold text-zinc-200 hover:text-white border border-white/15 bg-white/5 hover:bg-white/10 transition-colors active:scale-95"
            >
              <Github className="w-3.5 h-3.5" />
              <span>افتح المستودع</span>
            </a>
          </div>
        </div>
      </div>

      {/* 4. SECTION: استوديو إبداعي كامل داخل المحادثة (5 Feature Cards) */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight text-center">
          استوديو إبداعي كامل داخل المحادثة
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "صور وفيديو بطلب واحد",
              desc: "أنشئ مرئيات تجارية مذهلة وصور منتجات بدقة 4K من رسالة نصية واحدة دون مغادرة نافذة المحادثة.",
              badge: "سرعة فائقة",
              color: "text-[#00e575] border-[#00e575]/30 bg-[#00e575]/10",
            },
            {
              title: "برومبت واحد",
              desc: "صياغة برومبتات إعلانية متقدمة تترجم هويتك البصرية إلى مخرجات واقعية متناسقة مع أسلوب مقاهي الرياض.",
              badge: "نبرة سعودية",
              color: "text-[#ff3b56] border-[#ff2a4b]/30 bg-[#ff2a4b]/10",
            },
            {
              title: "مقدّم يقرأ نصك",
              desc: "صناع محتوى UGC سعوديون افتراضيون يلقون السكريبت بنبرة نجدية حقيقية وتزامن شفاه 60fps.",
              badge: "UGC 2.0",
              color: "text-amber-400 border-amber-400/30 bg-amber-400/10",
            },
            {
              title: "استوديو احترافي بدون استوديو",
              desc: "محاكاة إضاءة هاسيلبلاد والأسطح الرخامية الفاخرة بدون معدات تصوير حقيقية أو استئجار لوكيشن.",
              badge: "Hasselblad 4K",
              color: "text-purple-400 border-purple-400/30 bg-purple-400/10",
            },
            {
              title: "OAUTH وحدود إنفاق وسجلّ كامل",
              desc: "تحكم أمني مؤسسي متكامل، مفاتيح مشفرة، وسجل شفاف لكافة طلبات التوليد والتكلفة في كافيه KUBE.",
              badge: "أمان مؤسسي",
              color: "text-blue-400 border-blue-400/30 bg-blue-400/10",
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-[#151618] border border-white/10 hover:border-white/20 transition-all space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.color}`}>
                  {item.badge}
                </span>
                <Sparkle className="w-4 h-4 text-zinc-500" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{item.title}</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. SECTION: من الفكرة إلى المحتوى في محادثة واحدة (6 Creative Cards) */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight text-center">
          من الفكرة إلى المحتوى في محادثة واحدة
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5 sm:gap-4">
          {[
            {
              title: "صور منتجات احترافية",
              desc: "جلسات تصوير 4K لكافة مشروبات القهوة والحلويات والمخبوزات مع محاكاة التكثيف والثلج.",
              thumb: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80",
            },
            {
              title: "محتوى يوقف التمرير",
              desc: "فيديوهات ريلز وتيك توك سريعة بخطافات جذابة تخطف الانتباه في أول ثانيتين.",
              thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=500",
            },
            {
              title: "إعلانات سوشيال وحملات كاملة",
              desc: "حزم إعلانات 9x متكاملة تغطي كافة مراحل مسار الشراء وزيادة الطلبات.",
              thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=500",
            },
            {
              title: "لوحات قصة وفنّ مفهومي",
              desc: "ستوري بورد إعلاني متسلسل من 4 مشاهد مترابطة يوضح تسلسل الكاميرا والأصوات.",
              thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/8bffdce9c36d3de8fa8ceb0d88c4e175/thumbnails/thumbnail.jpg?height=500",
            },
            {
              title: "إنفوغرافيك وبيانات بصرية",
              desc: "بوسترات إعلانية مطبوعة وقوائم مشروبات ومنيو رقمي بجودة طباعة عالمية.",
              thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=500",
            },
            {
              title: "صور بروفايل ومقاطع شخصية",
              desc: "تثبيت ملامح الممثل والباريستا بدقة ليكون الوجه الرسمي لكافة حملات الكافيه القادمة.",
              thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=500",
            },
          ].map((c, i) => (
            <div
              key={i}
              className="group rounded-3xl border border-white/10 bg-[#151618] overflow-hidden flex flex-col justify-between shadow-lg hover:border-white/25 transition-all"
            >
              <div className="aspect-[16/10] w-full overflow-hidden bg-black relative">
                <img
                  src={c.thumb}
                  alt={c.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>
              <div className="p-3.5 sm:p-4 space-y-1">
                <h3 className="text-xs sm:text-sm font-black text-white">{c.title}</h3>
                <p className="text-[11px] text-zinc-400 leading-snug line-clamp-2">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6. SECTION: من الفكرة إلى الحملة في محادثة واحدة (3 Workflow Steps) */}
      <div className="space-y-6 pt-6">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white uppercase tracking-tight text-center">
          من الفكرة إلى الحملة في محادثة واحدة
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              step: "١",
              title: "أنشئ أصلاً واحداً في ثوانٍ",
              desc: "اطلب من Claude أو Cursor صورة أو فيديو إعلاني لكولد برو KUBE، ويتم توليدها فورياً بدقة سينمائية.",
            },
            {
              step: "٢",
              title: "حملة كاملة من محادثة",
              desc: "اطلب سيناريو كامل مع 4 مشاهد متصلة ونصوص تسويقية لتويتر وسناب شات وتيك توك دفعة واحدة.",
            },
            {
              step: "٣",
              title: "وَلِّد، تحقّق، اعرض",
              desc: "يقوم الوكيل بفحص جودة الصورة والفيزياء قبل إعادتها إليك، مع خيار التصدير التجاري المباشر 4K.",
            },
          ].map((wf, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-6 rounded-3xl bg-[#151618] border border-white/10 space-y-3 flex flex-col justify-between shadow-lg"
            >
              <div className="space-y-2">
                <span className="text-xs font-mono font-black text-[#00e575] bg-[#00e575]/10 px-2.5 py-1 rounded-full border border-[#00e575]/20 inline-block">
                  المرحلة {wf.step}
                </span>
                <h3 className="text-base font-black text-white">{wf.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">{wf.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7. SECTION: المهارات والأدوات المصرحة لخادم KUBE MCP */}
      <div id="mcp-skills-section" className="space-y-6 pt-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ff2a4b]" />
              <span>المهارات والأدوات المصرحة لخادم KUBE MCP</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              أدوات رسمية متوافقة 100% مع مواصفات Model Context Protocol الرسمية
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-mono text-[#00e575] bg-[#00e575]/10 border border-[#00e575]/20 font-bold shrink-0">
            6 أدوات لايف
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MCP_TOOLS_SHOWCASE.map((tool) => (
            <div
              key={tool.name}
              className="p-5 rounded-3xl border border-white/10 bg-[#151618] hover:border-white/20 transition-all space-y-3 shadow-lg"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-[#00e575] font-black bg-[#00e575]/10 px-2.5 py-1 rounded-lg border border-[#00e575]/20">
                  {tool.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">{tool.tag}</span>
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white">{tool.title}</h4>
              <p className="text-[11px] text-zinc-400 leading-relaxed">{tool.desc}</p>
              <div className="pt-2 border-t border-white/5 text-[10px] text-zinc-400">
                <span className="text-zinc-500 font-bold">مثال للأمر: </span>
                "{tool.samplePrompt}"
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 8. SECTION: أسئلة متكررة (FAQ) */}
      <div className="space-y-4 pt-6 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight text-center pb-2">
          أسئلة متكررة
        </h2>

        <div className="space-y-2.5">
          {FAQ_ITEMS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#151618] overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-white hover:text-[#00e575] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#00e575] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-4 pt-0 text-xs text-zinc-400 leading-relaxed border-t border-white/5 bg-black/30">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. BOTTOM BANNER: الذكاء الاصطناعي عندك صار أقوى */}
      <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-zinc-900 via-[#18191c] to-black p-8 sm:p-10 text-center space-y-4 shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,229,117,0.1)_0%,transparent_70%)]" />
        <div className="relative z-10 space-y-3">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white uppercase tracking-tight">
            الذكاء الاصطناعي عندك صار أقوى
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
            ابدأ الآن بربط كافيه KUBE مع Claude أو Cursor واستمتع بتجربة إعلانية سينمائية لا تتوقف.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => handleCopy(mcpUrl, "رابط MCP")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white hover:bg-zinc-200 text-black font-black text-xs md:text-sm active:scale-95 transition-all shadow-xl shadow-white/15"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? "تم نسخ الرابط بنجاح" : "انسخ رابط MCP"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 10. ADVANCED DEVELOPER SETTINGS (COLLAPSIBLE - OUT OF THE WAY) */}
      <div className="pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => setShowDevSettings(!showDevSettings)}
          className="text-xs font-mono text-zinc-500 hover:text-zinc-300 flex items-center gap-2 mx-auto"
        >
          <span>إعدادات متقدمة للمطورين (ملفات JSON لـ Claude Desktop & Cursor)</span>
          {showDevSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showDevSettings && (
          <div className="mt-4 p-5 rounded-2xl bg-black border border-white/10 space-y-4 text-right animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">إعدادات claude_desktop_config.json:</span>
              <button
                type="button"
                onClick={() => handleCopy(CLAUDE_CONFIG_JSON, "JSON")}
                className="text-xs text-[#00e575] hover:underline font-mono"
              >
                نسخ الكود
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-zinc-950 text-[11px] font-mono text-zinc-300 overflow-x-auto ltr text-left">
              {CLAUDE_CONFIG_JSON}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

// Backward-compatibility export
export function KubeMcpModalContent() {
  return <KubeMcpHubSection />;
}
