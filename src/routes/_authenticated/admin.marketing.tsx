import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
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
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/marketing")({
  head: () => ({
    meta: [
      { title: "مركز التسويق والذكاء الاصطناعي — KUBE Kitchen" },
      { name: "description", content: "إدارة حملات التسويق، توليد المحتوى الإعلاني الذكي، وجدولة العروض الترويجية لكافيه KUBE." },
      { property: "og:title", content: "مركز التسويق والذكاء الاصطناعي — KUBE Kitchen" },
      { property: "og:description", content: "استوديو ومولد الحملات الذكي للقهوة والمخبوزات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["ai_studio_use", "reports_export", "orders_view"]}>
      <MarketingHubPage />
    </PermissionGuard>
  ),
});

type Platform = "x" | "instagram" | "tiktok" | "sms";
type CampaignTheme = "morning" | "specialty_v60" | "saudi_founding" | "summer_refresh" | "evening_dessert" | "weekend";

interface CampaignItem {
  id: string;
  name: string;
  platform: string;
  discount: string;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "draft";
}

const THEME_PRESETS: Record<CampaignTheme, { title: string; desc: string; icon: string }> = {
  morning: {
    title: "عرض الصباح الملكي (كرواسون + فلات وايت)",
    desc: "ابدأ صباحك بروقان KUBE مع أفضل توليفة مخبوزات طازجة وقهوة متقنة.",
    icon: "🥐",
  },
  specialty_v60: {
    title: "قهوة اليوم المختصة V60 الإثيوبية",
    desc: "إيحاءات التوت والياسمين المحمصة بعناية لعشاق القهوة المختصة.",
    icon: "☕",
  },
  saudi_founding: {
    title: "عروض يوم التأسيس والهوية السعودية",
    desc: "يوم بدينا، وقهوتنا عريقة. عروض خاصة وفخر بكل قطرة من أرضنا.",
    icon: "🇸🇦",
  },
  summer_refresh: {
    title: "انتعاش الصيف (آيس دريب + باشن فروت)",
    desc: "برد على قلبك مع ابتكارات KUBE الصيفية المنعشة والنكهات الباردة.",
    icon: "🧊",
  },
  evening_dessert: {
    title: "ساعة الحلا المسائي (كوكيز دافئ + كورتادو)",
    desc: "جلسة المساء ما تحلى إلا مع كوكيز ساخن وقهوة موزونة بالمليمتر.",
    icon: "🍪",
  },
  weekend: {
    title: "عرض نهاية الأسبوع للأصدقاء والجمعات",
    desc: "جمعتكم في KUBE أحلى! بكجات قهوة ومخبوزات تكفي كل الحبايب.",
    icon: "✨",
  },
};

const INITIAL_CAMPAIGNS: CampaignItem[] = [
  {
    id: "c-1",
    name: "عرض الصباح الباكر — فلات وايت مع كرواسون لوز",
    platform: "إنستغرام + X",
    discount: "خصم 20% حتى 11 ص",
    startDate: "2026-10-15",
    endDate: "2026-10-31",
    status: "active",
  },
  {
    id: "c-2",
    name: "إطلاق محصول إثيوبيا قوجي V60 الفاخر",
    platform: "تيك توك",
    discount: "كوب تذوق مجاني",
    startDate: "2026-10-18",
    endDate: "2026-10-25",
    status: "scheduled",
  },
  {
    id: "c-3",
    name: "رسائل ولاء عملاء KUBE المميزين",
    platform: "SMS & Push",
    discount: "كود: KUBELOVE",
    startDate: "2026-10-12",
    endDate: "2026-10-22",
    status: "active",
  },
];

function MarketingHubPage() {
  const [selectedTheme, setSelectedTheme] = useState<CampaignTheme>("morning");
  const [platform, setPlatform] = useState<Platform>("instagram");
  const [customDiscount, setCustomDiscount] = useState("خصم 20%");
  const [copied, setCopied] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>(INITIAL_CAMPAIGNS);
  const [newCampName, setNewCampName] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Generate copy based on theme, platform, and discount
  const generatedCopy = useMemo(() => {
    const theme = THEME_PRESETS[selectedTheme];
    if (platform === "x") {
      return `صباح الروقان والقهوة الموزونة من KUBE ☕✨

${theme.title}
${theme.desc}

🏷️ العرض: ${customDiscount} لفترة محدودة بجميع فروعنا بالرياض!
📍 ننتظركم أو اطلب عبر تطبيقات التوصيل.

#KUBE #قهوة_مختصة #كافيهات_الرياض #كافيه_الرياض #V60`;
    }

    if (platform === "instagram") {
      return `جلسة، تفاصيل، ورائحة قهوة تفتح النفس 🤎

${theme.title}
${theme.desc}

نحضّرها لك بكل شغف بأيدي باريستا KUBE المحترفين. 
استمتع بـ ${customDiscount} عند زيارتك لأي من فروعنا.

💬 شاركنا مشروبك المفضل لليوم بالتعليقات!
📍 الرياض — مواقعنا متاحة عبر خرائط جوجل.
🔗 الرابط بالبايو لتفاصيل أكثر.

#KUBECoffee #الرياض #مخبوزات #قهوة #كافيهات_السعودية`;
    }

    if (platform === "tiktok") {
      return `[سكريبت فيديو 15 ثانية] 🎬
(مشهد 1: صوت طحن القهوة واستخلاص الإسبريسو بالبورتافلتر السلس)
(مشهد 2: تسخين الكرواسون وسكب الحليب المبخر مع رسمة آرت دقيقة)
(الصوت الصوتي): "إذا يومك ما بدأ بقهوة KUBE، متأكد إنك صحصحت؟"
العرض الحصري: ${theme.title} مع ${customDiscount}!
زورونا اليوم وورونا إبداعاتكم مع القهوة 🔥`;
    }

    // SMS
    return `صباح الخير من KUBE ☕
استمتع بـ (${theme.title}) مع ${customDiscount} كهدية خاصة لك!
استخدم كود: KUBE20 عند المحاسبة بأي فرع.
حياك الله ويسعدنا حضورك!`;
  }, [selectedTheme, platform, customDiscount]);

  function handleCopy() {
    navigator.clipboard.writeText(generatedCopy);
    setCopied(true);
    toast.success("تم نسخ النص الإعلاني إلى الحافظة!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleAddCampaign(e: React.FormEvent) {
    e.preventDefault();
    if (!newCampName.trim()) return toast.error("أدخل اسم الحملة");
    const item: CampaignItem = {
      id: `c-${Date.now()}`,
      name: newCampName,
      platform: platform === "x" ? "منصة X" : platform === "instagram" ? "إنستغرام" : platform === "tiktok" ? "تيك توك" : "رسائل SMS",
      discount: customDiscount,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
      status: "active",
    };
    setCampaigns((prev) => [item, ...prev]);
    setNewCampName("");
    setShowAddModal(false);
    toast.success("تمت جدولة الحملة التسويقية بنجاح!");
  }

  return (
    <AppShell title="مركز التسويق والذكاء الاصطناعي" back={{ to: "/admin" }} maxWidth="wide">
      {/* Header Banner */}
      <div className="mb-6 rounded-2xl border border-primary/20 bg-card p-5 md:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-primary text-primary-foreground shadow-sm shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-lg text-foreground">
                  استوديو التسويق الذكي KUBE AI Growth
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  <Sparkles className="w-3 h-3" />
                  مدعوم بالذكاء الاصطناعي
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                توليد الحملات الترويجية، كتابة إعلانات السوشيال ميديا بلهجة سعودية راقية، وربط المبيعات بالعروض.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/ai-kubeup-studio"
              className="kube-btn-secondary !min-h-0 !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <ImageIcon className="w-4 h-4 text-primary" />
              استوديو تصاميم الصور (AI)
            </Link>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="kube-btn-primary !min-h-0 !py-2 !px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              حملة جديدة
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <KpiCard title="الحملات النشطة" val={campaigns.filter((c) => c.status === "active").length} icon={Flame} tone="amber" />
        <KpiCard title="العروض المجدولة" val={campaigns.filter((c) => c.status === "scheduled").length} icon={Calendar} tone="blue" />
        <KpiCard title="القنوات التسويقية" val="4 قنوات" icon={Share2} tone="emerald" />
        <KpiCard title="معدل التفاعل المتوقع" val="+38%" icon={TrendingUp} tone="purple" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: AI Campaign Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="kube-card space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  مُولّد المحتوى الإعلاني الذكي
                </h3>
              </div>
              <span className="text-[11px] text-muted-foreground">صياغة سعودية متقنة</span>
            </div>

            {/* Campaign Theme Selector */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">1. اختر موضوع وفكرة الحملة:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(THEME_PRESETS) as CampaignTheme[]).map((k) => {
                  const t = THEME_PRESETS[k];
                  const isSel = selectedTheme === k;
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setSelectedTheme(k)}
                      className={`p-3 rounded-xl border text-start transition-all flex flex-col gap-1 ${
                        isSel
                          ? "border-primary bg-primary/10 shadow-xs ring-1 ring-primary/30"
                          : "border-border/80 bg-card hover:border-foreground/20"
                      }`}
                    >
                      <span className="text-xl">{t.icon}</span>
                      <span className="font-bold text-xs text-foreground truncate">{t.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Platform Selector */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-2">2. منصة النشر المستهدفة:</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "x", label: "منصة X (تويتر)" },
                  { id: "instagram", label: "إنستغرام" },
                  { id: "tiktok", label: "تيك توك" },
                  { id: "sms", label: "رسائل SMS" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPlatform(p.id as Platform)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold transition text-center ${
                      platform === p.id
                        ? "bg-primary text-primary-foreground shadow-xs"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Offer / Discount input */}
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">3. نسبة الخصم أو العرض:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  className="kube-input flex-1 text-xs"
                  placeholder="مثال: خصم 20%، اشتري 1 واحصل على 1 مجاناً، كود KUBE..."
                />
                <button
                  type="button"
                  onClick={() => setCustomDiscount("خصم 20%")}
                  className="kube-btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs"
                >
                  20%
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDiscount("1+1 مجاناً")}
                  className="kube-btn-secondary !min-h-0 !py-1.5 !px-2.5 text-xs"
                >
                  1+1
                </button>
              </div>
            </div>

            {/* Generated Copy Preview Box */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  النص الإعلاني المقترح:
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {generatedCopy.length} حرف
                </span>
              </div>
              <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 font-sans-arabic text-xs leading-relaxed whitespace-pre-line text-foreground select-text relative group">
                {generatedCopy}
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="kube-btn-primary !min-h-0 !py-2 !px-4 text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "تم النسخ!" : "نسخ النص الإعلاني"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Active Campaigns & Visual Assets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Active Campaigns Tracker */}
          <div className="kube-card space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <h3 className="font-display font-bold text-sm text-foreground">
                  الحملات والعروض المجدولة
                </h3>
              </div>
              <span className="text-[11px] font-bold text-muted-foreground">{campaigns.length} حملات</span>
            </div>

            <div className="space-y-2.5">
              {campaigns.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/20 transition">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-foreground truncate">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                        <span>{c.platform}</span>
                        <span>·</span>
                        <span className="text-emerald-600 font-bold">{c.discount}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        c.status === "active"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-blue-500/10 text-blue-600"
                      }`}
                    >
                      {c.status === "active" ? "نشطة الآن" : "مجدولة"}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground mt-2 border-t border-border/50 pt-1.5 flex items-center justify-between">
                    <span>الفترة: {c.startDate} → {c.endDate}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setCampaigns((prev) => prev.filter((x) => x.id !== c.id));
                        toast.info("تمت إزالة الحملة من الجدول");
                      }}
                      className="text-muted-foreground hover:text-destructive text-[10px]"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick AI Visual Studio Card */}
          <div className="kube-card space-y-3 bg-gradient-to-br from-card via-card to-amber-500/5 border-amber-500/20">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-display font-bold text-sm text-foreground">
                توليد صور وبوسترات المنيو (AI Studio)
              </h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              استخدم استوديو KUBE الذكي لتوليد لقطات سينمائية عالية الجودة لأكواب القهوة، التغليف، وتصاميم السوشيال ميديا بهوية البراند.
            </p>
            <Link
              to="/ai-kubeup-studio"
              className="kube-btn-secondary !min-h-0 !py-2 !px-3 w-full text-xs font-bold flex items-center justify-center gap-1.5 text-amber-600 dark:text-amber-400 border-amber-500/30"
            >
              <span>فتح استوديو التصاميم AI KUBEUP</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modal Add Campaign */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display font-bold text-sm text-foreground">إضافة وجدولة حملة تسويقية</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                إغلاق
              </button>
            </div>
            <form onSubmit={handleAddCampaign} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">اسم الحملة:</label>
                <input
                  type="text"
                  required
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="مثال: خصم الصباح للطلاب والموظفين..."
                  className="kube-input w-full text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">تفاصيل العرض:</label>
                <input
                  type="text"
                  value={customDiscount}
                  onChange={(e) => setCustomDiscount(e.target.value)}
                  className="kube-input w-full text-xs"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="kube-btn-secondary !min-h-0 !py-1.5 !px-3 text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="kube-btn-primary !min-h-0 !py-1.5 !px-4 text-xs font-bold"
                >
                  حفظ الحملة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function KpiCard({ title, val, icon: Icon, tone }: { title: string; val: string | number; icon: any; tone: "amber" | "blue" | "emerald" | "purple" }) {
  const toneMap = {
    amber: "text-amber-500 bg-amber-500/10",
    blue: "text-blue-500 bg-blue-500/10",
    emerald: "text-emerald-500 bg-emerald-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };
  return (
    <div className="rounded-xl border border-border/80 bg-card p-3.5 flex items-center gap-3 shadow-xs">
      <div className={`p-2.5 rounded-xl ${toneMap[tone]} shrink-0`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground truncate">{title}</div>
        <div className="text-base font-extrabold font-mono text-foreground mt-0.5">{val}</div>
      </div>
    </div>
  );
}
