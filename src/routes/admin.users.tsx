import { createFileRoute } from "@tanstack/react-router";
import { AdminUsers } from "@/features/admin";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin/users")({
  head: () => seo("Admin · Users", "Manage ScalarLab user accounts."),
  component: AdminUsers,
});
