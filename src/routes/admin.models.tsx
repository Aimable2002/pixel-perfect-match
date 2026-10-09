import { createFileRoute } from "@tanstack/react-router";
import { AdminModels } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/models")({
  head: () => seo("Admin · Models", "Model catalog administration."),
  component: AdminModels,
});
