import type {
  AuditLog, ComputeResource, Dataset, Deployment, Experiment, Metrics, Model, Organization,
  Prediction, ResearchNote, Run, TrainingConfig, User,
} from "@/types";

/* Deterministic PRNG so SSR and client render identical mock data. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
const r = rng(42);
const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)];
const round = (n: number, d = 2) => Math.round(n * 10 ** d) / 10 ** d;

/** Synthesizes plausible, clearly fictional metrics from compute (USD). */
export function metricsFor(compute: number, seed = 1, base = 0.535): Metrics {
  const g = rng(seed);
  const acc = Math.min(0.67, base + 0.022 * Math.log10(Math.max(compute, 1)) + (g() - 0.5) * 0.008);
  const sharpe = round(0.4 + (acc - 0.53) * 9 + (g() - 0.5) * 0.15);
  return {
    accuracy: round(acc * 100, 1),
    precision: round(acc * 100 + (g() - 0.5) * 3, 1),
    recall: round(acc * 100 - 1 + (g() - 0.5) * 4, 1),
    f1: round(acc * 100 - 0.6, 1),
    profitFactor: round(Math.min(1.8, 0.9 + (acc - 0.53) * 6 + g() * 0.08)),
    sharpe: Math.min(1.8, Math.max(0.4, sharpe)),
    maxDrawdown: round(Math.max(5, 25 - (acc - 0.53) * 120 + g() * 3), 1),
    netReturn: round((acc - 0.52) * 260 + (g() - 0.5) * 3, 1),
  };
}

export const defaultTraining: TrainingConfig = {
  trainPct: 70, valPct: 15, testPct: 15, epochs: 20, batchSize: 256,
  learningRate: 0.0003, seqLength: 512, computeBudget: 50, gpu: "A100 80GB",
};

export const datasets: Dataset[] = [
  { id: "ds-eurusd-tick", name: "EURUSD Tick Data 2022–2026", domain: "Forex", symbol: "EURUSD", rows: 1_284_000_000, sizeGB: 182, range: "2022-01 → 2026-06", frequency: "Tick", quality: 97, source: "Mock Broker Feed", status: "ready", owner: "Ada Park", versions: 4 },
  { id: "ds-xauusd-tick", name: "XAUUSD Tick Data", domain: "Forex", symbol: "XAUUSD", rows: 642_000_000, sizeGB: 96, range: "2021-03 → 2026-06", frequency: "Tick", quality: 94, source: "Mock Broker Feed", status: "ready", owner: "Ada Park", versions: 2 },
  { id: "ds-eurusd-1m", name: "EURUSD 1m Candles", domain: "Forex", symbol: "EURUSD", rows: 8_400_000, sizeGB: 1.2, range: "2010-01 → 2026-06", frequency: "1 minute", quality: 99, source: "Public OHLC Archive", status: "ready", owner: "Liam Chen", versions: 6 },
  { id: "ds-gbpusd-5m", name: "GBPUSD 5m Candles", domain: "Forex", symbol: "GBPUSD", rows: 1_150_000, sizeGB: 0.3, range: "2015-01 → 2026-06", frequency: "5 minute", quality: 96, source: "Public OHLC Archive", status: "ready", owner: "Liam Chen", versions: 3 },
  { id: "ds-usdjpy-tick", name: "USDJPY Tick Data", domain: "Forex", symbol: "USDJPY", rows: 910_000_000, sizeGB: 131, range: "2022-01 → 2026-06", frequency: "Tick", quality: 91, source: "Mock Broker Feed", status: "processing", owner: "Noor Haddad", versions: 1 },
  { id: "ds-synth", name: "Synthetic Forex Dataset", domain: "Forex", rows: 50_000_000, sizeGB: 7.4, range: "Generated", frequency: "Tick", quality: 100, source: "Synthetic Generator", status: "ready", owner: "Ada Park", versions: 2 },
  { id: "ds-binary", name: "Binary Options Signals", domain: "Binary", rows: 22_000_000, sizeGB: 3.1, range: "2023-01 → 2026-05", frequency: "1 minute", quality: 88, source: "Mock Exchange", status: "ready", owner: "Noor Haddad", versions: 1 },
  { id: "ds-cifar", name: "CIFAR-10 (demo)", domain: "Vision", rows: 60_000, sizeGB: 0.17, range: "Static", frequency: "—", quality: 100, source: "Public Benchmark", status: "ready", owner: "Liam Chen", versions: 1 },
];

export const models: Model[] = [
  { id: "m-transformer-s", name: "Transformer", category: "Time Series", architecture: "Decoder-only, RoPE, 12 layers", params: 100, context: 512, tasks: ["Direction", "Regression", "Classification"], computePerEpoch: 1.4, description: "General sequence transformer tuned for tick and candle streams.", owner: "Platform", version: "v4.2", usage: 412, status: "active" },
  { id: "m-lstm", name: "LSTM", category: "Time Series", architecture: "2-layer stacked LSTM", params: 12, context: 256, tasks: ["Direction", "Regression"], computePerEpoch: 0.3, description: "Recurrent baseline. Cheap, fast, strong on short horizons.", owner: "Platform", version: "v2.0", usage: 288, status: "active" },
  { id: "m-gru", name: "GRU", category: "Time Series", architecture: "3-layer GRU, layer norm", params: 9, context: 256, tasks: ["Direction"], computePerEpoch: 0.25, description: "Lighter recurrent unit with comparable short-horizon accuracy.", owner: "Platform", version: "v1.3", usage: 131, status: "active" },
  { id: "m-tcn", name: "Temporal CNN", category: "Time Series", architecture: "Dilated causal conv, 10 blocks", params: 24, context: 1024, tasks: ["Direction", "Regime"], computePerEpoch: 0.5, description: "Dilated convolutions with long receptive fields.", owner: "Platform", version: "v1.1", usage: 97, status: "active" },
  { id: "m-chronos", name: "Chronos", category: "Time Series", architecture: "T5-based tokenized forecaster", params: 710, context: 512, tasks: ["Forecasting"], computePerEpoch: 6.8, description: "Time-series foundation model (demo integration).", owner: "Community", version: "large", usage: 64, status: "beta" },
  { id: "m-timesfm", name: "TimesFM", category: "Time Series", architecture: "Patched decoder foundation model", params: 200, context: 2048, tasks: ["Forecasting"], computePerEpoch: 2.9, description: "Patch-based foundation forecaster (demo integration).", owner: "Community", version: "1.0", usage: 51, status: "beta" },
  { id: "m-moirai", name: "Moirai", category: "Time Series", architecture: "Masked encoder, any-variate", params: 311, context: 4096, tasks: ["Forecasting", "Multivariate"], computePerEpoch: 3.6, description: "Universal multivariate forecaster (demo integration).", owner: "Community", version: "1.1", usage: 22, status: "beta" },
  { id: "m-vit", name: "ViT-S", category: "Vision", architecture: "Vision Transformer, patch 16", params: 22, context: 196, tasks: ["Image classification"], computePerEpoch: 0.9, description: "Small vision transformer for demo workflows.", owner: "Platform", version: "v1", usage: 18, status: "active" },
  { id: "m-lm-small", name: "Small LM", category: "Language", architecture: "GPT-style decoder", params: 125, context: 2048, tasks: ["Text classification", "Sentiment"], computePerEpoch: 2.1, description: "Compact language model for news-sentiment features.", owner: "Platform", version: "v0.9", usage: 33, status: "beta" },
  { id: "m-custom", name: "Custom Model", category: "Custom", architecture: "Bring your own (PyTorch)", params: 0, context: 0, tasks: ["Any"], computePerEpoch: 1, description: "Upload a container or script with your own architecture.", owner: "You", version: "—", usage: 9, status: "active" },
];

const owners = ["Ada Park", "Liam Chen", "Noor Haddad", "Mateo Ruiz"];

/* Forex Transformer family: the scaling ladder (params M, data GB, compute $) */
const ladder: [number, number, number][] = [
  [50, 10, 10], [80, 20, 18], [100, 25, 24], [150, 40, 42], [200, 60, 70], [300, 90, 110],
  [400, 120, 160], [500, 180, 240], [650, 250, 330], [800, 320, 460], [1000, 400, 620], [1000, 500, 800],
];

function mkExp(i: number, p: Partial<Experiment> & Pick<Experiment, "name" | "params" | "dataGB" | "compute">): Experiment {
  const status = p.status ?? "completed";
  return {
    id: p.id ?? `exp-${(1040 + i).toString(36)}`,
    domain: "Forex",
    family: "Forex Transformer",
    objective: "Predict EURUSD price direction over the next 10 minutes.",
    primaryMetric: "accuracy",
    modelId: "m-transformer-s",
    datasetId: "ds-eurusd-tick",
    owner: owners[i % owners.length],
    createdAt: new Date(Date.UTC(2026, 8, 1 + i, 9 + (i % 8))).toISOString(),
    training: defaultTraining,
    split: { train: "2022–2024", val: "2025", test: "2026" },
    target: { params: 5000, dataGB: 10000, computeUSD: 5000, budgetUSD: 6000 },
    strategy: { target: "10-min direction", entryRule: "p(up) > 0.56", exitRule: "Horizon or opposite signal", stopLoss: 12, takeProfit: 18, positionSizing: "Fixed fractional 1%", spread: 0.6, slippage: 0.2, commission: 3.5, evaluation: "Walk Forward" },
    ...p,
    status,
    metrics: status === "completed" || status === "archived" ? (p.metrics ?? metricsFor(p.compute, i + 7)) : p.metrics,
  };
}

export const experiments: Experiment[] = [
  mkExp(0, { id: "exp-eurusd-tf4", name: "EURUSD Direction Transformer", params: 1000, dataGB: 500, compute: 800 }),
  ...ladder.slice(0, 11).map(([params, dataGB, compute], i) =>
    mkExp(i + 1, { name: `Forex Transformer ${params >= 1000 ? params / 1000 + "B" : params + "M"} · ${dataGB}GB`, params, dataGB, compute }),
  ),
  mkExp(20, { id: "exp-regime", name: "Forex Regime Classifier", family: "Regime TCN", modelId: "m-tcn", datasetId: "ds-eurusd-1m", params: 24, dataGB: 1.2, compute: 36, primaryMetric: "f1", objective: "Classify trending vs ranging regimes on 1m candles." }),
  mkExp(21, { id: "exp-xau", name: "XAUUSD Short-Term Predictor", family: "Gold LSTM", modelId: "m-lstm", datasetId: "ds-xauusd-tick", params: 12, dataGB: 40, compute: 58, objective: "Predict XAUUSD 5-minute direction." , status: "running" }),
  mkExp(22, { id: "exp-momentum", name: "Multi-Pair Momentum Model", family: "Momentum GRU", modelId: "m-gru", datasetId: "ds-gbpusd-5m", params: 9, dataGB: 0.3, compute: 14, objective: "Rank momentum across EURUSD, GBPUSD, USDJPY." }),
  mkExp(23, { id: "exp-ensemble", name: "Forex Signal Ensemble", family: "Ensemble", modelId: "m-timesfm", datasetId: "ds-eurusd-1m", params: 200, dataGB: 1.2, compute: 120, primaryMetric: "sharpe", status: "queued", objective: "Blend TimesFM forecasts with transformer signals." }),
  mkExp(24, { id: "exp-binary", name: "Binary Signal Model", domain: "Binary", family: "Binary LSTM", modelId: "m-lstm", datasetId: "ds-binary", params: 12, dataGB: 3.1, compute: 22, objective: "Predict 1-minute binary outcome." }),
  mkExp(25, { id: "exp-gold", name: "Gold Movement Predictor", family: "Gold LSTM", modelId: "m-tcn", datasetId: "ds-xauusd-tick", params: 24, dataGB: 20, compute: 30, status: "failed", objective: "Predict XAUUSD 15-minute moves." }),
  mkExp(26, { id: "exp-vision", name: "Image Classifier Demo", domain: "Vision", family: "ViT", modelId: "m-vit", datasetId: "ds-cifar", params: 22, dataGB: 0.17, compute: 8, primaryMetric: "accuracy", objective: "Demo: classify CIFAR-10 images.", metrics: { accuracy: 91.2, precision: 91.0, recall: 90.8, f1: 90.9, profitFactor: 0, sharpe: 0, maxDrawdown: 0, netReturn: 0 } }),
];

const gpus = ["A100 80GB", "H100 80GB", "RTX 4090", "L40S"];
export const runs: Run[] = experiments.flatMap((e, i) => {
  const n = 1 + (i % 3);
  return Array.from({ length: n }, (_, k) => {
    const last = k === n - 1;
    const status: Run["status"] =
      last && e.status === "running" ? "running" : last && e.status === "queued" ? "queued" : last && e.status === "failed" ? "failed" : "completed";
    return {
      id: `run-${(8800 + i * 7 + k).toString(16)}`,
      experimentId: e.id,
      status,
      progress: status === "completed" ? 100 : status === "running" ? 62 : status === "failed" ? 38 : 0,
      durationMin: Math.round(8 + e.compute * 0.9 + k * 4),
      gpu: pick(gpus),
      compute: round(e.compute / n),
      metric: status === "completed" ? e.metrics?.accuracy : undefined,
      createdAt: new Date(Date.parse(e.createdAt) + k * 3600_000).toISOString(),
      user: e.owner,
    };
  });
});

export const predictions: Prediction[] = [
  { id: "pred-5b", name: "5B Forex Transformer", experimentId: "exp-eurusd-tf4", family: "Forex Transformer", metric: "accuracy", targetParams: 5000, targetDataGB: 10000, targetCompute: 4820, predicted: 63.4, low: 61.1, high: 65.2, confidence: 82, status: "awaiting", createdAt: "2026-09-28T10:00:00Z", experimentsUsed: 12 },
  { id: "pred-2b", name: "2B Forex Transformer", experimentId: "exp-eurusd-tf4", family: "Forex Transformer", metric: "accuracy", targetParams: 2000, targetDataGB: 1000, targetCompute: 1600, predicted: 61.9, low: 60.6, high: 63.0, confidence: 86, status: "validated", actual: 61.4, createdAt: "2026-09-12T10:00:00Z", experimentsUsed: 10 },
  { id: "pred-1b-sharpe", name: "1B Transformer · Sharpe", experimentId: "exp-eurusd-tf4", family: "Forex Transformer", metric: "sharpe", targetParams: 1000, targetDataGB: 500, targetCompute: 800, predicted: 1.31, low: 1.12, high: 1.48, confidence: 78, status: "validated", actual: 1.27, createdAt: "2026-09-02T10:00:00Z", experimentsUsed: 8 },
  { id: "pred-regime", name: "Regime TCN 200M", experimentId: "exp-regime", family: "Regime TCN", metric: "f1", targetParams: 200, targetDataGB: 20, targetCompute: 300, predicted: 64.0, low: 61.5, high: 66.2, confidence: 64, status: "invalidated", actual: 58.9, createdAt: "2026-08-21T10:00:00Z", experimentsUsed: 5 },
  { id: "pred-gold", name: "Gold LSTM 120M", experimentId: "exp-xau", family: "Gold LSTM", metric: "accuracy", targetParams: 120, targetDataGB: 400, targetCompute: 520, predicted: 58.2, low: 56.4, high: 59.8, confidence: 71, status: "predicted", createdAt: "2026-09-30T10:00:00Z", experimentsUsed: 4 },
  { id: "pred-momo", name: "Momentum GRU 90M", experimentId: "exp-momentum", family: "Momentum GRU", metric: "accuracy", targetParams: 90, targetDataGB: 30, targetCompute: 140, predicted: 57.1, low: 55.8, high: 58.3, confidence: 74, status: "validated", actual: 57.6, createdAt: "2026-08-10T10:00:00Z", experimentsUsed: 6 },
];

export const deployments: Deployment[] = [
  { id: "dep-1", name: "EURUSD Signal Model v4", environment: "Production", version: "v4.2.1", status: "healthy", endpoint: "https://api.scalar.dev/v1/signal/eurusd", requests: 1_284_022, latencyMs: 42 },
  { id: "dep-2", name: "Regime Classifier v2", environment: "Staging", version: "v2.0.3", status: "healthy", endpoint: "https://staging.scalar.dev/v1/regime", requests: 88_410, latencyMs: 31 },
  { id: "dep-3", name: "XAUUSD Predictor", environment: "Shadow", version: "v0.9.0", status: "degraded", endpoint: "https://shadow.scalar.dev/v1/xau", requests: 12_090, latencyMs: 118 },
];

export const computePool: ComputeResource[] = [
  { gpu: "H100 80GB", total: 64, available: 9, running: 51, queued: 14, utilization: 87, pricePerHour: 3.2 },
  { gpu: "A100 80GB", total: 128, available: 31, running: 92, queued: 6, utilization: 74, pricePerHour: 1.9 },
  { gpu: "L40S", total: 48, available: 20, running: 26, queued: 2, utilization: 58, pricePerHour: 1.1 },
  { gpu: "RTX 4090", total: 96, available: 44, running: 50, queued: 0, utilization: 49, pricePerHour: 0.45 },
];

const first = ["Ada", "Liam", "Noor", "Mateo", "Yuki", "Elena", "Kofi", "Priya", "Jonas", "Sara", "Omar", "Mei", "Lucas", "Ines", "Tariq", "Hana", "Felix", "Zara", "Diego", "Anya"];
const last = ["Park", "Chen", "Haddad", "Ruiz", "Tanaka", "Rossi", "Mensah", "Shah", "Berg", "Kim", "Farouk", "Lin", "Moreau", "Silva", "Aziz", "Sato", "Wagner", "Khan", "Lopez", "Ivanova"];
export const organizations: Organization[] = [
  { id: "org-1", name: "Quanta Research", users: 14, experiments: 212, compute: 18_420, plan: "Lab", revenue: 4_210, status: "active" },
  { id: "org-2", name: "Northwind Capital Lab", users: 32, experiments: 640, compute: 61_200, plan: "Enterprise", revenue: 22_400, status: "active" },
  { id: "org-3", name: "Parallax AI", users: 6, experiments: 88, compute: 2_140, plan: "Team", revenue: 690, status: "active" },
  { id: "org-4", name: "Solo Researchers", users: 410, experiments: 1_902, compute: 9_880, plan: "Researcher", revenue: 0, status: "active" },
  { id: "org-5", name: "Meridian Systems", users: 9, experiments: 41, compute: 1_120, plan: "Team", revenue: 441, status: "trial" },
  { id: "org-6", name: "Halcyon Quant", users: 18, experiments: 301, compute: 12_700, plan: "Lab", revenue: 3_380, status: "past_due" },
];
export const users: User[] = Array.from({ length: 48 }, (_, i) => {
  const name = `${first[i % 20]} ${last[(i * 7) % 20]}`;
  return {
    id: `usr-${1000 + i}`,
    name,
    email: `${name.toLowerCase().replace(" ", ".")}@example.dev`,
    organization: organizations[i % organizations.length].name,
    role: i === 0 ? "admin" : "researcher",
    experiments: Math.floor(r() * 90),
    compute: round(r() * 3200),
    status: i % 13 === 5 ? "suspended" : i % 9 === 4 ? "invited" : "active",
    createdAt: new Date(Date.UTC(2025, i % 12, 1 + (i % 27))).toISOString(),
  };
});

const actions = ["experiment.create", "run.start", "run.stop", "dataset.upload", "prediction.save", "prediction.validate", "user.login", "apikey.create", "member.invite", "deployment.promote"];
export const auditLogs: AuditLog[] = Array.from({ length: 60 }, (_, i) => ({
  id: `log-${i}`,
  timestamp: new Date(Date.UTC(2026, 9, 7, 18, 30) - i * 1_370_000).toISOString(),
  user: users[i % users.length].email,
  action: actions[i % actions.length],
  resource: i % 2 ? experiments[i % experiments.length].id : runs[i % runs.length].id,
  ip: `10.${(i * 13) % 255}.${(i * 7) % 255}.${(i * 3) % 255}`,
  status: i % 11 === 3 ? "failure" : "success",
}));

export const notes: ResearchNote[] = [
  { id: "n1", kind: "Hypothesis", body: "Increasing model size improves directional accuracy.", createdAt: "2026-09-02T09:00:00Z", attachments: ["exp-eurusd-tf4"] },
  { id: "n2", kind: "Observation", body: "Performance improvement begins flattening after 500M parameters.", createdAt: "2026-09-18T14:20:00Z", attachments: ["Scaling chart · accuracy vs compute"] },
  { id: "n3", kind: "Conclusion", body: "Scaling beyond 1B may not justify additional compute.", createdAt: "2026-10-01T11:45:00Z", attachments: [] },
];

/* Time series helpers for charts */
export function series(n: number, seed: number, start: number, drift: number, vol: number) {
  const g = rng(seed);
  let v = start;
  return Array.from({ length: n }, (_, i) => {
    v += drift + (g() - 0.5) * vol;
    return { i, v: round(v, 3) };
  });
}

export const featureImportance = [
  { feature: "ret_1m_lag", value: 0.21 }, { feature: "spread_bps", value: 0.16 }, { feature: "vol_15m", value: 0.14 },
  { feature: "orderflow_imb", value: 0.12 }, { feature: "session_hour", value: 0.1 }, { feature: "ema_cross", value: 0.08 },
  { feature: "rsi_14", value: 0.07 }, { feature: "dxy_corr", value: 0.05 },
];
