export const WASTE_REASONS: { value: string; label: string }[] = [
  { value: "expired", label: "منتهي الصلاحية" },
  { value: "damaged", label: "تالف" },
  { value: "spillage", label: "انسكاب / سقوط" },
  { value: "prep_error", label: "خطأ في التحضير" },
  { value: "quality", label: "جودة غير مقبولة" },
  { value: "customer_return", label: "مرتجع من العميل" },
  { value: "other", label: "سبب آخر" },
];

export const WASTE_REASON_LABEL: Record<string, string> = Object.fromEntries(
  WASTE_REASONS.map((r) => [r.value, r.label]),
);

export const QUALITY_STATUS: Record<string, { label: string; cls: string }> = {
  ok: { label: "ضمن النطاق", cls: "bg-success/15 text-success border-success/30" },
  // القراءات التاريخية بحالة "warn" تُعرض كخارج النطاق — الحالات الآن حالتان فقط.
  warn: { label: "خارج النطاق", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
  out_of_range: { label: "خارج النطاق", cls: "bg-kube-red/10 text-kube-red border-kube-red/30" },
};

export const SALES_STATUS: Record<string, { label: string; cls: string }> = {
  draft: { label: "مسودة", cls: "bg-muted text-muted-foreground border-border" },
  submitted: { label: "بانتظار المراجعة", cls: "bg-warning/15 text-warning-foreground border-warning/30" },
  approved: { label: "معتمد", cls: "bg-success/15 text-success border-success/30" },
};
