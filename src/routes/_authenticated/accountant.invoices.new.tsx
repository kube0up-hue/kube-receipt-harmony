import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { InvoiceMatchForm } from "@/features/invoice-match";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/accountant/invoices/new")({
  component: () => (
    <PermissionGuard anyOf={["invoices_create_match"]}>
      <AppShell title="فاتورة مورد جديدة + مطابقة" back={{ to: "/accountant/invoices" }}>
        <InvoiceMatchForm basePath="/accountant" />
      </AppShell>
    </PermissionGuard>
  ),
});
