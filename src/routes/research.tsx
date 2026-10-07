import { createFileRoute } from "@tanstack/react-router";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { ScalingChart, PredictionChart } from "@/components/charts";
import { useFamilyFit } from "@/hooks/useScaling";
import { useStore } from "@/lib/store";
import { DemoNote, Mono } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/research")({
  head: () => seo("Research", "How ScalarLab turns small experiments into calibrated predictions of large-scale AI performance."),
  component: Research,
});

const steps = ["Small experiment", "Collect evidence", "Discover scaling relationship", "Predict larger experiment", "Run actual experiment", "Compare prediction vs reality"];

function Research() {
  const { fit } = useFamilyFit("Forex Transformer");
  const preds = useStore((s) => s.predictions).filter((p) => p.actual !== undefined && p.metric !== "sharpe");
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-5xl px-5 py-20">
        <div className="label-xs mb-2">Research</div>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight">Scaling behaviour is measurable. So measure it before you pay for it.</h1>
        <p className="mt-4 max-w-2xl text-muted-foreground">Across many AI systems, performance changes smoothly and predictably as model size, data and compute grow — until it doesn't. ScalarLab treats that relationship as an empirical object: fitted from cheap experiments, stated with uncertainty, and checked against reality.</p>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-2 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s} className="bg-surface p-5"><Mono className="text-xs text-primary">step {i + 1}</Mono><div className="mt-2 font-medium">{s}</div></li>
          ))}
        </ol>

        <div className="mt-10 grid gap-4 md:grid-cols-5">
          <div className="panel p-4 md:col-span-3">
            <div className="mb-2 flex justify-between text-sm"><span>Observed → projected</span><DemoNote /></div>
            {fit && <ScalingChart fit={fit} target={4820} height={280} xLabel="Compute ($)" unit="%" />}
          </div>
          <div className="panel p-4 md:col-span-2">
            <div className="mb-2 text-sm">Prediction vs reality</div>
            <PredictionChart points={preds.map((p) => ({ predicted: p.predicted, actual: p.actual!, name: p.name }))} height={280} />
          </div>
        </div>

        <div className="prose-sm mt-12 grid gap-8 text-sm text-muted-foreground md:grid-cols-2">
          <div><h3 className="mb-2 font-medium text-foreground">The model</h3><p>We fit <Mono className="text-foreground">metric = a + b · log₁₀(x)</Mono> per metric and scaling dimension, with prediction intervals that widen with extrapolation distance. Simple models are easier to falsify — that's the point.</p></div>
          <div><h3 className="mb-2 font-medium text-foreground">The feedback loop</h3><p>Every large run you execute becomes a validation point. Over time the platform learns how far its projections can be trusted for your domain, model family and metric.</p></div>
        </div>
      </div>
    </MarketingLayout>
  );
}
