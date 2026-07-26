import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DuesReport } from "@/features/dues-report";

export const Route = createFileRoute("/_authenticated/accountant/dues")({
  component: () => (
    <AppShell title="المبالغ المستحقة للسداد" back={{ to: "/accountant" }}>
      <DuesReport />
    </AppShell>
  ),
});
