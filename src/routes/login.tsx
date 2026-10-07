import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () => seo("Log in", "Sign in to your ScalarLab research workspace."),
  component: LoginPage,
});
