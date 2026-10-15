import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { PermissionGuard } from "@/components/permission-guard";
import {
  Sparkles,
  Copy,
  Plus,
  ChevronLeft,
  ChevronRight,
  Search,
  Layers,
  Download,
  Zap,
  Bot,
  Video,
  Play,
  ArrowRight,
  Award,
  X,
  Code,
  FolderOpen,
  Folder,
  Bell,
  Menu as MenuIcon,
  ShoppingBag,
  Cpu,
  Radio,
  Sliders,
  Send,
  Coffee,
  Check,
  TrendingUp,
  Image as ImageIcon,
  Palette,
  Eye,
  Maximize2,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  SAUDI_SOCIAL_POSTS,
  SAUDI_VISUAL_PROMPTS,
  SAUDI_TREND_PLAYBOOKS,
  SAUDI_UGC_FORMATS,
  SAUDI_CREATOR_PERSONAS,
  KUBE_PRODUCT_STUDIO_PRESETS,
  KUBE_VIDEO_SCRIPTS,
  HALAI_AI_MODELS_CATALOG,
  UgcFormat,
  SaudiCreatorPersona,
  ProductStudioPreset,
  VideoScriptTemplate,
  AiModelEngine,
} from "@/features/marketing/ai-marketing-dataset";
import { useCurrentUser } from "@/lib/use-current-user";
import { primaryRoleHome } from "@/lib/current-user";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  head: () => ({
    meta: [
      { title: "الرئيسية | Halai KUBE AI" },
      {
        name: "description",
        content:
          "منظومة ومحركات التوليد الذكية لكافيه ومطبخ KUBE المطابقة لمنصة هلاي (Hallah.ai): سوبر ايجنت، استوديو المنتجات ثلاثي الأبعاد، شخصيات UGC، وكتالوج النماذج العالمية.",
      },
      { property: "og:title", content: "KUBE هلاي AI — مركز الإبداع والذكاء الاصطناعي" },
      { property: "og:description", content: "ابدع بلا حدود مع محركات الذكاء الاصطناعي التوليدي لكافيه KUBE." },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["ai_studio_use", "reports_export", "orders_view"]}>
      <HalaiMarketingPage />
    </PermissionGuard>
  ),
});

// Halai Official SVG Engine Icons
const ENGINE_LOGOS = [
  { name: "Kling", icon: "https://hallah.ai/icons/kling.svg", invert: false },
  { name: "Veed", icon: "https://hallah.ai/icons/veed.svg", invert: true },
  { name: "Gemini", icon: "https://hallah.ai/icons/gemini.svg", invert: false },
  { name: "Krea", icon: "https://hallah.ai/icons/krea.svg", invert: true },
  { name: "Qwen", icon: "https://hallah.ai/icons/qwen.svg", invert: false },
  { name: "ByteDance", icon: "https://hallah.ai/icons/bytedance.svg", invert: false },
  { name: "DALL·E", icon: "https://hallah.ai/icons/dalle.svg", invert: false },
  { name: "Flux", icon: "https://hallah.ai/icons/flux.svg", invert: true },
  { name: "PrunaAI", icon: "https://hallah.ai/icons/prunaai-color.svg", invert: false },
  { name: "Grok", icon: "https://hallah.ai/icons/grok.svg", invert: true },
  { name: "Nano", icon: "https://hallah.ai/icons/nanobanana-color.svg", invert: false },
  { name: "Ideogram", icon: "https://hallah.ai/icons/ideogram.svg", invert: true },
];

// Horizontal Showcase Stream (Section 2)
const SHOWCASE_CARDS = [
  {
    title: "هلاي ميميك",
    tag: "رائج",
    desc: "احتفظ بحركة الفيديو وكاميرته وتوقيته، وأعد بناء الشخصيات والمنتجات والمشهد من صورك",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720",
    action: "product_studio",
  },
  {
    title: "استوديو الشخصيات",
    tag: "جديد",
    desc: "صمّم الشخصية مرة واحدة، ثم اجعل الوجه نفسه بطل كل فيديو لكافيه KUBE.",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/1b1d49197e516bea184765e12e8bcd14/thumbnails/thumbnail.jpg?height=720",
    action: "ugc_studio",
  },
  {
    title: "أومني فلاش 1.1",
    tag: "جديد",
    desc: "فيديو بصوت متزامن حتى دقة 4K — نص وصورة ومراجع وتعديل فيديو فوري",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/8bffdce9c36d3de8fa8ceb0d88c4e175/thumbnails/thumbnail.jpg?height=720",
    action: "super_agent",
  },
  {
    title: "ميني ماكس H3 ماكس",
    tag: "جديد",
    desc: "هايلو أوضح وأسرع — حتى 15 ثانية من وصف نصي أو صورة أو من مراجع صور وفيديو",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/28344dc091e4acf786c7622ad1fdeb10/thumbnails/thumbnail.jpg?height=720",
    action: "models",
  },
  {
    title: "وان 3.0 برايم",
    tag: "جديد",
    desc: "حركة واقعية مع صوت أصلي لسكب القهوة، من وصف نصي أو من صورة المنتج",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
    action: "product_studio",
  },
  {
    title: "فلكس 3",
    tag: "جديد",
    desc: "فيديو متقدم بصوت أصلي — من نص أو صورة أو إطار البداية والنهاية",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
    action: "ads_studio",
  },
  {
    title: "كوين إيميج 3",
    tag: "جديد",
    desc: "نص إنجليزي وعربي واضح على الأكواب، مع تحرير من 3 صور مرجعية كحد أقصى",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
    action: "product_studio",
  },
  {
    title: "سي دانس 2.5",
    tag: "جديد",
    desc: "فيديو سينمائي حتى 30 ثانية بصوت أصلي، مع مراجع صور وفيديو وصوت",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=720",
    action: "ugc_studio",
  },
  {
    title: "هلاي على سلة وزد",
    tag: "جديد",
    desc: "أستوديو المنتجات والتسويق والإعلانات و UGC — مباشرة داخل لوحة متجرك وكاشير KUBE.",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/ff003dae9963a722e9bfa4fcad1eb47a/thumbnails/thumbnail.jpg?height=720",
    action: "mcp",
  },
  {
    title: "ستوري بورد",
    tag: "جديد",
    desc: "حوّل فكرتك وصورتك إلى ستوري بورد متعدد المشاهد لحملات مقهى KUBE",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c43e443131757e6b7f81f374a372b878/thumbnails/thumbnail.jpg?height=720",
    action: "super_agent",
  },
];

// Real UGC Creators (Section 7)
const UGC_CREATORS = [
  {
    name: "SULTAN | سلطان",
    views: "128K",
    likes: "12K",
    role: "عاشق الاسبريسو",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c43e443131757e6b7f81f374a372b878/thumbnails/thumbnail.jpg?height=720",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/sultan.png",
  },
  {
    name: "NOURA | نورة",
    views: "45.2K",
    likes: "3.1K",
    role: "طالبة عمارة ومقهى",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/olivia.png",
  },
  {
    name: "NADA | ندى",
    views: "34.5K",
    likes: "1.5K",
    role: "خبيرة الحلى والكرواسون",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c0f730d37d2ed4bb3317d72b0fa90d3d/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/hessa.png",
  },
  {
    name: "REEMA | ريما",
    views: "89.1K",
    likes: "3.1K",
    role: "صانعة محتوى لايف ستايل",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/39f9db1609f3f361a19305ba50055c8c/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/reema.png",
  },
  {
    name: "AHMED | أحمد",
    views: "210K",
    likes: "42K",
    role: "مستشار مالي وروقان الصباح",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/2a49a2d7160ede172fb4b0e6f4756a33/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/faisal.png",
  },
];

// Real Templates (Section 6)
const TEMPLATES_ITEMS = [
  {
    title: "مشجع في المدرج",
    cat: "مشاهير",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/24512104ff8cc84b24db6ea92b9df10a/thumbnails/thumbnail.jpg?height=720",
  },
  {
    title: "وصول المشاهير",
    cat: "مشاهير",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/2bd5a81ba7055b5e5d434e3926a8945f/thumbnails/thumbnail.jpg?height=720",
  },
  {
    title: "ريلز المنتج والسكب",
    cat: "التجارة الإلكترونية",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/596cd3d2de2560a3bf2c9a12c7e9bef7/thumbnails/thumbnail.jpg?height=720",
  },
  {
    title: "سيلفي سيارة فاخرة مع قهوة",
    cat: "مشاهير",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/28344dc091e4acf786c7622ad1fdeb10/thumbnails/thumbnail.jpg?height=720",
  },
  {
    title: "جلسة تصوير أزياء ومقهى",
    cat: "الملابس",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e437e1ee09c9818b4b1370de1f8e92cf/thumbnails/thumbnail.jpg?height=720",
  },
  {
    title: "صورة احترافية مع العلم",
    cat: "اليوم الوطني",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/27ad80f674f0cd970046d7985749890a/thumbnails/thumbnail.jpg?height=720",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

function HalaiMarketingPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const backHomeUrl = primaryRoleHome(currentUser.data?.roles ?? []);

  // Studio Modal Active State (if user opens a full interactive studio workspace)
  const [activeStudioModal, setActiveStudioModal] = useState<
    "none" | "super_agent" | "product_3d" | "ugc_studio" | "ads_9x" | "models_api" | "promlog"
  >("none");

  // Mobile drawer toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ==========================================
  // Super Agent Interactive State
  // ==========================================
  const [agentInputText, setAgentInputText] = useState("");
  const [selectedUgcFormat, setSelectedUgcFormat] = useState<UgcFormat>(SAUDI_UGC_FORMATS[0]);
  const [selectedEngine, setSelectedEngine] = useState("تلقائي (Omni Flash 1.1)");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "agent",
      text: "أهلاً بك زياد عيسى في سوبر ايجنت KUBE! ☕️⚡️\nالمحرك مدرب على لهجة الرياض وأسرار القهوة المختصة ونبرة برق و STC. اختر أي صيغة UGC أو اسألني لأصيغ لك إعلانات سينمائية فوراً.",
      timestamp: "الآن",
    },
  ]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // ==========================================
  // 3D Product Studio Interactive State
  // ==========================================
  const [lightingDirection, setLightingDirection] = useState<"top" | "front" | "right" | "left" | "rim_back" | "bottom">(
    "front",
  );
  const [lightingIntensity, setLightingIntensity] = useState<"soft" | "hard">("soft");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("9:16");
  const [selectedPreset, setSelectedPreset] = useState<ProductStudioPreset>(KUBE_PRODUCT_STUDIO_PRESETS[0]);
  const [productUrlInput, setProductUrlInput] = useState("");
  const [isRendering3D, setIsRendering3D] = useState(false);

  // ==========================================
  // UGC & Personas State
  // ==========================================
  const [activeCreator, setActiveCreator] = useState(UGC_CREATORS[0]);
  const [ugcScriptOutput, setUgcScriptOutput] = useState<string | null>(null);

  // ==========================================
  // Ads 9-Pack Generator State
  // ==========================================
  const [adsProductTitle, setAdsProductTitle] = useState("كولد برو كيني مركز");
  const [generated9Pack, setGenerated9Pack] = useState<Array<{ title: string; prompt: string; tag: string }> | null>(
    null,
  );

  // ==========================================
  // API Model Hub State
  // ==========================================
  const [selectedModelForApi, setSelectedModelForApi] = useState<AiModelEngine>(HALAI_AI_MODELS_CATALOG[0]);

  // Copy helper
  const handleCopy = (text: string, label = "المحتوى") => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح!`);
  };

  // Super Agent send handler
  const handleSendAgent = (textToSend?: string) => {
    const text = textToSend || agentInputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "الآن",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setAgentInputText("");
    setIsAgentTyping(true);

    setTimeout(() => {
      const replyText = `يا هلا زياد! أبشر بعزك ☕️✨\nتم توجيه المحرك (${selectedEngine}) لصياغة سكريبت بصري بالصيغة: "${selectedUgcFormat.nameAr}"\n\n📌 المشهد: لقطة ماكرو 4K مع تكثيف قطرات الندى على كوب كولد برو KUBE الأسود المطفي.\n🎙️ الصوت: "إذا يومك ما بدأ بقطرة تروق المخ... KUBE يضبط مزاجك بضغطة زر".\n⚡️ البرومبت الجاهز للإنتاج:\n${selectedUgcFormat.promptDirective}\n\nجاهز للتوليد الفوري على Kling 3 Turbo أو Google Veo 3.1!`;

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: replyText,
        timestamp: "الآن",
      };
      setChatMessages((prev) => [...prev, agentMsg]);
      setIsAgentTyping(false);
    }, 700);
  };

  // Trigger 9-Pack Generation
  const handleGenerate9Pack = () => {
    toast.info("جاري تحويل المنتج إلى 9 زوايا إعلانية...");
    setTimeout(() => {
      setGenerated9Pack([
        {
          title: "زاوية الماكرو والسكب",
          prompt: `Cinematic macro 8k commercial shot of ${adsProductTitle}, slow motion milk swirl dripping, studio spotlight, Hasselblad lens f/1.4`,
          tag: "انستقرام 1:1",
        },
        {
          title: "سيلفي المقهى والشمس",
          prompt: `Saudi youth holding ${adsProductTitle} at sleek concrete Riyadh cafe, natural morning golden hour, candid realism, 9:16`,
          tag: "تيك توك 9:16",
        },
        {
          title: "ستايل الشارع الفاخر",
          prompt: `Street style photography on Prince Turki Road Riyadh, luxury black KUBE cup, minimalist neon lighting, 4:5 vertical`,
          tag: "سناب شات 9:16",
        },
        {
          title: "عرض الصباح والدوام",
          prompt: `Modern laptop setup with ${adsProductTitle} and butter croissant, crisp architectural studio lighting, high conversion commercial`,
          tag: "تويتر 16:9",
        },
        {
          title: "إضاءة النيون المسائية",
          prompt: `Matte black cup under amber and emerald neon glow, dark luxury moody cafe vibe, ultra-sharp detail`,
          tag: "ريلز 9:16",
        },
        {
          title: "زاوية السكب البطيء",
          prompt: `Crystal clear ice cubes falling into rich espresso cold drip, volumetric mist, phantom flex 4k camera`,
          tag: "إعلان فيديو",
        },
        {
          title: "لقطة السيارة الفاخرة",
          prompt: `POV hand holding cup inside luxury car cup holder, Riyadh skyline sunset background, cinematic depth of field`,
          tag: "ستوري 9:16",
        },
        {
          title: "الرخام الأسود والظل",
          prompt: `Black nero marquina marble pedestal holding the coffee, rim backlighting, elegant typography space`,
          tag: "كتالوج 1:1",
        },
        {
          title: "عرض البوكس والتموين",
          prompt: `KUBE gathering coffee box with 6 bottles lined up on wooden terrace, festive gathering vibe, daylight`,
          tag: "حملة بوكسات",
        },
      ]);
      toast.success("تم توليد الـ 9 إعلانات بنجاح!");
    }, 600);
  };

  return (
    <div
      dir="rtl"
      className="w-full min-h-screen bg-black text-white selection:bg-[#74ff52] selection:text-black font-sans overflow-x-hidden antialiased"
      style={{
        backgroundColor: "#000000",
        fontFamily: '"IBM Plex Sans Arabic", "PingARLT", "Rubik", sans-serif',
      }}
    >
      {/* ============================================================== */}
      {/* 1. FIXED TOPBAR (Exact Halai Header Structure)                 */}
      {/* ============================================================== */}
      <header
        data-app-topbar="true"
        className="h-12 md:h-16 flex items-center justify-between px-3 md:px-8 shrink-0 z-[9999] w-full transition-all duration-300 fixed top-0 left-0 bg-black/60 backdrop-blur-xl border-b border-white/5"
      >
        {/* Right Section: Mobile Menu + Logo + Desktop Nav */}
        <div className="flex items-center h-full gap-2 md:gap-5">
          {/* Mobile Menu Drawer Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden -ms-2.5 me-1.5 w-10 h-10 shrink-0 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
          >
            <MenuIcon className="w-5 h-5" />
          </button>

          {/* KUBE Halai Logo */}
          <Link to="/admin/marketing" className="h-8 md:h-12 flex items-center shrink-0 cursor-pointer hover:scale-105 transition-transform gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#74ff52] to-emerald-600 shadow-lg shadow-[#74ff52]/20 text-black font-black text-sm">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-wider text-white">KUBE</span>
              <span className="text-[#74ff52] font-bold text-sm">هلاي AI</span>
            </div>
          </Link>

          {/* Desktop Navigation Items */}
          <nav className="hidden xl:flex items-center gap-0.5 h-full ms-3">
            <button
              onClick={() => setActiveStudioModal("product_3d")}
              className="flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <ImageIcon className="w-4 h-4" />
              <span>صور</span>
            </button>

            <button
              onClick={() => setActiveStudioModal("ugc_studio")}
              className="flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <Video className="w-4 h-4" />
              <span>فيديو</span>
            </button>

            <a
              href="#templates-section"
              className="flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>تطبيقات</span>
            </a>

            {/* Studio Dropdown / Launcher */}
            <button
              onClick={() => setActiveStudioModal("product_3d")}
              className="group flex items-center gap-1.5 text-sm font-medium transition-colors h-full px-2.5 text-zinc-400 hover:text-white"
            >
              <Layers className="w-4 h-4 text-[#74ff52]" />
              <span>الاستديو</span>
            </button>

            <a
              href="#mcp-section"
              className="flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06]"
            >
              <Radio className="w-4 h-4 text-purple-400" />
              <span>اتصال MCP</span>
              <span className="text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 shrink-0 bg-transparent text-white border border-white/30">
                Beta
              </span>
            </a>

            <button
              onClick={() => setActiveStudioModal("super_agent")}
              className="flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10"
            >
              <Bot className="w-4 h-4 text-[#74ff52]" />
              <span>سوبر ايجنت</span>
              <span className="text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 shrink-0 bg-[#74ff52] text-black">
                جديد
              </span>
            </button>
          </nav>
        </div>

        {/* Left Section: Back to ERP + Library + Profile */}
        <div className="flex items-center gap-2.5 md:gap-4">
          <Link
            to={backHomeUrl}
            className="flex items-center gap-1.5 h-8 ps-2 pe-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs md:text-sm font-medium transition-all"
            title="العودة لنظام إدارة كافيه KUBE"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">لوحة KUBE</span>
          </Link>

          <button
            onClick={() => setActiveStudioModal("promlog")}
            className="flex items-center gap-1.5 h-8 ps-2 pe-3 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs md:text-sm font-medium transition-all"
          >
            <FolderOpen className="w-4 h-4" />
            <span className="hidden sm:inline">المكتبة</span>
          </button>

          <button
            onClick={() => toast.info("لا توجد إشعارات جديدة")}
            className="relative flex items-center justify-center w-8 h-8 rounded-[10px] bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
          >
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 end-1 w-1.5 h-1.5 rounded-full bg-[#74ff52]" />
          </button>

          {/* User Profile Capsule with Glowing Ring */}
          <div className="flex items-center gap-2 relative">
            <div className="relative flex items-center justify-center w-[36px] h-[36px] md:w-[44px] md:h-[44px]">
              <svg width="44" height="44" className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle
                  cx="22"
                  cy="22"
                  r="20"
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray="125"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ stroke: "#74ff52" }}
                />
              </svg>
              <div
                className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg overflow-hidden cursor-pointer"
                title="زياد عيسى • VIP غير محدود"
              >
                <span>ز</span>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-white block">زياد عيسى</span>
              <span className="text-[10px] text-[#74ff52] font-mono block">VIP داخلي • غير محدود</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. SECTION 1: HERO (100vh Full Screen Edge-to-Edge)            */}
      {/* ============================================================== */}
      <section className="relative h-[100vh] min-h-[700px] flex flex-col items-center justify-center text-center px-4 md:px-6 overflow-hidden shrink-0 pt-16">
        {/* Background Stream Loop */}
        <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
          <img
            src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/40dba6a71d8013595711298206cc8d48/thumbnails/thumbnail.jpg?height=720"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105 transition-transform duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-6xl w-full space-y-6 md:space-y-8 animate-in fade-in duration-1000 px-4">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black uppercase text-white leading-[0.85] drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] tracking-tighter">
            ابدع <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#74ff52] via-[#74ff52] to-[#74ff52]/40">
              بلا حدود.
            </span>
          </h1>

          {/* Floating Engine Logos Row */}
          <div className="flex items-center justify-center gap-1.5 md:gap-3 flex-wrap max-w-4xl mx-auto py-2">
            {ENGINE_LOGOS.map((eng, idx) => (
              <div
                key={idx}
                title={eng.name}
                onClick={() => {
                  setSelectedEngine(eng.name);
                  setActiveStudioModal("super_agent");
                  toast.success(`تم اختيار محرك ${eng.name}`);
                }}
                className="w-7 h-7 sm:w-9 sm:h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shrink-0 hover:bg-white/15 hover:scale-110 hover:border-[#74ff52]/50 transition-all duration-300 cursor-pointer shadow-lg"
              >
                <img
                  src={eng.icon}
                  alt={eng.name}
                  className={`w-4 h-4 md:w-6 md:h-6 object-contain ${eng.invert ? "brightness-0 invert" : ""}`}
                />
              </div>
            ))}
          </div>

          <p className="text-base sm:text-lg md:text-2xl text-zinc-300 font-light max-w-3xl mx-auto leading-relaxed drop-shadow-md px-4">
            محركات توليدية مضبوطة بدقة للجيل القادم من المبدعين في كافيه ومطبخ KUBE.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap pt-2">
            <button
              onClick={() => setActiveStudioModal("super_agent")}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-[14px] bg-[#74ff52] hover:bg-[#62e043] text-black font-black text-sm md:text-base shadow-xl shadow-[#74ff52]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>أطلق سوبر ايجنت ▶</span>
            </button>

            <button
              onClick={() => setActiveStudioModal("product_3d")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px] bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-sm md:text-base backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
            >
              <Layers className="w-4 h-4 text-[#74ff52]" />
              <span>استديو المنتجات 3D</span>
            </button>

            <button
              onClick={() => setActiveStudioModal("ads_9x")}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-[14px] bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200 font-bold text-sm md:text-base backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>استديو الإعلانات 9x</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. SECTION 2: SHOWCASE CARDS (Horizontal Scrollable Stream)     */}
      {/* ============================================================== */}
      <section className="pt-2 pb-16 w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="relative">
          <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-2 scrollbar-none">
            {SHOWCASE_CARDS.map((card, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (card.action === "product_studio") setActiveStudioModal("product_3d");
                  else if (card.action === "ugc_studio") setActiveStudioModal("ugc_studio");
                  else if (card.action === "ads_studio") setActiveStudioModal("ads_9x");
                  else if (card.action === "models") setActiveStudioModal("models_api");
                  else setActiveStudioModal("super_agent");
                }}
                className="group relative shrink-0 snap-start w-[82vw] sm:w-[50vw] md:w-[380px] lg:w-[420px] aspect-[16/10] rounded-[22px] overflow-hidden bg-zinc-900 text-right ring-1 ring-white/10 hover:ring-[#74ff52]/50 transition-all cursor-pointer shadow-2xl"
              >
                <div className="absolute inset-0 block transition-transform duration-700 group-hover:scale-105">
                  <img src={card.thumb} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Badge Tag */}
                <span className="absolute top-4 start-4 z-20 font-bold text-xs uppercase px-2.5 py-1 rounded-sm -skew-x-12 shadow-xl bg-[#74ff52] text-black">
                  {card.tag}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 space-y-1.5">
                  <span className="block text-xl md:text-2xl font-black uppercase tracking-tight text-white">
                    {card.title}
                  </span>
                  <p className="text-xs md:text-sm text-zinc-300 line-clamp-2 leading-relaxed">{card.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#74ff52] pt-2">
                    جرّبه الآن <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. SECTION 3: 3D PRODUCT STUDIO (30s Ad Showcase)               */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-16 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#74ff52] animate-pulse" />
              <span className="text-xs font-bold text-[#74ff52] font-mono uppercase tracking-wider">استديو التسويق 2.0</span>
            </div>

            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-white">
              حوّل أي منتج
              <span className="block text-[#a9a9b0]">إلى إعلان مدته 30 ثانية</span>
            </h2>

            <p className="max-w-[520px] text-base md:text-lg leading-relaxed text-white/75">
              اكتب سطرًا واحدًا عن قهوة KUBE، ونكتب القصة مشهدًا بمشهد ونصوّرها لك بالصوت وإضاءة الاستديو ثلاثية الأبعاد.
            </p>

            <button
              onClick={() => setActiveStudioModal("product_3d")}
              className="inline-flex items-center justify-center gap-2 px-9 h-12 rounded-[14px] bg-[#74ff52] hover:bg-[#62e043] text-black font-black text-sm shadow-xl shadow-[#74ff52]/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Layers className="w-4 h-4 fill-current" />
              <span>أنشئ إعلانًا ثلاثي الأبعاد</span>
            </button>
          </div>

          {/* Interactive Phone Mockup Carousel */}
          <div className="relative mx-auto w-full max-w-[500px] flex items-center justify-center">
            <div className="relative w-[260px] md:w-[280px] aspect-[9/16] rounded-[28px] overflow-hidden border-2 border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] bg-zinc-950 group">
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720"
                alt="KUBE Specialty Coffee"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#74ff52] border border-[#74ff52]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#74ff52] animate-pulse" />
                <span>3D Lighting • Hasselblad</span>
              </div>

              <div className="absolute bottom-5 right-5 left-5 space-y-1">
                <span className="text-sm font-black text-white block">كولد برو كيني مركز</span>
                <span className="text-[11px] text-zinc-300 block">إضاءة أمامية ناعمة • جودة 4K</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. SECTION 4: CHARACTER STUDIO (Saudi Personas)                */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-16 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#74ff52] font-mono">استوديو الشخصيات</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-bold bg-[#74ff52] text-black">
                  جديد
                </span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">
                شخصيتك، نجم مقطعك القادم
              </h2>
              <p className="text-base md:text-lg text-white/70 max-w-xl">
                صمّم الشخصية مرة واحدة، ثم اجعل الوجه نفسه بطل كل فيديو وحملة لكافيه KUBE.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("ugc_studio")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm transition-all self-start md:self-auto"
            >
              <span>اصنع شخصيتك</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Characters Avatar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {SAUDI_CREATOR_PERSONAS.map((creator) => (
              <div
                key={creator.id}
                onClick={() => {
                  setActiveCreator({
                    name: creator.name,
                    views: "128K",
                    likes: "12K",
                    role: creator.bio,
                    thumb: creator.avatarUrl,
                    avatar: creator.avatarUrl,
                  });
                  setActiveStudioModal("ugc_studio");
                  toast.success(`تم اختيار شخصية ${creator.name}`);
                }}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#74ff52] cursor-pointer transition-all shadow-xl"
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                </div>

                <div className="absolute bottom-3 right-3 left-3">
                  <span className="text-xs font-black text-white block truncate">{creator.name}</span>
                  <span className="text-[10px] text-zinc-400 block truncate">{creator.bio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SECTION 5: SUPER AGENT (Creative Team)                      */}
      {/* ============================================================== */}
      <section className="px-4 sm:px-6 md:px-12 py-16 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 sm:p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-6 text-right">
            <span className="text-xs font-mono uppercase text-[#74ff52] font-bold">فريقك الإبداعي</span>
            <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">سوبر ايجنت KUBE</h2>
            <p className="text-base md:text-lg text-zinc-300 leading-relaxed">
              وكيل ذكاء اصطناعي سعودي فائق التطور، يكتب السكريبتات الإعلانية، يضبط إضاءة الكافيه، ويطلق الحملات في ثوانٍ.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={() => setActiveStudioModal("super_agent")}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#74ff52] hover:bg-[#62e043] text-black font-black text-sm shadow-xl shadow-[#74ff52]/20 hover:scale-105 transition-all"
              >
                <Bot className="w-4 h-4 fill-current" />
                <span>جرّب سوبر ايجنت الآن</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. SECTION 6: TEMPLATES (Ready Apps)                            */}
      {/* ============================================================== */}
      <section id="templates-section" className="relative py-16 md:py-24 w-full overflow-hidden border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-none">
                تطبيقات
                <span className="block text-[#74ff52]">جاهزة للإبداع</span>
              </h2>
              <p className="text-base md:text-lg text-white/70 max-w-2xl">
                تخطى كتابة البرومت. استخدم قوالبنا المصممة باحترافية لإنشاء محتوى لكافيه KUBE في ثوانٍ.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("super_agent")}
              className="group flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all self-start md:self-auto"
            >
              <span className="text-white font-bold text-xs">استكشف كل القوالب</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Templates Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {TEMPLATES_ITEMS.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  toast.success(`تم اختيار قالب "${tmpl.title}" ونقله لسوبر ايجنت`);
                  setActiveStudioModal("super_agent");
                }}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#74ff52] transition-all cursor-pointer shadow-xl"
              >
                <div className="aspect-[3/4] w-full overflow-hidden">
                  <img
                    src={tmpl.img}
                    alt={tmpl.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                </div>
                <div className="p-3 space-y-1 text-right">
                  <span className="text-[10px] font-mono text-[#74ff52] block">{tmpl.cat}</span>
                  <span className="text-xs font-black text-white block truncate">{tmpl.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 8. SECTION 7: UGC 2.0 (High-Realism Videos)                     */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-16 md:py-24 border-t border-white/5">
        <div className="relative z-30 mx-auto max-w-[1600px] px-4 md:px-8 space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold font-mono text-[#74ff52] uppercase">UGC Studio 2.0</span>
            <h2 className="text-4xl md:text-6xl font-black text-white">أنشئ مقاطع يو جي سي عالية الواقعية</h2>
            <p className="text-sm md:text-base text-zinc-400">
              أصوات سعودية ونبرات طبيعية تناسب إعلانات تيك توك وسناب شات وريلز.
            </p>
          </div>

          {/* Horizontal Video Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {UGC_CREATORS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveCreator(item);
                  setActiveStudioModal("ugc_studio");
                }}
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer hover:border-[#74ff52] transition-all shadow-xl"
              >
                <div className="aspect-[9/15] w-full relative overflow-hidden">
                  <img
                    src={item.thumb}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                  {/* Metrics Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white">
                    <span>▶ {item.views}</span>
                    <span>♥ {item.likes}</span>
                  </div>

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#74ff52] text-black flex items-center justify-center shadow-2xl">
                      <Play className="w-5 h-5 fill-current mr-0.5" />
                    </div>
                  </div>

                  {/* Creator Info */}
                  <div className="absolute bottom-3 right-3 left-3 flex items-center gap-2">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-7 h-7 rounded-full object-cover border border-white/40 shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-[11px] font-bold text-white block truncate">{item.name}</span>
                      <span className="text-[9px] text-zinc-400 block truncate">{item.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. SECTION 8: ADS STUDIO 9x (9-Pack Multi-Ratio)               */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-16 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="text-xs font-bold font-mono text-[#74ff52]">رائج</span>
              <h2 className="text-4xl md:text-6xl font-black text-white">استديو الإعلانات — ٩ صور من لقطة واحدة</h2>
              <p className="text-sm md:text-base text-zinc-400 max-w-xl">
                أنشئ صور إعلانية عالية التحويل. 9 صور احترافية تناسب كل أنواع الحملات وكل المقاسات.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("ads_9x")}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#74ff52] hover:bg-[#62e043] text-black font-black text-sm shadow-xl shadow-[#74ff52]/20 hover:scale-105 transition-all self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>ابدأ التوليد 9x</span>
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. SECTION 9: MOTION LIVE (نسختك المُطابقة)                    */}
      {/* ============================================================== */}
      <section className="relative py-20 bg-black border-t border-white/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Mockup with live pulsing ring */}
            <div className="relative shrink-0">
              <div className="w-[240px] md:w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border-2 border-zinc-800 shadow-2xl bg-zinc-950 relative">
                <img
                  src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720"
                  alt="Motion Control"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-mono text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#74ff52] animate-pulse" />
                  <span>LIVE Motion</span>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-center lg:text-right max-w-xl">
              <span className="text-xs font-mono uppercase text-[#74ff52] font-bold">LIVE</span>
              <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">نسختك المُطابقة</h2>
              <p className="text-base text-zinc-300 leading-relaxed">
                انقل الحركة الحقيقية إلى أي شخصية أو فنجان قهوة. ارفع مشية، تلويحة، أو سكب — وشاهد إبداعك يتحرك تماماً مثلك.
              </p>

              <div className="grid grid-cols-3 gap-3 pt-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-lg font-black text-white block">30s</span>
                  <span className="text-[10px] text-zinc-400">أقصى مدة</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-lg font-black text-white block">4K</span>
                  <span className="text-[10px] text-zinc-400">أعلى دقة</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-lg font-black text-[#74ff52] block">Pro</span>
                  <span className="text-[10px] text-zinc-400">مطابقة الحركة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 11. SECTION 10: MODELS & API CATALOG                            */}
      {/* ============================================================== */}
      <section className="py-16 md:py-24 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono text-[#74ff52]">المحركات ونماذج الـ API</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">كتالوج النماذج العالمية للربط البرمجي</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              حصر شامل لمحركات Kling, Veo, WanX, Flux, Grok, Omni مع وثائق الـ Endpoints الجاهزة للربط مع سيرفرات KUBE.
            </p>
          </div>

          <button
            onClick={() => setActiveStudioModal("models_api")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all self-start md:self-auto"
          >
            <Code className="w-4 h-4 text-[#74ff52]" />
            <span>عرض وثائق الـ API كاملة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {HALAI_AI_MODELS_CATALOG.slice(0, 8).map((model) => (
            <div
              key={model.id}
              onClick={() => {
                setSelectedModelForApi(model);
                setActiveStudioModal("models_api");
              }}
              className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 space-y-3 hover:border-[#74ff52] cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{model.nameAr}</span>
                  <span className="text-[10px] font-mono text-[#74ff52] bg-white/5 px-2 py-0.5 rounded-md">
                    {model.provider}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{model.descriptionAr}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 pt-2 border-t border-white/5">
                <span>{model.maxResolution}</span>
                <span>{model.maxDuration}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 12. SECTION 11: MCP INTEGRATIONS (Salla & Zid & POS)           */}
      {/* ============================================================== */}
      <section id="mcp-section" className="py-16 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 space-y-4">
            <span className="text-xs font-mono text-[#74ff52]">متوفر في متجر تطبيقات سلة</span>
            <h3 className="text-2xl font-black text-white">عزّز متجرك في سلة</h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم سلة مباشرة وبمزامنة فورية مع كاشير KUBE.
            </p>
            <button
              onClick={() => toast.success("تم تفعيل موصّل سلة مع KUBE POS بنجاح")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              <span>اتصال سلة MCP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-8 space-y-4">
            <span className="text-xs font-mono text-[#74ff52]">متوفر في متجر تطبيقات زد</span>
            <h3 className="text-2xl font-black text-white">عزّز متجرك في زد</h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم زد مباشرة وبمزامنة فورية مع نظام KUBE ERP.
            </p>
            <button
              onClick={() => toast.success("تم تفعيل موصّل زد مع KUBE ERP بنجاح")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
            >
              <span>اتصال زد MCP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 13. SECTION 12: PROMLOG (Prompt Library Bank)                   */}
      {/* ============================================================== */}
      <section className="py-16 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono text-[#74ff52]">وصول مجاني</span>
            <h2 className="text-3xl md:text-5xl font-black text-white">بروملوق — بنك برومبتات القهوة</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              مكتبة خاصة من البرومتات الجاهزة للتنفيذ، احصل عليها فوراً وانشر إبداعك.
            </p>
          </div>

          <button
            onClick={() => setActiveStudioModal("promlog")}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs transition-all self-start md:self-auto"
          >
            <FolderOpen className="w-4 h-4 text-[#74ff52]" />
            <span>عرض كل البرومبتات (40+)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAUDI_VISUAL_PROMPTS.slice(0, 3).map((vp) => (
            <div
              key={vp.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 p-5 space-y-3 flex flex-col justify-between hover:border-[#74ff52]/50 transition-all"
            >
              <div className="space-y-2 text-right">
                <span className="text-[10px] font-mono text-[#74ff52] uppercase block">{vp.category}</span>
                <h4 className="text-sm font-black text-white">{vp.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{vp.arabicPrompt}</p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-zinc-400 line-clamp-3 select-all">
                  {vp.englishPrompt}
                </div>
              </div>

              <button
                onClick={() => handleCopy(vp.englishPrompt, vp.title)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-[#74ff52] hover:text-black text-zinc-200 font-bold text-xs transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ البرومبت بالإنجليزية</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 14. FOOTER (Exact Halai Footer Style)                          */}
      {/* ============================================================== */}
      <footer className="w-full border-t border-white/10 bg-black py-12 px-4 md:px-8 text-zinc-400 text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#74ff52] text-black font-black text-xs">
              K
            </div>
            <span className="font-bold text-white text-sm">KUBE هلاي AI</span>
            <span>— منظومة الذكاء الاصطناعي التوليدي الخاصة بكافيه ومطبخ KUBE</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to={backHomeUrl} className="hover:text-white transition-colors">
              لوحة التحكم الرئيسية
            </Link>
            <button onClick={() => setActiveStudioModal("super_agent")} className="hover:text-white transition-colors">
              سوبر ايجنت
            </button>
            <button onClick={() => setActiveStudioModal("product_3d")} className="hover:text-white transition-colors">
              استديو المنتجات 3D
            </button>
            <button onClick={() => setActiveStudioModal("models_api")} className="hover:text-white transition-colors">
              محركات API
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            الرياض، المملكة العربية السعودية • إصدار 2026 Studio
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 15. INTERACTIVE WORKSPACE MODAL OVERLAY                        */}
      {/* ============================================================== */}
      {activeStudioModal !== "none" && (
        <div className="fixed inset-0 z-[10000] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-6xl h-[92vh] rounded-[28px] border border-white/15 bg-[#121212] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Topbar */}
            <div className="h-14 px-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/80 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#74ff52] text-black flex items-center justify-center font-black text-xs">
                  ⚡️
                </div>
                <span className="text-sm font-black text-white">
                  {activeStudioModal === "super_agent" && "سوبر ايجنت KUBE — محادثة فورية وتوليد إعلانات"}
                  {activeStudioModal === "product_3d" && "استديو المنتجات 3D — إضاءة وزوايا ثلاثية الأبعاد"}
                  {activeStudioModal === "ugc_studio" && "استديو UGC 2.0 — الشخصيات والسكريبتات"}
                  {activeStudioModal === "ads_9x" && "استديو الإعلانات 9x — حزمة الـ 9 زوايا"}
                  {activeStudioModal === "models_api" && "كتالوج نماذج ومحركات الذكاء الاصطناعي (API)"}
                  {activeStudioModal === "promlog" && "بروملوق — بنك برومبتات كافيه KUBE"}
                </span>
              </div>

              <button
                onClick={() => setActiveStudioModal("none")}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 text-white flex items-center justify-center transition-colors"
                title="إغلاق النافذة"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
              {/* MODAL 1: SUPER AGENT WORKSPACE */}
              {activeStudioModal === "super_agent" && (
                <div className="h-full flex flex-col justify-between space-y-4">
                  {/* Chat Stream */}
                  <div className="flex-1 overflow-y-auto space-y-3.5 pr-2">
                    {chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                            msg.sender === "user" ? "bg-amber-500 text-black" : "bg-[#74ff52] text-black font-black"
                          }`}
                        >
                          {msg.sender === "user" ? "ز" : "K"}
                        </div>
                        <div
                          className={`max-w-[80%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed whitespace-pre-wrap ${
                            msg.sender === "user"
                              ? "bg-[#74ff52] text-black font-medium"
                              : "bg-zinc-900 border border-white/10 text-white"
                          }`}
                        >
                          {msg.text}
                        </div>
                      </div>
                    ))}

                    {isAgentTyping && (
                      <div className="flex items-center gap-2 text-xs text-[#74ff52] font-mono animate-pulse">
                        <Bot className="w-4 h-4" />
                        <span>سوبر ايجنت يصيغ المحتوى البصري...</span>
                      </div>
                    )}
                  </div>

                  {/* Input Capsule with Format & Engine Selectors */}
                  <div className="space-y-3 pt-3 border-t border-white/10 shrink-0">
                    {/* UGC Format Quick Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                      {SAUDI_UGC_FORMATS.slice(0, 6).map((fmt) => (
                        <button
                          key={fmt.id}
                          onClick={() => {
                            setSelectedUgcFormat(fmt);
                            handleSendAgent(`اكتب لي إعلان بصيغة: ${fmt.nameAr}`);
                          }}
                          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all ${
                            selectedUgcFormat.id === fmt.id
                              ? "bg-[#74ff52] text-black"
                              : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                          }`}
                        >
                          {fmt.nameAr}
                        </button>
                      ))}
                    </div>

                    <div className="relative flex items-center gap-2 rounded-2xl bg-zinc-900 border border-white/15 p-2">
                      <input
                        type="text"
                        value={agentInputText}
                        onChange={(e) => setAgentInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendAgent()}
                        placeholder="...اطلب من سوبر ايجنت أي إعلان، سكريبت، أو جلسة تصوير لقهوة KUBE"
                        className="flex-1 bg-transparent px-3 py-2 text-xs md:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSendAgent()}
                        className="w-10 h-10 rounded-xl bg-[#74ff52] hover:bg-[#62e043] text-black flex items-center justify-center shadow-lg shrink-0 transition-transform active:scale-95"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 2: 3D PRODUCT STUDIO WORKSPACE */}
              {activeStudioModal === "product_3d" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
                  {/* Left: 4K Preview Stage */}
                  <div className="lg:col-span-8 rounded-2xl border border-white/10 bg-zinc-950 p-6 flex flex-col justify-between items-center relative overflow-hidden">
                    <div className="relative aspect-[9/16] w-full max-w-[320px] rounded-2xl overflow-hidden shadow-2xl bg-black">
                      <img
                        src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720"
                        alt="3D Coffee"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#74ff52] border border-[#74ff52]/30">
                        {lightingDirection} • {lightingIntensity} • {aspectRatio}
                      </div>
                    </div>

                    <div className="w-full flex items-center justify-between text-xs pt-4 border-t border-white/10">
                      <div>
                        <span className="font-bold text-white block">كوب KUBE الأسود المطفي — رخام نيرو</span>
                        <span className="text-[10px] text-zinc-400 font-mono">Hasselblad 85mm f/1.4 • 8K Cinema</span>
                      </div>
                      <button
                        onClick={() => toast.success("جاري تحميل الصورة الأصلية بدقة 4K")}
                        className="rounded-xl bg-[#74ff52] text-black font-black px-4 py-2 hover:bg-[#62e043]"
                      >
                        تحميل 4K
                      </button>
                    </div>
                  </div>

                  {/* Right: Controls Console */}
                  <div className="lg:col-span-4 rounded-2xl border border-white/10 bg-zinc-900 p-5 space-y-5 text-xs text-right">
                    <h3 className="font-black text-sm text-white">إعدادات الإضاءة ثلاثية الأبعاد</h3>

                    {/* Lighting 6 Axis */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 block">اتجاه الإضاءة:</label>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { id: "top", label: "أعلى" },
                          { id: "front", label: "أمام" },
                          { id: "right", label: "يمين" },
                          { id: "left", label: "يسار" },
                          { id: "rim_back", label: "خلف" },
                          { id: "bottom", label: "أسفل" },
                        ].map((btn) => (
                          <button
                            key={btn.id}
                            onClick={() => setLightingDirection(btn.id as any)}
                            className={`py-2 rounded-lg font-bold text-xs transition-all ${
                              lightingDirection === btn.id
                                ? "bg-[#74ff52] text-black"
                                : "bg-black/60 border border-white/10 text-zinc-300 hover:text-white"
                            }`}
                          >
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Interactive 3D Sphere */}
                    <div className="rounded-xl border border-white/10 bg-black/60 p-4 text-center space-y-2">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-[#74ff52]/40 mx-auto flex items-center justify-center relative shadow-inner">
                        <div
                          className={`w-5 h-5 rounded-full bg-[#74ff52] shadow-lg shadow-[#74ff52]/50 transition-transform duration-300 ${
                            lightingDirection === "top"
                              ? "-translate-y-5"
                              : lightingDirection === "bottom"
                              ? "translate-y-5"
                              : lightingDirection === "left"
                              ? "-translate-x-5"
                              : lightingDirection === "right"
                              ? "translate-x-5"
                              : "scale-125"
                          }`}
                        />
                      </div>
                      <span className="text-[10px] text-zinc-500 block font-mono">اسحب لتغيير اتجاه الضوء 3D</span>
                    </div>

                    {/* Aspect Ratios */}
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-zinc-400 block">نسبة الأبعاد:</label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {(["9:16", "1:1", "4:5", "16:9"] as const).map((ratio) => (
                          <button
                            key={ratio}
                            onClick={() => setAspectRatio(ratio)}
                            className={`py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                              aspectRatio === ratio
                                ? "bg-white text-black"
                                : "bg-black/60 border border-white/10 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toast.info("جاري ريندر المشهد ثلاثي الأبعاد...");
                        setTimeout(() => toast.success("تم تحديث الريندر بنجاح!"), 700);
                      }}
                      className="w-full py-3 rounded-xl bg-[#74ff52] text-black font-black text-xs shadow-lg shadow-[#74ff52]/20"
                    >
                      تحديث الريندر فوراً
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL 3: UGC STUDIO WORKSPACE */}
              {activeStudioModal === "ugc_studio" && (
                <div className="space-y-6 text-right">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h3 className="font-black text-base text-white">استديو شخصيات UGC 2.0</h3>
                      <p className="text-xs text-zinc-400">توليد سكريبت ومقطع إعلاني بصوت واقعي للهجة النجدية</p>
                    </div>
                    <span className="text-xs font-mono text-[#74ff52]">الشخصية الحالية: {activeCreator.name}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {UGC_CREATORS.map((c, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setActiveCreator(c);
                          setUgcScriptOutput(
                            `🎬 سكريبت إعلاني احترافي لـ (${c.name})\n📍 المكان: فرع KUBE طريق تركي الأول\n\n[المشهد 1 - Hook]:\nيدخل وهو لابس الشماغ بكشخة خفيفة ومعه اللابتوب: "يا جماعة، تدرون وش الفرق بين يوم يمر عادي ويوم يبدأ صح؟"\n\n[المشهد 2 - السكب والتذوق]:\nيقرب الكوب، وصوت كسر الثلج واضح مع رغوة الفلات وايت: "هنا في KUBE، النغمات الإثيوبية صريحة. حلاوة طبيعية بدون أي سكر زائد."\n\n[المشهد 3 - CTA]:\n"مر عليهم اليوم، أو اطلب من التطبيق وخل مزاجك يسبق دوامك!"`,
                          );
                        }}
                        className={`rounded-2xl border p-3 flex items-center gap-3 cursor-pointer transition-all ${
                          activeCreator.name === c.name
                            ? "border-[#74ff52] bg-[#74ff52]/10"
                            : "border-white/10 bg-zinc-900/60 hover:border-white/20"
                        }`}
                      >
                        <img src={c.avatar} alt={c.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-white block">{c.name}</span>
                          <span className="text-[10px] text-zinc-400 block">{c.role}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {ugcScriptOutput && (
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#74ff52]">السكريبت الإعلاني المقترح:</span>
                        <button
                          onClick={() => handleCopy(ugcScriptOutput, "السكريبت")}
                          className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                        >
                          نسخ السكريبت
                        </button>
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-zinc-200 leading-relaxed">
                        {ugcScriptOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* MODAL 4: ADS STUDIO 9x */}
              {activeStudioModal === "ads_9x" && (
                <div className="space-y-6 text-right">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="font-black text-base text-white">مولد الـ 9 إعلانات البصرية (9-Pack)</h3>
                      <p className="text-xs text-zinc-400">تحويل المنتج إلى 9 زوايا إعلانية مختلفة بضغطة زر واحدة</p>
                    </div>
                    <button
                      onClick={handleGenerate9Pack}
                      className="px-6 py-2.5 rounded-xl bg-[#74ff52] hover:bg-[#62e043] text-black font-black text-xs shadow-lg shadow-[#74ff52]/20"
                    >
                      توليد الـ 9 إعلانات فوراً
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-zinc-300">اسم المنتج أو المشروب:</label>
                    <input
                      type="text"
                      value={adsProductTitle}
                      onChange={(e) => setAdsProductTitle(e.target.value)}
                      className="flex-1 rounded-xl bg-zinc-900 border border-white/15 px-4 py-2 text-xs md:text-sm text-white focus:outline-none focus:border-[#74ff52]"
                    />
                  </div>

                  {generated9Pack && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
                      {generated9Pack.map((item, idx) => (
                        <div
                          key={idx}
                          className="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-2.5 flex flex-col justify-between"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{item.title}</span>
                              <span className="text-[9px] font-mono text-[#74ff52] bg-white/5 px-2 py-0.5 rounded-md">
                                {item.tag}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-zinc-400 bg-black/60 p-2.5 rounded-xl border border-white/5 line-clamp-3 select-all">
                              {item.prompt}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(item.prompt, item.title)}
                            className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-[#74ff52] hover:text-black text-xs font-bold transition-colors"
                          >
                            نسخ البرومبت
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* MODAL 5: MODELS API CATALOG */}
              {activeStudioModal === "models_api" && (
                <div className="space-y-6 text-right">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h3 className="font-black text-base text-white">وثائق الـ API ونماذج التوليد العالمية</h3>
                      <p className="text-xs text-zinc-400">
                        النموذج المحدد: <span className="text-[#74ff52]">{selectedModelForApi.nameAr}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedModelForApi.samplePayload, null, 2), "الـ Payload")}
                      className="px-4 py-2 rounded-xl bg-[#74ff52] text-black font-black text-xs"
                    >
                      نسخ JSON Payload
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white">مواصفات المحرك:</h4>
                      <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-2 text-xs font-mono text-zinc-300">
                        <div>
                          المزود: <span className="text-white">{selectedModelForApi.provider}</span>
                        </div>
                        <div>
                          الـ Endpoint المقترح: <span className="text-[#74ff52]">{selectedModelForApi.apiEndpoint}</span>
                        </div>
                        <div>
                          أقصى دقة: <span className="text-white">{selectedModelForApi.maxResolution}</span>
                        </div>
                        <div>
                          أقصى مدة: <span className="text-white">{selectedModelForApi.maxDuration}</span>
                        </div>
                        <div>
                          الصوت الأصلي:{" "}
                          <span className={selectedModelForApi.nativeAudio ? "text-[#74ff52]" : "text-zinc-500"}>
                            {selectedModelForApi.nativeAudio ? "مدعوم بنقاء استوديو" : "غير مدمج"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white">عينة كود الربط البرمجي (Payload):</h4>
                      <pre className="p-4 rounded-2xl bg-black border border-white/10 text-[11px] font-mono text-[#74ff52] overflow-x-auto">
                        {JSON.stringify(selectedModelForApi.samplePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL 6: PROMLOG */}
              {activeStudioModal === "promlog" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10">
                    <h3 className="font-black text-base text-white">بروملوق — مكتبة برومبتات كافيه KUBE الكاملة</h3>
                    <p className="text-xs text-zinc-400">أكثر من 40 برومبت احترافي باللغتين العربية والإنجليزية</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {SAUDI_VISUAL_PROMPTS.map((p) => (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-2.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-mono text-[#74ff52] block">{p.category}</span>
                          <h4 className="text-xs font-black text-white">{p.title}</h4>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{p.arabicPrompt}</p>
                          <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-zinc-400 select-all">
                            {p.englishPrompt}
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(p.englishPrompt, p.title)}
                          className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-[#74ff52] hover:text-black text-xs font-bold transition-colors"
                        >
                          نسخ البرومبت بالإنجليزية
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
