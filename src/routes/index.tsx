import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { Button } from "@/components/ui/button";
import { ScalingChart } from "@/components/charts";
import { useFamilyFit } from "@/hooks/useScaling";
import { DemoNote, Mono } from "@/components/lab";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () => seo("Experiment small. Predict big.", "Train and evaluate AI systems at small scale, learn how they scale, and estimate large-scale performance before committing expensive compute."),
  component: Landing,
});

const pipeline = ["Small Experiments", "Observed Performance", "Scaling Model", "Large-Scale Prediction", "Validation"];

function Landing() {
  const { fit } = useFamilyFit("Forex Transformer");
  return (
    <MarketingLayout>
      <section className="grid-bg relative border-b">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-20 md:pt-28">
          <div className="label-xs mb-5 inline-flex items-center gap-2 rounded-full border bg-surface px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary pulse-dot" /> AI experimentation & scale-validation platform
          </div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.02] tracking-tight md:text-7xl">
            Experiment small.<br /><span className="text-primary">Predict big.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg">
            Train and evaluate AI systems at small scale, learn how they scale, and estimate large-scale performance before committing expensive compute.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg"><Link to="/signup">Start Experiment <ArrowRight /></Link></Button>
            <Button asChild size="lg" variant="outline"><Link to="/app/scaling">Explore the Lab</Link></Button>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-5">
            {pipeline.map((p, i) => (
              <div key={p} className="bg-surface px-4 py-3">
                <Mono className="text-[10px] text-muted-foreground">0{i + 1}</Mono>
                <div className={`mt-1 text-sm ${i === 3 ? "text-predict" : i === 4 ? "text-success" : ""}`}>{p}</div>
              </div>
            ))}
          </div>

          <div className="panel mt-4 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-sm font-medium">Compute vs Performance · Forex Transformer family</div>
                <Mono className="text-[11px] text-muted-foreground">12 observed runs · $10 → $800 · target $4,820</Mono>
              </div>
              <div className="flex items-center gap-4 font-mono text-[11px]">
                <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" />observed</span>
                <span className="flex items-center gap-1.5"><span className="h-px w-4 border-t border-dashed border-predict" />projection</span>
                <DemoNote />
              </div>
            </div>
            {fit && <ScalingChart fit={fit} target={4820} height={300} xLabel="Compute ($, log)" unit="%" />}
          </div>
        </div>
      </section>

      <Section eyebrow="How it works" title="Evidence before expense.">
        <div className="grid gap-px overflow-hidden rounded-lg border bg-border md:grid-cols-4">
          {[
            ["Define", "State the problem, the metric that matters, and the large system you ultimately want."],
            ["Experiment", "Run a ladder of cheap experiments across model size, data and compute."],
            ["Fit", "Discover the scaling relationship from observed results — with honest uncertainty."],
            ["Decide", "Get a projected large-scale result, an interval, and a clear should-you-scale verdict."],
          ].map(([t, d], i) => (
            <div key={t} className="bg-background p-5"><Mono className="text-xs text-primary">{String(i + 1).padStart(2, "0")}</Mono><div className="mt-3 font-medium">{t}</div><p className="mt-1 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Experiment workflow" title="One loop, end to end.">
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {["DEFINE", "DATA", "MODEL", "EXPERIMENT", "RESULTS", "SCALING ANALYSIS", "LARGE-SCALE PREDICTION", "VALIDATION"].map((s, i, a) => (
            <span key={s} className="flex items-center gap-2"><span className="rounded border bg-surface px-2.5 py-1.5">{s}</span>{i < a.length - 1 && <span className="text-muted-foreground">→</span>}</span>
          ))}
        </div>
      </Section>

      <Section eyebrow="Supported AI workflows" title="Domain-agnostic by design.">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["Time-series forecasting", "Transformers, recurrent nets, TCNs and foundation forecasters.", true],
            ["Classification", "Regime detection, signal classification, image and text classifiers.", true],
            ["Custom architectures", "Bring a container. We track, compare and fit scaling curves.", true],
            ["Language models", "Sentiment and news features with compact LMs.", false],
            ["Blockchain analytics", "On-chain flow modelling — in research preview.", false],
            ["Reinforcement learning", "Policy scaling studies — planned.", false],
          ].map(([t, d, live]) => (
            <div key={t as string} className="panel p-4">
              <div className="flex items-center justify-between"><span className="text-sm font-medium">{t}</span><span className={`font-mono text-[10px] uppercase ${live ? "text-success" : "text-muted-foreground"}`}>{live ? "available" : "preview"}</span></div>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="First research domain" title="Forex AI, from tick to verdict.">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>The first domain on ScalarLab is foreign exchange: historical EURUSD, GBPUSD, USDJPY and XAUUSD tick and candle data, trained into direction models, evaluated as predictions and as strategy backtests.</p>
            {["Walk-forward, time-split and purged evaluation", "Spread, slippage and commission modelling", "Accuracy, Sharpe, profit factor and drawdown side by side", "Scaling fits per metric — not just loss"].map((t) => (
              <div key={t} className="flex gap-2 text-foreground"><Check className="mt-0.5 size-4 text-primary" />{t}</div>
            ))}
          </div>
          <div className="panel p-4 font-mono text-xs leading-6">
            <div className="text-muted-foreground"># pipeline</div>
            <div>EURUSD tick data <span className="text-muted-foreground">(2022–2026, 1.28B rows)</span></div>
            <div>→ train Transformer <span className="text-muted-foreground">(100M, ctx 512)</span></div>
            <div>→ predict 10-min direction</div>
            <div>→ evaluate: acc <span className="text-primary">57.8%</span> · f1 57.2</div>
            <div>→ strategy: sharpe <span className="text-primary">1.12</span> · PF 1.38 · DD 11.4%</div>
            <div>→ compare across 12 experiments</div>
            <div className="text-predict">→ estimate 5B: 63.4% [61.1, 65.2] @ 82% conf.</div>
            <div className="mt-2 text-[10px] text-warning">Fictional demo results. Not trading advice.</div>
          </div>
        </div>
      </Section>

      <Section eyebrow="Scaling intelligence" title="Why small experiments matter.">
        <div className="grid gap-3 md:grid-cols-3">
          {[
            ["$800", "spent on 12 small experiments"],
            ["$4,820", "projected cost of the 5B run you were about to commit"],
            ["0.6 pt", "mean absolute error on validated predictions"],
          ].map(([v, l]) => (
            <div key={l} className="panel p-5"><Mono className="text-3xl text-primary">{v}</Mono><p className="mt-2 text-sm text-muted-foreground">{l}</p></div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Example experiment" title="EURUSD Direction Transformer">
        <div className="panel grid gap-px overflow-hidden bg-border md:grid-cols-4">
          {[["Objective", "EURUSD direction, 10 min"], ["Dataset", "Tick 2022–2026"], ["Model", "Transformer · 1B"], ["Current best", "57.8% acc"], ["Projected (5B)", "63.4%"], ["Interval", "61.1 – 65.2%"], ["Confidence", "82%"], ["Verdict", "Likely worthwhile"]].map(([k, v], i) => (
            <div key={k} className="bg-surface p-4"><div className="label-xs">{k}</div><div className={`mt-1 font-mono text-sm ${i === 4 ? "text-predict" : i === 7 ? "text-success" : ""}`}>{v}</div></div>
          ))}
        </div>
      </Section>

      <section className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-5 py-20 md:flex-row md:items-center md:justify-between">
          <h2 className="max-w-xl text-3xl font-semibold tracking-tight">Find out what your AI is likely to achieve at scale — before committing expensive compute.</h2>
          <Button asChild size="lg"><Link to="/signup">Start Experiment <ArrowRight /></Link></Button>
        </div>
      </section>
    </MarketingLayout>
  );
}

function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="label-xs mb-2">{eyebrow}</div>
        <h2 className="mb-8 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h2>
        {children}
      </div>
    </section>
  );
}
