import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useHydrated } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MetricCard, PageHeader, Panel, RunStatus, Mono, DemoNote } from "@/components/lab";
import { ScalingChart, MetricChart, C } from "@/components/charts";
import { PredictionCard, ExperimentCard } from "@/components/cards";
import { useFamilyFit } from "@/hooks/useScaling";
import { useStore } from "@/lib/store";
import { datetime, usd } from "@/lib/format";
import { seo } from "@/lib/seo";
import { runs as mockRuns } from "@/data/mock";
const baseCompute = mockRuns.reduce((a, r) => a + r.compute, 0);

export const Route = createFileRoute("/app/")({
  head: () => seo("Overview", "Your experiments, runs, compute and scale predictions at a glance."),
  component: Overview,
});

function greeting(h: number) { return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"; }

function Overview() {
  const user = useStore((s) => s.user);
  const exps = useStore((s) => s.experiments);
  const runs = useStore((s) => s.runs);
  const datasets = useStore((s) => s.datasets);
  const preds = useStore((s) => s.predictions);
  const hydrated = useHydrated();
  const { fit } = useFamilyFit("Forex Transformer");
  const { fit: dataFit } = useFamilyFit("Forex Transformer", "accuracy", "dataGB");
  const active = exps.filter((e) => e.status === "running" || e.status === "queued").length;
  const completedRuns = runs.filter((r) => r.status === "completed").length;
  const compute = runs.reduce((a, r) => a + r.compute, 0);
  const best = exps.find((e) => e.id === "exp-eurusd-tf4")?.metrics?.accuracy;
  const dataSeries = dataFit?.points.map((p) => ({ i: `${p.x}GB`, accuracy: +p.y.toFixed(1), fit: +dataFit.predict(p.x).toFixed(2) })) ?? [];

  return (
    <>
      <PageHeader
        eyebrow={<span className="flex items-center gap-2">Overview <DemoNote /></span>}
        title={`${hydrated ? greeting(new Date().getHours()) : "Good evening"}, ${user?.name ?? "Researcher"}`}
        description="Experiment small. Predict big. Here's where your evidence stands."
        actions={<Button asChild><Link to="/app/experiments/new"><Plus /> New Experiment</Link></Button>}
      />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Active Experiments" value={active + 10} sub="+2 this week" />
        <MetricCard label="Completed Runs" value={completedRuns + 50} sub="last 30 days" />
        <MetricCard label="Datasets" value={datasets.length + 6} sub="2.4 TB indexed" />
        <MetricCard label="Compute Used" value={usd(184.2 + compute - baseCompute)} sub="of $500 budget" />
        <MetricCard label="Scale Opportunities" value={preds.filter((p) => p.status === "awaiting" || p.status === "predicted").length + 1} tone="predict" sub="predicted worthwhile" />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <Panel className="xl:col-span-2" title="Performance vs Compute" actions={<Link to="/app/scaling" className="font-mono text-[11px] text-muted-foreground hover:text-foreground">Open Scaling Lab →</Link>}>
          {fit && <ScalingChart fit={fit} target={4820} height={280} xLabel="Compute ($)" unit="%" />}
        </Panel>
        <Panel title="Model Performance vs Training Data">
          <MetricChart data={dataSeries} xKey="i" height={280} unit="%" lines={[{ key: "accuracy", color: C.primary }, { key: "fit", color: C.predict, dashed: true }]} />
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <div className="flex items-center justify-between"><h3 className="text-sm font-medium">Scale Predictions</h3><Link to="/app/predictions" className="font-mono text-[11px] text-muted-foreground hover:text-foreground">all →</Link></div>
          <div className="grid gap-3 md:grid-cols-2">
            {preds.slice(0, 4).map((p) => <PredictionCard key={p.id} p={p} current={p.id === "pred-5b" ? best : undefined} />)}
          </div>
          <div className="flex items-center justify-between pt-2"><h3 className="text-sm font-medium">Recent experiments</h3><Link to="/app/experiments" className="font-mono text-[11px] text-muted-foreground hover:text-foreground">all →</Link></div>
          <div className="grid gap-3 md:grid-cols-2">{exps.slice(0, 4).map((e) => <ExperimentCard key={e.id} e={e} />)}</div>
        </div>
        <Panel title="Activity" bodyClass="p-0">
          <ul>
            {runs.slice(0, 10).map((r) => {
              const e = exps.find((x) => x.id === r.experimentId);
              return (
                <li key={r.id} className="border-b px-4 py-2.5 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <Link to="/app/runs/$id" params={{ id: r.id }} className="truncate text-xs hover:text-primary">{e?.name}</Link>
                    <RunStatus status={r.status} />
                  </div>
                  <Mono className="text-[11px] text-muted-foreground">{r.id} · {r.gpu} · {datetime(r.createdAt)}</Mono>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
