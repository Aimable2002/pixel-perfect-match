import { createFileRoute } from "@tanstack/react-router";
import { AdminLoginPage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/admin-login")({
  head: () => seo("Admin login", "Operator console sign-in for ScalarLab."),
  component: AdminLoginPage,
});
