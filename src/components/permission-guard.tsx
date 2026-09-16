import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { usePermissions } from "@/lib/use-permissions";
import { useCurrentUser } from "@/lib/use-current-user";
import { primaryRoleHome, ADMIN_ROLES, type AppRole } from "@/lib/current-user";
import type { Permission } from "@/lib/permissions";

function Loading() {
  return <div className="kube-card text-center text-muted-foreground">جارٍ التحقق من الصلاحيات...</div>;
}

function Denied({ home }: { home: string }) {
  return (
    <div className="kube-card text-center space-y-3 py-8">
      <ShieldAlert className="w-10 h-10 mx-auto text-kube-red" />
      <div className="font-bold">لا تملك صلاحية هذه الصفحة</div>
      <p className="text-sm text-muted-foreground">
        هذه الصفحة غير مسندة إليك. تواصل مع المالك لإسناد المهمة إن كنت بحاجتها.
      </p>
      <Link to={home} className="kube-btn inline-flex">
        العودة إلى صفحتي
      </Link>
    </div>
  );
}

/**
 * يخفي محتوى الصفحة تماماً عند عدم وجود الصلاحية ويعرض رسالة واضحة.
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
  const { data: cu, isLoading } = useCurrentUser();

  if (loading || isLoading) return <Loading />;
  if (!canAny(anyOf)) return <Denied home={primaryRoleHome(cu?.roles ?? [])} />;
  return <>{children}</>;
}

/** يقصر الصفحة على أدوار محددة (المالك/المدير افتراضياً). */
export function RoleGuard({
  roles = ADMIN_ROLES,
  children,
}: {
  roles?: AppRole[];
  children: ReactNode;
}) {
  const { data: cu, isLoading } = useCurrentUser();
  if (isLoading) return <Loading />;
  const mine = cu?.roles ?? [];
  if (!mine.some((r) => roles.includes(r))) return <Denied home={primaryRoleHome(mine)} />;
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

/** يعرض المحتوى فقط لأدوار محددة. */
export function RoleOnly({
  roles = ADMIN_ROLES,
  children,
}: {
  roles?: AppRole[];
  children: ReactNode;
}) {
  const { data: cu } = useCurrentUser();
  const mine = cu?.roles ?? [];
  if (!mine.some((r) => roles.includes(r))) return null;
  return <>{children}</>;
}
