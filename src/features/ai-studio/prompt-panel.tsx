import { Sparkles, Eraser, Loader2 } from "lucide-react";
import { ASPECT_RATIOS, type AspectRatio, AI_STUDIO_RESOLUTION } from "@/lib/ai-studio.functions";
import { Button } from "@/components/ui/button";

export const QUICK_PROMPTS: { label: string; text: string }[] = [
  { label: "Product Shot", text: "Studio product shot of the KUBEUP cup on a clean surface, soft directional light, crisp shadows, premium minimal styling." },
  { label: "Social Campaign", text: "Social campaign visual for KUBEUP with bold negative space for a headline, modern editorial styling, confident premium mood." },
  { label: "Packaging Mockup", text: "Premium packaging mockup presenting KUBEUP identity on cup and sleeve, realistic materials, elegant studio lighting." },
  { label: "Story Visual", text: "Vertical story visual of a KUBEUP moment, cinematic depth, lifestyle framing, elegant and youthful premium feel." },
  { label: "Luxury Minimal", text: "Luxury minimal composition with the KUBEUP cup, generous empty space, refined shadow play, black and white palette with a subtle red accent." },
  { label: "Cinematic Coffee", text: "Cinematic close-up of coffee being poured for KUBEUP, dramatic light, rich texture, high-end commercial grade." },
];

export function PromptPanel({
  prompt,
  onPromptChange,
  brandMode,
  onBrandModeChange,
  aspectRatio,
  onAspectRatioChange,
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
  onGenerate: () => void;
  onClear: () => void;
  generating: boolean;
  disabled?: boolean;
  model: string;
}) {
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
