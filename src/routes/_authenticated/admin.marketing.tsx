import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useCallback } from "react";
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
  Music,
} from "lucide-react";
import { toast } from "sonner";
import {
  dispatchStudioGeneration,
  getGoogleStudioApiKey,
  setGoogleStudioApiKey,
  testGoogleStudioConnection,
  callGeminiCreativeAgent,
  callUniversalCreativeAgent,
  getOpenAiApiKey,
  setOpenAiApiKey,
  testOpenAiConnection,
  getFalApiKey,
  setFalApiKey,
  testFalConnection,
  getElevenLabsApiKey,
  setElevenLabsApiKey,
  testElevenLabsConnection,
} from "@/features/marketing/providers/ai-providers";
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
import { KubeMcpHubSection, KubeMcpModalContent } from "@/features/marketing/mcp/KubeMcpHubSection";
import { HeaderNavDropdowns } from "@/features/marketing/components/HeaderNavDropdowns";
import { HalaiImageGenerateSection } from "@/features/marketing/components/HalaiImageGenerateSection";
import { HalaiVideoGenerateSection } from "@/features/marketing/components/HalaiVideoGenerateSection";
import { HalaiCharactersSection } from "@/features/marketing/components/HalaiCharactersSection";
import { HalaiStoryboardSection } from "@/features/marketing/components/HalaiStoryboardSection";
import { HalaiAdsStudioSection } from "@/features/marketing/components/HalaiAdsStudioSection";
import { HalaiLibrarySection } from "@/features/marketing/components/HalaiLibrarySection";
import { HalaiCinemaSection } from "@/features/marketing/components/HalaiCinemaSection";
import { HalaiPricingSection } from "@/features/marketing/components/HalaiPricingSection";

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

// 16 Real High-Converting Advertising Templates (100% Halai Parity)
export interface CreativeTemplateItem {
  id: string;
  title: string;
  cat: string;
  engine: string;
  img: string;
  desc: string;
  promptSample: string;
  aspectRatio: "9:16" | "16:9" | "1:1";
  duration: string;
}

const TEMPLATES_ITEMS: CreativeTemplateItem[] = [
  {
    id: "tmpl_cold_brew",
    title: "انتعاش الكولد برو كيني KUBE",
    cat: "مشروبات وقهوة",
    engine: "Veo 3.1 Pro",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    desc: "سكب بطيء لكولد برو مركز مع تكثف قطرات الماء على الزجاج ومكعبات ثلج كريستالية وإضاءة نهارية راقية.",
    promptSample: "إعلان سينمائي 4K لكوب كولد برو كيني مركز في مقهى KUBE بالرياض، تصوير ماكرو بطيء 120fps لسكب القهوة مع تناثر رذاذ وانعكاسات ضوء ناعمة على الرخام الأسود.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_flat_white",
    title: "رسمة التيوليب بالفلات وايت",
    cat: "مشروبات وقهوة",
    engine: "Kling 3.0",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=800",
    desc: "الباريستا يسكب الحليب المخملي برسمة تيوليب ثلاثية مع بخار خفيف ورغوة غنية متماسكة.",
    promptSample: "لقطة سينمائية من زاوية علوية 45 درجة لباريستا سعودي يسكب حليب فلات وايت برسمة تيوليب متقنة، بخار هادئ يتصاعد، إضاءة دافئة سينمائية 4K.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_croissant",
    title: "كرواسون اللوز الساخن وتناثر الرقائق",
    cat: "طعام وحلويات",
    engine: "WanX 2.6",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=800",
    desc: "كسر قطعة كرواسون مخبوزة حديثاً مع تناثر الرقائق المقرمشة وحشوة اللوز الغنية.",
    promptSample: "لقطة ماكرو مقربة لكسر كرواسون لوز فرنسي ساخن ومقرمش، تناثر فتات الرقائق الذهبية في الهواء، تصوير سينمائي 8K فود أدفيرتايزينغ.",
    aspectRatio: "1:1",
    duration: "10s",
  },
  {
    id: "tmpl_perfume_luxury",
    title: "عطر ليذر رويال — رذاذ العنبر الليلي",
    cat: "عطور وتجميل",
    engine: "Flux 1.1 Pro",
    img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80",
    desc: "زجاجة عطر فاخرة سوداء على رخام أسود مع رذاذ عنبر ذهبي وإضاءة درامية حادة.",
    promptSample: "إعلان تجاري فخم لزجاجة عطر ليذر سوداء مع كتابة ذهبية بارزة على سطح رخامي عاكس، انطلاق رذاذ العطر بإضاءة ذهبية درامية، هاسيلبلاد 4K.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_ugc_car",
    title: "ريلز سيارة عفوي — روقان الدوام",
    cat: "تيك توك UGC",
    engine: "Kling 3.0 Turbo",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/28344dc091e4acf786c7622ad1fdeb10/thumbnails/thumbnail.jpg?height=800",
    desc: "شاب سعودي يمسك كوب KUBE في زحمة خريص الصباحية ويتحدث بعفوية عن طاقة اليوم.",
    promptSample: "فيديو UGC تيك توك مصور بكاميرا آيفون 16 برو لشاب سعودي مبتسم داخل سيارته في الرياض صباحاً يمسك كوب كولد برو KUBE ويتحدث بنبرة حماسية سريعة.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_fashion_abaya",
    title: "عباية مخملية في بوليفارد الرياض",
    cat: "أزياء وعبايات",
    engine: "Veo 3.1",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
    desc: "عرض أزياء سينمائي لعباية راقية مع انسياب القماش وحركة كاميرا بطيئة 60fps.",
    promptSample: "مقطع سينمائي 4K لموديل سعودية ترتدي عباية مخملية راقية تمشي في ممرات بوليفارد الرياض ليلاً، إضاءات نيون ناعمة وحركة قماش بطيئة وانعكاسات زجاجية.",
    aspectRatio: "9:16",
    duration: "20s",
  },
  {
    id: "tmpl_burger_smash",
    title: "برجر كرسبي وتروس الجبن الذائب",
    cat: "طعام وحلويات",
    engine: "WanX 2.6",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    desc: "سحق قطعة اللحم على الصاج الساخن مع ذوبان جبن الشيدر وصوت الشواء الحقيقي.",
    promptSample: "إعلان تجاري سينمائي لوجبة برجر سماش مع شيدر مذاب وبطاطس ساخنة وصوص خاص، تصوير ماكرو بطيء 120fps مع بخار ساخن وإضاءة استوديو طعام احترافية.",
    aspectRatio: "1:1",
    duration: "15s",
  },
  {
    id: "tmpl_asmr_ice_pour",
    title: "ASMR سكب وتكسير الثلج المنعش",
    cat: "مشروبات وقهوة",
    engine: "Veo 3.1 Pro",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=800",
    desc: "لقطة حسية مقربة للغاية تركز على أصوات تكسير الثلج وسكب المشروب الفوار.",
    promptSample: "مقطع ASMR حسي فائق النقاء لمكعبات ثلج شفافة تسقط في كوب زجاجي يتبعه سكب مشروب مثلج غازي مع فقاعات متصاعدة وتكثيف رطوبة، دقة 4K نقية.",
    aspectRatio: "9:16",
    duration: "12s",
  },
  {
    id: "tmpl_national_day",
    title: "فخامة الهوية واليوم الوطني",
    cat: "عروض وتخفيضات",
    engine: "Flux 1.1 Pro",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/27ad80f674f0cd970046d7985749890a/thumbnails/thumbnail.jpg?height=800",
    desc: "تصميم إعلاني فخم يحمل درجات الأخضر الزمردي والخطوط الذهبية مع علبة قهوة KUBE التذكارية.",
    promptSample: "بوستر إعلاني وطني فاخر، خلفية قماش حريري أخضر زمردي داكن مع شارات ذهبية بارزة وكوب قهوة KUBE من السيراميك الحجري بنقوش تراثية سعودية معاصرة.",
    aspectRatio: "1:1",
    duration: "10s",
  },
  {
    id: "tmpl_sneaker_unboxing",
    title: "فتح علبة سنيكرز حصرية من الأعلى",
    cat: "أزياء وعبايات",
    engine: "Kling 3.0",
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80",
    desc: "مشهد فتح علبة حذاء حصري بتصوير رأسي Top-Down مع إبراز الخامات وتطريز الشعار.",
    promptSample: "لقطة فتح علبة سينمائية Top-Down لعلبة أحذية رياضية ليمتد إيديشن مع ورق تغليف شفاف وإبراز جلود الحذاء والتطريز الفاخر، إضاءة استوديو ناعمة.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_late_night_neon",
    title: "أجواء ليلية نيون — كافيه KUBE",
    cat: "مشروبات وقهوة",
    engine: "Grok Imagine",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/21d02f613a69c054c30b1438749d13f4/thumbnails/thumbnail.jpg?height=800",
    desc: "توهج أحمر داكن مطابق لهوية KUBE مع لافتات نيون وانعكاسات أسفلت ممطر في شوارع الرياض.",
    promptSample: "لقطة سينمائية ليلية لواجهة مقهى KUBE في الرياض مع توهج أحمر داكن لعلامة النيون، أسطح خرسانية مبللة تعكس الأضواء، وكوب سفري يحمله شاب بملامح سعودية.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_breakfast_combo",
    title: "عرض الفطور الصباحي المتكامل",
    cat: "عروض وتخفيضات",
    engine: "Veo 3.1",
    img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
    desc: "ترتيب سينمائي لكرواسون ساخن وكوب فلات وايت مع كود خصم التطبيق وخلفية خشبية دافئة.",
    promptSample: "عرض إعلاني جذاب لكومبو فطور KUBE الصباحي (كرواسون طازج + فلات وايت برسمة جميلة)، طاولة خشب جوز دافئة مع ضوء شمس الصباح الساقط بزاوية هادئة.",
    aspectRatio: "16:9",
    duration: "15s",
  },
  {
    id: "tmpl_ugc_review",
    title: "مراجعة نورة للمحصول الإثيوبي",
    cat: "تيك توك UGC",
    engine: "Kling 3.0 Turbo",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=800",
    desc: "نورة تشرح إيحاءات المحصول الجديد وتوصي بطلبه في الصباح الباكر مع تعابير صادقة.",
    promptSample: "فيديو UGC تيك توك لفتاة سعودية محجبة بنبرة نجدية تشرح تجربتها الأولى مع محصول KUBE الإثيوبي الجديد وكيف أن حلاوته طبيعية بدون مرارة، تصوير رأسي سريع.",
    aspectRatio: "9:16",
    duration: "15s",
  },
  {
    id: "tmpl_beans_packaging",
    title: "أكياس بن فاخرة مع حبوب القهوة المحمصة",
    cat: "مشروبات وقهوة",
    engine: "Flux 1.1 Pro",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    desc: "أكياس بن سوداء مطفية مع صمام أمان وحبوب بن كولومبي لامعة منثورة على حجر صحراوي.",
    promptSample: "تصوير تجاري فاخر لثلاثة أكياس بن قهوة مختصة KUBE أسود مطفي مع تفاصيل ذهبية، حبوب بن محمصة حديثاً مبعثرة حول الأكياس على سطح حجر ترافيرتين نجد الطبيعي.",
    aspectRatio: "1:1",
    duration: "10s",
  },
  {
    id: "tmpl_celebrity_arrival",
    title: "وصول الضيوف والافتتاح الكبير",
    cat: "أزياء وعبايات",
    engine: "Veo 3.1 Pro",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/2bd5a81ba7055b5e5d434e3926a8945f/thumbnails/thumbnail.jpg?height=800",
    desc: "أجواء فخمة للسجادة الحمراء ووصول الزوار مع كؤوس الكولد برو الترحيبية والابتسامات.",
    promptSample: "مشهد سينمائي 4K هوليوودي لحدث افتتاح راقٍ لفرع KUBE الجديد، ضيوف بأزياء سعودية فاخرة يستلمون أكواب القهوة الترحيبية، أضواء فلاشات الكاميرا والابتسامات.",
    aspectRatio: "16:9",
    duration: "20s",
  },
  {
    id: "tmpl_stadium_fan",
    title: "حماس الجماهير مع كولد برو الرياض",
    cat: "عروض وتخفيضات",
    engine: "Kling 3.0",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/24512104ff8cc84b24db6ea92b9df10a/thumbnails/thumbnail.jpg?height=800",
    desc: "شاب في مدرجات ملعب المملكة أرينا يحمل كوب KUBE المثلج مع هتافات الفوز.",
    promptSample: "لقطة حماسية سينمائية لشاب سعودي في مدرجات ملعب كرة قدم بالرياض ليلاً يحمل كوب مثلج من KUBE مع أضواء الملاعب المبهرة وخلفية الجماهير المحتفلة.",
    aspectRatio: "9:16",
    duration: "15s",
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

// 7 Diverse Commercial Showcase Cards (Matching Halai Desktop/Mobile Fan)
const SHOWCASE_CAROUSEL_ITEMS = [
  {
    id: "burger",
    tag: "طعام وحلويات",
    title: "وجبة برجر مقرمش",
    img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=720&q=80",
    format: "طعام وحلويات",
    promptSample: "إعلان سينمائي 4K لوجبة برجر مقرمش وجبن ذائب وبطاطس ساخنة مع إضاءة استوديو داكنة وزوايا ماكرو بطيئة",
  },
  {
    id: "ugc",
    tag: "استعراض UGC",
    title: "ريفيو صانعة محتوى",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=1000",
    format: "استعراض UGC",
    promptSample: "مقطع UGC لفتاة سعودية تستعرض منتج عناية بالبشرة بنبرة عفوية وتوصية صادقة في أول 3 ثوانٍ",
  },
  {
    id: "perfume",
    tag: "مراجعة منتج",
    title: "عطر ليذر نايت الفاخر",
    img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=720&q=80",
    format: "مراجعة منتج",
    promptSample: "إعلان عطر فاخر زجاجة سوداء كريستالية مع رذاذ عنبر وإضاءة ذهبية درامية في أجواء ليلية راقية",
  },
  {
    id: "fashion",
    tag: "تجربة الزي",
    title: "عباية مخملية سوداء",
    img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=720&q=80",
    format: "تجربة الزي",
    promptSample: "عرض أزياء سينمائي لموديل سعودية ترتدي عباية راقية مع حركة قماش انسيابية وإضاءة استوديو دافئة",
  },
  {
    id: "sneakers",
    tag: "فتح العلبة",
    title: "سنيكرز إير ستريت",
    img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=720&q=80",
    format: "فتح العلبة",
    promptSample: "مقطع فتح علبة سنيكرز حصرية من الأعلى مع صوت ASMR حقيقي وإبراز تفاصيل الجلد والتطريز",
  },
  {
    id: "motion",
    tag: "حركة",
    title: "سكب ديناميكي وانتعاش",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=720",
    format: "حركة",
    promptSample: "لقطة حركة بطيئة فائقة 120fps لسكب مشروب مثلج مع تناثر قطرات الماء ومكعبات الثلج في الهواء",
  },
  {
    id: "coffee",
    tag: "مقهى",
    title: "كولد برو كيني مركز",
    img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=720&q=80",
    format: "مقهى",
    promptSample: "لقطة سينمائية لكوب كولد برو مركز مع طبقات الحليب البارد ورغوة غنية وإضاءة نهارية طبيعية",
  },
];

// 14 Official Ad Formats (100% Halai Categories)
const HALAI_AD_FORMATS = [
  { id: "food", name: "طعام وحلويات", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80", promptSample: "إعلان سينمائي 4K لوجبة برجر مقرمش وجبن ذائب وبطاطس ساخنة مع إضاءة استوديو داكنة وزوايا ماكرو بطيئة" },
  { id: "ugc", name: "استعراض UGC", img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/e979b81d089e42e710e17fab3b3bbde5/thumbnails/thumbnail.jpg?time=0&height=400", promptSample: "فيديو عفوي بأسلوب UGC تيك توك لصانعة محتوى سعودية تشرح تجربتها الصادقة مع المنتج بلهجة نجدية سريعة" },
  { id: "review", name: "مراجعة منتج", img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80", promptSample: "مراجعة سينمائية دقيقة لتفاصيل المنتج وإبراز الجودة والفخامة مع إضاءة ناعمة وخلفية أنيقة 4K" },
  { id: "fashion", name: "تجربة الزي", img: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=400&q=80", promptSample: "استعراض أزياء سينمائي لعباءة مخملية فاخرة أو أزياء راقية في بوليفارد الرياض مع حركة بطيئة ساحرة" },
  { id: "unboxing", name: "فتح العلبة", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80", promptSample: "مشهد فتح علبة فاخر بتصوير سينمائي رأسي مع إبراز التفاصيل الدقيقة وملمس العبوة والتغليف الراقي" },
  { id: "explainer", name: "شرح", img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=400&q=80", promptSample: "شرح تفاعلي مبسط وسلس يوضح طريقة استخدام المنتج وأبرز فوائده العملية بأسلوب تسويقي جذاب" },
  { id: "before_after", name: "قبل وبعد", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=400&q=80", promptSample: "مقارنة سينمائية قبل وبعد توضح النتيجة المبهرة وتأثير استخدام المنتج مع مؤثر انتقال سلس 60fps" },
  { id: "luxury", name: "فخامة", img: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80", promptSample: "إعلان فخامة فائق الأناقة مع إضاءة درامية ذهبية وخلفية رخامية وانعكاسات زجاجية راقية جداً" },
  { id: "film", name: "فيلم إعلاني", img: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=400&q=80", promptSample: "فيلم إعلاني درامي سينمائي بهوية سعودية معاصرة وزوايا كاميرا هوليوودية وموسيقى حماسية" },
  { id: "asmr", name: "ASMR", img: "https://images.unsplash.com/photo-1518492104633-130d0cc84637?auto=format&fit=crop&w=400&q=80", promptSample: "فيديو ASMR فائق النقاء يركز على الأصوات الحسية العميقة واللقطات الماكرو المقربة بدقة 4K" },
  { id: "kinetic", name: "حركة", img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/679f435913be72cd7135ad8fb2b4c880/thumbnails/thumbnail.jpg?height=400", promptSample: "حركة ديناميكية سريعة وحركات كاميرا ثلاثية الأبعاد تعطي طاقة وحيوية غير مسبوقة للإعلان" },
  { id: "action", name: "أكشن", img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=400&q=80", promptSample: "مشهد أكشن وحماس عالي السرعة مع مؤثرات إضاءة سينمائية وانتقالات سريعة تجذب الانتباه في أول ثانيتين" },
  { id: "cafe", name: "مقهى", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80", promptSample: "جلسة مقهى راقية في الرياض مع تصوير V60 وحبات البن المحمصة وأجواء شتوية دافئة وهادئة" },
  { id: "automotive", name: "سيارات", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=400&q=80", promptSample: "إعلان سيارات فارهة بسرعات ليلية تحت أضواء الرياض وانعكاسات نيون مذهلة بدقة سينمائية" }
];

// Sample Diverse Product Catalog
const SAMPLE_PRODUCTS_CATALOG = [
  { id: "p1", name: "عطر ليذر رويال", category: "عطور", img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80" },
  { id: "p2", name: "برجر كرسبي فاخر", category: "طعام", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80" },
  { id: "p3", name: "سنيكرز إير ستريت", category: "أحذية", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=400&q=80" },
  { id: "p4", name: "سيروم عناية CeraVe", category: "عناية", img: "https://images.unsplash.com/photo-1608248597359-00109b8d2346?auto=format&fit=crop&w=400&q=80" },
  { id: "p5", name: "ساعة ألترا ذكية", category: "تقنية", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=400&q=80" },
  { id: "p6", name: "كولد برو كيني KUBE", category: "قهوة", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80" },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
}

export type StudioPageKey =
  | "studio_2"
  | "image_generate"
  | "video_generate"
  | "storyboard"
  | "ugc_studio"
  | "ads_9x"
  | "ads_studio"
  | "product_3d"
  | "characters"
  | "character_creator"
  | "shots_studio"
  | "mimic_motion"
  | "cinema"
  | "super_agent"
  | "mcp_hub"
  | "templates"
  | "library"
  | "promlog"
  | "tutorials"
  | "pricing_plans"
  | "community"
  | "models_api"
  | "providers_guide"
  | "connectors_hub";

const VALID_STUDIO_KEYS: StudioPageKey[] = [
  "studio_2",
  "image_generate",
  "video_generate",
  "storyboard",
  "ugc_studio",
  "ads_9x",
  "ads_studio",
  "product_3d",
  "characters",
  "character_creator",
  "shots_studio",
  "mimic_motion",
  "cinema",
  "super_agent",
  "mcp_hub",
  "templates",
  "library",
  "promlog",
  "tutorials",
  "pricing_plans",
  "community",
  "models_api",
  "providers_guide",
  "connectors_hub",
];

function KubeAiMarketingPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const backHomeUrl = primaryRoleHome(currentUser.data?.roles ?? []);

  // Standalone Studio Page Navigation State (100% Matching Halai Architecture - NO Popups/Modals!)
  const [currentStudioPage, setCurrentStudioPage] = useState<StudioPageKey>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("studio");
      if (s && VALID_STUDIO_KEYS.includes(s as StudioPageKey)) {
        return s as StudioPageKey;
      }
      if (s === "photos" || s === "image-generate" || s === "images") return "image_generate";
      if (s === "videos" || s === "video-generate") return "video_generate";
      if (s === "storyboard_studio") return "storyboard";
      if (s === "characters" || s === "character-creator") return "characters";
      if (s === "ads-studio" || s === "ads_studio") return "ads_studio";
      if (s === "mcp") return "mcp_hub";
      if (s === "pricing") return "pricing_plans";
      if (s === "library") return "library";
      if (s === "cinema") return "cinema";
    }
    return "studio_2";
  });

  const navigateToStudio = useCallback(
    (studioKey: StudioPageKey | "none" | "storyboard_studio" | "mcp" | string) => {
      let targetKey: StudioPageKey = "studio_2";
      if (studioKey === "none" || studioKey === "studio_2") {
        targetKey = "studio_2";
      } else if (studioKey === "image_generate" || studioKey === "photos" || studioKey === "image-generate") {
        targetKey = "image_generate";
      } else if (studioKey === "video_generate" || studioKey === "videos" || studioKey === "video-generate") {
        targetKey = "video_generate";
      } else if (studioKey === "characters" || studioKey === "character_creator" || studioKey === "character-creator") {
        targetKey = "characters";
      } else if (studioKey === "ads_studio" || studioKey === "ads_9x" || studioKey === "ads-studio") {
        targetKey = "ads_studio";
      } else if (studioKey === "storyboard_studio" || studioKey === "storyboard") {
        targetKey = "storyboard";
      } else if (studioKey === "mcp" || studioKey === "mcp_hub") {
        targetKey = "mcp_hub";
      } else if (studioKey === "pricing" || studioKey === "pricing_plans") {
        targetKey = "pricing_plans";
      } else if (studioKey === "library") {
        targetKey = "library";
      } else if (studioKey === "cinema") {
        targetKey = "cinema";
      } else if (VALID_STUDIO_KEYS.includes(studioKey as StudioPageKey)) {
        targetKey = studioKey as StudioPageKey;
      }

      setCurrentStudioPage(targetKey);
      setMobileMenuOpen(false);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        if (targetKey === "studio_2") {
          url.searchParams.delete("studio");
        } else {
          url.searchParams.set("studio", targetKey);
        }
        window.history.pushState({}, "", url.toString());
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    []
  );

  // Backward compatibility alias: any call to setActiveStudioModal navigates to the standalone page
  const setActiveStudioModal = useCallback(
    (modal: string) => {
      navigateToStudio(modal);
    },
    [navigateToStudio]
  );
  const activeStudioModal = currentStudioPage;

  useEffect(() => {
    const onPopState = () => {
      const params = new URLSearchParams(window.location.search);
      const s = params.get("studio");
      if (s && VALID_STUDIO_KEYS.includes(s as StudioPageKey)) {
        setCurrentStudioPage(s as StudioPageKey);
      } else if (s === "storyboard_studio") {
        setCurrentStudioPage("storyboard");
      } else if (s === "mcp") {
        setCurrentStudioPage("mcp_hub");
      } else {
        setCurrentStudioPage("studio_2");
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Mobile drawer toggle & accordion states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [studiosAccordionOpen, setStudiosAccordionOpen] = useState(true);
  const [exploreAccordionOpen, setExploreAccordionOpen] = useState(true);

  // New Ad Bottom Sheet Modal (Matching IMG_0105)
  const [isNewAdModalOpen, setIsNewAdModalOpen] = useState(false);
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isProductUploadModalOpen, setIsProductUploadModalOpen] = useState(false);
  const [productModalTab, setProductModalTab] = useState<"upload" | "library" | "custom">("upload");
  const [customProductName, setCustomProductName] = useState("");

  // Hero Creation Studio 2.0 Form States (Matching IMG_0104)
  const [heroMode, setHeroMode] = useState<"video" | "image">("video");
  const [heroPrompt, setHeroPrompt] = useState("");
  const [heroProduct, setHeroProduct] = useState<{ id: string; name: string; img: string; category?: string } | null>(null);
  const [heroPersona, setHeroPersona] = useState<(typeof UGC_CREATORS)[0] | null>(null);
  const [heroScene, setHeroScene] = useState<string | null>(null);
  const [heroAdType, setHeroAdType] = useState<string>("طعام وحلويات");
  const [heroAspect, setHeroAspect] = useState<"3:4" | "9:16" | "1:1" | "16:9">("9:16");
  const [heroResolution, setHeroResolution] = useState<"1080p" | "4K" | "720p" | "480p">("480p");
  const [heroDuration, setHeroDuration] = useState<"12 ث" | "10 ث" | "15 ث" | "30 ث">("10 ث");
  const [isGeneratingHeroAd, setIsGeneratingHeroAd] = useState(false);

  // Templates Page State Filters
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<string>("الكل");
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>("");

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const prodName = customProductName.trim() || file.name.replace(/\.[^/.]+$/, "");
        const newProd = {
          id: `upload-${Date.now()}`,
          name: prodName,
          img: result,
          category: "مرفوع",
        };
        setHeroProduct(newProd);
        setIsProductUploadModalOpen(false);
        toast.success(`تم رفع صورة المنتج: ${prodName}`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleHeroAdGenerate = async () => {
    if (!heroPrompt.trim() && !heroProduct) {
      toast.error("يرجى كتابة فكرة الإعلان أو إضافة منتج لتبدأ");
      return;
    }
    setIsGeneratingHeroAd(true);
    toast.info("جاري توجيه محركات الذكاء الاصطناعي وبدء الريندر...");

    const targetTitle = heroProduct ? `${heroProduct.name} — ${heroAdType}` : `إعلان ${heroAdType} احترافي`;
    const targetImg = heroProduct?.img || "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=720&q=80";

    await dispatchStudioGeneration({
      task: heroMode === "video" ? "video_ugc_motion" : "image_packshot_4k",
      provider: "fal_ai",
      prompt: heroPrompt || `Cinematic commercial for ${heroProduct?.name || heroAdType}`,
      aspectRatio: heroAspect,
      resolution: heroResolution,
      productImageUrl: heroProduct?.img,
      adType: heroAdType,
    });

    setTimeout(() => {
      const newAd = {
        id: `ad-${Date.now()}`,
        title: targetTitle,
        type: heroMode,
        thumb: targetImg,
        createdAt: "الآن",
        status: "ready" as const,
        aspect: heroAspect,
        prompt: heroPrompt || `Commercial render of ${targetTitle}`,
      };
      setUserAds((prev) => [newAd, ...prev]);
      setIsGeneratingHeroAd(false);
      setIsNewAdModalOpen(false);
      toast.success("تم تجهيز إعلانك بنجاح وعرضه في قسم إعلاناتي!");
      
      const el = document.getElementById("my-ads-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 1200);
  };

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

  // Google AI Studio Live Key Integration States
  const [googleStudioKeyInput, setGoogleStudioKeyInput] = useState<string>("");
  const [activeGoogleKey, setActiveGoogleKey] = useState<string>("");
  const [isTestingGoogleKey, setIsTestingGoogleKey] = useState<boolean>(false);

  useEffect(() => {
    const existing = getGoogleStudioApiKey();
    if (existing) {
      setActiveGoogleKey(existing);
      setGoogleStudioKeyInput(existing);
    }
  }, []);

  const handleSaveAndTestGoogleKey = async () => {
    setIsTestingGoogleKey(true);
    const res = await testGoogleStudioConnection(googleStudioKeyInput);
    setIsTestingGoogleKey(false);
    if (res.success) {
      setGoogleStudioApiKey(googleStudioKeyInput);
      setActiveGoogleKey(googleStudioKeyInput);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleClearGoogleKey = () => {
    setGoogleStudioApiKey("");
    setActiveGoogleKey("");
    setGoogleStudioKeyInput("");
    toast.info("تم مسح مفتاح Google AI Studio");
  };

  // OpenAI Integration States
  const [openAiKeyInput, setOpenAiKeyInput] = useState<string>("");
  const [activeOpenAiKey, setActiveOpenAiKey] = useState<string>("");
  const [isTestingOpenAiKey, setIsTestingOpenAiKey] = useState<boolean>(false);

  // Fal.ai Integration States
  const [falKeyInput, setFalKeyInput] = useState<string>("");
  const [activeFalKey, setActiveFalKey] = useState<string>("");
  const [isTestingFalKey, setIsTestingFalKey] = useState<boolean>(false);

  // ElevenLabs Integration States
  const [elevenLabsKeyInput, setElevenLabsKeyInput] = useState<string>("");
  const [activeElevenLabsKey, setActiveElevenLabsKey] = useState<string>("");
  const [isTestingElevenLabsKey, setIsTestingElevenLabsKey] = useState<boolean>(false);

  useEffect(() => {
    const oKey = getOpenAiApiKey();
    if (oKey) {
      setActiveOpenAiKey(oKey);
      setOpenAiKeyInput(oKey);
    }
    const fKey = getFalApiKey();
    if (fKey) {
      setActiveFalKey(fKey);
      setFalKeyInput(fKey);
    }
    const eKey = getElevenLabsApiKey();
    if (eKey) {
      setActiveElevenLabsKey(eKey);
      setElevenLabsKeyInput(eKey);
    }
  }, []);

  const handleSaveAndTestOpenAiKey = async () => {
    setIsTestingOpenAiKey(true);
    const res = await testOpenAiConnection(openAiKeyInput);
    setIsTestingOpenAiKey(false);
    if (res.success) {
      setOpenAiApiKey(openAiKeyInput);
      setActiveOpenAiKey(openAiKeyInput);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveAndTestFalKey = async () => {
    setIsTestingFalKey(true);
    const res = await testFalConnection(falKeyInput);
    setIsTestingFalKey(false);
    if (res.success) {
      setFalApiKey(falKeyInput);
      setActiveFalKey(falKeyInput);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handleSaveAndTestElevenLabsKey = async () => {
    setIsTestingElevenLabsKey(true);
    const res = await testElevenLabsConnection(elevenLabsKeyInput);
    setIsTestingElevenLabsKey(false);
    if (res.success) {
      setElevenLabsApiKey(elevenLabsKeyInput);
      setActiveElevenLabsKey(elevenLabsKeyInput);
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

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

    if (activeGoogleKey || activeOpenAiKey) {
      callUniversalCreativeAgent(text)
        .then(({ text: replyText, providerUsed }) => {
          const agentMsg: ChatMessage = {
            id: `agent-${Date.now()}`,
            sender: "agent",
            text: `${replyText}\n\n⚡️ [تم الإخراج والتوليد المباشر عبر: ${providerUsed}]`,
            timestamp: "الآن",
          };
          setChatMessages((prev) => [...prev, agentMsg]);
          setIsAgentTyping(false);
        })
        .catch((err) => {
          console.warn("Creative agent error:", err);
          const replyText = `يا هلا زياد! أبشر بعزك ☕️✨\nتم توجيه المحرك (${selectedEngine}) لصياغة سكريبت بصري بالصيغة: "${selectedUgcFormat.nameAr}"\n\n📌 المشهد: لقطة ماكرو 4K مع تكثيف قطرات الندى على كوب كولد برو KUBE الأسود المطفي مع لمسات الأحمر المتوهج.\n🎙️ الصوت: "إذا يومك ما بدأ بقطرة تروق المخ... KUBE يضبط مزاجك بضغطة زر".\n⚡️ البرومبت الجاهز للإنتاج:\n${selectedUgcFormat.promptDirective}\n\nجاهز للتوليد الفوري على Kling 3 Turbo أو Google Veo 3.1!`;

          const agentMsg: ChatMessage = {
            id: `agent-${Date.now()}`,
            sender: "agent",
            text: replyText,
            timestamp: "الآن",
          };
          setChatMessages((prev) => [...prev, agentMsg]);
          setIsAgentTyping(false);
        });
      return;
    }

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
      className="w-full min-h-screen bg-black text-white selection:bg-[#ff2a4b] selection:text-white font-sans overflow-x-hidden antialiased pb-12 xl:pb-0"
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
            className="xl:hidden w-10 h-10 shrink-0 flex items-center justify-center rounded-xl text-white bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all"
          >
            <MenuIcon className="w-5 h-5 text-white" />
          </button>

          {/* KUBE UP Official Brand Logo */}
          <Link
            to="/admin/marketing"
            onClick={(e) => {
              e.preventDefault();
              navigateToStudio("studio_2");
            }}
            className="h-9 md:h-12 flex items-center shrink-0 cursor-pointer hover:opacity-90 transition-opacity gap-2 md:gap-3"
          >
            <img
              src="/kube-up-logo.png"
              alt="KUBE UP"
              className="h-7 md:h-8 w-auto object-contain rounded"
            />
            <span className="hidden sm:inline-block rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
              STUDIO 2.0
            </span>
          </Link>

          {/* Desktop Navigation Mega-Dropdowns (Halai 100% Matching Parity) */}
          <HeaderNavDropdowns
            onNavigateToTab={(tabKey) => navigateToStudio(tabKey)}
            onSelectStudio={(studioId) => {
              if (studioId === "marketing_2") {
                navigateToStudio("studio_2");
                setHeroMode("video");
              } else if (studioId === "cinema") {
                navigateToStudio("cinema");
              } else if (studioId === "ugc_2" || studioId === "ugc_1") {
                navigateToStudio("ugc_studio");
              } else if (studioId === "ads_9x" || studioId === "marketing_1") {
                navigateToStudio("ads_studio");
              } else if (studioId === "products") {
                navigateToStudio("product_3d");
              } else if (studioId === "characters") {
                navigateToStudio("characters");
              } else if (studioId === "storyboard") {
                navigateToStudio("storyboard");
              } else if (studioId === "shots") {
                navigateToStudio("shots_studio");
              }
            }}
            onSelectPhotoModel={(modelName) => {
              navigateToStudio("image_generate");
              setHeroMode("image");
              setHeroPrompt((prev) => prev || `صورة فوتوغرافية احترافية لكوب قهوة مختصة KUBE بدقة 4K بنموذج ${modelName}`);
            }}
            onSelectVideoModel={(modelName) => {
              navigateToStudio("video_generate");
              setHeroMode("video");
              setHeroPrompt((prev) => prev || `إعلان فيديو سينمائي 15 ثانية لكافيه KUBE بنموذج ${modelName}`);
            }}
            onSelectApp={(appId) => {
              if (appId === "super_agent") {
                navigateToStudio("super_agent");
              } else if (appId === "mimic_motion") {
                navigateToStudio("mimic_motion");
              } else if (appId === "storyboard") {
                navigateToStudio("storyboard");
              } else if (appId === "promlog") {
                navigateToStudio("promlog");
              } else if (appId === "mcp_connect") {
                navigateToStudio("mcp_hub");
              } else if (appId === "templates") {
                navigateToStudio("templates");
              }
            }}
          />

        </div>

        {/* Left Section: Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {/* Provider API Keys Button */}
          <button
            onClick={() => setActiveStudioModal("providers_guide")}
            className="hidden sm:flex items-center gap-1.5 h-8 md:h-9 px-2.5 rounded-xl bg-[#ff2a4b]/15 hover:bg-[#ff2a4b]/25 border border-[#ff2a4b]/40 text-[#ff3b56] text-xs font-bold transition-all shadow-sm active:scale-95 shrink-0"
            title="دليل مفاتيح المزودين (API)"
          >
            <Key className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">مفاتيح المزودين</span>
            <span className="2xl:hidden">API</span>
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

          {/* User Profile Capsule with Signature KUBE Red Glowing Ring (Desktop only; on mobile, profile is in drawer to avoid stray clutter) */}
          <div className="hidden md:flex items-center gap-2 relative">
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
              {/* Drawer Topbar with Clean Spacing & Zero Overlap */}
              <div className="flex items-center justify-between pb-3.5 border-b border-white/10">
                {/* Logo & Version Badge */}
                <div className="flex items-center gap-2">
                  <img
                    src="/kube-up-logo.png"
                    alt="KUBE UP"
                    className="h-6 sm:h-7 w-auto object-contain rounded"
                  />
                  <span className="rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-1.5 py-0.5 text-[9px] font-bold text-[#00e575] font-mono">
                    2.0
                  </span>
                </div>

                {/* Right controls: quick icons & distinct Close button */}
                <div className="flex items-center gap-1.5">
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
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="إغلاق القائمة"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/15 active:scale-95 transition-all ms-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Root Nav Items: صور / فيديو / تطبيقات / ستوري بورد / المكتبة / الباقات (Dedicated Standalone Pages) */}
              <div className="space-y-1">
                <button
                  onClick={() => navigateToStudio("image_generate")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <ImageIcon className="w-4 h-4 text-zinc-400" />
                    <span>صور (AI Image Generator)</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateToStudio("video_generate")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-[#00e575]" />
                    <span>فيديو (AI Video Generator)</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateToStudio("templates")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <LayoutGrid className="w-4 h-4 text-zinc-400" />
                    <span>تطبيقات وقوالب إعلانية</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateToStudio("library")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-4 h-4 text-[#ff2a4b]" />
                    <span>مكتبة الأصول (Library)</span>
                  </div>
                </button>

                <button
                  onClick={() => navigateToStudio("pricing_plans")}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                >
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-4 h-4 text-[#00e575]" />
                    <span>الباقات والاشتراكات</span>
                  </div>
                </button>
              </div>

              {/* Accordion 1: الاستوديوهات (كل استوديو صفحة مستقلة كاملة بدون نوافذ) */}
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
                        navigateToStudio("studio_2");
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
                      onClick={() => navigateToStudio("ads_9x")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Sparkle className="w-4 h-4 text-zinc-400" />
                        <span>استديو التسويق</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("ugc_studio")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>استديو UGC 2.0</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => navigateToStudio("ads_9x")}
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
                      onClick={() => navigateToStudio("storyboard")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-zinc-400" />
                        <span>ستوري بورد</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("product_3d")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-zinc-400" />
                        <span>استديو المنتجات</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("character_creator")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>استديو الشخصيات</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => navigateToStudio("shots_studio")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Camera className="w-4 h-4 text-zinc-400" />
                        <span>لقطات</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("cinema")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Film className="w-4 h-4 text-purple-400" />
                        <span>استوديو السينما</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300">قريباً</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Accordion 2: استكشف (صفحات مستقلة) */}
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
                      onClick={() => navigateToStudio("mcp_hub")}
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
                      onClick={() => navigateToStudio("super_agent")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Bot className="w-4 h-4 text-[#ff2a4b]" />
                        <span>سوبر ايجنت</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => navigateToStudio("community")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-zinc-400" />
                        <span>مجتمع</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("promlog")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-zinc-400" />
                        <span>بروملوق</span>
                      </div>
                    </button>

                    <button
                      onClick={() => navigateToStudio("tutorials")}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-zinc-200 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <GraduationCap className="w-4 h-4 text-zinc-400" />
                        <span>شروحات</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-[#00e575] text-black">جديد</span>
                    </button>

                    <button
                      onClick={() => navigateToStudio("pricing_plans")}
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
      {/* MAIN VIEW: EITHER STUDIO 2.0 OR DEDICATED STANDALONE PAGE      */}
      {/* ============================================================== */}
      {currentStudioPage === "studio_2" ? (
        <>
          {/* ============================================================== */}
          {/* 4. SECTION 1: STUDIO 2.0 HERO & CREATION FORM (100% Halai)     */}
          {/* ============================================================== */}
          <section className="relative w-full overflow-hidden bg-[#131416] pt-14 pb-10 px-3 sm:px-6 md:px-8 border-b border-white/[0.06]">
        {/* Halai Background Subtle Dot Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1.2px)",
            backgroundSize: "22px 22px",
            maskImage: "linear-gradient(black 0%, black 65%, transparent 100%)",
          }}
        />

        {/* Ambient Top Light Beam */}
        <div className="absolute inset-x-0 top-0 h-96 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(0,229,117,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center text-center space-y-6">
          
          {/* Emblem Badge: Curved Box with "استديو 2" / "التسويق" */}
          <div className="relative flex flex-col items-center justify-center pt-2">
            <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-300">
              <div className="w-[140px] sm:w-[170px] py-2 px-4 rounded-[22px] bg-gradient-to-b from-[#222327] to-[#17181a] border-2 border-white/20 shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_1px_0_rgba(255,255,255,0.2)] flex flex-col items-center justify-center">
                <span className="text-[11px] sm:text-xs font-bold text-[#00e575] tracking-widest uppercase">
                  استديو 2
                </span>
                <span className="text-lg sm:text-2xl font-black text-white tracking-tight -mt-0.5">
                  التسويق
                </span>
              </div>
            </div>
          </div>

          {/* Diverse Showcase Fan Row (7 Categories: Burger, UGC, Perfume, Fashion, Sneakers, Motion, Cafe) */}
          <div className="w-full max-w-3xl mx-auto overflow-x-auto pb-2 no-scrollbar scrollbar-none select-none">
            <div className="flex items-center justify-start sm:justify-center gap-2.5 sm:gap-3 min-w-max px-2">
              {SHOWCASE_CAROUSEL_ITEMS.map((item) => {
                const isActive = heroAdType === item.format;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setHeroAdType(item.format);
                      setHeroPrompt(item.promptSample);
                    }}
                    className={`group relative w-24 sm:w-28 aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border transition-all active:scale-95 shadow-xl text-right flex flex-col justify-end p-2 ${
                      isActive
                        ? "border-[#00e575] ring-2 ring-[#00e575]/40 scale-105 z-10"
                        : "border-white/10 hover:border-white/30 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={item.img}
                      alt={item.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    
                    <span className="relative z-10 self-start px-2 py-0.5 rounded-full text-[9px] font-bold bg-black/75 backdrop-blur-md text-white border border-white/15">
                      {item.tag}
                    </span>
                    <span className="relative z-10 text-[10px] sm:text-[11px] font-bold text-white block truncate pt-1">
                      {item.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Headline: حوّل أي منتج / إلى إعلان مدته 30 ثانية */}
          <h1 className="mt-4 text-[22px] sm:text-[28px] lg:text-[34px] font-bold tracking-tight text-center leading-tight">
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#ececee] to-[#bdbdc2]">
              حوّل أي منتج
            </span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-[#a3a3a9] to-[#71717a]">
              إلى إعلان مدته 30 ثانية
            </span>
          </h1>

          {/* ============================================================== */}
          {/* MOBILE ONLY: Single Prominent CTA Button (100% Halai Mobile)   */}
          {/* ============================================================== */}
          <div className="w-full max-w-sm mx-auto pt-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsNewAdModalOpen(true)}
              className="w-full h-13 py-3.5 px-6 rounded-2xl bg-[#00e575] hover:bg-[#00ff83] text-black font-black text-base flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#00e575]/25"
            >
              <Sparkles className="w-5 h-5 fill-current" />
              <span>أنشئ إعلانًا</span>
            </button>
          </div>

          {/* ============================================================== */}
          {/* DESKTOP ONLY: Elongated Horizontal ms2-panel Creation Box     */}
          {/* ============================================================== */}
          <div className="hidden md:flex items-stretch gap-2 w-full max-w-4xl mx-auto rounded-[22px] bg-[#1a1b1e] border border-white/[0.08] p-2.5 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.05)] text-right">
            
            {/* 1. Mode Switcher (Docked on Right in RTL): فيديو / صورة */}
            <div className="flex flex-col gap-1 p-1 rounded-2xl bg-[#141416] border border-white/5 shrink-0">
              <button
                type="button"
                onClick={() => setHeroMode("video")}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[46px] p-2 rounded-xl text-xs font-bold transition-all ${
                  heroMode === "video"
                    ? "bg-gradient-to-b from-[#2c2d31] to-[#232428] text-white shadow-md border border-white/10 font-bold"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <Video className="w-4 h-4 text-[#00e575] mb-0.5" />
                <span>فيديو</span>
              </button>

              <button
                type="button"
                onClick={() => setHeroMode("image")}
                className={`flex flex-col items-center justify-center min-w-[54px] min-h-[46px] p-2 rounded-xl text-xs font-bold transition-all ${
                  heroMode === "image"
                    ? "bg-gradient-to-b from-[#2c2d31] to-[#232428] text-white shadow-md border border-white/10 font-bold"
                    : "text-zinc-500 hover:text-white"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-zinc-300 mb-0.5" />
                <span>صورة</span>
              </button>
            </div>

            {/* 2. Middle: Prompt Textarea & Chips Bar */}
            <div className="flex flex-col flex-1 min-w-0 px-2 justify-between">
              <textarea
                rows={1}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="صِف الإعلان الذي تريد إنشاءه…"
                className="w-full bg-transparent text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none pt-1.5 leading-relaxed"
              />

              {/* Chips Bar */}
              <div className="flex items-center gap-1.5 pt-2 text-xs">
                {/* Format Chip (Opens 14 Halai Ad Types) */}
                <button
                  type="button"
                  onClick={() => setIsFormatModalOpen(true)}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#27282c] border border-white/10 hover:border-white/20 text-white font-medium active:scale-95 transition-all"
                >
                  <Clapperboard className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[130px]">{heroAdType || "اختر نوعًا"}</span>
                  <ChevronDown className="w-3 h-3 text-zinc-500" />
                </button>

                {/* Aspect Ratio Chip */}
                <button
                  type="button"
                  onClick={() => {
                    const ratios: ("9:16" | "16:9" | "1:1" | "3:4")[] = ["9:16", "16:9", "1:1", "3:4"];
                    const next = (ratios.indexOf(heroAspect as any) + 1) % ratios.length;
                    setHeroAspect(ratios[next]);
                  }}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#27282c] border border-white/10 text-white font-mono active:scale-95"
                  title="تغيير أبعاد الإعلان"
                >
                  <span>{heroAspect}</span>
                </button>

                {/* Resolution Chip */}
                <button
                  type="button"
                  onClick={() => {
                    const res: ("480p" | "720p" | "1080p" | "4K")[] = ["480p", "720p", "1080p", "4K"];
                    const next = (res.indexOf(heroResolution as any) + 1) % res.length;
                    setHeroResolution(res[next]);
                  }}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#27282c] border border-white/10 text-white font-mono active:scale-95"
                  title="تغيير دقة الريندر"
                >
                  <span>{heroResolution}</span>
                </button>

                {/* Duration Chip */}
                <button
                  type="button"
                  onClick={() => {
                    const durs: ("10 ث" | "12 ث" | "15 ث" | "30 ث")[] = ["10 ث", "12 ث", "15 ث", "30 ث"];
                    const next = (durs.indexOf(heroDuration as any) + 1) % durs.length;
                    setHeroDuration(durs[next]);
                  }}
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg bg-[#27282c] border border-white/10 text-white font-mono active:scale-95"
                  title="تغيير مدة الفيديو"
                >
                  <span>{heroDuration}</span>
                </button>
              </div>
            </div>

            {/* 3. Reference Slots: المنتج / الشخصية / المشهد */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Product Slot (Universal Upload & Library) */}
              <button
                type="button"
                onClick={() => setIsProductUploadModalOpen(true)}
                className={`w-[74px] h-[76px] rounded-[13px] border flex flex-col items-center justify-center gap-1 p-1 relative active:scale-95 transition-all overflow-hidden ${
                  heroProduct
                    ? "border-[#00e575] bg-[#00e575]/10 text-white shadow-sm"
                    : "border-white/10 hover:border-white/20 bg-black/30 text-zinc-300"
                }`}
              >
                {heroProduct ? (
                  <>
                    <img src={heroProduct.img} alt={heroProduct.name} className="w-full h-full object-cover rounded-[10px]" />
                    <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-white bg-black/85 px-1 py-0.5 rounded truncate text-center">
                      {heroProduct.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-xs text-white">
                      +
                    </div>
                    <span className="text-[11px] font-medium text-zinc-300">المنتج</span>
                  </>
                )}
              </button>

              {/* Character Slot */}
              <button
                type="button"
                onClick={() => setActiveStudioModal("ugc_studio")}
                className={`w-[74px] h-[76px] rounded-[13px] border flex flex-col items-center justify-center gap-1 p-1 relative active:scale-95 transition-all overflow-hidden ${
                  heroPersona
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 hover:border-white/20 bg-black/30 text-zinc-300"
                }`}
              >
                {heroPersona ? (
                  <>
                    <img src={heroPersona.avatar} alt={heroPersona.name} className="w-full h-full object-cover rounded-[10px]" />
                    <span className="absolute bottom-1 inset-x-1 text-[9px] font-bold text-white bg-black/85 px-1 py-0.5 rounded truncate text-center">
                      {heroPersona.name.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-xs text-white">
                      +
                    </div>
                    <span className="text-[11px] font-medium text-zinc-300">الشخصية</span>
                  </>
                )}
              </button>

              {/* Scene Slot */}
              <button
                type="button"
                onClick={() => {
                  setHeroScene(heroScene ? null : "استوديو سينمائي فاخر");
                }}
                className={`w-[74px] h-[76px] rounded-[13px] border p-1 flex flex-col items-center justify-center gap-1 relative active:scale-95 transition-all ${
                  heroScene
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 hover:border-white/20 bg-black/30 text-zinc-300"
                }`}
              >
                <div className="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center text-xs text-white">
                  {heroScene ? "✓" : "+"}
                </div>
                <span className="text-[11px] font-medium text-zinc-300 truncate max-w-[64px]">
                  {heroScene ? "المشهد" : "المشهد"}
                </span>
              </button>
            </div>

            {/* 4. Action Generate Button (Far Left) */}
            <button
              type="button"
              disabled={isGeneratingHeroAd}
              onClick={handleHeroAdGenerate}
              className={`w-[104px] h-[76px] rounded-xl font-black text-sm flex flex-col items-center justify-center gap-1 shrink-0 active:scale-95 transition-all shadow-xl ${
                isGeneratingHeroAd
                  ? "bg-zinc-700 text-zinc-400 cursor-wait"
                  : "bg-[#00e575] hover:bg-[#00ff83] text-black shadow-[#00e575]/25"
              }`}
            >
              {isGeneratingHeroAd ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
                  <span className="text-[11px]">جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  <span>إنشاء</span>
                </>
              )}
            </button>
          </div>

          {/* Centered Helper Text below Creation Card */}
          <p className="hidden md:block text-center text-[12.5px] text-[#7b7b84] pt-1">
            اختر نوع الإعلان لتبدأ
          </p>

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
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNewAdModalOpen(true)}
                    className="px-6 py-2.5 rounded-full bg-[#00e575] hover:bg-[#00ff83] text-black font-bold text-xs sm:text-sm active:scale-95 transition-all shadow-lg shadow-[#00e575]/20 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 fill-current" />
                    <span>أنشئ إعلانًا</span>
                  </button>
                </div>
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
      {/* 14. SECTION 11: MCP INTEGRATIONS & SKILLS PROTOCOL (Halai Parity) */}
      {/* ============================================================== */}
      <KubeMcpHubSection onOpenModal={() => setActiveStudioModal("mcp_hub")} />


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
        </>
      ) : currentStudioPage === "image_generate" ? (
        <HalaiImageGenerateSection
          onBackToStudio={() => navigateToStudio("studio_2")}
          onSendToStudio2={(prompt) => {
            setHeroPrompt(prompt);
            setHeroMode("video");
            navigateToStudio("studio_2");
          }}
        />
      ) : currentStudioPage === "video_generate" ? (
        <HalaiVideoGenerateSection
          onBackToStudio={() => navigateToStudio("studio_2")}
        />
      ) : (currentStudioPage === "characters" || currentStudioPage === "character_creator") ? (
        <HalaiCharactersSection
          onBackToStudio={() => navigateToStudio("studio_2")}
          onSelectCharacter={(name) => {
            setHeroPrompt(`فيديو إعلاني من بطولة ${name} في كافيه KUBE`);
            navigateToStudio("studio_2");
          }}
        />
      ) : (currentStudioPage === "storyboard" || currentStudioPage === "storyboard_studio") ? (
        <HalaiStoryboardSection
          onBackToStudio={() => navigateToStudio("studio_2")}
          onSendSceneToStudio2={(sc) => {
            setHeroPrompt(sc);
            navigateToStudio("studio_2");
          }}
        />
      ) : (currentStudioPage === "ads_studio" || currentStudioPage === "ads_9x") ? (
        <HalaiAdsStudioSection
          onBackToStudio={() => navigateToStudio("studio_2")}
          onSendAdToStudio2={(p) => {
            setHeroPrompt(p);
            navigateToStudio("studio_2");
          }}
        />
      ) : currentStudioPage === "library" ? (
        <HalaiLibrarySection
          onBackToStudio={() => navigateToStudio("studio_2")}
          onStartCreation={() => navigateToStudio("studio_2")}
        />
      ) : currentStudioPage === "cinema" ? (
        <HalaiCinemaSection
          onBackToStudio={() => navigateToStudio("studio_2")}
        />
      ) : (currentStudioPage === "pricing_plans" || currentStudioPage === "pricing") ? (
        <HalaiPricingSection
          onBackToStudio={() => navigateToStudio("studio_2")}
        />
      ) : (
        /* ============================================================== */
        /* STANDALONE STUDIO PAGE WORKSPACE (100% Halai Real Page Parity) */
        /* ============================================================== */
        <main className="w-full min-h-[calc(100dvh-3.5rem)] pt-14 md:pt-16 bg-[#121214] flex flex-col text-right">
          {/* Top Breadcrumb Bar with Back Navigation */}
          <div className="w-full bg-[#18191c] border-b border-white/10 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-14 md:top-16 z-30 backdrop-blur-md bg-opacity-95">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateToStudio("studio_2")}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs border border-white/10 active:scale-95 transition-all group"
              >
                <ArrowRight className="w-4 h-4 text-[#00e575] group-hover:-translate-x-1 transition-transform" />
                <span>العودة إلى استديو 2.0</span>
              </button>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-2 truncate">
                <span className="text-xs sm:text-sm font-black text-white truncate">
                  {(currentStudioPage === "storyboard" || currentStudioPage === "storyboard_studio") && "استديو الستوري بورد (Storyboard) — إخراج إعلاني من 4 مشاهد"}
                  {currentStudioPage === "ugc_studio" && "استديو UGC 2.0 — صناع محتوى سعوديين واقعيين"}
                  {currentStudioPage === "ads_9x" && "استديو الإعلانات 9x — حزمة الـ 9 زوايا التسويقية"}
                  {currentStudioPage === "product_3d" && "استديو المنتجات 3D — زوايا وإضاءة ثلاثية الأبعاد"}
                  {currentStudioPage === "character_creator" && "استديو الشخصيات — تثبيت ملامح الممثل والباريستا"}
                  {currentStudioPage === "shots_studio" && "استديو اللقطات — لقطات إعلانية سريعة بدقة 4K"}
                  {currentStudioPage === "mimic_motion" && "استديو محاكاة الحركة (Mimic Motion) — ريندر سينمائي 60fps"}
                  {currentStudioPage === "super_agent" && "سوبر ايجنت KUBE — محادثة فورية وتوليد إعلانات"}
                  {currentStudioPage === "mcp_hub" && "اتصال MCP Hub — ربط المنصة مع Claude Desktop و Cursor"}
                  {currentStudioPage === "templates" && "تطبيقات وقوالب إعلانية جاهزة"}
                  {currentStudioPage === "promlog" && "بروملوق — بنك برومبتات كافيه KUBE"}
                  {currentStudioPage === "tutorials" && "شروحات وأكاديمية KUBE"}
                  {currentStudioPage === "pricing_plans" && "الباقات والاشتراكات"}
                  {currentStudioPage === "community" && "مجتمع مبدعي KUBE"}
                  {currentStudioPage === "models_api" && "كتالوج نماذج ومحركات الذكاء الاصطناعي (API)"}
                  {currentStudioPage === "providers_guide" && "دليل مفاتيح المزودين ومستودعات الربط (API Keys Guide)"}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 font-mono shrink-0">
                  صفحة مستقلة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast.success("تم نسخ رابط الصفحة المباشر!");
                }}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 border border-white/5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مشاركة الرابط</span>
              </button>
            </div>
          </div>

          {/* Standalone Page Workspace Body Container */}
          <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 space-y-6">
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

                  {/* Google AI Studio Active Connector Card */}
                  <div className="p-5 rounded-2xl border-2 border-[#ff2a4b]/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                          G
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-white">Google AI Studio (Gemini)</h4>
                            {activeGoogleKey ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                                متصل ولايف
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                جاهز للربط الفوري
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">محرك السوبر ايجنت وكتابة السكريبتات وتوليد الأفكار الإعلانية من قوقل</p>
                        </div>
                      </div>

                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-bold self-start sm:self-auto"
                      >
                        <span>لوحة مفاتيح Google AI Studio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 block">
                        أدخل مفتاح الـ API الخاص بـ Google AI Studio:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="password"
                          value={googleStudioKeyInput}
                          onChange={(e) => setGoogleStudioKeyInput(e.target.value)}
                          placeholder="AIzaSy..."
                          className="flex-1 bg-black/70 border border-white/10 focus:border-[#ff2a4b] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                          dir="ltr"
                        />
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={handleSaveAndTestGoogleKey}
                            disabled={isTestingGoogleKey}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a4b] to-[#c21430] hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#ff2a4b]/20 disabled:opacity-50"
                          >
                            {isTestingGoogleKey ? (
                              <span>جاري التحقق...</span>
                            ) : (
                              <>
                                <Zap className="w-3.5 h-3.5" />
                                <span>حفظ وتفعيل لايف</span>
                              </>
                            )}
                          </button>
                          {activeGoogleKey && (
                            <button
                              onClick={handleClearGoogleKey}
                              className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-red-400 text-xs font-bold transition-colors"
                              title="مسح المفتاح"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500">
                        يتم حفظ المفتاح في متصفحك وسيرفر التطبيق لتفعيل التوليد المباشر في سوبر ايجنت واستوديوهات التسويق فوراً.
                      </p>
                    </div>
                  </div>

                  {/* OpenAI Active Connector Card */}
                  <div className="p-5 rounded-2xl border-2 border-[#10a37f]/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                          O
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-white">OpenAI (GPT-4o & Halai Typography)</h4>
                            {activeOpenAiKey ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                                متصل ولايف
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                جاهز للربط الفوري
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">محرك هلاي الأساسي للتايبوجرافي العربي وطباعة النصوص على الصور والإعلانات</p>
                        </div>
                      </div>

                      <a
                        href="https://platform.openai.com/settings/organization/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-bold self-start sm:self-auto"
                      >
                        <span>لوحة مفاتيح OpenAI</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 block">
                        أدخل مفتاح OpenAI API Key:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="password"
                          value={openAiKeyInput}
                          onChange={(e) => setOpenAiKeyInput(e.target.value)}
                          placeholder="sk-proj-..."
                          className="flex-1 bg-black/70 border border-white/10 focus:border-[#10a37f] rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                          dir="ltr"
                        />
                        <button
                          onClick={handleSaveAndTestOpenAiKey}
                          disabled={isTestingOpenAiKey}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {isTestingOpenAiKey ? "جاري التحقق..." : "حفظ وتفعيل لايف"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fal.ai Active Connector Card */}
                  <div className="p-5 rounded-2xl border-2 border-purple-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                          F
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-white">Fal.ai Unified Engine (Flux & Kling)</h4>
                            {activeFalKey ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                                متصل ولايف
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                جاهز للربط الفوري
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">محرك توليد الفيديو الواقعي Kling وفوتوغرافيا المنتجات 4K عبر Fal</p>
                        </div>
                      </div>

                      <a
                        href="https://fal.ai/dashboard/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-bold self-start sm:self-auto"
                      >
                        <span>لوحة مفاتيح Fal.ai</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 block">
                        أدخل مفتاح Fal Key:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="password"
                          value={falKeyInput}
                          onChange={(e) => setFalKeyInput(e.target.value)}
                          placeholder="fal_key_..."
                          className="flex-1 bg-black/70 border border-white/10 focus:border-purple-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                          dir="ltr"
                        />
                        <button
                          onClick={handleSaveAndTestFalKey}
                          disabled={isTestingFalKey}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {isTestingFalKey ? "جاري التحقق..." : "حفظ وتفعيل لايف"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ElevenLabs Active Connector Card */}
                  <div className="p-5 rounded-2xl border-2 border-amber-500/40 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black space-y-4 shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 flex items-center justify-center text-white text-lg font-black shadow-lg">
                          11
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-sm sm:text-base text-white">ElevenLabs (Saudi Voiceovers)</h4>
                            {activeElevenLabsKey ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00e575] animate-ping" />
                                متصل ولايف
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                                جاهز للربط الفوري
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-zinc-400">توليد الأصوات والنبرات السعودية الطبيعية لمقاطع الـ UGC واللهجة النجدية</p>
                        </div>
                      </div>

                      <a
                        href="https://elevenlabs.io/app/settings/api-keys"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-bold self-start sm:self-auto"
                      >
                        <span>لوحة مفاتيح ElevenLabs</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-300 block">
                        أدخل مفتاح ElevenLabs API Key:
                      </label>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="password"
                          value={elevenLabsKeyInput}
                          onChange={(e) => setElevenLabsKeyInput(e.target.value)}
                          placeholder="xi-api-key-..."
                          className="flex-1 bg-black/70 border border-white/10 focus:border-amber-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none font-mono"
                          dir="ltr"
                        />
                        <button
                          onClick={handleSaveAndTestElevenLabsKey}
                          disabled={isTestingElevenLabsKey}
                          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md disabled:opacity-50"
                        >
                          {isTestingElevenLabsKey ? "جاري التحقق..." : "حفظ وتفعيل لايف"}
                        </button>
                      </div>
                    </div>
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
              {/* PAGE: STORYBOARD STUDIO WORKSPACE (Multi-Scene Sequence)      */}
              {/* ============================================================== */}
              {(currentStudioPage === "storyboard" || currentStudioPage === "storyboard_studio") && (
                <div className="space-y-6 text-right">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div>
                      <div className="flex items-center gap-2">
                        <Film className="w-5 h-5 text-[#ff2a4b]" />
                        <h4 className="font-black text-base sm:text-lg text-white">إخراج إعلاني متكامل من ٤ مشاهد</h4>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/40 font-mono">
                          STORYBOARD 2.0
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">تسلسل سينمائي مبني على هيكل التحويل التجاري السريع (Hook &rarr; Need &rarr; Craft &rarr; CTA)</p>
                    </div>
                    <button
                      onClick={() => handleCopy(JSON.stringify(selectedScript, null, 2), "السيناريو")}
                      className="self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs active:scale-95 transition-all flex items-center gap-1.5 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>نسخ تفاصيل الإخراج</span>
                    </button>
                  </div>

                  {/* Halai 2-Column Storyboard Layout: Right Controls Sidebar + Left Timeline Canvas */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Right Controls Panel (340px / 4 Cols on LG) */}
                    <div className="lg:col-span-4 bg-zinc-900/90 border border-white/10 rounded-3xl p-4 sm:p-5 space-y-4 shadow-xl">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white block">طريقة التوليد</label>
                        <div className="grid grid-cols-2 gap-2 p-1 bg-black/60 rounded-xl border border-white/5">
                          <button
                            type="button"
                            className="py-1.5 rounded-lg bg-[#ff2a4b] text-white text-xs font-black shadow"
                          >
                            توليد من نص
                          </button>
                          <button
                            type="button"
                            className="py-1.5 rounded-lg text-zinc-400 hover:text-white text-xs font-bold"
                          >
                            توليد من صورة
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-white block">نسبة العرض (Aspect Ratio)</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "16:9", label: "16:9 عريض" },
                            { id: "9:16", label: "9:16 طولي" },
                            { id: "1:1", label: "1:1 مربع" },
                          ].map((ar) => (
                            <button
                              key={ar.id}
                              type="button"
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                ar.id === "16:9"
                                  ? "bg-white/15 border-[#00e575] text-[#00e575]"
                                  : "bg-black/40 border-white/10 text-zinc-400 hover:text-white"
                              }`}
                            >
                              {ar.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-black text-white block">وصف القصة الإعلانية</label>
                        <textarea
                          rows={3}
                          defaultValue="قصة إعلانية سينمائية لكوب كولد برو كيني في مقهى KUBE بالرياض، تبدأ بكسر الثلج وتستمر بحوار شبابي وتنتهي بشعار الفرع."
                          className="w-full bg-black/70 border border-white/10 focus:border-[#ff2a4b] rounded-2xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none resize-none leading-relaxed"
                        />
                      </div>

                      {/* 4 Reference Image Slots */}
                      <div className="space-y-2">
                        <label className="text-xs font-black text-white block">مراجع المشاهد (٤ لقطات)</label>
                        <div className="grid grid-cols-4 gap-2">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="aspect-square rounded-xl bg-black/50 border border-dashed border-white/20 hover:border-[#ff2a4b] cursor-pointer flex flex-col items-center justify-center p-1 text-center transition-all group"
                              title={`إرفاق مرجع المشهد ${i}`}
                            >
                              <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white" />
                              <span className="text-[9px] font-mono text-zinc-500 group-hover:text-zinc-300">م{i}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          toast.info("جاري إرسال طلب التوليد لمحركات الفيديو السينمائية...");
                          setTimeout(() => toast.success("تم تحديث المشاهد الأربعة بنجاح!"), 1200);
                        }}
                        className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#ff2a4b] to-[#dc2626] hover:brightness-110 active:scale-95 text-white font-black text-xs transition-all shadow-lg shadow-[#ff2a4b]/25 flex items-center justify-center gap-2"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>توليد الستوري بورد (4 مشاهد)</span>
                      </button>
                    </div>

                    {/* Left Timeline Canvas Area (8 Cols on LG) */}
                    <div className="lg:col-span-8 space-y-4">
                      {/* 4 Sequential Scenes Breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
                            className="rounded-2xl border border-white/10 bg-zinc-900 p-4 space-y-3 flex flex-col justify-between hover:border-white/20 transition-all shadow-md"
                          >
                            <div className="space-y-2">
                              <div className="aspect-[16/10] w-full rounded-xl overflow-hidden bg-black relative group cursor-pointer">
                                <img src={s.thumb} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                                    <Play className="w-4 h-4 fill-white" />
                                  </div>
                                </div>
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

                      <div className="p-4 rounded-2xl bg-zinc-900 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                        <div>
                          <span className="text-xs font-bold text-white block">تصدير الستوري بورد كفيديو متسلسل</span>
                          <span className="text-[11px] text-zinc-400 block">سيقوم محرك KUBE بربط المشاهد الأربعة بنقلات سينمائية ناعمة Seamless Transitions</span>
                        </div>
                        <button
                          onClick={() => {
                            toast.info("جاري تصيير الستوري بورد كفيلم إعلاني 30 ثانية...");
                            setTimeout(() => toast.success("تم إتمام ريندر الفيديو الإعلاني كاملاً!"), 1000);
                          }}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#ff334b] to-[#dc2626] text-white font-black text-xs active:scale-95 shadow-md shadow-[#ff2a4b]/30"
                        >
                          توليد الفيلم الإعلاني كاملاً (30s)
                        </button>
                      </div>
                    </div>
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

              {/* MODAL: MCP & SKILLS HUB (Matching Halai Parity) */}
              {/* MODAL: MCP & SKILLS HUB (Matching Halai Parity) */}
              {activeStudioModal === "mcp_hub" && <KubeMcpModalContent />}

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
                <div className="space-y-5 text-right">
                  <div className="pb-3 border-b border-white/10">
                    <h3 className="text-base sm:text-lg font-black text-white">صمّم شخصيتك الإعلانية الافتراضية</h3>
                    <p className="text-xs text-zinc-400">اجعل الوجه نفسه بطل كل حملات وفيديوهات كافيه KUBE القادمة</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="text-[11px] sm:text-xs font-bold text-zinc-300 block">اسم الشخصية:</label>
                        <input
                          type="text"
                          defaultValue="سفير KUBE الجديد"
                          className="w-full h-10 px-3.5 text-xs bg-zinc-900/90 border border-white/10 rounded-xl focus:border-[#00e575] focus:ring-1 focus:ring-[#00e575] text-white transition-all outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] sm:text-xs font-bold text-zinc-300 block">الزي والمظهر:</label>
                        <select className="w-full h-10 px-3.5 text-xs bg-zinc-900/90 border border-white/10 rounded-xl focus:border-[#00e575] text-white transition-all outline-none cursor-pointer">
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
                        className="w-full h-10 sm:h-11 rounded-xl bg-[#00e575] hover:bg-[#00c966] text-black font-black text-xs transition-all shadow-md shadow-[#00e575]/20 active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <span>حفظ واستخدام الشخصية</span>
                        <Sparkles className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="max-h-60 sm:max-h-none aspect-[4/3] sm:aspect-[3/4] rounded-2xl overflow-hidden bg-black border border-white/10 flex items-center justify-center relative">
                      <img
                        src="https://media.hallah.ai/cdn-cgi/image/width=400,format=auto/cms/studios/ugc-2/characters/male/sultan.png"
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md text-[10px] text-zinc-300 font-mono">
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

              {/* PAGE: TEMPLATES CATALOG (100% Halai Real Page Parity) */}
              {currentStudioPage === "templates" && (
                <div className="space-y-8 text-right">
                  {/* Top Page Header */}
                  <div className="pb-4 border-b border-white/10 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00e575]/10 border border-[#00e575]/30 text-[#00e575] text-xs font-mono">
                          <LayoutGrid className="w-3.5 h-3.5" />
                          <span>CREATIVE TEMPLATES CATALOG • قالب إعلاني جاهز</span>
                        </div>
                        <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                          قوالب إعلانية جاهزة ومثبتة التحويل لكافيه KUBE
                        </h2>
                        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
                          اختر أي قالب بضغطة زر واحدة؛ سيتم نقل إعدادات الإخراج والبرومبت والمقاسات إلى استديو 2.0 مباشرة لتوليد الفيديو والصور فوراً.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
                          {TEMPLATES_ITEMS.filter((t) => {
                            const matchCat = templateCategoryFilter === "الكل" || t.cat === templateCategoryFilter;
                            const matchQ = !templateSearchQuery || t.title.includes(templateSearchQuery) || t.desc.includes(templateSearchQuery);
                            return matchCat && matchQ;
                          }).length}{" "}
                          قالب متوفر
                        </span>
                      </div>
                    </div>

                    {/* Filter Pills and Search Bar */}
                    <div className="pt-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                      {/* Category Pills */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {[
                          "الكل",
                          "مشروبات وقهوة",
                          "طعام وحلويات",
                          "عطور وتجميل",
                          "أزياء وعبايات",
                          "تيك توك UGC",
                          "عروض وتخفيضات",
                        ].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setTemplateCategoryFilter(cat)}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
                              templateCategoryFilter === cat
                                ? "bg-white text-black shadow-md shadow-white/10"
                                : "bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/5"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>

                      {/* Search Input */}
                      <div className="relative min-w-[220px]">
                        <input
                          type="text"
                          value={templateSearchQuery}
                          onChange={(e) => setTemplateSearchQuery(e.target.value)}
                          placeholder="ابحث في القوالب..."
                          className="w-full bg-black/60 border border-white/10 focus:border-[#00e575] rounded-xl px-3.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 16 Templates Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {TEMPLATES_ITEMS.filter((tmpl) => {
                      const matchCat = templateCategoryFilter === "الكل" || tmpl.cat === templateCategoryFilter;
                      const matchQ =
                        !templateSearchQuery ||
                        tmpl.title.includes(templateSearchQuery) ||
                        tmpl.desc.includes(templateSearchQuery) ||
                        tmpl.cat.includes(templateSearchQuery);
                      return matchCat && matchQ;
                    }).map((tmpl) => (
                      <div
                        key={tmpl.id}
                        className="group rounded-3xl border border-white/10 bg-[#151618] overflow-hidden flex flex-col justify-between shadow-xl hover:border-white/25 transition-all duration-300"
                      >
                        {/* Thumbnail Container */}
                        <div className="relative aspect-[4/3] w-full overflow-hidden bg-black">
                          <img
                            src={tmpl.img}
                            alt={tmpl.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                          {/* Top Badges */}
                          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md border border-white/10 text-[#00e575]">
                              {tmpl.engine}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-black/70 backdrop-blur-md text-zinc-300">
                              {tmpl.aspectRatio} • {tmpl.duration}
                            </span>
                          </div>

                          {/* Category Tag */}
                          <div className="absolute bottom-2.5 right-2.5">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#ff2a4b]/80 text-white backdrop-blur-md shadow-md">
                              {tmpl.cat}
                            </span>
                          </div>
                        </div>

                        {/* Content Body */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                          <div className="space-y-1.5">
                            <h3 className="text-sm font-black text-white group-hover:text-[#00e575] transition-colors line-clamp-1">
                              {tmpl.title}
                            </h3>
                            <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                              {tmpl.desc}
                            </p>
                          </div>

                          {/* Prompt Preview Snippet */}
                          <div className="p-2.5 rounded-xl bg-black/50 border border-white/5 space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 block">برومبت التوليد:</span>
                            <p className="text-[10px] text-zinc-300 font-sans line-clamp-2 leading-relaxed">
                              {tmpl.promptSample}
                            </p>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 flex items-center gap-2 border-t border-white/5">
                            <button
                              type="button"
                              onClick={() => {
                                setHeroPrompt(tmpl.promptSample);
                                setHeroAdType(tmpl.cat);
                                setHeroMode("video");
                                navigateToStudio("studio_2");
                                toast.success(`تم اختيار قالب: ${tmpl.title}`);
                              }}
                              className="flex-1 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-1.5"
                            >
                              <Wand2 className="w-3.5 h-3.5" />
                              <span>استخدم القالب</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(tmpl.promptSample);
                                toast.success("تم نسخ برومبت القالب بنجاح!");
                              }}
                              className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white flex items-center justify-center border border-white/5 transition-colors shrink-0"
                              title="نسخ البرومبت"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* PAGE: PROMLOG PROMPT BANK */}
              {currentStudioPage === "promlog" && (
                <div className="space-y-6 text-right">
                  <div className="pb-4 border-b border-white/10 space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>PROMLOG • بنك البرومبتات الفيروسية لكافيه KUBE</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      بروملوق — كتالوج الأوامر الإعلانية عالية التحويل
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                      تصفّح وانسخ برومبتات الفيديو والصور المصممة خصيصاً لمقاهي ومطاعم الرياض مع ضبط زوايا الكاميرا ومحركات Veo 3.1 و Kling و Midjourney.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {SAUDI_VISUAL_PROMPTS.map((p, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-zinc-900 border border-white/10 hover:border-white/25 transition-all space-y-3 flex flex-col justify-between"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-white">{p.title}</span>
                            <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-white/5">{p.category}</span>
                          </div>
                          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{p.promptAr}</p>
                          <p className="text-[11px] text-zinc-500 font-mono leading-relaxed line-clamp-2" dir="ltr">{p.promptEn}</p>
                        </div>
                        <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(p.promptAr);
                              toast.success("تم نسخ البرومبت العربي!");
                            }}
                            className="flex-1 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                          >
                            <Copy className="w-3 h-3" />
                            <span>نسخ البرومبت</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setHeroPrompt(p.promptAr);
                              navigateToStudio("studio_2");
                              toast.success("تم نقل البرومبت إلى استديو 2.0!");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#00e575] hover:brightness-110 text-black text-xs font-black transition-all"
                          >
                            تطبيق فوري
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

          {/* Standalone Page Footer */}
          <footer className="w-full border-t border-white/10 bg-[#0d0d0f] py-6 px-4 sm:px-8 mt-auto text-center text-xs text-zinc-500">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <img src="/kube-up-logo.png" alt="KUBE" className="h-5 w-auto object-contain rounded" />
                <span>KUBE AI Marketing Studio • منصة الإنتاج الإعلاني الذكي</span>
              </div>
              <button
                type="button"
                onClick={() => navigateToStudio("studio_2")}
                className="text-[#00e575] hover:underline font-bold"
              >
                العودة إلى استديو 2.0 الرئيسي
              </button>
            </div>
          </footer>
        </main>
      )}

      {/* ============================================================== */}
      {/* 17.5. HALAI 14 AD FORMATS MODAL (نافذة اختيار نوع الإعلان)     */}
      {/* ============================================================== */}
      {isFormatModalOpen && (
        <div
          onClick={() => setIsFormatModalOpen(false)}
          className="fixed inset-0 z-[100650] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg max-h-[85vh] rounded-3xl bg-[#1d1e21] border border-white/15 p-4 sm:p-5 text-right shadow-2xl flex flex-col space-y-3 overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <button
                type="button"
                onClick={() => setIsFormatModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">اختر نوع الإعلان</h3>
                <p className="text-[11px] text-zinc-400">14 نمطاً إعلانياً سينمائياً وتجارياً معتمداً</p>
              </div>
            </div>

            {/* 14 Formats 3-Column Grid */}
            <div className="grid grid-cols-3 gap-2 sm:gap-2.5 overflow-y-auto pr-1 pb-1 pt-1 scrollbar-thin">
              {HALAI_AD_FORMATS.map((fmt) => {
                const isSelected = heroAdType === fmt.name;
                return (
                  <button
                    key={fmt.id}
                    type="button"
                    onClick={() => {
                      setHeroAdType(fmt.name);
                      if (fmt.promptSample) {
                        setHeroPrompt(fmt.promptSample);
                      }
                      setIsFormatModalOpen(false);
                    }}
                    className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900 border text-right transition-all active:scale-95 flex flex-col justify-end p-2 ${
                      isSelected
                        ? "border-[#00e575] ring-2 ring-[#00e575]/40"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={fmt.img}
                      alt={fmt.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80";
                      }}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                    <span className="relative z-10 text-[11px] font-bold text-white truncate block">
                      {fmt.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 17.6. UNIVERSAL PRODUCT MODAL (نافذة منتجك - رفع ومكتبة حرة)  */}
      {/* ============================================================== */}
      {isProductUploadModalOpen && (
        <div
          onClick={() => setIsProductUploadModalOpen(false)}
          className="fixed inset-0 z-[100650] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl max-h-[90vh] rounded-3xl bg-[#1d1e21] border border-white/15 p-5 text-right shadow-2xl flex flex-col space-y-4 overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => setIsProductUploadModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-base font-black text-white">منتجك</h3>
                <p className="text-xs text-zinc-400">صورة أو مجموعة زوايا أو منتج جديد لأي علامة تجارية</p>
              </div>
            </div>

            {/* Segmented Navigation Tabs: رفع صورة / المكتبة / اسم مخصص */}
            <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-white/10 text-xs w-full">
              <button
                type="button"
                onClick={() => setProductModalTab("upload")}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  productModalTab === "upload" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                رفع صورة من جهازك
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab("library")}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  productModalTab === "library" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                المكتبة الجاهزة
              </button>
              <button
                type="button"
                onClick={() => setProductModalTab("custom")}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  productModalTab === "custom" ? "bg-zinc-800 text-white shadow" : "text-zinc-400 hover:text-white"
                }`}
              >
                اسم مخصص
              </button>
            </div>

            {/* Tab 1: Upload from Device */}
            {productModalTab === "upload" && (
              <div className="space-y-3 py-2">
                <input
                  type="file"
                  id="direct-product-file"
                  accept="image/*"
                  onChange={handleImageFileUpload}
                  className="hidden"
                />
                <label
                  htmlFor="direct-product-file"
                  className="w-full h-44 rounded-2xl border-2 border-dashed border-white/20 hover:border-[#00e575] bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] group text-center px-4"
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6 text-[#00e575]" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-white">
                    اضغط لرفع صورة أي منتج من جهازك
                  </span>
                  <span className="text-[11px] text-zinc-400">
                    عطور، أزياء، مطاعم، إلكترونيات، أو أي فكرة تجارية (PNG, JPG, WebP)
                  </span>
                </label>
              </div>
            )}

            {/* Tab 2: Sample Library */}
            {productModalTab === "library" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                {SAMPLE_PRODUCTS_CATALOG.map((prod) => (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => {
                      setHeroProduct(prod);
                      setIsProductUploadModalOpen(false);
                    }}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/10 hover:border-[#00e575] transition-all p-2 flex flex-col justify-end text-right active:scale-95"
                  >
                    <img
                      src={prod.img}
                      alt={prod.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                    <span className="relative z-10 text-[10px] font-bold text-white block truncate">
                      {prod.name}
                    </span>
                    <span className="relative z-10 text-[9px] text-[#00e575] font-mono">
                      {prod.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Tab 3: Custom Name / Brand */}
            {productModalTab === "custom" && (
              <div className="space-y-3 py-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-bold block">
                    اكتب اسم المنتج أو علامتك التجارية:
                  </label>
                  <input
                    type="text"
                    value={customProductName}
                    onChange={(e) => setCustomProductName(e.target.value)}
                    placeholder="مثال: عطر ليالي الشرق، أو ساعة ألترا، أو برجر ترافل..."
                    className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-white/10 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#00e575]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!customProductName.trim()) {
                      toast.error("يرجى كتابة اسم المنتج أولاً");
                      return;
                    }
                    setHeroProduct({
                      id: `custom-${Date.now()}`,
                      name: customProductName.trim(),
                      img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=400&q=80",
                      category: "مخصص",
                    });
                    setIsProductUploadModalOpen(false);
                    toast.success(`تم اعتماد المنتج: ${customProductName.trim()}`);
                  }}
                  className="w-full h-10 rounded-xl bg-[#00e575] hover:bg-[#00ff83] text-black font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                >
                  <Check className="w-4 h-4" />
                  <span>تثبيت اسم المنتج</span>
                </button>
              </div>
            )}

            {/* Bottom Actions: Remove Product if currently set */}
            {heroProduct && (
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-300 truncate max-w-[200px]">
                  المنتج الحالي: <strong className="text-white">{heroProduct.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setHeroProduct(null);
                    setIsProductUploadModalOpen(false);
                    toast.info("تمت إزالة المنتج — بإمكانك التوليد بحرية عبر وصف الفكرة فقط");
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all active:scale-95"
                >
                  إزالة المنتج (توليد بالنص فقط)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 17.7. MOBILE NEW AD BOTTOM SHEET (Matching Halai Mobile CTA)   */}
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
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center active:scale-95 transition-all"
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

            {/* Prompt Textarea */}
            <div className="p-3 rounded-2xl bg-zinc-900/90 border border-white/10">
              <textarea
                rows={3}
                value={heroPrompt}
                onChange={(e) => setHeroPrompt(e.target.value)}
                placeholder="صِف الإعلان الذي تريد إنشاءه…"
                className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-zinc-500 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* 3 Upload / Select Slots */}
            <div className="grid grid-cols-3 gap-2.5">
              {/* Product Slot */}
              <button
                type="button"
                onClick={() => setIsProductUploadModalOpen(true)}
                className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative overflow-hidden transition-all ${
                  heroProduct
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 bg-zinc-900/80 hover:border-white/30 text-zinc-300"
                }`}
              >
                {heroProduct ? (
                  <>
                    <img src={heroProduct.img} alt={heroProduct.name} className="w-full h-full object-cover rounded-xl" />
                    <span className="absolute bottom-1 inset-x-1 text-[8px] font-bold text-white bg-black/85 px-0.5 py-0.5 rounded truncate text-center">
                      {heroProduct.name}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                      +
                    </div>
                    <ImageIcon className="w-5 h-5 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-300">المنتج</span>
                  </>
                )}
              </button>

              {/* Character Slot */}
              <button
                type="button"
                onClick={() => setActiveStudioModal("ugc_studio")}
                className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative overflow-hidden transition-all ${
                  heroPersona
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 bg-zinc-900/80 hover:border-white/30 text-zinc-300"
                }`}
              >
                {heroPersona ? (
                  <>
                    <img src={heroPersona.avatar} alt={heroPersona.name} className="w-full h-full object-cover rounded-xl" />
                    <span className="absolute bottom-1 inset-x-1 text-[8px] font-bold text-white bg-black/85 px-0.5 py-0.5 rounded truncate text-center">
                      {heroPersona.name.split(" ")[0]}
                    </span>
                  </>
                ) : (
                  <>
                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                      +
                    </div>
                    <Users className="w-5 h-5 text-zinc-400" />
                    <span className="text-[10px] font-bold text-zinc-300">الشخصية</span>
                  </>
                )}
              </button>

              {/* Scene Slot */}
              <button
                type="button"
                onClick={() => {
                  setHeroScene(heroScene ? null : "استوديو سينمائي فاخر");
                }}
                className={`aspect-square rounded-2xl border p-2 flex flex-col items-center justify-center gap-1 cursor-pointer active:scale-95 relative transition-all ${
                  heroScene
                    ? "border-[#00e575] bg-[#00e575]/10 text-white"
                    : "border-white/10 bg-zinc-900/80 hover:border-white/30 text-zinc-300"
                }`}
              >
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white/10 text-white flex items-center justify-center text-[10px]">
                  {heroScene ? "✓" : "+"}
                </div>
                <Sparkles className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] font-bold text-zinc-300 truncate max-w-full px-1">
                  {heroScene ? "المشهد" : "المشهد"}
                </span>
              </button>
            </div>

            {/* Controls Row */}
            <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => setIsFormatModalOpen(true)}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center truncate font-bold text-zinc-200 active:scale-95"
              >
                {heroAdType || "اختر نوعًا"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const ratios: ("9:16" | "16:9" | "1:1" | "3:4")[] = ["9:16", "16:9", "1:1", "3:4"];
                  const next = (ratios.indexOf(heroAspect as any) + 1) % ratios.length;
                  setHeroAspect(ratios[next]);
                }}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-200 active:scale-95"
              >
                {heroAspect}
              </button>
              <button
                type="button"
                onClick={() => {
                  const res: ("480p" | "720p" | "1080p" | "4K")[] = ["480p", "720p", "1080p", "4K"];
                  const next = (res.indexOf(heroResolution as any) + 1) % res.length;
                  setHeroResolution(res[next]);
                }}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-200 active:scale-95"
              >
                {heroResolution}
              </button>
              <button
                type="button"
                onClick={() => {
                  const durs: ("10 ث" | "12 ث" | "15 ث" | "30 ث")[] = ["10 ث", "12 ث", "15 ث", "30 ث"];
                  const next = (durs.indexOf(heroDuration as any) + 1) % durs.length;
                  setHeroDuration(durs[next]);
                }}
                className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-center font-bold text-zinc-200 active:scale-95"
              >
                {heroDuration}
              </button>
            </div>

            {/* Helper text */}
            <div className="text-center text-[11px] text-zinc-400">
              اختر نوع الإعلان لتبدأ
            </div>

            {/* Action button */}
            <button
              type="button"
              disabled={isGeneratingHeroAd}
              onClick={handleHeroAdGenerate}
              className="w-full py-3.5 rounded-2xl bg-[#00e575] hover:bg-[#00ff83] text-black font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#00e575]/25"
            >
              {isGeneratingHeroAd ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-zinc-900 border-t-transparent animate-spin" />
                  <span>جاري الإنشاء...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>إنشاء الإعلان</span>
                </>
              )}
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
