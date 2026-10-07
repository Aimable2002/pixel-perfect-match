import { createFileRoute } from "@tanstack/react-router";
import { VerifyPage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/verify-email")({
  head: () => seo("Verify email", "Verify your email to activate ScalarLab."),
  component: VerifyPage,
});
