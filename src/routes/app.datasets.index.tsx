import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plug, Plus, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, Segmented } from "@/components/lab";
import { DatasetCard } from "@/components/cards";
import { DataTable } from "@/components/DataTable";
import { RunStatus, Mono } from "@/components/lab";
import { useStore } from "@/lib/store";
import { compact, gb } from "@/lib/format";
import { ConnectDataset } from "./app.experiments.new";
import { useNavigate } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/datasets/")({
  head: () => seo("Datasets", "Versioned, quality-checked datasets for experiments."),
  component: Datasets,
});

function Datasets() {
  const ds = useStore((s) => s.datasets);
  const nav = useNavigate();
  const [view, setView] = useState<"cards" | "table">("cards");
  const [open, setOpen] = useState(false);
  return (
    <>
      <PageHeader title="Datasets" description="Tick, candle and synthetic data with schema, quality and coverage tracking."
        actions={<>
          <Button size="sm" variant="outline" onClick={() => toast("Upload started (simulated)", { description: "eurusd_2026_q3.parquet · 4.2 GB" })}><Upload /> Upload Dataset</Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plug /> Connect Source</Button>
          <Button size="sm" onClick={() => setOpen(true)}><Plus /> Create Dataset</Button>
        </>} />
      <div className="mb-3"><Segmented value={view} onChange={setView} options={[{ value: "cards", label: "Cards" }, { value: "table", label: "Table" }]} /></div>
      {view === "cards" ? <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{ds.map((d) => <DatasetCard key={d.id} d={d} />)}</div> : (
        <DataTable rows={ds} searchKeys={(d) => d.name + d.domain} onRowClick={(d) => nav({ to: "/app/datasets/$id", params: { id: d.id } })} columns={[
          { key: "n", header: "Dataset", cell: (d) => d.name, sort: (d) => d.name },
          { key: "d", header: "Domain", cell: (d) => d.domain },
          { key: "r", header: "Rows", cell: (d) => <Mono>{compact(d.rows)}</Mono>, sort: (d) => d.rows },
          { key: "s", header: "Size", cell: (d) => <Mono>{gb(d.sizeGB)}</Mono>, sort: (d) => d.sizeGB },
          { key: "dr", header: "Date Range", cell: (d) => <Mono>{d.range}</Mono> },
          { key: "st", header: "Status", cell: (d) => <RunStatus status={d.status} /> },
        ]} />
      )}
      <ConnectDataset open={open} onOpenChange={setOpen} />
    </>
  );
}
