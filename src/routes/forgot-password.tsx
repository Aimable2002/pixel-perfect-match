import { createFileRoute } from "@tanstack/react-router";
import { ForgotPage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/forgot-password")({
  head: () => seo("Reset password", "Reset your ScalarLab password."),
  component: ForgotPage,
});
