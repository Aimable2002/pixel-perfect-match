import { createFileRoute } from "@tanstack/react-router";
import { AdminDatasets } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/datasets")({
  head: () => seo("Admin · Datasets", "Datasets stored on the platform."),
  component: AdminDatasets,
});
