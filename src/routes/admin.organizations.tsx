import { createFileRoute } from "@tanstack/react-router";
import { AdminOrganizations } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/organizations")({
  head: () => seo("Admin · Organizations", "Organizations and plans on ScalarLab."),
  component: AdminOrganizations,
});
