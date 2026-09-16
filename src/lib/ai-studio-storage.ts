import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { REFERENCE_BUCKET, GENERATED_BUCKET } from "@/lib/ai-studio.functions";

const SIGN_TTL = 60 * 60;
export const ALLOWED_REFERENCE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_REFERENCE_BYTES = 15 * 1024 * 1024;

/** يرفع صورة مرجعية إلى المخزن الخاص ويعيد مسارها. */
export async function uploadReferenceImage(file: File): Promise<string> {
  if (!ALLOWED_REFERENCE_TYPES.includes(file.type)) {
    throw new Error("نوع الملف غير مدعوم — استخدم JPG أو PNG أو WebP");
  }
  if (file.size > MAX_REFERENCE_BYTES) {
    throw new Error("حجم الصورة أكبر من 15 ميجابايت");
  }
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `refs/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(REFERENCE_BUCKET).upload(path, file, { contentType: file.type });
  if (error) throw new Error(error.message);
  return path;
}

async function signOne(bucket: string, path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, SIGN_TTL);
  if (error) throw new Error(error.message);
  return data.signedUrl;
}

/** رابط مؤقت لصورة ناتجة. */
export function useGeneratedImageUrl(path: string | null | undefined) {
  return useQuery({
    queryKey: ["ai-studio-generated-url", path],
    enabled: !!path,
    staleTime: (SIGN_TTL - 120) * 1000,
    queryFn: () => signOne(GENERATED_BUCKET, path!),
  });
}

/** روابط مؤقتة لعدة صور ناتجة (لسجل التوليد). */
export function useGeneratedImageUrls(paths: string[]) {
  const key = [...paths].sort().join("|");
  return useQuery({
    queryKey: ["ai-studio-generated-urls", key],
    enabled: paths.length > 0,
    staleTime: (SIGN_TTL - 120) * 1000,
    queryFn: async (): Promise<Record<string, string>> => {
      const { data, error } = await supabase.storage.from(GENERATED_BUCKET).createSignedUrls(paths, SIGN_TTL);
      if (error) throw new Error(error.message);
      const map: Record<string, string> = {};
      (data ?? []).forEach((d, i) => {
        const p = paths[i];
        if (p && d.signedUrl) map[p] = d.signedUrl;
      });
      return map;
    },
  });
}

/** ينزّل صورة ناتجة إلى جهاز المستخدم. */
export async function downloadGeneratedImage(path: string, fileName?: string) {
  const { data, error } = await supabase.storage.from(GENERATED_BUCKET).download(path);
  if (error || !data) throw new Error(error?.message ?? "تعذر تنزيل الصورة");
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName ?? path.split("/").pop() ?? "kubeup-image.png";
  a.click();
  URL.revokeObjectURL(url);
}
