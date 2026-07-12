import { createFileRoute } from "@tanstack/react-router";
import { InvoicesList } from "./admin.invoices.index";

export const Route = createFileRoute("/_authenticated/accountant/invoices/")({
  component: () => <InvoicesList base="/accountant" title="واجهة المحاسب" />,
});
