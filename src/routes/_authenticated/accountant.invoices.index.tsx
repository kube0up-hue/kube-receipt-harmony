import { createFileRoute } from "@tanstack/react-router";
import { InvoicesList } from "./admin.invoices.index";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/accountant/invoices/")({
  component: () => (
    <PermissionGuard anyOf={["invoices_view"]}>
      <InvoicesList base="/accountant" title="واجهة المحاسب" />
    </PermissionGuard>
  ),
});
