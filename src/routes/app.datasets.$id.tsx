import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader, Panel, KV, RunStatus, MetricCard, Mono } from "@/components/lab";
import { Bars, MetricChart, C } from "@/components/charts";
import { useStore, api } from "@/lib/store";
import { series } from "@/data/mock";
import { compact, gb } from "@/lib/format";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/datasets/$id")({
  head: () => seo("Dataset", "Dataset schema, statistics, quality and versions."),
  component: DatasetDetail,
});

const schema = [["timestamp", "timestamp[ns]", "UTC tick time"], ["symbol", "string", "Instrument"], ["bid", "float64", "Best bid"], ["ask", "float64", "Best ask"], ["bid_size", "float32", "Bid volume"], ["ask_size", "float32", "Ask volume"], ["spread_bps", "float32", "Derived"], ["session", "category", "Asia / London / NY"]];

function DatasetDetail() {
  const { id } = Route.useParams();
  const d = useStore((s) => s.datasets.find((x) => x.id === id));
  if (!d) return <div className="py-20 text-center text-muted-foreground">Dataset not found. <Link to="/app/datasets" className="text-primary">Back</Link></div>;
  const coverage = Array.from({ length: 54 }, (_, i) => ({ i: `${2022 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`, coverage: Math.min(100, 92 + ((i * 37) % 9)) }));
  const dist = series(30, d.rows % 97, 0.6, 0, 0.3).map((p, i) => ({ i: (i * 0.1).toFixed(1), count: Math.round(Math.exp(-((i - 6) ** 2) / 20) * 1000 + p.v * 50) }));
  return (
    <>
      <PageHeader eyebrow={<Link to="/app/datasets">Datasets / {d.id}</Link>} title={<span className="flex items-center gap-3">{d.name}<RunStatus status={d.status} /></span>} description={`${d.source} · owned by ${d.owner}`}
        actions={<Button size="sm" onClick={() => { api.createDatasetVersion(d.id); toast.success(`Version v${d.versions + 1} created`); }}>Create Version</Button>} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <MetricCard label="Rows" value={compact(d.rows)} /><MetricCard label="Size" value={gb(d.sizeGB)} /><MetricCard label="Frequency" value={d.frequency} /><MetricCard label="Quality" value={`${d.quality}%`} tone={d.quality > 95 ? "success" : "warning"} /><MetricCard label="Versions" value={d.versions} />
      </div>
      <Tabs defaultValue="overview">
        <TabsList>{["overview", "schema", "statistics", "quality", "coverage", "versions"].map((t) => <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>)}</TabsList>
        <TabsContent value="overview"><Panel><KV cols={3} items={[["Domain", d.domain], ["Symbol", d.symbol ?? "—"], ["Range", d.range], ["Source", d.source], ["Owner", d.owner], ["Status", d.status]]} /></Panel></TabsContent>
        <TabsContent value="schema"><Panel bodyClass="p-0"><table className="w-full text-[13px]"><tbody>{schema.map(([c, t, n]) => <tr key={c} className="border-b last:border-0"><td className="px-4 py-2 font-mono">{c}</td><td className="px-4 py-2 font-mono text-info">{t}</td><td className="px-4 py-2 text-muted-foreground">{n}</td></tr>)}</tbody></table></Panel></TabsContent>
        <TabsContent value="statistics"><Panel title="Spread distribution (pips)"><Bars data={dist} xKey="i" bars={[{ key: "count", color: C.info }]} height={240} /></Panel></TabsContent>
        <TabsContent value="quality">
          <div className="grid gap-3 md:grid-cols-4">
            {[["Missing ticks", "0.4%", "success"], ["Duplicate rows", "0.02%", "success"], ["Stale quotes", "1.1%", "warning"], ["Outlier spreads", "0.3%", "success"]].map(([k, v, t]) => <MetricCard key={k} label={k} value={v} tone={t as "success"} />)}
          </div>
          <Panel title="Quality score by month" className="mt-4"><MetricChart data={coverage} lines={[{ key: "coverage", color: C.success }]} area height={220} unit="%" yDomain={[85, 100]} /></Panel>
        </TabsContent>
        <TabsContent value="coverage">
          <Panel title="Time coverage">
            <div className="grid grid-cols-12 gap-1">{coverage.map((c) => <div key={c.i} title={`${c.i}: ${c.coverage}%`} className="aspect-square rounded-sm bg-primary" style={{ opacity: (c.coverage - 85) / 15 }} />)}</div>
            <Mono className="mt-2 block text-[11px] text-muted-foreground">{coverage[0].i} → {coverage[coverage.length - 1].i}</Mono>
          </Panel>
        </TabsContent>
        <TabsContent value="versions"><Panel bodyClass="p-0">{Array.from({ length: d.versions }, (_, i) => d.versions - i).map((v) => <div key={v} className="flex justify-between border-b px-4 py-2 text-sm last:border-0"><Mono>v{v}</Mono><span className="text-muted-foreground">{v === d.versions ? "latest" : "immutable snapshot"}</span></div>)}</Panel></TabsContent>
      </Tabs>
    </>
  );
}
