import { useState } from "react";
import { Sparkles, Eraser, Loader2, SlidersHorizontal, ChevronDown, Camera, Sun, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";
import {
  ASPECT_RATIOS,
  type AspectRatio,
  AI_STUDIO_RESOLUTION,
  BACKGROUND_PRESETS,
  CAMERA_ANGLES,
  LIGHT_DIRECTIONS,
  LIGHT_QUALITIES,
  SHOT_STYLES,
  type StudioSettings,
} from "@/lib/ai-studio.functions";
import { Button } from "@/components/ui/button";

export const QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: "📸 قالب المنيو والتطبيقات", text: "Hyper-realistic high-key commercial product shot for food delivery menu app. Centered low minimalist matte white concrete podium with crisp geometric edges. The KUBE product placed naturally on top with crisp contact shadows, clean soft daylight from top-left, seamless studio background, pristine 4K commercial photography." },
  { label: "🍵 كوب الماتشا البارد", text: "Ultra-crisp commercial product photograph of an iced Matcha latte in a signature transparent KUBE cup, vibrant natural green and milk layers, chilled condensation droplets on the cup, soft architectural side lighting, realistic ground contact shadow, luxury cafe aesthetic, 4K resolution." },
  { label: "🍰 بوكس الحلا والكيك", text: "Commercial top-angle 45-degree food photography of premium KUBE sliced cake dessert box, perfectly textured cake layers, elegant minimalist presentation, soft warm directional daylight, matte concrete table surface, Scandinavian-Japanese cafe mood, clean and appetizing." },
  { label: "☕ تصوير المشروب البارد (Ice Coffee)", text: "Crisp commercial studio shot of KUBE iced coffee in branded clear cup with clear ice cubes, condensation beads, dramatic rim lighting, clean subtle reflection on black or white glossy surface, modern editorial aesthetic." },
  { label: "📱 ستوري سينمائي (9:16)", text: "Vertical 9:16 cinematic lifestyle photography featuring the KUBE cup in hand with modern cafe interior in background, beautiful shallow depth of field (f/1.8), warm natural daylight, candid editorial aesthetic." },
  { label: "✨ مينيمال فاخر (Luxury Editorial)", text: "Luxury minimal composition with the KUBE cup, generous clean negative space, refined geometrical shadow play, sophisticated monochrome palette with a subtle touch of KUBE red, high-end design publication aesthetic." },
];

function OptionRow({
  label,
  options,
  value,
  onChange,
  cols = 3,
}: {
  label: string;
  options: readonly { id: string; label: string }[];
  value: string;
  onChange: (id: string) => void;
  cols?: number;
}) {
  return (
    <div>
      <div className="text-xs text-studio-muted mb-2">{label}</div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {options.map((o) => (
          <Button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            variant="outline"
            size="sm"
            className={`h-9 rounded-md px-1 text-[11px] font-bold transition ${
              value === o.id
                ? "border-studio-accent bg-studio-accent/10 text-studio-foreground"
                : "border-studio-border bg-studio-bg/40 text-studio-muted hover:bg-studio-panel-raised"
            }`}
          >
            {o.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

const lightIcons = {
  top: ArrowUp,
  bottom: ArrowDown,
  right: ArrowRight,
  left: ArrowLeft,
} as const;

function LightDirectionPicker({ value, onChange }: { value: string; onChange: (id: string) => void }) {
  return (
    <div>
      <div className="mb-2 text-xs text-studio-muted">اتجاه الإضاءة</div>
      <div className="studio-camera-grid relative mx-auto grid max-w-64 grid-cols-3 gap-2 rounded-md border border-studio-border bg-studio-panel p-3">
        {LIGHT_DIRECTIONS.map((option) => {
          const Icon = lightIcons[option.id as keyof typeof lightIcons] ?? Sun;
          return (
            <Button key={option.id} type="button" variant="outline" size="sm" onClick={() => onChange(option.id)} title={`إضاءة من ${option.label}`} className={`h-14 flex-col gap-1 px-1 text-[10px] ${value === option.id ? "border-studio-accent bg-studio-accent/10 text-studio-foreground" : "border-studio-border bg-studio-bg/50 text-studio-muted"}`}>
              <Icon className="h-4 w-4" />{option.label}
            </Button>
          );
        })}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-md border border-studio-border bg-studio-bg text-studio-muted shadow-lg"><Camera className="h-5 w-5" /></span>
        </div>
      </div>
    </div>
  );
}

export function PromptPanel({
  prompt,
  onPromptChange,
  brandMode,
  onBrandModeChange,
  aspectRatio,
  onAspectRatioChange,
  settings,
  onSettingsChange,
  onGenerate,
  onClear,
  generating,
  disabled,
  model,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  brandMode: boolean;
  onBrandModeChange: (v: boolean) => void;
  aspectRatio: AspectRatio;
  onAspectRatioChange: (v: AspectRatio) => void;
  settings: StudioSettings;
  onSettingsChange: (v: StudioSettings) => void;
  onGenerate: () => void;
  onClear: () => void;
  generating: boolean;
  disabled?: boolean;
  model: string;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const patch = (p: Partial<StudioSettings>) => onSettingsChange({ ...settings, ...p });

  const activeHex =
    settings.background === "custom"
      ? settings.backgroundHex
      : (BACKGROUND_PRESETS.find((b) => b.id === settings.background)?.hex ?? null);

  return (
    <section className="studio-panel flex h-full flex-col gap-4 p-4 lg:p-5">
      <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-studio-accent" /><h2 className="text-sm font-bold">الوصف والإعدادات</h2></div>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={8}
        className="studio-control min-h-52 w-full resize-none rounded-md p-4 text-sm leading-7 outline-none transition focus:border-studio-accent focus:ring-1 focus:ring-studio-accent"
        dir="auto"
        placeholder="Create a premium KUBEUP campaign image using the uploaded references. Preserve the mood and lighting of the reference image, naturally integrate the KUBEUP cup, keep the style minimal, cinematic, and premium, and generate a polished commercial result."
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <Button
            key={q.label}
            type="button"
            onClick={() => onPromptChange(prompt.trim() ? `${prompt.trim()}\n${q.text}` : q.text)}
            variant="outline" size="sm" className="h-7 rounded-md border-studio-border bg-studio-bg/40 px-2 text-[11px] text-studio-muted hover:bg-studio-panel-raised hover:text-studio-foreground"
          >
            {q.label}
          </Button>
        ))}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-md border border-studio-border bg-studio-bg/45 p-3">
        <span className="min-w-0">
          <span className="block font-bold text-sm">KUBEUP Brand Mode</span>
          <span className="block text-xs text-studio-muted">يضيف تعليمات هوية KUBEUP تلقائياً قبل التوليد</span>
        </span>
        <input
          type="checkbox"
          checked={brandMode}
          onChange={(e) => onBrandModeChange(e.target.checked)}
          className="h-5 w-5 shrink-0 accent-studio-accent"
        />
      </label>

      <div>
        <div className="text-xs text-studio-muted mb-2">نسبة الصورة</div>
        <div className="grid grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((r) => (
            <Button
              key={r}
              type="button"
              onClick={() => onAspectRatioChange(r)}
              variant="outline" size="sm" className={`h-10 rounded-md text-xs font-bold transition ${
                aspectRatio === r ? "border-studio-accent bg-studio-accent/10 text-studio-foreground" : "border-studio-border bg-studio-bg/40 text-studio-muted hover:bg-studio-panel-raised"
              }`}
            >
              <span className={`block border border-current ${r === "9:16" ? "h-5 w-3" : r === "16:9" ? "h-3 w-5" : r === "4:5" ? "h-5 w-4" : r === "3:2" ? "h-3 w-5" : "h-4 w-4"}`} />
              <span>{r}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* لون الخلفية */}
      <div>
        <div className="text-xs text-studio-muted mb-2">لون الخلفية</div>
        <div className="flex flex-wrap items-center gap-2">
          {BACKGROUND_PRESETS.filter((b) => b.hex).map((b) => (
            <button
              key={b.id}
              type="button"
              title={b.label}
              aria-label={b.label}
              onClick={() => patch({ background: b.id, backgroundHex: b.hex })}
              className={`h-9 w-9 rounded-full border-2 transition ${
                settings.background === b.id ? "border-studio-accent scale-105" : "border-studio-border"
              }`}
              style={{ backgroundColor: b.hex! }}
            />
          ))}
          <label
            className={`relative h-9 w-9 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 transition ${
              settings.background === "custom" ? "border-studio-accent scale-105" : "border-studio-border"
            }`}
            title="لون مخصص"
            style={{
              background:
                settings.background === "custom" && settings.backgroundHex
                  ? settings.backgroundHex
                  : "conic-gradient(#ef4444,#eab308,#22c55e,#3b82f6,#a855f7,#ef4444)",
            }}
          >
            <input
              type="color"
              value={settings.backgroundHex ?? "#ffffff"}
              onChange={(e) => patch({ background: "custom", backgroundHex: e.target.value })}
              className="absolute inset-0 cursor-pointer opacity-0"
            />
          </label>
          <Button
            type="button"
            onClick={() => patch({ background: "keep", backgroundHex: null })}
            variant="outline"
            size="sm"
            className={`h-9 rounded-md px-3 text-[11px] font-bold ${
              settings.background === "keep"
                ? "border-studio-accent bg-studio-accent/10 text-studio-foreground"
                : "border-studio-border bg-studio-bg/40 text-studio-muted hover:bg-studio-panel-raised"
            }`}
          >
            كما في المرجع
          </Button>
        </div>
        {activeHex && (
          <div className="mt-2 text-[11px] text-studio-muted">الخلفية المطلوبة: {activeHex.toUpperCase()}</div>
        )}
      </div>

      {/* الإعدادات المتقدمة */}
      <div className="rounded-md border border-studio-border bg-studio-bg/40">
        <button
          type="button"
          onClick={() => setAdvancedOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 px-3 py-3 text-xs font-bold text-studio-foreground"
        >
           <span className="min-w-0 text-right">
             <span className="flex items-center gap-2"><SlidersHorizontal className="h-3.5 w-3.5 text-studio-muted" /> إعدادات الكاميرا</span>
             {!advancedOpen && <span className="mt-1 block truncate text-[10px] font-normal text-studio-muted">{CAMERA_ANGLES.find((x) => x.id === settings.cameraAngle)?.label} · {LIGHT_DIRECTIONS.find((x) => x.id === settings.lightDirection)?.label} · {LIGHT_QUALITIES.find((x) => x.id === settings.lightQuality)?.label}</span>}
           </span>
          <ChevronDown className={`h-4 w-4 text-studio-muted transition ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
        {advancedOpen && (
          <div className="space-y-4 border-t border-studio-border p-3">
            <OptionRow label="زاوية التصوير" options={CAMERA_ANGLES} value={settings.cameraAngle} onChange={(id) => patch({ cameraAngle: id as StudioSettings["cameraAngle"] })} />
            <LightDirectionPicker value={settings.lightDirection} onChange={(id) => patch({ lightDirection: id as StudioSettings["lightDirection"] })} />
            <OptionRow label="نوع الإضاءة" options={LIGHT_QUALITIES} value={settings.lightQuality} onChange={(id) => patch({ lightQuality: id as StudioSettings["lightQuality"] })} cols={3} />
            <OptionRow label="نمط اللقطة" options={SHOT_STYLES} value={settings.shotStyle} onChange={(id) => patch({ shotStyle: id as StudioSettings["shotStyle"] })} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-md border border-studio-border bg-studio-bg/40 p-3">
          <div className="text-studio-muted">الدقة</div>
          <div className="font-bold">{AI_STUDIO_RESOLUTION}</div>
        </div>
        <div className="rounded-md border border-studio-border bg-studio-bg/40 p-3">
          <div className="text-studio-muted">المودل</div>
          <div className="font-bold">Gemini Pro Image</div>
          <div className="text-[10px] text-studio-muted truncate">{model}</div>
        </div>
      </div>

      <div className="sticky bottom-0 -mb-4 -mx-4 mt-auto bg-studio-panel/95 px-4 pb-4 pt-3 shadow-[0_-12px_30px_-6px_color-mix(in_oklab,var(--studio-bg)_80%,transparent)] backdrop-blur-sm lg:-mx-5 lg:px-5">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            onClick={onGenerate}
            disabled={generating || disabled || prompt.trim().length < 3}
            className="h-12 flex-1 bg-studio-accent font-bold text-studio-accent-foreground shadow-[0_10px_30px_color-mix(in_oklab,var(--studio-accent)_22%,transparent)] hover:bg-studio-accent/90"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? "جارٍ التوليد…" : "توليد الصورة"}
          </Button>
          <Button
            type="button"
            onClick={onClear}
            disabled={generating}
            variant="outline"
            className="h-12 border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised sm:w-auto"
          >
            <Eraser className="w-4 h-4" />
            <span className="sm:sr-only">تفريغ</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
