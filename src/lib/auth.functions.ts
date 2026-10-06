import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


const PIN_PEPPER = "kube-supplier-receiving-pepper-v1";

function pinToPassword(pin: string): string {
  return createHash("sha256").update(`${PIN_PEPPER}:${pin}`).digest("hex");
}

function empEmail(employeeId: string) {
  return `emp-${employeeId}@kube.internal`;
}

// حماية دخول PIN من التخمين — المحاولات تُسجَّل في pin_login_attempts.
// إذا لم يكن الجدول موجوداً بعد، يستمر الدخول بدون حد (لا نكسر دخول الموظفين).
const PIN_WINDOW_MINUTES = 15;
const PIN_MAX_FAILS_PER_IP = 5;
const PIN_MAX_FAILS_GLOBAL = 50;

function requestIp(): string {
  try {
    const h = getRequest().headers;
    return (
      h.get("cf-connecting-ip") ||
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      h.get("x-real-ip") ||
      "unknown"
    );
  } catch {
    return "unknown";
  }
}

/**
 * signInWithPin
 * Server verifies PIN, ensures the auth user exists with a password derived
 * from PIN, then signs in with that password and returns tokens for the client
 * to hydrate the Supabase session.
 */
export const signInWithPin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({ pin: z.string().trim().min(3).max(12) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { createClient } = await import("@supabase/supabase-js");

    const ip = requestIp();
    const since = new Date(Date.now() - PIN_WINDOW_MINUTES * 60_000).toISOString();
    const [ipFails, allFails] = await Promise.all([
      supabaseAdmin
        .from("pin_login_attempts")
        .select("id", { count: "exact", head: true })
        .eq("ip", ip)
        .eq("success", false)
        .gte("created_at", since),
      supabaseAdmin
        .from("pin_login_attempts")
        .select("id", { count: "exact", head: true })
        .eq("success", false)
        .gte("created_at", since),
    ]);
    const logAttempt = async (success: boolean, reason: string) => {
      await supabaseAdmin.from("pin_login_attempts").insert({ ip, success, reason });
    };
    if (
      (!ipFails.error && (ipFails.count ?? 0) >= PIN_MAX_FAILS_PER_IP) ||
      (!allFails.error && (allFails.count ?? 0) >= PIN_MAX_FAILS_GLOBAL)
    ) {
      await logAttempt(false, "locked");
      throw new Error("محاولات كثيرة، حاول بعد 15 دقيقة");
    }

    const { data: emp, error: empErr } = await supabaseAdmin
      .from("employees")
      .select("id, full_name, is_active, user_id")
      .eq("pin_code", data.pin)
      .maybeSingle();

    if (empErr) throw new Error(empErr.message);
    if (!emp) {
      await logAttempt(false, "wrong_pin");
      throw new Error("رقم PIN غير صحيح");
    }
    if (!emp.is_active) {
      await logAttempt(false, "inactive");
      throw new Error("هذا الموظف غير مفعّل");
    }

    const email = empEmail(emp.id);
    const password = pinToPassword(data.pin);

    let userId = emp.user_id as string | null;

    if (!userId) {
      // Create user
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: emp.full_name, kind: "branch_employee" },
      });
      if (createErr || !created?.user) throw new Error(createErr?.message ?? "فشل إنشاء المستخدم");
      userId = created.user.id;

      await supabaseAdmin.from("employees").update({ user_id: userId }).eq("id", emp.id);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: "branch_employee" });
      await supabaseAdmin.from("profiles").upsert({ id: userId, full_name: emp.full_name });
    } else {
      // Ensure password matches derived password (idempotent)
      await supabaseAdmin.auth.admin.updateUserById(userId, { password });
    }

    // Now sign in with a fresh client (no session persistence server-side)
    const authClient = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, storage: undefined } },
    );
    const { data: signInData, error: signInErr } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    if (signInErr || !signInData.session) throw new Error(signInErr?.message ?? "فشل تسجيل الدخول");
    await logAttempt(true, "ok");

    return {
      access_token: signInData.session.access_token,
      refresh_token: signInData.session.refresh_token,
      employee: { id: emp.id, full_name: emp.full_name },
    };
  });

/**
 * bootstrapAdmin — creates the first admin user if none exists.
 * Public because the app has no admin at first launch.
 */
export const bootstrapAdmin = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      email: z.string().trim().email(),
      password: z.string().min(8).max(72),
      full_name: z.string().trim().min(2).max(80),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // If any admin exists, block.
    const { count, error: countErr } = await supabaseAdmin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");
    if (countErr) throw new Error(countErr.message);
    if ((count ?? 0) > 0) throw new Error("تم إنشاء المدير مسبقًا. سجل الدخول عبر البريد.");

    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { full_name: data.full_name, kind: "admin" },
    });
    if (createErr || !created?.user) throw new Error(createErr?.message ?? "فشل إنشاء المدير");

    await supabaseAdmin.from("user_roles").insert({ user_id: created.user.id, role: "admin" });
    await supabaseAdmin.from("profiles").upsert({ id: created.user.id, full_name: data.full_name, email: data.email });

    return { ok: true };
  });

/** Whether any admin exists — used to show setup screen. */
export const adminExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { count, error } = await supabaseAdmin
    .from("user_roles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");
  if (error) throw new Error(error.message);
  return { exists: (count ?? 0) > 0 };
});

/** Admin creates or updates an employee (PIN reset). Admin-only. */
export const upsertEmployee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid().optional(),
      full_name: z.string().trim().min(2).max(80),
      pin_code: z.string().trim().regex(/^\d{4,8}$/, "PIN يجب أن يكون أرقاماً 4-8 خانات"),
      branch: z.string().trim().max(80).optional().nullable(),
      branch_id: z.string().uuid().optional().nullable(),
      is_active: z.boolean().default(true),
    }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Verify caller is admin (server-side, mirrors RLS on employees table)
    const { data: adminRow, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!adminRow) throw new Error("غير مصرح: هذه العملية للمدير فقط");


    // Ensure PIN is unique (excluding this employee)
    const { data: dup } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("pin_code", data.pin_code)
      .maybeSingle();
    if (dup && dup.id !== data.id) throw new Error("رقم PIN مستخدم لموظف آخر");

    // الفرع إلزامي — يُستكمل من فرع نخلة عند عدم التحديد
    let branchId = data.branch_id ?? null;
    if (!branchId) {
      const { data: def } = await supabaseAdmin
        .from("branches").select("id").eq("code", "nakhla").maybeSingle();
      branchId = def?.id ?? null;
    }
    if (!branchId) throw new Error("لا يوجد فرع افتراضي — أضف الفروع أولاً");

    if (data.id) {
      // If PIN changed and user_id exists, update password
      const { data: existing } = await supabaseAdmin
        .from("employees")
        .select("user_id, pin_code")
        .eq("id", data.id)
        .maybeSingle();
      const { error } = await supabaseAdmin
        .from("employees")
        .update({
          full_name: data.full_name,
          pin_code: data.pin_code,
          branch: data.branch ?? null,
          branch_id: branchId,
          is_active: data.is_active,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
      if (existing?.user_id && existing.pin_code !== data.pin_code) {
        await supabaseAdmin.auth.admin.updateUserById(existing.user_id, {
          password: pinToPassword(data.pin_code),
        });
      }
      return { ok: true, id: data.id };
    }
    const { data: inserted, error } = await supabaseAdmin
      .from("employees")
      .insert({
        full_name: data.full_name,
        pin_code: data.pin_code,
        branch: data.branch ?? null,
        branch_id: branchId,
        is_active: data.is_active,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

/**
 * listEmployeesAdmin — admin-only listing that includes pin_code.
 * The pin_code column is not readable through the Data API by any signed-in
 * user (not even the employee themselves), so admins read it here after a
 * server-side role check.
 */
export const listEmployeesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: adminRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!adminRow) throw new Error("غير مصرح: هذه العملية للمدير فقط");

    const { data, error } = await supabaseAdmin
      .from("employees")
      .select(
        "id, full_name, pin_code, branch, is_active, branch_id, phone, job_title, hire_date, note, branches(name)",
      )
      .order("full_name");
    if (error) throw new Error(error.message);
    return data ?? [];
  });

/** Admin edits an employee profile (phone, job title, hire date, PIN, note). */
export const updateEmployeeProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid(),
        phone: z.string().trim().max(30).optional().nullable(),
        job_title: z.string().trim().max(80).optional().nullable(),
        hire_date: z.string().trim().optional().nullable(),
        pin_code: z.string().trim().regex(/^\d{4,8}$/, "PIN يجب أن يكون أرقاماً 4-8 خانات"),
        note: z.string().trim().max(500).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: adminRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!adminRow) throw new Error("غير مصرح: هذه العملية للمدير فقط");

    const { data: dup } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("pin_code", data.pin_code)
      .neq("id", data.id)
      .maybeSingle();
    if (dup) throw new Error("رقم PIN مستخدم لموظف آخر");

    const { data: existing } = await supabaseAdmin
      .from("employees")
      .select("user_id, pin_code")
      .eq("id", data.id)
      .maybeSingle();

    const { error } = await supabaseAdmin
      .from("employees")
      .update({
        phone: data.phone || null,
        job_title: data.job_title || null,
        hire_date: data.hire_date || null,
        pin_code: data.pin_code,
        note: data.note || null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);

    if (existing?.user_id && existing.pin_code !== data.pin_code) {
      await supabaseAdmin.auth.admin.updateUserById(existing.user_id, {
        password: pinToPassword(data.pin_code),
      });
    }
    return { ok: true };
  });

/** Admin activates/deactivates an employee. */
export const setEmployeeActive = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), is_active: z.boolean() }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: adminRow, error: roleErr } = await context.supabase
      .from("user_roles")
      .select("id")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();
    if (roleErr) throw new Error(roleErr.message);
    if (!adminRow) throw new Error("غير مصرح: هذه العملية للمدير فقط");

    const { error } = await supabaseAdmin
      .from("employees")
      .update({ is_active: data.is_active })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
