import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { DemoNote, MetricCard, PageHeader, Panel, RunStatus } from "@/components/lab";
import { PredictionChart } from "@/components/charts";
import { DataTable } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { metricLabel } from "@/lib/scaling";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/validation")({
  head: () => seo("Validation", "How accurate past scaling predictions turned out against real runs."),
  component: Validation,
});

function Validation() {
  const preds = useStore((s) => s.predictions);
  const navigate = useNavigate();
  const scored = preds.filter((p) => p.actual !== undefined);
  const hits = scored.filter((p) => p.status === "validated").length;
  const mape = scored.length ? scored.reduce((a, p) => a + Math.abs((p.actual! - p.predicted) / p.predicted), 0) / scored.length * 100 : 0;
  return (
    <>
      <PageHeader title="Validation" description="Every prediction scored against the real result. This is how you know whether to trust the curve." actions={<DemoNote />} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Scored" value={scored.length} sub={`of ${preds.length} predictions`} />
        <MetricCard label="Within range" value={scored.length ? `${Math.round((hits / scored.length) * 100)}%` : "—"} tone="success" />
        <MetricCard label="Mean abs. error" value={`${mape.toFixed(1)}%`} />
        <MetricCard label="Pending" value={preds.length - scored.length} tone="warning" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Predicted vs actual">
          {scored.length ? <PredictionChart points={scored.filter((p) => p.metric !== "sharpe").map((p) => ({ predicted: p.predicted, actual: p.actual!, name: p.name }))} /> : <p className="text-sm text-muted-foreground">No scored predictions yet.</p>}
          <p className="mt-2 text-[11px] text-muted-foreground">Dots on the dashed line were predicted perfectly. Percent metrics only.</p>
        </Panel>
        <DataTable rows={scored} pageSize={8} onRowClick={(p) => navigate({ to: "/app/predictions/$id", params: { id: p.id } })}
          columns={[
            { key: "name", header: "Prediction", cell: (p) => p.name },
            { key: "metric", header: "Metric", cell: (p) => metricLabel[p.metric] },
            { key: "pred", header: "Pred.", cell: (p) => p.predicted, sort: (p) => p.predicted },
            { key: "act", header: "Actual", cell: (p) => p.actual, sort: (p) => p.actual ?? 0 },
            { key: "s", header: "Result", cell: (p) => <RunStatus status={p.status} /> },
          ]} />
      </div>
    </>
  );
}
