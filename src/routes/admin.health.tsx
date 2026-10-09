import { createFileRoute } from "@tanstack/react-router";
import { AdminHealth } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/health")({
  head: () => seo("Admin · System health", "Service status and latency."),
  component: AdminHealth,
});
