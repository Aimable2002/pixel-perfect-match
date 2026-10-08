import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { DemoNote, Field, KV, MetricCard, NativeSelect, PageHeader, Panel, Segmented } from "@/components/lab";
import { ScalingChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useFamilies, useFamilyFit } from "@/hooks/useScaling";
import { dimensionLabel, metricLabel, metricUnit, verdict, type Dimension } from "@/lib/scaling";
import { api } from "@/lib/store";
import { usd } from "@/lib/format";
import type { MetricKey } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/scaling")({
  validateSearch: z.object({ family: z.string().optional() }),
  head: () => ({
    meta: [
      { title: "Scaling Lab — ScalarLab" },
      { name: "description", content: "Fit scaling curves across experiments and decide whether scaling up is worth it." },
      { property: "og:title", content: "Scaling Lab — ScalarLab" },
      { property: "og:description", content: "Fit scaling curves across experiments and decide whether scaling up is worth it." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScalingLab,
});

const metrics: MetricKey[] = ["accuracy", "f1", "sharpe", "profitFactor", "netReturn", "maxDrawdown"];

function ScalingLab() {
  const search = Route.useSearch();
  const families = useFamilies();
  const navigate = useNavigate();
  const [family, setFamily] = useState(search.family ?? families[0] ?? "Forex Transformer");
  const [metric, setMetric] = useState<MetricKey>("accuracy");
  const [dim, setDim] = useState<Dimension>("compute");
  const { members, fit } = useFamilyFit(family, metric, dim);
  const maxObs = fit ? Math.max(...fit.points.map((p) => p.x)) : 0;
  const [target, setTarget] = useState<number>(0);
  const t = target || Math.round(maxObs * 5) || 1000;
  const u = metricUnit(metric);
  const v = fit ? verdict(fit, metric) : null;
  const [lo, hi] = fit ? fit.interval(t) : [0, 0];
  const best = fit ? Math.max(...fit.points.map((p) => p.y)) : 0;
  const tone = { success: "border-success/40 bg-success/5 text-success", warning: "border-warning/40 bg-warning/5 text-warning", destructive: "border-destructive/40 bg-destructive/5 text-destructive" };

  const save = () => {
    if (!fit) return;
    const lead = members.find((m) => m.metrics) ?? members[0];
    const id = api.savePrediction({
      name: `${family} @ ${dim === "compute" ? usd(t) : t}`, experimentId: lead?.id ?? "", family, metric,
      targetParams: dim === "params" ? t : (lead?.params ?? 0) * 5, targetDataGB: dim === "dataGB" ? t : (lead?.dataGB ?? 0) * 5,
      targetCompute: dim === "compute" ? t : (lead?.compute ?? 0) * 5,
      predicted: +fit.predict(t).toFixed(2), low: +lo.toFixed(2), high: +hi.toFixed(2), confidence: fit.confidence(t), experimentsUsed: fit.points.length,
    });
    toast.success("Prediction saved");
    navigate({ to: "/app/predictions/$id", params: { id } });
  };

  return (
    <>
      <PageHeader eyebrow="Scaling Lab" title="Should you scale?" description="Fit a log-linear curve to completed experiments in a family and extrapolate to a bigger run before you pay for it." actions={<DemoNote />} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Field label="Model family"><NativeSelect value={family} onChange={setFamily} options={families} /></Field>
        <Field label="Metric"><NativeSelect value={metric} onChange={(x) => setMetric(x as MetricKey)} options={metrics.map((m) => ({ value: m, label: metricLabel[m] }))} /></Field>
        <Field label="Scale by">
          <Segmented value={dim} onChange={(d) => { setDim(d); setTarget(0); }} options={(["compute", "params", "dataGB"] as Dimension[]).map((d) => ({ value: d, label: d === "dataGB" ? "Data" : d === "params" ? "Params" : "Compute" }))} />
        </Field>
      </div>

      {!fit ? (
        <Panel><p className="text-sm text-muted-foreground">This family needs at least 3 completed experiments to fit a curve. It has {members.filter((m) => m.metrics).length}.</p></Panel>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <Panel title={`${metricLabel[metric]} vs ${dimensionLabel[dim]}`}>
            <ScalingChart fit={fit} target={t} xLabel={dimensionLabel[dim]} unit={u} />
          </Panel>
          <div className="space-y-4">
            <div className={cn("panel border p-4", v && tone[v.tone])}>
              <div className="label-xs">Verdict</div>
              <div className="mt-1 text-lg font-semibold">{v?.label}</div>
              <p className="mt-1 text-xs text-muted-foreground">{v?.reason}</p>
            </div>
            <Panel title="Target run">
              <Field label={dimensionLabel[dim]}><Input type="number" value={t} onChange={(e) => setTarget(+e.target.value)} /></Field>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MetricCard label="Projected" value={`${fit.predict(t).toFixed(2)}${u}`} tone="predict" />
                <MetricCard label="Confidence" value={`${fit.confidence(t)}%`} />
              </div>
              <div className="mt-3"><KV items={[["Range", `${lo.toFixed(2)} – ${hi.toFixed(2)}${u}`], ["Best observed", `${best}${u}`], ["Experiments", fit.points.length], ["Slope / decade", fit.slope.toFixed(3)]]} /></div>
              <Button className="mt-4 w-full" onClick={save}>Save prediction</Button>
            </Panel>
          </div>
        </div>
      )}
      <p className="mt-4 text-[11px] text-muted-foreground">Extrapolations are statistical estimates from invented demo data, not financial advice or real trading results.</p>
    </>
  );
}
