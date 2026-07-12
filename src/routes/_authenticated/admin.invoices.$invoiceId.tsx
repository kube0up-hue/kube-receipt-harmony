import { createFileRoute } from "@tanstack/react-router";
import { InvoiceDetail } from "@/features/invoice-detail";

export const Route = createFileRoute("/_authenticated/admin/invoices/$invoiceId")({
  component: () => {
    const { invoiceId } = Route.useParams();
    return <InvoiceDetail invoiceId={invoiceId} base="/admin" />;
  },
});
