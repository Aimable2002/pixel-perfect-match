import { createFileRoute } from "@tanstack/react-router";
import { AdminBilling } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/billing")({
  head: () => seo("Admin · Billing", "Revenue, plans and invoices."),
  component: AdminBilling,
});
