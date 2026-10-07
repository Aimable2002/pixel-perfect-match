import type { Experiment, MetricKey } from "@/types";

export type Dimension = "compute" | "params" | "dataGB" | "steps";
export const dimensionLabel: Record<Dimension, string> = {
  compute: "Compute ($)", params: "Model size (M params)", dataGB: "Dataset size (GB)", steps: "Training steps (k)",
};
export const metricLabel: Record<MetricKey, string> = {
  accuracy: "Accuracy", precision: "Precision", recall: "Recall", f1: "F1", profitFactor: "Profit Factor",
  sharpe: "Sharpe", maxDrawdown: "Max Drawdown", netReturn: "Net Return",
};
export const metricUnit = (m: MetricKey) => (["accuracy", "precision", "recall", "f1", "maxDrawdown", "netReturn"].includes(m) ? "%" : "");

export const dimValue = (e: Experiment, d: Dimension) =>
  d === "steps" ? Math.round(e.compute * 12 + e.params * 0.4) : (e[d] as number);

export interface Fit {
  points: { x: number; y: number; id: string; name: string }[];
  slope: number;
  intercept: number;
  predict: (x: number) => number;
  interval: (x: number) => [number, number];
  confidence: (x: number) => number;
  earlySlope: number;
  lateSlope: number;
}

/** Log-linear fit: metric = a + b·log10(x). Simple, transparent, replaceable. */
export function fitFamily(exps: Experiment[], metric: MetricKey, dim: Dimension): Fit | null {
  const points = exps
    .filter((e) => e.metrics && (e.status === "completed" || e.status === "archived"))
    .map((e) => ({ x: dimValue(e, dim), y: e.metrics![metric], id: e.id, name: e.name }))
    .filter((p) => p.x > 0)
    .sort((a, b) => a.x - b.x);
  if (points.length < 3) return null;
  const reg = (ps: typeof points) => {
    const xs = ps.map((p) => Math.log10(p.x));
    const mx = xs.reduce((a, b) => a + b, 0) / xs.length;
    const my = ps.reduce((a, p) => a + p.y, 0) / ps.length;
    const sxx = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1e-9;
    const b = xs.reduce((a, x, i) => a + (x - mx) * (ps[i].y - my), 0) / sxx;
    return { b, a: my - b * mx, mx, sxx, xs };
  };
  const { a, b, mx, sxx, xs } = reg(points);
  const n = points.length;
  const resid = Math.sqrt(points.reduce((s, p, i) => s + (p.y - (a + b * xs[i])) ** 2, 0) / Math.max(1, n - 2)) || 0.2;
  const half = Math.floor(n / 2);
  const predict = (x: number) => a + b * Math.log10(x);
  const width = (x: number) => 1.96 * resid * Math.sqrt(1 + 1 / n + (Math.log10(x) - mx) ** 2 / sxx) + Math.abs(b) * 0.15 * Math.max(0, Math.log10(x) - xs[n - 1]);
  return {
    points, slope: b, intercept: a, predict,
    interval: (x) => [predict(x) - width(x), predict(x) + width(x)],
    confidence: (x) => Math.round(Math.max(40, Math.min(95, 96 - (width(x) / Math.max(Math.abs(predict(x)), 1)) * 400 - n * -0.5))),
    earlySlope: reg(points.slice(0, half + 1)).b,
    lateSlope: reg(points.slice(half)).b,
  };
}

export function verdict(fit: Fit, metric: MetricKey) {
  const down = metric === "maxDrawdown";
  const late = down ? -fit.lateSlope : fit.lateSlope;
  const early = down ? -fit.earlySlope : fit.earlySlope;
  if (late > 0 && late >= early * 0.55)
    return { tone: "success" as const, label: "Likely worthwhile", reason: "Observed performance continues improving across the tested compute range." };
  if (late > 0)
    return { tone: "warning" as const, label: "Marginal — proceed carefully", reason: "Gains are still positive but flattening at the high end of the tested range." };
  return { tone: "destructive" as const, label: "Not recommended", reason: "Performance has plateaued or regressed in the largest observed experiments." };
}

/** Builds evenly log-spaced curve points for plotting fit + interval. */
export function curve(fit: Fit, from: number, to: number, steps = 40) {
  const lf = Math.log10(from), lt = Math.log10(to);
  return Array.from({ length: steps + 1 }, (_, i) => {
    const x = 10 ** (lf + ((lt - lf) * i) / steps);
    const [lo, hi] = fit.interval(x);
    return { x, fit: fit.predict(x), band: [lo, hi] as [number, number] };
  });
}
