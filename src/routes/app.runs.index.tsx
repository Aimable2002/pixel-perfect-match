import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, RunStatus, Mono, NativeSelect, Progress } from "@/components/lab";
import { DataTable } from "@/components/DataTable";
import { useStore } from "@/lib/store";
import { datetime, duration, usd } from "@/lib/format";
import { models } from "@/data/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/runs/")({
  head: () => seo("Runs", "All training runs with status, GPU, duration and compute."),
  component: Runs,
});

function Runs() {
  const runs = useStore((s) => s.runs);
  const exps = useStore((s) => s.experiments);
  const ds = useStore((s) => s.datasets);
  const nav = useNavigate();
  const [status, setStatus] = useState("all");
  const rows = runs.filter((r) => status === "all" || r.status === status);
  const exp = (id: string) => exps.find((e) => e.id === id);
  return (
    <>
      <PageHeader title="Runs" description="Every training attempt, live and historical." />
      <DataTable rows={rows} pageSize={15} searchKeys={(r) => r.id + (exp(r.experimentId)?.name ?? "")} onRowClick={(r) => nav({ to: "/app/runs/$id", params: { id: r.id } })}
        toolbar={<NativeSelect value={status} onChange={setStatus} options={[{ value: "all", label: "All statuses" }, "queued", "running", "completed", "failed"]} />}
        columns={[
          { key: "id", header: "Run ID", cell: (r) => <Mono className="text-primary">{r.id}</Mono> },
          { key: "e", header: "Experiment", cell: (r) => exp(r.experimentId)?.name },
          { key: "m", header: "Model", cell: (r) => <Mono className="text-xs">{models.find((m) => m.id === exp(r.experimentId)?.modelId)?.name}</Mono> },
          { key: "d", header: "Dataset", cell: (r) => <span className="text-xs text-muted-foreground">{ds.find((d) => d.id === exp(r.experimentId)?.datasetId)?.name}</span> },
          { key: "s", header: "Status", sort: (r) => r.status, cell: (r) => <div className="flex items-center gap-2"><RunStatus status={r.status} />{r.status === "running" && <div className="w-16"><Progress value={r.progress} tone="info" /></div>}</div> },
          { key: "du", header: "Duration", sort: (r) => r.durationMin, cell: (r) => <Mono>{duration(r.durationMin)}</Mono> },
          { key: "g", header: "GPU", cell: (r) => <Mono>{r.gpu}</Mono> },
          { key: "c", header: "Compute", sort: (r) => r.compute, cell: (r) => <Mono>{usd(r.compute)}</Mono> },
          { key: "mt", header: "Metric", sort: (r) => r.metric ?? 0, cell: (r) => <Mono>{r.metric ? `${r.metric}%` : "—"}</Mono> },
          { key: "t", header: "Created", sort: (r) => r.createdAt, cell: (r) => <Mono className="text-muted-foreground">{datetime(r.createdAt)}</Mono> },
        ]} />
    </>
  );
}
