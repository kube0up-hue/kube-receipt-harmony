import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { DuesReport } from "@/features/dues-report";
import { PermissionGuard } from "@/components/permission-guard";

export const Route = createFileRoute("/_authenticated/accountant/dues")({
  component: () => (
    <PermissionGuard anyOf={["reports_dues"]}>
      <AppShell title="المبالغ المستحقة للسداد" back={{ to: "/accountant" }}>
        <DuesReport />
      </AppShell>
    </PermissionGuard>
  ),
});
