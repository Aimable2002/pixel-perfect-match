import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { DemoNote, PageHeader, Segmented } from "@/components/lab";
import { PredictionCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/predictions/")({
  head: () => seo("Predictions", "Saved scaling predictions and their validation status in ScalarLab."),
  component: Predictions,
});

type F = "all" | "predicted" | "awaiting" | "validated" | "invalidated";

function Predictions() {
  const preds = useStore((s) => s.predictions);
  const exps = useStore((s) => s.experiments);
  const [f, setF] = useState<F>("all");
  const rows = f === "all" ? preds : preds.filter((p) => p.status === f);
  return (
    <>
      <PageHeader title="Predictions" description="Forecasts made before training. Validate them once the real run finishes." actions={<><DemoNote /><Button asChild size="sm"><Link to="/app/scaling" search={{}}>New prediction</Link></Button></>} />
      <div className="mb-4 overflow-x-auto">
        <Segmented value={f} onChange={setF} options={(["all", "predicted", "awaiting", "validated", "invalidated"] as F[]).map((v) => ({ value: v, label: v[0]!.toUpperCase() + v.slice(1) }))} />
      </div>
      {rows.length === 0 ? <p className="text-sm text-muted-foreground">No predictions here yet.</p> : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((p) => <PredictionCard key={p.id} p={p} current={exps.find((e) => e.id === p.experimentId)?.metrics?.[p.metric]} />)}
        </div>
      )}
    </>
  );
}
