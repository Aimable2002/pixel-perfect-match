import { createFileRoute } from "@tanstack/react-router";
import { AdminUsage } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/usage")({
  head: () => seo("Admin · Usage", "Platform-wide compute and storage usage."),
  component: AdminUsage,
});
