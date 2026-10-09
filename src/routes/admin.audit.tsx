import { createFileRoute } from "@tanstack/react-router";
import { AdminAudit } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/audit")({
  head: () => seo("Admin · Audit logs", "Security and activity audit trail."),
  component: AdminAudit,
});
