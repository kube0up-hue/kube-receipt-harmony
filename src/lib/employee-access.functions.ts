import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { EMPLOYEE_ASSIGNABLE } from "@/lib/permissions";

const PIN_PEPPER = "kube-supplier-receiving-pepper-v1";
const pinToPassword = (pin: string) => createHash("sha256").update(`${PIN_PEPPER}:${pin}`).digest("hex");

type AuthedSupabase = { from: (table: string) => any };

async function assertAdmin(supabase: AuthedSupabase, userId: string) {
  const { data, error } = await supabase
    .from("user_roles").select("id").eq("user_id", userId).eq("role", "admin").maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("غير مصرح: إسناد الصلاحيات للمدير فقط");
}

export interface EmployeeAccessRow {
  employeeId: string;
  fullName: string;
  branchName: string | null;
  isActive: boolean;
  hasAccount: boolean;
  permissions: string[];
}

/** الموظفون مع الصلاحيات المسندة لكل منهم — للمدير فقط. */
export const listEmployeeAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<EmployeeAccessRow[]> => {
    await assertAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: emps, error } = await supabaseAdmin
      .from("employees")
      .select("id, full_name, is_active, user_id, branches(name)")
      .order("full_name");
    if (error) throw new Error(error.message);

    const userIds = (emps ?? []).map((e: any) => e.user_id).filter(Boolean) as string[];
    let permsByUser = new Map<string, string[]>();
    if (userIds.length > 0) {
      const { data: perms, error: pErr } = await supabaseAdmin
        .from("user_permissions").select("user_id, permission").in("user_id", userIds);
      if (pErr) throw new Error(pErr.message);
      for (const p of perms ?? []) {
        const list = permsByUser.get(p.user_id) ?? [];
        list.push(p.permission as string);
        permsByUser.set(p.user_id, list);
      }
    }

    return (emps ?? []).map((e: any) => ({
      employeeId: e.id,
      fullName: e.full_name,
      branchName: e.branches?.name ?? null,
      isActive: e.is_active,
      hasAccount: !!e.user_id,
      permissions: e.user_id ? permsByUser.get(e.user_id) ?? [] : [],
    }));
  });

/** إسناد صلاحيات موظف (استبدال كامل) — ينشئ حساب الموظف إن لم يكن موجوداً. */
export const saveEmployeePermissions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      employeeId: z.string().uuid(),
      permissions: z.array(z.enum(EMPLOYEE_ASSIGNABLE)).max(EMPLOYEE_ASSIGNABLE.length),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: emp, error } = await supabaseAdmin
      .from("employees").select("id, full_name, pin_code, user_id").eq("id", data.employeeId).maybeSingle();
    if (error) throw new Error(error.message);
    if (!emp) throw new Error("الموظف غير موجود");

    let userId = emp.user_id as string | null;
    if (!userId) {
      const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
        email: `emp-${emp.id}@kube.internal`,
        password: pinToPassword(emp.pin_code as string),
        email_confirm: true,
        user_metadata: { full_name: emp.full_name, kind: "branch_employee" },
      });
      if (cErr || !created?.user) throw new Error(cErr?.message ?? "فشل إنشاء حساب الموظف");
      userId = created.user.id;
      await supabaseAdmin.from("employees").update({ user_id: userId }).eq("id", emp.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "branch_employee" });
      await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: emp.full_name });
    }

    const { error: rpcErr } = await supabaseAdmin.rpc("set_user_permissions", {
      p_actor: context.userId,
      p_user_id: userId,
      p_permissions: [...new Set(data.permissions)],
    });
    if (rpcErr) throw new Error(rpcErr.message);
    return { ok: true };
  });
