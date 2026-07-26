import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DuesReport } from "@/features/dues-report";

export const Route = createFileRoute("/_authenticated/admin/dues")({
  component: () => (
    <AppShell title="المبالغ المستحقة للسداد" back={{ to: "/admin" }}>
      <DuesReport />
    </AppShell>
  ),
});
