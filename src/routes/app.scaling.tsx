import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, Panel } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/scaling")({
  validateSearch: z.object({ family: z.string().optional() }),
  head: () => seo("Scaling Lab", "Scaling Lab in ScalarLab."),
  component: () => (
    <>
      <PageHeader title="Scaling Lab" />
      <Panel><p className="text-sm text-muted-foreground">This section is coming next.</p></Panel>
    </>
  ),
});
