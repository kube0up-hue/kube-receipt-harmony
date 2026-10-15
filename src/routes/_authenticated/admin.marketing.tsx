import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import {
  Sparkles,
  Megaphone,
  Share2,
  Calendar,
  Copy,
  Check,
  Send,
  TrendingUp,
  Image as ImageIcon,
  Tag,
  MessageSquare,
  Flame,
  Coffee,
  Plus,
  ExternalLink,
  ChevronLeft,
  Filter,
  Search,
  SlidersHorizontal,
  Camera,
  Layers,
  Wand2,
  Download,
  CheckCircle2,
  Clock,
  Trash2,
  Eye,
  Zap,
  Bot,
  Video,
  Sun,
  Palette,
  Users,
  Smartphone,
  Play,
  Volume2,
  Film,
  Radio,
  ArrowRight,
  ShieldCheck,
  Award,
  RefreshCw,
  Maximize2,
  Globe,
  Sliders,
  X,
  Mic,
  Code,
  FolderOpen,
  Folder,
  Diamond,
  Bell,
  HelpCircle,
  Menu as MenuIcon,
  ShoppingBag,
  Cpu,
  Share,
} from "lucide-react";
import { toast } from "sonner";
import {
  BrandPersona,
  SocialCategory,
  SocialChannel,
  SocialPostTemplate,
  VisualCategory,
  VisualPromptTemplate,
  TrendCampaignPlaybook,
  SAUDI_SOCIAL_POSTS,
  SAUDI_VISUAL_PROMPTS,
  SAUDI_TREND_PLAYBOOKS,
  SAUDI_UGC_FORMATS,
  SAUDI_CREATOR_PERSONAS,
  KUBE_PRODUCT_STUDIO_PRESETS,
  KUBE_VIDEO_SCRIPTS,
  KUBE_BRAND_KIT,
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
      { title: "KUBE AI Studio — مركز التسويق والذكاء الاصطناعي (نمط هلاي)" },
      {
        name: "description",
        content:
          "استوديو الذكاء الاصطناعي التوليدي لكافيه KUBE المطابق لمنصة هلاي (Hallah.ai): سوبر ايجنت، استوديو منتجات ثلاثي الأبعاد، شخصيات UGC، وكتالوج نماذج Kling, Veo, WanX, Flux.",
      },
      { property: "og:title", content: "KUBE AI Studio — مركز التسويق والذكاء الاصطناعي" },
      { property: "og:description", content: "استوديو توليد المحتوى والإعلانات البصرية والترندات بالذكاء الاصطناعي." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["ai_studio_use", "reports_export", "orders_view"]}>
      <MarketingHubPage />
    </PermissionGuard>
  ),
});

type TabType =
  | "super_agent"
  | "product_studio"
  | "ugc_studio"
  | "ads_studio"
  | "templates"
  | "ai_models"
  | "mcp_connectors"
  | "library"
  | "campaigns";

interface CampaignItem {
  id: string;
  name: string;
  platform: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "draft";
  budget?: string;
  target?: string;
}

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: "c-1",
    name: "عرض الصباح الباكر — فلات وايت مع كرواسون لوز",
    platform: "إنستغرام + X",
    discount: "كومبو 18 ريال حتى 11 ص",
    startDate: "2026-10-15",
    endDate: "2026-10-31",
    status: "active",
    budget: "1,500 ريال",
    target: "موظفو المكاتب في شمال الرياض",
  },
  {
    id: "c-2",
    name: "إطلاق محصول إثيوبيا قوجي V60 الفاخر",
    platform: "تيك توك + سناب شات",
    discount: "كوب تذوق مجاني مع كل باقة بن",
    startDate: "2026-10-18",
    endDate: "2026-10-25",
    status: "scheduled",
    budget: "2,200 ريال",
    target: "متذوقو القهوة المختصة",
  },
  {
    id: "c-3",
    name: "رسائل ولاء عملاء KUBE المميزين",
    platform: "SMS & Push Notifications",
    discount: "كود: KUBELOVE (خصم 20%)",
    startDate: "2026-10-12",
    endDate: "2026-10-22",
    status: "active",
    budget: "800 ريال",
    target: "العملاء الذين سجلوا أكثر من 5 زيارات",
  },
];

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  formatTag?: string;
}

function MarketingHubPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const backHomeUrl = primaryRoleHome(currentUser.data?.roles ?? []);

  // Top banner dismiss state
  const [showTopDiscountBanner, setShowTopDiscountBanner] = useState(true);
  const [showMimicBanner, setShowMimicBanner] = useState(true);

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<TabType>("super_agent");

  // Mobile sidebar toggle for Super Agent
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // ==========================================
  // Tab 1: Super Agent States (Hallah Layout)
  // ==========================================
  const [selectedUgcFormat, setSelectedUgcFormat] = useState<UgcFormat | null>(SAUDI_UGC_FORMATS[0]);
  const [agentInputText, setAgentInputText] = useState("");
  const [selectedAgentEngine, setSelectedAgentEngine] = useState("تلقائي (Omni Flash 1.1)");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-0",
      sender: "agent",
      text: "أهلاً بك زياد في سوبر ايجنت KUBE! ☕️⚡️\nأنا وكيلك الذكي المدرب على ثقافة الرياض، نبرة برق و STC، وأناقة القهوة المختصة. اختر أي صيغة UGC أو اطلب ما تريد وسأصيغ لك محتوى إعلاني جاهز للإنتاج فوراً.",
      timestamp: "الآن",
    },
  ]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);

  // Super Agent Sidebar Active Item
  const [superAgentSection, setSuperAgentSection] = useState<"chat" | "skills" | "connectors" | "identity">("chat");

  // ==========================================
  // Tab 2: 3D Product Studio States (Hallah Layout)
  // ==========================================
  const [selectedStudioPreset, setSelectedStudioPreset] = useState<ProductStudioPreset>(
    KUBE_PRODUCT_STUDIO_PRESETS[0],
  );
  const [lightingDirection, setLightingDirection] = useState<"top" | "front" | "right" | "left" | "rim_back" | "bottom">(
    "front",
  );
  const [lightingIntensity, setLightingIntensity] = useState<"soft_diffused" | "harsh_sunlight">("soft_diffused");
  const [generationQuality, setGenerationQuality] = useState<"standard" | "hd_pro">("standard");
  const [productAspectRatio, setProductAspectRatio] = useState<"1:1" | "4:5" | "9:16" | "3:4" | "4:3" | "16:9">("1:1");
  const [outputLanguage, setOutputLanguage] = useState<"ar" | "en" | "both">("both");
  const [productUrlInput, setProductUrlInput] = useState("");
  const [hasGeneratedProduct, setHasGeneratedProduct] = useState(false);
  const [isGeneratingProduct, setIsGeneratingProduct] = useState(false);

  // ==========================================
  // Tab 3: UGC 2.0 Studio States (Hallah 3-Step)
  // ==========================================
  const [ugcStep, setUgcStep] = useState<1 | 2 | 3>(1);
  const [selectedCreator, setSelectedCreator] = useState<SaudiCreatorPersona>(SAUDI_CREATOR_PERSONAS[0]);
  const [creatorGenderFilter, setCreatorGenderFilter] = useState<"all" | "male" | "female">("all");
  const [ugcEmotion, setUgcEmotion] = useState("روقان وهدوء مع لمسة ذكاء");
  const [ugcDialect, setUgcDialect] = useState("لهجة نجدية سريعة ومحببة (الرياض)");
  const [activeScriptTemplate, setActiveScriptTemplate] = useState<VideoScriptTemplate>(KUBE_VIDEO_SCRIPTS[0]);
  const [customScriptGoal, setCustomScriptGoal] = useState("إبراز نكهة الفلات وايت والكرواسون في الصباح الباكر");
  const [generatedScriptOutput, setGeneratedScriptOutput] = useState<string | null>(null);
  const [isGeneratingUgc, setIsGeneratingUgc] = useState(false);

  // ==========================================
  // Tab 4: Ads Studio (9-Pack)
  // ==========================================
  const [adsProductTitle, setAdsProductTitle] = useState("كوب كولد برو كيني مركز");
  const [adsCampaignType, setAdsCampaignType] = useState<"product" | "service">("product");
  const [generated9Pack, setGenerated9Pack] = useState<Array<{ title: string; prompt: string; tag: string }> | null>(
    null,
  );
  const [isGenerating9Pack, setIsGenerating9Pack] = useState(false);

  // ==========================================
  // Tab 5: Templates (Hallah Templates Layout)
  // ==========================================
  const [templateFilter, setTemplateFilter] = useState("الكل");
  const [templateSearch, setTemplateSearch] = useState("");

  // ==========================================
  // Tab 6: AI Models API Hub
  // ==========================================
  const [selectedModelForApi, setSelectedModelForApi] = useState<AiModelEngine>(HALAI_AI_MODELS_CATALOG[0]);
  const [copiedCodeSnippet, setCopiedCodeSnippet] = useState(false);

  // ==========================================
  // Tab 7: MCP Connectors States
  // ==========================================
  const [customMcpUrl, setCustomMcpUrl] = useState("");
  const [connectedMcpServers, setConnectedMcpServers] = useState([
    { id: "salla", name: "متجر سلة (Salla Store MCP)", status: "connected", ping: "42ms" },
    { id: "kube-pos", name: "كاشير KUBE Kitchen POS", status: "connected", ping: "12ms" },
    { id: "zid", name: "متجر زد (Zid MCP Server)", status: "standby", ping: "—" },
  ]);

  // ==========================================
  // Tab 8: Library States
  // ==========================================
  const [librarySubTab, setLibrarySubTab] = useState<"posts" | "prompts" | "playbooks">("posts");
  const [librarySearch, setLibrarySearch] = useState("");
  const [copiedLibraryId, setCopiedLibraryId] = useState<string | null>(null);

  // ==========================================
  // Tab 9: Campaigns Tracker States
  // ==========================================
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kube_marketing_campaigns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return INITIAL_CAMPAIGNS;
  });
  const [showAddCampModal, setShowAddCampModal] = useState(false);
  const [newCampName, setNewCampName] = useState("");
  const [newCampDiscount, setNewCampDiscount] = useState("");

  // Copy helper
  const handleCopy = (text: string, id: string, label = "المحتوى") => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} بنجاح!`);
    setCopiedLibraryId(id);
    setTimeout(() => setCopiedLibraryId(null), 2500);
  };

  // Filtered Creators
  const filteredCreators = useMemo(() => {
    if (creatorGenderFilter === "all") return SAUDI_CREATOR_PERSONAS;
    return SAUDI_CREATOR_PERSONAS.filter((c) => c.gender === creatorGenderFilter);
  }, [creatorGenderFilter]);

  // Filtered Social Posts
  const filteredSocialPosts = useMemo(() => {
    return SAUDI_SOCIAL_POSTS.filter((post) => {
      if (librarySearch.trim()) {
        const query = librarySearch.toLowerCase();
        const matchText = (post.text ?? "").toLowerCase().includes(query);
        const matchHook = (post.hookHeadline ?? "").toLowerCase().includes(query);
        if (!matchText && !matchHook) return false;
      }
      return true;
    });
  }, [librarySearch]);

  // Filtered Prompts
  const filteredPrompts = useMemo(() => {
    return SAUDI_VISUAL_PROMPTS.filter((p) => {
      if (librarySearch.trim()) {
        const query = librarySearch.toLowerCase();
        const matchTitle = (p.title ?? "").toLowerCase().includes(query);
        const matchAr = (p.arabicPrompt ?? "").toLowerCase().includes(query);
        const matchEn = (p.englishPrompt ?? "").toLowerCase().includes(query);
        if (!matchTitle && !matchAr && !matchEn) return false;
      }
      return true;
    });
  }, [librarySearch]);

  // Super Agent Send Message
  const handleSendAgentMessage = (textToSend?: string) => {
    const text = textToSend || agentInputText.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: "الآن",
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setAgentInputText("");
    setIsAgentTyping(true);

    setTimeout(() => {
      let reply = "";
      if (text.includes("شوكولاتة") || text.includes("شعار")) {
        reply = `تم تطبيق صيغة [شوكولاتة وشعار KUBE] الفاخرة! 🍫\n\n📌 سكريبت الإعلان الموصى به:\n"فخامة الشوكولاتة البلجيكية بطباعة شعار KUBE البارز، رشة ملح بحري مع قهوة V60 دافئة تليق بضيافتك الفاخرة."\n\n📸 برومبت التصوير (Flux / Kling):\nMacro studio shot of artisanal square chocolate stamped with glossy embossed KUBE logo, resting on matte black Nero Marquina marble, delicate sea salt flakes, warm 3000K amber spotlight, 8k.\n\n⚡️ أفضل وقت للنشر: 4:00 عصراً (وقت حلى المساء والجمعات).`;
      } else if (text.includes("أكياس") || text.includes("تسوق")) {
        reply = `تم تطبيق صيغة [أكياس تسوق وبن KUBE] 🛍️☕️\n\n📌 سكريبت الإعلان:\n"من المزرعة الإثيوبية لقوجي مباشرة لكيس KUBE الأسود المطفي.. نقاء التحميص اللي يثبت بالرأس من أول ما تفتح الصمام وتشم الرائحة."\n\n📸 برومبت التوليد (Kling / Veo):\nEditorial still of elegant matte black KUBE coffee bean bags in modern paper tote bag, carried by Saudi customer walking down King Fahd road modern architecture, crisp daylight, 4k.`;
      } else if (text.includes("مستخدمون") || text.includes("سعداء")) {
        reply = `صيغة [مستخدمون وضيوف سعداء في KUBE] 🤳🖤\n\n📌 سكريبت السيلفي العفوي:\n"أنا وصاحبي لما طلبنا دبل شوت كولد برو ولقينا الفرع مشغل لستة روقان.. يومنا بدأ من هنا خلاص! مر KUBE وعط يومك طاقة."\n\n📸 زاوية الكاميرا: كاميرا أمامية iPhone 16 Pro مع إضاءة شمس الرياض الدافئة وبسمة طبيعية 100%.`;
      } else {
        reply = `بناءً على طلبك (${text}) وهوية KUBE:\n\n🔥 السكريبت الفيروسي المقترح:\n"وضعك الحين وأنت تفكر بالدوام؟ 🥱 روقان الصباح في KUBE مجهز لك فلات وايت مع كرواسون لوز يطير النوم ويخلي يومك بالصدارة ⚡️🖤"\n\n📸 البرومبت البصري:\nCinematic 85mm portrait of steaming ceramic KUBE cup on beige travertine stone, morning light rays, crisp micro-foam tulip art, high luxury aesthetic, 8k.`;
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: "agent",
        text: reply,
        timestamp: "الآن",
      };

      setChatMessages((prev) => [...prev, agentMsg]);
      setIsAgentTyping(false);
    }, 700);
  };

  // Generate 9-Pack Handler
  const handleGenerate9Pack = () => {
    setIsGenerating9Pack(true);
    setTimeout(() => {
      const prod = adsProductTitle.trim() || "قهوة KUBE المختصة";
      const pack = [
        {
          title: "1. لقطة بطل المنتج (Hero Centerpiece)",
          tag: "1:1 Square",
          prompt: `Commercial hero shot of ${prod} centered on sleek black Nero Marquina marble, delicate amber rim lighting, pristine condensation, razor-sharp focus, 8k commercial food photography.`,
        },
        {
          title: "2. لقطة السكب والحركة (Action Pour & Crema)",
          tag: "9:16 Story",
          prompt: `Dynamic close-up action shot of silky textured milk swirling into espresso crema for ${prod}, micro-droplets in air, slow-motion freeze aesthetic, warm volumetric sunlight.`,
        },
        {
          title: "3. لقطة الموديل السعودي (Saudi Hand & Lifestyle)",
          tag: "4:5 Feed",
          prompt: `Saudi youth wearing luxury modern wristwatch holding a takeaway cup of ${prod}, modern minimalist Riyadh architectural concrete cafe backdrop, ultra-authentic.`,
        },
        {
          title: "4. لقطة العرض والخصم الحصري (Promo Visual)",
          tag: "1:1 Square",
          prompt: `Studio product flat lay of ${prod} next to fresh buttery almond croissants, soft diffused top lighting, minimalist typography badge placeholder, high conversion rate ad visual.`,
        },
        {
          title: "5. لقطة روتين الصباح والدوام (Morning Commute)",
          tag: "9:16 Story",
          prompt: `Cozy 7 AM morning car interior aesthetic with ${prod} in vehicle console, golden Riyadh sunrise rays through windscreen, feeling of high energy and fresh motivation.`,
        },
        {
          title: "6. لقطة الشارع والرياض العصرية (Urban Street Style)",
          tag: "9:16 Story",
          prompt: `Fashion-forward street style photo of customer walking alongside contemporary glass towers in Riyadh carrying ${prod}, natural candid motion blur in background.`,
        },
        {
          title: "7. لقطة الحبوب والإيحاءات الحسية (Raw Sensory Beans)",
          tag: "1:1 Square",
          prompt: `Macro shot of freshly roasted single-origin Ethiopian coffee beans spilling around a transparent glass of ${prod}, hints of jasmine and dried berries, rich organic textures.`,
        },
        {
          title: "8. لقطة البساطة والجمال المعماري (Minimalist Space)",
          tag: "16:9 Banner",
          prompt: `Architectural wide angle of a clean concrete and beige travertine table with single ${prod} cup, soft shadows, Nothing-inspired minimalist brand identity, serene calm mood.`,
        },
        {
          title: "9. لقطة الأصدقاء والمشاركة (Social Hangout)",
          tag: "4:5 Feed",
          prompt: `Joyful Saudi friends sitting at an outdoor terrace in Riyadh enjoying cups of ${prod} with laughter, evening twilight glow, warm communal coffee culture celebration.`,
        },
      ];

      setGenerated9Pack(pack);
      setIsGenerating9Pack(false);
      toast.success("تم توليد باقة الـ 9 صور إعلانية عالية التحويل بنجاح!");
    }, 800);
  };

  // Generate UGC Script Handler
  const handleGenerateUgcScript = () => {
    setIsGeneratingUgc(true);
    setTimeout(() => {
      const creator = selectedCreator.name;
      const script = `🎬 [سكريبت فيديو UGC مدته 30 ثانية — تم إنتاجه بواسطة KUBE Studio]:

👤 صانع المحتوى المختار: ${creator} (${selectedCreator.role})
☕️ المنتج المستهدف: ${selectedCreator.favoriteKubeDrink}
🗣 اللهجة والمشاعر: ${ugcDialect} — ${ugcEmotion}

---------------------------------------------------
📍 المشهد الأول: Hook البداية (0 - 4 ثوانٍ)
• الكاميرا: سيلفي زاوية قريبة Eye-level، حركة سريعة للداخل.
• الحركة: ${creator} يرفع كوب KUBE للعدسة بابتسامة صدمة مبهجة.
• التعليق الصوتي (${creator}): "${selectedCreator.sampleHook}"
• المؤثرات الصوتية: صوت طقطقة الثلج الصافي + Whoosh سريع.

---------------------------------------------------
📍 المشهد الثاني: التجربة وقوام المنتج (4 - 22 ثانية)
• الكاميرا: ماكرو سينمائي 85mm مع سكب الحليب أو رشفة متأنية.
• الحركة: استعراض تفاصيل اللاتيه آرت أو طبقات القهوة المثلجة مع قرمشة الكرواسون المورق.
• التعليق الصوتي (${creator}): "طعم البن الإثيوبي هنا فاكهي متوازن بدون أي حموضة مزعجة.. وقرمشة الكرواسون هشة وخفيفة كأنك بباريس بس بنكهة الرياض!"
• المؤثرات الصوتية: صوت رشفة القهوة + تكسير السكر المقرمش (ASMR نقي).

---------------------------------------------------
📍 المشهد الثالث: العرض والـ CTA (22 - 30 ثانية)
• الكاميرا: زاوية واسعة هادئة مع تلويحة باليد وإظهار شاشة الهاتف.
• الحركة: ${creator} يبتسم ويشير لأسفل الشاشة نحو رابط الطلب المسبق.
• التعليق الصوتي (${creator}): "الحق على عرض الصباح بـ 18 ريال بس، اطلب من تطبيق KUBE واستلم بدون ما توقف بالزحمة!"
• النص على الشاشة: [كود: KUBE20 | خصم 20% | رابط التطبيق بالبايو]`;

      setGeneratedScriptOutput(script);
      setIsGeneratingUgc(false);
      setUgcStep(3);
      toast.success("تم توليد سكريبت الفيديو بنجاح!");
    }, 700);
  };

  // Product Studio Generate Simulation
  const handleProductStudioGenerate = () => {
    setIsGeneratingProduct(true);
    setTimeout(() => {
      setIsGeneratingProduct(false);
      setHasGeneratedProduct(true);
      toast.success("تمت معالجة جلسة التصوير الافتراضية بنجاح 3D!");
    }, 900);
  };

  return (
    <AppShell>
      {/* Studio Master Container - Dark Studio Canvas like Hallah.ai */}
      <div className="min-h-screen bg-[#121212] text-zinc-100 font-sans -m-4 md:-m-6 p-3 md:p-6 space-y-4">
        {/* ============================================================== */}
        {/* 1. TOP PROMOTIONAL BANNER (Like Hallah.ai Green Top Banner)     */}
        {/* ============================================================== */}
        {showTopDiscountBanner && (
          <div className="relative rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 px-4 py-2 text-black font-semibold text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-black px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                AGENT
              </span>
              <span>خصم -١٥٪ على باقات KUBE AI السنوية للشركات وكافيهات الرياض</span>
            </div>
            <button
              onClick={() => setShowTopDiscountBanner(false)}
              className="text-black/80 hover:text-black p-1 text-sm font-bold"
              title="إغلاق"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. HALLAH-STYLE STUDIO HEADER & NAVBAR                          */}
        {/* ============================================================== */}
        <header className="rounded-2xl border border-zinc-800 bg-[#18181b]/90 backdrop-blur-xl p-3 md:p-4 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Right: Brand Logo & ERP Navigation */}
            <div className="flex items-center justify-between lg:justify-start gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg shadow-emerald-500/20 text-white font-black text-base border border-emerald-400/40">
                  K
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black tracking-wider text-white">KUBE</span>
                    <span className="text-emerald-400 font-bold text-sm">هلاي ستوديو</span>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.2 text-[9px] font-bold text-emerald-400 font-mono">
                      v2.0
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 block">منظومة الذكاء الاصطناعي التوليدي لكافيه KUBE</span>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                className="lg:hidden p-2 rounded-xl bg-zinc-800/80 text-zinc-200 border border-zinc-700"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Center Navigation Pills (Exact Hallah.ai Structure) */}
            <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none text-xs">
              <button
                onClick={() => setActiveTab("super_agent")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "super_agent"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Bot className="h-3.5 w-3.5" />
                سوبر ايجنت
                <span className="rounded-full bg-black/20 px-1.5 py-0.2 text-[9px] font-black">جديد</span>
              </button>

              <button
                onClick={() => setActiveTab("product_studio")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "product_studio"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                استديو المنتجات
                <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.2 text-[9px] text-emerald-300">3D</span>
              </button>

              <button
                onClick={() => setActiveTab("ugc_studio")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "ugc_studio"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Video className="h-3.5 w-3.5" />
                استديو UGC 2.0
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] text-amber-300">شخصيات</span>
              </button>

              <button
                onClick={() => setActiveTab("ads_studio")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "ads_studio"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                استديو الإعلانات
                <span className="rounded-full bg-red-500/20 px-1.5 py-0.2 text-[9px] text-red-300">9x رائج</span>
              </button>

              <button
                onClick={() => setActiveTab("templates")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "templates"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <ShoppingBag className="h-3.5 w-3.5" />
                تطبيقات وقوالب
              </button>

              <button
                onClick={() => setActiveTab("ai_models")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "ai_models"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Cpu className="h-3.5 w-3.5" />
                المحركات ونماذج API
                <span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[9px] text-blue-300">12+</span>
              </button>

              <button
                onClick={() => setActiveTab("mcp_connectors")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "mcp_connectors"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Radio className="h-3.5 w-3.5" />
                اتصال MCP
                <span className="rounded-full bg-purple-500/20 px-1.5 py-0.2 text-[9px] text-purple-300">BETA</span>
              </button>

              <button
                onClick={() => setActiveTab("library")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "library"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Folder className="h-3.5 w-3.5" />
                المكتبة والبرومبت
              </button>

              <button
                onClick={() => setActiveTab("campaigns")}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-bold whitespace-nowrap transition-all ${
                  activeTab === "campaigns"
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/30"
                    : "bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                الحملات ({campaigns.length})
              </button>
            </nav>

            {/* Left: User Profile & Quick Actions */}
            <div className="flex items-center gap-2.5 self-end lg:self-auto text-xs">
              <Link
                to={backHomeUrl}
                className="inline-flex items-center gap-1 rounded-xl bg-zinc-800 px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
                title="العودة لنظام إدارة KUBE"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                الرئيسية
              </Link>

              <div className="flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-black font-black text-xs">
                  ز
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-white block">زياد عيسى</span>
                  <span className="text-[9px] font-mono text-emerald-400 block font-semibold">غير محدود • Enterprise</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============================================================== */}
        {/* VIEW 1: SUPER AGENT (1:1 Exact Match with Hallah Super Agent)   */}
        {/* ============================================================== */}
        {activeTab === "super_agent" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Right Sidebar (Navigation & History) */}
            <aside
              className={`lg:col-span-3 rounded-2xl border border-zinc-800 bg-[#18181b] p-4 flex flex-col justify-between space-y-6 ${
                showMobileSidebar ? "block" : "hidden lg:flex"
              }`}
            >
              <div className="space-y-4">
                {/* Super Agent Dropdown */}
                <div className="flex items-center justify-between rounded-xl bg-zinc-900/90 border border-zinc-800 p-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-md bg-emerald-500 flex items-center justify-center text-black font-black text-[10px]">
                      H
                    </div>
                    <span className="text-xs font-bold text-white">سوبر ايجنت KUBE</span>
                  </div>
                  <ChevronLeft className="h-4 w-4 text-zinc-500 rotate-270" />
                </div>

                {/* New Chat Button */}
                <button
                  onClick={() => {
                    setChatMessages([
                      {
                        id: `msg-${Date.now()}`,
                        sender: "agent",
                        text: "بدأنا محادثة جديدة! ☕️ وش حاب نصمم أو نكتب لك اليوم في KUBE؟",
                        timestamp: "الآن",
                      },
                    ]);
                    toast.success("تم بدء محادثة جديدة");
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-zinc-800 hover:bg-zinc-700/80 text-white font-bold text-xs py-2.5 transition-colors border border-zinc-700/50"
                >
                  <Plus className="h-4 w-4" />
                  محادثة جديدة
                </button>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="بحث Ctrl K"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pr-9 pl-3 py-2 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
                  />
                </div>

                {/* Section: Create */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block">إنشاء</span>
                  <button
                    onClick={() => setSuperAgentSection("skills")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                  >
                    <Zap className="h-4 w-4 text-emerald-400" />
                    المهارات (15 صيغة UGC)
                  </button>
                  <button
                    onClick={() => setSuperAgentSection("connectors")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                  >
                    <Radio className="h-4 w-4 text-purple-400" />
                    الموصّلات (سلة، زد، POS)
                  </button>
                  <button
                    onClick={() => setSuperAgentSection("identity")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                  >
                    <Palette className="h-4 w-4 text-amber-400" />
                    الهوية التجارية (Brand Kit)
                  </button>
                </div>

                {/* Section: Library */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block">المكتبة</span>
                  <button
                    onClick={() => setActiveTab("library")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                  >
                    <FolderOpen className="h-4 w-4 text-blue-400" />
                    الملفات والبرومبتات
                  </button>
                  <button
                    onClick={() => toast.info("ذاكرة الوكيل نشطة ومحفوظة سحابياً")}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-zinc-300 hover:bg-zinc-800/80 hover:text-white transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    الذاكرة (KUBE Memory)
                  </button>
                </div>

                {/* Section: Recent Chats */}
                <div className="space-y-1 pt-2">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-2 block">المحادثات</span>
                  <div className="rounded-xl border border-dashed border-zinc-800 p-3 text-center space-y-1">
                    <span className="text-[11px] font-bold text-zinc-400 block">حملة الصباح والفاينلز</span>
                    <span className="text-[9px] text-zinc-600 block">آخر تحديث: قبل قليل</span>
                  </div>
                </div>
              </div>

              {/* Sidebar Bottom: Launch Agent & User */}
              <div className="space-y-3 pt-4 border-t border-zinc-800">
                <button
                  onClick={() => handleSendAgentMessage("أطلق الأيجنت واقترح لي حملة الصباح")}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-black text-xs py-2.5 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Zap className="h-4 w-4" />
                  أطلق الأيجنت
                </button>

                <div className="flex items-center justify-between rounded-xl bg-zinc-900 p-2.5 border border-zinc-800/80">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-black font-black text-xs">
                      ز
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">زياد عيسى</span>
                      <span className="text-[9px] text-emerald-400 font-mono block">7 رصيد متاح</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold">PRO</span>
                </div>
              </div>
            </aside>

            {/* Main Center Stage (Hallah Chat & Studio Canvas) */}
            <main className="lg:col-span-9 rounded-2xl border border-zinc-800 bg-[#161618] p-4 md:p-8 flex flex-col justify-between min-h-[700px] shadow-2xl relative overflow-hidden">
              {/* Dismissible Top Mimic Banner */}
              {showMimicBanner && (
                <div className="mb-4 inline-flex items-center gap-2 self-center rounded-full bg-zinc-800/80 border border-zinc-700/60 px-4 py-1.5 text-xs text-zinc-300 backdrop-blur-md">
                  <span className="rounded-full bg-emerald-500 text-black font-black text-[9px] px-2 py-0.2">جديد</span>
                  <span>اطلب من الوكيل فيديو هلاي ميميك لتحريك منتجاتك مع الصوت</span>
                  <button onClick={() => setShowMimicBanner(false)} className="text-zinc-500 hover:text-white mr-2">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Greeting Header */}
              <div className="text-center my-6 space-y-2">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-600 to-teal-700 p-0.5 shadow-xl shadow-emerald-500/20 mb-2">
                  <div className="h-full w-full bg-[#121212] rounded-2xl flex items-center justify-center">
                    <Bot className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">صباح الخير، زياد</h1>
                <p className="text-sm text-zinc-400 max-w-lg mx-auto">
                  حوّل محادثة بسيطة إلى محتوى إعلاني وتسويقي جاهز للإنتاج فوراً.
                </p>
              </div>

              {/* Chat Messages Stream Area */}
              <div className="space-y-4 max-h-[350px] overflow-y-auto px-2 scrollbar-none my-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "user" ? "items-start" : "items-end"} space-y-1`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed whitespace-pre-wrap ${
                        msg.sender === "user"
                          ? "bg-emerald-500 text-black font-semibold rounded-br-xs shadow-md"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-bl-xs shadow-lg"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[9px] font-mono text-zinc-600 px-1">{msg.timestamp}</span>
                  </div>
                ))}
                {isAgentTyping && (
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-semibold p-3 bg-zinc-900/60 rounded-xl max-w-xs border border-zinc-800">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    سوبر ايجنت KUBE يكتب الآن...
                  </div>
                )}
              </div>

              {/* Big Halai-Style Chat Input Box */}
              <div className="space-y-3 mt-auto">
                <div className="rounded-2xl border border-zinc-700/80 bg-zinc-900/90 backdrop-blur-xl p-3 shadow-2xl focus-within:border-emerald-500 transition-all">
                  <textarea
                    rows={2}
                    value={agentInputText}
                    onChange={(e) => setAgentInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendAgentMessage();
                      }
                    }}
                    placeholder="اطلب من الوكيل أي سكريبت، فكرة ترند، أو زاوية تصوير لكافيه KUBE..."
                    className="w-full bg-transparent resize-none text-xs md:text-sm text-white placeholder:text-zinc-500 focus:outline-none"
                  />

                  {/* Inside Input Toolbar */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.info("اختر صورة منتج من ملفاتك لدمجها")}
                        className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                        title="رفع ملف"
                      >
                        <Plus className="h-4 w-4" />
                      </button>

                      <div className="flex items-center gap-1 bg-zinc-800/60 px-2.5 py-1 rounded-lg border border-zinc-700/50 text-[11px] font-mono text-zinc-300">
                        <Cpu className="h-3 w-3 text-emerald-400" />
                        <span>{selectedAgentEngine}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toast.info("التسجيل الصوتي متاح عبر الميكروفون")}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                        title="تسجيل صوتي"
                      >
                        <Mic className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleSendAgentMessage()}
                        className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black transition-all shadow-md shadow-emerald-500/20 active:scale-95"
                        title="إرسال"
                      >
                        <Send className="h-4 w-4 rotate-180" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Action Badges Under Chat */}
                <div className="flex items-center justify-center gap-3 text-xs text-zinc-400 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedUgcFormat(SAUDI_UGC_FORMATS[0]);
                      handleSendAgentMessage(SAUDI_UGC_FORMATS[0].scriptPrompt);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                  >
                    <Zap className="h-3 w-3 text-emerald-400" />
                    المهارات (15 صيغة)
                  </button>

                  <button
                    onClick={() => setActiveTab("mcp_connectors")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 hover:border-purple-500 hover:text-purple-400 transition-colors"
                  >
                    <Radio className="h-3 w-3 text-purple-400" />
                    الموصّلات (سلة + زد)
                  </button>

                  <button
                    onClick={() => setActiveTab("ai_models")}
                    className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 hover:border-blue-500 hover:text-blue-400 transition-colors"
                  >
                    <Cpu className="h-3 w-3 text-blue-400" />
                    جرّب النماذج العالمية
                  </button>
                </div>

                {/* Gallery Presets: "صُنعت على هلاي — اختر وحدة ونسوّي لك مثلها" */}
                <div className="pt-4 border-t border-zinc-800/80 space-y-2.5">
                  <span className="text-[11px] font-bold text-zinc-400 block text-center">
                    صُنعت على KUBE ستوديو — اختر وحدة ونسوّي لك مثلها
                  </span>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                    {[
                      {
                        title: "شوكولاتة الشعار",
                        query: "سو لي شوكولاتة الشعار الفاخرة لـ KUBE",
                        img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80",
                      },
                      {
                        title: "أكياس التسوق وبن KUBE",
                        query: "سو لي أكياس التسوق الفاخرة لكافيه KUBE",
                        img: "https://images.unsplash.com/photo-1559525839-8f8ec320b92f?w=400&auto=format&fit=crop&q=80",
                      },
                      {
                        title: "إكسسوارات وأكواب سيراميك",
                        query: "سو لي إكسسوارات مميزة وأكواب KUBE مطفية",
                        img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
                      },
                      {
                        title: "مستخدمون وضيوف سعداء",
                        query: "سو لي محتوى مستخدمون سعداء مع كوب KUBE بالرياض",
                        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                      },
                      {
                        title: "نمط وأسلوب المنتج",
                        query: "سو لي نمط المنتج السينمائي لكولد برو KUBE",
                        img: "https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=400&auto=format&fit=crop&q=80",
                      },
                    ].map((card, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendAgentMessage(card.query)}
                        className="group relative flex flex-col items-center rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/60 hover:border-emerald-500 transition-all text-center p-1.5"
                      >
                        <div className="h-28 w-full rounded-lg overflow-hidden relative mb-1.5">
                          <img
                            src={card.img}
                            alt={card.title}
                            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <span className="absolute bottom-1 right-1 left-1 text-[9px] font-bold text-white truncate">
                            سوّ لي مثلها
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-300 group-hover:text-emerald-400 block truncate w-full">
                          {card.title}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </main>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: 3D PRODUCT STUDIO WORKSPACE (Exact Match with Hallah)   */}
        {/* ============================================================== */}
        {activeTab === "product_studio" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left/Main Canvas: Virtual Studio Viewer */}
            <div className="lg:col-span-8 rounded-2xl border border-zinc-800 bg-[#161618] p-6 flex flex-col justify-between min-h-[600px] shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-sm font-bold text-white">استديو المنتجات — مساحة العمل التوليدية</h2>
                </div>
                <span className="rounded-full bg-zinc-900 border border-zinc-800 px-3 py-1 text-[11px] font-mono text-zinc-400">
                  نسبة العرض: {productAspectRatio}
                </span>
              </div>

              {/* Main Stage Display */}
              <div className="flex-1 flex items-center justify-center my-6">
                {!hasGeneratedProduct ? (
                  <div className="text-center space-y-3 max-w-sm mx-auto">
                    <div className="h-20 w-20 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-600 shadow-inner">
                      <ShoppingBag className="h-10 w-10 text-zinc-600" />
                    </div>
                    <h3 className="text-base font-bold text-white">لا توجد منتجات بعد</h3>
                    <p className="text-xs text-zinc-400">
                      ابدأ بتوليد أو استيراد أول منتج لك لكافيه ومطبخ KUBE ليظهر هنا.
                    </p>
                    <button
                      onClick={handleProductStudioGenerate}
                      disabled={isGeneratingProduct}
                      className="rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-white font-bold text-xs px-5 py-2.5 transition-all shadow-md"
                    >
                      {isGeneratingProduct ? "جاري التوليد..." : "ابدأ الإبداع"}
                    </button>
                  </div>
                ) : (
                  <div className="w-full max-w-lg rounded-2xl overflow-hidden border border-zinc-700 bg-zinc-900 shadow-2xl space-y-3 p-4 animate-in fade-in duration-300">
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                      <img
                        src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80"
                        alt="KUBE Specialty Coffee"
                        className="h-full w-full object-cover"
                      />
                      <span className="absolute top-3 right-3 rounded-full bg-black/70 backdrop-blur-md px-3 py-1 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                        {lightingDirection} • {lightingIntensity}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <div>
                        <span className="font-bold text-white block">كوب KUBE الأسود المطفي — رخام نيرو</span>
                        <span className="text-[10px] text-zinc-400 font-mono">Hasselblad 85mm f/1.4 • 8K Commercial</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleCopy(selectedStudioPreset.englishPrompt, "studio-res", "برومبت الاستوديو")}
                          className="rounded-lg bg-zinc-800 p-2 text-zinc-300 hover:text-white"
                          title="نسخ البرومبت"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toast.success("جاري تحميل الصورة الأصلية بدقة 4K")}
                          className="rounded-lg bg-emerald-500 text-black font-bold p-2 hover:bg-emerald-400"
                          title="تحميل الصورة"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Info bar */}
              <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-500">
                <span>محرك المعالجة: Flux Max 2 & Kling 3 Engine</span>
                <span>متوافق مع متاجر سلة وزد وتطبيقات التوصيل</span>
              </div>
            </div>

            {/* Right Side Control Console (Exact Hallah Controls) */}
            <div className="lg:col-span-4 rounded-2xl border border-zinc-800 bg-[#18181b] p-5 space-y-5 shadow-2xl text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <h3 className="font-bold text-sm text-white">إعدادات استديو المنتجات</h3>
                <span className="text-emerald-400 font-mono text-[10px]">Studio Pro</span>
              </div>

              {/* Upload Slots & URL Input */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 block">صور المنتج (0/4):</label>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((slot) => (
                    <div
                      key={slot}
                      onClick={() => toast.info(`تم النقر على خانة رفع الصورة ${slot + 1}`)}
                      className="h-14 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/60 hover:border-emerald-500 flex flex-col items-center justify-center text-zinc-500 hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </div>
                  ))}
                </div>

                <div className="relative mt-2">
                  <input
                    type="text"
                    value={productUrlInput}
                    onChange={(e) => setProductUrlInput(e.target.value)}
                    placeholder="...استيراد من رابط المنتج (سلة / زد)"
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Generation Quality */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 block">جودة التوليد:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setGenerationQuality("standard")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      generationQuality === "standard"
                        ? "bg-zinc-200 text-black"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    قياسي
                  </button>
                  <button
                    onClick={() => setGenerationQuality("hd_pro")}
                    className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
                      generationQuality === "hd_pro"
                        ? "bg-zinc-200 text-black"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Award className="h-3.5 w-3.5 text-amber-500" />
                    احترافي HD
                  </button>
                </div>
              </div>

              {/* Lighting & Shadows Grid (Hallah Exact Matrix) */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-zinc-400 block">الإضاءة والظلال:</label>
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
                      className={`py-1.5 rounded-lg text-center font-bold text-xs transition-all ${
                        lightingDirection === btn.id
                          ? "bg-white text-black shadow-md"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* 3D Sphere Interactive Graphic */}
                <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-3 text-center space-y-2">
                  <div className="h-20 w-20 rounded-full border-2 border-dashed border-emerald-500/40 mx-auto flex items-center justify-center relative shadow-inner">
                    <div
                      className={`h-5 w-5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 transition-transform duration-300 ${
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
                  <span className="text-[10px] text-zinc-500 block font-mono">اسحب لتغيير اتجاه الضوء ثلاثي الأبعاد</span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setLightingIntensity("soft_diffused")}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold ${
                      lightingIntensity === "soft_diffused"
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                    }`}
                  >
                    ناعم
                  </button>
                  <button
                    onClick={() => setLightingIntensity("harsh_sunlight")}
                    className={`flex-1 py-1.5 rounded-lg text-center font-bold ${
                      lightingIntensity === "harsh_sunlight"
                        ? "bg-zinc-700 text-white"
                        : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                    }`}
                  >
                    حاد
                  </button>
                </div>
              </div>

              {/* Aspect Ratio */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 block">نسبة العرض:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {["1:1", "4:5", "9:16", "3:4", "4:3", "16:9"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setProductAspectRatio(ratio as any)}
                      className={`py-1.5 rounded-lg text-center font-mono font-bold ${
                        productAspectRatio === ratio
                          ? "bg-white text-black"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {ratio} {ratio === "1:1" && "★"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 block">لغة المخرجات والبرومبت:</label>
                <div className="flex gap-2">
                  {[
                    { id: "ar", label: "العربية" },
                    { id: "en", label: "English" },
                    { id: "both", label: "كلاهما" },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setOutputLanguage(l.id as any)}
                      className={`flex-1 py-1.5 rounded-lg text-center font-bold ${
                        outputLanguage === l.id
                          ? "bg-zinc-700 text-white"
                          : "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Big Bottom Generate Button (Like Hallah) */}
              <button
                onClick={handleProductStudioGenerate}
                disabled={isGeneratingProduct}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-sm py-3 transition-all shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
              >
                {isGeneratingProduct ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    جاري التوليد بدقة 4K...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    توليد ▶ 10 رصيد
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: UGC STUDIO 2.0 (Exact 3-Step Wizard from Hallah)        */}
        {/* ============================================================== */}
        {activeTab === "ugc_studio" && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-6">
            {/* Steps Navigation Bar */}
            <div className="flex items-center justify-between max-w-xl mx-auto border-b border-zinc-800 pb-4 text-xs">
              <button
                onClick={() => setUgcStep(1)}
                className={`flex items-center gap-2 font-bold ${ugcStep === 1 ? "text-emerald-400" : "text-zinc-500"}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    ugcStep === 1 ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  1
                </span>
                الصور والشخصية والمنتج
              </button>

              <button
                onClick={() => setUgcStep(2)}
                className={`flex items-center gap-2 font-bold ${ugcStep === 2 ? "text-emerald-400" : "text-zinc-500"}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    ugcStep === 2 ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  2
                </span>
                اللغة واللهجة والمشاعر
              </button>

              <button
                onClick={() => setUgcStep(3)}
                className={`flex items-center gap-2 font-bold ${ugcStep === 3 ? "text-emerald-400" : "text-zinc-500"}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    ugcStep === 3 ? "bg-emerald-500 text-black" : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  3
                </span>
                السكريبت والمشاهد
              </button>
            </div>

            {/* Step 1: Character & Product Picker */}
            {ugcStep === 1 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">اختر شخصية صانع المحتوى السعودي:</h3>
                    <p className="text-xs text-zinc-400">الوجوه الافتراضية المدربة على ملامح وستايل الشباب السعودي.</p>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs">
                    <button
                      onClick={() => setCreatorGenderFilter("all")}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        creatorGenderFilter === "all" ? "bg-white text-black" : "text-zinc-400"
                      }`}
                    >
                      الكل ({SAUDI_CREATOR_PERSONAS.length})
                    </button>
                    <button
                      onClick={() => setCreatorGenderFilter("male")}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        creatorGenderFilter === "male" ? "bg-white text-black" : "text-zinc-400"
                      }`}
                    >
                      ذكور
                    </button>
                    <button
                      onClick={() => setCreatorGenderFilter("female")}
                      className={`px-3 py-1 rounded-lg font-bold ${
                        creatorGenderFilter === "female" ? "bg-white text-black" : "text-zinc-400"
                      }`}
                    >
                      إناث
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {filteredCreators.map((creator) => {
                    const isSelected = selectedCreator.id === creator.id;
                    return (
                      <button
                        key={creator.id}
                        onClick={() => setSelectedCreator(creator)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                            : "border-zinc-800 bg-zinc-900 hover:border-zinc-700"
                        }`}
                      >
                        <div className="relative mb-2 mx-auto w-16 h-16">
                          <img
                            src={creator.avatarUrl}
                            alt={creator.name}
                            className="w-full h-full object-cover rounded-full border-2 border-zinc-700"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-black rounded-full flex items-center justify-center font-bold text-xs">
                              ✓
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-white block">{creator.name}</span>
                        <span className="text-[10px] text-zinc-400 block truncate">{creator.role}</span>
                        <span className="text-[9px] text-emerald-400 font-mono block mt-1">
                          {creator.city.split("—")[1] || creator.city}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setUgcStep(2)}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 transition-all shadow-md"
                  >
                    متابعة إلى خيارات اللهجة والمشاعر ←
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Language, Dialect, Emotion */}
            {ugcStep === 2 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div>
                  <h3 className="text-base font-bold text-white">خيارات اللهجة والمشاعر لـ ({selectedCreator.name})</h3>
                  <p className="text-xs text-zinc-400">توجيه أسلوب النطق والطاقة لنماذج الصوت والفيديو.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-2">
                    <label className="font-bold text-zinc-400 block">اللهجة الموصى بها:</label>
                    <select
                      value={ugcDialect}
                      onChange={(e) => setUgcDialect(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="لهجة نجدية سريعة ومحببة (الرياض)">لهجة نجدية سريعة ومحببة (الرياض)</option>
                      <option value="لهجة بيضاء تفاعلية شبابية">لهجة بيضاء تفاعلية شبابية</option>
                      <option value="لهجة حجازية عفوية ودافئة">لهجة حجازية عفوية ودافئة</option>
                      <option value="لهجة سعودية رسمية ومهنية (للشركات)">لهجة سعودية رسمية ومهنية (للشركات)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="font-bold text-zinc-400 block">المشاعر وحالة الأداء:</label>
                    <select
                      value={ugcEmotion}
                      onChange={(e) => setUgcEmotion(e.target.value)}
                      className="w-full rounded-xl bg-zinc-900 border border-zinc-800 p-3 text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="روقان وهدوء مع لمسة ذكاء">روقان وهدوء مع لمسة ذكاء (Specialty Coffee)</option>
                      <option value="حماس وطاقة وسرعة دوام">حماس وطاقة وسرعة دوام (Morning Hustle)</option>
                      <option value="عفوي ومرح وميمز شبابية">عفوي ومرح وميمز شبابية (Barq/STC Style)</option>
                      <option value="فخامة واعتزاز بالأصالة">فخامة واعتزاز بالأصالة (Luxury Heritage)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setUgcStep(1)}
                    className="rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs px-5 py-2.5"
                  >
                    → السابق
                  </button>
                  <button
                    onClick={handleGenerateUgcScript}
                    disabled={isGeneratingUgc}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 transition-all shadow-md disabled:opacity-50"
                  >
                    {isGeneratingUgc ? "جاري توليد السكريبت..." : "توليد سكريبت الـ 3 مشاهد ←"}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Script & Scene Breakdown */}
            {ugcStep === 3 && (
              <div className="space-y-5 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">سكريبت الفيديو الإعلاني المجهز</h3>
                    <p className="text-xs text-zinc-400">
                      مقسم مشهداً بمشهد (Hook، تجربة المنتج، والـ CTA) جاهز للتصوير أو التوليد.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopy(generatedScriptOutput || "", "ugc-res", "السكريبت الكامل")}
                    className="rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs px-4 py-2 flex items-center gap-1.5"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    نسخ السكريبت
                  </button>
                </div>

                {generatedScriptOutput && (
                  <pre className="whitespace-pre-wrap font-sans text-xs text-zinc-200 leading-relaxed bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
                    {generatedScriptOutput}
                  </pre>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    onClick={() => setUgcStep(2)}
                    className="rounded-xl bg-zinc-800 text-zinc-300 font-bold text-xs px-5 py-2.5"
                  >
                    → تعديل المشاعر
                  </button>
                  <button
                    onClick={() => {
                      toast.success("تم إرسال السكريبت لمحرك Kling 3 لتوليد الفيديو التلقائي");
                    }}
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-6 py-2.5 transition-all shadow-md"
                  >
                    إرسال لتوليد الفيديو بمحرك Kling 3 ▶
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: ADS STUDIO (Hallah 9-Pack Ads Studio)                  */}
        {/* ============================================================== */}
        {activeTab === "ads_studio" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-lg font-black text-white">استديو الإعلانات — حوّل منتجك إلى ٩ صور إعلانية</h2>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">
                    أنشئ صور إعلانية عالية التحويل. 9 صور احترافية من لقطة واحدة تناسب كل الحملات والمقاسات.
                  </p>
                </div>

                <button
                  onClick={handleGenerate9Pack}
                  disabled={isGenerating9Pack}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs px-6 py-3 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isGenerating9Pack ? "جاري التوليد..." : "توليد الـ 9 إعلانات فوراً ▶"}
                </button>
              </div>

              {/* Controls Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400">اسم المنتج أو المشروب:</label>
                  <input
                    type="text"
                    value={adsProductTitle}
                    onChange={(e) => setAdsProductTitle(e.target.value)}
                    placeholder="مثال: كولد برو كيني، فرنش توست..."
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400">طبيعة الحملة:</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAdsCampaignType("product")}
                      className={`flex-1 py-2 rounded-xl font-bold ${
                        adsCampaignType === "product" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      منتج قهوة / حلى
                    </button>
                    <button
                      onClick={() => setAdsCampaignType("service")}
                      className={`flex-1 py-2 rounded-xl font-bold ${
                        adsCampaignType === "service" ? "bg-white text-black" : "bg-zinc-900 text-zinc-400"
                      }`}
                    >
                      خدمة تموين / مناسبات
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-zinc-400">المقاس المفضل:</label>
                  <span className="block p-2 rounded-xl bg-zinc-900 border border-zinc-800 font-mono text-zinc-300">
                    9:16 (الأشهر) + 1:1 + 4:5
                  </span>
                </div>
              </div>

              {/* Generated 9-Pack Grid */}
              {generated9Pack && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-4">
                  {generated9Pack.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white">{item.title}</span>
                          <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                            {item.tag}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-zinc-400 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-zinc-800 line-clamp-3 select-all">
                          {item.prompt}
                        </p>
                      </div>

                      <button
                        onClick={() => handleCopy(item.prompt, `9p-${idx}`, item.title)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 font-bold text-xs py-2 transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        نسخ برومبت هذه الزاوية
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: TEMPLATES (Hallah Templates App)                        */}
        {/* ============================================================== */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            <div className="text-center py-6 space-y-2">
              <h2 className="text-3xl font-black text-white flex items-center justify-center gap-2">
                <ShoppingBag className="h-7 w-7 text-emerald-400" />
                أنشئ فوراً.
              </h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                تطبيقات جاهزة للعمل فوراً، اختر قالباً وخصّصه لكافيه KUBE وقم بالتوليد في ثوانٍ.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap text-xs">
              {[
                "الكل",
                "مشاهير",
                "التجارة الإلكترونية",
                "الملابس",
                "شخصي",
                "المؤثرين",
                "العمارة والتصميم",
                "الأعمال",
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateFilter(cat)}
                  className={`px-4 py-1.5 rounded-full font-bold transition-all ${
                    templateFilter === cat ? "bg-white text-black" : "bg-zinc-800/60 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Templates Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-4">
              {[
                {
                  title: "اليوم الوطني السعودي",
                  badge: "جديد",
                  img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400&auto=format&fit=crop&q=80",
                },
                {
                  title: "التحكم بالحركة",
                  badge: "المفضل",
                  img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
                },
                {
                  title: "سيلفي سيارة فاخرة مع قهوة",
                  badge: "جديد",
                  img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
                },
                {
                  title: "ريلز المنتج والسكب",
                  badge: "المفضل",
                  img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400&auto=format&fit=crop&q=80",
                },
                {
                  title: "جلسة تصوير أزياء ومقهى",
                  badge: "جديد",
                  img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
                },
                {
                  title: "صورة احترافية مع العلم",
                  badge: "جديد",
                  img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
                },
              ].map((tmpl, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-zinc-800 bg-zinc-900 overflow-hidden flex flex-col justify-between group hover:border-emerald-500 transition-colors"
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-black">
                    <img
                      src={tmpl.img}
                      alt={tmpl.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2 right-2 rounded-md bg-emerald-500 text-black font-black text-[9px] px-2 py-0.5">
                      {tmpl.badge}
                    </span>
                  </div>
                  <div className="p-3 space-y-2">
                    <span className="font-bold text-xs text-white block truncate">{tmpl.title}</span>
                    <button
                      onClick={() => {
                        toast.success(`تم اختيار قالب "${tmpl.title}" ونقله لسوبر ايجنت`);
                        setActiveTab("super_agent");
                      }}
                      className="w-full rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 font-bold text-xs py-1.5 transition-colors"
                    >
                      ▶ جرّب هذا
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: GLOBAL AI ENGINES & API CATALOG                        */}
        {/* ============================================================== */}
        {activeTab === "ai_models" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <Cpu className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-lg font-black text-white">
                    كتالوج النماذج والمحركات العالمية (Kling, Veo, WanX, Flux, Omni)
                  </h2>
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  حصر شامل لجميع محركات الذكاء الاصطناعي التي ترتبط بها منصة هلاي AI مع مواصفات الـ API والـ Endpoints
                  المقترحة لربط KUBE بها برمجياً.
                </p>
              </div>

              {/* Models Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {HALAI_AI_MODELS_CATALOG.map((model) => (
                  <div
                    key={model.id}
                    className={`rounded-2xl border p-4 space-y-3 flex flex-col justify-between transition-all ${
                      selectedModelForApi.id === model.id
                        ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                        : "border-zinc-800 bg-zinc-900/70 hover:border-zinc-700"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{model.nameAr}</span>
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[9px] font-mono text-emerald-400">
                          {model.provider}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300 leading-relaxed font-sans">{model.descriptionAr}</p>

                      <div className="space-y-1 text-[10px] text-zinc-400 font-mono bg-black/40 p-2.5 rounded-lg border border-zinc-800/80">
                        <div>
                          أعلى دقة: <span className="text-white">{model.maxResolution}</span>
                        </div>
                        <div>
                          أقصى مدة: <span className="text-white">{model.maxDuration}</span>
                        </div>
                        <div>
                          الصوت الأصلي:{" "}
                          <span className={model.nativeAudio ? "text-emerald-400" : "text-zinc-500"}>
                            {model.nativeAudio ? "مدعوم بنقاء" : "غير مدمج"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedModelForApi(model);
                        toast.success(`تم اختيار نموذج "${model.nameAr}" لعرض وثائق الربط`);
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-200 font-bold text-xs py-2 transition-colors"
                    >
                      <Code className="h-3 w-3" />
                      عرض كود الربط بالـ API
                    </button>
                  </div>
                ))}
              </div>

              {/* API Integration Inspector */}
              {selectedModelForApi && (
                <div className="rounded-2xl border border-zinc-800 bg-black/60 p-5 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-emerald-400" />
                      <span className="font-bold text-white">وثيقة الربط البرمجي لـ: {selectedModelForApi.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(selectedModelForApi.samplePayload, null, 2));
                        toast.success("تم نسخ كود الـ Payload بنجاح!");
                      }}
                      className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:text-white"
                    >
                      نسخ كود الربط
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono block">ENDPOINT URL (POST):</span>
                    <span className="block font-mono text-[11px] text-emerald-400 bg-zinc-900 p-2 rounded-lg">
                      {selectedModelForApi.apiEndpointSuggestion}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-500 font-mono block">SAMPLE JSON PAYLOAD:</span>
                    <pre className="font-mono text-[11px] text-zinc-300 bg-zinc-950 p-3 rounded-lg overflow-x-auto border border-zinc-800 select-all">
                      {JSON.stringify(selectedModelForApi.samplePayload, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: MCP CONNECTORS (Salla, Zid, POS)                        */}
        {/* ============================================================== */}
        {activeTab === "mcp_connectors" && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-6">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="h-6 w-6 text-purple-400" />
                <h2 className="text-lg font-black text-white">
                  الموصّلات وخوادم MCP (Model Context Protocol Connectors)
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                اربط منصّات التجارة والمخزون الخارجية ليستخدم سوبر ايجنت KUBE أدواتها داخل المحادثة مباشرة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {connectedMcpServers.map((srv) => (
                <div key={srv.id} className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{srv.name}</span>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        srv.status === "connected" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 flex justify-between">
                    <span>الحالة: {srv.status === "connected" ? "متصل" : "في الانتظار"}</span>
                    <span>الاستجابة: {srv.ping}</span>
                  </div>
                  <button
                    onClick={() => toast.success(`تم اختبار الاتصال مع ${srv.name}`)}
                    className="w-full rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-xs py-2"
                  >
                    اختبار الاتصال
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
              <label className="font-bold text-zinc-400 block">إضافة خادم MCP مخصص (Custom Server URL):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customMcpUrl}
                  onChange={(e) => setCustomMcpUrl(e.target.value)}
                  placeholder="https://mcp.kubekitchen.app/v1"
                  className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
                <button
                  onClick={() => {
                    if (!customMcpUrl) {
                      toast.error("يرجى إدخال رابط خادم الـ MCP");
                      return;
                    }
                    toast.success("تم تسجيل خادم الـ MCP المخصص بنجاح!");
                    setCustomMcpUrl("");
                  }}
                  className="rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2"
                >
                  ربط الخادم
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: CONTENT & PROMPT LIBRARY                                */}
        {/* ============================================================== */}
        {activeTab === "library" && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Folder className="h-5 w-5 text-emerald-400" />
                  مكتبة المحتوى والبرومبتات السعودية (210 منشور + 110 برومبت بصري)
                </h2>
                <p className="text-xs text-zinc-400">
                  الأصول المجهزة والمصنفة لكافيه KUBE جاهزة للنسخ والاستخدام فوراً.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-zinc-900 p-1 rounded-xl border border-zinc-800 text-xs self-start sm:self-auto">
                <button
                  onClick={() => setLibrarySubTab("posts")}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    librarySubTab === "posts" ? "bg-white text-black" : "text-zinc-400"
                  }`}
                >
                  المنشورات ({filteredSocialPosts.length})
                </button>
                <button
                  onClick={() => setLibrarySubTab("prompts")}
                  className={`px-3 py-1.5 rounded-lg font-bold ${
                    librarySubTab === "prompts" ? "bg-white text-black" : "text-zinc-400"
                  }`}
                >
                  البرومبتات ({filteredPrompts.length})
                </button>
              </div>
            </div>

            {/* Library Search */}
            <div className="relative">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="ابحث في نصوص التغريدات، البرومبتات، أو الأفكار..."
                className="w-full rounded-xl bg-zinc-900 border border-zinc-800 pr-9 pl-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Posts Grid */}
            {librarySubTab === "posts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {filteredSocialPosts.slice(0, 15).map((post) => (
                  <div
                    key={post.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between text-xs hover:border-zinc-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold text-emerald-400">
                          {post.brandLabel}
                        </span>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase">{post.suggestedChannel}</span>
                      </div>
                      <span className="font-bold text-white block line-clamp-1">{post.hookHeadline}</span>
                      <p className="whitespace-pre-line text-zinc-300 leading-relaxed font-sans">{post.text}</p>
                    </div>

                    <button
                      onClick={() => handleCopy(`${post.text}\n\n${post.hashtags.join(" ")}`, post.id, "المنشور")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 font-bold text-xs py-2 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      نسخ المنشور
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Prompts Grid */}
            {librarySubTab === "prompts" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredPrompts.slice(0, 10).map((prompt) => (
                  <div
                    key={prompt.id}
                    className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-3 flex flex-col justify-between text-xs hover:border-zinc-700 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{prompt.title}</span>
                        <span className="font-mono text-[9px] text-emerald-400">{prompt.aspectRatio}</span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed font-sans">{prompt.arabicPrompt}</p>
                      <pre className="font-mono text-[10px] text-zinc-400 bg-black/50 p-2.5 rounded-lg overflow-x-auto select-all">
                        {prompt.englishPrompt}
                      </pre>
                    </div>

                    <button
                      onClick={() => handleCopy(prompt.englishPrompt, prompt.id, "برومبت الصورة")}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500 hover:text-black text-zinc-300 font-bold text-xs py-2 transition-colors"
                    >
                      <Copy className="h-3 w-3" />
                      نسخ برومبت الصورة الكامل
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9: CAMPAIGNS TRACKER                                      */}
        {/* ============================================================== */}
        {activeTab === "campaigns" && (
          <div className="rounded-2xl border border-zinc-800 bg-[#161618] p-5 md:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-emerald-400" />
                  متتبع الحملات التسويقية لكافيه ومطبخ KUBE
                </h2>
                <p className="text-xs text-zinc-400">إدارة التواريخ والميزانيات والعروض الترويجية النشطة.</p>
              </div>

              <button
                onClick={() => setShowAddCampModal(true)}
                className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                حملة جديدة
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400 font-bold">
                  <tr>
                    <th className="py-3 px-4">الحملة</th>
                    <th className="py-3 px-4">المنصات</th>
                    <th className="py-3 px-4">الخصم</th>
                    <th className="py-3 px-4">الميزانية</th>
                    <th className="py-3 px-4">الفترة</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {campaigns.map((camp) => (
                    <tr key={camp.id} className="hover:bg-zinc-900/40">
                      <td className="py-3 px-4 font-bold text-white">{camp.name}</td>
                      <td className="py-3 px-4 text-zinc-300">{camp.platform}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{camp.discount}</td>
                      <td className="py-3 px-4 font-mono text-zinc-400">{camp.budget}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                        {camp.startDate} إلى {camp.endDate}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 text-[9px] font-bold">
                          {camp.status === "active" ? "نشط" : "مجدول"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
