import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { InvoiceMatchForm } from "@/features/invoice-match";

export const Route = createFileRoute("/_authenticated/admin/invoices/new")({
  component: () => (
    <AppShell title="فاتورة مورد جديدة + مطابقة" back={{ to: "/admin/invoices" }}>
      <InvoiceMatchForm basePath="/admin" />
    </AppShell>
  ),
});
