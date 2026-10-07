import { createFileRoute } from "@tanstack/react-router";
import { WorkspacePage } from "@/features/auth";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/create-workspace")({
  head: () => seo("Create workspace", "Set up a new ScalarLab research workspace."),
  component: WorkspacePage,
});
