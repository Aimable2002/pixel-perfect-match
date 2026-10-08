import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Panel, RunStatus, MetricCard, Mono, Progress } from "@/components/lab";
import { MetricChart, C } from "@/components/charts";
import { useStore } from "@/lib/store";
import { rng } from "@/data/mock";
import { datetime, duration, usd } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/runs/$id")({
  head: () => seo("Run detail", "Training progress, loss curves, GPU utilization, logs and checkpoints."),
  component: RunDetail,
});

function RunDetail() {
  const { id } = Route.useParams();
  const run = useStore((s) => s.runs.find((r) => r.id === id));
  const exp = useStore((s) => s.experiments.find((e) => e.id === run?.experimentId));
  if (!run) return <div className="py-20 text-center text-muted-foreground">Run not found. <Link to="/app/runs" className="text-primary">Back</Link></div>;
  const g = rng(id.length * 97 + run.compute);
  const steps = Math.max(2, Math.round((run.progress / 100) * 60));
  const curve = Array.from({ length: steps }, (_, i) => ({ i: i * 50, loss: +(0.693 * Math.exp(-i / 40) + 0.62 + g() * 0.01).toFixed(4), val_loss: +(0.693 * Math.exp(-i / 45) + 0.635 + g() * 0.015).toFixed(4), val_acc: +(50 + (run.metric ?? 56 - 50) * (1 - Math.exp(-i / 18)) * 0.13 + (run.metric ? (run.metric - 50) * (1 - Math.exp(-i / 18)) * 0.87 : 0) + g() * 0.4).toFixed(2) }));
  const util = Array.from({ length: 60 }, (_, i) => ({ i, gpu: Math.round(78 + g() * 18), mem: Math.round(62 + i * 0.2 + g() * 4) }));
  return (
    <>
      <PageHeader eyebrow={<Link to="/app/runs">Runs / {run.id}</Link>} title={<span className="flex items-center gap-3"><Mono>{run.id}</Mono><RunStatus status={run.status} /></span>}
        description={exp && <Link to="/app/experiments/$id" params={{ id: exp.id }} className="hover:text-primary">{exp.name}</Link>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="Progress" value={`${run.progress}%`} sub={<Progress value={run.progress} />} />
        <MetricCard label="Duration" value={duration(run.durationMin)} />
        <MetricCard label="GPU" value={run.gpu} />
        <MetricCard label="Compute" value={usd(run.compute)} />
        <MetricCard label="Metric" value={run.metric ? `${run.metric}%` : "—"} tone="primary" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Loss curve"><MetricChart data={curve} lines={[{ key: "loss", color: C.primary, name: "train" }, { key: "val_loss", color: C.predict, name: "validation" }]} height={220} /></Panel>
        <Panel title="Validation accuracy"><MetricChart data={curve} lines={[{ key: "val_acc", color: C.info }]} height={220} unit="%" /></Panel>
        <Panel title="GPU utilization"><MetricChart data={util} lines={[{ key: "gpu", color: C.success }]} area height={180} unit="%" yDomain={[0, 100]} /></Panel>
        <Panel title="Memory usage"><MetricChart data={util} lines={[{ key: "mem", color: C.c4 }]} area height={180} unit="GB" /></Panel>
        <Panel title="Checkpoints" bodyClass="p-0">
          {Array.from({ length: Math.max(1, Math.floor(run.progress / 20)) }, (_, i) => (
            <div key={i} className="flex justify-between border-b px-4 py-2 font-mono text-xs last:border-0"><span>ckpt-{String((i + 1) * 500).padStart(5, "0")}.pt</span><span className="text-muted-foreground">val_loss {curve[Math.min(curve.length - 1, (i + 1) * 10)]?.val_loss}</span></div>
          ))}
        </Panel>
        <Panel title="Training logs" bodyClass="p-0">
          <pre className="max-h-64 overflow-auto p-4 font-mono text-[11px] leading-5 text-muted-foreground">{curve.filter((_, i) => i % 4 === 0).map((c) => `[${datetime(run.createdAt)}] step ${c.i} loss=${c.loss} val_loss=${c.val_loss}`).join("\n")}{run.status === "completed" ? "\n[done] training complete" : run.status === "failed" ? "\n[error] run terminated" : "\n[...] running"}</pre>
        </Panel>
      </div>
    </>
  );
}
