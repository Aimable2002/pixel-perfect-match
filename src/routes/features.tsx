import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { Mono } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/features")({
  head: () => seo("Features", "Experiment builder, dataset management, automated comparison, scaling analysis, large-scale prediction and tracking."),
  component: Features,
});

const features: [string, string, string[]][] = [
  ["Experiment Builder", "A six-step wizard from problem definition to scale target. Every experiment records what larger system it is evidence for.", ["Domain templates", "Metric selection", "Scale targets"]],
  ["Dataset Management", "Version tick and candle data, inspect schema and coverage, and catch quality issues before they bias a run.", ["Versioning", "Quality scoring", "Time coverage"]],
  ["Model Experiments", "Transformers, LSTMs, TCNs and time-series foundation models — or bring your own.", ["Model library", "Variants", "Custom containers"]],
  ["Automated Experiment Comparison", "Select any set of experiments and compare metrics, configs and curves side by side.", ["Diff configs", "Metric deltas", "Overlay charts"]],
  ["Scaling Analysis", "Fit how each metric moves with model size, data size, compute and steps — with intervals, not just a line.", ["Log-linear fits", "Per-metric", "Saturation detection"]],
  ["Large-Scale Prediction", "Project the target system's performance, cost and training time, and get a should-you-scale verdict.", ["Intervals", "Confidence", "Cost estimates"]],
  ["Experiment Tracking", "Runs, logs, checkpoints, GPU utilization and loss curves for every attempt.", ["Live runs", "Checkpoints", "Logs"]],
  ["Research Workspaces", "Notebook-style notes linked to experiments and charts — hypothesis, observation, conclusion.", ["Linked evidence", "Team notes", "Exports"]],
  ["Future Deployment", "Promote a validated model to a signal endpoint with shadow and staging environments.", ["Preview", "Shadow mode", "Latency SLOs"]],
];

function Features() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="label-xs mb-2">Features</div>
        <h1 className="max-w-2xl text-4xl font-semibold tracking-tight">Everything between a hypothesis and a compute budget.</h1>
        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-3">
          {features.map(([t, d, tags], i) => (
            <div key={t} className="bg-background p-6">
              <Mono className="text-xs text-primary">{String(i + 1).padStart(2, "0")}</Mono>
              <h3 className="mt-3 font-medium">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">{tags.map((x) => <span key={x} className="rounded border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">{x}</span>)}</div>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
