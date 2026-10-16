import React, { useState } from "react";
import {
  Check,
  Zap,
  ArrowRight,
  Share2,
  ChevronDown,
  ShoppingBag,
  Store,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface HalaiPricingSectionProps {
  onBackToStudio: () => void;
}

const PRICING_PLANS = [
  {
    id: "basic",
    name: "بيسك",
    priceMonthly: "59",
    priceYearly: "49",
    desc: "للمبتدئين والمقاهي الناشئة لتوليد أولى الحملات والصور الإعلانية",
    credits: "120 نقطة شهرياً",
    features: [
      "توليد صور بجودة 1K و 2K",
      "توليد فيديو حتى 5 ثوانٍ",
      "وصول إلى استديو المنتجات 3D",
      "دعم فني عبر البريد",
    ],
    popular: false,
  },
  {
    id: "pro",
    name: "برو",
    priceMonthly: "149",
    priceYearly: "119",
    desc: "الخيار الأفضل للبراندات والكافيهات النشطة على تيك توك وسناب شات",
    credits: "450 نقطة شهرياً",
    features: [
      "دقة 4K فائقة لجميع الصور",
      "توليد فيديو سينمائي 10 ثوانٍ بصوت أصلي",
      "استوديو صناع المحتوى UGC 2.0 (شخصيات سعودية)",
      "استديو الإعلانات 9x كامل",
      "أولوية قصوى في طابور المعالجة",
    ],
    popular: true,
  },
  {
    id: "creators",
    name: "كريتورز",
    priceMonthly: "299",
    priceYearly: "249",
    desc: "للوكالات الإعلانية ومصممي الحملات التسويقية الضخمة",
    credits: "1,200 نقطة شهرياً",
    features: [
      "وصول غير محدود لمحركات Veo 3.1 و Kling 3.0",
      "ربط بروتوكول MCP مع Claude Desktop و Cursor",
      "تثبيت وجوه الشخصيات الافتراضية عبر كل الفيديوهات",
      "تصدير فيديو بدون علامة مائية بدقة 4K 60fps",
      "دعم خاص 24/7 عبر واتساب",
    ],
    popular: false,
  },
];

const FAQS = [
  {
    q: "كيف يتم احتساب النقاط (Credits)؟",
    a: "يتم خصم النقاط بحسب النموذج ونوع الأصول المولدة؛ مثلاً توليد الصورة يستهلك 2-3 نقاط، بينما توليد إعلان الفيديو السينمائي يستهلك 28-35 نقطة.",
  },
  {
    q: "هل يمكنني إلغاء اشتراكي في أي وقت؟",
    a: "نعم بكل تأكيد، يمكنك إلغاء اشتراكك في أي وقت بنقرة واحدة من لوحة حسابك بدون أي شروط أو رسوم إضافية.",
  },
  {
    q: "هل تعمل المنصة على متاجر سلة وزد؟",
    a: "نعم، لدينا تكامل مباشر عبر تطبيقات KUBE في متجر سلة ومتجر زد لمزامنة المنتجات وصور المشروبات وتوليد إعلاناتها مباشرة.",
  },
  {
    q: "ما هي المحركات والنماذج المستخدمة؟",
    a: "نستخدم أحدث النماذج العالمية المدربة بما فيها Google Veo 3.1 Pro، Kling AI 3.0 Turbo، WanX 2.6، Flux 1.1 Pro Ultra، ونماذج الصوت المتزامن.",
  },
];

export const HalaiPricingSection: React.FC<HalaiPricingSectionProps> = ({ onBackToStudio }) => {
  const [isYearly, setIsYearly] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="flex flex-col relative flex-1 min-h-[calc(100vh-4rem)] bg-[#141416] text-white" dir="rtl">
      {/* Top Breadcrumb Bar */}
      <div className="sticky top-14 md:top-16 z-30 backdrop-blur-md bg-[#18191c]/95 border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStudio}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 active:scale-95 transition-all"
          >
            <ArrowRight className="w-4 h-4 text-[#00e575]" />
            <span>العودة إلى استديو 2.0</span>
          </button>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#00e575]" />
            <span>الباقات والأسعار (Pricing & Plans)</span>
          </h1>
        </div>

        <button
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("تم نسخ رابط الصفحة المباشر");
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10 transition-all"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">مشاركة</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 py-12 px-4 sm:px-8 max-w-6xl mx-auto w-full space-y-12">
        {/* Headline & Toggle */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl md:text-5xl font-black uppercase text-white tracking-tight">
            اختر <span className="text-[#00e575]">خطتك</span>
          </h2>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
            خطط اشتراك مرنة مصممة خصيصاً لمشاريع المقاهي والبراندات السعودية لإنتاج إعلانات عالية التحويل.
          </p>

          {/* Monthly / Yearly Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isYearly ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isYearly ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>سنوي</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00e575] text-black font-extrabold font-mono">
                وفّر 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? "bg-gradient-to-b from-[#1c1d22] to-[#141416] border-2 border-[#00e575] shadow-[0_0_40px_rgba(0,229,117,0.15)] scale-[1.02]"
                  : "bg-[#18191c] border border-white/10 hover:border-white/20 shadow-xl"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#00e575] text-black text-[11px] font-black uppercase px-3 py-1 rounded-full shadow-lg">
                  الأكثر شعبية للمقاهي
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{plan.desc}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white font-mono">
                    {isYearly ? plan.priceYearly : plan.priceMonthly}
                  </span>
                  <span className="text-xs text-zinc-400">ر.س / شهر</span>
                </div>

                <div className="py-2 px-3 rounded-xl bg-white/5 border border-white/5 text-xs text-[#00e575] font-semibold font-mono">
                  ⚡ {plan.credits}
                </div>

                <div className="space-y-2.5 pt-2 border-t border-white/5">
                  {plan.features.map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-[#00e575] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <button
                  onClick={() => toast.success(`تم اختيار باقة ${plan.name}!`)}
                  className={`w-full py-3 rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg ${
                    plan.popular
                      ? "bg-[#00e575] hover:bg-[#00c565] text-black"
                      : "bg-white hover:bg-zinc-200 text-black"
                  }`}
                >
                  اشترك الآن
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* E-Commerce App Integrations (Salla & Zid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6">
          <div className="rounded-3xl border border-white/10 bg-[#18191c] p-6 flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-[#00e575] uppercase tracking-wider font-mono">
                متجر سلة
              </span>
              <h3 className="text-lg font-bold text-white">عزّز متجرك في سلة</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                اربط منتجات ومشروبات كافيه KUBE مباشرة من سلة لتوليد جلسات تصوير وفيديوهات UGC بنقرة واحدة.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-[#00e575]/15 border border-[#00e575]/30 flex items-center justify-center shrink-0 text-[#00e575]">
              <ShoppingBag className="w-7 h-7" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[#18191c] p-6 flex items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider font-mono">
                متجر زد
              </span>
              <h3 className="text-lg font-bold text-white">عزّز متجرك في زد</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                تكامل شامل مع لوحة متجر زد لمزامنة كتالوج المنتجات وتوليد إعلانات تيك توك وسناب شات متوافقة.
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-400">
              <Store className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* FAQs Section */}
        <div className="space-y-4 pt-6">
          <h3 className="text-xl font-bold text-white text-center">الأسئلة الشائعة</h3>
          <div className="space-y-2 max-w-3xl mx-auto">
            {FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-white/10 bg-[#18191c] overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 flex items-center justify-between text-start text-sm font-semibold text-white hover:bg-white/5 transition-all"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ${
                      openFaq === idx ? "rotate-180 text-white" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 pt-1 text-xs text-zinc-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
