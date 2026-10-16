import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Layers,
  Video,
  Image as ImageIcon,
  Bot,
  Wand2,
  Clapperboard,
  Users,
  Camera,
  Film,
  Sparkle,
  Radio,
  ShoppingBag,
  ChevronDown,
  LayoutGrid,
  Zap,
  Repeat,
  Maximize2,
  FileText,
  Palette,
  Play,
} from "lucide-react";

export interface HeaderNavDropdownsProps {
  onSelectStudio: (studioId: string) => void;
  onSelectPhotoModel: (modelName: string) => void;
  onSelectVideoModel: (modelName: string) => void;
  onSelectApp: (appId: string) => void;
}

// 1. HALAI 9 STUDIOS
const STUDIOS_LIST = [
  {
    id: "marketing_2",
    title: "استوديو التسويق 2.0",
    desc: "توليد إعلانات فيديو احترافية بـ 14 صيغة تسويقية وتحويل عالي",
    icon: Wand2,
    badge: "جديد",
    badgeColor: "bg-[#00e575] text-black",
  },
  {
    id: "marketing_1",
    title: "استوديو التسويق",
    desc: "استوديو إعلانات كافيه KUBE ومشروبات القهوة المختصة السريعة",
    icon: Sparkle,
  },
  {
    id: "ugc_2",
    title: "استوديو 2.0 UGC",
    desc: "صناع محتوى سعوديين واقعيين مع حركات شفاه متزامنة ونبرة محلية",
    icon: Users,
    badge: "جديد",
    badgeColor: "bg-[#00e575] text-black",
  },
  {
    id: "ads_9x",
    title: "استوديو الإعلانات 9x",
    desc: "توليد باقة متكاملة من 9 إعلانات تجارية مختلفة للمنتج بضغطة زر",
    icon: LayoutGrid,
  },
  {
    id: "products",
    title: "استوديو المنتجات",
    desc: "تصوير فوتوغرافي وسينمائي ثلاثي الأبعاد للمشروبات والمنتجات بدقة 4K",
    icon: Camera,
  },
  {
    id: "characters",
    title: "استوديو الشخصيات",
    desc: "صمّم شخصية الباريستا أو الممثل مرة واحدة وثبّتها عبر كل فيديوهاتك",
    icon: Bot,
  },
  {
    id: "storyboard",
    title: "لقطات",
    desc: "تخطيط ستوري بورد سينمائي وتقسيم مشاهد الإعلان خطوة بخطوة",
    icon: Clapperboard,
  },
  {
    id: "ugc_1",
    title: "استوديو 1.0 UGC",
    desc: "الإصدار الكلاسيكي السريع لتوليد مقاطع تيك توك وريلز ومراجعات",
    icon: Users,
  },
  {
    id: "cinema",
    title: "استوديو السينما",
    desc: "إنتاج مقاطع إعلانية سينمائية بمحركات Veo 3.1 و Kling AI المتقدمة",
    icon: Film,
  },
];

// 2. HALAI IMAGE MODELS CATALOG
const PHOTO_MODELS_LIST = [
  {
    id: "gpt_image_25",
    name: "جي بي تي إيماج 2.5",
    desc: "أحدث نماذج OpenAI، بنسختين: صن‌برست وفلير بجودة فائقة",
    badge: "جديد",
    subBadge: "يدعم العربي",
    icon: Sparkles,
  },
  {
    id: "gpt_image_2",
    name: "جي بي تي إيماج 2",
    desc: "أحدث نموذج من OpenAI بجودة استثنائية وتحرير متقدم للمنتجات",
    badge: "جديد",
    subBadge: "يدعم العربي",
    icon: Sparkles,
  },
  {
    id: "nano_banana_2",
    name: "نانو بنانا 2",
    desc: "صور عالية الدقة مع نص واضح وقابلية للتحرير وبجودات مختلفة",
    badge: "جديد",
    icon: ImageIcon,
  },
  {
    id: "nano_banana_pro",
    name: "نانو بنانا برو",
    desc: "أفضل نموذج صور بدقة 4K مع تفاصيل فائقة للإضاءة والظلال",
    badge: "الأشهر",
    icon: Zap,
  },
  {
    id: "nano_banana_21",
    name: "نانو بنانا 2.1",
    desc: "أحدث نسخة من جوجل: تصميم أدق، ثبات أفضل للشخصيات، وسرعة أعلى",
    badge: "جديد",
    icon: Wand2,
  },
  {
    id: "nano_banana_lite",
    name: "نانو بنانا لايت",
    desc: "أسرع وأخف نانو بنانا وأقلها تكلفة — مسودات سريعة مع تعديلات نصية",
    badge: "جديد",
    icon: Zap,
  },
  {
    id: "nano_banana_2_lite",
    name: "نانو بنانا 2 لايت",
    desc: "نانو بنانا 2 عالية الدقة بطبقة أخف وأقل تكلفة للمسودات",
    badge: "جديد",
    icon: Zap,
  },
  {
    id: "ideogram_v4",
    name: "إيديوجرام V4",
    desc: "صور وملصقات وشعارات عالية الجودة مع نص عربي وإنجليزي دقيق",
    badge: "جديد",
    icon: Palette,
  },
  {
    id: "krea_2",
    name: "كريا 2",
    desc: "صور عالية الدقة — لارج للجودة القصوى، تيربو للسرعة الخاطفة",
    badge: "جديد",
    icon: Sparkles,
  },
  {
    id: "qwen_image_3",
    name: "كوين إيميج 3",
    desc: "نص واضح، مع تحرير متقدم من 3 صور مرجعية للمشروب كحد أقصى",
    badge: "جديد",
    icon: ImageIcon,
  },
  {
    id: "nano_banana_v1",
    name: "نانو بنانا",
    desc: "نموذج سريع وفعال لتوليد الصور اليومية والمنشورات السريعة",
    icon: ImageIcon,
  },
  {
    id: "seedream_5_lite",
    name: "سيدريم 5 لايت",
    desc: "توليد صور ذكي مع استدلال منطقي وتحرير ومعرفة متخصصة بالقهوة",
    badge: "جديد",
    icon: Sparkles,
  },
  {
    id: "seedream_45",
    name: "سيدريم 4.5",
    desc: "إبداع فني متقدم بأسلوب سينمائي وألوان غنية",
    icon: Palette,
  },
  {
    id: "gpt_15",
    name: "جي بي تي 1.5",
    desc: "واقعية مذهلة مع إضاءة ستوديو وتكوين إعلاني محسّن",
    icon: Sparkles,
  },
  {
    id: "flux_v2_max",
    name: "فلكس v2 ماكس",
    desc: "أعلى مستويات الدقة والتفاصيل في عالم صور المنتجات الإعلانية",
    icon: Zap,
  },
  {
    id: "flux_v2_pro",
    name: "فلكس v2 برو",
    desc: "الخيار الاحترافي للنتائج السينمائية وإعلانات البوسترات الفاخرة",
    icon: Sparkles,
  },
  {
    id: "face_swap",
    name: "تبديل الوجوه",
    desc: "تغيير الوجوه في أي صورة بدقة واحترافية وبقاء الملامح الطبيعية",
    icon: Repeat,
  },
  {
    id: "character_swap",
    name: "تبديل الشخصية",
    desc: "تغيير الشخصية بالكامل مع الحفاظ على التكوين العام والمشروب",
    icon: Users,
  },
  {
    id: "upscale_4k",
    name: "رفع الدقة 4K",
    desc: "رفع دقة الصور إلى 4K فائقة الوضوح مع تحسين التفاصيل الصغيرة",
    icon: Maximize2,
  },
];

// 3. HALAI VIDEO MODELS CATALOG
const VIDEO_MODELS_LIST = [
  {
    id: "seedance_25",
    name: "سي دانس 2.5",
    desc: "فيديو سينمائي حتى 30 ثانية بصوت أصلي، مع مراجع صور وفيديو وصوت",
    badge: "جديد",
    icon: Film,
  },
  {
    id: "omni_flash_11",
    name: "أومني فلاش 1.1",
    desc: "فيديو بصوت متزامن حتى دقة 4K — نص وصورة ومراجع وتعديل فيديو",
    badge: "جديد",
    icon: Zap,
  },
  {
    id: "omni_flash",
    name: "أومني فلاش",
    desc: "فيديو 720p سريع مع صوت متزامن — نص وصورة ومراجع وتعديل فيديو",
    icon: Play,
  },
  {
    id: "seedance_20",
    name: "سي دانس 2.0",
    desc: "أقوى نموذج سينمائي مع صوت طبيعي وفيزياء واقعية لانسكاب المشروبات",
    badge: "الأشهر",
    icon: Film,
  },
  {
    id: "seedance_20_fast",
    name: "سي دانس 2.0 سريع",
    desc: "توليد سينمائي سريع مع صوت طبيعي وسرعة ريندر مضاعفة",
    icon: Zap,
  },
  {
    id: "seedance_20_mini",
    name: "سي دانس 2.0 ميني",
    desc: "نموذج سينمائي صغير وسريع واقتصادي مع صوت طبيعي",
    icon: Play,
  },
  {
    id: "seedance_15_pro",
    name: "سي دانس 1.5 برو",
    desc: "متخصص في تحريك الحركات الإيقاعية وتفاعل العملاء بدقة",
    icon: Film,
  },
  {
    id: "kube_mimic",
    name: "كيوب ميميك",
    desc: "احتفظ بحركة الفيديو وكاميرته وتوقيته، وأعد بناء الشخصيات والمنتجات من صورك",
    badge: "جديد",
    icon: Wand2,
  },
  {
    id: "pruna_video",
    name: "برونا",
    desc: "استبدل الشخص في الفيديو باستخدام صور مرجعية مع حركة متطابقة",
    icon: Users,
  },
  {
    id: "flux_3_video",
    name: "فلكس 3",
    desc: "فيديو متقدم بصوت أصلي — من نص أو صورة أو إطار البداية والنهاية",
    badge: "جديد",
    icon: Sparkles,
  },
  {
    id: "minimax_h3_max_turbo",
    name: "ميني ماكس H3 ماكس تيربو",
    desc: "هايلو السريع والاقتصادي — حتى 15 ثانية من وصف نصي أو صورة، مع لقطة أخيرة",
    badge: "جديد",
    icon: Zap,
  },
  {
    id: "minimax_h3_max",
    name: "ميني ماكس H3 ماكس",
    desc: "هايلو أوضح وأسرع — حتى 15 ثانية من مراجع صور وفيديو وصوت",
    badge: "جديد",
    icon: Film,
  },
  {
    id: "minimax_h3",
    name: "ميني ماكس H3",
    desc: "فيديو بمراجع متعددة الوسائط — وجّهه بالصور ومقاطع الفيديو والصوت",
    badge: "جديد",
    icon: Play,
  },
  {
    id: "grok_imagine",
    name: "جروك إيماجين",
    desc: "تحويل النص إلى فيديو، أو موجّه بالصور المرجعية حتى 7 صور",
    icon: Sparkles,
  },
  {
    id: "kling_3_turbo",
    name: "كلينج 3 تيربو",
    desc: "فيديو سريع من نص أو صورة حتى 15 ثانية — ستاندرد 720p أو برو 1080p",
    icon: Zap,
  },
  {
    id: "kling_3",
    name: "كلينج 3",
    desc: "فيديو سينمائي حتى 15 ثانية مع تحكم متعدد المشاهد وصوت أصلي",
    icon: Film,
  },
  {
    id: "kling_3_omni",
    name: "كلينج 3 أومني",
    desc: "فيديو متعدد الوسائط: توليد وتحرير وتحكم بالمراجع والكاميرا",
    icon: Wand2,
  },
  {
    id: "kling_26_pro",
    name: "كلينج 2.6 برو",
    desc: "القمة في التحكم بالحركة والواقعية السينمائية وسلاسة الحركة",
    icon: Film,
  },
  {
    id: "veo_31",
    name: "فيو 3.1",
    desc: "أحدث نموذج من جوجل لجودة بصرية سينمائية فائقة وإضاءة هوليوود",
    badge: "جديد",
    icon: Sparkles,
  },
  {
    id: "veo_31_lite",
    name: "فيو 3.1 لايت",
    desc: "توليد فيديو خفيف مع صوت مدمج وتحميل فوري",
    icon: Zap,
  },
  {
    id: "wan_30_prime",
    name: "وان 3.0 برايم",
    desc: "حركة واقعية مع صوت أصلي، من وصف نصي أو من صورة قهوة ومنتج",
    badge: "جديد",
    icon: Play,
  },
  {
    id: "wan_26_pro",
    name: "وان 2.6 برو",
    desc: "واقعية مذهلة في الإضاءة والأنسجة البشرية والتحكم بالبخار",
    icon: Film,
  },
  {
    id: "veed_10",
    name: "فيد 1.0",
    desc: "حوّل صورة شخصية إلى فيديو ناطق يتزامن بدقة مع الصوت العربي",
    icon: Users,
  },
];

// 4. CREATIVE APPS
const CREATIVE_APPS_LIST = [
  {
    id: "super_agent",
    title: "سوبر ايجنت (Super Agent)",
    desc: "العقل التسويقي المستقل لتحليل السوق، كتابة السيناريوهات، وإنشاء الحملات كاملة",
    icon: Bot,
    badge: "جديد",
    badgeColor: "bg-[#ff2a4b] text-white",
  },
  {
    id: "mimic_motion",
    title: "كيوب ميميك (Motion Mimic)",
    desc: "انسخ حركة أي فيديو إعلاني تريند وطبّقها مباشرة على منتجات وهوية KUBE",
    icon: Wand2,
    badge: "رائج",
    badgeColor: "bg-[#00e575] text-black",
  },
  {
    id: "storyboard",
    title: "ستوري بورد المخرج (Storyboard)",
    desc: "بناء تسلسل المشاهد الإعلانية، زوايا الكاميرا، والربط الزمني قبل الريندر",
    icon: Clapperboard,
  },
  {
    id: "promlog",
    title: "بروملوج (Promlog)",
    desc: "سجل الأوامر والمطالبات الإبداعية الناجحة وكتالوج سياق الحملات الفيروسي",
    icon: FileText,
  },
  {
    id: "mcp_connect",
    title: "اتصال وموصلات MCP Hub",
    desc: "ربط كافيه KUBE مباشرة مع Claude Desktop و Cursor و ChatGPT عبر بروتوكول MCP",
    icon: Radio,
    badge: "Beta",
    badgeColor: "bg-purple-500 text-white",
  },
];

export function HeaderNavDropdowns({
  onSelectStudio,
  onSelectPhotoModel,
  onSelectVideoModel,
  onSelectApp,
}: HeaderNavDropdownsProps) {
  const [openMenu, setOpenMenu] = useState<"studios" | "photos" | "videos" | "apps" | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: "studios" | "photos" | "videos" | "apps") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenMenu(menu);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 200);
  };

  const handleItemClick = (cb: () => void) => {
    cb();
    setOpenMenu(null);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <nav className="hidden xl:flex items-center gap-0.5 h-full ms-3">
      {/* 1. صور Dropdown */}
      <div
        className="relative h-full flex items-center"
        onMouseEnter={() => handleMouseEnter("photos")}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => handleMouseEnter("photos")}
          className={`flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium ${
            openMenu === "photos"
              ? "text-white bg-white/[0.08]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>صور</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              openMenu === "photos" ? "rotate-180 text-white" : "text-zinc-500"
            }`}
          />
        </button>

        {openMenu === "photos" && (
          <div className="absolute top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 right-0">
            <div
              className="relative grid grid-cols-[minmax(17rem,1fr)_minmax(17rem,1fr)] p-2 rounded-2xl border bg-[#141416]/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-y-auto no-scrollbar"
              dir="rtl"
              style={{ maxHeight: "calc(100dvh - 100px)" }}
            >
              {PHOTO_MODELS_LIST.map((model) => {
                const IconComponent = model.icon;
                return (
                  <div
                    key={model.id}
                    onClick={() =>
                      handleItemClick(() => {
                        onSelectPhotoModel(model.name);
                      })
                    }
                    className="p-2 grid grid-cols-[auto_1fr] gap-2.5 items-center transition-all hover:bg-white/5 active:bg-[#00e575]/10 rounded-xl cursor-pointer group"
                  >
                    <div className="grid justify-center items-center w-10 h-10 relative rounded-lg bg-white/5 border border-white/10 text-white group-hover:border-white/20">
                      <IconComponent className="w-5 h-5 text-zinc-300 group-hover:text-white" />
                      {model.badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 py-px leading-normal bg-[#00e575] text-black">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="grid auto-rows-min gap-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[13px] font-semibold text-white group-hover:text-[#00e575] transition-colors">
                          {model.name}
                        </p>
                        {model.subBadge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                            {model.subBadge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{model.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 2. فيديو Dropdown */}
      <div
        className="relative h-full flex items-center"
        onMouseEnter={() => handleMouseEnter("videos")}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => handleMouseEnter("videos")}
          className={`flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium ${
            openMenu === "videos"
              ? "text-white bg-white/[0.08]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>فيديو</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              openMenu === "videos" ? "rotate-180 text-white" : "text-zinc-500"
            }`}
          />
        </button>

        {openMenu === "videos" && (
          <div className="absolute top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 right-0">
            <div
              className="relative grid grid-cols-[minmax(17rem,1fr)_minmax(17rem,1fr)] p-2 rounded-2xl border bg-[#141416]/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-y-auto no-scrollbar"
              dir="rtl"
              style={{ maxHeight: "calc(100dvh - 100px)" }}
            >
              {VIDEO_MODELS_LIST.map((model) => {
                const IconComponent = model.icon;
                return (
                  <div
                    key={model.id}
                    onClick={() =>
                      handleItemClick(() => {
                        onSelectVideoModel(model.name);
                      })
                    }
                    className="p-2 grid grid-cols-[auto_1fr] gap-2.5 items-center transition-all hover:bg-white/5 active:bg-[#00e575]/10 rounded-xl cursor-pointer group"
                  >
                    <div className="grid justify-center items-center w-10 h-10 relative rounded-lg bg-white/5 border border-white/10 text-white group-hover:border-white/20">
                      <IconComponent className="w-5 h-5 text-zinc-300 group-hover:text-white" />
                      {model.badge && (
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 py-px leading-normal bg-[#00e575] text-black">
                          {model.badge}
                        </span>
                      )}
                    </div>
                    <div className="grid auto-rows-min gap-0.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[13px] font-semibold text-white group-hover:text-[#00e575] transition-colors">
                          {model.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{model.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. تطبيقات Dropdown */}
      <div
        className="relative h-full flex items-center"
        onMouseEnter={() => handleMouseEnter("apps")}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => handleMouseEnter("apps")}
          className={`flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium ${
            openMenu === "apps"
              ? "text-white bg-white/[0.08]"
              : "text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>تطبيقات</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              openMenu === "apps" ? "rotate-180 text-white" : "text-zinc-500"
            }`}
          />
        </button>

        {openMenu === "apps" && (
          <div className="absolute top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 right-0">
            <div
              className="relative w-80 p-2 rounded-2xl border bg-[#141416]/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-y-auto no-scrollbar"
              dir="rtl"
            >
              {CREATIVE_APPS_LIST.map((app) => {
                const IconComponent = app.icon;
                return (
                  <div
                    key={app.id}
                    onClick={() =>
                      handleItemClick(() => {
                        onSelectApp(app.id);
                      })
                    }
                    className="p-2.5 grid grid-cols-[auto_1fr] gap-3 items-center transition-all hover:bg-white/5 active:bg-white/10 rounded-xl cursor-pointer group"
                  >
                    <div className="grid justify-center items-center w-10 h-10 relative rounded-lg bg-white/5 border border-white/10 text-white group-hover:border-white/20">
                      <IconComponent className="w-5 h-5 text-zinc-300 group-hover:text-white" />
                      {app.badge && (
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 py-px leading-normal ${
                            app.badgeColor || "bg-[#00e575] text-black"
                          }`}
                        >
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <div className="grid auto-rows-min gap-0.5">
                      <p className="text-[13px] font-semibold text-white group-hover:text-[#ff3b56] transition-colors">
                        {app.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug">{app.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. الاستديو Dropdown (9 Halai Studios) */}
      <div
        className="relative h-full flex items-center ms-3"
        onMouseEnter={() => handleMouseEnter("studios")}
        onMouseLeave={handleMouseLeave}
      >
        <button
          type="button"
          onClick={() => handleMouseEnter("studios")}
          className={`group flex items-center gap-1.5 text-sm font-medium transition-colors h-full px-2.5 ${
            openMenu === "studios" ? "text-white" : "text-zinc-400 hover:text-white"
          }`}
        >
          <Layers className="w-4 h-4 text-[#ff2a4b]" />
          <span>الاستديو</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform duration-200 ${
              openMenu === "studios" ? "rotate-180 text-white" : "text-zinc-500"
            }`}
          />
        </button>

        {openMenu === "studios" && (
          <div className="absolute top-full pt-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200 right-0">
            <div
              className="relative w-88 p-2 rounded-2xl border bg-[#141416]/95 backdrop-blur-2xl border-white/10 shadow-2xl overflow-y-auto no-scrollbar"
              dir="rtl"
            >
              <div className="px-3 py-2 border-b border-white/5 mb-1 flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-400">استوديوهات KUBE الإبداعية</span>
                <span className="text-[10px] font-mono text-[#00e575]">9 استوديوهات نشطة</span>
              </div>
              {STUDIOS_LIST.map((st) => {
                const IconComponent = st.icon;
                return (
                  <div
                    key={st.id}
                    onClick={() =>
                      handleItemClick(() => {
                        onSelectStudio(st.id);
                      })
                    }
                    className="p-2.5 grid grid-cols-[auto_1fr] gap-3 items-center transition-all hover:bg-white/5 active:bg-white/10 rounded-xl cursor-pointer group"
                  >
                    <div className="grid justify-center items-center w-10 h-10 relative rounded-lg bg-white/5 border border-white/10 text-white group-hover:border-white/20">
                      <IconComponent className="w-5 h-5 text-[#ff2a4b] group-hover:scale-110 transition-transform" />
                      {st.badge && (
                        <span
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 font-mono text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 py-px leading-normal ${
                            st.badgeColor || "bg-[#00e575] text-black"
                          }`}
                        >
                          {st.badge}
                        </span>
                      )}
                    </div>
                    <div className="grid auto-rows-min gap-0.5">
                      <p className="text-[13px] font-semibold text-white group-hover:text-[#ff3b56] transition-colors">
                        {st.title}
                      </p>
                      <p className="text-[11px] text-zinc-400 leading-snug">{st.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Direct Link: ستوري بورد */}
      <button
        type="button"
        onClick={() => onSelectApp("storyboard")}
        className="flex items-center gap-1 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-zinc-400 hover:text-white hover:bg-white/[0.06] ms-2"
      >
        <Clapperboard className="w-4 h-4 text-zinc-400" />
        <span>ستوري بورد</span>
      </button>

      {/* 6. Direct Link: اتصال MCP */}
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

      {/* 7. Super Agent Button */}
      <button
        type="button"
        onClick={() => onSelectApp("super_agent")}
        className="flex items-center gap-1.5 h-8 px-2.5 rounded-[10px] text-sm transition-colors whitespace-nowrap font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 ms-1"
      >
        <Bot className="w-4 h-4 text-[#ff2a4b]" />
        <span>سوبر ايجنت</span>
        <span className="text-[9px] uppercase px-1.5 rounded-sm font-bold -skew-x-12 shrink-0 bg-[#ff2a4b] text-white">
          جديد
        </span>
      </button>
    </nav>
  );
}
