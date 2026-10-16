import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PermissionGuard } from "@/components/permission-guard";
import {
  Sparkles,
  Copy,
  Plus,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Search,
  Layers,
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
  Send,
  Coffee,
  Check,
  TrendingUp,
  Image as ImageIcon,
  Key,
  ExternalLink,
  ShieldCheck,
  Home,
  Sliders,
  SlidersHorizontal,
  MousePointerClick,
  Camera,
  Wand2,
  Eye,
  Share2,
  CheckCircle2,
  Volume2,
  RotateCcw,
  Maximize2,
  Film,
  LayoutGrid,
  Users,
  GraduationCap,
  Sparkle,
  BookOpen,
  Mic,
  Paperclip,
  Clapperboard,
  Clock,
  Trash2,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { dispatchStudioGeneration } from "@/features/marketing/providers/ai-providers";
import {
  SAUDI_VISUAL_PROMPTS,
  SAUDI_UGC_FORMATS,
  SAUDI_CREATOR_PERSONAS,
  KUBE_PRODUCT_STUDIO_PRESETS,
  HALAI_AI_MODELS_CATALOG,
  KUBE_MARKETING_SUBTYPES,
  KUBE_VIDEO_SCRIPTS,
  UgcFormat,
  ProductStudioPreset,
  AiModelEngine,
  MarketingAdSubtype,
  VideoScriptTemplate,
} from "@/features/marketing/ai-marketing-dataset";
import { useCurrentUser } from "@/lib/use-current-user";
import { primaryRoleHome } from "@/lib/current-user";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  head: () => ({
    meta: [
      { title: "الرئيسية | KUBE AI — مركز الإبداع والتوليد الذكي" },
      {
        name: "description",
        content:
          "منظومة ومحركات التوليد الذكية لكافيه ومطبخ KUBE: سوبر ايجنت، استوديو المنتجات ثلاثي الأبعاد، شخصيات UGC، وكتالوج النماذج العالمية.",
      },
      { property: "og:title", content: "KUBE AI — مركز الإبداع والتوليد الذكي" },
      { property: "og:description", content: "ابدع بلا حدود مع محركات الذكاء الاصطناعي التوليدي لكافيه KUBE." },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["ai_studio_use", "reports_export", "orders_view"]}>
      <KubeAiMarketingPage />
    </PermissionGuard>
  ),
});

// Official Engine SVG Logos
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
  { name: "Claude", icon: "https://hallah.ai/icons/claude-color.svg", invert: false },
  { name: "Cursor", icon: "https://hallah.ai/icons/cursor.svg", invert: true },
  { name: "OpenAI", icon: "https://hallah.ai/icons/openai.svg", invert: false },
  { name: "Nvidia", icon: "https://hallah.ai/icons/nvidia-color.svg", invert: false },
];

// Horizontal Showcase Stream (Section 2)
const SHOWCASE_CARDS = [
  {
    title: "كيوب ميميك",
    tag: "رائج",
    desc: "احتفظ بحركة الفيديو وكاميرته وتوقيته، وأعد بناء الشخصيات والمنتجات والمشهد من صورك",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720",
    action: "mimic_motion",
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
    title: "كيوب على سلة وزد",
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
    action: "storyboard_studio",
  },
];

// كتالوج منتجات كافيه ومطبخ KUBE للاستخدام في استوديو 3D
const KUBE_COFFEE_CATALOG = [
  {
    id: "cold_brew",
    name: "كولد برو كيني مركز",
    category: "مشروبات مثلجة",
    desc: "تقطير بارد 18 ساعة مع مكعب ثلج نحتي نقي وتكثيف ندى بلوري",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720",
    price: "24 ر.س",
  },
  {
    id: "flat_white",
    name: "فلات وايت تيوليب أرت",
    category: "مشروبات ساخنة",
    desc: "إسبريسو دبل شوت مع حليب مبخر مخملي ورسمة تيوليب متناغمة",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
    price: "18 ر.س",
  },
  {
    id: "v60_iced",
    name: "V60 إثيوبيا قوجي مجففة",
    category: "قهوة مقطرة",
    desc: "نوتات توت بري، خوخ، وياسمين مع نقاء بلوري منعش",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
    price: "26 ر.س",
  },
  {
    id: "almond_croissant",
    name: "كرواسون لوز فرنسي مقرمش",
    category: "مخبوزات KUBE",
    desc: "عجينة فرنسية مورقة بحشوة كريمة اللوز ورشة سكر ناعم",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
    price: "19 ر.س",
  },
  {
    id: "beans_bag",
    name: "كيس بن KUBE كولومبيا أنتيوكيا",
    category: "محاصيل مختصة",
    desc: "تغليف أسود مطفي مع لمسات حمراء وإيحاءات شوكولاتة داكنة ولوز",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=720",
    price: "68 ر.س",
  },
];

// حركات الفيديو المرجعية لاستوديو كيوب ميميك (Motion Mimic)
const MIMIC_MOTION_PRESETS = [
  {
    id: "motion-1",
    name: "سكب وانسياب السوائل بطيء",
    titleEn: "Slow Pour & Splash Motion",
    streamId: "679f435913be72cd7135ad8fb2b4c880",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720",
    duration: "10s",
    fps: "120fps High-Speed",
    desc: "حركة سكب واقعية بدون أي تشوه مع سقوط قطرات القهوة وتطاير فقاعات الكريما.",
  },
  {
    id: "motion-2",
    name: "مشية الشباب وحمل الكوب (Street POV)",
    titleEn: "Walking Street Camera Tracking",
    streamId: "40dba6a71d8013595711298206cc8d48",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/40dba6a71d8013595711298206cc8d48/thumbnails/thumbnail.jpg?height=720",
    duration: "15s",
    fps: "60fps Steadycam",
    desc: "كاميرا تتبع متحركة ترافق الشخصية أثناء مشيتها في طريق تركي الأول بالرياض.",
  },
  {
    id: "motion-3",
    name: "دوران 360 درجة للكوب مع إضاءة ديناميكية",
    titleEn: "360 Orbit Turntable with Dynamic Lighting",
    streamId: "8bffdce9c36d3de8fa8ceb0d88c4e175",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/8bffdce9c36d3de8fa8ceb0d88c4e175/thumbnails/thumbnail.jpg?height=720",
    duration: "8s",
    fps: "60fps 4K",
    desc: "دوران سلس للكوب حول محوره يظهر لمعة الرخام وانعكاس النيون الأحمر والأسود.",
  },
  {
    id: "motion-4",
    name: "تفاعل وانتعاش الرشفة الأولى (Candid Sip)",
    titleEn: "First Sip Reaction & Smile",
    streamId: "1b1d49197e516bea184765e12e8bcd14",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/1b1d49197e516bea184765e12e8bcd14/thumbnails/thumbnail.jpg?height=720",
    duration: "12s",
    fps: "30fps Cinema",
    desc: "تعبير وجه عفوي صادق للشخصية السعودية مع نظرة متفائلة للكاميرا بعد تذوق الكولد برو.",
  },
];


// Real UGC Creators (Section 7)
const UGC_CREATORS = [
  {
    name: "سلطان | Sultan",
    views: "128K",
    likes: "12K",
    role: "عاشق الاسبريسو والروقان",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c43e443131757e6b7f81f374a372b878/thumbnails/thumbnail.jpg?height=720",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/sultan.png",
  },
  {
    name: "نورة | Noura",
    views: "45.2K",
    likes: "3.1K",
    role: "طالبة عمارة ومقهى",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/olivia.png",
  },
  {
    name: "ندى | Nada",
    views: "34.5K",
    likes: "1.5K",
    role: "خبيرة الحلى والكرواسون",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c0f730d37d2ed4bb3317d72b0fa90d3d/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/hessa.png",
  },
  {
    name: "ريما | Reema",
    views: "89.1K",
    likes: "3.1K",
    role: "صانعة محتوى لايف ستايل",
    thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/39f9db1609f3f361a19305ba50055c8c/thumbnails/thumbnail.jpg?time=0&height=1000",
    avatar: "https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/female/reema.png",
  },
  {
    name: "أحمد | Ahmed",
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

// API Key Providers List for Direct Integration
const AI_PROVIDERS = [
  {
    id: "kling",
    name: "Kling AI (Kuaishou)",
    purpose: "توليد فيديوهات UGC والسكب الحركي للقهوة والموشن",
    keyEnv: "KLING_API_KEY",
    endpoint: "https://api.klingai.com/v1/videos/image2video",
    docUrl: "https://klingai.org/api",
    status: "موصى به للـ UGC",
  },
  {
    id: "veo",
    name: "Google Cloud Vertex AI (Veo 2 & Veo 3.1)",
    purpose: "إعلانات سينمائية بدقة 4K HDR ومؤثرات كاميرا دقيقة",
    keyEnv: "GOOGLE_APPLICATION_CREDENTIALS / GEMINI_API_KEY",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models/veo-2.0",
    docUrl: "https://cloud.google.com/vertex-ai",
    status: "موصى به للإعلانات الكبرى",
  },
  {
    id: "wanx",
    name: "Alibaba Cloud DashScope (WanX 2.6 Pro & Qwen)",
    purpose: "محاكاة فيزياء السوائل وتوليد النصوص العربية بوضوح",
    keyEnv: "DASHSCOPE_API_KEY",
    endpoint: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc",
    docUrl: "https://dashscope.console.aliyun.com",
    status: "موصى به للمنتجات 3D",
  },
  {
    id: "seadance",
    name: "ByteDance Volcano Engine (SeaDance 2.5)",
    purpose: "مقاطع ريلز وتيك توك سريعة مع صوت متزامن أصلي",
    keyEnv: "VOLCANO_API_KEY",
    endpoint: "https://ark.cn-beijing.volces.com/api/v3/video/generations",
    docUrl: "https://console.volcengine.com/ark",
    status: "موصى به للترندات",
  },
  {
    id: "flux",
    name: "Black Forest Labs (Flux 1.1 Pro & Max 2)",
    purpose: "صور منتجات فوتوغرافية فائقة الواقعية والماكرو بدقة 8K",
    keyEnv: "BFL_API_KEY",
    endpoint: "https://api.bfl.ml/v1/flux-pro-1.1",
    docUrl: "https://bfl.ml",
    status: "موصى به للماكرو والعلب",
  },
  {
    id: "grok",
    name: "xAI (Grok Imagine)",
    purpose: "إعلانات ليلية نيون ونبرة شبابية جريئة",
    keyEnv: "XAI_API_KEY",
    endpoint: "https://api.x.ai/v1/images/generations",
    docUrl: "https://console.x.ai",
    status: "موصى به لأجواء المساء",
  },
  {
    id: "minimax",
    name: "MiniMax Hailuo (H3 & Video-01)",
    purpose: "توليد سريع متعدد المراجع (صورة + صوت + فيديو)",
    keyEnv: "MINIMAX_API_KEY",
    endpoint: "https://api.minimax.chat/v1/video_generation",
    docUrl: "https://api.minimax.chat",
    status: "موصى به للتوليد السريع",
  },
  {
    id: "elevenlabs",
    name: "ElevenLabs Voice AI",
    purpose: "توليد أصوات شخصيات الرياض النجدية الواقعية للـ UGC",
    keyEnv: "ELEVENLABS_API_KEY",
    endpoint: "https://api.elevenlabs.io/v1/text-to-speech",
    docUrl: "https://elevenlabs.io",
    status: "موصى به للأصوات",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

function KubeAiMarketingPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const backHomeUrl = primaryRoleHome(currentUser.data?.roles ?? []);

  // Modal Workspace States (Expanded to 100% cover Halai studios, MCP, Community, Tutorials, Pricing, and Shots)
  const [activeStudioModal, setActiveStudioModal] = useState<
    | "none"
    | "super_agent"
    | "product_3d"
    | "ugc_studio"
    | "ads_9x"
    | "models_api"
    | "promlog"
    | "providers_guide"
    | "mimic_motion"
    | "storyboard_studio"
    | "mcp_hub"
    | "community"
    | "tutorials"
    | "pricing_plans"
    | "character_creator"
    | "shots_studio"
    | "connectors_hub"
  >("none");

  // Mobile drawer toggle & accordion states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studiosAccordionOpen, setStudiosAccordionOpen] = useState(true);
  const [exploreAccordionOpen, setExploreAccordionOpen] = useState(true);

  // New Ad Bottom Sheet Modal (Matching IMG_0105)
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);

  // Hero Creation Studio 2.0 Form States (Matching IMG_0104)
  const [heroMode, setHeroMode] = useState<"video" | "image">("video");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroProduct, setHeroProduct] = useState<(typeof KUBE_COFFEE_CATALOG)[0] | null>(KUBE_COFFEE_CATALOG[0]);
  const [heroPersona, setHeroPersona] = useState<(typeof UGC_CREATORS)[0] | null>(null);
  const [heroScene, setHeroScene] = useState<string | null>(null);
  const [heroAdType, setHeroAdType] = useState<string>("شرح منتج وسكب");
  const [heroAspect, setHeroAspect] = useState<"3:4" | "9:16" | "1:1" | "16:9">("3:4");
  const [heroResolution, setHeroResolution] = useState<"1080p" | "4K" | "720p" | "480p">("1080p");
  const [heroDuration, setHeroDuration] = useState<"12 ث" | "10 ث" | "15 ث" | "30 ث">("12 ث");
  const [isGeneratingHeroAd, setIsGeneratingHeroAd] = useState(false);

  // "إعلاناتي" (My Ads Gallery) States (Matching IMG_0097)
  const [myAdsFilter, setMyAdsFilter] = useState<"all" | "video" | "image">("all");
  const [userAds, setUserAds] = useState<
    Array<{
      id: string;
      title: string;
      type: "video" | "image";
      thumb: string;
      createdAt: string;
      status: "ready" | "rendering";
      aspect: string;
      prompt: string;
    }>
  >([]);

  // Super Agent 10-Step Walkthrough Tour States (Matching IMG_0099 to IMG_0103)
  const [superAgentTourOpen, setSuperAgentTourOpen] = useState(false);
  const [superAgentTourStep, setSuperAgentTourStep] = useState<number>(1);

  // Custom Right-Click Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    title: string;
    prompt?: string;
    action?: string;
  } | null>(null);

  // Close context menu on outside click or Escape key
  useEffect(() => {
    const handleGlobalClick = () => setContextMenu(null);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContextMenu(null);
    };
    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleContextMenuTrigger = (
    e: React.MouseEvent,
    title: string,
    prompt?: string,
    action?: string,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    const x = Math.min(e.clientX, window.innerWidth - 270);
    const y = Math.min(e.clientY, window.innerHeight - 340);
    setContextMenu({
      visible: true,
      x: Math.max(10, x),
      y: Math.max(10, y),
      title,
      prompt,
      action,
    });
  };

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
      text: "أهلاً بك زياد عيسى في سوبر ايجنت KUBE AI! ☕️⚡️\nالمحرك مدرب على لهجة الرياض وأسرار القهوة المختصة ونبرة برق و STC. اختر أي صيغة UGC أو اطلب ما تريد وسأصيغ لك إعلانات سينمائية للتوليد فوراً.",
      timestamp: "الآن",
    },
  ]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // ==========================================
  // 3D Product Studio Interactive State (4 Steps)
  // ==========================================
  const [productStudioStep, setProductStudioStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedCoffeeProduct, setSelectedCoffeeProduct] = useState(KUBE_COFFEE_CATALOG[0]);
  const [selectedSurface, setSelectedSurface] = useState<"black_marble" | "travertine" | "walnut" | "concrete_neon" | "softbox">("black_marble");
  const [lightingDirection, setLightingDirection] = useState<"top" | "front" | "right" | "left" | "rim_back" | "bottom">(
    "front",
  );
  const [lightingIntensity, setLightingIntensity] = useState<"soft" | "hard">("soft");
  const [aspectRatio, setAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "16:9">("9:16");
  const [selectedPreset, setSelectedPreset] = useState<ProductStudioPreset>(KUBE_PRODUCT_STUDIO_PRESETS[0]);
  const [customUploadedProductUrl, setCustomUploadedProductUrl] = useState<string | null>(null);

  // ==========================================
  // UGC & Personas State (4 Steps)
  // ==========================================
  const [ugcStep, setUgcStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeCreator, setActiveCreator] = useState(UGC_CREATORS[0]);
  const [selectedDialect, setSelectedDialect] = useState<"نجدية بيضاء" | "حجازية عفوية" | "شرقية دافئة" | "عامية سعودية">("نجدية بيضاء");
  const [videoDuration, setVideoDuration] = useState<15 | 30>(15);
  const [ugcScriptOutput, setUgcScriptOutput] = useState<string | null>(null);

  // ==========================================
  // Ads 9-Pack & 30+ Concepts State (4 Steps)
  // ==========================================
  const [adsStep, setAdsStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAdSubtype, setSelectedAdSubtype] = useState<MarketingAdSubtype>(KUBE_MARKETING_SUBTYPES[0]);
  const [adSubtypeFilter, setAdSubtypeFilter] = useState<"all" | "product_ads" | "cinematic" | "lifestyle" | "luxury_lighting">("all");
  const [adsProductTitle, setAdsProductTitle] = useState("كولد برو كيني مركز");
  const [adsHookHeadline, setAdsHookHeadline] = useState("إذا يومك ما بدأ بقهوة KUBE.. يومك ما بدأ!");
  const [generated9Pack, setGenerated9Pack] = useState<Array<{ title: string; prompt: string; tag: string }> | null>(
    null,
  );

  // ==========================================
  // Mimic Motion Studio State (4 Steps)
  // ==========================================
  const [mimicStep, setMimicStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedMotion, setSelectedMotion] = useState(MIMIC_MOTION_PRESETS[0]);
  const [motionStrength, setMotionStrength] = useState<"subtle" | "balanced" | "dynamic">("balanced");

  // ==========================================
  // Storyboard Studio State (Multi-Scene)
  // ==========================================
  const [storyboardStep, setStoryboardStep] = useState<1 | 2 | 3>(1);
  const [selectedScript, setSelectedScript] = useState<VideoScriptTemplate>(KUBE_VIDEO_SCRIPTS[0]);

  // ==========================================
  // API Model Hub State
  // ==========================================
  const [selectedModelForApi, setSelectedModelForApi] = useState<AiModelEngine>(HALAI_AI_MODELS_CATALOG[0]);

  // ==========================================
  // Before / After Comparison Slider State
  // ==========================================
  const [sliderPos, setSliderPos] = useState<number>(50);

  // ==========================================
  // Lightbox Image Fullscreen Modal State
  // ==========================================
  const [lightboxItem, setLightboxItem] = useState<{
    isOpen: boolean;
    imgUrl: string;
    title: string;
    prompt?: string;
    aspectRatio?: string;
    specs?: string;
  } | null>(null);


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
      const replyText = `يا هلا زياد! أبشر بعزك ☕️✨\nتم توجيه المحرك (${selectedEngine}) لصياغة سكريبت بصري بالصيغة: "${selectedUgcFormat.nameAr}"\n\n📌 المشهد: لقطة ماكرو 4K مع تكثيف قطرات الندى على كوب كولد برو KUBE الأسود المطفي مع لمسات الأحمر المتوهج.\n🎙️ الصوت: "إذا يومك ما بدأ بقطرة تروق المخ... KUBE يضبط مزاجك بضغطة زر".\n⚡️ البرومبت الجاهز للإنتاج:\n${selectedUgcFormat.promptDirective}\n\nجاهز للتوليد الفوري على Kling 3 Turbo أو Google Veo 3.1!`;

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
          prompt: `Cinematic macro 8k commercial shot of ${adsProductTitle}, slow motion milk swirl dripping, studio spotlight with subtle red glow, Hasselblad lens f/1.4`,
          tag: "انستقرام 1:1",
        },
        {
          title: "سيلفي المقهى والشمس",
          prompt: `Saudi youth holding ${adsProductTitle} at sleek concrete Riyadh cafe, natural morning golden hour, candid realism, 9:16`,
          tag: "تيك توك 9:16",
        },
        {
          title: "ستايل الشارع الفاخر",
          prompt: `Street style photography on Prince Turki Road Riyadh, luxury black and red KUBE cup, minimalist neon lighting, 4:5 vertical`,
          tag: "سناب شات 9:16",
        },
        {
          title: "عرض الصباح والدوام",
          prompt: `Modern laptop setup with ${adsProductTitle} and butter croissant, crisp architectural studio lighting, high conversion commercial`,
          tag: "تويتر 16:9",
        },
        {
          title: "إضاءة النيون الحمراء المسائية",
          prompt: `Matte black cup under deep crimson red and amber neon glow, dark luxury moody cafe vibe, ultra-sharp detail`,
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
          prompt: `Black nero marquina marble pedestal holding the coffee, red rim backlighting, elegant typography space`,
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
      className="w-full min-h-screen bg-black text-white selection:bg-[#ff2a4b] selection:text-white font-sans overflow-x-hidden antialiased pb-24 xl:pb-0"
      style={{
        backgroundColor: "#000000",
        fontFamily: '"PingARLT", "IBM Plex Sans Arabic", "Rubik", "Archivo", system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ============================================================== */}
      {/* 1. FIXED TOPBAR (Optimized for Mobile & Desktop)                */}
      {/* ============================================================== */}
      <header
        data-app-topbar="true"
        className="h-14 md:h-16 flex items-center justify-between px-3 md:px-8 shrink-0 z-[9999] w-full transition-all duration-300 fixed top-0 left-0 bg-black/85 backdrop-blur-xl border-b border-white/5"
      >
        {/* Right Section: Mobile Menu + Logo + Desktop Nav */}
        <div className="flex items-center h-full gap-2 md:gap-5">
          {/* Mobile Menu Toggle Button (Touch Friendly 44x44px) */}
          <button
            type="button"
            aria-label="القائمة الجانبية"
            onClick={() => setMobileMenuOpen(true)}
            className="xl:hidden w-11 h-11 shrink-0 flex items-center justify-center rounded-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
          >
            <MenuIcon className="w-5 h-5 text-white" />
          </button>

          {/* KUBE AI Brand Logo */}
          <Link
            to="/admin/marketing"
            className="h-9 md:h-12 flex items-center shrink-0 cursor-pointer hover:scale-105 transition-transform gap-2 md:gap-2.5"
          >
            <div className="flex h-8 w-8 md:h-9 md:w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#ff334b] via-[#ef4444] to-[#991b1b] shadow-lg shadow-[#ff2a4b]/30 text-white font-black text-sm md:text-base border border-white/20">
              K
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm md:text-base font-black tracking-wider text-white">KUBE</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3b56] to-[#ff2a4b] font-black text-xs md:text-sm">
                AI
              </span>
              <span className="hidden sm:inline-block rounded-full bg-[#ff2a4b]/20 border border-[#ff2a4b]/40 px-2 py-0.5 text-[9px] font-bold text-[#ff3b56] font-mono">
                STUDIO v2
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Items (Hidden on Mobile) */}
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
              <Layers className="w-4 h-4 text-[#ff2a4b]" />
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
              <Bot className="w-4 h-4 text-[#ff2a4b]" />
              <span>سوبر ايجنت</span>
              <span className="text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 shrink-0 bg-[#ff2a4b] text-white">
                جديد
              </span>
            </button>
          </nav>
        </div>

        {/* Left Section: Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Provider API Keys Button */}
          <button
            onClick={() => setActiveStudioModal("providers_guide")}
            className="flex items-center gap-1.5 h-8 md:h-9 px-2.5 rounded-xl bg-[#ff2a4b]/15 hover:bg-[#ff2a4b]/25 border border-[#ff2a4b]/40 text-[#ff3b56] text-xs font-bold transition-all shadow-sm active:scale-95"
            title="دليل مفاتيح المزودين"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">مفاتيح المزودين (API)</span>
          </button>

          {/* ERP Dashboard Link */}
          <Link
            to={backHomeUrl}
            className="flex items-center gap-1.5 h-8 md:h-9 px-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs md:text-sm font-medium transition-all active:scale-95"
            title="العودة لنظام إدارة كافيه KUBE"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">لوحة KUBE</span>
          </Link>

          {/* User Profile Capsule with Signature KUBE Red Glowing Ring */}
          <div className="flex items-center gap-2 relative">
            <div className="relative flex items-center justify-center w-[34px] h-[34px] md:w-[42px] md:h-[42px]">
              <svg width="42" height="42" className="absolute inset-0 -rotate-90 pointer-events-none" viewBox="0 0 42 42">
                <circle cx="21" cy="21" r="19" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <circle
                  cx="21"
                  cy="21"
                  r="19"
                  fill="none"
                  strokeWidth="2.5"
                  strokeDasharray="120"
                  strokeDashoffset="0"
                  strokeLinecap="round"
                  style={{ stroke: "#ff2a4b" }}
                />
              </svg>
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-900 border border-white/20 flex items-center justify-center text-white text-xs md:text-sm font-black shadow-lg overflow-hidden cursor-pointer"
                title="زياد عيسى • KUBE VIP"
              >
                <span>ز</span>
              </div>
            </div>
            <div className="hidden lg:block text-right">
              <span className="text-xs font-bold text-white block">زياد عيسى</span>
              <span className="text-[10px] text-[#ff3b56] font-mono block">استخدام داخلي خاص • KUBE</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================== */}
      {/* 2. MOBILE SLIDE-OUT DRAWER (100% Halai Matching Architecture)  */}
      {/* ============================================================== */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-[10005] bg-black/85 backdrop-blur-md animate-in fade-in duration-200 xl:hidden select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed inset-y-0 start-0 z-[10006] w-[88vw] max-w-[320px] bg-[#141416] border-e border-white/10 p-4 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-start duration-300 select-text"
          >
            <div className="space-y-4">
              {/* Drawer Topbar with Quick Utility Icons */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-black font-black text-xs ring-2 ring-[#00e575]">
                    ز
                  </div>
                  <a
                    href="https://tiktok.com/@kube"
                    target="_blank"
                    rel="noreferrer"
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center border border-white/5"
                    title="تيك توك"
                  >
                    <Music className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => toast.info("لا توجد إشعارات جديدة")}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center border border-white/5"
                    title="الإشعارات"
                  >
                    <Bell className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setMyAdsFilter("all");
                      setMobileMenuOpen(false);
                      const el = document.getElementById("my-ads-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 flex items-center justify-center border border-white/5"
                    title="إعلاناتي والمكتبة"
                  >
                    <Folder className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-sm text-white">KUBE</span>
                    <span className="text-xs font-black text-[#ff2a4b]">AI</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-white flex items-center justify-center border border-white/10 active:scale-95"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Root Nav Items: صور / فيديو / تطبيقات */}
              <div className="space-y-1">
                <button
                  onClick={() => {
                    setHeroMode("image");
                    setActiveStudioModal("product_3d");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                    <span>صور</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setHeroMode("video");
                    setActiveStudioModal("mimic_motion");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-zinc-400" />
                    <span>فيديو</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const el = document.getElementById("templates-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-zinc-400" />
                    <span>تطبيقات</span>
                  </div>
                </button>
              </div>

              {/* Accordion 1: الاستوديوهات */}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setStudiosAccordionOpen(!studiosAccordionOpen)}
                  className="w-full flex items-center justify-between py-2 text-[11px] font-bold text-zinc-400 hover:text-white"
                >
                  <span>الاستوديوهات</span>
                  {studiosAccordionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {studiosAccordionOpen && (
                  <div className="space-y-1 pt-1 text-xs">
                    <button
                      onClick={() => {
                        setHeroMode("video");
                        setMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Wand2 className="w-4 h-4 text-[#ff2a4b]" />
                        <span>استديو التسويق 2.0</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("ads_9x");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkle className="w-4 h-4 text-zinc-400" />
                        <span>استديو التسويق</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("ugc_studio");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>استديو UGC 2.0</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("ads_9x");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 text-white font-bold"
                    >
                      <div className="flex items-center gap-2.5">
                        <LayoutGrid className="w-4 h-4 text-[#ff2a4b]" />
                        <span>استديو الإعلانات</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40">
                        رائج
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("storyboard_studio");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-zinc-400" />
                        <span>ستوري بورد</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("product_3d");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-zinc-400" />
                        <span>استديو المنتجات</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("character_creator");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>استديو الشخصيات</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("shots_studio");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Camera className="w-4 h-4 text-zinc-400" />
                        <span>لقطات</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 2: استكشف */}
              <div className="pt-2 border-t border-white/5">
                <button
                  onClick={() => setExploreAccordionOpen(!exploreAccordionOpen)}
                  className="w-full flex items-center justify-between py-2 text-[11px] font-bold text-zinc-400 hover:text-white"
                >
                  <span>استكشف</span>
                  {exploreAccordionOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {exploreAccordionOpen && (
                  <div className="space-y-1 pt-1 text-xs">
                    <button
                      onClick={() => {
                        setActiveStudioModal("mcp_hub");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Radio className="w-4 h-4 text-purple-400" />
                        <span>اتصال MCP</span>
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold border border-white/30 text-white font-mono">
                        BETA
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("super_agent");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot className="w-4 h-4 text-[#ff2a4b]" />
                        <span>سوبر ايجنت</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("community");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>مجتمع</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("promlog");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-zinc-400" />
                        <span>بروملوق</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("tutorials");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                        <span>شروحات</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveStudioModal("pricing_plans");
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>الباقات</span>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Drawer User Bar (Credit-Free matching Halai UI) */}
            <div className="pt-3 border-t border-white/10 space-y-2">
              <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-black font-black text-xs flex items-center justify-center shrink-0 ring-2 ring-[#00e575]">
                    ز
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block">زياد عيسى</span>
                    <span className="text-[10px] text-zinc-400 font-mono block">حساب رئيسي • KUBE</span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MOBILE BOTTOM NAVIGATION BAR (iPhone Floating Dock)         */}
      {/* ============================================================== */}
      <nav
        style={{ bottom: "max(12px, env(safe-area-inset-bottom, 12px))" }}
        className="xl:hidden fixed inset-x-3 z-[9990] rounded-2xl bg-zinc-950/95 backdrop-blur-2xl border border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.8)] p-1.5 flex items-center justify-around text-[10px] select-none touch-manipulation"
      >
        <button
          onClick={() => setActiveStudioModal("super_agent")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
            activeStudioModal === "super_agent" ? "text-[#ff2a4b] bg-white/10 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bot className="w-5 h-5 text-[#ff2a4b]" />
          <span>ايجنت</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("product_3d")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
            activeStudioModal === "product_3d" ? "text-[#ff2a4b] bg-white/10 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>استديو 3D</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("ugc_studio")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
            activeStudioModal === "ugc_studio" ? "text-[#ff2a4b] bg-white/10 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Video className="w-5 h-5" />
          <span>UGC</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("ads_9x")}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all active:scale-95 ${
            activeStudioModal === "ads_9x" ? "text-[#ff2a4b] bg-white/10 font-bold" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>إعلانات 9x</span>
        </button>

        <Link
          to={backHomeUrl}
          className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-zinc-400 hover:text-white transition-all active:scale-95"
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Link>
      </nav>

      {/* ============================================================== */}
      {/* 4. SECTION 1: STUDIO 2.0 HERO & CREATION FORM (100% Halai)     */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black pt-20 pb-10 px-3 sm:px-6 md:px-8 border-b border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6">
          
          {/* 3D Glass Emblem & Curved Studio Title (Matching IMG_0104) */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <div className="relative flex items-center justify-center">
              {/* Glowing Ambient Light */}
              <div className="absolute w-32 h-32 rounded-full bg-gradient-to-br from-[#00e575]/30 to-[#ff2a4b]/20 blur-3xl pointer-events-none" />
              
              {/* 3D Glass Emblem Box */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-white/10 via-white/5 to-white/0 border border-white/20 backdrop-blur-xl shadow-2xl flex items-center justify-center p-3 group hover:scale-105 transition-transform duration-500">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-[#00e575] via-[#10b981] to-[#059669] flex items-center justify-center text-black shadow-lg shadow-[#00e575]/40 transform -rotate-6 group-hover:rotate-0 transition-transform">
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current ml-0.5" />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-3">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-white block">
                استوديو التسويق 2.0
              </span>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="text-xs text-zinc-300 font-medium">لا حدود للإبداع</span>
              </div>
            </div>
          </div>

          {/* 3 Showcase Cards Row (Food, Explainer, Motion) (Matching IMG_0104) */}
          <div className="w-full grid grid-cols-3 gap-2.5 sm:gap-4 max-w-2xl mx-auto pt-2">
            {/* Card 1: Food / Coffee */}
            <div
              onClick={() => {
                setHeroProduct(KUBE_COFFEE_CATALOG[0]);
                setHeroAdType("طعام ومشروبات");
                toast.success("تم اختيار نمط: طعام وقهوة مختصة");
              }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] active:scale-95 transition-all cursor-pointer shadow-xl"
            >
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720"
                alt="طعام"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                طعام
              </span>
              <div className="absolute bottom-2 inset-x-2 text-right">
                <span className="text-[11px] font-bold text-white block truncate">كولد برو كيني</span>
              </div>
            </div>

            {/* Card 2: Explainer / UGC Kitchen */}
            <div
              onClick={() => {
                setHeroPersona(UGC_CREATORS[1]);
                setHeroAdType("شرح وتجربة منتج");
                toast.success("تم اختيار نمط: شرح وتجربة واقعية");
              }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] active:scale-95 transition-all cursor-pointer shadow-xl"
            >
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=1000"
                alt="شرح"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                شرح
              </span>
              <div className="absolute bottom-2 inset-x-2 text-right">
                <span className="text-[11px] font-bold text-white block truncate">صناع محتوى KUBE</span>
              </div>
            </div>

            {/* Card 3: Motion / Kinetic */}
            <div
              onClick={() => {
                setHeroAdType("حركة وسكب سينمائي");
                toast.success("تم اختيار نمط: حركة وسكب سينمائي");
              }}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] active:scale-95 transition-all cursor-pointer shadow-xl"
            >
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720"
                alt="حركة"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <span className="absolute top-2 right-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-black/70 backdrop-blur-md text-white border border-white/10">
                حركة
              </span>
              <div className="absolute bottom-2 inset-x-2 text-right">
                <span className="text-[11px] font-bold text-white block truncate">سكب ديناميكي</span>
              </div>
            </div>
          </div>

          {/* Creation Switcher: صورة / فيديو (Segmented Pill) */}
          <div className="flex items-center justify-center pt-2">
            <div className="inline-flex p-1 rounded-2xl bg-zinc-900/90 border border-white/10 text-xs font-bold shadow-lg">
              <button
                type="button"
                onClick={() => setHeroMode("video")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  heroMode === "video"
                    ? "bg-zinc-800 text-white shadow-md border border-white/10 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Video className="w-4 h-4 text-[#00e575]" />
                <span>فيديو</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("image")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all active:scale-95 ${
                  heroMode === "image"
                    ? "bg-zinc-800 text-white shadow-md border border-white/10 font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-zinc-300" />
                <span>صورة</span>
              </button>
            </div>
          </div>

          {/* Creation Form Card (100% Halai Layout) */}
          <div className="w-full max-w-2xl mx-auto rounded-3xl bg-[#141416] border border-white/10 p-4 sm:p-5 space-y-4 text-right shadow-2xl">
            {/* Prompt Textarea */}
            <div className="relative">
              <textarea
                rows={2}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder={
                  heroMode === "video"
                    ? "صف أفضل فكرة لديك للفيديو..."
                    : "صف أفضل فكرة لديك لصورة المنتج..."
                }
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 3 Upload / Select Slots (Product *, Character, Scene) */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
              {/* Slot 1: Scene (المشهد) */}
              <button
                type="button"
                onClick={() => {
                  toast.info("تم تفعيل إضاءة استوديو كافيه KUBE التلقائية للمشهد");
                  setHeroScene("استوديو رخام أسود ونيون");
                }}
                className={`relative aspect-square sm:aspect-[4/3] rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  heroScene
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 bg-black/40 hover:bg-white/5 text-zinc-400"
                }`}
              >
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center text-xs font-bold border border-[#00e575]/40">
                  +
                </div>
                <ImageIcon className="w-5 h-5 text-zinc-300" />
                <span className="text-[11px] font-bold text-zinc-300">
                  {heroScene ? "تم اختيار المشهد" : "المشهد"}
                </span>
              </button>

              {/* Slot 2: Character (الشخصية) */}
              <button
                type="button"
                onClick={() => {
                  setActiveStudioModal("ugc_studio");
                }}
                className={`relative aspect-square sm:aspect-[4/3] rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  heroPersona
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 bg-black/40 hover:bg-white/5 text-zinc-400"
                }`}
              >
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00e575]/20 text-[#00e575] flex items-center justify-center text-xs font-bold border border-[#00e575]/40">
                  +
                </div>
                <Users className="w-5 h-5 text-zinc-300" />
                <span className="text-[11px] font-bold text-zinc-300 truncate max-w-full px-1">
                  {heroPersona ? heroPersona.name.split(" ")[0] : "الشخصية"}
                </span>
              </button>

              {/* Slot 3: Product * (المنتج - إلزامي) */}
              <button
                type="button"
                onClick={() => {
                  setActiveStudioModal("product_3d");
                }}
                className={`relative aspect-square sm:aspect-[4/3] rounded-2xl border p-2 flex flex-col items-center justify-center gap-1.5 transition-all active:scale-95 ${
                  heroProduct
                    ? "border-[#00e575] bg-[#00e575]/10 text-white shadow-sm shadow-[#00e575]/20"
                    : "border-red-500/50 bg-red-500/10 text-white animate-need"
                }`}
              >
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00e575] text-black flex items-center justify-center text-xs font-black shadow-md">
                  +
                </div>
                <Coffee className="w-5 h-5 text-[#00e575]" />
                <div className="text-center px-1">
                  <span className="text-[11px] font-bold text-white block truncate">
                    {heroProduct ? heroProduct.name : "المنتج *"}
                  </span>
                  {!heroProduct && (
                    <span className="text-[9px] text-red-400 font-mono block">إلزامي *</span>
                  )}
                </div>
              </button>
            </div>

            {/* Controls Row: نوع الإعلان / نسبة الأبعاد / الدقة / المدة */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              {/* Ad Type Selector */}
              <div className="relative">
                <select
                  value={heroAdType}
                  onChange={(e) => setHeroAdType(e.target.value)}
                  className="w-full appearance-none rounded-xl bg-zinc-900 border border-white/10 hover:border-[#00e575] px-3 py-2 text-zinc-200 text-xs font-bold focus:outline-none cursor-pointer text-right"
                >
                  <option value="شرح منتج وسكب">اختر نوعًا: شرح منتج</option>
                  <option value="إعلان سينمائي 4K">إعلان سينمائي 4K</option>
                  <option value="مقارنة سريعة">مقارنة سريعة قبل وبعد</option>
                  <option value="ترند تيك توك">ترند تيك توك وسناب</option>
                  <option value="لايف ستايل كافيه">لايف ستايل كافيه</option>
                </select>
              </div>

              {/* Aspect Ratio */}
              <div className="relative">
                <select
                  value={heroAspect}
                  onChange={(e) => setHeroAspect(e.target.value as any)}
                  className="w-full appearance-none rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 px-3 py-2 text-zinc-200 text-xs font-mono font-bold focus:outline-none cursor-pointer text-center"
                >
                  <option value="3:4">3:4 (عمودي)</option>
                  <option value="9:16">9:16 (ستوري)</option>
                  <option value="1:1">1:1 (مربع)</option>
                  <option value="16:9">16:9 (أفقي)</option>
                </select>
              </div>

              {/* Resolution */}
              <div className="relative">
                <select
                  value={heroResolution}
                  onChange={(e) => setHeroResolution(e.target.value as any)}
                  className="w-full appearance-none rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 px-3 py-2 text-zinc-200 text-xs font-mono font-bold focus:outline-none cursor-pointer text-center"
                >
                  <option value="1080p">1080p FHD</option>
                  <option value="4K">4K UltraHD</option>
                  <option value="720p">720p HD</option>
                  <option value="480p">480p SD</option>
                </select>
              </div>

              {/* Duration */}
              <div className="relative">
                <select
                  value={heroDuration}
                  onChange={(e) => setHeroDuration(e.target.value as any)}
                  className="w-full appearance-none rounded-xl bg-zinc-900 border border-white/10 hover:border-white/20 px-3 py-2 text-zinc-200 text-xs font-bold focus:outline-none cursor-pointer text-center"
                >
                  <option value="12 ث">12 ثانية</option>
                  <option value="10 ث">10 ثوانٍ</option>
                  <option value="15 ث">15 ثانية</option>
                  <option value="30 ث">30 ثانية</option>
                </select>
              </div>
            </div>

            {/* Action Generate Button (Clean without numbers or credit) */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isGeneratingHeroAd}
                onClick={async () => {
                  if (!heroProduct) {
                    toast.error("يرجى اختيار المنتج أولاً (حقل إلزامي *)");
                    return;
                  }
                  setIsGeneratingHeroAd(true);
                  toast.info("جاري توجيه محركات الذكاء الاصطناعي وبدء الريندر...");

                  // Dispatch via decoupled provider layer
                  await dispatchStudioGeneration({
                    task: heroMode === "video" ? "video_ugc_motion" : "image_packshot_4k",
                    provider: "fal_ai",
                    prompt: heroPrompt || `Cinematic commercial for ${heroProduct.name}`,
                    aspectRatio: heroAspect,
                    resolution: heroResolution,
                    productImageUrl: heroProduct.img,
                    adType: heroAdType,
                  });

                  setTimeout(() => {
                    const newAd = {
                      id: `ad-${Date.now()}`,
                      title: `${heroProduct.name} — ${heroAdType}`,
                      type: heroMode,
                      thumb: heroProduct.img,
                      createdAt: "الآن",
                      status: "ready" as const,
                      aspect: heroAspect,
                      prompt: heroPrompt || `Commercial render of ${heroProduct.name}`,
                    };
                    setUserAds((prev) => [newAd, ...prev]);
                    setIsGeneratingHeroAd(false);
                    toast.success("تم تجهيز إعلانك بنجاح وعرضه في قسم إعلاناتي!");
                    
                    // Smooth scroll to My Ads section
                    const el = document.getElementById("my-ads-section");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 1200);
                }}
                className={`relative w-full h-12 rounded-2xl font-black text-sm text-black flex items-center justify-center gap-2 overflow-hidden transition-all active:scale-[0.99] shadow-xl ${
                  isGeneratingHeroAd
                    ? "bg-zinc-700 text-zinc-400 cursor-wait"
                    : "bg-[#00e575] hover:bg-[#00ff83] shadow-[#00e575]/25"
                }`}
              >
                {/* Authentic Sheen Animation */}
                <div className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg] pointer-events-none animate-[pm-sheen_4s_infinite]" />
                
                {isGeneratingHeroAd ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-zinc-400 border-t-white animate-spin" />
                    <span>جاري الإنشاء...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4 fill-current" />
                    <span>إنشاء</span>
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Quick "أنشئ إعلانًا" Trigger Button (Matching Halai CTA) */}
          <div className="pt-2">
            <button
              onClick={() => setIsNewAdModalOpen(true)}
              className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-[#00e575]" />
              <span>أنشئ إعلانًا من قالب مخصص</span>
            </button>
          </div>

        </div>

        {/* ============================================================== */}
        {/* SECTION: "إعلاناتي" (My Ads Gallery - Matching IMG_0097)        */}
        {/* ============================================================== */}
        <div id="my-ads-section" className="max-w-4xl mx-auto pt-14 pb-4">
          <div className="flex items-center justify-between pb-4 border-b border-white/5">
            <h3 className="text-lg sm:text-xl font-black text-white">إعلاناتي</h3>

            {/* Filter Pills: الكل / فيديو / صور */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs">
              <button
                type="button"
                onClick={() => setMyAdsFilter("all")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  myAdsFilter === "all" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                }`}
              >
                الكل
              </button>

              <button
                type="button"
                onClick={() => setMyAdsFilter("video")}
                className={`p-1.5 rounded-lg transition-all ${
                  myAdsFilter === "video" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                }`}
                title="فيديوهات"
              >
                <Video className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setMyAdsFilter("image")}
                className={`p-1.5 rounded-lg transition-all ${
                  myAdsFilter === "image" ? "bg-white/15 text-white" : "text-zinc-400 hover:text-white"
                }`}
                title="صور"
              >
                <ImageIcon className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Empty State when no ads created yet (Matching IMG_0097) */}
          {userAds.length === 0 ? (
            <div className="py-14 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-16 h-14 rounded-2xl bg-zinc-900/90 border border-white/10 flex items-center justify-center text-zinc-500 shadow-inner">
                <Video className="w-6 h-6 text-zinc-400" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black text-white">لا توجد إعلانات بعد</h4>
                <p className="text-xs text-zinc-400 max-w-sm">
                  اختر النوع، أضف منتجك، وصف الإعلان. يظهر هنا فور جاهزيته.
                </p>
              </div>
            </div>
          ) : (
            /* Populated Ads Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4">
              {userAds
                .filter((ad) => myAdsFilter === "all" || ad.type === myAdsFilter)
                .map((ad) => (
                  <div
                    key={ad.id}
                    className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] transition-all shadow-xl"
                  >
                    <div className="aspect-[4/5] w-full overflow-hidden relative">
                      <img
                        src={ad.thumb}
                        alt={ad.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 animate-develop"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      
                      {/* Top Badges */}
                      <span className="absolute top-2 right-2 px-2 py-0.5 rounded-md text-[9px] font-mono bg-black/70 text-[#00e575] border border-[#00e575]/30">
                        {ad.type === "video" ? "فيديو" : "صورة 4K"}
                      </span>

                      {/* Action buttons */}
                      <div className="absolute bottom-2 inset-x-2 flex items-center justify-between text-right">
                        <div className="truncate flex-1">
                          <span className="text-xs font-bold text-white block truncate">{ad.title}</span>
                          <span className="text-[10px] text-zinc-400 block font-mono">{ad.createdAt}</span>
                        </div>
                        <button
                          onClick={() => {
                            setLightboxItem({
                              isOpen: true,
                              imgUrl: ad.thumb,
                              title: ad.title,
                              prompt: ad.prompt,
                              aspectRatio: ad.aspect,
                              specs: "4K Master • KUBE Engine",
                            });
                          }}
                          className="w-7 h-7 rounded-lg bg-black/70 hover:bg-[#ff2a4b] text-white flex items-center justify-center shrink-0 border border-white/10"
                          title="معاينة وتكبير"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

      </section>

      {/* ============================================================== */}
      {/* 5. SECTION 2: SHOWCASE CARDS (Touch Pan Horizontal Stream)      */}
      {/* ============================================================== */}
      <section className="pt-2 pb-16 w-full max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="relative">
          <div className="flex gap-3 md:gap-4 overflow-x-auto snap-x snap-mandatory py-2 scrollbar-none touch-pan-x">
            {SHOWCASE_CARDS.map((card, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (card.action === "product_studio") setActiveStudioModal("product_3d");
                  else if (card.action === "ugc_studio") setActiveStudioModal("ugc_studio");
                  else if (card.action === "ads_studio") setActiveStudioModal("ads_9x");
                  else if (card.action === "mimic_motion") setActiveStudioModal("mimic_motion");
                  else if (card.action === "storyboard_studio") setActiveStudioModal("storyboard_studio");
                  else if (card.action === "models") setActiveStudioModal("models_api");
                  else setActiveStudioModal("super_agent");
                }}
                onContextMenu={(e) =>
                  handleContextMenuTrigger(e, card.title, card.desc, card.action)
                }
                className="group relative shrink-0 snap-start w-[84vw] sm:w-[50vw] md:w-[380px] lg:w-[420px] aspect-[16/10] rounded-[22px] overflow-hidden bg-zinc-900 text-right ring-1 ring-white/10 hover:ring-[#ff2a4b]/60 active:scale-[0.98] transition-all cursor-pointer shadow-2xl"
              >
                <div className="absolute inset-0 block transition-transform duration-700 group-hover:scale-105">
                  <img src={card.thumb} alt={card.title} className="w-full h-full object-cover" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Badge Tag */}
                <span className="absolute top-3 sm:top-4 start-3 sm:start-4 z-20 font-black text-xs uppercase px-2.5 py-1 rounded-sm -skew-x-12 shadow-xl bg-[#ff2a4b] text-white">
                  {card.tag}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 space-y-1.5">
                  <span className="block text-lg md:text-2xl font-black uppercase tracking-tight text-white">
                    {card.title}
                  </span>
                  <p className="text-xs md:text-sm text-zinc-300 line-clamp-2 leading-relaxed">{card.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff3b56] pt-1">
                    توليد فوري <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. SECTION 3: 3D PRODUCT STUDIO (30s Ad Showcase)               */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-12 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 items-center">
          <div className="flex flex-col items-center lg:items-start text-center lg:text-right gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#ff2a4b] animate-pulse" />
              <span className="text-xs font-bold text-[#ff3b56] font-mono uppercase tracking-wider">
                استديو التسويق 2.0
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight text-white">
              حوّل أي منتج
              <span className="block text-[#a9a9b0]">إلى إعلان مدته 30 ثانية</span>
            </h2>

            <p className="max-w-[520px] text-sm sm:text-base md:text-lg leading-relaxed text-white/75">
              اكتب سطرًا واحدًا عن قهوة KUBE، ونكتب القصة مشهدًا بمشهد ونصوّرها لك بالصوت وإضاءة الاستديو ثلاثية الأبعاد.
            </p>

            <button
              onClick={() => setActiveStudioModal("product_3d")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-9 h-12 rounded-[14px] bg-gradient-to-r from-[#ff334b] to-[#dc2626] hover:from-[#ff4d64] hover:to-[#ef4444] text-white font-black text-sm shadow-xl shadow-[#ff2a4b]/25 active:scale-95 transition-all"
            >
              <Layers className="w-4 h-4 fill-current" />
              <span>أنشئ إعلانًا ثلاثي الأبعاد</span>
            </button>
          </div>

          {/* Interactive Phone Mockup Carousel */}
          <div className="relative mx-auto w-full max-w-[420px] flex items-center justify-center">
            <div className="relative w-[240px] sm:w-[260px] md:w-[280px] aspect-[9/16] rounded-[28px] overflow-hidden border-2 border-zinc-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.9)] bg-zinc-950 group">
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720"
                alt="KUBE Specialty Coffee"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#ff3b56] border border-[#ff2a4b]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a4b] animate-pulse" />
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
      {/* 6.5. SECTION 3.5: BEFORE & AFTER COMPARISON (مقارنة قبل وبعد)    */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-12 md:py-20 border-t border-white/5">
        <div className="relative z-20 max-w-[1400px] mx-auto px-4 sm:px-6 md:px-8 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 text-right">
              <span className="text-xs font-bold font-mono text-[#ff3b56]">مقارنة التحويل البصري</span>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-black text-white">
                قبل وبعد الريندر التجاري
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
                اسحب المؤشر وشاهد كيف يحول الذكاء الاصطناعي لقطة الجوال العادية إلى تحفة إعلانية بدقة 4K مع إضاءة استوديو وانعكاسات طبيعية.
              </p>
            </div>

            {/* Quick Percentage Presets */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              {[0, 25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setSliderPos(pct)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 ${
                    sliderPos === pct
                      ? "bg-[#ff2a4b] text-white shadow-md shadow-[#ff2a4b]/30"
                      : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Split View Container */}
          <div className="relative w-full max-w-4xl mx-auto aspect-[16/9] sm:aspect-[21/9] rounded-3xl overflow-hidden border border-white/10 select-none shadow-2xl bg-zinc-950">
            {/* Background After Image (Rendered 4K) */}
            <img
              src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720"
              alt="After 4K Render"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-[#ff3b56] border border-[#ff2a4b]/40 font-bold">
              بعد (KUBE AI 4K Cinema)
            </div>

            {/* Foreground Before Image (Raw Clip Path) */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 0 0 ${100 - sliderPos}%)` }}
            >
              <img
                src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720"
                alt="Before Raw Photo"
                className="absolute inset-0 w-full h-full object-cover filter brightness-90"
              />
              <div className="absolute top-4 right-4 z-20 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/20 font-bold">
                قبل (صورة جوال عادية)
              </div>
            </div>

            {/* Slider Divider Line & Knob */}
            <div
              className="absolute top-0 bottom-0 z-30 w-1 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] cursor-ew-resize flex items-center justify-center"
              style={{ right: `${sliderPos}%` }}
            >
              <div className="w-8 h-8 rounded-full bg-[#ff2a4b] text-white flex items-center justify-center shadow-lg shadow-[#ff2a4b]/60 border-2 border-white text-xs font-bold -translate-x-0.5">
                ↔
              </div>
            </div>

            {/* Slider Range Input (Invisible overlay for drag) */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
              aria-label="مؤشر مقارنة قبل وبعد"
            />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. SECTION 4: CHARACTER STUDIO (Saudi Personas)                */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-12 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 sm:px-6 md:px-12 space-y-8 md:space-y-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#ff3b56] font-mono">استوديو الشخصيات</span>
                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-sm font-black bg-[#ff2a4b] text-white">
                  جديد
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white tracking-tight">
                شخصيتك، نجم مقطعك القادم
              </h2>
              <p className="text-sm md:text-lg text-white/70 max-w-xl">
                صمّم الشخصية مرة واحدة، ثم اجعل الوجه نفسه بطل كل فيديو وحملة لكافيه KUBE.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("ugc_studio")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs md:text-sm active:scale-95 transition-all self-start md:self-auto"
            >
              <span>اصنع شخصيتك</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Characters Avatar Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
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
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#ff2a4b] active:scale-95 cursor-pointer transition-all shadow-xl"
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
      {/* 8. SECTION 5: SUPER AGENT (Creative Team)                      */}
      {/* ============================================================== */}
      <section className="px-4 sm:px-6 md:px-12 py-12 md:py-16 max-w-[1600px] mx-auto border-t border-white/5">
        <div className="rounded-[24px] sm:rounded-[32px] border border-white/10 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 sm:p-10 md:p-16 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-4 md:space-y-6 text-right">
            <span className="text-xs font-mono uppercase text-[#ff3b56] font-bold">فريقك الإبداعي</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight">سوبر ايجنت KUBE</h2>
            <p className="text-sm md:text-lg text-zinc-300 leading-relaxed">
              وكيل ذكاء اصطناعي سعودي فائق التطور، يكتب السكريبتات الإعلانية، يضبط إضاءة الكافيه، ويطلق الحملات في ثوانٍ.
            </p>

            <div className="pt-2">
              <button
                onClick={() => setActiveStudioModal("super_agent")}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] hover:from-[#ff4d64] hover:to-[#ef4444] text-white font-black text-sm shadow-xl shadow-[#ff2a4b]/30 active:scale-95 transition-all"
              >
                <Bot className="w-4 h-4 fill-current" />
                <span>جرّب سوبر ايجنت الآن</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 9. SECTION 6: TEMPLATES (Ready Apps)                            */}
      {/* ============================================================== */}
      <section id="templates-section" className="relative py-12 md:py-24 w-full overflow-hidden border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
                تطبيقات
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff3b56] to-[#ff2a4b]">
                  جاهزة للإبداع
                </span>
              </h2>
              <p className="text-xs sm:text-base md:text-lg text-white/70 max-w-2xl">
                تخطى كتابة البرومت. استخدم قوالبنا المصممة باحترافية لإنشاء محتوى لكافيه KUBE في ثوانٍ.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("super_agent")}
              className="group flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all self-start md:self-auto text-xs font-bold"
            >
              <span>استكشف كل القوالب</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 6 Templates Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {TEMPLATES_ITEMS.map((tmpl, idx) => (
              <div
                key={idx}
                onClick={() => {
                  toast.success(`تم اختيار قالب "${tmpl.title}" ونقله لسوبر ايجنت`);
                  setActiveStudioModal("super_agent");
                }}
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#ff2a4b] active:scale-95 transition-all cursor-pointer shadow-xl"
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
                  <span className="text-[10px] font-mono text-[#ff3b56] block">{tmpl.cat}</span>
                  <span className="text-xs font-black text-white block truncate">{tmpl.title}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 10. SECTION 7: UGC 2.0 (High-Realism Videos)                    */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-12 md:py-24 border-t border-white/5">
        <div className="relative z-30 mx-auto max-w-[1600px] px-4 md:px-8 space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold font-mono text-[#ff3b56] uppercase">UGC Studio 2.0</span>
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white">أنشئ مقاطع يو جي سي عالية الواقعية</h2>
            <p className="text-xs sm:text-sm md:text-base text-zinc-400">
              أصوات سعودية ونبرات طبيعية تناسب إعلانات تيك توك وسناب شات وريلز.
            </p>
          </div>

          {/* Horizontal Video Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {UGC_CREATORS.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setActiveCreator(item);
                  setActiveStudioModal("ugc_studio");
                }}
                onContextMenu={(e) =>
                  handleContextMenuTrigger(e, item.name, item.role, "ugc_studio")
                }
                className="group relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-900 cursor-pointer hover:border-[#ff2a4b] active:scale-95 transition-all shadow-xl"
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#ff334b] to-[#dc2626] text-white flex items-center justify-center shadow-2xl">
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
      {/* 11. SECTION 8: ADS STUDIO 9x & 30+ CONCEPTS                    */}
      {/* ============================================================== */}
      <section className="relative w-full overflow-hidden bg-black py-12 md:py-24 border-t border-white/5">
        <div className="relative z-20 max-w-[1600px] mx-auto px-4 md:px-8 space-y-6 md:space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-[#ff3b56]">رائج • 30+ نمط بصري</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white">استديو الإعلانات — ٩ صور من لقطة واحدة</h2>
              <p className="text-xs sm:text-sm md:text-base text-zinc-400 max-w-2xl">
                اختر من بين أكثر من 30 نمطاً إعلانياً عالمياً مدرباً بدقة، وحوّل منتجك أو قهوتك إلى 9 زوايا تسويقية جاهزة للحملات فوراً.
              </p>
            </div>

            <button
              onClick={() => setActiveStudioModal("ads_9x")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] hover:from-[#ff4d64] hover:to-[#ef4444] text-white font-black text-sm shadow-xl shadow-[#ff2a4b]/30 active:scale-95 transition-all self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>توليد الـ 9 إعلانات فوراً</span>
            </button>
          </div>

          {/* Category Filter Pills for 30+ Concepts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none touch-pan-x text-xs">
            {[
              { id: "all", label: "جميع الأنماط (30+)" },
              { id: "product_ads", label: "إعلانات منتجات (10)" },
              { id: "cinematic", label: "سينمائي وهيرو (8)" },
              { id: "luxury_lighting", label: "فخامة ونيون (7)" },
              { id: "lifestyle", label: "شارع ولايف ستايل (5)" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setAdSubtypeFilter(f.id as any)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                  adSubtypeFilter === f.id
                    ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                    : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* 30+ Concepts Cards Grid (Mobile 2 cols, Desktop 6 cols) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 sm:gap-4">
            {KUBE_MARKETING_SUBTYPES.filter(
              (item) => adSubtypeFilter === "all" || item.category === adSubtypeFilter
            ).map((st) => (
              <div
                key={st.id}
                onClick={() => {
                  setSelectedAdSubtype(st);
                  setAdsProductTitle(`قهوة KUBE بنمط ${st.labelAr}`);
                  setActiveStudioModal("ads_9x");
                  toast.success(`تم اختيار نمط: ${st.labelAr}`);
                }}
                onContextMenu={(e) =>
                  handleContextMenuTrigger(e, st.labelAr, st.taglineAr, "ads_studio")
                }
                className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#ff2a4b] active:scale-95 transition-all cursor-pointer shadow-xl flex flex-col justify-between"
              >
                <div className="aspect-[4/5] w-full overflow-hidden relative">
                  <img
                    src={st.thumbnail}
                    alt={st.labelAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
                  <span className="absolute top-2.5 right-2.5 text-base sm:text-lg drop-shadow-md">
                    {st.icon}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxItem({
                        isOpen: true,
                        imgUrl: st.thumbnail,
                        title: `نمط: ${st.labelAr} (${st.label})`,
                        prompt: st.taglineAr,
                        aspectRatio: "4:5 Portrait",
                        specs: "4K AI Generated • Studio Lighting",
                      });
                    }}
                    className="absolute bottom-2.5 left-2.5 z-20 w-7 h-7 rounded-lg bg-black/70 hover:bg-[#ff2a4b] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                    title="تكبير بدقة 4K"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-3 space-y-1 text-right bg-zinc-950/80">
                  <span className="text-[10px] font-mono text-[#ff3b56] block truncate">
                    {st.label}
                  </span>
                  <span className="text-xs font-black text-white block truncate">
                    {st.labelAr}
                  </span>
                  <p className="text-[10px] text-zinc-400 line-clamp-2 leading-tight">
                    {st.taglineAr}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 12. SECTION 9: MOTION LIVE (نسختك المُطابقة)                   */}
      {/* ============================================================== */}
      <section className="relative py-16 md:py-20 bg-black border-t border-white/5 overflow-hidden">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12 lg:gap-20">
            {/* Mockup with live pulsing ring */}
            <div className="relative shrink-0">
              <div className="w-[220px] sm:w-[260px] md:w-[280px] aspect-[9/16] rounded-[2.5rem] overflow-hidden border-2 border-zinc-800 shadow-2xl bg-zinc-950 relative">
                <img
                  src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720"
                  alt="Motion Control"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[9px] font-mono text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff2a4b] animate-pulse" />
                  <span>LIVE Motion</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 md:space-y-6 text-center lg:text-right max-w-xl">
              <span className="text-xs font-mono uppercase text-[#ff3b56] font-bold">LIVE</span>
              <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-white leading-tight">نسختك المُطابقة</h2>
              <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
                انقل الحركة الحقيقية إلى أي شخصية أو فنجان قهوة. ارفع مشية، تلويحة، أو سكب — وشاهد إبداعك يتحرك تماماً مثلك.
              </p>

              <div className="grid grid-cols-3 gap-2.5 md:gap-3 pt-2 text-center font-mono">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-base sm:text-lg font-black text-white block">30s</span>
                  <span className="text-[10px] text-zinc-400">أقصى مدة</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-base sm:text-lg font-black text-white block">4K</span>
                  <span className="text-[10px] text-zinc-400">أعلى دقة</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/10">
                  <span className="text-base sm:text-lg font-black text-[#ff3b56] block">Pro</span>
                  <span className="text-[10px] text-zinc-400">مطابقة الحركة</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 13. SECTION 10: MODELS & API CATALOG                           */}
      {/* ============================================================== */}
      <section className="py-12 md:py-24 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono text-[#ff3b56]">المحركات ونماذج الـ API</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">كتالوج النماذج العالمية للربط البرمجي</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              حصر شامل لمحركات Kling, Veo, WanX, Flux, Grok, Omni مع وثائق الـ Endpoints الجاهزة للربط مع سيرفرات KUBE.
            </p>
          </div>

          <button
            onClick={() => setActiveStudioModal("models_api")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs active:scale-95 transition-all self-start md:self-auto"
          >
            <Code className="w-4 h-4 text-[#ff3b56]" />
            <span>عرض وثائق الـ API كاملة</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {HALAI_AI_MODELS_CATALOG.slice(0, 8).map((model) => (
            <div
              key={model.id}
              onClick={() => {
                setSelectedModelForApi(model);
                setActiveStudioModal("models_api");
              }}
              className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4 sm:p-5 space-y-3 hover:border-[#ff2a4b] active:scale-[0.98] cursor-pointer transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{model.nameAr}</span>
                  <span className="text-[10px] font-mono text-[#ff3b56] bg-white/5 px-2 py-0.5 rounded-md">
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
      {/* 14. SECTION 11: MCP INTEGRATIONS (Salla & Zid & POS)          */}
      {/* ============================================================== */}
      <section id="mcp-section" className="py-12 md:py-16 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8 space-y-4">
            <span className="text-xs font-mono text-[#ff3b56]">متوفر في متجر تطبيقات سلة</span>
            <h3 className="text-xl sm:text-2xl font-black text-white">عزّز متجرك في سلة</h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم سلة مباشرة وبمزامنة فورية مع كاشير KUBE.
            </p>
            <button
              onClick={() => toast.success("تم تفعيل موصّل سلة مع KUBE POS بنجاح")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95"
            >
              <span>اتصال سلة MCP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 to-black p-6 sm:p-8 space-y-4">
            <span className="text-xs font-mono text-[#ff3b56]">متوفر في متجر تطبيقات زد</span>
            <h3 className="text-xl sm:text-2xl font-black text-white">عزّز متجرك في زد</h3>
            <p className="text-xs md:text-sm text-zinc-400 leading-relaxed">
              أنشئ صور منتجاتك وفيديوهاتها وإعلاناتها من لوحة تحكم زد مباشرة وبمزامنة فورية مع نظام KUBE ERP.
            </p>
            <button
              onClick={() => toast.success("تم تفعيل موصّل زد مع KUBE ERP بنجاح")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95"
            >
              <span>اتصال زد MCP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 15. SECTION 12: PROMLOG (Prompt Library Bank)                  */}
      {/* ============================================================== */}
      <section className="py-12 md:py-16 max-w-[1600px] mx-auto px-4 md:px-8 border-t border-white/5 space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold font-mono text-[#ff3b56]">وصول مجاني داخلي</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white">بروملوق — بنك برومبتات القهوة</h2>
            <p className="text-xs md:text-sm text-zinc-400">
              مكتبة خاصة من البرومتات الجاهزة للتنفيذ، احصل عليها فوراً وانشر إبداعك.
            </p>
          </div>

          <button
            onClick={() => setActiveStudioModal("promlog")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-xs active:scale-95 transition-all self-start md:self-auto"
          >
            <FolderOpen className="w-4 h-4 text-[#ff3b56]" />
            <span>عرض كل البرومبتات (40+)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAUDI_VISUAL_PROMPTS.slice(0, 3).map((vp) => (
            <div
              key={vp.id}
              className="rounded-2xl border border-white/10 bg-zinc-900/60 p-4 sm:p-5 space-y-3 flex flex-col justify-between hover:border-[#ff2a4b]/50 transition-all"
            >
              <div className="space-y-2 text-right">
                <span className="text-[10px] font-mono text-[#ff3b56] uppercase block">{vp.category}</span>
                <h4 className="text-sm font-black text-white">{vp.title}</h4>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{vp.arabicPrompt}</p>
                <div className="p-2.5 rounded-xl bg-black/60 border border-white/5 text-[10px] font-mono text-zinc-400 line-clamp-3 select-all">
                  {vp.englishPrompt}
                </div>
              </div>

              <button
                onClick={() => handleCopy(vp.englishPrompt, vp.title)}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 hover:bg-[#ff2a4b] hover:text-white text-zinc-200 font-bold text-xs active:scale-95 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ البرومبت بالإنجليزية</span>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================================== */}
      {/* 16. FOOTER (Studio Footer)                                     */}
      {/* ============================================================== */}
      <footer className="w-full border-t border-white/10 bg-black py-12 px-4 md:px-8 text-zinc-400 text-xs">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff334b] to-[#dc2626] text-white font-black text-xs">
              K
            </div>
            <span className="font-bold text-white text-sm">KUBE AI</span>
            <span>— منظومة الذكاء الاصطناعي التوليدي الخاصة بكافيه ومطبخ KUBE</span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap justify-center">
            <Link to={backHomeUrl} className="hover:text-white transition-colors">
              لوحة التحكم الرئيسية
            </Link>
            <button onClick={() => setActiveStudioModal("super_agent")} className="hover:text-white transition-colors">
              سوبر ايجنت
            </button>
            <button onClick={() => setActiveStudioModal("product_3d")} className="hover:text-white transition-colors">
              استديو المنتجات 3D
            </button>
            <button
              onClick={() => setActiveStudioModal("providers_guide")}
              className="hover:text-white transition-colors text-[#ff3b56] font-bold"
            >
              دليل مفاتيح المزودين (API)
            </button>
          </div>

          <div className="text-[11px] font-mono text-zinc-500">
            الرياض، المملكة العربية السعودية • إصدار KUBE AI Studio 2026
          </div>
        </div>
      </footer>

      {/* ============================================================== */}
      {/* 17. INTERACTIVE WORKSPACE MODAL OVERLAY (iPhone & Full Screen) */}
      {/* ============================================================== */}
      {activeStudioModal !== "none" && (
        <div
          onClick={() => setActiveStudioModal("none")}
          className="fixed inset-0 z-[10010] bg-black/95 sm:bg-black/90 backdrop-blur-2xl flex items-end sm:items-center justify-center p-0 sm:p-4 md:p-6 animate-in fade-in duration-200 select-none touch-manipulation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full h-[94dvh] sm:h-[92vh] sm:max-w-6xl rounded-t-[28px] sm:rounded-[28px] border-t sm:border border-white/15 bg-[#121212] flex flex-col overflow-hidden shadow-2xl select-text"
          >
            {/* Mobile drag handle bar */}
            <div className="w-12 h-1.5 rounded-full bg-white/20 mx-auto my-2 sm:hidden shrink-0" />

            {/* Modal Topbar */}
            <div className="h-14 px-4 sm:px-5 border-b border-white/10 flex items-center justify-between bg-zinc-950/90 shrink-0">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-6 h-6 rounded-lg bg-[#ff2a4b] text-white flex items-center justify-center font-black text-xs shrink-0">
                  ⚡️
                </div>
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  {activeStudioModal === "super_agent" && "سوبر ايجنت KUBE — محادثة فورية وتوليد إعلانات"}
                  {activeStudioModal === "product_3d" && "استديو المنتجات 3D — إضاءة وزوايا ثلاثية الأبعاد"}
                  {activeStudioModal === "ugc_studio" && "استديو UGC 2.0 — الشخصيات والسكريبتات"}
                  {activeStudioModal === "ads_9x" && "استديو الإعلانات 9x — حزمة الـ 9 زوايا"}
                  {activeStudioModal === "mimic_motion" && "استديو محاكاة الحركة (Mimic Motion) — ريندر سينمائي 60fps"}
                  {activeStudioModal === "storyboard_studio" && "استديو الستوري بورد (Storyboard) — إخراج إعلاني من 4 مشاهد"}
                  {activeStudioModal === "models_api" && "كتالوج نماذج ومحركات الذكاء الاصطناعي (API)"}
                  {activeStudioModal === "promlog" && "بروملوق — بنك برومبتات كافيه KUBE"}
                  {activeStudioModal === "providers_guide" && "دليل مفاتيح المزودين ومستودعات الربط (API Keys Guide)"}
                </span>
              </div>

              <button
                onClick={() => setActiveStudioModal("none")}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-colors shrink-0"
                title="إغلاق النافذة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-20 sm:pb-6">
              {/* MODAL: PROVIDERS API KEYS GUIDE (New Report) */}
              {activeStudioModal === "providers_guide" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10 space-y-2">
                    <div className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-[#ff2a4b]" />
                      <h3 className="font-black text-base md:text-lg text-white">
                        دليل المزودين لجلب مفاتيح الربط البرمجي (API Keys)
                      </h3>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      هذا التقرير الشامل يوضح أسماء المنصات العالمية، لوحات المطورين، أسماء المفاتيح المطلوبة، ونقاط الربط (Endpoints) حتى نربط معهم مباشرة وتعمل مخرجات KUBE AI بنفس دقة ومخرجات هلاي.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AI_PROVIDERS.map((prov) => (
                      <div
                        key={prov.id}
                        className="rounded-2xl border border-white/10 bg-zinc-900/80 p-4 sm:p-5 space-y-3 flex flex-col justify-between hover:border-[#ff2a4b]/50 transition-colors"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-white">{prov.name}</span>
                            <span className="text-[10px] font-mono text-[#ff3b56] bg-[#ff2a4b]/15 px-2 py-0.5 rounded-md border border-[#ff2a4b]/30">
                              {prov.status}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed">{prov.purpose}</p>

                          <div className="p-3 rounded-xl bg-black/60 border border-white/5 space-y-1.5 font-mono text-[11px] text-zinc-400">
                            <div>
                              المتغير المطلوب: <span className="text-[#ff3b56] font-bold">{prov.keyEnv}</span>
                            </div>
                            <div className="truncate">
                              الـ Endpoint: <span className="text-zinc-300">{prov.endpoint}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <a
                            href={prov.docUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs transition-colors"
                          >
                            <span>لوحة المطورين</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleCopy(prov.keyEnv, "اسم المتغير")}
                            className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-[#ff2a4b] hover:text-white text-zinc-300 font-bold text-xs active:scale-95 transition-colors"
                            title="نسخ اسم المتغير"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL: SUPER AGENT WORKSPACE (100% Halai Matching) */}
              {activeStudioModal === "super_agent" && (
                <div className="relative h-full flex flex-col justify-between space-y-4 text-right">
                  
                  {/* Top Announcement Banner (Matching IMG_0099) */}
                  <div className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-zinc-900 border border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                      <img
                        src="https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720"
                        alt="Mimic"
                        className="w-10 h-10 rounded-xl object-cover shrink-0 border border-white/10"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">اطلب من الوكيل فيديو كيوب ميميك</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                        </div>
                        <span className="text-[10px] text-zinc-400">انسخ حركة أي فيديو وطبقها على منتجك</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setSuperAgentTourOpen(true)}
                      className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-[11px] font-bold active:scale-95 transition-all"
                    >
                      بدء الجولة الإرشادية ✦
                    </button>
                  </div>

                  {/* Greeting & Headline */}
                  <div className="text-center space-y-1.5 pt-1">
                    <div className="inline-flex items-center gap-2 justify-center">
                      <div className="w-5 h-5 rounded-md bg-[#00e575] flex items-center justify-center text-black font-black text-xs">
                        ✦
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white">
                        مساء الخير، زياد
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-400">
                      حوّل محادثة بسيطة إلى محتوى تسويقي جاهز للإنتاج.
                    </p>
                  </div>

                  {/* Super Agent Input Capsule (Matching IMG_0102) */}
                  <div className="max-w-2xl w-full mx-auto space-y-3 shrink-0">
                    <div className="relative rounded-3xl bg-zinc-900/90 border border-white/15 p-3 sm:p-4 space-y-2 shadow-2xl">
                      <textarea
                        rows={2}
                        value={agentInputText}
                        onChange={(e) => setAgentInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendAgent();
                          }
                        }}
                        placeholder="اجعل صورة منتجي بجودة الاستوديو... أو صمّم ملصقاً إعلانياً لقهوة KUBE"
                        className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
                      />

                      {/* Controls inside input box: Mic, Send, Model, Attach */}
                      <div className="flex items-center justify-between pt-1 border-t border-white/5">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleSendAgent()}
                            className="w-9 h-9 rounded-xl bg-[#00e575] hover:bg-[#00ff83] text-black flex items-center justify-center font-bold shadow-md active:scale-95 transition-transform"
                            title="إرسال"
                          >
                            <Send className="w-4 h-4 -scale-x-100" />
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => toast.info("جاري الاستماع للأمر الصوتي بالعامية السعودية...")}
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center active:scale-95"
                            title="أمر صوتي"
                          >
                            <Mic className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          {/* Model Switcher Dropdown */}
                          <div className="relative">
                            <select
                              value={selectedEngine}
                              onChange={(e) => setSelectedEngine(e.target.value)}
                              className="appearance-none rounded-xl bg-black/60 border border-white/10 hover:border-white/20 px-3 py-1.5 text-[11px] font-bold text-zinc-300 focus:outline-none cursor-pointer text-center"
                            >
                              <option value="تلقائي (Omni Flash 1.1)">تلقائي ✦</option>
                              <option value="Google Gemini 1.5 Pro">Gemini 1.5 Pro</option>
                              <option value="Claude 3.5 Sonnet">Claude 3.5 Sonnet</option>
                              <option value="Flux 1.1 Pro Ultra">Flux 1.1 Pro</option>
                              <option value="Kling 3 Turbo">Kling 3 Turbo</option>
                            </select>
                          </div>

                          <button
                            type="button"
                            onClick={() => toast.info("انقر لإرفاق صورة منتج أو ملف مرجعي")}
                            className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white flex items-center justify-center active:scale-95"
                            title="إرفاق ملف"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick Chips Row below input */}
                    <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
                      <button
                        onClick={() => handleSendAgent("اقترح لي مهارة تسويقية لزيادة مبيعات كافيه KUBE")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-colors"
                      >
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>المهارات</span>
                      </button>

                      <button
                        onClick={() => setActiveStudioModal("connectors_hub")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-colors"
                      >
                        <span>الموصلات</span>
                        <span className="flex items-center gap-0.5 text-[10px] text-zinc-400">
                          (سلة، زد، سلاك)
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveStudioModal("mcp_hub")}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white active:scale-95 transition-colors"
                      >
                        <Radio className="w-3.5 h-3.5 text-purple-400" />
                        <span>جرب MCP</span>
                      </button>
                    </div>
                  </div>

                  {/* Section: "صُنعت على كيوب — اختر واحدة ونسوّي لك مثلها" (Matching IMG_0099) */}
                  <div className="space-y-2 pt-2">
                    <span className="text-xs font-bold text-zinc-400 block text-right">
                      صُنعت على كيوب — اختر واحدة ونسوّي لك مثلها
                    </span>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                      {[
                        {
                          title: "شوكولاتة الشعار",
                          thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720",
                          prompt: "Luxury embossed artisan chocolate box with KUBE gold branding on matte finish",
                        },
                        {
                          title: "أكياس التسوق",
                          thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=720",
                          prompt: "Luxury boutique shopping bags with embossed red ribbon and elegant typography",
                        },
                        {
                          title: "إكسسوارات مميزة",
                          thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
                          prompt: "Diamond crystal brooch in the shape of luxury Arabic calligraphy on silk",
                        },
                        {
                          title: "شخصية تسويقية",
                          thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/c43e443131757e6b7f81f374a372b878/thumbnails/thumbnail.jpg?height=720",
                          prompt: "Authentic Saudi youth in modern thobe enjoying specialty cold brew coffee in Riyadh",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] transition-all cursor-pointer shadow-lg"
                        >
                          <img
                            src={item.thumb}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          <div className="absolute inset-x-2 bottom-2 space-y-1.5 text-center">
                            <span className="text-xs font-bold text-white block truncate">
                              {item.title}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                handleSendAgent(`سوّ لي إعلان مثل: ${item.title} لقهوة KUBE`);
                              }}
                              className="w-full py-1.5 rounded-xl bg-white/20 hover:bg-[#00e575] hover:text-black text-white text-[11px] font-bold backdrop-blur-md active:scale-95 transition-all"
                            >
                              سوّ لي مثلها
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chat Messages Stream (Rendered above if conversation active) */}
                  {chatMessages.length > 1 && (
                    <div className="space-y-3 pt-3 border-t border-white/10 max-h-48 overflow-y-auto">
                      {chatMessages.slice(1).map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 font-bold text-xs ${
                              msg.sender === "user" ? "bg-amber-500 text-black" : "bg-[#00e575] text-black font-black"
                            }`}
                          >
                            {msg.sender === "user" ? "ز" : "✦"}
                          </div>
                          <div
                            className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                              msg.sender === "user"
                                ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white"
                                : "bg-zinc-900 border border-white/10 text-white"
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 10-Step Interactive Guided Tour Modal Popup (Matching IMG_0099 to IMG_0103) */}
                  {superAgentTourOpen && (
                    <div
                      onClick={() => setSuperAgentTourOpen(false)}
                      className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
                    >
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="max-w-sm w-full rounded-3xl bg-[#1a1a1e] border border-white/15 p-5 space-y-4 text-right shadow-2xl animate-in zoom-in-95 duration-200"
                      >
                        {/* Header: Counter & Close */}
                        <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                          <button
                            onClick={() => setSuperAgentTourOpen(false)}
                            className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-zinc-300">{superAgentTourStep} / 10</span>
                        </div>

                        {/* Step Details */}
                        <div className="space-y-2">
                          <h4 className="text-base font-black text-white">
                            {superAgentTourStep === 1 && "أهلاً بك في سوبر ايجنت"}
                            {superAgentTourStep === 2 && "اكتب فكرتك"}
                            {superAgentTourStep === 3 && "ارفع صور منتجاتك"}
                            {superAgentTourStep === 4 && "اختر النموذج"}
                            {superAgentTourStep === 5 && "أرسل أو اضغط Enter"}
                            {superAgentTourStep === 6 && "المهارات والموصلات"}
                            {superAgentTourStep === 7 && "محاكاة الحركة (Mimic)"}
                            {superAgentTourStep === 8 && "استوديو الشخصيات"}
                            {superAgentTourStep === 9 && "حزمة الـ 9 إعلانات"}
                            {superAgentTourStep === 10 && "التصدير وجودة 4K"}
                          </h4>

                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {superAgentTourStep === 1 &&
                              "جولة سريعة تشرح لك وظيفة كل زر. تقدر تتخطاها في أي وقت."}
                            {superAgentTourStep === 2 &&
                              "اشرح ما تريده بكلماتك — عربي أو إنجليزي. مثلاً: «سوّ لي إعلان لعطري أو لقهوتي»."}
                            {superAgentTourStep === 3 &&
                              "أضف صور عالية الجودة لمنتجك أو كوب القهوة ليتعرف عليها الذكاء الاصطناعي بدقة."}
                            {superAgentTourStep === 4 &&
                              "بدّل العقل الذي يرد عليك. النماذج الأخف تستهلك وقتاً أقل، والأقوى تخطط أفضل."}
                            {superAgentTourStep === 5 &&
                              "اضغط زر الإرسال أو Enter. يخطط السوبر ايجنت للعمل وينفّذ الحملة فوراً."}
                            {superAgentTourStep === 6 &&
                              "اربط متجرك في سلة وزد وتطبيقات التواصل لنشر الحملات تلقائياً بنقرة واحدة."}
                            {superAgentTourStep === 7 &&
                              "حوّل أي مقطع فيديو حقيقي إلى إعلان لمنتجك بنفس زوايا الكاميرا وحركتها بدون تشوه."}
                            {superAgentTourStep === 8 &&
                              "صمّم سفيراً أو صانع محتوى UGC يتحدث باللهجة النجدية أو الحجازية عن كافيه KUBE."}
                            {superAgentTourStep === 9 &&
                              "ولّد 9 زوايا إعلانية مختلفة بضغطة زر واحدة تناسب جميع مقاسات المنصات (ستوري، بوست، ريلز)."}
                            {superAgentTourStep === 10 &&
                              "حمّل الصور والفيديوهات بدقة 4K سينمائية مع إضاءة استوديو كاملة بدون أي علامات مائية."}
                          </p>
                        </div>

                        {/* 10 Progress Dots */}
                        <div className="flex items-center justify-center gap-1.5 py-1">
                          {Array.from({ length: 10 }).map((_, i) => (
                            <span
                              key={i}
                              className={`h-1.5 rounded-full transition-all ${
                                superAgentTourStep === i + 1
                                  ? "w-5 bg-[#00e575]"
                                  : "w-1.5 bg-white/20"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          {superAgentTourStep > 1 ? (
                            <button
                              onClick={() => setSuperAgentTourStep((s) => Math.max(1, s - 1))}
                              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 font-bold text-xs active:scale-95 transition-all"
                            >
                              رجوع
                            </button>
                          ) : (
                            <button
                              onClick={() => setSuperAgentTourOpen(false)}
                              className="px-4 py-2 rounded-xl text-zinc-500 hover:text-zinc-300 text-xs font-bold"
                            >
                              تخطي
                            </button>
                          )}

                          {superAgentTourStep < 10 ? (
                            <button
                              onClick={() => setSuperAgentTourStep((s) => Math.min(10, s + 1))}
                              className="px-5 py-2 rounded-xl bg-white text-black font-black text-xs active:scale-95 transition-all shadow-md"
                            >
                              التالي
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setSuperAgentTourOpen(false);
                                toast.success("أنت الآن جاهز لاستخدام سوبر ايجنت بكل احترافية!");
                              }}
                              className="px-5 py-2 rounded-xl bg-[#00e575] text-black font-black text-xs active:scale-95 transition-all shadow-md shadow-[#00e575]/30"
                            >
                              ابدأ الآن
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* ============================================================== */}
              {/* MODAL: 3D PRODUCT STUDIO WORKSPACE (4-Step Wizard)            */}
              {/* ============================================================== */}
              {activeStudioModal === "product_3d" && (
                <div className="space-y-6 text-right">
                  {/* Step Navigation Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto scrollbar-none text-xs">
                      {[
                        { step: 1, label: "١. المنتج والكوب", icon: Coffee },
                        { step: 2, label: "٢. السطح والبيئة", icon: Layers },
                        { step: 3, label: "٣. إضاءة 3D والزوايا", icon: Sliders },
                        { step: 4, label: "٤. ريندر 4K", icon: Sparkles },
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setProductStudioStep(s.step as any)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                            productStudioStep === s.step
                              ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {productStudioStep > 1 && (
                        <button
                          onClick={() => setProductStudioStep((p) => Math.max(1, p - 1) as any)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          السابق
                        </button>
                      )}
                      {productStudioStep < 4 ? (
                        <button
                          onClick={() => setProductStudioStep((p) => Math.min(4, p + 1) as any)}
                          className="px-4 py-1.5 rounded-xl bg-[#ff2a4b] hover:bg-[#ff4d64] text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          الخطوة التالية
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toast.info("جاري ريندر المشهد 4K Cinema...");
                            setTimeout(() => toast.success("تم إتمام ريندر 4K بنجاح!"), 800);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30"
                        >
                          توليد ريندر 4K
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STEP 1: SELECT PRODUCT */}
                  {productStudioStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر المنتج أو فنجان القهوة المطلوب تصويره</h4>
                        <p className="text-xs text-zinc-400">حدد أحد منتجات كافيه ومطبخ KUBE المميزة أو ارفع صورة منتجك الخاص</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {KUBE_COFFEE_CATALOG.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedCoffeeProduct(item);
                              toast.success(`تم اختيار: ${item.name}`);
                            }}
                            className={`rounded-2xl border p-3 flex flex-col justify-between cursor-pointer active:scale-95 transition-all ${
                              selectedCoffeeProduct.id === item.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-black">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-mono text-[#ff3b56] block">{item.category}</span>
                              <h5 className="text-xs font-black text-white leading-snug">{item.name}</h5>
                              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{item.desc}</p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between">
                              <span className="text-xs font-bold text-white font-mono">{item.price}</span>
                              {selectedCoffeeProduct.id === item.id && (
                                <span className="text-[10px] font-bold text-[#ff3b56] flex items-center gap-1">
                                  <Check className="w-3 h-3" /> مفعّل
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 rounded-2xl bg-zinc-900/70 border border-white/10 flex items-center justify-between">
                        <div className="space-y-1">
                          <span className="text-xs font-bold text-white block">هل لديك صورة خاصة لمنتجك؟</span>
                          <span className="text-[11px] text-zinc-400 block">ارفع صورة بدون خلفية ليدمجها محرك KUBE 3D في البيئات الافتراضية فوراً</span>
                        </div>
                        <button
                          onClick={() => toast.info("انقر لاختيار صورة من جهازك")}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4 text-[#ff3b56]" />
                          <span>رفع منتج مخصص</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SELECT SURFACE & ENVIRONMENT */}
                  {productStudioStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر سطح المنصة وبيئة الاستوديو</h4>
                        <p className="text-xs text-zinc-400">حدد السطح الحقيقي المحاكي فيزيائياً مع انعكاسات الظلال الدقيقة</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                        {[
                          {
                            id: "black_marble",
                            title: "رخام نيرو أسود إيطالي",
                            desc: "سطح رخامي أسود فاحم مع عروق بيضاء مصقولة وعاكسة لإضاءة الكوب",
                            tag: "فخامة كافيه",
                            thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720",
                          },
                          {
                            id: "travertine",
                            title: "حجر ترافيرتين صحراوي دافئ",
                            desc: "ملمس طبيعي مسامي مستوحى من نجد يعطي إحساساً عضوياً راقياً ودافئاً",
                            tag: "طبيعي وأرضي",
                            thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
                          },
                          {
                            id: "walnut",
                            title: "خشب الجوز الداكن (Dark Walnut)",
                            desc: "خشب طبيعي فاخر بلمعة زيتية دافئة تبرز ألوان الكولد برو ورغوة الفلات وايت",
                            tag: "بار قهوة مختصة",
                            thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
                          },
                          {
                            id: "concrete_neon",
                            title: "خرسانة مدنية مع نيون أحمر",
                            desc: "بيئة عصرية مستوحاة من الرياض ليلاً مع توهج أحمر داكن مطابق لهوية KUBE",
                            tag: "شبابي وجريء",
                            thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=720",
                          },
                          {
                            id: "softbox",
                            title: "استوديو سوفت بوكس عالي التباين",
                            desc: "خلفية ناصعة بظلال ناعمة للغاية مناسبة لكتالوجات المتاجر وسلة وزد",
                            tag: "تجارة إلكترونية",
                            thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
                          },
                        ].map((surf) => (
                          <div
                            key={surf.id}
                            onClick={() => {
                              setSelectedSurface(surf.id as any);
                              toast.success(`تم اختيار السطح: ${surf.title}`);
                            }}
                            className={`rounded-2xl border p-4 flex flex-col justify-between cursor-pointer active:scale-95 transition-all ${
                              selectedSurface === surf.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black relative">
                                <img src={surf.thumb} alt={surf.title} className="w-full h-full object-cover" />
                                <span className="absolute top-2 right-2 text-[9px] font-mono font-bold bg-black/70 px-2 py-0.5 rounded-full text-[#ff3b56]">
                                  {surf.tag}
                                </span>
                              </div>
                              <h5 className="text-xs font-black text-white">{surf.title}</h5>
                              <p className="text-[11px] text-zinc-400 leading-relaxed">{surf.desc}</p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-end">
                              {selectedSurface === surf.id ? (
                                <span className="text-[10px] font-bold text-[#ff3b56] flex items-center gap-1">
                                  <Check className="w-3 h-3" /> تم التحديد
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500">انقر للتحديد</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: 3D LIGHTING & CAMERA ANGLES */}
                  {productStudioStep === 3 && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 space-y-5">
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-white">توجيه الإضاءة ثلاثية الأبعاد (6 محاور)</h4>
                          <p className="text-xs text-zinc-400">حدد موضع مصدر الضوء الرئيسي لمحاكاة الظلال الطبيعية</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "top", label: "أعلى (Top Zenith)" },
                            { id: "front", label: "أمامي مباشر (Direct Front)" },
                            { id: "right", label: "جانبي يمين (Key Light)" },
                            { id: "left", label: "جانبي يسار (Fill Light)" },
                            { id: "rim_back", label: "إضاءة حواف خلفية (Rim)" },
                            { id: "bottom", label: "سفلي درامي (Underglow)" },
                          ].map((btn) => (
                            <button
                              key={btn.id}
                              onClick={() => setLightingDirection(btn.id as any)}
                              className={`p-2.5 rounded-xl font-bold text-xs text-center transition-all active:scale-95 ${
                                lightingDirection === btn.id
                                  ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                                  : "bg-black/60 border border-white/10 text-zinc-300 hover:text-white"
                              }`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>

                        {/* Interactive 3D Sphere */}
                        <div className="rounded-2xl border border-white/10 bg-black/80 p-5 text-center space-y-3">
                          <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#ff2a4b]/50 mx-auto flex items-center justify-center relative shadow-inner">
                            <div
                              className={`w-7 h-7 rounded-full bg-gradient-to-br from-[#ff334b] to-[#dc2626] shadow-xl shadow-[#ff2a4b]/70 transition-transform duration-300 ${
                                lightingDirection === "top"
                                  ? "-translate-y-6"
                                  : lightingDirection === "bottom"
                                  ? "translate-y-6"
                                  : lightingDirection === "left"
                                  ? "-translate-x-6"
                                  : lightingDirection === "right"
                                  ? "translate-x-6"
                                  : "scale-125 ring-4 ring-[#ff2a4b]/30"
                              }`}
                            />
                          </div>
                          <span className="text-[11px] text-zinc-400 font-mono block">
                            المحور الحالي: <span className="text-[#ff3b56] font-bold">{lightingDirection}</span>
                          </span>
                        </div>
                      </div>

                      <div className="lg:col-span-6 rounded-2xl border border-white/10 bg-zinc-900/80 p-5 space-y-5">
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-white">شدة الإضاءة ونسبة الأبعاد</h4>
                          <p className="text-xs text-zinc-400">حدد تباين المشهد ومقاس الصورة المناسب لمنصات النشر</p>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-300 block">شدة الإضاءة والظلال:</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => setLightingIntensity("soft")}
                              className={`py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                                lightingIntensity === "soft"
                                  ? "bg-[#ff2a4b] text-white"
                                  : "bg-black/60 border border-white/10 text-zinc-400"
                              }`}
                            >
                              إضاءة ناعمة (Soft Diffusion)
                            </button>
                            <button
                              onClick={() => setLightingIntensity("hard")}
                              className={`py-2.5 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                                lightingIntensity === "hard"
                                  ? "bg-[#ff2a4b] text-white"
                                  : "bg-black/60 border border-white/10 text-zinc-400"
                              }`}
                            >
                              إضاءة حادة سينمائية (Hard Contrast)
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-zinc-300 block">نسبة الأبعاد والمقاس:</label>
                          <div className="grid grid-cols-4 gap-2">
                            {(["9:16", "1:1", "4:5", "16:9"] as const).map((r) => (
                              <button
                                key={r}
                                onClick={() => setAspectRatio(r)}
                                className={`py-2 rounded-xl font-mono text-xs font-bold transition-all active:scale-95 ${
                                  aspectRatio === r
                                    ? "bg-white text-black"
                                    : "bg-black/60 border border-white/10 text-zinc-400 hover:text-white"
                                }`}
                              >
                                {r}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-3.5 rounded-xl bg-black/60 border border-white/5 space-y-1.5 text-xs font-mono text-zinc-400">
                          <div>عدسة الكاميرا: <span className="text-white">Hasselblad X2D 100C • 85mm f/1.4</span></div>
                          <div>عمق المجال: <span className="text-white">Bokeh دقيق مع عزل خلفية سلس</span></div>
                          <div>معايرة الألوان: <span className="text-[#ff3b56]">KUBE Signature Neutral Cinema</span></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: 4K RENDER PREVIEW */}
                  {productStudioStep === 4 && (
                    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 flex flex-col md:flex-row items-center gap-8 justify-between">
                      <div className="relative aspect-[9/16] w-[260px] sm:w-[300px] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 shrink-0">
                        <img
                          src={selectedCoffeeProduct.img}
                          alt={selectedCoffeeProduct.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-[#ff3b56] border border-[#ff2a4b]/30">
                          {lightingDirection} • {lightingIntensity} • {aspectRatio}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-right">
                          <span className="text-xs font-bold text-white block">{selectedCoffeeProduct.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">سطح: {selectedSurface}</span>
                        </div>
                      </div>

                      <div className="space-y-5 text-right flex-1">
                        <div className="space-y-2">
                          <span className="text-xs font-mono uppercase text-[#ff3b56] font-bold">4K Studio Render</span>
                          <h4 className="text-2xl font-black text-white">المشهد جاهز للتصدير النهائي</h4>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            تم تجميع إعدادات الإضاءة 3D، فيزياء السطح، وانعكاسات الكوب بدقة تحاكي استوديوهات التصوير التجاري العالمية.
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                            <span className="text-zinc-500 block text-[10px]">المنتج</span>
                            <span className="text-white font-bold">{selectedCoffeeProduct.name}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                            <span className="text-zinc-500 block text-[10px]">السطح</span>
                            <span className="text-white font-bold">{selectedSurface}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                            <span className="text-zinc-500 block text-[10px]">الإضاءة</span>
                            <span className="text-[#ff3b56] font-bold">{lightingDirection} ({lightingIntensity})</span>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-900 border border-white/5">
                            <span className="text-zinc-500 block text-[10px]">المقاس</span>
                            <span className="text-white font-bold">{aspectRatio} UltraHD</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => toast.success("جاري تنزيل الصورة الأصلية بدقة 4K")}
                            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30 transition-all text-center"
                          >
                            تحميل صورة 4K الأصلية
                          </button>
                          <button
                            onClick={() => {
                              setActiveStudioModal("ads_9x");
                              setAdsProductTitle(selectedCoffeeProduct.name);
                              toast.info("تم نقل اللقطة إلى استديو الـ 9 إعلانات");
                            }}
                            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                          >
                            توليد 9 إعلانات منها
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* MODAL: UGC STUDIO WORKSPACE (4-Step Wizard)                    */}
              {/* ============================================================== */}
              {activeStudioModal === "ugc_studio" && (
                <div className="space-y-6 text-right">
                  {/* Step Navigation Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto scrollbar-none text-xs">
                      {[
                        { step: 1, label: "١. اختيار الشخصية", icon: Video },
                        { step: 2, label: "٢. اللهجة والمدة", icon: Volume2 },
                        { step: 3, label: "٣. صيغة الإعلان (15)", icon: Wand2 },
                        { step: 4, label: "٤. السكريبت والتوليد", icon: Sparkles },
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setUgcStep(s.step as any)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                            ugcStep === s.step
                              ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {ugcStep > 1 && (
                        <button
                          onClick={() => setUgcStep((u) => Math.max(1, u - 1) as any)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          السابق
                        </button>
                      )}
                      {ugcStep < 4 ? (
                        <button
                          onClick={() => setUgcStep((u) => Math.min(4, u + 1) as any)}
                          className="px-4 py-1.5 rounded-xl bg-[#ff2a4b] hover:bg-[#ff4d64] text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          الخطوة التالية
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toast.info("جاري تصيير فيديو UGC...");
                            setTimeout(() => toast.success("تم توليد فيديو UGC بنجاح!"), 800);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30"
                        >
                          توليد الفيديو فوراً
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STEP 1: CREATOR SELECTION */}
                  {ugcStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر شخصية صانع المحتوى السعودي (UGC Creator)</h4>
                        <p className="text-xs text-zinc-400">شخصيات افتراضية واقعية بملامح وأزياء سعودية مع تناغم شفاه وصوت أصلي</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                        {UGC_CREATORS.map((c, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveCreator(c);
                              toast.success(`تم اختيار: ${c.name}`);
                            }}
                            className={`rounded-2xl border p-3.5 flex flex-col justify-between cursor-pointer active:scale-95 transition-all ${
                              activeCreator.name === c.name
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="space-y-2.5">
                              <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-black relative">
                                <img src={c.thumb} alt={c.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-white">
                                  <span>{c.views} مشاهدة</span>
                                </div>
                              </div>
                              <div>
                                <h5 className="text-xs font-black text-white">{c.name}</h5>
                                <span className="text-[10px] text-zinc-400 block">{c.role}</span>
                              </div>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                              <span className="text-zinc-500 font-mono">{c.likes} إعجاب</span>
                              {activeCreator.name === c.name && (
                                <span className="text-[#ff3b56] font-bold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> مفعّل
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: DIALECT & DURATION */}
                  {ugcStep === 2 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-white">اللهجة والنبرة الصوتية</h4>
                          <p className="text-xs text-zinc-400">محرك الصوت مدرب على الأداء الإعلاني الطبيعي بدون نبرة روبوتية</p>
                        </div>

                        <div className="space-y-2">
                          {[
                            { id: "نجدية بيضاء", label: "لهجة نجدية بيضاء (الرياض)", desc: "سريعة، ذكية، نبرة قهوة مختصة وعفوية شبابية" },
                            { id: "حجازية عفوية", label: "لهجة حجازية عفوية", desc: "نغمة دافئة وحيوية تناسب المخبوزات والجمعات" },
                            { id: "شرقية دافئة", label: "لهجة شرقية هادئة", desc: "نبرة روقان وصباحيات رايقة" },
                            { id: "عامية سعودية", label: "عامية شبابية موحدة", desc: "أسلوب برق و STC المختصر والمباشر" },
                          ].map((d) => (
                            <button
                              key={d.id}
                              onClick={() => setSelectedDialect(d.id as any)}
                              className={`w-full p-3.5 rounded-xl text-right transition-all active:scale-[0.98] ${
                                selectedDialect === d.id
                                  ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                                  : "bg-black/60 border border-white/10 text-zinc-300 hover:text-white"
                              }`}
                            >
                              <span className="font-bold text-xs block">{d.label}</span>
                              <span className="text-[10px] opacity-80 block pt-0.5">{d.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-zinc-900/80 p-5 space-y-4">
                        <div className="space-y-1">
                          <h4 className="font-black text-base text-white">مدة الفيديو الإعلاني</h4>
                          <p className="text-xs text-zinc-400">المدة الأنسب للانتشار على تيك توك وسناب شات وريلز</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { sec: 15, title: "15 ثانية (سريع)", desc: "خطاف قوي + رشفة وتذوق + دعوة سريعة (الأعلى وصولاً)" },
                            { sec: 30, title: "30 ثانية (قصة)", desc: "سيناريو كامل: مشوار الدوام، زحمة الرياض، وانتعاش KUBE" },
                          ].map((dur) => (
                            <button
                              key={dur.sec}
                              onClick={() => setVideoDuration(dur.sec as any)}
                              className={`p-4 rounded-xl text-right transition-all active:scale-95 ${
                                videoDuration === dur.sec
                                  ? "bg-[#ff2a4b] text-white shadow-md shadow-[#ff2a4b]/30"
                                  : "bg-black/60 border border-white/10 text-zinc-300 hover:text-white"
                              }`}
                            >
                              <span className="font-black text-base block font-mono">{dur.sec}s</span>
                              <span className="text-xs font-bold block pt-1">{dur.title}</span>
                              <span className="text-[10px] opacity-80 block pt-1 leading-snug">{dur.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: UGC 15 FORMATS */}
                  {ugcStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر صيغة الـ UGC التسويقية (15 صيغة معتمدة)</h4>
                        <p className="text-xs text-zinc-400">قوالب تسويقية مثبتة الفاعلية لزيادة التحويل ومبيعات الكافيه</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {SAUDI_UGC_FORMATS.map((fmt) => (
                          <div
                            key={fmt.id}
                            onClick={() => {
                              setSelectedUgcFormat(fmt);
                              setUgcScriptOutput(
                                `🎬 سكريبت إعلاني لصيغة: ${fmt.nameAr}\nشخصية: ${activeCreator.name} | اللهجة: ${selectedDialect} | المدة: ${videoDuration}s\n\n[المشهد 1 - Hook 0-3s]:\n"${fmt.hookExample}"\n\n[المشهد 2 - التذوق وسكب القهوة 3-10s]:\nيقرب كوب كولد برو KUBE وتصوير ماكرو لحبات الثلج وتكاثف البرودة: "النغمات واضحة بدون مرارة، الحلاوة طبيعية تضبط راسك."\n\n[المشهد 3 - CTA 10-15s]:\n"تلقاهم في طريق تركي الأول، أو اطلب مسبق واستلم فوراً قبل زحمة الدوام!"`
                              );
                              toast.success(`تم اختيار صيغة: ${fmt.nameAr}`);
                            }}
                            className={`rounded-2xl border p-4 cursor-pointer active:scale-95 transition-all text-right space-y-1.5 ${
                              selectedUgcFormat.id === fmt.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-black text-white">{fmt.nameAr}</span>
                              <span className="text-[9px] font-mono text-[#ff3b56] bg-black/60 px-2 py-0.5 rounded-md">
                                {fmt.recommendedTime}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-300 leading-snug line-clamp-2">
                              {fmt.hookExample}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: SCRIPT & GENERATION */}
                  {ugcStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-black text-base text-white">السيناريو الإعلاني والتصيير</h4>
                          <p className="text-xs text-zinc-400">مراجعة نص الحوار وتوجيهات الكاميرا قبل التوليد</p>
                        </div>
                        <button
                          onClick={() => handleCopy(ugcScriptOutput || "", "السكريبت")}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5 text-[#ff3b56]" />
                          <span>نسخ السيناريو</span>
                        </button>
                      </div>

                      <div className="p-5 rounded-2xl bg-zinc-900 border border-white/10 space-y-3">
                        <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-zinc-200 leading-relaxed">
                          {ugcScriptOutput || `🎬 سكريبت إعلاني لصيغة: ${selectedUgcFormat.nameAr}\nشخصية: ${activeCreator.name} | اللهجة: ${selectedDialect}\n\n[المشهد 1 - Hook]:\n"${selectedUgcFormat.hookExample}"\n\n[المشهد 2 - التجربة والسكب]:\nيقرب كوب كولد برو KUBE بحبات الثلج وتكاثف البرودة: "النغمات صريحة، والروقان يبدأ من أول رشفة."\n\n[المشهد 3 - CTA]:\n"مر عليهم طريق تركي الأول أو اطلب من التطبيق!"`}
                        </pre>
                      </div>

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          onClick={() => {
                            toast.info("جاري تصيير فيديو UGC بصوت نقي متزامن...");
                            setTimeout(() => toast.success("تم التوليد بنجاح! جاهز للتنزيل والنشر."), 900);
                          }}
                          className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30 text-center"
                        >
                          توليد فيديو UGC فوراً
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* MODAL: ADS STUDIO 9x & 30+ CONCEPTS (4-Step Wizard)           */}
              {/* ============================================================== */}
              {activeStudioModal === "ads_9x" && (
                <div className="space-y-6 text-right">
                  {/* Step Navigation Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto scrollbar-none text-xs">
                      {[
                        { step: 1, label: "١. النمط البصري (30+)", icon: Sparkles },
                        { step: 2, label: "٢. تفاصيل الحملة", icon: Wand2 },
                        { step: 3, label: "٣. المقاس والأبعاد", icon: Maximize2 },
                        { step: 4, label: "٤. حزمة الـ 9 إعلانات", icon: Layers },
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setAdsStep(s.step as any)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                            adsStep === s.step
                              ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {adsStep > 1 && (
                        <button
                          onClick={() => setAdsStep((a) => Math.max(1, a - 1) as any)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          السابق
                        </button>
                      )}
                      {adsStep < 4 ? (
                        <button
                          onClick={() => setAdsStep((a) => Math.min(4, a + 1) as any)}
                          className="px-4 py-1.5 rounded-xl bg-[#ff2a4b] hover:bg-[#ff4d64] text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          الخطوة التالية
                        </button>
                      ) : (
                        <button
                          onClick={handleGenerate9Pack}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30"
                        >
                          توليد الـ 9 إعلانات
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STEP 1: 30+ CONCEPTS SELECTOR */}
                  {adsStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر النمط البصري الأساسي لحملتك (30+ نمط عالمي)</h4>
                        <p className="text-xs text-zinc-400">أنماط معتمدة في كبرى الحملات العالمية (Hero Splash, Macro Texture, Surreal Scale...)</p>
                      </div>

                      {/* Filters */}
                      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                        {[
                          { id: "all", label: "جميع الأنماط (30+)" },
                          { id: "product_ads", label: "منتجات وتجارة (10)" },
                          { id: "cinematic", label: "سينمائي ومغامرة (8)" },
                          { id: "luxury_lighting", label: "فخامة ونيون (7)" },
                          { id: "lifestyle", label: "شارع ولايف ستايل (5)" },
                        ].map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setAdSubtypeFilter(f.id as any)}
                            className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                              adSubtypeFilter === f.id
                                ? "bg-[#ff2a4b] text-white"
                                : "bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                        {KUBE_MARKETING_SUBTYPES.filter(
                          (st) => adSubtypeFilter === "all" || st.category === adSubtypeFilter
                        ).map((st) => (
                          <div
                            key={st.id}
                            onClick={() => {
                              setSelectedAdSubtype(st);
                              toast.success(`تم اختيار النمط: ${st.labelAr}`);
                            }}
                            className={`rounded-2xl border overflow-hidden cursor-pointer active:scale-95 transition-all flex flex-col justify-between ${
                              selectedAdSubtype.id === st.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/30"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="aspect-[4/5] w-full overflow-hidden relative">
                              <img src={st.thumbnail} alt={st.labelAr} className="w-full h-full object-cover" />
                              <span className="absolute top-2 right-2 text-base drop-shadow-md">{st.icon}</span>
                            </div>
                            <div className="p-2.5 text-right space-y-0.5 bg-zinc-950/80">
                              <span className="text-[10px] font-mono text-[#ff3b56] block truncate">{st.label}</span>
                              <span className="text-xs font-black text-white block truncate">{st.labelAr}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CAMPAIGN DETAILS */}
                  {adsStep === 2 && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <div>
                        <h4 className="font-black text-base text-white">تفاصيل الإعلان ورسالة الحملة</h4>
                        <p className="text-xs text-zinc-400">حدد اسم المنتج أو القهوة والخطاف التسويقي</p>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-300 block">اسم المنتج / القهوة:</label>
                          <input
                            type="text"
                            value={adsProductTitle}
                            onChange={(e) => setAdsProductTitle(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#ff2a4b]"
                            placeholder="مثال: كولد برو كيني مركز"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-300 block">العنوان التسويقي (Hook Headline):</label>
                          <input
                            type="text"
                            value={adsHookHeadline}
                            onChange={(e) => setAdsHookHeadline(e.target.value)}
                            className="w-full rounded-xl bg-zinc-900 border border-white/15 px-4 py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#ff2a4b]"
                            placeholder="مثال: إذا يومك ما بدأ بقهوة KUBE.. يومك ما بدأ!"
                          />
                        </div>

                        <div className="pt-2">
                          <span className="text-xs font-bold text-zinc-400 block pb-1.5">أو اختر خطافاً جاهزاً:</span>
                          <div className="flex flex-wrap gap-2">
                            {[
                              "طاقة الصباح اللي تستاهلها قبل زحمة خريص",
                              "حلاوة إثيوبية طبيعية بدون سكر زائد",
                              "الرشفة اللي تعيد ضبط مزاجك في الدوام",
                              "قهوة فنانة لمحبي الروقان والتفاصيل",
                            ].map((h, i) => (
                              <button
                                key={i}
                                onClick={() => setAdsHookHeadline(h)}
                                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs text-right active:scale-95"
                              >
                                {h}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: RATIOS */}
                  {adsStep === 3 && (
                    <div className="space-y-4 max-w-2xl mx-auto">
                      <div>
                        <h4 className="font-black text-base text-white">نسبة الأبعاد وتوزيع المنصات</h4>
                        <p className="text-xs text-zinc-400">سيتم توليد الحزمة بالمقاس الذي تحدده ليلائم المنصة الإعلانية</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { ratio: "9:16", title: "ستوري وسناب وتيك توك", desc: "1080x1920 عمودي كامل الشاشة", best: "الأعلى انتشاراً" },
                          { ratio: "1:1", title: "مربع إنستغرام والويب", desc: "1080x1080 مربع متوازن للمنشورات", best: "كلاسيكي" },
                          { ratio: "4:5", title: "تويتر وبوستات الموبايل", desc: "1080x1350 يستحوذ على شاشة الجوال", best: "عالي التفاعل" },
                          { ratio: "16:9", title: "شاشات عرض وأفقي", desc: "1920x1080 شاشات الفروع واليوتيوب", best: "سينمائي" },
                        ].map((r) => (
                          <button
                            key={r.ratio}
                            onClick={() => setAspectRatio(r.ratio as any)}
                            className={`p-4 rounded-2xl text-right transition-all active:scale-95 ${
                              aspectRatio === r.ratio
                                ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-lg shadow-[#ff2a4b]/30"
                                : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                            }`}
                          >
                            <span className="text-sm font-mono font-black block">{r.ratio}</span>
                            <span className="text-xs font-bold block pt-1">{r.title}</span>
                            <span className="text-[10px] opacity-80 block pt-1">{r.desc}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 4: 9-PACK GRID */}
                  {adsStep === 4 && (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <h4 className="font-black text-base text-white">حزمة الـ 9 إعلانات المكتملة (9-Pack)</h4>
                          <p className="text-xs text-zinc-400">
                            النمط المختار: <span className="text-[#ff3b56] font-bold">{selectedAdSubtype.labelAr}</span> • المنتج: <span className="text-white">{adsProductTitle}</span>
                          </p>
                        </div>
                        <button
                          onClick={handleGenerate9Pack}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-md shadow-[#ff2a4b]/30"
                        >
                          إعادة توليد الـ 9 زوايا
                        </button>
                      </div>

                      {generated9Pack && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                          {generated9Pack.map((item, idx) => (
                            <div
                              key={idx}
                              className="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-2.5 flex flex-col justify-between"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-white">{item.title}</span>
                                  <span className="text-[9px] font-mono text-[#ff3b56] bg-[#ff2a4b]/15 px-2 py-0.5 rounded-md">
                                    {item.tag}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono text-zinc-400 bg-black/60 p-2.5 rounded-xl border border-white/5 line-clamp-3 select-all">
                                  {item.prompt}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  onClick={() => handleCopy(item.prompt, item.title)}
                                  className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-[#ff2a4b] hover:text-white text-xs font-bold active:scale-95 transition-colors text-center"
                                >
                                  نسخ البرومبت
                                </button>
                                <button
                                  onClick={() => toast.success(`تم تحميل تصميم: ${item.title}`)}
                                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-zinc-300 font-bold active:scale-95"
                                  title="تحميل الإعلان"
                                >
                                  تحميل
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* MODAL: MIMIC MOTION STUDIO WORKSPACE (4-Step Wizard)          */}
              {/* ============================================================== */}
              {activeStudioModal === "mimic_motion" && (
                <div className="space-y-6 text-right">
                  {/* Step Navigation Tabs */}
                  <div className="flex items-center justify-between flex-wrap gap-2 pb-4 border-b border-white/10">
                    <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-zinc-900 border border-white/10 overflow-x-auto scroll-none text-xs">
                      {[
                        { step: 1, label: "١. حركة المرجع (Motion)", icon: Film },
                        { step: 2, label: "٢. المنتج المستهدف", icon: Coffee },
                        { step: 3, label: "٣. الشدة والدقة (FPS)", icon: SlidersHorizontal },
                        { step: 4, label: "٤. المعاينة الحية 60fps", icon: Play },
                      ].map((s) => (
                        <button
                          key={s.step}
                          onClick={() => setMimicStep(s.step as any)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap active:scale-95 transition-all ${
                            mimicStep === s.step
                              ? "bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white shadow-md shadow-[#ff2a4b]/30"
                              : "text-zinc-400 hover:text-white"
                          }`}
                        >
                          <s.icon className="w-3.5 h-3.5" />
                          <span>{s.label}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {mimicStep > 1 && (
                        <button
                          onClick={() => setMimicStep((m) => Math.max(1, m - 1) as any)}
                          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          السابق
                        </button>
                      )}
                      {mimicStep < 4 ? (
                        <button
                          onClick={() => setMimicStep((m) => Math.min(4, m + 1) as any)}
                          className="px-4 py-1.5 rounded-xl bg-[#ff2a4b] hover:bg-[#ff4d64] text-white font-bold text-xs active:scale-95 transition-all"
                        >
                          الخطوة التالية
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            toast.info("جاري محاكاة الحركة وريندر 60fps...");
                            setTimeout(() => toast.success("تم توليد مقطع الموشن بنجاح!"), 900);
                          }}
                          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30"
                        >
                          بدء محاكاة الموشن فوراً
                        </button>
                      )}
                    </div>
                  </div>

                  {/* STEP 1: SELECT MOTION PRESET */}
                  {mimicStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر مقطع الحركة المرجعي (Mimic Reference)</h4>
                        <p className="text-xs text-zinc-400">مقاطع حركية حقيقية سينمائية يتم نسخ مسار حركتها وتطبيقه على منتجك</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {MIMIC_MOTION_PRESETS.map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setSelectedMotion(m);
                              toast.success(`تم اختيار: ${m.name}`);
                            }}
                            className={`rounded-2xl border p-3 flex flex-col justify-between cursor-pointer active:scale-95 transition-all ${
                              selectedMotion.id === m.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="aspect-[9/14] w-full rounded-xl overflow-hidden bg-black relative">
                                <img src={m.thumb} alt={m.name} className="w-full h-full object-cover" />
                                <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-black/70 backdrop-blur-md px-2 py-0.5 text-[9px] font-mono text-[#ff3b56]">
                                  <span>{m.fps}</span>
                                </div>
                                <div className="absolute bottom-2 left-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-mono text-white">
                                  {m.duration}
                                </div>
                              </div>
                              <h5 className="text-xs font-black text-white">{m.name}</h5>
                              <p className="text-[10px] text-zinc-400 line-clamp-2 leading-relaxed">{m.desc}</p>
                            </div>
                            <div className="pt-2 mt-2 border-t border-white/5 flex items-center justify-end">
                              {selectedMotion.id === m.id ? (
                                <span className="text-[10px] font-bold text-[#ff3b56] flex items-center gap-1">
                                  <Check className="w-3 h-3" /> مفعّل
                                </span>
                              ) : (
                                <span className="text-[10px] text-zinc-500">انقر للتحديد</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 2: SELECT TARGET PRODUCT */}
                  {mimicStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">اختر المنتج أو المشروب المطلوب تحريكه</h4>
                        <p className="text-xs text-zinc-400">سيتم تطبيق مسار حركة السكب أو المشية على هذا المنتج بدقة</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {KUBE_COFFEE_CATALOG.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              setSelectedCoffeeProduct(item);
                              toast.success(`تم اختيار: ${item.name}`);
                            }}
                            className={`rounded-2xl border p-3 flex flex-col justify-between cursor-pointer active:scale-95 transition-all ${
                              selectedCoffeeProduct.id === item.id
                                ? "border-[#ff2a4b] bg-[#ff2a4b]/10 shadow-lg shadow-[#ff2a4b]/20"
                                : "border-white/10 bg-zinc-900/60 hover:border-white/25"
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-black">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="text-[10px] font-mono text-[#ff3b56] block">{item.category}</span>
                              <h5 className="text-xs font-black text-white">{item.name}</h5>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: STRENGTH & FPS */}
                  {mimicStep === 3 && (
                    <div className="max-w-2xl mx-auto space-y-4">
                      <div>
                        <h4 className="font-black text-base text-white">إعدادات محاكاة الحركة</h4>
                        <p className="text-xs text-zinc-400">تحكم بقوة مطابقة الحركة مع الفيديو المرجعي وسرعة الإطارات</p>
                      </div>

                      <div className="space-y-3">
                        <label className="text-xs font-bold text-zinc-300 block">قوة الالتزام بحركة المرجع:</label>
                        <div className="grid grid-cols-3 gap-2.5">
                          {[
                            { id: "subtle", label: "هادئة (Subtle)", desc: "حركة بطيئة ناعمة تبرز تفاصيل القهوة" },
                            { id: "balanced", label: "متوازنة (Balanced)", desc: "مطابقة واقعية وطبيعية 1:1" },
                            { id: "dynamic", label: "ديناميكية (Dynamic)", desc: "حركة سريعة ومثيرة وتطاير قطرات" },
                          ].map((st) => (
                            <button
                              key={st.id}
                              onClick={() => setMotionStrength(st.id as any)}
                              className={`p-3.5 rounded-xl text-right transition-all active:scale-95 ${
                                motionStrength === st.id
                                  ? "bg-[#ff2a4b] text-white shadow-md shadow-[#ff2a4b]/30"
                                  : "bg-zinc-900 border border-white/10 text-zinc-300 hover:text-white"
                              }`}
                            >
                              <span className="font-black text-xs block">{st.label}</span>
                              <span className="text-[10px] opacity-80 block pt-1 leading-snug">{st.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: LIVE PREVIEW & EXPORT */}
                  {mimicStep === 4 && (
                    <div className="rounded-3xl border border-white/10 bg-zinc-950 p-6 flex flex-col md:flex-row items-center gap-8 justify-between">
                      <div className="relative aspect-[9/16] w-[240px] sm:w-[280px] rounded-3xl overflow-hidden shadow-2xl bg-black border border-white/10 shrink-0">
                        <img src={selectedMotion.thumb} alt={selectedMotion.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-white">
                          <span className="w-2 h-2 rounded-full bg-[#ff2a4b] animate-ping" />
                          <span>60fps Ready</span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-black/70 backdrop-blur-md border border-white/10 text-right">
                          <span className="text-xs font-bold text-white block">{selectedMotion.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">الهدف: {selectedCoffeeProduct.name}</span>
                        </div>
                      </div>

                      <div className="space-y-4 text-right flex-1">
                        <div className="space-y-1.5">
                          <span className="text-xs font-mono uppercase text-[#ff3b56] font-bold">Mimic Motion Cinema</span>
                          <h4 className="text-2xl font-black text-white">محاكاة الحركة جاهزة للريندر</h4>
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            سيتم دمج حركة ({selectedMotion.name}) مع الكوب ({selectedCoffeeProduct.name}) بدون أي تشوه أو ذوبان بفضل تقنية Optical Flow المتطورة.
                          </p>
                        </div>

                        <div className="flex items-center gap-3 pt-3">
                          <button
                            onClick={() => {
                              toast.info("جاري تصدير المقطع السينمائي...");
                              setTimeout(() => toast.success("تم تحميل مقطع الفيديو بجودة 4K 60fps!"), 800);
                            }}
                            className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30 text-center"
                          >
                            تصدير فيديو الموشن (4K 60fps)
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================== */}
              {/* MODAL: STORYBOARD STUDIO WORKSPACE (Multi-Scene Sequence)     */}
              {/* ============================================================== */}
              {activeStudioModal === "storyboard_studio" && (
                <div className="space-y-6 text-right">
                  <div className="flex items-center justify-between pb-4 border-b border-white/10">
                    <div>
                      <h4 className="font-black text-base text-white">استديو الستوري بورد (Storyboard) — إخراج إعلاني من ٤ مشاهد</h4>
                      <p className="text-xs text-zinc-400">تسلسل إعلاني سينمائي متكامل مبني على هيكل التحويل السريع (Hook &rarr; Need &rarr; Craft &rarr; CTA)</p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedScript, null, 2), "السيناريو")}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all"
                    >
                      نسخ تفاصيل الإخراج
                    </button>
                  </div>

                  {/* 4 Sequential Scenes Breakdown */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      {
                        sceneNum: 1,
                        time: "0:00 - 0:03",
                        title: "الخطاف البصري (The Hook)",
                        desc: "صوت كسر مكعبات ثلج مع سكب سريع لكولد برو KUBE وكاميرا مقربة جداً تجذب الانتباه خلال ثانيتين.",
                        camera: "Macro Lens 100mm • 120fps Slow-mo",
                        audio: 'صوت مكعبات الثلج: "إذا يومك ما بدأ صح.."',
                        thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720",
                      },
                      {
                        sceneNum: 2,
                        time: "0:03 - 0:10",
                        title: "المشكلة والاحتياج (The Need)",
                        desc: "شخصية سعودية شابة تفتح اللابتوب في زحمة الرياض الصباحية وتبحث عن التركيز والروقان الحقيقي.",
                        camera: "Over-the-shoulder POV • Warm morning light",
                        audio: '"...لا تضيع وقتك بتجارب عادية."',
                        thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/40dba6a71d8013595711298206cc8d48/thumbnails/thumbnail.jpg?height=720",
                      },
                      {
                        sceneNum: 3,
                        time: "0:10 - 0:22",
                        title: "إتقان القهوة والتذوق (The Craft)",
                        desc: "الباريستا يسكب الفلات وايت مع رسمة تيوليب وانسياب الحليب المخملي، يليه رشفة التذوق الأولى والابتسامة.",
                        camera: "360 Turntable Orbit • Studio Soft Light",
                        audio: '"نغمات إثيوبية صريحة.. حلاوة بدون أي سكر زائد."',
                        thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/8bffdce9c36d3de8fa8ceb0d88c4e175/thumbnails/thumbnail.jpg?height=720",
                      },
                      {
                        sceneNum: 4,
                        time: "0:22 - 0:30",
                        title: "الدعوة للطلب (The CTA)",
                        desc: "ظهور شعار KUBE الأحمر الفخم مع كود خصم التطبيق وخريطة الفرع على طريق تركي الأول بالرياض.",
                        camera: "Motion Graphic Packshot • Clean Branding",
                        audio: '"مر عليهم اليوم أو اطلب من التطبيق وخل مزاجك يسبقك."',
                        thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/1b1d49197e516bea184765e12e8bcd14/thumbnails/thumbnail.jpg?height=720",
                      },
                    ].map((s) => (
                      <div
                        key={s.sceneNum}
                        className="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black relative">
                            <img src={s.thumb} alt={s.title} className="w-full h-full object-cover" />
                            <span className="absolute top-2 right-2 text-[10px] font-mono font-bold bg-[#ff2a4b] text-white px-2 py-0.5 rounded-full">
                              مشهد {s.sceneNum}
                            </span>
                            <span className="absolute bottom-2 left-2 text-[9px] font-mono bg-black/70 text-zinc-300 px-2 py-0.5 rounded-full">
                              {s.time}
                            </span>
                          </div>

                          <h5 className="text-xs font-black text-white">{s.title}</h5>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{s.desc}</p>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-white/5 text-[10px] font-mono">
                          <div className="text-zinc-500">
                            الكاميرا: <span className="text-zinc-300">{s.camera}</span>
                          </div>
                          <div className="text-zinc-500">
                            الصوت: <span className="text-[#ff3b56]">{s.audio}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">تصدير الستوري بورد كفيديو متسلسل</span>
                      <span className="text-[11px] text-zinc-400 block">سيقوم محرك KUBE بربط المشاهد الأربعة بنقلات سينمائية ناعمة Seamless Transitions</span>
                    </div>
                    <button
                      onClick={() => {
                        toast.info("جاري تصيير الستوري بورد كفيلم إعلاني 30 ثانية...");
                        setTimeout(() => toast.success("تم إتمام ريندر الفيديو الإعلاني كاملاً!"), 1000);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-md shadow-[#ff2a4b]/30"
                    >
                      توليد الفيلم الإعلاني كاملاً (30s)
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL: MODELS API CATALOG */}
              {activeStudioModal === "models_api" && (
                <div className="space-y-6 text-right">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                    <div>
                      <h3 className="font-black text-base text-white">وثائق الـ API ونماذج التوليد العالمية</h3>
                      <p className="text-xs text-zinc-400">
                        النموذج المحدد: <span className="text-[#ff3b56]">{selectedModelForApi.nameAr}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedModelForApi.samplePayload, null, 2), "الـ Payload")}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs shadow-md shadow-[#ff2a4b]/30 active:scale-95"
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
                          الـ Endpoint المقترح: <span className="text-[#ff3b56]">{selectedModelForApi.apiEndpoint}</span>
                        </div>
                        <div>
                          أقصى دقة: <span className="text-white">{selectedModelForApi.maxResolution}</span>
                        </div>
                        <div>
                          أقصى مدة: <span className="text-white">{selectedModelForApi.maxDuration}</span>
                        </div>
                        <div>
                          الصوت الأصلي:{" "}
                          <span className={selectedModelForApi.nativeAudio ? "text-[#ff3b56]" : "text-zinc-500"}>
                            {selectedModelForApi.nativeAudio ? "مدعوم بنقاء استوديو" : "غير مدمج"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-white">عينة كود الربط البرمجي (Payload):</h4>
                      <pre className="p-4 rounded-2xl bg-black border border-white/10 text-[11px] font-mono text-[#ff3b56] overflow-x-auto">
                        {JSON.stringify(selectedModelForApi.samplePayload, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: MCP & SKILLS HUB (Matching IMG_0100) */}
              {activeStudioModal === "mcp_hub" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-mono">
                      <span>OPEN CLIENT إبداعي</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-white">BETA</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      اربط KUBE AI مع أي وكيل ذكاء اصطناعي أو بيئة تطوير بأمر واحد
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-xl leading-relaxed">
                      بروتوكول Model Context Protocol يتيح لك استدعاء استوديوهات KUBE لتوليد الفيديو والصور والإعلانات من Cursor و Claude Desktop و LangChain مباشرة.
                    </p>
                  </div>

                  {/* Terminal Command Box */}
                  <div className="p-4 rounded-2xl bg-black border border-white/15 space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span>Terminal / CLI Command</span>
                      <button
                        onClick={() => handleCopy("npx skills-ai add kube-marketing", "أمر التثبيت")}
                        className="flex items-center gap-1 text-[#00e575] hover:underline"
                      >
                        <Copy className="w-3.5 h-3.5" /> نسخ
                      </button>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 text-[#00e575] border border-white/5 select-all">
                      npx skills-ai add kube-marketing
                    </div>
                  </div>

                  {/* Supported Integrations Grid */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white block">العملاء والبيئات المدعومة رسمياً:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      {[
                        { name: "Claude Desktop", desc: "أداة توليد وسائط باللغة الطبيعية" },
                        { name: "Cursor & Windsurf", desc: "استدعاء التوليد داخل بيئة الكود" },
                        { name: "LangChain & Flowise", desc: "سير عمل مؤتمت للحملات" },
                        { name: "سلة وزد كاشير", desc: "توليد صور المنتجات من الكتالوج" },
                      ].map((item, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-zinc-900 border border-white/10 space-y-1">
                          <span className="font-black text-white block">{item.name}</span>
                          <span className="text-[10px] text-zinc-400 block leading-tight">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: CONNECTORS HUB (الموصلات) */}
              {activeStudioModal === "connectors_hub" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10">
                    <h3 className="text-lg font-black text-white">الموصلات وتكاملات القنوات (Connectors)</h3>
                    <p className="text-xs text-zinc-400">اربط قنوات النشر والتجارة لتصدير الإعلانات والمحتوى آلياً</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                    {[
                      { name: "متجر سلة (Salla)", desc: "مزامنة المنتجات وتوليد خلفيات 3D لمتجر القهوة", status: "متصل" },
                      { name: "متجر زد (Zid)", desc: "تحديث صور الكتالوج وإعلانات 9x في متجر KUBE", status: "متصل" },
                      { name: "تيك توك للأعمال (TikTok Ads)", desc: "نشر فيديوهات الـ UGC مباشرة في الحملات", status: "جاهز للربط" },
                      { name: "سناب شات (Snapchat Ads)", desc: "تصدير فلاتر وإعلانات 9:16 العمودية", status: "جاهز للربط" },
                      { name: "سلاك (Slack Notifications)", desc: "إرسال مسودات الإعلانات لاعتمادها من فريق التسويق", status: "متصل" },
                      { name: "قوقل درايف (Google Drive)", desc: "حفظ ريندرات 4K الأصلية في مجلد الكافيه", status: "متصل" },
                    ].map((conn, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{conn.name}</span>
                            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-[#00e575]">
                              {conn.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{conn.desc}</p>
                        </div>
                        <button
                          onClick={() => toast.success(`تم تحديث موصل: ${conn.name}`)}
                          className="w-full py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 text-xs font-bold active:scale-95 transition-all text-center"
                        >
                          إعدادات الموصّل
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL: COMMUNITY (المجتمع) */}
              {activeStudioModal === "community" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">مجتمع إبداع KUBE</h3>
                      <p className="text-xs text-zinc-400">أحدث الإعلانات والبرومبتات الملهمة المطروحة من فريق التسويق</p>
                    </div>
                    <button
                      onClick={() => toast.info("شارك إعلانك المولد مع طاقم KUBE")}
                      className="px-4 py-2 rounded-xl bg-[#00e575] text-black font-black text-xs active:scale-95"
                    >
                      مشاركة إعلان +
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                    {[
                      { title: "كولد برو بالنيون", author: "سارة النمر", likes: 89, thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/68f99df1e137fb4eccb09a8fd2c8dd10/thumbnails/thumbnail.jpg?height=720" },
                      { title: "فلات وايت صباحي", author: "فيصل العتيبي", likes: 142, thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720" },
                      { title: "كرواسون لوز فاخر", author: "نوف السديري", likes: 64, thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720" },
                      { title: "حزمة أكياس المحاصيل", author: "عبدالله الشمري", likes: 110, thumb: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=720" },
                    ].map((c, i) => (
                      <div key={i} className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-lg">
                        <img src={c.thumb} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        <div className="absolute bottom-2 inset-x-2 space-y-1 text-right">
                          <span className="text-xs font-bold text-white block truncate">{c.title}</span>
                          <div className="flex items-center justify-between text-[10px] text-zinc-400">
                            <span>{c.author}</span>
                            <span className="text-[#00e575]">♥ {c.likes}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL: TUTORIALS (الشروحات) */}
              {activeStudioModal === "tutorials" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10">
                    <h3 className="text-lg font-black text-white">أكاديمية وشروحات KUBE AI</h3>
                    <p className="text-xs text-zinc-400">دروس سريعة ترفع جودة إعلاناتك من لقطة عادية إلى ريندر تجاري عالمي</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { title: "كيف تنشئ إعلان 30 ثانية لقهوتك", dur: "3 دقائق", desc: "خطوة بخطوة من كتابة فكرة المشهد حتى تصدير الفيديو بالصوت النقي" },
                      { title: "أسرار محاكاة الحركة في Mimic Motion", dur: "4 دقائق", desc: "كيف تنسخ سكب القهوة وحركات الأيدي بدون أي تشوه بصري" },
                      { title: "توجيه إضاءة الاستوديو ثلاثية الأبعاد", dur: "5 دقائق", desc: "محاكاة الـ Softbox والـ Rim Light مع أسطح الرخام الأسود" },
                    ].map((tut, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-900 border border-white/10 space-y-3 flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="aspect-video w-full rounded-xl bg-black flex items-center justify-center text-zinc-500">
                            <Play className="w-8 h-8 text-[#00e575]" />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{tut.title}</span>
                            <span className="text-[10px] font-mono text-zinc-400">{tut.dur}</span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed">{tut.desc}</p>
                        </div>
                        <button
                          onClick={() => toast.info("جاري تشغيل الشرح التعليمي...")}
                          className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold active:scale-95"
                        >
                          مشاهدة الشرح ▶
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODAL: PRICING PLANS (الباقات - نسختك المؤسسية غير المحدودة) */}
              {activeStudioModal === "pricing_plans" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10 text-center space-y-1">
                    <span className="text-xs font-mono text-[#00e575] font-bold">وصول مؤسسي غير محدود</span>
                    <h3 className="text-xl sm:text-2xl font-black text-white">باقات واستخدام استوديو KUBE AI</h3>
                    <p className="text-xs text-zinc-400">حسابك مفعّل على الخطة المؤسسية الخاصة بكافة منسوبي كافيه ومطبخ KUBE</p>
                  </div>

                  <div className="max-w-md mx-auto p-6 rounded-3xl bg-zinc-900 border-2 border-[#00e575]/40 space-y-5 shadow-2xl relative">
                    <span className="absolute -top-3 right-6 px-3 py-1 rounded-full text-[10px] font-black bg-[#00e575] text-black shadow-md">
                      الخطة المفعلة حالياً
                    </span>

                    <div className="space-y-1">
                      <span className="text-lg font-black text-white block">باقة المؤسسة (Enterprise Staff)</span>
                      <span className="text-xs text-zinc-400 block">وصول داخلي شامل لكافة الاستوديوهات والنماذج</span>
                    </div>

                    <div className="space-y-2.5 text-xs text-zinc-300">
                      {[
                        "توليد غير محدود لصور المنتجات بدقة 4K",
                        "إنشاء مقاطع UGC مع شخصيات سعودية واقعية",
                        "محاكاة الحركة السينمائية Mimic 60fps",
                        "استوديو الإعلانات 9x والـ 30 نمط بصري",
                        "ربط بروتوكول MCP مع كاشير سلة وزد",
                        "تصدير تجاري بدون أي علامات مائية أو حدود نقاط",
                      ].map((feat, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-[#00e575] shrink-0" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-center text-xs font-mono text-[#00e575]">
                      الحالة: نشط ومفعّل بالكامل لـ زياد عيسى
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: CHARACTER CREATOR (استوديو الشخصيات) */}
              {activeStudioModal === "character_creator" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10">
                    <h3 className="text-lg font-black text-white">صمّم شخصيتك الإعلانية الافتراضية</h3>
                    <p className="text-xs text-zinc-400">اجعل الوجه نفسه بطل كل حملات وفيديوهات كافيه KUBE القادمة</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white block">اسم الشخصية:</label>
                        <input
                          type="text"
                          defaultValue="سفير KUBE الجديد"
                          className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-white block">الزي والمظهر:</label>
                        <select className="w-full rounded-xl bg-zinc-900 border border-white/10 px-3 py-2 text-xs text-white">
                          <option>ثوب سعودي عصري وشماغ أنيق</option>
                          <option>عباية وبشت مطرز فاخر</option>
                          <option>كاجوال شبابي وهودي KUBE أسود</option>
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          toast.success("تم تثبيت ملامح الشخصية بنجاح ونقلها للاستوديو!");
                          setActiveStudioModal("ugc_studio");
                        }}
                        className="w-full py-3 rounded-xl bg-[#00e575] text-black font-black text-xs active:scale-95"
                      >
                        حفظ واستخدام الشخصية
                      </button>
                    </div>

                    <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center relative">
                      <img
                        src="https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/sultan.png"
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/75 text-[10px] text-white font-mono">
                        معاينة الملامح الثابتة
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* MODAL: SHOTS STUDIO (لقطات) */}
              {activeStudioModal === "shots_studio" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10">
                    <h3 className="text-lg font-black text-white">لقطات سريعة (Instant Shots)</h3>
                    <p className="text-xs text-zinc-400">توليد لقطة إعلانية واحدة لمنتجك بنقرة واحدة بدون خطوات إضافية</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {KUBE_COFFEE_CATALOG.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          toast.success(`تم توليد لقطة سريعة لـ: ${c.name}`);
                          setLightboxItem({
                            isOpen: true,
                            imgUrl: c.img,
                            title: `لقطة: ${c.name}`,
                            prompt: `Instant macro hero shot of ${c.name} in KUBE cafe with cinematic rim light`,
                            aspectRatio: "1:1",
                            specs: "Instant 4K Shot",
                          });
                        }}
                        className="p-3 rounded-2xl bg-zinc-900 border border-white/10 hover:border-[#00e575] cursor-pointer active:scale-95 transition-all text-center space-y-2"
                      >
                        <div className="aspect-square rounded-xl overflow-hidden bg-black">
                          <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-bold text-white block truncate">{c.name}</span>
                        <span className="text-[10px] text-[#00e575] block font-mono">التقاط فوري ✦</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 17.5. NEW AD BOTTOM SHEET MODAL (Matching IMG_0105)            */}
      {/* ============================================================== */}
      {isNewAdModalOpen && (
        <div
          onClick={() => setIsNewAdModalOpen(false)}
          className="fixed inset-0 z-[10020] bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200 select-none touch-manipulation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full sm:max-w-lg rounded-t-[32px] sm:rounded-[32px] bg-[#141416] border-t sm:border border-white/15 p-5 space-y-4 text-right shadow-2xl animate-in slide-in-from-bottom duration-300 select-text"
          >
            {/* iOS Top Drag Indicator */}
            <div className="w-10 h-1 rounded-full bg-zinc-600 mx-auto -mt-1 mb-2" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setIsNewAdModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-base font-black text-white">إعلان جديد</h3>
            </div>

            {/* Segmented Switcher: فيديو / صورة */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs w-full justify-center">
              <button
                type="button"
                onClick={() => setHeroMode("video")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all font-bold ${
                  heroMode === "video" ? "bg-zinc-800 text-white" : "text-zinc-400"
                }`}
              >
                <Video className="w-3.5 h-3.5 text-[#00e575]" />
                <span>فيديو</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("image")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all font-bold ${
                  heroMode === "image" ? "bg-zinc-800 text-white" : "text-zinc-400"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>صورة</span>
              </button>
            </div>

            {/* 3 Upload / Select Slots */}
            <div className="grid grid-cols-3 gap-2.5">
              <div
                onClick={() => {
                  setHeroProduct(KUBE_COFFEE_CATALOG[0]);
                  toast.success("تم اختيار المنتج: كولد برو كيني");
                }}
                className="aspect-square rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-[#00e575] p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative"
              >
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                  +
                </div>
                <Coffee className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-300">المنتج</span>
              </div>

              <div
                onClick={() => {
                  setHeroPersona(UGC_CREATORS[0]);
                  toast.success("تم اختيار الشخصية: سلطان");
                }}
                className="aspect-square rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-[#00e575] p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative"
              >
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                  +
                </div>
                <Users className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-300">الشخصية</span>
              </div>

              <div
                onClick={() => {
                  setHeroScene("بار القهوة المختصة");
                  toast.success("تم اختيار المشهد: بار القهوة");
                }}
                className="aspect-square rounded-2xl bg-zinc-900/80 border border-white/10 hover:border-[#00e575] p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative"
              >
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                  +
                </div>
                <ImageIcon className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-300">المشهد</span>
              </div>
            </div>

            {/* Prompt Textarea */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10">
              <textarea
                rows={3}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="صف الإعلان الذي تريد إنشاءه..."
                className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center truncate font-bold text-zinc-300">
                اختر نوعًا
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-300">
                9:16
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-300">
                1080p
              </div>
              <div className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-300">
                10ث
              </div>
            </div>

            {/* Helper text */}
            <div className="text-center text-[11px] text-zinc-400">
              اختر نوع الإعلان لتبدأ
            </div>

            {/* Action button */}
            <button
              type="button"
              onClick={() => {
                setIsNewAdModalOpen(false);
                toast.info("جاري توجيه طلب إنشاء الإعلان للريندر...");
                setTimeout(() => {
                  const newAd = {
                    id: `ad-${Date.now()}`,
                    title: `إعلان كافيه KUBE مخصص`,
                    type: heroMode,
                    thumb: KUBE_COFFEE_CATALOG[0].img,
                    createdAt: "الآن",
                    status: "ready" as const,
                    aspect: "9:16",
                    prompt: heroPrompt || "Custom commercial ad",
                  };
                  setUserAds((prev) => [newAd, ...prev]);
                  toast.success("تم إتمام الإنشاء وإضافته لقسم إعلاناتي!");
                }, 1000);
              }}
              className="w-full py-3 rounded-2xl bg-zinc-800 hover:bg-[#00e575] hover:text-black text-zinc-300 font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>إنشاء</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 18. CUSTOM RIGHT-CLICK CONTEXT MENU (كليك يمين احترافي)        */}
      {/* ============================================================== */}
      {contextMenu && contextMenu.visible && (
        <div
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-[10050] w-64 rounded-2xl bg-zinc-950/95 border border-white/15 p-2 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-150 select-none text-right font-sans"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-2 border-b border-white/10 mb-1">
            <span className="text-[10px] font-mono text-[#ff3b56] block truncate">
              KUBE AI Studio Actions
            </span>
            <span className="text-xs font-black text-white block truncate">
              {contextMenu.title}
            </span>
          </div>

          <div className="space-y-0.5 text-xs">
            <button
              onClick={() => {
                setActiveStudioModal("product_3d");
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-[#ff2a4b]" />
                <span>فتح في استوديو 3D</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">3</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioModal("ads_9x");
                setAdsProductTitle(contextMenu.title);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#ff3b56]" />
                <span>توليد 9 إعلانات للقطة</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">9</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioModal("mimic_motion");
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-blue-400" />
                <span>محاكاة حركة سينمائية (Mimic)</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">M</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioModal("storyboard_studio");
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Video className="w-3.5 h-3.5 text-amber-400" />
                <span>إنشاء ستوري بورد 4 مشاهد</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">S</span>
            </button>

            <button
              onClick={() => {
                setActiveStudioModal("super_agent");
                handleSendAgent(`اريد حملة إعلانية كاملة لـ: ${contextMenu.title}`);
                setContextMenu(null);
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-green-400" />
                <span>محادثة في سوبر إيجنت</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">Space</span>
            </button>

            {contextMenu.prompt && (
              <button
                onClick={() => {
                  handleCopy(contextMenu.prompt!, contextMenu.title);
                  setContextMenu(null);
                }}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>نسخ البرومبت</span>
                </span>
                <span className="text-[10px] font-mono text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">C</span>
              </button>
            )}

            <button
              onClick={() => setContextMenu(null)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-zinc-500 hover:text-zinc-300 hover:bg-white/5 active:scale-95 transition-all pt-1 border-t border-white/5"
            >
              <span className="flex items-center gap-2">
                <X className="w-3 h-3" />
                <span>إلغاء</span>
              </span>
              <span className="text-[10px] font-mono text-zinc-500">Esc</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 19. MOBILE BOTTOM DOCK (شريط الإجراءات السريعة للجوال)          */}
      {/* ============================================================== */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-[9990] bg-black/90 backdrop-blur-2xl border-t border-white/10 px-2 py-2 flex items-center justify-around text-[10px] font-bold shadow-2xl safe-area-bottom">
        <button
          onClick={() => setActiveStudioModal("super_agent")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all active:scale-90 ${
            activeStudioModal === "super_agent" ? "text-[#ff2a4b]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Bot className="w-5 h-5" />
          <span>إيجنت</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("product_3d")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all active:scale-90 ${
            activeStudioModal === "product_3d" ? "text-[#ff2a4b]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>3D ستوديو</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("mimic_motion")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all active:scale-90 ${
            activeStudioModal === "mimic_motion" ? "text-[#ff2a4b]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Film className="w-5 h-5" />
          <span>موشن</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("ads_9x")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all active:scale-90 ${
            activeStudioModal === "ads_9x" ? "text-[#ff2a4b]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span>9 إعلانات</span>
        </button>

        <button
          onClick={() => setActiveStudioModal("ugc_studio")}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all active:scale-90 ${
            activeStudioModal === "ugc_studio" ? "text-[#ff2a4b]" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Video className="w-5 h-5" />
          <span>شخصيات</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 20. LIGHTBOX FULLSCREEN IMAGE VIEWER MODAL                     */}
      {/* ============================================================== */}
      {lightboxItem && lightboxItem.isOpen && (
        <div
          onClick={() => setLightboxItem(null)}
          className="fixed inset-0 z-[10060] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-3 sm:p-6 animate-in fade-in zoom-in-95 duration-200 select-none touch-manipulation"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[92vh] rounded-3xl bg-zinc-950 border border-white/15 overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/75 hover:bg-white/20 text-white flex items-center justify-center backdrop-blur-md active:scale-95 transition-all border border-white/10"
              title="إغلاق المعاينة"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image Preview Stage with animate-develop */}
            <div className="flex-1 bg-black flex items-center justify-center p-4 relative min-h-[300px] sm:min-h-[480px]">
              <img
                src={lightboxItem.imgUrl}
                alt={lightboxItem.title}
                className="max-h-[80vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl animate-develop"
              />
              <span className="absolute bottom-4 right-4 text-[10px] font-mono text-[#ff3b56] bg-black/85 backdrop-blur-md px-3 py-1 rounded-full border border-[#ff2a4b]/40 shadow-lg">
                4K Cinema Master • 8K Texture
              </span>
            </div>

            {/* Sidebar Inspector Details */}
            <div className="w-full md:w-84 p-5 md:p-6 space-y-4 text-right bg-zinc-900/95 border-t md:border-t-0 md:border-r border-white/10 flex flex-col justify-between shrink-0">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-[#ff3b56] uppercase tracking-wider block font-bold">
                    KUBE AI STUDIO 2.0
                  </span>
                  <span className="text-[9px] font-mono bg-white/10 text-zinc-300 px-2 py-0.5 rounded-full">
                    {lightboxItem.aspectRatio || "9:16"}
                  </span>
                </div>

                <h4 className="text-base sm:text-lg font-black text-white">{lightboxItem.title}</h4>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-zinc-500 block text-[9px]">العدسة</span>
                    <span className="text-white">85mm f/1.4</span>
                  </div>
                  <div className="p-2 rounded-xl bg-black/60 border border-white/5">
                    <span className="text-zinc-500 block text-[9px]">الإضاءة</span>
                    <span className="text-[#ff3b56]">Studio 3D Key</span>
                  </div>
                </div>

                {lightboxItem.prompt && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-zinc-400">البرومبت الإخراجي:</span>
                      <button
                        onClick={() => handleCopy(lightboxItem.prompt!, lightboxItem.title)}
                        className="text-[10px] text-[#ff3b56] hover:underline flex items-center gap-1 font-mono"
                      >
                        <Copy className="w-3 h-3" /> نسخ
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-zinc-300 bg-black/70 p-3 rounded-xl border border-white/5 line-clamp-5 select-all leading-relaxed">
                      {lightboxItem.prompt}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="space-y-2 pt-3 border-t border-white/10">
                <button
                  onClick={() => toast.success(`تم بدء تحميل الصورة بدقة 4K: ${lightboxItem.title}`)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-lg shadow-[#ff2a4b]/30 transition-all text-center"
                >
                  تحميل بدقة 4K كاملة
                </button>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    onClick={() => {
                      setActiveStudioModal("mimic_motion");
                      setLightboxItem(null);
                      toast.info("تم نقل اللقطة إلى استديو محاكاة الحركة");
                    }}
                    className="py-2 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold text-center active:scale-95 transition-all truncate"
                    title="تحريك بالذكاء الاصطناعي"
                  >
                    🎬 موشن
                  </button>

                  <button
                    onClick={() => {
                      setActiveStudioModal("ads_9x");
                      setAdsProductTitle(lightboxItem.title);
                      setLightboxItem(null);
                      toast.info("تم نقل اللقطة إلى استديو الـ 9 إعلانات");
                    }}
                    className="py-2 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold text-center active:scale-95 transition-all truncate"
                    title="توليد 9 زوايا إعلانية"
                  >
                    ✨ 9 زوايا
                  </button>

                  <button
                    onClick={() => {
                      setActiveStudioModal("product_3d");
                      setLightboxItem(null);
                      toast.info("تم نقل اللقطة إلى استديو 3D كمرجع");
                    }}
                    className="py-2 px-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 text-[10px] font-bold text-center active:scale-95 transition-all truncate"
                    title="استخدام كمرجع 3D"
                  >
                    ☕️ 3D مرجع
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
