import { supabase } from "@/integrations/supabase/client";

/** يجب أن تطابق النوع app_role في قاعدة البيانات. */
export type AppRole =
  | "admin"
  | "owner"
  | "operations"
  | "branch_manager"
  | "accountant"
  | "branch_employee"
  | "marketing";

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: "مدير النظام",
  owner: "المالك",
  operations: "مدير التشغيل",
  branch_manager: "مدير فرع",
  accountant: "محاسب",
  branch_employee: "موظف فرع",
  marketing: "فريق التسويق",
};

/** الأدوار التي تملك لوحة الإدارة كاملة. */
export const ADMIN_ROLES: AppRole[] = ["admin", "owner"];

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

export function isAdminRole(roles: AppRole[]): boolean {
  return roles.some((r) => ADMIN_ROLES.includes(r));
}

/** الصفحة الرئيسية لكل دور — تغطي كل أدوار قاعدة البيانات. */
export function primaryRoleHome(roles?: AppRole[] | null): string {
  const r = Array.isArray(roles) ? roles : [];
  if (r.includes("admin") || r.includes("owner")) return "/admin";
  if (r.includes("operations") || r.includes("branch_manager")) return "/employee";
  if (r.includes("accountant")) return "/accountant";
  if (r.includes("marketing")) return "/admin/marketing";
  if (r.includes("branch_employee")) return "/employee";
  return "/auth";
}
