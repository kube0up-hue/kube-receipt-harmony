/** مفاتيح الصلاحيات — يجب أن تطابق النوع app_permission في قاعدة البيانات. */
export const PERMISSIONS = [
  "products_view",
  "products_write",
  "products_delete",
  "products_price_edit",
  "suppliers_view",
  "suppliers_write",
  "suppliers_delete",
  "invoices_view",
  "invoices_create_match",
  "invoices_update",
  "invoices_delete",
  "invoices_approve",
  "payments_view",
  "payments_create",
  "payments_manage",
  "orders_view",
  "receipt_photos_view",
  "reports_dues",
  "reports_export",
  "reports_integrity",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const PERMISSION_LABELS: Record<Permission, string> = {
  products_view: "عرض المنتجات",
  products_write: "إضافة وتعديل المنتجات",
  products_delete: "حذف المنتجات",
  products_price_edit: "تعديل أسعار المنتجات",
  suppliers_view: "عرض الموردين",
  suppliers_write: "إضافة وتعديل الموردين",
  suppliers_delete: "حذف الموردين",
  invoices_view: "عرض الفواتير",
  invoices_create_match: "إنشاء فاتورة ومطابقتها",
  invoices_update: "تعديل الفواتير",
  invoices_delete: "حذف الفواتير",
  invoices_approve: "اعتماد الفاتورة للسداد",
  payments_view: "عرض الدفعات",
  payments_create: "تسجيل دفعة",
  payments_manage: "تعديل وحذف الدفعات",
  orders_view: "عرض الطلبات والاستلامات",
  receipt_photos_view: "عرض صور الاستلام",
  reports_dues: "تقرير المبالغ المستحقة",
  reports_export: "التصدير (Excel / CSV)",
  reports_integrity: "فحص سلامة البيانات",
};

export interface PermissionGroup {
  title: string;
  items: Permission[];
}

export const PERMISSION_GROUPS: PermissionGroup[] = [
  { title: "المنتجات والأسعار", items: ["products_view", "products_write", "products_price_edit", "products_delete"] },
  { title: "الموردون", items: ["suppliers_view", "suppliers_write", "suppliers_delete"] },
  { title: "الفواتير والمطابقة", items: ["invoices_view", "invoices_create_match", "invoices_update", "invoices_approve", "invoices_delete"] },
  { title: "الدفعات", items: ["payments_view", "payments_create", "payments_manage"] },
  { title: "الطلبات والاستلامات", items: ["orders_view", "receipt_photos_view"] },
  { title: "التقارير", items: ["reports_dues", "reports_export", "reports_integrity"] },
];

/** حزمة جاهزة تُقترح للمحاسب. */
export const ACCOUNTANT_PRESET: Permission[] = [
  "products_view",
  "products_write",
  "products_price_edit",
  "suppliers_view",
  "invoices_view",
  "invoices_create_match",
  "invoices_update",
  "payments_view",
  "orders_view",
  "receipt_photos_view",
  "reports_dues",
  "reports_export",
];

export function isPermission(v: string): v is Permission {
  return (PERMISSIONS as readonly string[]).includes(v);
}
