import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { Archive, Copy, GitCompare, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, RunStatus, MetricCard, KV, Mono, Progress, Confirm, DemoNote } from "@/components/lab";
import { MetricChart, ConfusionMatrix, Bars, ScalingChart, C } from "@/components/charts";
import { PredictionCard } from "@/components/cards";
import { DataTable } from "@/components/DataTable";
import { useStore, api, getState } from "@/lib/store";
import { useFamilyFit } from "@/hooks/useScaling";
import { featureImportance, models, rng, series } from "@/data/mock";
import { date, datetime, duration, gb, params, usd } from "@/lib/format";
import { metricLabel, metricUnit } from "@/lib/scaling";
import type { MetricKey } from "@/types";

export const Route = createFileRoute("/app/experiments/$id")({
  loader: ({ params }) => {
    const e = getState().experiments.find((x) => x.id === params.id);
    if (!e) throw notFound();
    return { name: e.name };
  },
  head: ({ loaderData }) => loaderData ? { meta: [{ title: `${loaderData.name} — ScalarLab` }, { name: "description", content: `Experiment detail for ${loaderData.name}.` }, { property: "og:title", content: loaderData.name }, { property: "og:description", content: "Experiment detail" }] } : { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] },
  notFoundComponent: () => <div className="py-20 text-center text-muted-foreground">Experiment not found. <Link to="/app/experiments" className="text-primary">Back</Link></div>,
  component: ExperimentDetail,
});

const metricKeys: MetricKey[] = ["accuracy", "precision", "recall", "f1", "profitFactor", "sharpe", "maxDrawdown", "netReturn"];

function ExperimentDetail() {
  const { id } = Route.useParams();
  const nav = useNavigate();
  const e = useStore((s) => s.experiments.find((x) => x.id === id));
  const runs = useStore((s) => s.runs).filter((r) => r.experimentId === id);
  const datasets = useStore((s) => s.datasets);
  const preds = useStore((s) => s.predictions).filter((p) => p.family === e?.family);
  const { fit, members } = useFamilyFit(e?.family ?? "", e?.primaryMetric ?? "accuracy");
  const seed = id.length * 31 + (e?.compute ?? 1);
  const charts = useMemo(() => {
    const acc = e?.metrics?.accuracy ?? 55;
    const accSeries = series(52, seed, acc - 1.5, 0.03, 1.6).map((p, i) => ({ i: `W${i + 1}`, accuracy: p.v, baseline: 50 }));
    let peak = 100;
    const eq = series(120, seed + 1, 100, (e?.metrics?.netReturn ?? 5) / 120, 1.8).map((p, i) => { peak = Math.max(peak, p.v); return { i, equity: p.v, drawdown: +(((p.v - peak) / peak) * 100).toFixed(2) }; });
    const g = rng(seed);
    const n = 20000;
    const tp = Math.round(n * (acc / 200) * (0.95 + g() * 0.1));
    const tn = Math.round(n * (acc / 100)) - tp;
    return { accSeries, eq, cm: { tp, tn, fp: Math.round((n - tp - tn) * 0.52), fn: Math.round((n - tp - tn) * 0.48) } };
  }, [e?.metrics, seed]);

  if (!e) return null;
  const model = models.find((m) => m.id === e.modelId);
  const ds = datasets.find((d) => d.id === e.datasetId);
  const live = runs.find((r) => r.status === "running" || r.status === "queued");
  const m = e.metrics;

  return (
    <>
      <PageHeader
        eyebrow={<Link to="/app/experiments" className="hover:text-foreground">Experiments / {e.id}</Link>}
        title={<span className="flex flex-wrap items-center gap-3">{e.name} <RunStatus status={e.status} /></span>}
        description={<Mono className="text-xs">{e.domain} · {e.family} · created {date(e.createdAt)} by {e.owner}</Mono>}
        actions={<>
          <Button size="sm" disabled={!!live} onClick={() => { api.runExperiment(e.id); toast("Run queued", { description: "Allocating GPU from pool…" }); }}><Play /> Run</Button>
          <Button size="sm" variant="outline" onClick={() => { const nid = api.duplicateExperiment(e.id); toast.success("Experiment duplicated"); nav({ to: "/app/experiments/$id", params: { id: nid } }); }}><Copy /> Duplicate</Button>
          <Button size="sm" variant="outline" onClick={() => nav({ to: "/app/compare", search: { ids: [e.id, ...members.filter((x) => x.id !== e.id && x.metrics).slice(0, 2).map((x) => x.id)].join(",") } })}><GitCompare /> Compare</Button>
          <Confirm trigger={<Button size="sm" variant="outline" disabled={!live}><Square /> Stop</Button>} title="Stop the active run?" description="The run will be marked failed. Checkpoints saved so far are kept." destructive action="Stop run" onConfirm={() => { api.stopExperiment(e.id); toast("Run stopped"); }} />
          <Confirm trigger={<Button size="sm" variant="ghost"><Archive /></Button>} title="Archive experiment?" description="It will be hidden from the default list but kept in scaling fits." action="Archive" onConfirm={() => { api.archiveExperiments([e.id]); toast("Archived"); }} />
        </>}
      />

      {live && (
        <div className="panel mb-4 flex flex-col gap-3 border-info/40 p-4 md:flex-row md:items-center">
          <div className="flex items-center gap-3"><RunStatus status={live.status} /><Mono className="text-xs">{live.id} · {live.gpu}</Mono></div>
          <div className="flex flex-1 items-center gap-3"><Progress value={live.progress} tone="info" /><Mono className="w-10 text-right text-xs">{live.progress}%</Mono></div>
          <span className="text-xs text-muted-foreground">{live.status === "queued" ? "Waiting for GPU…" : `Epoch ${Math.ceil((live.progress / 100) * e.training.epochs)}/${e.training.epochs}`}</span>
        </div>
      )}

      <Tabs defaultValue="overview">
        <TabsList className="h-auto flex-wrap justify-start bg-transparent p-0">
          {["overview", "configuration", "runs", "metrics", "charts", "scaling", "predictions", "logs"].map((t) => (
            <TabsTrigger key={t} value={t} className="rounded-none border-b-2 border-transparent px-3 py-2 capitalize data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">{t}</TabsTrigger>
          ))}
        </TabsList>
        <div className="mt-4">
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <Panel title="Objective" className="lg:col-span-2">
                <p className="text-sm">{e.objective}</p>
                <div className="mt-4"><KV cols={3} items={[["Dataset", ds?.name ?? e.datasetId], ["Model", `${model?.name} · ${params(e.params)}`], ["Primary metric", metricLabel[e.primaryMetric]], ["Training", e.split.train], ["Validation", e.split.val], ["Testing", e.split.test]]} /></div>
              </Panel>
              <Panel title="Scale target">
                {e.target ? <KV items={[["Target model", params(e.target.params)], ["Target data", gb(e.target.dataGB)], ["Target compute", usd(e.target.computeUSD)], ["Budget", usd(e.target.budgetUSD)]]} /> : <p className="text-sm text-muted-foreground">No target set.</p>}
              </Panel>
            </div>
            {m ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {metricKeys.map((k) => <MetricCard key={k} label={metricLabel[k]} value={`${m[k]}${metricUnit(k)}`} tone={k === e.primaryMetric ? "primary" : undefined} />)}
              </div>
            ) : <Panel><p className="text-sm text-muted-foreground">Metrics appear once a run completes.</p></Panel>}
            {m && <div className="flex items-center gap-2 text-xs text-muted-foreground"><DemoNote /> Strategy metrics are simulated backtests on fictional data, not trading results.</div>}
          </TabsContent>

          <TabsContent value="configuration">
            <div className="grid gap-4 lg:grid-cols-2">
              <Panel title="Training"><KV items={[["Split", `${e.training.trainPct}/${e.training.valPct}/${e.training.testPct}`], ["Epochs", e.training.epochs], ["Batch size", e.training.batchSize], ["Learning rate", e.training.learningRate], ["Sequence length", e.training.seqLength], ["GPU", e.training.gpu], ["Compute budget", usd(e.training.computeBudget)], ["Architecture", model?.architecture]]} /></Panel>
              <Panel title="Strategy / evaluation">{e.strategy ? <KV items={[["Target", e.strategy.target], ["Entry", e.strategy.entryRule], ["Exit", e.strategy.exitRule], ["Stop / TP (pips)", `${e.strategy.stopLoss} / ${e.strategy.takeProfit}`], ["Sizing", e.strategy.positionSizing], ["Spread / slippage", `${e.strategy.spread} / ${e.strategy.slippage}`], ["Commission", `$${e.strategy.commission}/lot`], ["Evaluation", e.strategy.evaluation]]} /> : <p className="text-sm text-muted-foreground">Not applicable for this domain.</p>}</Panel>
            </div>
          </TabsContent>

          <TabsContent value="runs">
            <DataTable rows={runs} columns={[
              { key: "id", header: "Run", cell: (r) => <Link to="/app/runs/$id" params={{ id: r.id }} className="font-mono text-primary">{r.id}</Link> },
              { key: "s", header: "Status", cell: (r) => <RunStatus status={r.status} /> },
              { key: "p", header: "Progress", cell: (r) => <div className="w-32"><Progress value={r.progress} tone={r.status === "failed" ? "destructive" : "primary"} /></div> },
              { key: "g", header: "GPU", cell: (r) => <Mono>{r.gpu}</Mono> },
              { key: "d", header: "Duration", cell: (r) => <Mono>{duration(r.durationMin)}</Mono> },
              { key: "c", header: "Compute", cell: (r) => <Mono>{usd(r.compute)}</Mono> },
              { key: "m", header: "Metric", cell: (r) => <Mono>{r.metric ? `${r.metric}%` : "—"}</Mono> },
              { key: "t", header: "Created", cell: (r) => <Mono className="text-muted-foreground">{datetime(r.createdAt)}</Mono> },
            ]} />
          </TabsContent>

          <TabsContent value="metrics">
            <Panel bodyClass="p-0">
              <table className="w-full text-[13px]"><tbody>
                {metricKeys.map((k) => <tr key={k} className="border-b last:border-0"><td className="px-4 py-2 text-muted-foreground">{metricLabel[k]}</td><td className="px-4 py-2 text-right"><Mono>{m ? `${m[k]}${metricUnit(k)}` : "—"}</Mono></td></tr>)}
              </tbody></table>
            </Panel>
          </TabsContent>

          <TabsContent value="charts" className="grid gap-4 lg:grid-cols-2">
            <Panel title="Prediction accuracy over time"><MetricChart data={charts.accSeries} height={220} unit="%" lines={[{ key: "accuracy", color: C.primary }, { key: "baseline", color: C.muted, dashed: true }]} /></Panel>
            <Panel title="Trading equity curve (simulated)"><MetricChart data={charts.eq} height={220} area lines={[{ key: "equity", color: C.success }]} /></Panel>
            <Panel title="Drawdown"><MetricChart data={charts.eq} height={200} area unit="%" lines={[{ key: "drawdown", color: C.destructive }]} /></Panel>
            <Panel title="Confusion matrix · test set"><ConfusionMatrix {...charts.cm} /></Panel>
            <Panel title="Feature importance" className="lg:col-span-2"><Bars data={featureImportance} xKey="feature" layout="vertical" height={240} bars={[{ key: "value", color: C.info }]} /></Panel>
          </TabsContent>

          <TabsContent value="scaling">
            <Panel title={`${e.family} family · ${metricLabel[e.primaryMetric]} vs compute`} actions={<Link to="/app/scaling" search={{ family: e.family }} className="font-mono text-[11px] text-muted-foreground hover:text-foreground">Scaling Lab →</Link>}>
              {fit ? <ScalingChart fit={fit} target={e.target?.computeUSD} height={320} xLabel="Compute ($)" unit={metricUnit(e.primaryMetric)} /> : <p className="py-10 text-center text-sm text-muted-foreground">Need at least 3 completed experiments in this family to fit a scaling curve.</p>}
            </Panel>
          </TabsContent>

          <TabsContent value="predictions">
            <div className="grid gap-3 md:grid-cols-2">{preds.length ? preds.map((p) => <PredictionCard key={p.id} p={p} current={m?.[p.metric]} />) : <p className="text-sm text-muted-foreground">No predictions yet. Generate one in the Scaling Lab.</p>}</div>
          </TabsContent>

          <TabsContent value="logs">
            <pre className="panel max-h-[480px] overflow-auto p-4 font-mono text-[11.5px] leading-6 text-muted-foreground">
{`[${datetime(e.createdAt)}] experiment ${e.id} created by ${e.owner}
[info] dataset ${e.datasetId} v${ds?.versions ?? 1} mounted (${gb(ds?.sizeGB ?? e.dataGB)})
[info] model ${model?.name} ${params(e.params)} · ${model?.architecture}
[info] split train=${e.split.train} val=${e.split.val} test=${e.split.test}
[info] gpu=${e.training.gpu} batch=${e.training.batchSize} lr=${e.training.learningRate}
${Array.from({ length: e.training.epochs }, (_, i) => `[train] epoch ${String(i + 1).padStart(2, "0")} loss=${(0.693 - i * 0.004 - (m ? 0.01 : 0)).toFixed(4)} val_acc=${((m?.accuracy ?? 55) - (e.training.epochs - i) * 0.08).toFixed(2)}`).join("\n")}
${m ? `[eval] accuracy=${m.accuracy} f1=${m.f1} sharpe=${m.sharpe} pf=${m.profitFactor} dd=${m.maxDrawdown}%\n[done] run completed · checkpoint saved` : "[wait] awaiting completion…"}`}
            </pre>
          </TabsContent>
        </div>
      </Tabs>
    </>
  );
}
