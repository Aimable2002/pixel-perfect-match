import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, Field, KV, MetricCard, PageHeader, Panel, RunStatus } from "@/components/lab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, useStore } from "@/lib/store";
import { metricLabel, metricUnit } from "@/lib/scaling";
import { date, gb, params, usd } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/predictions/$id")({
  head: () => seo("Prediction detail", "Review a scaling prediction and validate it against the real result."),
  component: PredictionDetail,
});

function PredictionDetail() {
  const { id } = Route.useParams();
  const p = useStore((s) => s.predictions.find((x) => x.id === id));
  const exp = useStore((s) => s.experiments.find((e) => e.id === p?.experimentId));
  const [actual, setActual] = useState("");
  if (!p) return <Panel><p className="text-sm">Prediction not found. <Link to="/app/predictions" className="text-primary">Back to predictions</Link></p></Panel>;
  const u = metricUnit(p.metric);
  const err = p.actual !== undefined ? p.actual - p.predicted : undefined;
  return (
    <>
      <PageHeader eyebrow={<Link to="/app/predictions">← Predictions</Link>} title={p.name} description={`${metricLabel[p.metric]} forecast for the ${p.family} family, made ${date(p.createdAt)}.`}
        actions={<><DemoNote /><RunStatus status={p.status} /></>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Predicted" value={`${p.predicted}${u}`} tone="predict" />
        <MetricCard label="Range" value={`${p.low}–${p.high}`} sub={u || undefined} />
        <MetricCard label="Confidence" value={`${p.confidence}%`} />
        <MetricCard label="Actual" value={p.actual !== undefined ? `${p.actual}${u}` : "—"} tone={p.status === "validated" ? "success" : p.status === "invalidated" ? "destructive" : undefined}
          sub={err !== undefined ? `error ${err > 0 ? "+" : ""}${err.toFixed(2)}` : undefined} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Target configuration">
          <KV items={[["Params", params(p.targetParams)], ["Data", gb(p.targetDataGB)], ["Compute", usd(p.targetCompute)], ["Experiments used", p.experimentsUsed],
            ["Source experiment", exp ? <Link to="/app/experiments/$id" params={{ id: exp.id }} className="text-primary">{exp.name}</Link> : "—"], ["Metric", metricLabel[p.metric]]]} />
        </Panel>
        <Panel title="Validate">
          {p.status === "validated" || p.status === "invalidated" ? (
            <p className="text-sm text-muted-foreground">The real result {p.status === "validated" ? "landed inside" : "fell outside"} the predicted range.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">Once the full-scale run finishes, enter its real {metricLabel[p.metric].toLowerCase()} to score this prediction.</p>
              <Field label={`Actual ${metricLabel[p.metric]}${u ? ` (${u})` : ""}`}><Input type="number" step="0.01" value={actual} onChange={(e) => setActual(e.target.value)} /></Field>
              <div className="flex flex-wrap gap-2">
                <Button disabled={actual === ""} onClick={() => { api.validatePrediction(p.id, +actual); toast.success("Prediction scored"); }}>Record result</Button>
                {p.status === "predicted" && <Button variant="outline" onClick={() => { api.markAwaiting(p.id); toast("Marked as awaiting run"); }}>Mark run started</Button>}
              </div>
            </div>
          )}
        </Panel>
      </div>
    </>
  );
}
