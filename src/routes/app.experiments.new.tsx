import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader, Panel, Field, NativeSelect, KV, Modal, Mono } from "@/components/lab";
import { DatasetCard, ModelCard } from "@/components/cards";
import { useStore, api } from "@/lib/store";
import { defaultTraining, models } from "@/data/mock";
import { computePool } from "@/data/mock";
import { metricLabel } from "@/lib/scaling";
import { gb, params, usd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Domain, MetricKey, StrategyConfig, TrainingConfig } from "@/types";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/experiments/new")({
  head: () => seo("New experiment", "Define, configure and launch a new scaling experiment."),
  component: Wizard,
});

const steps = ["Define problem", "Dataset", "Model", "Training", "Strategy / Evaluation", "Scale target"];

/** Wizard — six-step experiment builder backed by local state. */
function Wizard() {
  const nav = useNavigate();
  const datasets = useStore((s) => s.datasets);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("EURUSD Direction Transformer v5");
  const [domain, setDomain] = useState<Domain>("Forex");
  const [objective, setObjective] = useState("Predict EURUSD direction over the next 10 minutes.");
  const [metric, setMetric] = useState<MetricKey>("accuracy");
  const [datasetId, setDatasetId] = useState("ds-eurusd-tick");
  const [modelId, setModelId] = useState("m-transformer-s");
  const [t, setT] = useState<TrainingConfig>(defaultTraining);
  const [st, setSt] = useState<StrategyConfig>({ target: "10-min direction", entryRule: "p(up) > 0.56", exitRule: "Horizon or opposite signal", stopLoss: 12, takeProfit: 18, positionSizing: "Fixed fractional 1%", spread: 0.6, slippage: 0.2, commission: 3.5, evaluation: "Walk Forward" });
  const [target, setTarget] = useState({ params: 5000, dataGB: 10000, computeUSD: 5000, budgetUSD: 6000 });
  const [connect, setConnect] = useState(false);

  const model = models.find((m) => m.id === modelId)!;
  const ds = datasets.find((d) => d.id === datasetId);
  const price = computePool.find((g) => g.gpu === t.gpu)?.pricePerHour ?? 1.9;
  const hours = +((model.computePerEpoch * t.epochs * Math.max(0.2, Math.log10((ds?.sizeGB ?? 10) + 1))) / price * 1.2).toFixed(1);
  const cost = Math.min(t.computeBudget, +(hours * price).toFixed(2));
  const num = (k: keyof TrainingConfig) => (e: React.ChangeEvent<HTMLInputElement>) => setT({ ...t, [k]: +e.target.value });
  const snum = (k: keyof StrategyConfig) => (e: React.ChangeEvent<HTMLInputElement>) => setSt({ ...st, [k]: +e.target.value });

  const create = () => {
    const id = api.createExperiment({
      name, domain, objective, primaryMetric: metric, modelId, datasetId, family: domain === "Forex" && modelId === "m-transformer-s" ? "Forex Transformer" : `${model.name} family`,
      params: model.params || 50, dataGB: ds?.sizeGB ?? 10, compute: cost, training: t, strategy: domain === "Forex" ? st : undefined, target,
      split: { train: "2022–2024", val: "2025", test: "2026" },
    });
    toast.success("Experiment created", { description: "Run queued — watch it progress live." });
    nav({ to: "/app/experiments/$id", params: { id } });
  };

  return (
    <>
      <PageHeader eyebrow="Experiments / New" title="New experiment" description="Every experiment is evidence for a larger system." />
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <ol className="space-y-1">
          {steps.map((s, i) => (
            <li key={s}><button onClick={() => setStep(i)} className={cn("flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm", i === step ? "bg-accent" : "text-muted-foreground hover:text-foreground")}>
              <span className={cn("grid size-5 place-items-center rounded-full border font-mono text-[10px]", i < step && "border-primary bg-primary text-primary-foreground", i === step && "border-primary text-primary")}>{i < step ? <Check className="size-3" /> : i + 1}</span>{s}
            </button></li>
          ))}
        </ol>
        <div className="space-y-4">
          <Panel title={`Step ${step + 1} — ${steps[step]}`}>
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Experiment name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
                <Field label="Primary metric"><NativeSelect className="h-9 w-full" value={metric} onChange={(v) => setMetric(v as MetricKey)} options={Object.entries(metricLabel).map(([value, label]) => ({ value, label }))} /></Field>
                <div className="md:col-span-2"><Field label="Research domain">
                  <div className="flex flex-wrap gap-2">{(["Forex", "Binary", "Blockchain", "General AI", "Custom"] as Domain[]).map((d) => <button key={d} type="button" onClick={() => setDomain(d)} className={cn("rounded-md border px-3 py-1.5 text-xs", domain === d ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{d}</button>)}</div>
                </Field></div>
                <div className="md:col-span-2"><Field label="Objective"><Textarea value={objective} onChange={(e) => setObjective(e.target.value)} rows={3} /></Field></div>
              </div>
            )}
            {step === 1 && (
              <>
                <div className="grid gap-3 md:grid-cols-2">{datasets.filter((d) => domain === "Custom" || domain === "General AI" || d.domain === domain).map((d) => <DatasetCard key={d.id} d={d} selected={d.id === datasetId} onSelect={() => setDatasetId(d.id)} />)}</div>
                <Button variant="outline" className="mt-4" onClick={() => setConnect(true)}>Connect Dataset</Button>
                <ConnectDataset open={connect} onOpenChange={setConnect} onCreated={setDatasetId} domain={domain} />
              </>
            )}
            {step === 2 && <div className="grid gap-3 md:grid-cols-3">{models.map((m) => <ModelCard key={m.id} m={m} selected={m.id === modelId} onSelect={() => setModelId(m.id)} />)}</div>}
            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Training data %"><Input type="number" value={t.trainPct} onChange={num("trainPct")} /></Field>
                <Field label="Validation %"><Input type="number" value={t.valPct} onChange={num("valPct")} /></Field>
                <Field label="Test %"><Input type="number" value={t.testPct} onChange={num("testPct")} /></Field>
                <Field label="Epochs"><Input type="number" value={t.epochs} onChange={num("epochs")} /></Field>
                <Field label="Batch size"><Input type="number" value={t.batchSize} onChange={num("batchSize")} /></Field>
                <Field label="Learning rate"><Input type="number" step="0.0001" value={t.learningRate} onChange={num("learningRate")} /></Field>
                <Field label="Sequence length"><Input type="number" value={t.seqLength} onChange={num("seqLength")} /></Field>
                <Field label="Compute budget ($)"><Input type="number" value={t.computeBudget} onChange={num("computeBudget")} /></Field>
                <Field label="GPU type"><NativeSelect className="h-9 w-full" value={t.gpu} onChange={(gpu) => setT({ ...t, gpu })} options={computePool.map((g) => g.gpu)} /></Field>
                <div className="panel col-span-full grid grid-cols-2 gap-4 bg-background p-4 md:grid-cols-3">
                  <div><div className="label-xs">Est. training time</div><Mono className="text-lg">{hours}h</Mono></div>
                  <div><div className="label-xs">Est. compute cost</div><Mono className="text-lg text-primary">{usd(cost)}</Mono></div>
                  <div><div className="label-xs">GPU rate</div><Mono className="text-lg">${price}/h</Mono></div>
                  {t.trainPct + t.valPct + t.testPct !== 100 && <p className="col-span-full text-xs text-warning">Splits should add up to 100%.</p>}
                </div>
              </div>
            )}
            {step === 4 && (domain === "Forex" ? (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Prediction target"><Input value={st.target} onChange={(e) => setSt({ ...st, target: e.target.value })} /></Field>
                <Field label="Entry rule"><Input value={st.entryRule} onChange={(e) => setSt({ ...st, entryRule: e.target.value })} /></Field>
                <Field label="Exit rule"><Input value={st.exitRule} onChange={(e) => setSt({ ...st, exitRule: e.target.value })} /></Field>
                <Field label="Stop loss (pips)"><Input type="number" value={st.stopLoss} onChange={snum("stopLoss")} /></Field>
                <Field label="Take profit (pips)"><Input type="number" value={st.takeProfit} onChange={snum("takeProfit")} /></Field>
                <Field label="Position sizing"><Input value={st.positionSizing} onChange={(e) => setSt({ ...st, positionSizing: e.target.value })} /></Field>
                <Field label="Spread (pips)"><Input type="number" step="0.1" value={st.spread} onChange={snum("spread")} /></Field>
                <Field label="Slippage (pips)"><Input type="number" step="0.1" value={st.slippage} onChange={snum("slippage")} /></Field>
                <Field label="Commission ($/lot)"><Input type="number" step="0.1" value={st.commission} onChange={snum("commission")} /></Field>
                <div className="col-span-full"><Field label="Evaluation method">
                  <div className="flex flex-wrap gap-2">{(["Walk Forward", "Time Split", "Purged Split"] as const).map((m) => <button key={m} type="button" onClick={() => setSt({ ...st, evaluation: m })} className={cn("rounded-md border px-3 py-1.5 text-xs", st.evaluation === m ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground")}>{m}</button>)}</div>
                </Field></div>
              </div>
            ) : <p className="text-sm text-muted-foreground">Strategy settings apply to Forex experiments. Evaluation will use a standard time split.</p>)}
            {step === 5 && (
              <div className="space-y-4">
                <p className="text-sm">What larger system are you trying to predict?</p>
                <div className="grid gap-4 md:grid-cols-2">
                  {([["params", "Target model size (M params)", model.params || 50, params], ["dataGB", "Target dataset size (GB)", ds?.sizeGB ?? 10, gb], ["computeUSD", "Target compute ($)", cost, usd], ["budgetUSD", "Target training budget ($)", t.computeBudget, usd]] as const).map(([k, label, cur, f]) => (
                    <div key={k} className="panel bg-background p-3">
                      <Field label={label}><Input type="number" value={target[k]} onChange={(e) => setTarget({ ...target, [k]: +e.target.value })} /></Field>
                      <Mono className="mt-2 block text-[11px] text-muted-foreground">current {f(cur)} → target <span className="text-predict">{f(target[k])}</span> · {(target[k] / Math.max(cur, 0.01)).toFixed(0)}×</Mono>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
          <Panel title="Summary"><KV cols={4} items={[["Name", name], ["Domain", domain], ["Dataset", ds?.name ?? "—"], ["Model", `${model.name} · ${params(model.params)}`], ["Metric", metricLabel[metric]], ["GPU", t.gpu], ["Est. cost", usd(cost)], ["Target", params(target.params)]]} /></Panel>
          <div className="flex justify-between">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < steps.length - 1 ? <Button onClick={() => setStep(step + 1)}>Continue</Button> : <Button onClick={create}>Create Experiment</Button>}
          </div>
        </div>
      </div>
    </>
  );
}

export function ConnectDataset({ open, onOpenChange, onCreated, domain = "Forex" }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated?: (id: string) => void; domain?: Domain }) {
  const [name, setName] = useState("GBPUSD Tick Data");
  const [source, setSource] = useState("S3 bucket");
  const [freq, setFreq] = useState("Tick");
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Connect dataset" description="Simulated — the dataset is added to your local workspace."
      footer={<Button onClick={() => {
        const id = api.addDataset({ name, domain, rows: 120_000_000, sizeGB: 18, range: "2023-01 → 2026-06", frequency: freq, quality: 93, source, status: "ready", owner: "You", versions: 1 });
        toast.success("Dataset connected", { description: name }); onCreated?.(id); onOpenChange(false);
      }}>Connect</Button>}>
      <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Source"><NativeSelect className="h-9 w-full" value={source} onChange={setSource} options={["S3 bucket", "GCS bucket", "Postgres", "Broker API", "Upload (Parquet/CSV)"]} /></Field>
        <Field label="Frequency"><NativeSelect className="h-9 w-full" value={freq} onChange={setFreq} options={["Tick", "1 minute", "5 minute", "1 hour", "Daily"]} /></Field>
      </div>
    </Modal>
  );
}
