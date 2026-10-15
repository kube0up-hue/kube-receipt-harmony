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
          "المنظومة التسويقية الذكية لكافيه ومطبخ KUBE المدربة على أبرز العلامات السعودية (برق، STC، نمق، دانكن، القرشي، هلا AI).",
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

type TabType = "social_engine" | "visual_studio" | "trend_playbooks" | "campaigns_tracker";

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
    discount: "كومبو 15 ريال حتى 11 ص",
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
  const backHomeUrl = primaryRoleHome(currentUser.role);

  const [activeTab, setActiveTab] = useState<TabType>("social_engine");

  // Tab 1 (Social Engine) States
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

  // Tab 2 (Visual Studio) States
  const [selectedVisualCategory, setSelectedVisualCategory] = useState<VisualCategory | "all">("all");
  const [visualSearch, setVisualSearch] = useState("");
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  // Tab 4 (Campaigns) States
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

  // Filtered Social Posts
  const filteredSocialPosts = useMemo(() => {
    return SAUDI_SOCIAL_POSTS.filter((post) => {
      if (selectedPersona !== "all" && post.brandPersona !== selectedPersona) return false;
      if (selectedSocialCategory !== "all" && post.category !== selectedSocialCategory) return false;
      if (selectedChannel !== "all" && post.suggestedChannel !== selectedChannel) return false;
      if (socialSearch.trim()) {
        const query = socialSearch.toLowerCase();
        const matchText = post.text.toLowerCase().includes(query);
        const matchHook = post.hookHeadline.toLowerCase().includes(query);
        const matchTags = post.hashtags.some((h) => h.toLowerCase().includes(query));
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
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchAr = item.arabicPrompt.toLowerCase().includes(query);
        const matchEn = item.englishPrompt.toLowerCase().includes(query);
        const matchBrand = item.brandInspiration.toLowerCase().includes(query);
        if (!matchTitle && !matchAr && !matchEn && !matchBrand) return false;
      }
      return true;
    });
  }, [selectedVisualCategory, visualSearch]);

  // Instant AI Generator function simulation
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
        result = `وضعك الحين وأنت تفكر في ${kw}؟ 🥱\nلا تشيل هم الزحمة ولا وجع الراس، باريستا KUBE مجهزه لك بأعلى روقان يخلي يومك يطير أسرع من اتصال 5G! مرنا وخلك بالصدارة ⚡️🖤\n\n#كافيه_كيوب #الرياض #روقان_الدوام #${kw.replace(/\s+/g, "_")}`;
      } else if (customTone === "namq_address") {
        result = `بين هدوء الصباح وتناغم التفاصيل، يأتي ${kw} في KUBE كقصيدة تُروى بهدوء. قوام متوازن وإيحاءات آسرة خُلقت خصيصاً لمن يُقدّر لحظات الصفاء الحقيقية ☕️✨\n\n#قهوة_مختصة #KUBE_Specialty #شتاء_الرياض #${kw.replace(/\s+/g, "_")}`;
      } else if (customTone === "dunkin") {
        result = `عرض ما يتعوض على ${kw}! 🔥\nاطلب الآن واحصل على قهوة اليوم أو كوكيز طازج مجاناً حتى الساعة 11 صباحاً. التوفير الذكي والجودة الفاخرة ما تلقاها إلا في KUBE! 🥐☕️\n\n#عروض_KUBE #فطور_الصباح #عروض_الرياض #${kw.replace(/\s+/g, "_")}`;
      } else if (customTone === "qurashi_luxury") {
        result = `سحر المذاق الأصيل وعراقة الضيافة.. يأتيك ${kw} ليعكس هيبة التميز وفخامة الاختيار. في KUBE، نصون نقاء الحرفة لنقدم لك ما يليق بمقامك الرفيع 🇸🇦👑\n\n#فخامة_المذاق #أصالة_سعودية #KUBE_Prestige #${kw.replace(/\s+/g, "_")}`;
      } else if (customTone === "interactive_viral") {
        result = `تحدي للأذكياء فقط 🧠:\nلو خيّرناك بين ${kw} من KUBE أو إجازة مدفوعة يوم الأحد.. وش تختار وبدون كذب؟ 👀\nأول 3 تعليقات لهم كوب مجاني بفرعنا اليوم! 🚀\n\n#تحدي_KUBE #مسابقات #كافيهات_الرياض #${kw.replace(/\s+/g, "_")}`;
      } else {
        result = `فرصة حصرية لمدة ساعتين فقط! ⏱️⚡️\nجرب ${kw} الجديد في KUBE واحصل على خصم 20% فوري عند الطلب عبر التطبيق بالكود: KUBE20. العرض ينتهي سريعاً!\n\n#عرض_محدود #تطبيق_KUBE #${kw.replace(/\s+/g, "_")}`;
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
                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[11px] font-medium text-red-500 border border-red-500/20">
                  <Sparkles className="h-3 w-3" />
                  KUBE AI Marketing Suite
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl flex items-center gap-2.5">
                <Megaphone className="h-6 w-6 text-red-500" />
                مركز التسويق والذكاء الاصطناعي
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl">
                منظومة تسويقية متكاملة مدربة على أرقى معايير النبرة السعودية (برق، STC، نمق، دانكن، عبدالصمد القرشي، هلا AI).
                توليد تغريدات فيروسية، 100+ برومبت بصري، واستراتيجيات التحويل لفئة الشباب (16-30 سنة).
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

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-t border-border/50 pt-4">
            <button
              onClick={() => setActiveTab("social_engine")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all ${
                activeTab === "social_engine"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              مولّد التغريدات والمحتوى الفيروسي ({SAUDI_SOCIAL_POSTS.length})
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
              استوديو الإعلانات البصرية والبرومبت ({SAUDI_VISUAL_PROMPTS.length}+)
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
              بنك الترندات واستراتيجيات هلا AI ({SAUDI_TREND_PLAYBOOKS.length})
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
              جدول ومتابعة الحملات ({campaigns.length})
            </button>
          </div>
        </header>

        {/* =========================================================================
         * TAB 1: مولد التغريدات والمحتوى الفيروسي (Viral Copy & Social Engine)
         * ========================================================================= */}
        {activeTab === "social_engine" && (
          <div className="space-y-6">
            {/* Interactive Custom AI Generation Card */}
            <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-card to-red-500/5 p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-bold text-red-500 mb-2">
                <Wand2 className="h-4 w-4" />
                توليد فوري ذكي لأي منتج أو مناسبة (KUBE AI Smart Generator)
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                اكتب أي صنف أو مناسبة (مثل: كوكيز حار، فلات وايت، مطر الرياض، عرض الراتب) واختر النبرة السعودية لتوليد تغريدة احترافية فوراً.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <div className="md:col-span-6">
                  <input
                    type="text"
                    value={customKeyword}
                    onChange={(e) => setCustomKeyword(e.target.value)}
                    placeholder="مثال: آيس دريب إثيوبي في شمس العصر..."
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateCustomContent()}
                  />
                </div>

                <div className="md:col-span-4">
                  <select
                    value={customTone}
                    onChange={(e) => setCustomTone(e.target.value as BrandPersona)}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="barq_stc">⚡ نبرة برق و STC (شبابي طقطقة وترند)</option>
                    <option value="namq_address">☕ نبرة نمق وعنوان القهوة (روقان ومختص)</option>
                    <option value="dunkin">🥐 نبرة دانكن (عروض قوية ودوامات)</option>
                    <option value="qurashi_luxury">👑 نبرة القرشي (فخامة وشعر وهوية)</option>
                    <option value="interactive_viral">🎯 نبرة تفاعلية (مسابقات وألغاز)</option>
                    <option value="hala_ai">🤖 نبرة هلا AI (تحفيز فوري FOMO)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={handleGenerateCustomContent}
                    disabled={isGenerating}
                    className="w-full h-full min-h-[42px] inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 transition-all disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Clock className="h-4 w-4 animate-spin" />
                        توليد...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        توليد الآن
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Generated Content Box */}
              {generatedResult && (
                <div className="mt-4 rounded-xl border border-border/80 bg-background/80 p-4 relative animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/40">
                    <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      نتيجة التوليد التلقائي
                    </span>
                    <button
                      onClick={() => handleCopyText(generatedResult, "custom-gen", "النص المولّد")}
                      className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      نسخ النص
                    </button>
                  </div>
                  <p className="whitespace-pre-line text-sm text-foreground leading-relaxed font-sans">
                    {generatedResult}
                  </p>
                </div>
              )}
            </div>

            {/* Filters Bar */}
            <div className="rounded-2xl border border-border/80 bg-card p-4 space-y-3">
              {/* Brand Persona Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-muted-foreground font-medium shrink-0 ml-2">العلامة المرجعية:</span>
                {[
                  { id: "all", label: "الكل" },
                  { id: "barq_stc", label: "⚡ برق و STC" },
                  { id: "namq_address", label: "☕ نمق وعنوان القهوة" },
                  { id: "dunkin", label: "🥐 دانكن KSA" },
                  { id: "qurashi_luxury", label: "👑 عبدالصمد القرشي" },
                  { id: "interactive_viral", label: "🎯 تفاعلي ومسابقات" },
                  { id: "hala_ai", label: "🤖 هلا AI" },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPersona(p.id as any)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 font-medium transition-all ${
                      selectedPersona === p.id
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Secondary Filters: Channel & Search */}
              <div className="flex flex-col md:flex-row items-center gap-3 pt-2 border-t border-border/40">
                <div className="relative w-full md:w-80">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={socialSearch}
                    onChange={(e) => setSocialSearch(e.target.value)}
                    placeholder="بحث في التغريدات والهاشتاقات..."
                    className="w-full rounded-xl border border-border bg-background pr-9 pl-4 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                  />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
                  <span className="text-muted-foreground shrink-0">المنصة:</span>
                  {[
                    { id: "all", label: "جميع المنصات" },
                    { id: "x", label: "منصة X (تويتر)" },
                    { id: "instagram", label: "إنستغرام" },
                    { id: "tiktok", label: "تيك توك" },
                    { id: "threads", label: "ثريدز" },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch.id as any)}
                      className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                        selectedChannel === ch.id
                          ? "bg-red-500/10 text-red-500 border border-red-500/30"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {ch.label}
                    </button>
                  ))}
                </div>

                <div className="mr-auto text-xs text-muted-foreground">
                  المتاح: <span className="font-mono font-bold text-foreground">{filteredSocialPosts.length}</span> قالب
                </div>
              </div>
            </div>

            {/* Social Posts Grid (Dark-Mode Simulated Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSocialPosts.map((post) => {
                const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  post.text + "\n\n" + post.hashtags.join(" "),
                )}`;
                const waUrl = `https://wa.me/?text=${encodeURIComponent(
                  post.text + "\n\n" + post.hashtags.join(" "),
                )}`;

                return (
                  <div
                    key={post.id}
                    className="group rounded-2xl border border-border/80 bg-card p-5 hover:border-border transition-all duration-200 flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div>
                      {/* Top Meta info */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2.5">
                          <div className="h-9 w-9 rounded-full bg-black flex items-center justify-center text-white font-mono font-bold text-xs border border-white/20">
                            K
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-foreground">KUBE Kitchen & Coffee</span>
                              <span className="text-[10px] text-blue-500">☑</span>
                            </div>
                            <span className="text-[10px] font-mono text-muted-foreground">@KubeKitchen</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                            {post.brandLabel}
                          </span>
                        </div>
                      </div>

                      {/* Hook & Text */}
                      <div className="mt-3.5 space-y-2">
                        <div className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          {post.hookHeadline}
                        </div>
                        <p className="whitespace-pre-line text-sm text-foreground/95 leading-relaxed font-sans">
                          {post.text}
                        </p>
                      </div>

                      {/* Hashtags */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {post.hashtags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-mono text-blue-500 hover:underline cursor-pointer"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Target audience badge */}
                      <div className="mt-3 text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="font-semibold text-muted-foreground/80">الفئة المستهدفة:</span>
                        <span>{post.targetAudience}</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleCopyText(post.text + "\n\n" + post.hashtags.join(" "), post.id, "التغريدة")
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
                        >
                          {copiedPostId === post.id ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-400" />
                              تم النسخ!
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              نسخ التغريدة
                            </>
                          )}
                        </button>

                        <a
                          href={tweetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                          title="نشر على X"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          نشر في X
                        </a>

                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg bg-muted px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted/80 transition-colors"
                          title="إرسال عبر واتساب"
                        >
                          واتساب
                        </a>
                      </div>

                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {post.suggestedChannel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =========================================================================
         * TAB 2: استوديو الإعلانات البصرية والبرومبت (Visual Studio & 100+ Prompts)
         * ========================================================================= */}
        {activeTab === "visual_studio" && (
          <div className="space-y-6">
            {/* Top Banner */}
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500 border border-amber-500/20">
                      مكتبة الإعلانات البصرية المعتمدة
                    </span>
                    <span className="text-xs text-muted-foreground">أكثر من 100 برومبت تجاري عالي الجودة</span>
                  </div>
                  <h2 className="text-lg font-bold text-foreground">
                    برومبتات جاهزة للذكاء الاصطناعي (Gemini Imagen 3 / Midjourney v6.1)
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-2xl">
                    مجهزة بمواصفات العدسات الاحترافية (Hasselblad، 85mm f/1.4، 100mm Macro) وزوايا الإضاءة السينمائية
                    لتوليد صور تجارية مذهلة تعكس فخامة وهوية KUBE.
                  </p>
                </div>

                <Link
                  to="/ai-kubeup-studio"
                  className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
                >
                  <Wand2 className="h-4 w-4" />
                  فتح استوديو التوليد المباشر
                  <ExternalLink className="h-3.5 w-3.5 opacity-60" />
                </Link>
              </div>

              {/* Category Pills */}
              <div className="mt-5 flex flex-wrap gap-1.5 pt-4 border-t border-border/40">
                {[
                  { id: "all", label: "جميع الأقسام" },
                  { id: "macro_beverage", label: "🧊 ماكرو وتفاصيل المشروبات" },
                  { id: "youth_lifestyle", label: "🛹 لايف ستايل شباب الرياض" },
                  { id: "dark_luxury", label: "🖤 فخامة ونيون ليلي (Nothing)" },
                  { id: "saudi_heritage", label: "🇸🇦 التراث واليوم الوطني والتأسيس" },
                  { id: "commercial_promo", label: "💥 بوسترات العروض والكومبو" },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedVisualCategory(c.id as any)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all ${
                      selectedVisualCategory === c.id
                        ? "bg-foreground text-background shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="mt-3 relative max-w-md">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  value={visualSearch}
                  onChange={(e) => setVisualSearch(e.target.value)}
                  placeholder="بحث في البرومبتات، المكونات، والعدسات..."
                  className="w-full rounded-xl border border-border bg-background pr-9 pl-4 py-1.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                />
              </div>
            </div>

            {/* Visual Prompts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filteredVisualPrompts.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-border transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-semibold text-red-500 uppercase tracking-wider block">
                          {item.brandInspiration}
                        </span>
                        <h3 className="text-sm font-bold text-foreground mt-0.5">{item.title}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-mono text-muted-foreground border border-border/40">
                          {item.aspectRatio}
                        </span>
                        <span className="rounded-md bg-foreground/5 px-2 py-0.5 text-[10px] font-medium text-foreground">
                          {item.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Arabic Description */}
                    <div className="rounded-xl bg-muted/40 p-3 text-xs text-foreground/90 leading-relaxed font-sans">
                      <span className="text-[10px] font-bold text-muted-foreground block mb-1">
                        الوصف الإبداعي بالعربية:
                      </span>
                      {item.arabicPrompt}
                    </div>

                    {/* English AI Prompt */}
                    <div className="rounded-xl bg-black/90 p-3 text-[11px] font-mono text-emerald-400 leading-relaxed border border-white/10 select-all">
                      <span className="text-[9px] text-white/50 block mb-1 uppercase tracking-widest font-sans">
                        English Commercial AI Prompt:
                      </span>
                      {item.englishPrompt}
                    </div>

                    {/* Camera & Lighting Specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/40">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Camera className="h-3.5 w-3.5 text-foreground/70" />
                        <span>{item.cameraLens}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                        <span>{item.lighting}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, idx) => (
                        <span key={idx} className="rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-border/40 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleCopyPrompt(item.englishPrompt, item.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-foreground text-background px-3 py-1.5 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
                    >
                      {copiedPromptId === item.id ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          تم نسخ البرومبت!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          نسخ البرومبت الإنجليزي
                        </>
                      )}
                    </button>

                    <Link
                      to="/ai-kubeup-studio"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/10 text-red-500 border border-red-500/20 px-3 py-1.5 text-xs font-medium hover:bg-red-600/20 transition-colors"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      توليد في الاستوديو
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
         * TAB 3: بنك الأفكار والترندات السعودية (Hala AI Playbooks)
         * ========================================================================= */}
        {activeTab === "trend_playbooks" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-500 border border-amber-500/20">
                  استراتيجيات هلا AI للتحويل والمواسم السعودية
                </span>
              </div>
              <h2 className="text-xl font-bold text-foreground mt-2">
                حقائب الحملات الموسمية (Saudi Retail & Trend Playbooks)
              </h2>
              <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
                خطط تسويقية مجهزة ومبنية على سلوك المستهلك السعودي في الرياض: مواسم الاختبارات الجامعية، أمطار الرياض،
                عطلات الرواتب، ويوم التأسيس. قابلة للتفعيل الفوري بضغطة زر واحدة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {SAUDI_TREND_PLAYBOOKS.map((pb) => (
                <div
                  key={pb.id}
                  className="rounded-2xl border border-border/80 bg-card p-5 space-y-4 hover:border-border transition-all flex flex-col justify-between shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5" />
                        {pb.season}
                      </span>
                      <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-foreground">
                        {pb.targetAge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-foreground">{pb.title}</h3>

                    {/* Hook */}
                    <div className="rounded-xl border border-border/60 bg-muted/40 p-3">
                      <span className="text-[10px] font-bold text-muted-foreground block mb-0.5">هُوك الحملة:</span>
                      <p className="text-xs font-semibold text-foreground">"{pb.hook}"</p>
                    </div>

                    {/* Activation Idea */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold text-foreground">خطة التفعيل الميداني:</span>
                      <p className="text-xs text-muted-foreground leading-relaxed">{pb.activationIdea}</p>
                    </div>

                    {/* Products & Offer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-2 border-t border-border/40">
                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground block">المنتجات المقترحة:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {pb.recommendedProducts.map((prod, i) => (
                            <span key={i} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-foreground">
                              {prod}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-muted-foreground block">العرض المقترح:</span>
                        <span className="text-xs font-semibold text-red-500 block mt-1">{pb.suggestedDiscount}</span>
                      </div>
                    </div>

                    {/* Expected Goal */}
                    <div className="rounded-lg bg-emerald-500/10 p-2.5 border border-emerald-500/20 text-[11px] text-emerald-600 dark:text-emerald-400">
                      <span className="font-bold">الهدف المتوقع: </span>
                      {pb.expectedGoal}
                    </div>
                  </div>

                  {/* Activate button */}
                  <div className="pt-3 border-t border-border/40">
                    <button
                      onClick={() => handleActivatePlaybook(pb)}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-foreground text-background px-4 py-2 text-xs font-semibold hover:opacity-90 transition-opacity active:scale-95"
                    >
                      <Plus className="h-4 w-4" />
                      تفعيل هذه الحملة في جدول المتابعة فوراً
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
         * TAB 4: جدول ومتابعة الحملات الترويجية (Campaigns Tracker)
         * ========================================================================= */}
        {activeTab === "campaigns_tracker" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">جدول ومتابعة الحملات التسويقية</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  إدارة العروض الميدانية والحملات الرقمية، تواريخ البداية والنهاية، وحالات التنفيذ.
                </p>
              </div>

              <button
                onClick={() => setShowAddCampModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-foreground text-background px-4 py-2.5 text-xs font-semibold hover:opacity-90 transition-opacity"
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
