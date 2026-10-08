import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { DemoNote, MetricCard, PageHeader, Panel, Progress } from "@/components/lab";
import { Bars, C } from "@/components/charts";
import { useStore } from "@/lib/store";
import { usd } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/usage")({
  head: () => seo("Usage", "Compute spend, GPU hours and plan limits for your workspace."),
  component: Usage,
});

const BUDGET = 5000;

function Usage() {
  const runs = useStore((s) => s.runs);
  const exps = useStore((s) => s.experiments);
  const { spend, byGpu, byFamily } = useMemo(() => {
    const g = new Map<string, number>(), f = new Map<string, number>();
    runs.forEach((r) => {
      g.set(r.gpu, (g.get(r.gpu) ?? 0) + r.compute);
      const fam = exps.find((e) => e.id === r.experimentId)?.family ?? "Other";
      f.set(fam, (f.get(fam) ?? 0) + r.compute);
    });
    const toRows = (m: Map<string, number>) => [...m].map(([k, v]) => ({ k, v: Math.round(v) })).sort((a, b) => b.v - a.v);
    return { spend: runs.reduce((a, r) => a + r.compute, 0), byGpu: toRows(g), byFamily: toRows(f).slice(0, 8) };
  }, [runs, exps]);
  const pct = Math.min(100, (spend / BUDGET) * 100);
  return (
    <>
      <PageHeader title="Usage" description="Where your compute budget went this billing period." actions={<DemoNote />} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="Spend" value={usd(spend)} />
        <MetricCard label="Budget" value={usd(BUDGET)} />
        <MetricCard label="Runs" value={runs.length} />
        <MetricCard label="GPU hours" value={Math.round(runs.reduce((a, r) => a + r.durationMin, 0) / 60)} />
      </div>
      <Panel title="Budget used" className="mb-4">
        <Progress value={pct} tone={pct > 85 ? "destructive" : pct > 60 ? "warning" : "primary"} />
        <div className="mt-2 font-mono text-xs text-muted-foreground">{pct.toFixed(0)}% of monthly budget</div>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Spend by GPU ($)"><Bars data={byGpu} xKey="k" bars={[{ key: "v", color: C.primary, name: "Spend" }]} /></Panel>
        <Panel title="Spend by model family ($)"><Bars data={byFamily} xKey="k" layout="vertical" height={260} bars={[{ key: "v", color: C.predict, name: "Spend" }]} /></Panel>
      </div>
    </>
  );
}
