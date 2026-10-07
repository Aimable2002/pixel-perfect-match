export type Domain = "Forex" | "Binary" | "Blockchain" | "General AI" | "Vision" | "Custom";
export type ExperimentStatus = "draft" | "queued" | "running" | "completed" | "failed" | "archived";
export type RunStatus = "queued" | "running" | "completed" | "failed";
export type PredictionStatus = "predicted" | "validated" | "invalidated" | "awaiting";

export interface User {
  id: string;
  name: string;
  email: string;
  organization: string;
  role: "researcher" | "admin";
  experiments: number;
  compute: number;
  status: "active" | "suspended" | "invited";
  createdAt: string;
}

export interface Organization {
  id: string;
  name: string;
  users: number;
  experiments: number;
  compute: number;
  plan: "Researcher" | "Team" | "Lab" | "Enterprise";
  revenue: number;
  status: "active" | "trial" | "past_due";
}

export interface Metrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  profitFactor: number;
  sharpe: number;
  maxDrawdown: number;
  netReturn: number;
}
export type MetricKey = keyof Metrics;

export interface Metric {
  key: MetricKey;
  label: string;
  value: number;
  unit?: string;
}

export interface ScaleTarget {
  params: number; // millions
  dataGB: number;
  computeUSD: number;
  budgetUSD: number;
}

export interface TrainingConfig {
  trainPct: number;
  valPct: number;
  testPct: number;
  epochs: number;
  batchSize: number;
  learningRate: number;
  seqLength: number;
  computeBudget: number;
  gpu: string;
}

export interface StrategyConfig {
  target: string;
  entryRule: string;
  exitRule: string;
  stopLoss: number;
  takeProfit: number;
  positionSizing: string;
  spread: number;
  slippage: number;
  commission: number;
  evaluation: "Walk Forward" | "Time Split" | "Purged Split";
}

export interface Experiment {
  id: string;
  name: string;
  domain: Domain;
  family: string;
  objective: string;
  primaryMetric: MetricKey;
  modelId: string;
  datasetId: string;
  status: ExperimentStatus;
  params: number; // millions
  dataGB: number;
  compute: number; // USD
  metrics?: Metrics;
  createdAt: string;
  owner: string;
  training: TrainingConfig;
  strategy?: StrategyConfig;
  target?: ScaleTarget;
  split: { train: string; val: string; test: string };
}

export interface Dataset {
  id: string;
  name: string;
  domain: Domain;
  symbol?: string;
  rows: number;
  sizeGB: number;
  range: string;
  frequency: string;
  quality: number;
  source: string;
  status: "ready" | "processing" | "error" | "disabled";
  owner: string;
  versions: number;
}

export interface Model {
  id: string;
  name: string;
  category: "Time Series" | "Language" | "Vision" | "Custom";
  architecture: string;
  params: number;
  context: number;
  tasks: string[];
  computePerEpoch: number;
  description: string;
  owner: string;
  version: string;
  usage: number;
  status: "active" | "deprecated" | "beta";
}

export interface Run {
  id: string;
  experimentId: string;
  status: RunStatus;
  progress: number;
  durationMin: number;
  gpu: string;
  compute: number;
  metric?: number;
  createdAt: string;
  user: string;
}

export interface Prediction {
  id: string;
  name: string;
  experimentId: string;
  family: string;
  metric: MetricKey;
  targetParams: number;
  targetDataGB: number;
  targetCompute: number;
  predicted: number;
  low: number;
  high: number;
  confidence: number;
  status: PredictionStatus;
  actual?: number;
  createdAt: string;
  experimentsUsed: number;
}

export interface Deployment {
  id: string;
  name: string;
  environment: "Production" | "Staging" | "Shadow";
  version: string;
  status: "healthy" | "degraded" | "down";
  endpoint: string;
  requests: number;
  latencyMs: number;
}

export interface ComputeResource {
  gpu: string;
  total: number;
  available: number;
  running: number;
  queued: number;
  utilization: number;
  pricePerHour: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  ip: string;
  status: "success" | "failure";
}

export interface ResearchNote {
  id: string;
  kind: "Hypothesis" | "Observation" | "Conclusion" | "Note";
  body: string;
  createdAt: string;
  attachments: string[];
}
