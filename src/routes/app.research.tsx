import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, Panel } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/research")({
  validateSearch: z.object({ family: z.string().optional() }),
  head: () => seo("Research workspace", "Research workspace in ScalarLab."),
  component: () => (
    <>
      <PageHeader title="Research workspace" />
      <Panel><p className="text-sm text-muted-foreground">This section is coming next.</p></Panel>
    </>
  ),
});
