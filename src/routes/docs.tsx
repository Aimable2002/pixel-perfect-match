import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/docs")({
  head: () => seo("Documentation", "Guides for experiments, datasets, models, training, evaluation, scaling, predictions and the API."),
  component: Docs,
});

const docs: Record<string, { lead: string; body: string[]; code?: string }> = {
  "Getting Started": { lead: "Create a workspace, connect a dataset and run your first scaling ladder in under ten minutes.", body: ["Sign up and create a workspace. Every workspace has its own datasets, experiments and compute budget.", "Open Experiments → New Experiment and follow the six-step wizard. The final step asks which larger system you are trying to predict — this is what makes the experiment useful as scaling evidence."], code: "scalar login\nscalar experiments create --template forex-direction\nscalar runs watch" },
  Experiments: { lead: "An experiment is a problem definition plus a configuration. It can have many runs.", body: ["Experiments belong to a family. Experiments in the same family share an objective and differ along one or more scaling dimensions.", "Use Compare to diff configurations and metrics across any selection."] },
  Datasets: { lead: "Versioned, schema-checked datasets with quality scores and time coverage.", body: ["Upload Parquet/CSV or connect a source. Each new version is immutable.", "Quality checks flag gaps, duplicate ticks, stale quotes and outlier spreads."] },
  Models: { lead: "Pick a library architecture or bring your own container.", body: ["Variants let you change size, context and depth while keeping lineage.", "Foundation models (Chronos, TimesFM, Moirai) appear as demo integrations."] },
  Training: { lead: "Configure splits, epochs, batch size, learning rate, sequence length and GPU.", body: ["The cost estimator uses model compute-per-epoch, dataset size and GPU pool price.", "Runs stream loss, validation curves and utilization."] },
  Evaluation: { lead: "Classification metrics and strategy metrics, evaluated without look-ahead.", body: ["Walk Forward: rolling train/test windows.", "Time Split: one fixed chronological split.", "Purged Split: removes overlap between labels and training windows.", "Strategy metrics include spread, slippage and commission."] },
  Scaling: { lead: "Fit how a metric moves with compute, model size, data size or steps.", body: ["The default fit is log-linear: metric = a + b·log10(x). Prediction intervals widen with extrapolation distance.", "The Should-you-scale verdict compares the slope in the upper half of observed points to the lower half to detect flattening."], code: "acc(x) = a + b * log10(x)\nCI(x)  = ±1.96 · σ · sqrt(1 + 1/n + (log x − μ)² / Sxx)" },
  Predictions: { lead: "A prediction is a saved projection for a specific target scale.", body: ["Predictions move through Predicted → Awaiting Run → Validated / Invalidated.", "A prediction is validated when the actual result falls inside the interval."] },
  API: { lead: "REST API (mocked in this prototype).", body: ["All resources are exposed under /v1. Authentication uses workspace API keys."], code: "GET  /v1/experiments\nPOST /v1/experiments\nPOST /v1/experiments/{id}/runs\nGET  /v1/scaling/{family}?metric=accuracy&dim=compute\nPOST /v1/predictions" },
  "Research Concepts": { lead: "Why small experiments are evidence.", body: ["Scaling behaviour is often smooth across orders of magnitude. Measuring it cheaply lets you reject bad large-scale bets early.", "But scaling curves can bend. That is why every prediction is validated against reality and the platform tracks calibration over time."] },
};

function Docs() {
  const [page, setPage] = useState("Getting Started");
  const d = docs[page];
  return (
    <MarketingLayout>
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-[200px_1fr]">
        <nav className="space-y-0.5 md:sticky md:top-20 md:self-start">
          <div className="label-xs mb-2">Documentation</div>
          {Object.keys(docs).map((k) => (
            <button key={k} onClick={() => setPage(k)} className={cn("block w-full rounded px-2 py-1.5 text-left text-sm", page === k ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>{k}</button>
          ))}
        </nav>
        <article className="max-w-2xl">
          <h1 className="text-3xl font-semibold tracking-tight">{page}</h1>
          <p className="mt-3 text-lg text-muted-foreground">{d.lead}</p>
          <div className="mt-8 space-y-4 text-sm leading-7">{d.body.map((b) => <p key={b}>{b}</p>)}</div>
          {d.code && <pre className="panel mt-6 overflow-x-auto p-4 font-mono text-xs leading-6 text-primary">{d.code}</pre>}
        </article>
      </div>
    </MarketingLayout>
  );
}
