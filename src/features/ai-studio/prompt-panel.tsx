import { useState } from "react";
import { Sparkles, Eraser, Loader2, SlidersHorizontal, ChevronDown } from "lucide-react";
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
  { label: "Product Shot", text: "Studio product shot of the KUBEUP cup on a clean surface, soft directional light, crisp shadows, premium minimal styling." },
  { label: "Social Campaign", text: "Social campaign visual for KUBEUP with bold negative space for a headline, modern editorial styling, confident premium mood." },
  { label: "Packaging Mockup", text: "Premium packaging mockup presenting KUBEUP identity on cup and sleeve, realistic materials, elegant studio lighting." },
  { label: "Story Visual", text: "Vertical story visual of a KUBEUP moment, cinematic depth, lifestyle framing, elegant and youthful premium feel." },
  { label: "Luxury Minimal", text: "Luxury minimal composition with the KUBEUP cup, generous empty space, refined shadow play, black and white palette with a subtle red accent." },
  { label: "Cinematic Coffee", text: "Cinematic close-up of coffee being poured for KUBEUP, dramatic light, rich texture, high-end commercial grade." },
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
              {r}
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
          <span className="flex items-center gap-2"><SlidersHorizontal className="h-3.5 w-3.5 text-studio-muted" /> الزاوية والإضاءة</span>
          <ChevronDown className={`h-4 w-4 text-studio-muted transition ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
        {advancedOpen && (
          <div className="space-y-4 border-t border-studio-border p-3">
            <OptionRow label="زاوية التصوير" options={CAMERA_ANGLES} value={settings.cameraAngle} onChange={(id) => patch({ cameraAngle: id as StudioSettings["cameraAngle"] })} />
            <OptionRow label="اتجاه الإضاءة" options={LIGHT_DIRECTIONS} value={settings.lightDirection} onChange={(id) => patch({ lightDirection: id as StudioSettings["lightDirection"] })} />
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

      <div className="mt-auto grid grid-cols-[1fr_auto] gap-2 pt-2">
        <Button
          type="button"
          onClick={onGenerate}
          disabled={generating || disabled || prompt.trim().length < 3}
          className="h-12 bg-studio-accent font-bold text-studio-accent-foreground shadow-[0_10px_30px_color-mix(in_oklab,var(--studio-accent)_22%,transparent)] hover:bg-studio-accent/90"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "جارٍ التوليد…" : "توليد"}
        </Button>
        <Button
          type="button"
          onClick={onClear}
          disabled={generating}
          variant="outline" className="h-12 border-studio-border bg-studio-bg/40 text-studio-foreground hover:bg-studio-panel-raised"
        >
          <Eraser className="w-4 h-4" /> تفريغ
        </Button>
      </div>
    </section>
  );
}
