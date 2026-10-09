import { createFileRoute } from "@tanstack/react-router";
import { AdminCompute } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/compute")({
  head: () => seo("Admin · Compute", "GPU pool capacity and queues."),
  component: AdminCompute,
});
