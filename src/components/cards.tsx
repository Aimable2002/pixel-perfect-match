import { Link, useNavigate } from "@tanstack/react-router";
import type { Dataset, Experiment, Model, Prediction } from "@/types";
import { RunStatus, Mono } from "@/components/lab";
import { DataTable, type Column } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { compact, date, gb, params, usd } from "@/lib/format";
import { metricLabel, metricUnit } from "@/lib/scaling";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function ExperimentCard({ e }: { e: Experiment }) {
  return (
    <Link to="/app/experiments/$id" params={{ id: e.id }} className="panel block p-4 transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><div className="truncate text-sm font-medium">{e.name}</div><div className="font-mono text-[11px] text-muted-foreground">{e.id}</div></div>
        <RunStatus status={e.status} />
      </div>
      <div className="mt-3 flex gap-4 font-mono text-xs text-muted-foreground">
        <span>{params(e.params)}</span><span>{gb(e.dataGB)}</span><span>{usd(e.compute)}</span>
        {e.metrics && <span className="ml-auto text-foreground">{e.metrics[e.primaryMetric]}{metricUnit(e.primaryMetric)}</span>}
      </div>
    </Link>
  );
}

export function ExperimentTable({ rows, selectable, selected, onSelectedChange, toolbar, actions, pageSize }: {
  rows: Experiment[]; selectable?: boolean; selected?: string[]; onSelectedChange?: (ids: string[]) => void; toolbar?: ReactNode; actions?: (e: Experiment) => ReactNode; pageSize?: number;
}) {
  const navigate = useNavigate();
  const models = useStore((s) => s.experiments) && useStore((s) => s.datasets);
  const datasets = models;
  const modelName = (id: string) => modelsById[id] ?? id;
  const cols: Column<Experiment>[] = [
    { key: "name", header: "Experiment", sort: (e) => e.name, cell: (e) => <div><div className="font-medium">{e.name}</div><Mono className="text-[11px] text-muted-foreground">{e.id}</Mono></div> },
    { key: "domain", header: "Domain", cell: (e) => <span className="text-muted-foreground">{e.domain}</span> },
    { key: "model", header: "Model", cell: (e) => <Mono className="text-xs">{modelName(e.modelId)} · {params(e.params)}</Mono> },
    { key: "dataset", header: "Dataset", cell: (e) => <span className="text-xs text-muted-foreground">{datasets.find((d) => d.id === e.datasetId)?.name ?? e.datasetId}</span> },
    { key: "status", header: "Status", sort: (e) => e.status, cell: (e) => <RunStatus status={e.status} /> },
    { key: "metric", header: "Best Metric", sort: (e) => e.metrics?.[e.primaryMetric] ?? -1, cell: (e) => e.metrics ? <Mono>{e.metrics[e.primaryMetric]}{metricUnit(e.primaryMetric)} <span className="text-muted-foreground">{metricLabel[e.primaryMetric].toLowerCase()}</span></Mono> : <Mono className="text-muted-foreground">—</Mono> },
    { key: "compute", header: "Compute", sort: (e) => e.compute, cell: (e) => <Mono>{usd(e.compute)}</Mono> },
    { key: "created", header: "Created", sort: (e) => e.createdAt, cell: (e) => <Mono className="text-xs text-muted-foreground">{date(e.createdAt)}</Mono> },
  ];
  if (actions) cols.push({ key: "actions", header: "", cell: (e) => <div onClick={(ev) => ev.stopPropagation()}>{actions(e)}</div> });
  return (
    <DataTable rows={rows} columns={cols} searchKeys={(e) => `${e.name} ${e.id} ${e.domain}`} toolbar={toolbar} pageSize={pageSize}
      selectable={selectable} selected={selected} onSelectedChange={onSelectedChange}
      onRowClick={(e) => navigate({ to: "/app/experiments/$id", params: { id: e.id } })} />
  );
}
import { models as allModels } from "@/data/mock";
const modelsById: Record<string, string> = Object.fromEntries(allModels.map((m) => [m.id, m.name]));

export function ModelCard({ m, selected, onSelect, href = true }: { m: Model; selected?: boolean; onSelect?: () => void; href?: boolean }) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <div><div className="text-sm font-medium">{m.name}</div><div className="label-xs mt-0.5">{m.category}</div></div>
        <RunStatus status={m.status} />
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{m.description}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t pt-3 font-mono text-[11px]">
        <div><div className="text-muted-foreground">params</div>{params(m.params)}</div>
        <div><div className="text-muted-foreground">context</div>{m.context || "—"}</div>
        <div><div className="text-muted-foreground">$/epoch</div>{m.computePerEpoch.toFixed(2)}</div>
      </div>
      <div className="mt-2 truncate font-mono text-[11px] text-muted-foreground">{m.architecture}</div>
    </>
  );
  const cls = cn("panel block p-4 text-left transition-colors hover:border-primary/40", selected && "border-primary glow-primary");
  if (onSelect) return <button type="button" onClick={onSelect} className={cls}>{body}</button>;
  return href ? <Link to="/app/models/$id" params={{ id: m.id }} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

export function DatasetCard({ d, selected, onSelect }: { d: Dataset; selected?: boolean; onSelect?: () => void }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0"><div className="truncate text-sm font-medium">{d.name}</div><div className="label-xs mt-0.5">{d.domain}{d.symbol ? ` · ${d.symbol}` : ""}</div></div>
        <RunStatus status={d.status} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
        <div><div className="text-muted-foreground">rows</div>{compact(d.rows)}</div>
        <div><div className="text-muted-foreground">size</div>{gb(d.sizeGB)}</div>
        <div><div className="text-muted-foreground">freq</div>{d.frequency}</div>
        <div className="col-span-2"><div className="text-muted-foreground">range</div>{d.range}</div>
        <div><div className="text-muted-foreground">quality</div><span className={d.quality > 95 ? "text-success" : "text-warning"}>{d.quality}%</span></div>
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">src: {d.source}</div>
    </>
  );
  const cls = cn("panel block p-4 text-left transition-colors hover:border-primary/40", selected && "border-primary glow-primary");
  return onSelect ? <button type="button" onClick={onSelect} className={cls}>{body}</button> : <Link to="/app/datasets/$id" params={{ id: d.id }} className={cls}>{body}</Link>;
}

export function PredictionCard({ p, current }: { p: Prediction; current?: number }) {
  const u = metricUnit(p.metric);
  return (
    <Link to="/app/predictions/$id" params={{ id: p.id }} className="panel block p-4 transition-colors hover:border-predict/50">
      <div className="flex items-start justify-between gap-2">
        <div className="text-sm font-medium">{p.name}</div><RunStatus status={p.status} />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-xs">
        <div><div className="label-xs">Current</div>{current !== undefined ? `${current}${u}` : "—"}</div>
        <div><div className="label-xs">Projected</div><span className="text-predict">{p.predicted}{u}</span></div>
        <div><div className="label-xs">Confidence</div>{p.confidence}%</div>
      </div>
      <div className="mt-2 font-mono text-[11px] text-muted-foreground">{metricLabel[p.metric]} · range {p.low}–{p.high}{u} · {params(p.targetParams)} @ {usd(p.targetCompute)}</div>
    </Link>
  );
}
