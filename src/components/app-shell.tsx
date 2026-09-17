import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCurrentUser, signOutAndGo } from "@/lib/use-current-user";
import { BranchSwitcher } from "@/components/branch-switcher";
import { LogOut } from "lucide-react";

export function AppShell({
  title,
  back,
  children,
  variant = "default",
}: {
  title: string;
  back?: { to: string; label?: string };
  children: ReactNode;
  variant?: "default" | "studio";
}) {
  const { data: cu } = useCurrentUser();
  const navigate = useNavigate();
  return (
    <div className={variant === "studio" ? "min-h-screen bg-studio-bg text-studio-foreground" : "min-h-screen bg-background"}>
      <header className={variant === "studio" ? "sticky top-0 z-30 border-b border-studio-border bg-studio-bg/95 backdrop-blur" : "sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border"}>
        <div className={`${variant === "studio" ? "max-w-[1600px]" : "max-w-3xl"} mx-auto px-4 h-14 flex items-center justify-between`}>
          <div className="flex items-center gap-3 min-w-0">
            {back ? (
              <Link to={back.to} className={variant === "studio" ? "rounded-md border border-studio-border bg-studio-panel-raised px-2.5 py-1.5 text-xs font-semibold text-studio-foreground hover:bg-studio-foreground hover:text-studio-bg" : "text-sm text-muted-foreground font-semibold shrink-0"}>
                ← {back.label ?? "رجوع"}
              </Link>
            ) : (
              <img src={"/kube-logo.png"} alt="KUBE" className={variant === "studio" ? "h-6 w-auto shrink-0 invert" : "h-6 w-auto shrink-0"} />
            )}
            <h1 className="font-bold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 text-sm shrink-0">
            <BranchSwitcher variant={variant} />
            {cu?.fullName && <span className="text-muted-foreground hidden md:inline truncate max-w-[8rem]">{cu.fullName}</span>}
            <button
              onClick={() => signOutAndGo(navigate)}
              className="text-muted-foreground hover:text-foreground p-2 -m-2"
              aria-label="خروج"
            ><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      <main className={`${variant === "studio" ? "max-w-[1600px] py-4 lg:py-6" : "max-w-3xl py-5 pb-20"} mx-auto px-4`}>{children}</main>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    pending_receipt: { label: "بانتظار الاستلام", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    received: { label: "تم الاستلام", cls: "bg-success/15 text-success border-success/30" },
    cancelled: { label: "ملغى", cls: "bg-muted text-muted-foreground border-border" },
    matched: { label: "مطابق", cls: "bg-success/15 text-success border-success/30" },
    short: { label: "ناقص", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
    over: { label: "زائد", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    not_delivered: { label: "لم يصل", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
    has_damage: { label: "يوجد تالف", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
    draft: { label: "مسودة", cls: "bg-muted text-muted-foreground border-border" },
    submitted: { label: "مُرسل", cls: "bg-success/15 text-success border-success/30" },
    approved: { label: "معتمد", cls: "bg-success/15 text-success border-success/30" },
    returned_for_review: { label: "معاد للمراجعة", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
    no_delivery: { label: "لا يوجد استلام", cls: "bg-muted text-muted-foreground border-border" },
  };
  const m = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${m.cls}`}>{m.label}</span>;
}
