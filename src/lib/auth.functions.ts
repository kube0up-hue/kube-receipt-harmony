import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";


const PIN_PEPPER = "kube-supplier-receiving-pepper-v1";

function pinToPassword(pin: string): string {
  return createHash("sha256").update(`${PIN_PEPPER}:${pin}`).digest("hex");
}

function empEmail(employeeId: string) {
  return `emp-${employeeId}@kube.internal`;
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

    const { data: emp, error: empErr } = await supabaseAdmin
      .from("employees")
      .select("id, full_name, is_active, user_id")
      .eq("pin_code", data.pin)
      .maybeSingle();

    if (empErr) throw new Error(empErr.message);
    if (!emp) throw new Error("رقم PIN غير صحيح");
    if (!emp.is_active) throw new Error("هذا الموظف غير مفعّل");

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

/** Admin creates or updates an employee (PIN reset). */
export const upsertEmployee = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      id: z.string().uuid().optional(),
      full_name: z.string().trim().min(2).max(80),
      pin_code: z.string().trim().regex(/^\d{4,8}$/, "PIN يجب أن يكون أرقاماً 4-8 خانات"),
      branch: z.string().trim().max(80).optional().nullable(),
      is_active: z.boolean().default(true),
    }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Ensure PIN is unique (excluding this employee)
    const { data: dup } = await supabaseAdmin
      .from("employees")
      .select("id")
      .eq("pin_code", data.pin_code)
      .maybeSingle();
    if (dup && dup.id !== data.id) throw new Error("رقم PIN مستخدم لموظف آخر");

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
        is_active: data.is_active,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });
