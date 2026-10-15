import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCurrentUser, signOutAndGo } from "@/lib/use-current-user";
import { BranchSwitcher } from "@/components/branch-switcher";
import { ArrowRight, LogOut, User } from "lucide-react";

export function AppShell({
  title,
  back,
  children,
  variant = "default",
  maxWidth,
}: {
  title: string;
  back?: { to: string; label?: string };
  children: ReactNode;
  variant?: "default" | "studio" | "wide";
  maxWidth?: "default" | "wide" | "narrow" | "full";
}) {
  const { data: cu } = useCurrentUser();
  const navigate = useNavigate();

  const containerWidth =
    variant === "studio"
      ? "max-w-[1600px]"
      : maxWidth === "wide" || variant === "wide"
        ? "max-w-6xl"
        : maxWidth === "full"
          ? "max-w-7xl"
          : maxWidth === "narrow"
            ? "max-w-xl"
            : "max-w-4xl";

  const roleLabel =
    cu?.role === "admin"
      ? "مالك"
      : cu?.role === "accountant"
        ? "محاسب"
        : cu?.role === "employee"
          ? "فرع"
          : "";

  return (
    <div className={variant === "studio" ? "min-h-screen bg-studio-bg text-studio-foreground font-sans-arabic" : "min-h-screen bg-background font-sans-arabic"}>
      <header
        className={
          variant === "studio"
            ? "sticky top-0 z-30 border-b border-studio-border bg-studio-bg/90 backdrop-blur-xl transition-all"
            : "sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-xl transition-all shadow-xs"
        }
      >
        <div className={`${containerWidth} mx-auto px-4 md:px-6 h-16 flex items-center justify-between`}>
          <div className="flex items-center gap-3.5 min-w-0">
            {back ? (
              <Link
                to={back.to}
                className={
                  variant === "studio"
                    ? "inline-flex items-center gap-1.5 rounded-xl border border-studio-border bg-studio-panel-raised px-3 py-1.5 text-xs font-display font-semibold text-studio-foreground hover:bg-studio-foreground hover:text-studio-bg transition-all active:scale-[0.98]"
                    : "inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-card px-3 py-1.5 text-xs font-display font-semibold text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all active:scale-[0.98]"
                }
              >
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                <span>{back.label ?? "رجوع"}</span>
              </Link>
            ) : (
              <Link to="/" className="flex items-center gap-2 shrink-0 group">
                <img
                  src={"/kube-logo.png"}
                  alt="KUBE"
                  className={variant === "studio" ? "h-6 w-auto shrink-0 invert transition-transform group-hover:scale-105" : "h-6 w-auto shrink-0 transition-transform group-hover:scale-105"}
                />
                <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-display font-bold bg-muted text-muted-foreground tracking-wider uppercase">
                  ERP
                </span>
              </Link>
            )}
            <div className="h-4 w-px bg-border/60 mx-1 hidden sm:block" />
            <h1 className="font-display font-bold text-base md:text-lg truncate tracking-tight text-foreground">
              {title}
            </h1>
          </div>

          <div className="flex items-center gap-2.5 text-sm shrink-0">
            <BranchSwitcher variant={variant} />

            {cu?.fullName && (
              <div className="hidden md:flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-2.5 py-1 text-xs">
                <User className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-medium text-foreground truncate max-w-[8rem]">{cu.fullName}</span>
                {roleLabel && (
                  <span className="px-1.5 py-0.2 rounded-md bg-muted text-[10px] font-display font-bold text-muted-foreground">
                    {roleLabel}
                  </span>
                )}
              </div>
            )}

            <button
              onClick={() => signOutAndGo(navigate)}
              className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-card/40 p-2 text-muted-foreground hover:text-destructive hover:border-destructive/30 hover:bg-destructive/10 transition-all active:scale-95 cursor-pointer"
              title="تسجيل الخروج"
              aria-label="خروج"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className={`${variant === "studio" ? "max-w-[1600px] py-6" : `${containerWidth} py-6 md:py-8 pb-24`} mx-auto px-4 md:px-6`}>
        {children}
      </main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; dot: string; cls: string }> = {
    pending_receipt: {
      label: "بانتظار الاستلام",
      dot: "bg-warning",
      cls: "bg-warning/10 text-warning-foreground border-warning/30",
    },
    received: {
      label: "تم الاستلام",
      dot: "bg-success",
      cls: "bg-success/10 text-success border-success/30",
    },
    cancelled: {
      label: "ملغى",
      dot: "bg-muted-foreground",
      cls: "bg-muted text-muted-foreground border-border",
    },
    matched: {
      label: "مطابق تماماً",
      dot: "bg-success",
      cls: "bg-success/10 text-success border-success/30",
    },
    short: {
      label: "ناقص",
      dot: "bg-kube-red",
      cls: "bg-kube-red/10 text-kube-red border-kube-red/30",
    },
    over: {
      label: "زائد",
      dot: "bg-warning",
      cls: "bg-warning/10 text-warning-foreground border-warning/30",
    },
    not_delivered: {
      label: "لم يصل",
      dot: "bg-kube-red",
      cls: "bg-kube-red/10 text-kube-red border-kube-red/30",
    },
    has_damage: {
      label: "يوجد تالف",
      dot: "bg-kube-red",
      cls: "bg-kube-red/10 text-kube-red border-kube-red/30",
    },
    draft: {
      label: "مسودة",
      dot: "bg-muted-foreground",
      cls: "bg-muted text-muted-foreground border-border",
    },
    submitted: {
      label: "مُرسل",
      dot: "bg-success",
      cls: "bg-success/10 text-success border-success/30",
    },
    approved: {
      label: "معتمد",
      dot: "bg-success",
      cls: "bg-success/10 text-success border-success/30",
    },
    returned_for_review: {
      label: "معاد للمراجعة",
      dot: "bg-warning",
      cls: "bg-warning/10 text-warning-foreground border-warning/30",
    },
    no_delivery: {
      label: "لا يوجد استلام",
      dot: "bg-muted-foreground",
      cls: "bg-muted text-muted-foreground border-border",
    },
  };

  const m = map[status] ?? {
    label: status,
    dot: "bg-muted-foreground",
    cls: "bg-muted text-muted-foreground border-border",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-display font-semibold border shadow-xs ${m.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      <span>{m.label}</span>
    </span>
  );
}
