import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AlertTriangle, Sparkles, Cpu, ScanLine } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { PermissionGuard } from "@/components/permission-guard";
import { supabase } from "@/integrations/supabase/client";
import {
  generateStudioImage,
  getStudioStatus,
  AI_STUDIO_MODEL,
  DEFAULT_STUDIO_SETTINGS,
  type StudioSettings,
  type AspectRatio,
} from "@/lib/ai-studio.functions";
import { StudioStatusBadge } from "@/features/ai-studio/status-badge";
import { ReferenceUploadPanel, type ReferenceItem } from "@/features/ai-studio/reference-upload-panel";
import { PromptPanel } from "@/features/ai-studio/prompt-panel";
import { ResultPreviewPanel } from "@/features/ai-studio/result-preview-panel";
import { GenerationHistoryList, type GenerationRow } from "@/features/ai-studio/generation-history-list";

export const Route = createFileRoute("/_authenticated/ai-kubeup-studio")({
  head: () => ({
    meta: [
      { title: "AI KUBEUP Studio — استوديو الصور الداخلي" },
      {
        name: "description",
        content: "استوديو داخلي لتوليد صور KUBEUP الاحترافية بدقة 4K من وصف نصي وصور مرجعية.",
      },
      { property: "og:title", content: "AI KUBEUP Studio" },
      { property: "og:description", content: "توليد صور KUBEUP الاحترافية بدقة 4K من وصف وصور مرجعية." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <PermissionGuard anyOf={["ai_studio_use"]}>
      <StudioPage />
    </PermissionGuard>
  ),
});

function StudioPage() {
  const queryClient = useQueryClient();
  const fetchStatus = useServerFn(getStudioStatus);
  const generate = useServerFn(generateStudioImage);

  const [references, setReferences] = useState<ReferenceItem[]>([]);
  const [prompt, setPrompt] = useState("");
  const [brandMode, setBrandMode] = useState(true);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>("1:1");
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [resultPath, setResultPath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const status = useQuery({
    queryKey: ["ai-studio-status"],
    staleTime: 60_000,
    queryFn: () => fetchStatus(),
  });

  const history = useQuery({
    queryKey: ["ai-studio-history"],
    queryFn: async (): Promise<GenerationRow[]> => {
      const { data, error: qError } = await supabase
        .from("ai_kubeup_generations")
        .select(
          "id, created_at, status, prompt, aspect_ratio, resolution, generated_image_path, error_message, brand_mode, reference_images, settings",
        )
        .order("created_at", { ascending: false })
        .limit(60);
      if (qError) throw qError;
      return (data ?? []) as GenerationRow[];
    },
  });

  const configured = status.data?.configured ?? false;

  async function runGeneration() {
    if (!configured) {
      toast.error("مفتاح Gemini غير مُهيأ بعد");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await generate({
        data: {
          prompt,
          aspectRatio,
          brandMode,
          referencePaths: references.map((r) => r.path),
          settings,
        },
      });
      setResultPath(res.path);
      toast.success("تم توليد الصورة");
    } catch (e) {
      const message = e instanceof Error ? e.message : "تعذر التوليد";
      setError(message);
      setResultPath(null);
    } finally {
      setGenerating(false);
      void queryClient.invalidateQueries({ queryKey: ["ai-studio-history"] });
    }
  }

  return (
    <AppShell title="AI KUBEUP Studio" variant="studio">
      <div className="font-studio-body">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-studio-accent text-studio-accent-foreground shadow-lg"><Sparkles className="h-5 w-5" /></span>
          <div>
          <h1 className="font-studio-display text-2xl font-extrabold tracking-normal">AI KUBEUP Studio</h1>
          <p className="text-sm text-studio-muted mt-1">
            توليد صور KUBEUP الاحترافية من وصف نصي وصور مرجعية.
          </p>
          </div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-1.5 rounded-md border border-studio-border bg-studio-panel px-3 py-1.5 text-xs text-studio-muted sm:flex"><Cpu className="h-3.5 w-3.5" /> Gemini Pro Image</span><span className="hidden items-center gap-1.5 rounded-md border border-studio-border bg-studio-panel px-3 py-1.5 text-xs text-studio-muted sm:flex"><ScanLine className="h-3.5 w-3.5" /> 4K</span><StudioStatusBadge configured={configured} loading={status.isLoading} /></div>
      </div>

      {!status.isLoading && !configured && (
        <div className="studio-panel mb-5 border-studio-accent/40 bg-studio-accent/10 p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-kube-red shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">
              <div className="font-bold text-kube-red">مفتاح Gemini غير مُهيأ بعد</div>
              <p className="text-studio-muted mt-1">
                الاستوديو جاهز بالكامل. أضف مفتاح Gemini في إعدادات الأسرار باسم <code>GEMINI_API_KEY</code>،
                وسيبدأ التوليد بالعمل تلقائياً دون أي تغيير آخر.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid items-stretch gap-4 xl:grid-cols-[minmax(250px,0.8fr)_minmax(420px,1.6fr)_minmax(300px,1fr)]">
        <div className="order-2 xl:order-1"><ReferenceUploadPanel items={references} onChange={setReferences} disabled={generating} /></div>
        <div className="order-3 xl:order-2"><ResultPreviewPanel
          path={resultPath}
          prompt={prompt}
          generating={generating}
          error={error}
          onRegenerate={() => void runGeneration()}
        /></div>
        <div className="order-1 xl:order-3"><PromptPanel
          prompt={prompt}
          onPromptChange={setPrompt}
          brandMode={brandMode}
          onBrandModeChange={setBrandMode}
          aspectRatio={aspectRatio}
          onAspectRatioChange={setAspectRatio}
          settings={settings}
          onSettingsChange={setSettings}
          onGenerate={() => void runGeneration()}
          onClear={() => {
            setPrompt("");
            setReferences([]);
            setResultPath(null);
            setError(null);
            setSettings(DEFAULT_STUDIO_SETTINGS);
          }}
          generating={generating}
          disabled={!configured}
          model={AI_STUDIO_MODEL}
        /></div>
      </div>

      <div className="mt-4">
        <GenerationHistoryList
          rows={history.data ?? []}
          loading={history.isLoading}
          onOpen={(row) => {
            setResultPath(row.generated_image_path);
            setError(null);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onReusePrompt={(row) => {
            setPrompt(row.prompt);
            setBrandMode(row.brand_mode);
            setAspectRatio(
              (["1:1", "4:5", "9:16", "16:9", "3:2"].includes(row.aspect_ratio)
                ? row.aspect_ratio
                : "1:1") as AspectRatio,
            );
            toast.success("تم استرجاع الوصف");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
      </div>
    </AppShell>
  );
}
