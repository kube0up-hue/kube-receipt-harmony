import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const ASPECT_RATIOS = ["1:1", "4:5", "9:16", "16:9", "3:2"] as const;
export type AspectRatio = (typeof ASPECT_RATIOS)[number];

/* ===== الإعدادات الإبداعية ===== */

export const BACKGROUND_PRESETS = [
  { id: "keep", label: "كما في المرجع", hex: null },
  { id: "white", label: "أبيض", hex: "#FFFFFF" },
  { id: "black", label: "أسود", hex: "#0B0B0C" },
  { id: "light-gray", label: "رمادي فاتح", hex: "#EDEDEA" },
  { id: "cream", label: "كريمي", hex: "#F6E7C9" },
  { id: "light-blue", label: "أزرق فاتح", hex: "#CFE0F7" },
  { id: "kube-red", label: "أحمر KUBEUP", hex: "#D62828" },
] as const;

export const CAMERA_ANGLES = [
  { id: "auto", label: "تلقائي", en: "" },
  { id: "front", label: "أمام", en: "straight-on frontal camera angle at product eye level" },
  { id: "back", label: "خلف", en: "straight-on rear camera angle showing the back of the product" },
  { id: "right", label: "يمين", en: "camera positioned on the right side of the product" },
  { id: "left", label: "يسار", en: "camera positioned on the left side of the product" },
  { id: "three-quarter", label: "ثلاثة أرباع", en: "three-quarter camera angle showing front and side together" },
  { id: "side", label: "جانبي", en: "pure side profile camera angle" },
  { id: "top", label: "من أعلى", en: "top-down flat lay camera angle looking straight down" },
  { id: "low", label: "من أسفل", en: "low camera angle looking slightly upward for a heroic presence" },
  { id: "bottom", label: "أسفل", en: "camera positioned below the product looking upward" },
  { id: "macro", label: "قريب جداً", en: "extreme macro close-up with shallow depth of field" },
] as const;

export const LIGHT_DIRECTIONS = [
  { id: "auto", label: "تلقائي", en: "" },
  { id: "front", label: "أمام", en: "main light coming from the front of the subject" },
  { id: "back", label: "خلف", en: "backlight behind the subject creating a rim-light separation" },
  { id: "right", label: "يمين", en: "main light coming from the right side" },
  { id: "left", label: "يسار", en: "main light coming from the left side" },
  { id: "top", label: "أعلى", en: "main light coming from directly above" },
  { id: "bottom", label: "أسفل", en: "subtle light coming from below the subject" },
] as const;

export const LIGHT_QUALITIES = [
  { id: "auto", label: "تلقائي", en: "" },
  { id: "soft", label: "ناعمة", en: "soft diffused lighting with gentle gradient shadows" },
  { id: "hard", label: "حادة", en: "hard directional lighting with crisp defined shadows" },
] as const;

export const SHOT_STYLES = [
  { id: "auto", label: "تلقائي", en: "" },
  { id: "product", label: "لقطة منتج", en: "clean studio product photography framing" },
  { id: "social", label: "منشور سوشال", en: "social media post framing with clear negative space for a headline" },
  { id: "lifestyle", label: "نمط حياة", en: "lifestyle editorial framing with natural environment context" },
  { id: "packaging", label: "تغليف", en: "packaging mockup presentation with realistic materials" },
] as const;

export type BackgroundPresetId = (typeof BACKGROUND_PRESETS)[number]["id"];
export type CameraAngleId = (typeof CAMERA_ANGLES)[number]["id"];
export type LightDirectionId = (typeof LIGHT_DIRECTIONS)[number]["id"];
export type LightQualityId = (typeof LIGHT_QUALITIES)[number]["id"];
export type ShotStyleId = (typeof SHOT_STYLES)[number]["id"];

export interface StudioSettings {
  background: BackgroundPresetId | "custom";
  backgroundHex: string | null;
  cameraAngle: CameraAngleId;
  lightDirection: LightDirectionId;
  lightQuality: LightQualityId;
  shotStyle: ShotStyleId;
}

export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  background: "keep",
  backgroundHex: null,
  cameraAngle: "auto",
  lightDirection: "auto",
  lightQuality: "auto",
  shotStyle: "auto",
};

function findEn(list: readonly { id: string; en: string }[], id: string): string {
  return list.find((x) => x.id === id)?.en ?? "";
}

/** يحوّل الإعدادات المختارة إلى تعليمات إنجليزية دقيقة للمودل. */
export function buildSettingsInstruction(s: StudioSettings): string {
  const lines: string[] = [];

  if (s.background === "custom" && s.backgroundHex) {
    lines.push(
      `Replace the background with a clean, evenly lit solid background in the exact color ${s.backgroundHex.toUpperCase()}. Keep the subject edges clean and natural, with a believable contact shadow.`,
    );
  } else if (s.background !== "keep") {
    const preset = BACKGROUND_PRESETS.find((b) => b.id === s.background);
    if (preset?.hex) {
      lines.push(
        `Replace the background with a clean, evenly lit solid ${preset.label === "أسود" ? "black" : ""} background in the exact color ${preset.hex.toUpperCase()}. Keep the subject edges clean and natural, with a believable contact shadow.`,
      );
    }
  }

  const angle = findEn(CAMERA_ANGLES, s.cameraAngle);
  if (angle) lines.push(`Camera: ${angle}.`);

  const dir = findEn(LIGHT_DIRECTIONS, s.lightDirection);
  const quality = findEn(LIGHT_QUALITIES, s.lightQuality);
  if (dir || quality) lines.push(`Lighting: ${[dir, quality].filter(Boolean).join(", ")}.`);

  const style = findEn(SHOT_STYLES, s.shotStyle);
  if (style) lines.push(`Composition: ${style}.`);

  return lines.join("\n");
}

const SettingsSchema = z.object({
  background: z.string().min(1).max(40),
  backgroundHex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "لون غير صحيح")
    .nullable(),
  cameraAngle: z.string().min(1).max(40),
  lightDirection: z.string().min(1).max(40),
  lightQuality: z.string().min(1).max(40),
  shotStyle: z.string().min(1).max(40),
});

export const AI_STUDIO_MODEL = "gemini-3-pro-image";
export const AI_STUDIO_RESOLUTION = "4K";
export const REFERENCE_BUCKET = "ai-kubeup-reference-images";
export const GENERATED_BUCKET = "ai-kubeup-generated-images";
export const MAX_REFERENCES = 6;

/** تعليمات هوية KUBEUP الداخلية — تُضاف للوصف عند تفعيل Brand Mode. */
export const BRAND_INSTRUCTION = `Create a premium original KUBEUP campaign image.
Keep the result polished, modern, commercially refined, and visually premium.
Visual direction: luxury minimal, cinematic, youthful premium coffee brand.
Use a white and black base palette with subtle red accents only.
Maintain clean composition, elegant lighting, premium product presentation, and a high-end commercial feel.
If reference images are provided, preserve the mood, lighting direction, and composition style while naturally integrating KUBEUP identity and product presentation.
Do not make the result look pasted. Make it feel like an original KUBEUP creative campaign.`;

export function buildFinalPrompt(
  prompt: string,
  brandMode: boolean,
  aspectRatio: AspectRatio,
  settings: StudioSettings = DEFAULT_STUDIO_SETTINGS,
): string {
  const technical = `Output requirements: aspect ratio ${aspectRatio}, ultra high resolution 4K output, sharp commercial-grade detail, no watermark, no visible text artifacts.`;
  const creative = buildSettingsInstruction(settings);
  return [prompt.trim(), brandMode ? BRAND_INSTRUCTION : "", creative, technical]
    .filter((p) => p.length > 0)
    .join("\n\n");
}

const GenerateInput = z.object({
  prompt: z.string().trim().min(3, "اكتب وصفاً للصورة").max(4000),
  aspectRatio: z.enum(ASPECT_RATIOS),
  brandMode: z.boolean(),
  referencePaths: z.array(z.string().min(1)).max(MAX_REFERENCES),
  settings: SettingsSchema.optional(),
});

type AnySupabase = {
  from: (t: string) => any;
  storage: { from: (b: string) => any };
};

async function assertStudioAccess(supabase: AnySupabase, userId: string) {
  const [{ data: perms }, { data: roles }] = await Promise.all([
    supabase.from("user_permissions").select("permission").eq("user_id", userId).eq("permission", "ai_studio_use"),
    supabase.from("user_roles").select("role").eq("user_id", userId).in("role", ["admin", "owner"]),
  ]);
  const allowed = (perms?.length ?? 0) > 0 || (roles?.length ?? 0) > 0;
  if (!allowed) throw new Error("لا تملك صلاحية استوديو الصور");
}

export interface StudioStatus {
  configured: boolean;
  model: string;
  resolution: string;
}

/** هل مفتاح Gemini مُهيأ؟ لا يُعيد المفتاح نفسه أبداً. */
export const getStudioStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async (): Promise<StudioStatus> => ({
    configured: !!process.env["GEMINI_API_KEY"],
    model: AI_STUDIO_MODEL,
    resolution: AI_STUDIO_RESOLUTION,
  }));

export interface StudioBrandSettings {
  instruction: string;
  updatedAt: string | null;
  updatedByName: string | null;
  canEdit: boolean;
}

export const getStudioBrandSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<StudioBrandSettings> => {
    const supabase = context.supabase as unknown as AnySupabase;
    await assertStudioAccess(supabase, context.userId);
    const [{ data: setting }, { data: roles }] = await Promise.all([
      supabase.from("ai_kubeup_studio_settings").select("brand_instruction, updated_at").eq("setting_key", "brand_identity").maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", context.userId).in("role", ["admin", "owner"]),
    ]);
    return {
      instruction: setting?.brand_instruction ?? BRAND_INSTRUCTION,
      updatedAt: setting?.updated_at ?? null,
      updatedByName: null,
      canEdit: (roles?.length ?? 0) > 0,
    };
  });

export const saveStudioBrandSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({ instruction: z.string().trim().min(20).max(8000) }).parse(input))
  .handler(async ({ data, context }): Promise<StudioBrandSettings> => {
    const supabase = context.supabase as unknown as AnySupabase;
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", context.userId).in("role", ["admin", "owner"]);
    if ((roles?.length ?? 0) === 0) throw new Error("لا تملك صلاحية تعديل هوية KUBEUP");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: previous } = await supabaseAdmin
      .from("ai_kubeup_studio_settings")
      .select("brand_instruction")
      .eq("setting_key", "brand_identity")
      .maybeSingle();
    const updatedAt = new Date().toISOString();
    const { error } = await supabaseAdmin.from("ai_kubeup_studio_settings").upsert({
      setting_key: "brand_identity",
      brand_instruction: data.instruction,
      updated_by: context.userId,
      updated_at: updatedAt,
    });
    if (error) throw new Error(error.message);
    const { error: auditError } = await supabaseAdmin.from("activity_log").insert({
      actor_user: context.userId,
      action: "update_ai_kubeup_brand_instruction",
      entity: "ai_kubeup_studio_settings",
      details: { setting_key: "brand_identity" },
      old_value: { brand_instruction: previous?.brand_instruction ?? null },
      new_value: { brand_instruction: data.instruction },
    });
    if (auditError) throw new Error(auditError.message);
    const { data: actor } = await supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).maybeSingle();
    return { instruction: data.instruction, updatedAt, updatedByName: actor?.full_name ?? null, canEdit: true };
  });

export interface GenerateResult {
  id: string;
  path: string;
  finalPrompt: string;
}

interface GeminiPart {
  text?: string;
  inlineData?: { mimeType?: string; data?: string };
  inline_data?: { mime_type?: string; data?: string };
}

function extractImage(json: any): { data: string; mimeType: string } | null {
  const parts: GeminiPart[] = json?.candidates?.[0]?.content?.parts ?? [];
  for (const p of parts) {
    const inline = p.inlineData ?? p.inline_data;
    const data = (inline as any)?.data;
    if (data) {
      const mimeType = (inline as any)?.mimeType ?? (inline as any)?.mime_type ?? "image/png";
      return { data, mimeType };
    }
  }
  return null;
}

function readableError(status: number, body: string): string {
  let message = body.slice(0, 400);
  try {
    const parsed = JSON.parse(body);
    message = parsed?.error?.message ?? message;
  } catch {
    /* نص خام */
  }
  if (status === 401 || status === 403) return `مفتاح Gemini غير صالح أو لا يملك صلاحية استخدام المودل: ${message}`;
  if (status === 429) return `تم تجاوز حد الاستخدام لدى Gemini، جرّب بعد قليل: ${message}`;
  if (status >= 500) return `خدمة Gemini غير متاحة حالياً، جرّب مرة أخرى: ${message}`;
  return `فشل التوليد (${status}): ${message}`;
}

/** توليد صورة عبر Gemini Pro Image ثم حفظها في المخزن وتسجيلها. المفتاح يُقرأ في الخادم فقط. */
export const generateStudioImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => GenerateInput.parse(input))
  .handler(async ({ data, context }): Promise<GenerateResult> => {
    const supabase = context.supabase as unknown as AnySupabase;
    await assertStudioAccess(supabase, context.userId);

    const apiKey = process.env["GEMINI_API_KEY"];
    if (!apiKey) throw new Error("مفتاح Gemini غير مُهيأ بعد");

    const settings: StudioSettings = {
      ...DEFAULT_STUDIO_SETTINGS,
      ...(data.settings as Partial<StudioSettings> | undefined),
    };
    let brandInstruction = BRAND_INSTRUCTION;
    if (data.brandMode) {
      const { data: brandSetting } = await supabase
        .from("ai_kubeup_studio_settings")
        .select("brand_instruction")
        .eq("setting_key", "brand_identity")
        .maybeSingle();
      brandInstruction = brandSetting?.brand_instruction ?? BRAND_INSTRUCTION;
    }
    const technical = `Output requirements: aspect ratio ${data.aspectRatio}, ultra high resolution 4K output, sharp commercial-grade detail, no watermark, no visible text artifacts.`;
    const creative = buildSettingsInstruction(settings);
    const finalPrompt = [data.prompt.trim(), data.brandMode ? brandInstruction : "", creative, technical]
      .filter((part) => part.length > 0)
      .join("\n\n");

    // 1) سجل العملية أولاً حتى يظهر أي فشل في السجل
    const { data: row, error: insertError } = await supabase
      .from("ai_kubeup_generations")
      .insert({
        status: "processing",
        prompt: data.prompt.trim(),
        final_prompt: finalPrompt,
        brand_mode: data.brandMode,
        aspect_ratio: data.aspectRatio,
        resolution: AI_STUDIO_RESOLUTION,
        model_name: AI_STUDIO_MODEL,
        reference_images: data.referencePaths.map((p) => ({ bucket: REFERENCE_BUCKET, path: p })),
        settings,
        created_by: context.userId,
      })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    const generationId: string = row.id;

    const fail = async (message: string): Promise<never> => {
      await supabase
        .from("ai_kubeup_generations")
        .update({ status: "failed", error_message: message })
        .eq("id", generationId);
      throw new Error(message);
    };

    try {
      // 2) الصور المرجعية من المخزن الخاص
      const referenceParts: GeminiPart[] = [];
      for (const path of data.referencePaths) {
        const { data: file, error } = await supabase.storage.from(REFERENCE_BUCKET).download(path);
        if (error || !file) return await fail(`تعذر قراءة صورة مرجعية: ${error?.message ?? path}`);
        const buf = Buffer.from(await (file as Blob).arrayBuffer());
        referenceParts.push({
          inlineData: {
            mimeType: (file as Blob).type || "image/jpeg",
            data: buf.toString("base64"),
          },
        });
      }

      // 3) نداء المودل — مع طلب النسبة و4K، وإعادة المحاولة بدون إعدادات الصورة إن رفضها المودل
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_STUDIO_MODEL}:generateContent`;
      const baseBody = {
        contents: [{ role: "user", parts: [{ text: finalPrompt }, ...referenceParts] }],
      };
      const call = async (withImageConfig: boolean) =>
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
          body: JSON.stringify(
            withImageConfig
              ? {
                  ...baseBody,
                  generationConfig: {
                    responseModalities: ["TEXT", "IMAGE"],
                    imageConfig: { aspectRatio: data.aspectRatio, imageSize: AI_STUDIO_RESOLUTION },
                  },
                }
              : { ...baseBody, generationConfig: { responseModalities: ["TEXT", "IMAGE"] } },
          ),
        });

      let response = await call(true);
      if (response.status === 400) response = await call(false);

      if (!response.ok) {
        const body = await response.text().catch(() => "");
        console.error(`[ai-studio] gemini ${response.status}: ${body.slice(0, 800)}`);
        return await fail(readableError(response.status, body));
      }

      const json = await response.json();
      const image = extractImage(json);
      if (!image) {
        const refusal: string = json?.candidates?.[0]?.content?.parts?.find((p: GeminiPart) => p.text)?.text ?? "";
        return await fail(
          refusal
            ? `لم يُنتج المودل صورة. رسالته: ${refusal.slice(0, 300)}`
            : "لم يُنتج المودل صورة — عدّل الوصف وجرّب مرة أخرى.",
        );
      }

      // 4) حفظ الناتج في مخزن النتائج
      const ext = image.mimeType.includes("jpeg") ? "jpg" : image.mimeType.includes("webp") ? "webp" : "png";
      const path = `${context.userId}/${generationId}.${ext}`;
      const bytes = Buffer.from(image.data, "base64");
      const { error: uploadError } = await supabase.storage
        .from(GENERATED_BUCKET)
        .upload(path, bytes, { contentType: image.mimeType, upsert: true });
      if (uploadError) return await fail(`تعذر حفظ الصورة الناتجة: ${uploadError.message}`);

      const { error: updateError } = await supabase
        .from("ai_kubeup_generations")
        .update({
          status: "completed",
          generated_image_path: path,
          generated_image_url: `${GENERATED_BUCKET}/${path}`,
          error_message: null,
        })
        .eq("id", generationId);
      if (updateError) return await fail(updateError.message);

      return { id: generationId, path, finalPrompt };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const { data: current } = await supabase
        .from("ai_kubeup_generations").select("status").eq("id", generationId).maybeSingle();
      if (current?.status === "processing") {
        await supabase
          .from("ai_kubeup_generations")
          .update({ status: "failed", error_message: message })
          .eq("id", generationId);
      }
      throw new Error(message);
    }
  });
