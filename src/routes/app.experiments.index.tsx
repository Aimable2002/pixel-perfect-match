import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Archive, GitCompare, Plus, Play, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, NativeSelect, Confirm } from "@/components/lab";
import { ExperimentTable } from "@/components/cards";
import { useStore, api } from "@/lib/store";
import { models } from "@/data/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/experiments/")({
  head: () => seo("Experiments", "All experiments across domains, models and datasets."),
  component: Experiments,
});

function Experiments() {
  const exps = useStore((s) => s.experiments);
  const datasets = useStore((s) => s.datasets);
  const nav = useNavigate();
  const [domain, setDomain] = useState("all");
  const [status, setStatus] = useState("active");
  const [model, setModel] = useState("all");
  const [dataset, setDataset] = useState("all");
  const [range, setRange] = useState("all");
  const [sel, setSel] = useState<string[]>([]);

  const rows = useMemo(() => exps.filter((e) =>
    (domain === "all" || e.domain === domain) &&
    (status === "all" ? true : status === "active" ? e.status !== "archived" : e.status === status) &&
    (model === "all" || e.modelId === model) &&
    (dataset === "all" || e.datasetId === dataset) &&
    (range === "all" || Date.parse(e.createdAt) > Date.parse("2026-10-07") - Number(range) * 86400_000)), [exps, domain, status, model, dataset, range]);

  return (
    <>
      <PageHeader title="Experiments" description="Each experiment is evidence for a larger system. Select several to compare."
        actions={<>
          <Button variant="outline" size="sm" disabled={sel.length < 2} onClick={() => nav({ to: "/app/compare", search: { ids: sel.join(",") } })}><GitCompare /> Compare{sel.length ? ` (${sel.length})` : ""}</Button>
          <Confirm trigger={<Button variant="outline" size="sm" disabled={!sel.length}><Archive /> Archive</Button>}
            title={`Archive ${sel.length} experiment(s)?`} description="Archived experiments stay in scaling fits but are hidden from the default list."
            onConfirm={() => { api.archiveExperiments(sel); toast.success(`Archived ${sel.length} experiment(s)`); setSel([]); }} action="Archive" />
          <Button size="sm" asChild><Link to="/app/experiments/new"><Plus /> New Experiment</Link></Button>
        </>} />
      <ExperimentTable rows={rows} selectable selected={sel} onSelectedChange={setSel} pageSize={12}
        toolbar={<div className="flex flex-wrap gap-2">
          <NativeSelect value={domain} onChange={setDomain} options={[{ value: "all", label: "All domains" }, "Forex", "Binary", "Vision", "General AI"]} />
          <NativeSelect value={status} onChange={setStatus} options={[{ value: "active", label: "Not archived" }, { value: "all", label: "All statuses" }, "running", "queued", "completed", "failed", "draft", "archived"]} />
          <NativeSelect value={model} onChange={setModel} options={[{ value: "all", label: "All models" }, ...models.map((m) => ({ value: m.id, label: m.name }))]} />
          <NativeSelect value={dataset} onChange={setDataset} options={[{ value: "all", label: "All datasets" }, ...datasets.map((d) => ({ value: d.id, label: d.name }))]} />
          <NativeSelect value={range} onChange={setRange} options={[{ value: "all", label: "Any date" }, { value: "7", label: "Last 7 days" }, { value: "30", label: "Last 30 days" }]} />
        </div>}
        actions={(e) => (
          <DropdownMenu>
            <DropdownMenuTrigger className="rounded p-1 hover:bg-accent" aria-label="Actions"><MoreHorizontal className="size-4" /></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => { api.runExperiment(e.id); toast("Run queued", { description: e.name }); }}><Play className="size-3.5" /> Run</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { const id = api.duplicateExperiment(e.id); toast.success("Duplicated"); nav({ to: "/app/experiments/$id", params: { id } }); }}>Duplicate</DropdownMenuItem>
              <DropdownMenuItem onClick={() => { api.archiveExperiments([e.id]); toast("Archived"); }}>Archive</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )} />
    </>
  );
}
