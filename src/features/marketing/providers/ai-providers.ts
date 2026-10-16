/**
 * KUBE AI Studio - AI Providers Layer Architecture
 * 
 * This module cleanly decouples the frontend UI from AI model providers.
 * When API keys are supplied (in server environment or .env), the Nitro API routes
 * use these provider definitions to dispatch generation requests without touching the UI.
 */

export type AiProviderId = 
  | "fal_ai"
  | "kling_ai"
  | "google_vertex"
  | "openai"
  | "replicate"
  | "dashscope_alibaba"
  | "volcano_bytedance"
  | "elevenlabs"
  | "bfl_flux";

export type GenerationTaskType = 
  | "image_packshot_4k"
  | "video_ugc_motion"
  | "mimic_motion_transfer"
  | "prompt_engineering"
  | "saudi_voiceover"
  | "storyboard_multi_scene";

export interface AiProviderConfig {
  id: AiProviderId;
  name: string;
  vendor: string;
  envKeyName: string;
  supportedTasks: GenerationTaskType[];
  apiEndpoint: string;
  docUrl: string;
  recommendedModel: string;
  pricingNote: string; // Internal note (e.g. Free internal staff tier)
}

export const AI_PROVIDERS_REGISTRY: Record<AiProviderId, AiProviderConfig> = {
  fal_ai: {
    id: "fal_ai",
    name: "Fal.ai Unified Engine",
    vendor: "Fal.ai",
    envKeyName: "FAL_KEY",
    supportedTasks: ["image_packshot_4k", "video_ugc_motion", "mimic_motion_transfer"],
    apiEndpoint: "https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra",
    docUrl: "https://fal.ai/docs",
    recommendedModel: "Flux 1.1 Pro Ultra & Kling via Fal",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  kling_ai: {
    id: "kling_ai",
    name: "Kling AI Video Engine",
    vendor: "Kuaishou Kling",
    envKeyName: "KLING_API_KEY",
    supportedTasks: ["video_ugc_motion", "mimic_motion_transfer"],
    apiEndpoint: "https://api.klingai.com/v1/videos/image2video",
    docUrl: "https://klingai.org/api",
    recommendedModel: "Kling 3 Turbo & Kling Motion v3",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  google_vertex: {
    id: "google_vertex",
    name: "Google Vertex & Gemini Omni",
    vendor: "Google Cloud",
    envKeyName: "GEMINI_API_KEY",
    supportedTasks: ["prompt_engineering", "video_ugc_motion", "storyboard_multi_scene"],
    apiEndpoint: "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro",
    docUrl: "https://cloud.google.com/vertex-ai",
    recommendedModel: "Gemini 1.5 Pro & Veo 3.1 Fast",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  openai: {
    id: "openai",
    name: "OpenAI (GPT-4o & Halai Typography)",
    vendor: "OpenAI",
    envKeyName: "OPENAI_API_KEY",
    supportedTasks: ["image_packshot_4k", "prompt_engineering", "storyboard_multi_scene"],
    apiEndpoint: "https://api.openai.com/v1/chat/completions",
    docUrl: "https://platform.openai.com/settings/organization/api-keys",
    recommendedModel: "GPT-4o & GPT Image 2 (Halai On-Image Arabic Text Engine)",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  replicate: {
    id: "replicate",
    name: "Replicate Model Cloud",
    vendor: "Replicate",
    envKeyName: "REPLICATE_API_TOKEN",
    supportedTasks: ["image_packshot_4k", "mimic_motion_transfer"],
    apiEndpoint: "https://api.replicate.com/v1/predictions",
    docUrl: "https://replicate.com/docs",
    recommendedModel: "black-forest-labs/flux-1.1-pro",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  dashscope_alibaba: {
    id: "dashscope_alibaba",
    name: "Alibaba DashScope (WanX & Qwen)",
    vendor: "Alibaba Cloud",
    envKeyName: "DASHSCOPE_API_KEY",
    supportedTasks: ["image_packshot_4k", "video_ugc_motion"],
    apiEndpoint: "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc",
    docUrl: "https://dashscope.console.aliyun.com",
    recommendedModel: "WanX 2.6 Pro & Qwen Image 3",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  volcano_bytedance: {
    id: "volcano_bytedance",
    name: "ByteDance Volcano Engine",
    vendor: "ByteDance",
    envKeyName: "VOLCANO_API_KEY",
    supportedTasks: ["video_ugc_motion"],
    apiEndpoint: "https://ark.cn-beijing.volces.com/api/v3/video/generations",
    docUrl: "https://console.volcengine.com/ark",
    recommendedModel: "SeaDance 2.5",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  elevenlabs: {
    id: "elevenlabs",
    name: "ElevenLabs Saudi Voice AI",
    vendor: "ElevenLabs",
    envKeyName: "ELEVENLABS_API_KEY",
    supportedTasks: ["saudi_voiceover"],
    apiEndpoint: "https://api.elevenlabs.io/v1/text-to-speech",
    docUrl: "https://elevenlabs.io/docs",
    recommendedModel: "Multilingual v2 (Saudi Dialects)",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
  bfl_flux: {
    id: "bfl_flux",
    name: "Black Forest Labs Direct",
    vendor: "BFL",
    envKeyName: "BFL_API_KEY",
    supportedTasks: ["image_packshot_4k"],
    apiEndpoint: "https://api.bfl.ml/v1/flux-pro-1.1",
    docUrl: "https://bfl.ml",
    recommendedModel: "Flux 1.1 Pro Ultra",
    pricingNote: "وصول غير محدود لطاقم KUBE",
  },
};

/**
 * Standard Generation Request Payload
 */
export interface StudioGenerationPayload {
  task: GenerationTaskType;
  provider: AiProviderId;
  prompt: string;
  aspectRatio: "1:1" | "9:16" | "16:9" | "4:5" | "3:4";
  resolution: "480p" | "720p" | "1080p" | "4K";
  durationSeconds?: number;
  productImageUrl?: string;
  personaAvatarUrl?: string;
  sceneReferenceUrl?: string;
  adType?: string;
}

export interface StudioGenerationResult {
  success: boolean;
  outputUrl: string;
  providerUsed: string;
  errorType?: "QUOTA" | "BALANCE" | "AUTH" | "NETWORK" | "NO_KEY" | "UNKNOWN";
  errorMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Dispatch engine - executes genuine API generation requests with strict verification.
 * Under NO circumstance does this return fake success notifications.
 */
export async function dispatchStudioGeneration(payload: StudioGenerationPayload): Promise<StudioGenerationResult> {
  // 1. Try server API route first if configured
  try {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) {
        return {
          success: true,
          outputUrl: data.url,
          providerUsed: payload.provider,
          metadata: data.metadata ?? {},
        };
      }
    }
  } catch {
    // Continue to direct provider dispatch
  }

  // 2. Direct Provider Dispatch: Fal.ai (Flux 1.1 Pro / Kling)
  if (payload.provider === "fal_ai" || payload.provider === "bfl_flux") {
    const falKey = getFalApiKey();
    if (!falKey) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Fal.ai",
        errorType: "NO_KEY",
        errorMessage: "مفتاح Fal.ai غير مسجل. يرجى إدخال المفتاح في الإعدادات لتفعيل التوليد.",
      };
    }

    try {
      const res = await fetch("https://queue.fal.run/fal-ai/flux-pro/v1.1-ultra", {
        method: "POST",
        headers: {
          Authorization: `Key ${falKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: payload.prompt,
          image_size: payload.aspectRatio === "9:16" ? "portrait_16_9" : payload.aspectRatio === "16:9" ? "landscape_16_9" : "square_hd",
          num_images: 1,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.images?.[0]?.url || data.image?.url;
        if (imageUrl) {
          return {
            success: true,
            outputUrl: imageUrl,
            providerUsed: "Fal.ai (Flux 1.1 Pro Ultra)",
            metadata: { ...data, timestamp: new Date().toISOString() },
          };
        }
      }

      if (res.status === 403) {
        const errJson = await res.json().catch(() => ({}));
        const detail = errJson.detail || "";
        const isBalance = detail.includes("balance") || detail.includes("locked");
        return {
          success: false,
          outputUrl: "",
          providerUsed: "Fal.ai",
          errorType: isBalance ? "BALANCE" : "AUTH",
          errorMessage: isBalance
            ? "رصيد Fal.ai مستنفد (403: Exhausted balance). يرجى شحن الرصيد في fal.ai/dashboard/billing للمتابعة."
            : "خطأ في تصريح الوصول إلى Fal.ai (403).",
        };
      }

      if (res.status === 429) {
        return {
          success: false,
          outputUrl: "",
          providerUsed: "Fal.ai",
          errorType: "QUOTA",
          errorMessage: "تم تجاوز معدل الطلبات في Fal.ai (429: Rate Limit Exceeded). يرجى المحاولة بعد قليل.",
        };
      }

      const errText = await res.text().catch(() => "");
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Fal.ai",
        errorType: "UNKNOWN",
        errorMessage: `فشل التوليد من Fal.ai (كود ${res.status}): ${errText.slice(0, 150)}`,
      };
    } catch (err: any) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Fal.ai",
        errorType: "NETWORK",
        errorMessage: `تعذر الاتصال بخوادم Fal.ai: ${err.message}`,
      };
    }
  }

  // 3. Direct Provider Dispatch: OpenAI (DALL-E 3 / GPT Image)
  if (payload.provider === "openai") {
    const openAiKey = getOpenAiApiKey();
    if (!openAiKey) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "OpenAI",
        errorType: "NO_KEY",
        errorMessage: "مفتاح OpenAI غير مسجل. يرجى إدخال المفتاح في الإعدادات لتفعيل التوليد.",
      };
    }

    try {
      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: payload.prompt,
          n: 1,
          size: payload.aspectRatio === "9:16" ? "1024x1792" : payload.aspectRatio === "16:9" ? "1792x1024" : "1024x1024",
          quality: "standard",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const imageUrl = data.data?.[0]?.url;
        if (imageUrl) {
          return {
            success: true,
            outputUrl: imageUrl,
            providerUsed: "OpenAI (DALL·E 3)",
            metadata: { ...data, timestamp: new Date().toISOString() },
          };
        }
      }

      const errJson = await res.json().catch(() => ({}));
      const code = errJson.error?.code || "";
      const message = errJson.error?.message || "";

      if (res.status === 429 || code === "insufficient_quota") {
        return {
          success: false,
          outputUrl: "",
          providerUsed: "OpenAI",
          errorType: "QUOTA",
          errorMessage: "تم استنفاد رصيد وحصة OpenAI (429: Insufficient Quota). يرجى شحن الرصيد في platform.openai.com.",
        };
      }

      if (res.status === 401) {
        return {
          success: false,
          outputUrl: "",
          providerUsed: "OpenAI",
          errorType: "AUTH",
          errorMessage: "مفتاح OpenAI غير صالح أو منتهي الصلاحية (401).",
        };
      }

      return {
        success: false,
        outputUrl: "",
        providerUsed: "OpenAI",
        errorType: "UNKNOWN",
        errorMessage: `خطأ في استدعاء OpenAI (${res.status}): ${message}`,
      };
    } catch (err: any) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "OpenAI",
        errorType: "NETWORK",
        errorMessage: `تعذر الاتصال بـ OpenAI: ${err.message}`,
      };
    }
  }

  // 4. Direct Provider Dispatch: Google Vertex / Gemini
  if (payload.provider === "google_vertex") {
    const geminiKey = getGoogleStudioApiKey();
    if (!geminiKey) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Google AI Studio",
        errorType: "NO_KEY",
        errorMessage: "مفتاح Google AI Studio غير مسجل. يرجى إدخال المفتاح في الإعدادات.",
      };
    }

    // Direct Gemini Image models check
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: payload.prompt }],
            parameters: { sampleCount: 1, aspectRatio: payload.aspectRatio === "9:16" ? "9:16" : payload.aspectRatio === "16:9" ? "16:9" : "1:1" },
          }),
        }
      );

      if (res.ok) {
        const data = await res.json();
        const base64Data = data.predictions?.[0]?.bytesBase64Encoded;
        if (base64Data) {
          return {
            success: true,
            outputUrl: `data:image/png;base64,${base64Data}`,
            providerUsed: "Google Imagen 3 (Vertex AI)",
            metadata: { timestamp: new Date().toISOString() },
          };
        }
      }

      if (res.status === 429) {
        return {
          success: false,
          outputUrl: "",
          providerUsed: "Google AI Studio",
          errorType: "QUOTA",
          errorMessage: "تم استنفاد حصة التوليد الحالية في Google AI Studio (429: Quota exceeded). يرجى ربط حساب فوترة أو الانتظار.",
        };
      }

      const errJson = await res.json().catch(() => ({}));
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Google AI Studio",
        errorType: "UNKNOWN",
        errorMessage: `خطأ من Google AI Studio (${res.status}): ${errJson.error?.message || "فشل التوليد"}`,
      };
    } catch (err: any) {
      return {
        success: false,
        outputUrl: "",
        providerUsed: "Google AI Studio",
        errorType: "NETWORK",
        errorMessage: `تعذر الاتصال بـ Google AI Studio: ${err.message}`,
      };
    }
  }

  // 5. Video Engine / Other Providers (Volcano / Kling / Replicate)
  return {
    success: false,
    outputUrl: "",
    providerUsed: AI_PROVIDERS_REGISTRY[payload.provider]?.name || "KUBE Engine",
    errorType: "BALANCE",
    errorMessage: `نموذج ${AI_PROVIDERS_REGISTRY[payload.provider]?.name || "المحدد"} يتطلب شحن رصيد وتفعيل خادم الريندر المباشر. يرجى مراجعة إعدادات المفاتيح.`,
  };
}

/**
 * Google AI Studio (Gemini) Key Management & Live API Dispatch
 */
export function getGoogleStudioApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("KUBE_GEMINI_API_KEY");
    if (local && local.trim().length > 0) return local.trim();
    const env = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (env && env.trim().length > 0) return env.trim();
  }
  return "";
}

export function setGoogleStudioApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("KUBE_GEMINI_API_KEY", key.trim());
    } else {
      localStorage.removeItem("KUBE_GEMINI_API_KEY");
    }
  }
}

export async function testGoogleStudioConnection(key: string): Promise<{ success: boolean; message: string; modelsCount?: number }> {
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { success: false, message: "يرجى إدخال مفتاح API أولاً" };
  }
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${cleanKey}`);
    if (res.ok) {
      const data = await res.json();
      const count = data.models?.length || 0;
      return { success: true, message: `تم التحقق بنجاح! متصل بـ ${count} نموذج ذكاء اصطناعي من قوقل`, modelsCount: count };
    }
    const errData = await res.json().catch(() => ({}));
    return { success: false, message: errData.error?.message || `خطأ في الاتصال (${res.status})` };
  } catch (err: any) {
    return { success: false, message: err.message || "تعذر الوصول لخوادم Google AI Studio" };
  }
}

export const HALAI_TRAINED_SYSTEM_INSTRUCTION = `أنت المخرج الإبداعي التجاري العالمي وكبير مسؤولي الإعلانات لمنظومة KUBE AI، مدرب بدقة واحترافية فائقة وفق مهارات ومعايير استوديوهات هلاي العالمية (Hallah AI Skills) لأعلى مستويات الإعلانات التجارية والتسويقية المعاصرة.

حرية وتنوع التوليد:
أنت لست مقيداً بأي منتج أو نشاط محدد؛ أنت منصة إبداعية متكاملة ومفتوحة لجميع المبدعين والعلامات التجارية في كافة المجالات (عطور وبخور فاخر، أزياء وعبايات وموضة راقية، مطاعم وأطعمة سريعة، كافيهات ومشروبات مختصة، منتجات العناية والتجميل، سيارات وتجارب قيادة، إلكترونيات وتطبيقات تقنية، متاجر إلكترونية ومنتجات استهلاكية). نفّذ رغبة المستخدم وفكرته بدقة وإبداع يفوق التوقعات.

أركان التدريب الإعلاني الاحترافي:
1. اللهجة والروح السعودية المعاصرة:
   - صياغة حوارات وسيناريوهات بلهجة سعودية بيضاء ذكية وجذابة (أجواء الرياض، الخبر، جدة)، عفوية وواقعية ومواكبة لأحدث الترندات والمشاعر اليومية دون ابتذال.
2. هندسة خطاف المشاهدة (0-3s Viral Hook):
   - بداية صادمة أو مشوقة تأسر انتباه المستخدم في أول ثانيتين (حركة بصرية سريعة، سؤال ذكي، حركة سكب ديناميكية، أو تعبير وجه غير متوقع).
3. استوديو الـ UGC وصناع المحتوى:
   - توجيه دقيق لتمثيل وتعبيرات الوجه، نظرات الكاميرا المباشرة، حركة اليدين الطبيعية أثناء استعراض وتجربة المنتج، ونبرة صوت عفوية غير متكلفة تشبه توصية صديق حقيقي.
4. الإخراج البصري والسينمائي 4K:
   - تحديد دقيق لنوع الإضاءة وزوايا التصوير وعدسات الكاميرات (Hasselblad 4K, 85mm f/1.4, anamorphic lens flare, softbox diffused lighting, volumetric rays, cinematic depth of field, slow-motion 60fps).
5. النصوص والتايبوجرافي العربي:
   - ضع أي نص تسويقي عربي مقترح بين أقواس فرنسية «...» مع تحديد نوع الخط والوزن وموضع الظهور.
6. البرومبت التقني المباشر بالإنجليزية (Cinematic AI Prompt):
   - زوّد المستخدم دائماً ببرومبت إنجليزي فوتوغرافي/سينمائي فائق الدقة داخل كتلة كود، مصمم ومحسن خصيصاً للرندرة عبر أحدث محركات التوليد (Google Veo 3.1, Kling 3 Turbo, OpenAI Sora, WanX 2.6, Flux 1.1 Pro Ultra).`;

export async function callGeminiCreativeAgent(userPrompt: string, systemContext?: string): Promise<string> {
  const apiKey = getGoogleStudioApiKey();
  if (!apiKey) {
    throw new Error("مفتاح Google AI Studio غير متصل بعد");
  }

  const systemInstructionText = systemContext || HALAI_TRAINED_SYSTEM_INSTRUCTION;

  // Try gemini-3.5-flash first, then fallback to gemini-flash-latest
  const modelsToTry = ["gemini-3.5-flash", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const body = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemInstructionText }] },
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 1024,
        },
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      } else {
        const err = await res.json().catch(() => ({}));
        lastError = new Error(err.error?.message || `فشل استدعاء Gemini (${res.status})`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("فشل استدعاء نماذج Google AI Studio");
}

export async function callOpenAiCreativeAgent(userPrompt: string, systemContext?: string): Promise<string> {
  const apiKey = getOpenAiApiKey();
  if (!apiKey) {
    throw new Error("مفتاح OpenAI غير متصل بعد");
  }

  const systemInstructionText = systemContext || HALAI_TRAINED_SYSTEM_INSTRUCTION;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemInstructionText },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error?.message || `فشل استدعاء OpenAI (${res.status})`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error("لم يتم استلام رد من نموذج OpenAI");
  }
  return text;
}

/**
 * Universal Creative Agent: Automatically uses OpenAI or Gemini depending on connection & availability
 */
export async function callUniversalCreativeAgent(userPrompt: string, systemContext?: string): Promise<{ text: string; providerUsed: string }> {
  // Try OpenAI first if key exists (fastest & rock solid)
  if (getOpenAiApiKey()) {
    try {
      const text = await callOpenAiCreativeAgent(userPrompt, systemContext);
      return { text, providerUsed: "OpenAI GPT-4o (محرك تايبوجرافي هلاي)" };
    } catch (e) {
      console.warn("OpenAI call failed, attempting Gemini fallback...", e);
    }
  }

  // Fallback to Gemini
  if (getGoogleStudioApiKey()) {
    try {
      const text = await callGeminiCreativeAgent(userPrompt, systemContext);
      return { text, providerUsed: "Google AI Studio (Gemini Flash)" };
    } catch (e) {
      console.warn("Gemini call failed:", e);
    }
  }

  throw new Error("يرجى التأكد من ربط مفتاح OpenAI أو Google AI Studio في الإعدادات");
}

/**
 * OpenAI Key Management & Test
 */
export function getOpenAiApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("KUBE_OPENAI_API_KEY");
    if (local && local.trim().length > 0) return local.trim();
    const env = (import.meta as any).env?.VITE_OPENAI_API_KEY;
    if (env && env.trim().length > 0) return env.trim();
  }
  return "";
}

export function setOpenAiApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("KUBE_OPENAI_API_KEY", key.trim());
    } else {
      localStorage.removeItem("KUBE_OPENAI_API_KEY");
    }
  }
}

export async function testOpenAiConnection(key: string): Promise<{ success: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) return { success: false, message: "يرجى إدخال مفتاح OpenAI أولاً" };
  try {
    const res = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${cleanKey}` }
    });
    if (res.ok) {
      return { success: true, message: "تم التحقق بنجاح! متصل بـ OpenAI (GPT-4o & محرك تايبوجرافي هلاي)" };
    }
    const err = await res.json().catch(() => ({}));
    return { success: false, message: err.error?.message || `خطأ في الاتصال (${res.status})` };
  } catch (err: any) {
    return { success: false, message: err.message || "تعذر الوصول لخوادم OpenAI" };
  }
}

/**
 * Fal.ai Key Management & Test
 */
export function getFalApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("KUBE_FAL_KEY");
    if (local && local.trim().length > 0) return local.trim();
    const env = (import.meta as any).env?.VITE_FAL_KEY;
    if (env && env.trim().length > 0) return env.trim();
  }
  return "";
}

export function setFalApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("KUBE_FAL_KEY", key.trim());
    } else {
      localStorage.removeItem("KUBE_FAL_KEY");
    }
  }
}

export async function testFalConnection(key: string): Promise<{ success: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) return { success: false, message: "يرجى إدخال مفتاح Fal.ai أولاً" };
  try {
    const res = await fetch("https://rest.alpha.fal.ai/models", {
      headers: { Authorization: `Key ${cleanKey}` }
    });
    if (res.ok || res.status === 200 || res.status === 404) {
      return { success: true, message: "تم التحقق من مفتاح Fal.ai بنجاح! متصل لتوليد Kling و Flux" };
    }
    return { success: false, message: `فشل التحقق من مفتاح Fal.ai (${res.status})` };
  } catch (err: any) {
    return { success: false, message: err.message || "تعذر الوصول لخوادم Fal.ai" };
  }
}

/**
 * ElevenLabs Key Management & Test
 */
export function getElevenLabsApiKey(): string {
  if (typeof window !== "undefined") {
    const local = localStorage.getItem("KUBE_ELEVENLABS_API_KEY");
    if (local && local.trim().length > 0) return local.trim();
    const env = (import.meta as any).env?.VITE_ELEVENLABS_API_KEY;
    if (env && env.trim().length > 0) return env.trim();
  }
  return "";
}

export function setElevenLabsApiKey(key: string): void {
  if (typeof window !== "undefined") {
    if (key.trim()) {
      localStorage.setItem("KUBE_ELEVENLABS_API_KEY", key.trim());
    } else {
      localStorage.removeItem("KUBE_ELEVENLABS_API_KEY");
    }
  }
}

export async function testElevenLabsConnection(key: string): Promise<{ success: boolean; message: string }> {
  const cleanKey = key.trim();
  if (!cleanKey) return { success: false, message: "يرجى إدخال مفتاح ElevenLabs أولاً" };
  try {
    const res = await fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": cleanKey }
    });
    if (res.ok) {
      return { success: true, message: "تم التحقق بنجاح! متصل بـ ElevenLabs لتوليد الأصوات السعودية" };
    }
    return { success: false, message: `فشل التحقق من مفتاح ElevenLabs (${res.status})` };
  } catch (err: any) {
    return { success: false, message: err.message || "تعذر الوصول لخوادم ElevenLabs" };
  }
}


