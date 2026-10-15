export type BrandPersona =
  | "barq_stc"
  | "namq_address"
  | "dunkin"
  | "qurashi_luxury"
  | "interactive_viral"
  | "hala_ai";

export type SocialCategory =
  | "morning"
  | "specialty"
  | "work_exam"
  | "night_vibe"
  | "deals"
  | "national"
  | "contests";

export type SocialChannel = "x" | "instagram" | "tiktok" | "threads";

export interface SocialPostTemplate {
  id: string;
  brandPersona: BrandPersona;
  brandLabel: string;
  tone: string;
  category: SocialCategory;
  text: string;
  hashtags: string[];
  suggestedChannel: SocialChannel;
  targetAudience: string;
  hookHeadline: string;
}

export type VisualCategory =
  | "macro_beverage"
  | "youth_lifestyle"
  | "dark_luxury"
  | "saudi_heritage"
  | "commercial_promo";

export interface VisualPromptTemplate {
  id: string;
  category: VisualCategory;
  categoryLabel: string;
  title: string;
  brandInspiration: string;
  arabicPrompt: string;
  englishPrompt: string;
  aspectRatio: "1:1" | "9:16" | "4:5" | "16:9";
  lighting: string;
  cameraLens: string;
  tags: string[];
}

export interface TrendCampaignPlaybook {
  id: string;
  title: string;
  season: string;
  hook: string;
  activationIdea: string;
  recommendedProducts: string[];
  suggestedDiscount: string;
  targetAge: string;
  expectedGoal: string;
}

export { SAUDI_SOCIAL_POSTS } from "./datasets/social-posts";
export { SAUDI_VISUAL_PROMPTS } from "./datasets/visual-prompts";
export { SAUDI_TREND_PLAYBOOKS } from "./datasets/trend-playbooks";
export {
  SAUDI_UGC_FORMATS,
  SAUDI_CREATOR_PERSONAS,
  KUBE_PRODUCT_STUDIO_PRESETS,
  KUBE_VIDEO_SCRIPTS,
  KUBE_BRAND_KIT,
  type UgcFormat,
  type SaudiCreatorPersona,
  type ProductStudioPreset,
  type VideoScriptTemplate,
} from "./datasets/halai-engine";
export {
  HALAI_AI_MODELS_CATALOG,
  type AiModelEngine,
} from "./datasets/ai-models-catalog";

