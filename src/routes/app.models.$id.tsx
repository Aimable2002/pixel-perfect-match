import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Panel, KV, RunStatus } from "@/components/lab";
import { ExperimentTable } from "@/components/cards";
import { Bars, C } from "@/components/charts";
import { models } from "@/data/mock";
import { useStore } from "@/lib/store";
import { params } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/models/$id")({
  head: () => seo("Model", "Model architecture, supported tasks, previous runs and performance."),
  component: ModelDetail,
});

function ModelDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const m = models.find((x) => x.id === id);
  const exps = useStore((s) => s.experiments).filter((e) => e.modelId === id);
  if (!m) return <div className="py-20 text-center text-muted-foreground">Model not found. <Link to="/app/models" className="text-primary">Back</Link></div>;
  const perf = exps.filter((e) => e.metrics).slice(0, 12).map((e) => ({ n: params(e.params), accuracy: e.metrics!.accuracy }));
  return (
    <>
      <PageHeader eyebrow={<Link to="/app/models">Models / {m.id}</Link>} title={<span className="flex items-center gap-3">{m.name}<RunStatus status={m.status} /></span>} description={m.description}
        actions={<>
          <Button size="sm" onClick={() => nav({ to: "/app/experiments/new" })}>Use Model</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success(`Variant ${m.name}-${params(m.params * 2)} created`)}>Create Variant</Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Model cloned to your registry")}>Clone</Button>
        </>} />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel title="Specification" className="lg:col-span-1"><KV items={[["Parameters", params(m.params)], ["Context", m.context || "—"], ["Architecture", m.architecture], ["Version", m.version], ["Category", m.category], ["Supported tasks", m.tasks.join(", ")]]} /></Panel>
        <Panel title="Performance by size" className="lg:col-span-2">{perf.length ? <Bars data={perf} xKey="n" bars={[{ key: "accuracy", color: C.primary }]} height={220} /> : <p className="text-sm text-muted-foreground">No completed runs yet.</p>}</Panel>
      </div>
      <h3 className="mb-2 mt-6 text-sm font-medium">Previous runs</h3>
      <ExperimentTable rows={exps} pageSize={6} />
    </>
  );
}
