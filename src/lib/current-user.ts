import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "accountant" | "branch_employee";

export interface CurrentUser {
  userId: string;
  email: string | null;
  roles: AppRole[];
  fullName: string | null;
}

export async function fetchCurrentUser(): Promise<CurrentUser | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [rolesRes, profileRes] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);
  return {
    userId: user.id,
    email: user.email ?? null,
    roles: (rolesRes.data ?? []).map((r) => r.role as AppRole),
    fullName: profileRes.data?.full_name ?? (user.user_metadata?.full_name as string ?? null),
  };
}

export function primaryRoleHome(roles: AppRole[]): string {
  if (roles.includes("admin")) return "/admin";
  if (roles.includes("accountant")) return "/accountant";
  if (roles.includes("branch_employee")) return "/employee";
  return "/auth";
}
