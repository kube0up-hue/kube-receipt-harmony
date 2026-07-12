import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { InvoiceMatchForm } from "@/features/invoice-match";

export const Route = createFileRoute("/_authenticated/accountant/invoices/new")({
  component: () => (
    <AppShell title="فاتورة مورد جديدة + مطابقة" back={{ to: "/accountant/invoices" }}>
      <InvoiceMatchForm basePath="/accountant" />
    </AppShell>
  ),
});
