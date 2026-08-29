import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { PERMISSIONS } from "@/lib/permissions";

export interface ManagedUser {
  userId: string;
  fullName: string | null;
  email: string | null;
  roles: string[];
  permissions: string[];
}

type AuthedSupabase = { from: (table: string) => any };

/** يتحقق أن المتصل مدير (عبر جلسة المستخدم نفسها، لا عبر service role). */
async function assertAdmin(supabase: AuthedSupabase, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("غير مصرح: إدارة الصلاحيات للمدير فقط");
}

/** قائمة المستخدمين مع أدوارهم وصلاحياتهم — للمدير فقط. */
export const listManagedUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ManagedUser[]> => {
    await assertAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [rolesRes, permsRes, profilesRes] = await Promise.all([
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("user_permissions").select("user_id, permission"),
      supabaseAdmin.from("profiles").select("id, full_name, email"),
    ]);
    if (rolesRes.error) throw new Error(rolesRes.error.message);
    if (permsRes.error) throw new Error(permsRes.error.message);
    if (profilesRes.error) throw new Error(profilesRes.error.message);

    const byUser = new Map<string, ManagedUser>();
    const ensure = (id: string) => {
      let u = byUser.get(id);
      if (!u) {
        u = { userId: id, fullName: null, email: null, roles: [], permissions: [] };
        byUser.set(id, u);
      }
      return u;
    };

    for (const r of rolesRes.data ?? []) ensure(r.user_id).roles.push(r.role as string);
    for (const p of permsRes.data ?? []) ensure(p.user_id).permissions.push(p.permission as string);
    for (const p of profilesRes.data ?? []) {
      const u = byUser.get(p.id);
      if (u) {
        u.fullName = p.full_name ?? null;
        u.email = p.email ?? null;
      }
    }

    return [...byUser.values()]
      // موظفو الفروع يعملون بواجهة الجوال المبسّطة، لا تُدار صلاحياتهم هنا
      .filter((u) => !(u.roles.length === 1 && u.roles[0] === "branch_employee"))
      .sort((a, b) => (a.fullName ?? "").localeCompare(b.fullName ?? "", "ar"));
  });

/** حفظ صلاحيات مستخدم بالكامل (استبدال) — للمدير فقط، عملية ذرّية. */
export const saveUserPermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        permissions: z.array(z.enum(PERMISSIONS)).max(PERMISSIONS.length),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: count, error } = await supabaseAdmin.rpc("set_user_permissions", {
      p_actor: context.userId,
      p_user_id: data.userId,
      p_permissions: [...new Set(data.permissions)],
    });
    if (error) throw new Error(error.message);
    return { ok: true, count: count ?? 0 };
  });
