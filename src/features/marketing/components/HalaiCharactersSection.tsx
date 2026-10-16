import React, { useState } from "react";
import {
  Users,
  Bot,
  ArrowRight,
  Share2,
  Sparkles,
  Upload,
  Check,
  Smile,
  Zap,
  Scissors,
  Palette,
  Shield,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";

interface HalaiCharactersSectionProps {
  onBackToStudio: () => void;
  onSelectCharacter?: (characterName: string) => void;
}

const BODY_TYPES = ["نحيف", "رياضي", "عضلي", "قوام منحني", "ممتلئ", "عضلات ضخمة"];
const HAIR_STYLES = ["شعر قصير", "شعر طويل", "تموجات كثيفة", "قصة عسكرية", "أصلع", "ضفائر", "بوب"];
const HAIR_COLORS = ["أسود فاحم", "بني غامق", "كستنائي", "أشقر", "رمادي"];
const OUTFITS = [
  "ثوب فقط",
  "ثوب وشماغ",
  "ثوب وغترة",
  "بشت ملكي",
  "عباية كلاسيك",
  "عباية مفتوحة",
  "حجاب أنيق",
  "نقاب",
  "ستايل الشارع",
  "كاجوال عصري",
  "بدلة رسمية",
];
const ORIGINS = ["عربي", "خليجي", "أفريقي", "آسيوي", "أوروبي", "مختلط"];
const AGES = ["شاب (18-28)", "متوسط العمر (29-45)", "كبير السن (+46)"];
const SKIN_TONES = ["خزفي", "فاتح", "حنطي سعودي", "أسمر", "أسمر داكن"];

const PRESET_CHARACTERS = [
  {
    id: "c1",
    name: "سلطان",
    role: "باريستا KUBE المحترف",
    dialect: "نجدية معاصرة",
    outfit: "ثوب أسود مودرن ومريلة جلد",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720",
    tags: ["باريستا", "شبابي", "V60"],
  },
  {
    id: "c2",
    name: "نورة",
    role: "صانعة محتوى لايف ستايل",
    dialect: "رياضية عفوية",
    outfit: "عباية رمادية راقية مع شيلة",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/1b1d49197e516bea184765e12e8bcd14/thumbnails/thumbnail.jpg?height=720",
    tags: ["تيك توك", "ريلز", "عناية"],
  },
  {
    id: "c3",
    name: "أحمد",
    role: "خبير تذوق القهوة وحبوب البن",
    dialect: "حجازية لطيفة",
    outfit: "كاجوال مع نظارات وقبعة بيكر",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/835f0e67d1f54a16cdf00ffe29eb57d2/thumbnails/thumbnail.jpg?height=720",
    tags: ["محاصيل", "مختصة", "روقان"],
  },
  {
    id: "c4",
    name: "ريما",
    role: "مؤسسة وناقدة كافيهات الرياض",
    dialect: "نجدية أنيقة",
    outfit: "ستايل ستريت وير راقي",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/b0846f302f55b41ad9c4fcc29bb8dd97/thumbnails/thumbnail.jpg?height=720",
    tags: ["ترند", "فود بلوجر", "فلات وايت"],
  },
  {
    id: "c5",
    name: "فيصل",
    role: "رائد أعمال وتقني بالرياض",
    dialect: "رسمية شبابية",
    outfit: "ثوب أبيض ناصع وشماغ أحمر",
    img: "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/47e6fccb610688b7c7eb8c091577872a/thumbnails/thumbnail.jpg?height=720",
    tags: ["أعمال", "صباحي", "دوام"],
  },
];

export const HalaiCharactersSection: React.FC<HalaiCharactersSectionProps> = ({
  onBackToStudio,
  onSelectCharacter,
}) => {
  const [mode, setMode] = useState<"character" | "motion">("character");
  const [exaggeration, setExaggeration] = useState<"normal" | "bold" | "crazy">("normal");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [bodyType, setBodyType] = useState("رياضي");
  const [hairStyle, setHairStyle] = useState("شعر قصير");
  const [hairColor, setHairColor] = useState("أسود فاحم");
  const [outfit, setOutfit] = useState("ثوب وشماغ");
  const [origin, setOrigin] = useState("عربي");
  const [age, setAge] = useState("شاب (18-28)");
  const [skinTone, setSkinTone] = useState("حنطي سعودي");
  const [charName, setCharName] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [characters, setCharacters] = useState(PRESET_CHARACTERS);

  const handleGenerateCharacter = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newChar = {
        id: "char_" + Date.now(),
        name: charName.trim() || (gender === "male" ? "بطل KUBE جديد" : "بطلة KUBE جديدة"),
        role: `${outfit} • ${origin} • ${bodyType}`,
        dialect: "لهجة سعودية",
        outfit: outfit,
        img:
          gender === "male"
            ? "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/f902bd3c5421e3c5b4175ec715a4b194/thumbnails/thumbnail.jpg?height=720"
            : "https://customer-ei7hg79dk1slaekc.cloudflarestream.com/1b1d49197e516bea184765e12e8bcd14/thumbnails/thumbnail.jpg?height=720",
        tags: [gender === "male" ? "ذكر" : "أنثى", outfit, bodyType],
      };
      setCharacters([newChar, ...characters]);
      setIsGenerating(false);
      toast.success("تم ابتكار وتثبيت الشخصية بنجاح!");
    }, 2500);
  };

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
            <Users className="w-4 h-4 text-[#ff2a4b]" />
            <span>استوديو الشخصيات (AI Character Studio)</span>
          </h1>
          <span className="hidden md:inline-flex rounded-full bg-[#00e575]/15 border border-[#00e575]/30 px-2 py-0.5 text-[10px] font-bold text-[#00e575] font-mono">
            ثبات الوجه 100%
          </span>
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

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row items-start gap-4 p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Right Sidebar: Character Builder Deck (Halai 360px Sidebar) */}
        <aside className="w-full lg:w-[360px] shrink-0 sticky lg:top-24 h-auto lg:h-[calc(100vh-8rem)]">
          <div className="flex flex-col h-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Mode: شخصية / حركة */}
            <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode("character")}
                className={`py-2 rounded-lg transition-all ${
                  mode === "character" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                شخصية
              </button>
              <button
                type="button"
                onClick={() => setMode("motion")}
                className={`py-2 rounded-lg transition-all ${
                  mode === "motion" ? "bg-white text-black shadow-sm" : "text-zinc-400 hover:text-white"
                }`}
              >
                حركة
              </button>
            </div>

            {/* Exaggeration Level (عادي / جريء / جنوني) */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">أسلوب الواقعية</label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: "normal", label: "عادي", desc: "نِسب واقعية كما في الحياة" },
                  { id: "bold", label: "جريء", desc: "ملامح لافتة بمبالغة خفيفة" },
                  { id: "crazy", label: "جنوني", desc: "شخصية جنونية" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setExaggeration(item.id as any)}
                    className={`p-2 rounded-xl border text-center transition-all ${
                      exaggeration === item.id
                        ? "bg-white/15 border-white/40 text-white font-bold"
                        : "bg-white/5 border-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="text-xs">{item.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Gender Selection */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">الجنس</label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: "male", label: "ذكر" },
                  { id: "female", label: "أنثى" },
                ].map((g) => (
                  <button
                    key={g.id}
                    onClick={() => setGender(g.id as any)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      gender === g.id
                        ? "bg-white text-black shadow-sm"
                        : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Body Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">البنية</label>
              <div className="flex flex-wrap gap-1">
                {BODY_TYPES.map((bt) => (
                  <button
                    key={bt}
                    onClick={() => setBodyType(bt)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      bodyType === bt
                        ? "bg-white/20 text-white font-bold border border-white/30"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {bt}
                  </button>
                ))}
              </div>
            </div>

            {/* Saudi Style & Outfits */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400 flex items-center gap-1">
                <Shirt className="w-3.5 h-3.5 text-[#00e575]" />
                <span>الزي واللباس (سعودي وخليجي)</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {OUTFITS.map((ot) => (
                  <button
                    key={ot}
                    onClick={() => setOutfit(ot)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                      outfit === ot
                        ? "bg-[#00e575]/20 text-[#00e575] font-bold border border-[#00e575]/40"
                        : "bg-white/5 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {ot}
                  </button>
                ))}
              </div>
            </div>

            {/* Origin & Age */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">الأصل</label>
                <select
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  {ORIGINS.map((o) => (
                    <option key={o} value={o} className="bg-zinc-900 text-white">
                      {o}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">العمر</label>
                <select
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  {AGES.map((a) => (
                    <option key={a} value={a} className="bg-zinc-900 text-white">
                      {a}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Skin Tone & Hair */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">لون البشرة</label>
                <select
                  value={skinTone}
                  onChange={(e) => setSkinTone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  {SKIN_TONES.map((st) => (
                    <option key={st} value={st} className="bg-zinc-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400">تسريحة الشعر</label>
                <select
                  value={hairStyle}
                  onChange={(e) => setHairStyle(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2 text-xs text-white focus:outline-none"
                >
                  {HAIR_STYLES.map((hs) => (
                    <option key={hs} value={hs} className="bg-zinc-900 text-white">
                      {hs}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Character Name Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-zinc-400">اسم الشخصية (اختياري)</label>
              <input
                type="text"
                value={charName}
                onChange={(e) => setCharName(e.target.value)}
                placeholder="مثال: تركي، لمى، بدر..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white/30"
              />
            </div>

            {/* Generate CTA Button */}
            <button
              onClick={handleGenerateCharacter}
              disabled={isGenerating}
              className="w-full py-3 rounded-2xl bg-white hover:bg-zinc-200 text-black font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 shadow-xl"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>جاري نحت الشخصية...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>توليد وتثبيت الشخصية</span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-black/10">4</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Left Canvas: Character Gallery & Library */}
        <main className="flex-1 w-full bg-[#18191c] rounded-3xl border border-white/10 shadow-2xl p-6 min-h-[500px]">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#ff2a4b]" />
                <span>شخصيات KUBE المعتمدة (Brand Characters)</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                شخصيات افتراضية ثابتة الملامح يمكنك استخدامها كبطل متكرر في جميع فيديوهاتك وإعلاناتك.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">
              {characters.length} شخصية متاحة
            </span>
          </div>

          {/* Characters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
            {characters.map((char) => (
              <div
                key={char.id}
                className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden group shadow-lg transition-all hover:border-white/20 hover:scale-[1.01]"
              >
                <div className="relative aspect-[3/4] bg-black overflow-hidden">
                  <img
                    src={char.img}
                    alt={char.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-white">{char.name}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#00e575]/20 text-[#00e575] border border-[#00e575]/30 font-semibold">
                        ثابت
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 line-clamp-1">{char.role}</p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {char.tags.map((t, idx) => (
                        <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-zinc-300">
                          {t}
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectCharacter) onSelectCharacter(char.name);
                        toast.success(`تم اختيار ${char.name} لبدء الفيديو في استديو 2.0!`);
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <span>استخدم في الإعلان القادم</span>
                      <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
