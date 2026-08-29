import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { usePermissions } from "@/lib/use-permissions";
import { useCurrentUser } from "@/lib/use-current-user";
import { primaryRoleHome } from "@/lib/current-user";
import type { Permission } from "@/lib/permissions";

/**
 * يخفي محتوى الصفحة تماماً عند عدم وجود الصلاحية، ويعيد المستخدم لصفحته الرئيسية.
 * أي من الصلاحيات المذكورة يكفي.
 */
export function PermissionGuard({
  anyOf,
  children,
}: {
  anyOf: Permission[];
  children: ReactNode;
}) {
  const { canAny, loading } = usePermissions();
  const { data: cu } = useCurrentUser();
  const navigate = useNavigate();
  const allowed = canAny(anyOf);

  useEffect(() => {
    if (loading || allowed) return;
    navigate({ to: primaryRoleHome(cu?.roles ?? []), replace: true });
  }, [loading, allowed, cu, navigate]);

  if (loading) return <div className="kube-card text-center text-muted-foreground">جارٍ التحقق من الصلاحيات...</div>;
  if (!allowed) return null;
  return <>{children}</>;
}

/** يعرض المحتوى فقط عند توفر الصلاحية (للأزرار والأقسام). */
export function Can({
  anyOf,
  children,
}: {
  anyOf: Permission[];
  children: ReactNode;
}) {
  const { canAny } = usePermissions();
  if (!canAny(anyOf)) return null;
  return <>{children}</>;
}
