import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCurrentUser } from "@/lib/use-current-user";
import type { Permission } from "@/lib/permissions";

async function fetchMyPermissions(userId: string): Promise<Permission[]> {
  const { data, error } = await supabase
    .from("user_permissions")
    .select("permission")
    .eq("user_id", userId);
  if (error) throw error;
  return (data ?? []).map((r) => r.permission as Permission);
}

/**
 * اشتراك Realtime واحد مشترك لكل مستخدم مهما تعدد المكوّنات التي تستخدم الصلاحيات،
 * لأن إضافة مستمع لقناة سبق اشتراكها يرفع خطأً في Supabase.
 */
type PermissionListener = () => void;
const permissionSubs = new Map<
  string,
  { channel: ReturnType<typeof supabase.channel>; listeners: Set<PermissionListener> }
>();

function subscribeToPermissionChanges(userId: string, listener: PermissionListener) {
  let entry = permissionSubs.get(userId);
  if (!entry) {
    const listeners = new Set<PermissionListener>();
    const channel = supabase
      .channel(`user-permissions-${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_permissions", filter: `user_id=eq.${userId}` },
        () => {
          for (const l of listeners) l();
        },
      )
      .subscribe();
    entry = { channel, listeners };
    permissionSubs.set(userId, entry);
  }
  entry.listeners.add(listener);
  return () => {
    const current = permissionSubs.get(userId);
    if (!current) return;
    current.listeners.delete(listener);
    if (current.listeners.size === 0) {
      permissionSubs.delete(userId);
      void supabase.removeChannel(current.channel);
    }
  };
}

/**
 * صلاحيات المستخدم الحالي، مع تحديث لحظي عبر Realtime.
 * المدير يملك كل الصلاحيات دائماً.
 */
export function usePermissions() {
  const { data: cu, isLoading: userLoading } = useCurrentUser();
  const qc = useQueryClient();
  const userId = cu?.userId ?? null;
  const isAdmin = (cu?.roles ?? []).includes("admin");

  const { data, isLoading } = useQuery({
    queryKey: ["my-permissions", userId],
    queryFn: async () => (userId ? fetchMyPermissions(userId) : []),
    enabled: !!userId,
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    if (!userId) return;
    const release = subscribeToPermissionChanges(userId, () => {
      qc.invalidateQueries({ queryKey: ["my-permissions", userId] });
    });
    return release;
  }, [userId, qc]);

  const list: Permission[] = data ?? [];
  return {
    isAdmin,
    loading: userLoading || isLoading,
    permissions: list,
    can: (p: Permission) => isAdmin || list.includes(p),
    canAny: (ps: Permission[]) => isAdmin || ps.some((p) => list.includes(p)),
  };
}
