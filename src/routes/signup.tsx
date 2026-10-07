import { createFileRoute } from "@tanstack/react-router";
import { SignupPage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () => seo("Sign up", "Create a ScalarLab account and start experimenting."),
  component: SignupPage,
});
