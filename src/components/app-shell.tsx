import { Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useCurrentUser, signOutAndGo } from "@/lib/use-current-user";
import { LogOut } from "lucide-react";

export function AppShell({
  title,
  back,
  children,
}: {
  title: string;
  back?: { to: string; label?: string };
  children: ReactNode;
}) {
  const { data: cu } = useCurrentUser();
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {back ? (
              <Link to={back.to} className="text-sm text-muted-foreground font-semibold shrink-0">
                ← {back.label ?? "رجوع"}
              </Link>
            ) : (
              <img src={kubeLogo.url} alt="KUBE" className="h-6 w-auto shrink-0" />
            )}
            <h1 className="font-bold truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm">
            {cu?.fullName && <span className="text-muted-foreground hidden sm:inline truncate max-w-[10rem]">{cu.fullName}</span>}
            <button
              onClick={() => signOutAndGo(navigate)}
              className="text-muted-foreground hover:text-foreground p-2 -m-2"
              aria-label="خروج"
            ><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-5 pb-20">{children}</main>
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
