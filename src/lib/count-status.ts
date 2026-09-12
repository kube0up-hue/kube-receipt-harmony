/** تسميات وحالات الجرد — مشتركة بين قائمة الجرد وورقة الجرد. */
export const COUNT_KIND_LABEL: Record<string, string> = {
  cycle_1: "جرد الأول من الشهر",
  cycle_15: "جرد الخامس عشر",
  extra: "جرد إضافي",
};

export const COUNT_STATUS: Record<string, { label: string; cls: string }> = {
  open: { label: "مفتوح", cls: "bg-muted text-muted-foreground border-border" },
  in_progress: { label: "قيد الجرد", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  submitted: { label: "تم الإرسال", cls: "bg-primary/10 text-primary border-primary/30" },
  reviewed: { label: "تمت المراجعة", cls: "bg-primary/10 text-primary border-primary/30" },
  approved: { label: "معتمد", cls: "bg-success/15 text-success border-success/30" },
  cancelled: { label: "ملغى", cls: "bg-muted text-muted-foreground border-border" },
};
