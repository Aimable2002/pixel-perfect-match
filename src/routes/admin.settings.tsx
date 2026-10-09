import { createFileRoute } from "@tanstack/react-router";
import { AdminSettings } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/settings")({
  head: () => seo("Admin · Settings", "Platform feature flags and limits."),
  component: AdminSettings,
});
