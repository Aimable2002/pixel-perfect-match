import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/")({
  head: () => seo("Admin dashboard", "Platform overview for ScalarLab operators."),
  component: AdminDashboard,
});
