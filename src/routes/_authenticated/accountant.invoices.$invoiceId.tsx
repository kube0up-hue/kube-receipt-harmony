import { createFileRoute } from "@tanstack/react-router";
import { InvoiceDetail } from "@/features/invoice-detail";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/accountant/invoices/$invoiceId")({
  component: () => {
    const { invoiceId } = Route.useParams();
    return (
      <PermissionGuard anyOf={["invoices_view"]}>
        <InvoiceDetail invoiceId={invoiceId} base="/accountant" />
      </PermissionGuard>
    );
  },
});
