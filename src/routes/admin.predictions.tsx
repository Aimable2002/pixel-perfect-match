import { createFileRoute } from "@tanstack/react-router";
import { AdminPredictions } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/predictions")({
  head: () => seo("Admin · Predictions", "All scaling predictions."),
  component: AdminPredictions,
});
