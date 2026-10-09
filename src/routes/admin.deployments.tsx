import { createFileRoute } from "@tanstack/react-router";
import { AdminDeployments } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/deployments")({
  head: () => seo("Admin · Deployments", "Serving endpoints across environments."),
  component: AdminDeployments,
});
