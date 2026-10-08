import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, Panel } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/validation")({
  validateSearch: z.object({ family: z.string().optional() }),
  head: () => seo("Validation", "Validation in ScalarLab."),
  component: () => (
    <>
      <PageHeader title="Validation" />
      <Panel><p className="text-sm text-muted-foreground">This section is coming next.</p></Panel>
    </>
  ),
});
