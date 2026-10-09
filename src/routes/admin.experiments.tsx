import { createFileRoute } from "@tanstack/react-router";
import { AdminExperiments } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/experiments")({
  head: () => seo("Admin · Experiments", "All experiments across workspaces."),
  component: AdminExperiments,
});
