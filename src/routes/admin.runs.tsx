import { createFileRoute } from "@tanstack/react-router";
import { AdminRuns } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/runs")({
  head: () => seo("Admin · Runs", "Training runs across the platform."),
  component: AdminRuns,
});
