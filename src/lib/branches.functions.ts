import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

type AuthedSupabase = { from: (table: string) => any };

/** يتحقق أن المتصل مالك أو مدير — عبر جلسة المستخدم نفسها. */
async function assertOwnerOrAdmin(supabase: AuthedSupabase, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (error) throw new Error(error.message);
  const roles = (data ?? []).map((r: { role: string }) => r.role);
  if (!roles.includes("admin") && !roles.includes("owner")) {
    throw new Error("غير مصرح: إدارة الفروع للمالك أو المدير فقط");
  }
}

export interface BranchAccessUser {
  userId: string;
  fullName: string | null;
  email: string | null;
  roles: string[];
  branchIds: string[];
}

export interface BranchAccessData {
  branches: Array<{ id: string; name: string; code: string; kind: string }>;
  users: BranchAccessUser[];
}

/** الفروع + وصول كل مستخدم إليها — للمالك أو المدير. */
export const listBranchAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BranchAccessData> => {
    await assertOwnerOrAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [branchesRes, rolesRes, profilesRes, accessRes] = await Promise.all([
      supabaseAdmin.from("branches").select("id, name, code, kind").order("sort_order"),
      supabaseAdmin.from("user_roles").select("user_id, role"),
      supabaseAdmin.from("profiles").select("id, full_name, email"),
      supabaseAdmin.from("user_branches").select("user_id, branch_id"),
    ]);
    for (const r of [branchesRes, rolesRes, profilesRes, accessRes]) {
      if (r.error) throw new Error(r.error.message);
    }

    const byUser = new Map<string, BranchAccessUser>();
    const ensure = (id: string) => {
      let u = byUser.get(id);
      if (!u) {
        u = { userId: id, fullName: null, email: null, roles: [], branchIds: [] };
        byUser.set(id, u);
      }
      return u;
    };
    for (const r of rolesRes.data ?? []) ensure(r.user_id).roles.push(r.role as string);
    for (const a of accessRes.data ?? []) ensure(a.user_id).branchIds.push(a.branch_id as string);
    for (const p of profilesRes.data ?? []) {
      const u = byUser.get(p.id);
      if (u) {
        u.fullName = p.full_name ?? null;
        u.email = p.email ?? null;
      }
    }

    return {
      branches: (branchesRes.data ?? []) as BranchAccessData["branches"],
      users: [...byUser.values()].sort((a, b) =>
        (a.fullName ?? "").localeCompare(b.fullName ?? "", "ar"),
      ),
    };
  });

/** استبدال فروع مستخدم بالكامل — للمالك أو المدير، مع سجل تدقيق. */
export const setUserBranches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        userId: z.string().uuid(),
        branchIds: z.array(z.string().uuid()).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await assertOwnerOrAdmin(context.supabase as unknown as AuthedSupabase, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const next = [...new Set(data.branchIds)];

    const { data: before, error: beforeErr } = await supabaseAdmin
      .from("user_branches")
      .select("branch_id")
      .eq("user_id", data.userId);
    if (beforeErr) throw new Error(beforeErr.message);
    const previous = (before ?? []).map((r) => r.branch_id as string);

    const { error: delErr } = await supabaseAdmin
      .from("user_branches")
      .delete()
      .eq("user_id", data.userId);
    if (delErr) throw new Error(delErr.message);

    if (next.length > 0) {
      const { error: insErr } = await supabaseAdmin.from("user_branches").insert(
        next.map((branch_id) => ({
          user_id: data.userId,
          branch_id,
          granted_by: context.userId,
        })),
      );
      if (insErr) throw new Error(insErr.message);
    }

    await supabaseAdmin.from("activity_log").insert({
      actor_user: context.userId,
      action: "update_branch_access",
      entity: "user_branches",
      entity_id: data.userId,
      old_value: { branch_ids: previous },
      new_value: { branch_ids: next },
      details: { actor: context.userId },
    });

    return { ok: true, count: next.length };
  });
