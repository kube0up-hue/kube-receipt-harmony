import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "ops-photos";
const SIGN_TTL = 60 * 30;

/** يرفع صور الإثبات ويعيد مساراتها. */
export async function uploadOpsPhotos(files: File[], folder: string): Promise<string[]> {
  const paths: string[] = [];
  for (const f of files) {
    const ext = (f.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, f, { contentType: f.type || undefined });
    if (error) throw new Error(error.message);
    paths.push(path);
  }
  return paths;
}

/** روابط مؤقتة لعرض الصور. */
export function useOpsPhotoUrls(paths: string[]) {
  const key = [...paths].sort().join("|");
  return useQuery({
    queryKey: ["ops-photo-urls", key],
    enabled: paths.length > 0,
    staleTime: (SIGN_TTL - 60) * 1000,
    queryFn: async (): Promise<string[]> => {
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrls(paths, SIGN_TTL);
      if (error) throw error;
      return (data ?? []).map((d) => d.signedUrl).filter(Boolean) as string[];
    },
  });
}
