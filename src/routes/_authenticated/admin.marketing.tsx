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
  UgcFormat,
  SaudiCreatorPersona,
  ProductStudioPreset,
  VideoScriptTemplate,
} from "@/features/marketing/ai-marketing-dataset";
import { useCurrentUser } from "@/lib/use-current-user";
import { primaryRoleHome } from "@/lib/current-user";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  head: () => ({
    meta: [
      { title: "مركز التسويق والذكاء الاصطناعي — KUBE Kitchen" },
      {
        name: "description",
        content:
          "المنظومة التسويقية الذكية لكافيه ومطبخ KUBE المدربة على أرقى معايير النبرة السعودية (برق، STC، نمق، دانكن، القرشي، هلا AI).",
      },
      { property: "og:title", content: "مركز التسويق والذكاء الاصطناعي — KUBE Kitchen" },
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
  | "social_engine"
  | "visual_studio"
  | "trend_playbooks"
  | "campaigns_tracker";

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
  {
    id: "c-4",
    name: "تحدي الفاينلز والامتحانات الجامعية",
    platform: "X + تيك توك",
    discount: "المشروب الثاني بنصف السعر للطلاب",
    startDate: "2026-10-25",
    endDate: "2026-11-05",
    status: "draft",
    budget: "3,000 ريال",
    target: "طلاب جامعات سعود ونورة والإمام",
  },
];

function MarketingHubPage() {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const backHomeUrl = primaryRoleHome(currentUser.data?.roles ?? []);

  // Main navigation tab
  const [activeTab, setActiveTab] = useState<TabType>("super_agent");

  // ==========================================
  // Tab 1: Super Agent States
  // ==========================================
  const [selectedUgcFormat, setSelectedUgcFormat] = useState<UgcFormat | null>(SAUDI_UGC_FORMATS[0]);
  const [brandKitSubTab, setBrandKitSubTab] = useState<"overview" | "rules" | "palette">("overview");
  const [agentUserPrompt, setAgentUserPrompt] = useState("");
  const [agentResponse, setAgentResponse] = useState<string | null>(null);
  const [isAgentThinking, setIsAgentThinking] = useState(false);

  // ==========================================
  // Tab 2: 3D Product & Ads Studio States
  // ==========================================
  const [selectedStudioPreset, setSelectedStudioPreset] = useState<ProductStudioPreset>(
    KUBE_PRODUCT_STUDIO_PRESETS[0],
  );
  const [lightingDirection, setLightingDirection] = useState<"top" | "front" | "right" | "left" | "rim_back" | "bottom">(
    "rim_back",
  );
  const [lightingIntensity, setLightingIntensity] = useState<"soft_diffused" | "harsh_sunlight" | "cinematic_moody">(
    "cinematic_moody",
  );
  const [productAspectRatio, setProductAspectRatio] = useState<"1:1" | "9:16" | "4:5" | "16:9">("1:1");
  const [customProductTitle, setCustomProductTitle] = useState("كوب كولد برو كيني مركز");
  const [generated9Pack, setGenerated9Pack] = useState<Array<{ title: string; prompt: string; tag: string }> | null>(
    null,
  );
  const [isGenerating9Pack, setIsGenerating9Pack] = useState(false);

  // ==========================================
  // Tab 3: UGC Video Studio States
  // ==========================================
  const [selectedCreator, setSelectedCreator] = useState<SaudiCreatorPersona>(SAUDI_CREATOR_PERSONAS[0]);
  const [creatorGenderFilter, setCreatorGenderFilter] = useState<"all" | "male" | "female">("all");
  const [activeScriptTemplate, setActiveScriptTemplate] = useState<VideoScriptTemplate>(KUBE_VIDEO_SCRIPTS[0]);
  const [videoEmotion, setVideoEmotion] = useState("روقان وهدوء مع لمسة ذكاء");
  const [customScriptGoal, setCustomScriptGoal] = useState("إبراز نكهة الفلات وايت والكرواسون في الصباح الباكر");
  const [generatedCustomScript, setGeneratedCustomScript] = useState<string | null>(null);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);

  // ==========================================
  // Tab 4: Social Posts Engine States
  // ==========================================
  const [selectedPersona, setSelectedPersona] = useState<BrandPersona | "all">("all");
  const [selectedSocialCategory, setSelectedSocialCategory] = useState<SocialCategory | "all">("all");
  const [selectedChannel, setSelectedChannel] = useState<SocialChannel | "all">("all");
  const [socialSearch, setSocialSearch] = useState("");
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Dynamic AI Content Generator State
  const [customKeyword, setCustomKeyword] = useState("");
  const [customTone, setCustomTone] = useState<BrandPersona>("barq_stc");
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // ==========================================
  // Tab 5: Visual Studio States
  // ==========================================
  const [selectedVisualCategory, setSelectedVisualCategory] = useState<VisualCategory | "all">("all");
  const [visualSearch, setVisualSearch] = useState("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // ==========================================
  // Tab 7: Campaigns States
  // ==========================================
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("kube_marketing_campaigns");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return INITIAL_CAMPAIGNS;
  });

  const [newCampName, setNewCampName] = useState("");
  const [newCampPlatform, setNewCampPlatform] = useState("منصة X + إنستغرام");
  const [newCampDiscount, setNewCampDiscount] = useState("");
  const [newCampStartDate, setNewCampStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [newCampEndDate, setNewCampEndDate] = useState(
    new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  );
  const [newCampBudget, setNewCampBudget] = useState("1,000 ريال");
  const [showAddCampModal, setShowAddCampModal] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("kube_marketing_campaigns", JSON.stringify(campaigns));
    }
  }, [campaigns]);

  // Copy helper
  const handleCopyText = (text: string, id: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة بنجاح!`);
    setCopiedPostId(id);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  const handleCopyPrompt = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ برومبت الصورة الإنجليزي بنجاح!");
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2500);
  };

  // Filtered Creators
  const filteredCreators = useMemo(() => {
    if (creatorGenderFilter === "all") return SAUDI_CREATOR_PERSONAS;
    return SAUDI_CREATOR_PERSONAS.filter((c) => c.gender === creatorGenderFilter);
  }, [creatorGenderFilter]);

  // Filtered Social Posts
  const filteredSocialPosts = useMemo(() => {
    return SAUDI_SOCIAL_POSTS.filter((post) => {
      if (selectedPersona !== "all" && post.brandPersona !== selectedPersona) return false;
      if (selectedSocialCategory !== "all" && post.category !== selectedSocialCategory) return false;
      if (selectedChannel !== "all" && post.suggestedChannel !== selectedChannel) return false;
      if (socialSearch.trim()) {
        const query = socialSearch.toLowerCase();
        const matchText = (post.text ?? "").toLowerCase().includes(query);
        const matchHook = (post.hookHeadline ?? "").toLowerCase().includes(query);
        const matchTags = (post.hashtags ?? []).some((h) => (h ?? "").toLowerCase().includes(query));
        if (!matchText && !matchHook && !matchTags) return false;
      }
      return true;
    });
  }, [selectedPersona, selectedSocialCategory, selectedChannel, socialSearch]);

  // Filtered Visual Prompts
  const filteredVisualPrompts = useMemo(() => {
    return SAUDI_VISUAL_PROMPTS.filter((item) => {
      if (selectedVisualCategory !== "all" && item.category !== selectedVisualCategory) return false;
      if (visualSearch.trim()) {
        const query = visualSearch.toLowerCase();
        const matchTitle = (item.title ?? "").toLowerCase().includes(query);
        const matchAr = (item.arabicPrompt ?? "").toLowerCase().includes(query);
        const matchEn = (item.englishPrompt ?? "").toLowerCase().includes(query);
        const matchBrand = (item.brandInspiration ?? "").toLowerCase().includes(query);
        if (!matchTitle && !matchAr && !matchEn && !matchBrand) return false;
      }
      return true;
    });
  }, [selectedVisualCategory, visualSearch]);

  // Handle Super Agent Query
  const handleAskSuperAgent = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = agentUserPrompt.trim() || (selectedUgcFormat ? selectedUgcFormat.title : "أفضل فكرة تسويقية اليوم");
    setIsAgentThinking(true);

    setTimeout(() => {
      const response = `🤖 [سوبر ايجنت KUBE — مدرب بلهجة نجدية سياق الرياض]:\n\nبناءً على هوية KUBE وصيغة (${
        selectedUgcFormat?.title || "المحتوى التفاعلي"
      }):\n\n📌 سكريبت المحتوى المقترح:\n"${
        selectedUgcFormat?.scriptPrompt ||
        "يا أهل الرياض.. روقان الدوام اليوم ما يبدأ إلا مع فلات وايت KUBE، قهوة تزن المزاج وتخلي إنتاجيتك بالسقف!"
      }"\n\n📸 توجيه الكاميرا والإضاءة:\n• الزاوية: ${
        selectedUgcFormat?.cameraAngle || "زاوية 45 درجة مع خلفية بوكيه ناعمة"
      }\n• الإضاءة: ${
        selectedUgcFormat?.lighting || "إضاءة استوديو دافئة 3000K مع إبراز لمعان القهوة"
      }\n\n🎯 استراتيجية النشر:\n• أفضل وقت: 7:30 ص إلى 9:00 ص (وقت التوجه للمكاتب والجامعات)\n• المنصة الموصى بها: تيك توك + منصة X\n• الهاشتاقات: #كافيه_كيوب #قهوة_الصباح #الرياض #روقان_الدوام`;

      setAgentResponse(response);
      setIsAgentThinking(false);
      toast.success("تم توليد مخرجات سوبر ايجنت KUBE بنجاح!");
    }, 600);
  };

  // Generate 9-Shot Ad Pack
  const handleGenerate9Pack = () => {
    setIsGenerating9Pack(true);
    setTimeout(() => {
      const prod = customProductTitle.trim() || "قهوة KUBE المختصة";
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
    }, 750);
  };

  // Generate Custom Video Script
  const handleGenerateCustomScript = () => {
    setIsGeneratingScript(true);
    setTimeout(() => {
      const prod = activeScriptTemplate.targetProduct;
      const creator = selectedCreator.name;
      const script = `🎬 [سكريبت فيديو تيك توك / ريلز — تم إنتاجه بواسطة وكيل KUBE الذكي]:

👤 صانع المحتوى المختار: ${creator} (${selectedCreator.role})
☕️ المنتج المستهدف: ${prod}
⏱ المدة الإجمالية: 30 ثانية
🎭 النبرة والمشاعر: ${videoEmotion}

---------------------------------------------------
📍 المشهد الأول: Hook البداية (0 - 4 ثوانٍ)
• الكاميرا: زاوية قريبة للوجه تتبع حركة سريعة ومفاجئة.
• الحركة: ${creator} يدخل الكادر بسرعة، يمسك الكوب ويطالع الكاميرا بابتسامة صدمة مبهجة.
• التعليق الصوتي (${creator}): "لو تحسب إنك شربت قهوة مختصة حقيقية بالرياض وأنت ما جربت هذا الكوب.. صدقني مخدوع!"
• المؤثرات الصوتية: صوت زجاج كولد برو مثلج + Whoosh صوتي سريع.

---------------------------------------------------
📍 المشهد الثاني: التجربة الحسية والمنتج (4 - 22 ثانية)
• الكاميرا: ماكرو بطيء 85mm مع سكب بطيء أو قرمشة الكرواسون المورق.
• الحركة: استعراض تفاصيل القوام مع إبراز الإيحاءات وانعكاس الضوء على مكعبات الثلج أو اللاتيه آرت.
• التعليق الصوتي (${creator}): "القوام هنا موزون بالملي.. والريحة من أول ما تفتح الغطا تاخذك لعالم ثاني. ما فيه مرارة زايدة ولا نكهة مصطنعة، كل رشفة روقان خالص!"
• المؤثرات الصوتية: صوت قطرات القهوة + تكسير السكر المقرمش (ASMR نقي).

---------------------------------------------------
📍 المشهد الثالث: العرض والدعوة للزيارة (22 - 30 ثانية)
• الكاميرا: زاوية Eye-level مع إشارة باليد وابتماس تفاؤل.
• الحركة: ${creator} يرفع الكوب تحية للمتابعين، وتظهر شاشة التطبيق أو كود الخصم.
• التعليق الصوتي (${creator}): "الحق على عرض الصباح الحين قبل ينتهي، اطلب من تطبيق KUBE واستلم بدون ما توقف بالزحمة!"
• النص على الشاشة: [كود: KUBE20 | خصم 20% | رابط الطلب بالبايو]`;

      setGeneratedCustomScript(script);
      setIsGeneratingScript(false);
      toast.success("تم توليد سكريبت الفيديو مشهدًا بمشهد بنجاح!");
    }, 700);
  };

  // Instant AI Generator function simulation (Tab 4)
  const handleGenerateCustomContent = () => {
    if (!customKeyword.trim()) {
      toast.error("يرجى كتابة فكرة أو اسم المنتج المراد التسويق له");
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      let result = "";
      const kw = customKeyword.trim();

      if (customTone === "barq_stc") {
        result = `وضعك الحين وأنت تفكر في ${kw}؟ 🥱\nلا تشيل هم الزحمة ولا وجع الراس، باريستا KUBE مجهزه لك بأعلى روقان يخلي يومك يطير أسرع من اتصال 5G! مرنا وخلك بالصدارة ⚡️🖤\n\n#كافيه_كيوب #الرياض #روقان_الدوام #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      } else if (customTone === "namq_address") {
        result = `بين هدوء الصباح وتناغم التفاصيل، يأتي ${kw} في KUBE كقصيدة تُروى بهدوء. قوام متوازن وإيحاءات آسرة خُلقت خصيصاً لمن يُقدّر لحظات الصفاء الحقيقية ☕️✨\n\n#قهوة_مختصة #KUBE_Specialty #شتاء_الرياض #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      } else if (customTone === "dunkin") {
        result = `عرض ما يتعوض على ${kw}! 🔥\nاطلب الآن واحصل على قهوة اليوم أو كوكيز طازج مجاناً حتى الساعة 11 صباحاً. التوفير الذكي والجودة الفاخرة ما تلقاها إلا في KUBE! 🥐☕️\n\n#عروض_KUBE #فطور_الصباح #عروض_الرياض #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      } else if (customTone === "qurashi_luxury") {
        result = `سحر المذاق الأصيل وعراقة الضيافة.. يأتيك ${kw} ليعكس هيبة التميز وفخامة الاختيار. في KUBE، نصون نقاء الحرفة لنقدم لك ما يليق بمقامك الرفيع 🇸🇦👑\n\n#فخامة_المذاق #أصالة_سعودية #KUBE_Prestige #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      } else if (customTone === "interactive_viral") {
        result = `تحدي للأذكياء فقط 🧠:\nلو خيّرناك بين ${kw} من KUBE أو إجازة مدفوعة يوم الأحد.. وش تختار وبدون كذب؟ 👀\nأول 3 تعليقات لهم كوب مجاني بفرعنا اليوم! 🚀\n\n#تحدي_KUBE #مسابقات #كافيهات_الرياض #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      } else {
        result = `فرصة حصرية لمدة ساعتين فقط! ⏱️⚡️\nجرب ${kw} الجديد في KUBE واحصل على خصم 20% فوري عند الطلب عبر التطبيق بالكود: KUBE20. العرض ينتهي سريعاً!\n\n#عرض_محدود #تطبيق_KUBE #${kw.replace(
          /\s+/g,
          "_",
        )}`;
      }

      setGeneratedResult(result);
      setIsGenerating(false);
      toast.success("تم توليد النص الإعلاني بنجاح بواسطة الذكاء الاصطناعي!");
    }, 700);
  };

  // Add Campaign Handler
  const handleAddCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampName.trim()) {
      toast.error("اسم الحملة مطلوب");
      return;
    }
    const item: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: newCampName.trim(),
      platform: newCampPlatform,
      discount: newCampDiscount.trim() || "عرض خاص",
      startDate: newCampStartDate,
      endDate: newCampEndDate,
      status: "scheduled",
      budget: newCampBudget.trim() || "غير محدد",
      target: "متابعي السوشل ميديا",
    };

    setCampaigns((prev) => [item, ...prev]);
    setShowAddCampModal(false);
    setNewCampName("");
    setNewCampDiscount("");
    toast.success("تم إضافة الحملة التسويقية لجدول المتابعة!");
  };

  const handleActivatePlaybook = (playbook: TrendCampaignPlaybook) => {
    const item: CampaignItem = {
      id: `camp-${Date.now()}`,
      name: playbook.title,
      platform: "منصة X + إنستغرام + تيك توك",
      discount: playbook.suggestedDiscount,
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
      status: "active",
      budget: "2,500 ريال",
      target: playbook.targetAge,
    };
    setCampaigns((prev) => [item, ...prev]);
    toast.success(`تم تفعيل بلايبوك "${playbook.title}" ونقلها لقائمة الحملات النشطة!`);
    setActiveTab("campaigns_tracker");
  };

  const handleDeleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    toast.success("تم حذف الحملة");
  };

  const handleToggleStatus = (id: string) => {
    setCampaigns((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextStatus: Record<CampaignItem["status"], CampaignItem["status"]> = {
            active: "scheduled",
            scheduled: "draft",
            draft: "active",
          };
          return { ...c, status: nextStatus[c.status] };
        }
        return c;
      }),
    );
  };

  return (
    <AppShell>
      <div className="space-y-6 pb-20">
        {/* Top Header Bar */}
        <header className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 md:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Link
                  to={backHomeUrl}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors p-1 -mr-1 rounded-md"
                >
                  <ChevronLeft className="h-4 w-4" />
                  العودة للوحة الرئيسية
                </Link>
                <span className="text-xs text-muted-foreground/50">•</span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-500 border border-emerald-500/20">
                  <Bot className="h-3 w-3" />
                  منظومة هلاي KUBE الذكية
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-500 border border-red-500/20">
                  <Sparkles className="h-3 w-3" />
                  GenAI Studio 2.0
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2.5">
                <Megaphone className="h-6 w-6 text-red-500" />
                مركز التسويق والذكاء الاصطناعي
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                منظومة وكلاء وإعلانات متكاملة مدربة بمعايير منصة هلاي السعودية الرائدة (Hallah.ai) وأبرز العلامات التجارية
                (برق، STC، نمق، دانكن، عبدالصمد القرشي). استوديو منتجات ثلاثي الأبعاد، 15 صيغة UGC، وسوبر ايجنت مخصص لكافيه
                KUBE.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <Link
                to="/ai-kubeup-studio"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-red-500 hover:to-red-600 transition-all active:scale-95"
              >
                <Camera className="h-4 w-4" />
                استوديو الصور KUBEUP
                <ExternalLink className="h-3 w-3 opacity-70" />
              </Link>
            </div>
          </div>

          {/* Navigation Tabs - Inspired by Hallah.ai Architecture */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border/50 pt-4">
            <button
              onClick={() => setActiveTab("super_agent")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "super_agent"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Bot className="h-4 w-4" />
              سوبر ايجنت KUBE (Super Agent)
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300 font-mono">
                15 صيغة
              </span>
            </button>

            <button
              onClick={() => setActiveTab("product_studio")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "product_studio"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Layers className="h-4 w-4" />
              استوديو المنتجات ثلاثي الأبعاد و 9 صور
            </button>

            <button
              onClick={() => setActiveTab("ugc_studio")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "ugc_studio"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Video className="h-4 w-4" />
              استوديو سكريبتات الفيديو والـ UGC
              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] text-amber-500 font-mono">
                6 شخصيات
              </span>
            </button>

            <button
              onClick={() => setActiveTab("social_engine")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "social_engine"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              مولّد التغريدات والمحتوى ({SAUDI_SOCIAL_POSTS.length})
            </button>

            <button
              onClick={() => setActiveTab("visual_studio")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "visual_studio"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <ImageIcon className="h-4 w-4" />
              استوديو البرومبت البصري ({SAUDI_VISUAL_PROMPTS.length}+)
            </button>

            <button
              onClick={() => setActiveTab("trend_playbooks")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "trend_playbooks"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Flame className="h-4 w-4 text-amber-500" />
              مواسم وترندات KUBE
            </button>

            <button
              onClick={() => setActiveTab("campaigns_tracker")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "campaigns_tracker"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Calendar className="h-4 w-4" />
              متتبع الحملات النشطة ({campaigns.length})
            </button>
          </div>
        </header>

        {/* ============================================================== */}
        {/* TAB 1: KUBE SUPER AGENT (Inspired by Hallah.ai Super Agent)     */}
        {/* ============================================================== */}
        {activeTab === "super_agent" && (
          <div className="space-y-6">
            {/* Top Agent Status Bar */}
            <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-card to-card p-5 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 shadow-inner">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-foreground">سوبر ايجنت KUBE — نشط وجاهز</h2>
                      <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                        معايير هلاي AI
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      مدرب على لهجة الرياض، هوية KUBE التجارية، ربط خوادم MCP، و 15 صيغة UGC تلقائية.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                    الرصيد: <span className="font-bold text-emerald-400">غير محدود (KUBE Enterprise)</span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 px-3 py-1.5 font-mono text-[11px] text-muted-foreground">
                    الموصل: <span className="font-bold text-foreground">KUBE Kitchen POS & Menu</span>
                  </div>
                </div>
              </div>

              {/* Quick Prompt Input with Agent */}
              <div className="mt-5 pt-4 border-t border-border/50">
                <form onSubmit={handleAskSuperAgent} className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={agentUserPrompt}
                      onChange={(e) => setAgentUserPrompt(e.target.value)}
                      placeholder="اطلب من سوبر ايجنت أي فكرة أو سكريبت (مثال: فكرة ترويجية لكولد برو مع شمس الرياض)..."
                      className="w-full rounded-xl border border-border bg-background/90 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isAgentThinking}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-500 transition-all disabled:opacity-50"
                  >
                    {isAgentThinking ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        جاري التفكير والتوليد...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        أطلق الأيجنت
                      </>
                    )}
                  </button>
                </form>

                {/* Agent Response Box */}
                {agentResponse && (
                  <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        مخرجات سوبر ايجنت KUBE
                      </div>
                      <button
                        onClick={() => handleCopyText(agentResponse, "agent-res", "مخرجات سوبر ايجنت")}
                        className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-background/60 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/10"
                      >
                        <Copy className="h-3 w-3" />
                        نسخ المخرجات
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed bg-background/40 p-3 rounded-lg border border-border/40">
                      {agentResponse}
                    </pre>
                  </div>
                )}
              </div>
            </div>

            {/* 15 UGC Pre-Engineered Formats (The 15 Formats from Hallah.ai) */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-emerald-500" />
                    صيغ الـ UGC الـ 15 المجهزة لكافيه KUBE (مستوحاة من هلاي)
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    اختر صيغة المحتوى المرغوبة لتوليد سكريبت وتوجيه تصوير مجهز للشباب السعودي فوراً.
                  </p>
                </div>
                <span className="text-xs font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-lg border border-border/60 self-start sm:self-auto">
                  15 / 15 صيغة نشطة
                </span>
              </div>

              {/* UGC Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                {SAUDI_UGC_FORMATS.map((fmt) => {
                  const isSelected = selectedUgcFormat?.id === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => {
                        setSelectedUgcFormat(fmt);
                        setAgentUserPrompt(fmt.scriptPrompt);
                      }}
                      className={`flex flex-col items-start text-right p-3 rounded-xl border transition-all text-xs ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                          : "border-border/60 bg-background/50 hover:border-foreground/30 hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1.5">
                        <span className="text-xl">{fmt.icon}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                      </div>
                      <span className="font-bold text-foreground block">{fmt.title}</span>
                      <span className="text-[10px] text-muted-foreground line-clamp-2 mt-1 leading-snug">
                        {fmt.description}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Selected Format Inspection Card */}
              {selectedUgcFormat && (
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{selectedUgcFormat.icon}</span>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">{selectedUgcFormat.title}</h4>
                        <span className="text-[11px] text-muted-foreground font-mono">{selectedUgcFormat.titleEn}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAskSuperAgent()}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-3.5 py-1.5 text-xs font-semibold hover:opacity-90"
                    >
                      <Zap className="h-3.5 w-3.5 text-emerald-400" />
                      توليد سكريبت لهذه الصيغة
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-2 border-t border-border/50">
                    <div className="space-y-1">
                      <span className="font-semibold text-muted-foreground text-[11px] block">زاوية الكاميرا والعدسة:</span>
                      <p className="text-foreground/90 font-mono text-[11px] bg-background/60 p-2 rounded-lg border border-border/40">
                        {selectedUgcFormat.cameraAngle}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-muted-foreground text-[11px] block">نمط الإضاءة المطلوب:</span>
                      <p className="text-foreground/90 font-mono text-[11px] bg-background/60 p-2 rounded-lg border border-border/40">
                        {selectedUgcFormat.lighting}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <span className="font-semibold text-muted-foreground text-[11px] block">الافتتاحية الصوتية (Hook):</span>
                      <p className="text-foreground/90 text-[11px] bg-background/60 p-2 rounded-lg border border-border/40">
                        {selectedUgcFormat.scriptPrompt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="font-semibold text-muted-foreground text-[11px] block mb-1">
                      برومبت توليد الصورة (Midjourney / Kling / Flux):
                    </span>
                    <div className="flex items-center gap-2 bg-background/80 p-2.5 rounded-lg border border-border/60">
                      <p className="text-[11px] font-mono text-muted-foreground flex-1 overflow-x-auto select-all">
                        {selectedUgcFormat.visualPrompt}
                      </p>
                      <button
                        onClick={() => handleCopyPrompt(selectedUgcFormat.visualPrompt, selectedUgcFormat.id)}
                        className="rounded-md p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                        title="نسخ البرومبت"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Brand Kit Section (Brand Identity from Hallah.ai) */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-border/60">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Palette className="h-5 w-5 text-red-500" />
                    هوية KUBE التجارية (Brand Kit المعتمد لتدريب الوكلاء)
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    القواعد، النبرة، والألوان التي يلتزم بها الذكاء الاصطناعي لضمان بقاء المحتوى سعودياً أصيلاً وفخماً.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 self-start sm:self-auto bg-muted/60 p-1 rounded-xl border border-border/60">
                  <button
                    onClick={() => setBrandKitSubTab("overview")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      brandKitSubTab === "overview" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    نظرة عامة
                  </button>
                  <button
                    onClick={() => setBrandKitSubTab("rules")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      brandKitSubTab === "rules" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    قواعد الذكاء الاصطناعي
                  </button>
                  <button
                    onClick={() => setBrandKitSubTab("palette")}
                    className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                      brandKitSubTab === "palette" ? "bg-foreground text-background shadow-xs" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    لوحة الألوان
                  </button>
                </div>
              </div>

              {brandKitSubTab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">اسم العلامة:</span>
                    <span className="text-sm font-bold text-foreground block">{KUBE_BRAND_KIT.brandNameAr}</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">{KUBE_BRAND_KIT.brandNameEn}</span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">الشعار النصي (Slogan):</span>
                    <span className="text-xs font-semibold text-foreground block">{KUBE_BRAND_KIT.sloganAr}</span>
                    <span className="text-[10px] text-muted-foreground font-mono block">{KUBE_BRAND_KIT.sloganEn}</span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">الجمهور المستهدف:</span>
                    <span className="text-xs text-foreground/90 block leading-relaxed">{KUBE_BRAND_KIT.targetAudience}</span>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1">
                    <span className="text-[11px] text-muted-foreground block font-medium">نبرة المحتوى:</span>
                    <span className="text-xs font-semibold text-emerald-400 block">{KUBE_BRAND_KIT.brandTone}</span>
                  </div>
                </div>
              )}

              {brandKitSubTab === "rules" && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-foreground block mb-2">
                    القيود التوجيهية الإلزامية (System Prompt Rules):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {KUBE_BRAND_KIT.rulesAndConstraints.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 rounded-xl border border-border/60 bg-background/60 p-3">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-foreground/90 leading-relaxed">{rule}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-border/40">
                    <span className="text-[11px] text-muted-foreground font-semibold block mb-1.5">
                      الكلمات المفتاحية النشطة في المحرك:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {KUBE_BRAND_KIT.brandKeywords.map((kw, i) => (
                        <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground font-mono">
                          #{kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {brandKitSubTab === "palette" && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {KUBE_BRAND_KIT.colorPalette.map((col, idx) => (
                    <div key={idx} className="rounded-xl border border-border/70 bg-background p-3 space-y-2 text-xs">
                      <div
                        className="h-12 w-full rounded-lg border border-white/10 shadow-inner"
                        style={{ backgroundColor: col.hex }}
                      />
                      <div>
                        <span className="font-bold text-foreground block">{col.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground block">{col.hex}</span>
                        <span className="text-[10px] text-muted-foreground block mt-1">{col.role}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: 3D PRODUCT & ADS STUDIO (Inspired by Hallah Product App) */}
        {/* ============================================================== */}
        {activeTab === "product_studio" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-red-500" />
                    استوديو المنتجات ثلاثي الأبعاد وباقة الـ 9 صور الإعلانية
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    تحكم دقيق باتجاه الإضاءة والظلال، نسب العرض، وخلفيات كافيه KUBE الفاخرة لتوليد صور إعلانية ترفع المبيعات.
                  </p>
                </div>

                <button
                  onClick={handleGenerate9Pack}
                  disabled={isGenerating9Pack}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:from-red-500 hover:to-red-600 transition-all self-start sm:self-auto disabled:opacity-50"
                >
                  {isGenerating9Pack ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      جاري توليد باقة الـ 9 صور...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      توليد باقة الـ 9 صور إعلانية بنقرة واحدة
                    </>
                  )}
                </button>
              </div>

              {/* Studio Controls Matrix */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-4 border-t border-border/50 text-xs">
                {/* 1. Lighting & Shadows Direction */}
                <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Sun className="h-4 w-4 text-amber-500" />
                      اتجاه الإضاءة والظلال
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">3D Lighting</span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "top", label: "أعلى (Top)" },
                      { id: "front", label: "أمام (Front)" },
                      { id: "right", label: "يمين (Right)" },
                      { id: "left", label: "يسار (Left)" },
                      { id: "rim_back", label: "خلفي سينمائي (Rim)" },
                      { id: "bottom", label: "سفلي ناعم" },
                    ].map((dir) => (
                      <button
                        key={dir.id}
                        onClick={() => setLightingDirection(dir.id as any)}
                        className={`rounded-lg py-2 px-1 text-center font-medium transition-all ${
                          lightingDirection === dir.id
                            ? "bg-foreground text-background shadow-xs font-bold"
                            : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        {dir.label}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <span className="text-[11px] text-muted-foreground font-medium block mb-1.5">شدة وطبيعة الضوء:</span>
                    <div className="flex gap-1.5">
                      {[
                        { id: "soft_diffused", label: "ناعم ومشتت (Studio Soft)" },
                        { id: "harsh_sunlight", label: "شمس الرياض الحادة" },
                        { id: "cinematic_moody", label: "سينمائي عنبري داكن" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setLightingIntensity(item.id as any)}
                          className={`flex-1 rounded-lg py-1.5 px-2 text-center text-[11px] font-medium transition-all ${
                            lightingIntensity === item.id
                              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold"
                              : "bg-muted/30 text-muted-foreground hover:bg-muted"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 2. Aspect Ratio & Dimensions */}
                <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Maximize2 className="h-4 w-4 text-emerald-500" />
                      نسبة العرض والأبعاد
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Aspect Ratio</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "1:1", label: "1:1 مربع (متجر + بوست)", sub: "1080x1080" },
                      { id: "9:16", label: "9:16 رأسي (تيك توك وستوري)", sub: "1080x1920" },
                      { id: "4:5", label: "4:5 فيد إنستغرام", sub: "1080x1350" },
                      { id: "16:9", label: "16:9 أفقي عريض (بانر)", sub: "1920x1080" },
                    ].map((ratio) => (
                      <button
                        key={ratio.id}
                        onClick={() => setProductAspectRatio(ratio.id as any)}
                        className={`rounded-lg p-2 text-right transition-all border ${
                          productAspectRatio === ratio.id
                            ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                            : "border-border/50 bg-background/40 text-muted-foreground hover:bg-muted"
                        }`}
                      >
                        <span className="font-bold block">{ratio.label}</span>
                        <span className="text-[10px] opacity-70 font-mono block">{ratio.sub}</span>
                      </button>
                    ))}
                  </div>

                  <div>
                    <label className="text-[11px] text-muted-foreground font-medium block mb-1">اسم المنتج المستهدف:</label>
                    <input
                      type="text"
                      value={customProductTitle}
                      onChange={(e) => setCustomProductTitle(e.target.value)}
                      placeholder="مثال: فلات وايت، كولد برو كيني، فرنش توست كراميل..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    />
                  </div>
                </div>

                {/* 3. Selected Backdrop Studio Preset */}
                <div className="rounded-xl border border-border/70 bg-background/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-purple-500" />
                      خلفية الاستوديو المعمارية
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">Backdrop</span>
                  </div>

                  <div className="space-y-1.5">
                    {KUBE_PRODUCT_STUDIO_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setSelectedStudioPreset(preset)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-right transition-all border ${
                          selectedStudioPreset.id === preset.id
                            ? "border-purple-500 bg-purple-500/10 text-purple-300 font-bold"
                            : "border-border/40 bg-background/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`}
                      >
                        <div className="truncate">
                          <span className="block truncate">{preset.name}</span>
                          <span className="text-[10px] font-mono opacity-60 block">{preset.backdropName}</span>
                        </div>
                        <div
                          className="h-4 w-4 rounded-full border border-white/20 shrink-0 mr-2"
                          style={{ backgroundColor: preset.backdropColor }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Active Studio Prompt Inspector */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-red-500" />
                    البرومبت المعماري لتوليد الصورة الإعلانية (جاهز للإطلاق في Midjourney / Kling):
                  </span>
                  <button
                    onClick={() => handleCopyPrompt(selectedStudioPreset.englishPrompt, selectedStudioPreset.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1 text-xs font-semibold hover:opacity-90"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    نسخ برومبت الاستوديو
                  </button>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="bg-background/80 p-3 rounded-lg border border-border/60 text-foreground leading-relaxed">
                    {selectedStudioPreset.arabicPrompt}
                  </p>
                  <p className="bg-background/80 p-3 rounded-lg border border-border/60 font-mono text-[11px] text-muted-foreground leading-relaxed select-all">
                    {selectedStudioPreset.englishPrompt}
                  </p>
                </div>
              </div>

              {/* 9-Shot Ad Pack Results */}
              {generated9Pack && (
                <div className="mt-6 pt-5 border-t border-border/60 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                        <Award className="h-4 w-4 text-emerald-500" />
                        باقة الـ 9 صور الإعلانية لمنتج ({customProductTitle})
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        9 زوايا تسويقية متنوعة تغطي فيد إنستغرام، ستوري تيك توك، وعروض الخصومات.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {generated9Pack.map((shot, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-bold text-foreground">{shot.title}</span>
                            <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                              {shot.tag}
                            </span>
                          </div>
                          <p className="text-[11px] font-mono text-muted-foreground bg-background/60 p-2.5 rounded-lg border border-border/40 leading-relaxed line-clamp-4">
                            {shot.prompt}
                          </p>
                        </div>
                        <button
                          onClick={() => handleCopyPrompt(shot.prompt, `shot-${idx}`)}
                          className="inline-flex items-center justify-center gap-1.5 w-full rounded-lg border border-border/60 bg-muted/40 py-1.5 text-[11px] font-semibold text-foreground hover:bg-muted"
                        >
                          <Copy className="h-3 w-3" />
                          نسخ برومبت هذه الزاوية
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: UGC VIDEO STUDIO (Inspired by Hallah UGC Studio 2.0)     */}
        {/* ============================================================== */}
        {activeTab === "ugc_studio" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 md:p-6 shadow-sm space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Video className="h-5 w-5 text-amber-500" />
                  استوديو سكريبتات الفيديو والـ UGC (تدفق الـ 3 خطوات كمنصة هلاي)
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  اختر صانع المحتوى السعودي الافتراضي، حدد نبرة ومشاعر الفيديو، وولّد سكريبت إعلاني متكامل مشهدًا بمشهد مع
                  توجيه حركة الكاميرا والتعليق الصوتي.
                </p>
              </div>

              {/* Step 1: Saudi Personas Bank */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                      1
                    </span>
                    <h3 className="text-sm font-bold text-foreground">
                      بنك الشخصيات السعودية لـ KUBE (اختر بطل الفيديو)
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/50 self-start sm:self-auto text-xs">
                    <button
                      onClick={() => setCreatorGenderFilter("all")}
                      className={`px-3 py-1 rounded-lg font-medium ${
                        creatorGenderFilter === "all" ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      الكل ({SAUDI_CREATOR_PERSONAS.length})
                    </button>
                    <button
                      onClick={() => setCreatorGenderFilter("male")}
                      className={`px-3 py-1 rounded-lg font-medium ${
                        creatorGenderFilter === "male" ? "bg-foreground text-background" : "text-muted-foreground"
                      }`}
                    >
                      ذكور
                    </button>
                    <button
                      onClick={() => setCreatorGenderFilter("female")}
                      className={`px-3 py-1 rounded-lg font-medium ${
                        creatorGenderFilter === "female" ? "bg-foreground text-background" : "text-muted-foreground"
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
                        className={`flex flex-col items-center text-center p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? "border-amber-500 bg-amber-500/10 shadow-sm"
                            : "border-border/60 bg-background/50 hover:border-foreground/30 hover:bg-muted/30"
                        }`}
                      >
                        <div className="relative mb-2">
                          <img
                            src={creator.avatarUrl}
                            alt={creator.name}
                            className="h-16 w-16 rounded-full object-cover border-2 border-border shadow-xs"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          )}
                        </div>
                        <span className="font-bold text-xs text-foreground block">{creator.name}</span>
                        <span className="text-[10px] text-muted-foreground block truncate max-w-full">
                          {creator.role}
                        </span>
                        <span className="text-[9px] text-amber-500/90 font-mono mt-0.5 block truncate max-w-full">
                          {creator.city.split("—")[1] || creator.city}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Settings, Dialect & Emotion */}
              <div className="space-y-3 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                    2
                  </span>
                  <h3 className="text-sm font-bold text-foreground">
                    تحديد المشاعر والمشروب المستهدف لـ {selectedCreator.name}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                    <span className="font-medium text-muted-foreground text-[11px] block">المشروب المفضل للشخصية:</span>
                    <span className="font-bold text-foreground block">{selectedCreator.favoriteKubeDrink}</span>
                    <span className="text-[10px] text-muted-foreground block">{selectedCreator.bio}</span>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                    <span className="font-medium text-muted-foreground text-[11px] block">اللهجة والنبرة الصوتية:</span>
                    <span className="font-semibold text-emerald-400 block">{selectedCreator.dialect}</span>
                    <span className="text-[10px] text-muted-foreground block leading-snug">{selectedCreator.voiceStyle}</span>
                  </div>

                  <div className="rounded-xl border border-border/70 bg-background/50 p-3.5 space-y-1.5">
                    <span className="font-medium text-muted-foreground text-[11px] block">المشاعر وحالة الفيديو:</span>
                    <select
                      value={videoEmotion}
                      onChange={(e) => setVideoEmotion(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                    >
                      <option value="روقان وهدوء مع لمسة ذكاء">روقان وهدوء مع لمسة ذكاء (Specialty Coffee)</option>
                      <option value="حماس وطاقة وسرعة دوام">حماس وطاقة وسرعة دوام (Morning Hustle)</option>
                      <option value="عفوي ومرح وميمز شبابية">عفوي ومرح وميمز شبابية (Barq/STC Style)</option>
                      <option value="فخامة واعتزاز بالأصالة">فخامة واعتزاز بالأصالة (Luxury Heritage)</option>
                      <option value="تحدي وتوفير قوي للطلاب">تحدي وتوفير قوي للطلاب (Student FOMO)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Script Templates & Custom Generation */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold">
                      3
                    </span>
                    <h3 className="text-sm font-bold text-foreground">سكريبت الفيديو الإعلاني المجهز</h3>
                  </div>

                  <button
                    onClick={handleGenerateCustomScript}
                    disabled={isGeneratingScript}
                    className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-500 transition-all self-start sm:self-auto disabled:opacity-50"
                  >
                    {isGeneratingScript ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        جاري كتابة السكريبت...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3.5 w-3.5" />
                        توليد سكريبت جديد لشخصية ({selectedCreator.name})
                      </>
                    )}
                  </button>
                </div>

                {/* Pre-made Templates Tabs */}
                <div className="flex flex-wrap gap-2">
                  {KUBE_VIDEO_SCRIPTS.map((script) => (
                    <button
                      key={script.id}
                      onClick={() => setActiveScriptTemplate(script)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-semibold border transition-all ${
                        activeScriptTemplate.id === script.id
                          ? "border-amber-500 bg-amber-500/10 text-amber-400"
                          : "border-border/60 bg-background/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {script.title} ({script.durationSeconds}ث)
                    </button>
                  ))}
                </div>

                {/* Scene-by-Scene Visual Breakdown */}
                <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/50">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{activeScriptTemplate.title}</h4>
                      <span className="text-xs text-muted-foreground">
                        المنتج المستهدف: <span className="text-foreground font-semibold">{activeScriptTemplate.targetProduct}</span>
                      </span>
                    </div>
                    <span className="rounded-md bg-amber-500/20 px-2.5 py-1 text-xs font-mono font-bold text-amber-400">
                      ⏱ {activeScriptTemplate.durationSeconds} ثانية
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Scene 1 */}
                    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-amber-500">
                          <Film className="h-3.5 w-3.5" />
                          المشهد الأول: Hook البداية
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{activeScriptTemplate.hookScene.duration}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">حركة الكاميرا والبصريات:</span>
                        <p className="text-foreground/90 text-[11px] leading-snug">{activeScriptTemplate.hookScene.visualAction}</p>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-border/40">
                        <span className="text-[10px] text-emerald-400 block font-medium flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          التعليق الصوتي ({selectedCreator.name}):
                        </span>
                        <p className="text-foreground text-[11px] font-semibold leading-relaxed bg-background/50 p-2 rounded-lg border border-border/40">
                          "{activeScriptTemplate.hookScene.voiceover}"
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 block font-mono">
                        🎵 {activeScriptTemplate.hookScene.soundEffect}
                      </span>
                    </div>

                    {/* Scene 2 */}
                    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-red-500">
                          <Coffee className="h-3.5 w-3.5" />
                          المشهد الثاني: التجربة والمنتج
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{activeScriptTemplate.bodyScene.duration}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">حركة الكاميرا والبصريات:</span>
                        <p className="text-foreground/90 text-[11px] leading-snug">{activeScriptTemplate.bodyScene.visualAction}</p>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-border/40">
                        <span className="text-[10px] text-emerald-400 block font-medium flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          التعليق الصوتي ({selectedCreator.name}):
                        </span>
                        <p className="text-foreground text-[11px] font-semibold leading-relaxed bg-background/50 p-2 rounded-lg border border-border/40">
                          "{activeScriptTemplate.bodyScene.voiceover}"
                        </p>
                      </div>
                      <span className="text-[10px] text-muted-foreground/80 block font-mono">
                        🎵 {activeScriptTemplate.bodyScene.soundEffect}
                      </span>
                    </div>

                    {/* Scene 3 */}
                    <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground flex items-center gap-1.5 text-emerald-500">
                          <Zap className="h-3.5 w-3.5" />
                          المشهد الثالث: العرض والـ CTA
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{activeScriptTemplate.ctaScene.duration}</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground block font-medium">حركة الكاميرا والبصريات:</span>
                        <p className="text-foreground/90 text-[11px] leading-snug">{activeScriptTemplate.ctaScene.visualAction}</p>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-border/40">
                        <span className="text-[10px] text-emerald-400 block font-medium flex items-center gap-1">
                          <Volume2 className="h-3 w-3" />
                          التعليق الصوتي ({selectedCreator.name}):
                        </span>
                        <p className="text-foreground text-[11px] font-semibold leading-relaxed bg-background/50 p-2 rounded-lg border border-border/40">
                          "{activeScriptTemplate.ctaScene.voiceover}"
                        </p>
                      </div>
                      <span className="text-[10px] text-amber-400 block font-semibold">
                        📲 {activeScriptTemplate.ctaScene.screenText}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Generated Script Box */}
                {generatedCustomScript && (
                  <div className="rounded-xl border border-amber-500/40 bg-card p-4 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4" />
                        السكريبت الإعلاني المخصص الجديد لـ ({selectedCreator.name})
                      </span>
                      <button
                        onClick={() => handleCopyText(generatedCustomScript, "custom-scr", "السكريبت الإعلاني")}
                        className="inline-flex items-center gap-1 rounded-lg bg-foreground text-background px-3 py-1 text-xs font-semibold hover:opacity-90"
                      >
                        <Copy className="h-3 w-3" />
                        نسخ السكريبت
                      </button>
                    </div>
                    <pre className="whitespace-pre-wrap font-sans text-xs text-foreground/90 leading-relaxed bg-background/40 p-3.5 rounded-lg border border-border/50">
                      {generatedCustomScript}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: SOCIAL ENGINE (210 Saudi Posts Bank & Live Generator)    */}
        {/* ============================================================== */}
        {activeTab === "social_engine" && (
          <div className="space-y-6">
            {/* Live AI Generator Widget */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-r from-red-950/20 via-card to-card p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <Wand2 className="h-5 w-5 text-red-500" />
                <h2 className="text-base font-bold text-foreground">
                  المولّد اللحظي للمنشورات والتغريدات الفيروسية بالذكاء الاصطناعي
                </h2>
              </div>
              <p className="text-xs text-muted-foreground">
                اكتب اسم المنتج أو فكرة العرض، واختر أسلوب العلامة لتحصل على نص فوري مدرب ومُحكم بالهاشتاقات المناسبة.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1">
                <div className="md:col-span-6">
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    placeholder="مثال: فلات وايت، كرواسون لوز، عرض الصباح، كولد برو..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value as BrandPersona)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  >
                    <option value="barq_stc">⚡️ أسلوب برق و STC (شبابي ذكي ومرح)</option>
                    <option value="namq_address">☕️ أسلوب نمق وعنوان القهوة (روقان ومختص)</option>
                    <option value="dunkin">🥐 أسلوب دانكن (عروض قوية ودوامات)</option>
                    <option value="qurashi_luxury">👑 أسلوب عبدالصمد القرشي (فخامة وهيبة)</option>
                    <option value="interactive_viral">🔥 أسلوب تفاعلي وجدلي (Viral Hook)</option>
                    <option value="hala_ai">🤖 أسلوب هلا AI (تقني وتحفيز مباشر)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleGenerateCustomContent}
                    disabled={isGenerating}
                    className="w-full h-full rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <span className="flex items-center gap-1">
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                        توليد...
                      </span>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        توليد فوري
                      </>
                    )}
                  </button>
                </div>
              </div>

              {generatedResult && (
                <div className="mt-3 rounded-xl border border-border/80 bg-background/60 p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-foreground flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5 text-red-500" />
                      النتيجة المولدة:
                    </span>
                    <button
                      onClick={() => handleCopyText(generatedResult, "gen-custom", "النص المولد")}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground hover:bg-muted"
                    >
                      <Copy className="h-3 w-3" />
                      نسخ النص
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-xs text-foreground/90 leading-relaxed font-sans">
                    {generatedResult}
                  </p>
                </div>
              )}
            </div>

            {/* Filter Bar */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
              <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                <div className="relative flex-1">
                  <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={socialSearch}
                    onChange={(e) => setSocialSearch(e.target.value)}
                    placeholder="ابحث في نصوص التغريدات، الهاشتاقات، أو الأفكار..."
                    className="w-full rounded-xl border border-border bg-background pr-9 pl-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">كل العلامات والنبرات ({SAUDI_SOCIAL_POSTS.length})</option>
                    <option value="barq_stc">برق / STC (شبابي ومرح)</option>
                    <option value="namq_address">نمق / عنوان القهوة (روقان ومختص)</option>
                    <option value="dunkin">دانكن (عروض ودوام)</option>
                    <option value="qurashi_luxury">القرشي (فخامة)</option>
                    <option value="interactive_viral">تفاعلي / جدلي</option>
                  </select>

                  <select
                    value={selectedSocialCategory}
                    onChange={(e) => setSelectedSocialCategory(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">كل التصنيفات</option>
                    <option value="morning">صباح ودوام</option>
                    <option value="specialty">قهوة مختصة وروقان</option>
                    <option value="work_exam">مذاكرة وفاينلز</option>
                    <option value="night_vibe">سهرات ومساء الرياض</option>
                    <option value="deals">عروض وتوفير</option>
                    <option value="national">مناسبات وطنية</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
                <span>
                  يظهر <strong className="text-foreground">{filteredSocialPosts.length}</strong> منشور من أصل{" "}
                  {SAUDI_SOCIAL_POSTS.length}
                </span>
                <span>تم تحديث النماذج على لهجة نجدية سريعة ومحببة</span>
              </div>
            </div>

            {/* Social Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredSocialPosts.map((post) => {
                const isCopied = copiedPostId === post.id;
                const personaBadgeColors: Record<BrandPersona, string> = {
                  barq_stc: "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  namq_address: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  dunkin: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  qurashi_luxury: "bg-purple-500/10 text-purple-500 border-purple-500/20",
                  interactive_viral: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  hala_ai: "bg-teal-500/10 text-teal-500 border-teal-500/20",
                };

                return (
                  <div
                    key={post.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-4 transition-all hover:border-foreground/40 hover:shadow-md"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${
                            personaBadgeColors[post.brandPersona]
                          }`}
                        >
                          {post.brandLabel}
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground">
                          {post.suggestedChannel}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-foreground/80 block line-clamp-1">
                          {post.hookHeadline}
                        </span>
                        <p className="whitespace-pre-line text-xs text-foreground/90 leading-relaxed font-sans">
                          {post.text}
                        </p>
                      </div>

                      {post.hashtags && post.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {post.hashtags.map((tag, idx) => (
                            <span key={idx} className="text-[10px] text-muted-foreground hover:text-foreground font-mono">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate max-w-[170px]">
                        الفئة: {post.targetAudience}
                      </span>
                      <button
                        onClick={() => handleCopyText(`${post.text}\n\n${post.hashtags.join(" ")}`, post.id, "المنشور")}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-foreground hover:bg-foreground hover:text-background"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            تم النسخ!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            نسخ التغريدة
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5: VISUAL STUDIO (110+ Prompts)                             */}
        {/* ============================================================== */}
        {activeTab === "visual_studio" && (
          <div className="space-y-6">
            {/* Visual Studio Intro Bar */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-3 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                    <Camera className="h-5 w-5 text-red-500" />
                    مكتبة برومتات الإعلانات التجارية والتصوير الفوتوغرافي (110+ برومبت)
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    برومتات مدربة بأعلى دقة لبرامج Midjourney, Flux, Kling, Ideogram, DALL-E لإنتاج صور ومقاطع سينمائية
                    لكافيه KUBE.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <select
                    value={selectedVisualCategory}
                    onChange={(e) => setSelectedVisualCategory(e.target.value as any)}
                    className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:outline-none"
                  >
                    <option value="all">كل الفئات البصرية ({SAUDI_VISUAL_PROMPTS.length})</option>
                    <option value="macro_beverage">تصوير ماكرو المشروبات والقهوة</option>
                    <option value="youth_lifestyle">نمط حياة شباب الرياض (16-30)</option>
                    <option value="dark_luxury">فخامة ليلية وطابع Nothing</option>
                    <option value="saudi_heritage">مناسبات وهوية سعودية</option>
                    <option value="commercial_promo">إعلانات تجارية وعروض</option>
                  </select>

                  <div className="relative">
                    <Search className="absolute right-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={visualSearch}
                      onChange={(e) => setVisualSearch(e.target.value)}
                      placeholder="بحث في البرومبتات..."
                      className="rounded-xl border border-border bg-background pr-8 pl-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Prompts Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVisualPrompts.map((prompt) => {
                const isCopied = copiedPromptId === prompt.id;
                return (
                  <div
                    key={prompt.id}
                    className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 shadow-xs transition-all hover:border-foreground/40 hover:shadow-md flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-500 border border-red-500/20">
                          {prompt.categoryLabel}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-muted-foreground">
                            نسبة العرض: {prompt.aspectRatio}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-sm text-foreground">{prompt.title}</h3>

                      <div className="rounded-xl bg-muted/40 p-3 space-y-1 border border-border/50">
                        <span className="text-[10px] font-semibold text-muted-foreground block">الوصف بالعربية:</span>
                        <p className="text-xs text-foreground/90 leading-relaxed font-sans">{prompt.arabicPrompt}</p>
                      </div>

                      <div className="rounded-xl bg-background p-3 space-y-1.5 border border-border/70">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-muted-foreground font-mono">
                            ENGLISH PROMPT (PRODUCTION):
                          </span>
                          <button
                            onClick={() => handleCopyPrompt(prompt.englishPrompt, prompt.id)}
                            className="text-[11px] font-semibold text-red-500 hover:text-red-400 flex items-center gap-1"
                          >
                            {isCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                            {isCopied ? "تم النسخ" : "نسخ البرومبت"}
                          </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono leading-relaxed select-all">
                          {prompt.englishPrompt}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground pt-1">
                        <div>
                          <strong className="text-foreground/80 block">الإضاءة:</strong>
                          <span className="truncate block">{prompt.lighting}</span>
                        </div>
                        <div>
                          <strong className="text-foreground/80 block">العدسة والكاميرا:</strong>
                          <span className="truncate block font-mono">{prompt.cameraLens}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">المصدر الملهم: {prompt.brandInspiration}</span>
                      <button
                        onClick={() => handleCopyPrompt(prompt.englishPrompt, prompt.id)}
                        className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                          isCopied
                            ? "bg-emerald-600 text-white"
                            : "bg-foreground text-background hover:opacity-90"
                        }`}
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            تم النسخ للحافظة
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            نسخ البرومبت الكامل
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 6: TREND PLAYBOOKS                                         */}
        {/* ============================================================== */}
        {activeTab === "trend_playbooks" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border/80 bg-card p-5 space-y-2 shadow-xs">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Flame className="h-5 w-5 text-amber-500" />
                كتيب الحملات السلوكية ومواسم السعودية (Trend Playbooks)
              </h2>
              <p className="text-xs text-muted-foreground">
                استراتيجيات تسويقية جاهزة للتنفيذ تتماشى مع السلوك الشرائي للشباب السعودي (موسم الأمطار، الفاينلز، إيداع
                الرواتب، واليوم الوطني).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SAUDI_TREND_PLAYBOOKS.map((pb) => (
                <div
                  key={pb.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col justify-between space-y-4 hover:border-foreground/40 transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-500 border border-amber-500/20">
                        {pb.season}
                      </span>
                      <span className="text-[10px] font-mono text-muted-foreground">{pb.targetAge}</span>
                    </div>

                    <h3 className="font-bold text-sm text-foreground">{pb.title}</h3>

                    <div className="rounded-xl bg-muted/40 p-3 space-y-1 border border-border/40">
                      <span className="text-[10px] font-semibold text-muted-foreground block">الهوك والافتتاحية:</span>
                      <p className="text-xs text-foreground/90 font-medium leading-relaxed">"{pb.hook}"</p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <strong className="text-foreground/90 block text-[11px]">فكرة التفعيل التسويقي:</strong>
                        <p className="text-muted-foreground text-[11px] leading-relaxed">{pb.activationIdea}</p>
                      </div>

                      <div>
                        <strong className="text-foreground/90 block text-[11px]">العرض والخصم المقترح:</strong>
                        <span className="text-xs font-bold text-red-500">{pb.suggestedDiscount}</span>
                      </div>

                      <div>
                        <strong className="text-foreground/90 block text-[11px]">المنتجات المقترحة:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pb.recommendedProducts.map((p, i) => (
                            <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border/50">
                    <button
                      onClick={() => handleActivatePlaybook(pb)}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-foreground text-background py-2 text-xs font-semibold hover:opacity-90 transition-all shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      تفعيل الحملة ونقلها للمتابعة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 7: CAMPAIGNS TRACKER                                       */}
        {/* ============================================================== */}
        {activeTab === "campaigns_tracker" && (
          <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="rounded-2xl border border-border/80 bg-card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-red-500" />
                  جدول ومتابعة الحملات التسويقية النشطة
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إدارة الميزانيات، فترات الخصم، والمنصات المستهدفة لكافيه ومطبخ KUBE.
                </p>
              </div>

              <button
                onClick={() => setShowAddCampModal(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition-all shadow-xs self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" />
                إضافة حملة جديدة
              </button>
            </div>

            {/* Campaign Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <span className="text-[11px] text-muted-foreground block">إجمالي الحملات</span>
                <span className="text-2xl font-mono font-bold text-foreground mt-1 block">{campaigns.length}</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <span className="text-[11px] text-muted-foreground block">الحملات النشطة</span>
                <span className="text-2xl font-mono font-bold text-emerald-500 mt-1 block">
                  {campaigns.filter((c) => c.status === "active").length}
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <span className="text-[11px] text-muted-foreground block">الحملات المجدولة</span>
                <span className="text-2xl font-mono font-bold text-amber-500 mt-1 block">
                  {campaigns.filter((c) => c.status === "scheduled").length}
                </span>
              </div>
              <div className="rounded-xl border border-border/80 bg-card p-4">
                <span className="text-[11px] text-muted-foreground block">المسودات</span>
                <span className="text-2xl font-mono font-bold text-muted-foreground mt-1 block">
                  {campaigns.filter((c) => c.status === "draft").length}
                </span>
              </div>
            </div>

            {/* Campaigns Table */}
            <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-muted/50 border-b border-border/60 text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-3 px-4">اسم الحملة / العرض</th>
                      <th className="py-3 px-4">المنصات</th>
                      <th className="py-3 px-4">العرض / الخصم</th>
                      <th className="py-3 px-4">الميزانية</th>
                      <th className="py-3 px-4">الفترة</th>
                      <th className="py-3 px-4">الحالة</th>
                      <th className="py-3 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {campaigns.map((camp) => {
                      const statusMap = {
                        active: { label: "نشط حالياً", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
                        scheduled: { label: "مجدول", class: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
                        draft: { label: "مسودة", class: "bg-muted text-muted-foreground border-border/40" },
                      };

                      return (
                        <tr key={camp.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="font-bold text-foreground block">{camp.name}</span>
                            {camp.target && (
                              <span className="text-[10px] text-muted-foreground block mt-0.5">{camp.target}</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-medium text-foreground/80">{camp.platform}</td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-red-500">{camp.discount}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-muted-foreground">{camp.budget || "—"}</td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-muted-foreground">
                            {camp.startDate} إلى {camp.endDate}
                          </td>
                          <td className="py-3.5 px-4">
                            <button
                              onClick={() => handleToggleStatus(camp.id)}
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border transition-all ${
                                statusMap[camp.status].class
                              }`}
                              title="اضغط لتغيير الحالة"
                            >
                              {statusMap[camp.status].label}
                            </button>
                          </td>
                          <td className="py-3.5 px-4 text-center">
                            <button
                              onClick={() => handleDeleteCampaign(camp.id)}
                              className="p-1 text-muted-foreground hover:text-red-500 rounded-md transition-colors"
                              title="حذف الحملة"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add Campaign Modal */}
            {showAddCampModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-border/60">
                    <h3 className="text-base font-bold text-foreground">إضافة حملة تسويقية جديدة</h3>
                    <button
                      onClick={() => setShowAddCampModal(false)}
                      className="text-muted-foreground hover:text-foreground text-sm font-bold p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <form onSubmit={handleAddCampaign} className="space-y-3.5 text-xs">
                    <div>
                      <label className="block font-medium text-foreground mb-1">اسم الحملة أو العرض:</label>
                      <input
                        type="text"
                        required
                        value={newCampName}
                        onChange={(e) => setNewCampName(e.target.value)}
                        placeholder="مثال: خصم الصباح للشركات..."
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-foreground mb-1">المنصات المستهدفة:</label>
                        <input
                          type="text"
                          value={newCampPlatform}
                          onChange={(e) => setNewCampPlatform(e.target.value)}
                          placeholder="مثال: منصة X + إنستغرام"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-foreground mb-1">الميزانية التقديرية:</label>
                        <input
                          type="text"
                          value={newCampBudget}
                          onChange={(e) => setNewCampBudget(e.target.value)}
                          placeholder="مثال: 1,500 ريال"
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-medium text-foreground mb-1">العرض أو الخصم:</label>
                      <input
                        type="text"
                        value={newCampDiscount}
                        onChange={(e) => setNewCampDiscount(e.target.value)}
                        placeholder="مثال: خصم 20% أو قهوة مجانية"
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block font-medium text-foreground mb-1">تاريخ البدء:</label>
                        <input
                          type="date"
                          value={newCampStartDate}
                          onChange={(e) => setNewCampStartDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-foreground mb-1">تاريخ الانتهاء:</label>
                        <input
                          type="date"
                          value={newCampEndDate}
                          onChange={(e) => setNewCampEndDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-background px-3 py-2 focus:outline-none focus:ring-1 focus:ring-foreground"
                        />
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/40 flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddCampModal(false)}
                        className="rounded-xl px-4 py-2 text-muted-foreground hover:bg-muted font-medium"
                      >
                        إلغاء
                      </button>
                      <button
                        type="submit"
                        className="rounded-xl bg-foreground text-background px-5 py-2 font-semibold hover:opacity-90 shadow-sm"
                      >
                        حفظ الحملة
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
