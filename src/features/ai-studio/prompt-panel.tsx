import { Sparkles, Eraser, Loader2 } from "lucide-react";
import { ASPECT_RATIOS, type AspectRatio, AI_STUDIO_RESOLUTION } from "@/lib/ai-studio.functions";

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
    <section className="kube-card space-y-3">
      <h2 className="font-bold">الوصف</h2>

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={7}
        className="kube-input !h-auto leading-relaxed"
        dir="auto"
        placeholder="Create a premium KUBEUP campaign image using the uploaded references. Preserve the mood and lighting of the reference image, naturally integrate the KUBEUP cup, keep the style minimal, cinematic, and premium, and generate a polished commercial result."
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q.label}
            type="button"
            onClick={() => onPromptChange(prompt.trim() ? `${prompt.trim()}\n${q.text}` : q.text)}
            className="rounded-full border border-border px-3 py-1 text-xs font-bold hover:border-primary hover:bg-primary/5 transition"
          >
            {q.label}
          </button>
        ))}
      </div>

      <label className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
        <span className="min-w-0">
          <span className="block font-bold text-sm">KUBEUP Brand Mode</span>
          <span className="block text-xs text-muted-foreground">يضيف تعليمات هوية KUBEUP تلقائياً قبل التوليد</span>
        </span>
        <input
          type="checkbox"
          checked={brandMode}
          onChange={(e) => onBrandModeChange(e.target.checked)}
          className="h-5 w-5 accent-[hsl(var(--primary))] shrink-0"
        />
      </label>

      <div>
        <div className="text-xs text-muted-foreground mb-1.5">نسبة الصورة</div>
        <div className="grid grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onAspectRatioChange(r)}
              className={`rounded-lg border py-2 text-xs font-bold transition ${
                aspectRatio === r ? "border-primary bg-primary/10" : "border-border hover:border-primary/60"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted-foreground">الدقة</div>
          <div className="font-bold">{AI_STUDIO_RESOLUTION}</div>
        </div>
        <div className="rounded-lg border border-border p-2">
          <div className="text-muted-foreground">المودل</div>
          <div className="font-bold">Gemini Pro Image</div>
          <div className="text-[10px] text-muted-foreground truncate">{model}</div>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating || disabled || prompt.trim().length < 3}
          className="kube-btn-primary inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? "جارٍ التوليد…" : "توليد"}
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={generating}
          className="kube-btn-outline inline-flex items-center gap-2 disabled:opacity-50"
        >
          <Eraser className="w-4 h-4" /> تفريغ
        </button>
      </div>
    </section>
  );
}
