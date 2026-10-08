import { createFileRoute } from "@tanstack/react-router";
import { DemoNote, MetricCard, PageHeader, Panel, RunStatus } from "@/components/lab";
import { MetricChart, C } from "@/components/charts";
import { deployments, series } from "@/data/mock";
import { compact } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/deployments")({
  head: () => seo("Deployments", "Models serving predictions in production, staging and shadow."),
  component: Deployments,
});

function Deployments() {
  const lat = series(48, 9, 40, 0, 8).map((d, i) => ({ i, prod: d.v, shadow: d.v * 2.6 + (i % 5) }));
  return (
    <>
      <PageHeader title="Deployments" description="Models currently serving signals." actions={<DemoNote />} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Endpoints" value={deployments.length} />
        <MetricCard label="Requests (30d)" value={compact(deployments.reduce((a, d) => a + d.requests, 0))} />
        <MetricCard label="Healthy" value={deployments.filter((d) => d.status === "healthy").length} tone="success" />
        <MetricCard label="Degraded" value={deployments.filter((d) => d.status !== "healthy").length} tone="warning" />
      </div>
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {deployments.map((d) => (
          <Panel key={d.id} title={d.name} actions={<RunStatus status={d.status} />}>
            <div className="space-y-1 font-mono text-xs">
              <div className="text-muted-foreground">{d.environment} · {d.version}</div>
              <div className="truncate">{d.endpoint}</div>
              <div>{compact(d.requests)} req · p50 {d.latencyMs}ms</div>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="Latency, last 48h (ms)">
        <MetricChart data={lat} lines={[{ key: "prod", color: C.primary, name: "Production" }, { key: "shadow", color: C.warning, name: "Shadow" }]} />
      </Panel>
    </>
  );
}
