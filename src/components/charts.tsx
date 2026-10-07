import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ComposedChart, Line, LineChart, ReferenceArea, ReferenceDot,
  ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis, Legend,
} from "recharts";
import { curve, type Fit } from "@/lib/scaling";
import { cn } from "@/lib/utils";

export const C = {
  primary: "var(--primary)", predict: "var(--predict)", info: "var(--info)", success: "var(--success)",
  destructive: "var(--destructive)", warning: "var(--warning)", muted: "var(--muted-foreground)", grid: "var(--border)",
  c4: "var(--chart-4)",
};
const tip = {
  contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 11, fontFamily: "var(--font-mono)" },
  labelStyle: { color: "var(--muted-foreground)" },
  itemStyle: { color: "var(--foreground)" },
};
const axis = { stroke: C.muted, fontSize: 10, fontFamily: "var(--font-mono)", tickLine: false, axisLine: false } as const;
const fmtX = (v: number) => (v >= 1000 ? `${+(v / 1000).toFixed(1)}k` : `${+v.toFixed(v < 10 ? 1 : 0)}`);

/** ScalingChart — observed points, fitted curve, extrapolated region, interval band and target. */
export function ScalingChart({ fit, target, height = 320, xLabel, unit = "", compact }: { fit: Fit; target?: number; height?: number; xLabel?: string; unit?: string; compact?: boolean }) {
  const xs = fit.points.map((p) => p.x);
  const minX = Math.min(...xs) * 0.7;
  const maxObs = Math.max(...xs);
  const maxX = Math.max(maxObs * 1.4, (target ?? maxObs) * 1.4);
  const data = curve(fit, minX, maxX, 50).map((d) => ({
    ...d,
    obs: d.x <= maxObs ? d.fit : undefined,
    pred: d.x >= maxObs ? d.fit : undefined,
  }));
  const ty = target ? fit.predict(target) : undefined;
  const ys = [...fit.points.map((p) => p.y), ...data.flatMap((d) => d.band)];
  const pad = (Math.max(...ys) - Math.min(...ys)) * 0.1;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart margin={{ top: 10, right: 16, bottom: compact ? 0 : 18, left: -8 }} data={data}>
        <CartesianGrid stroke={C.grid} strokeDasharray="2 4" />
        <XAxis dataKey="x" type="number" scale="log" domain={[minX, maxX]} {...axis} tickFormatter={fmtX} allowDataOverflow
          label={!compact && xLabel ? { value: xLabel, position: "insideBottom", offset: -10, fill: C.muted, fontSize: 10 } : undefined} />
        <YAxis {...axis} domain={[+(Math.min(...ys) - pad).toFixed(2), +(Math.max(...ys) + pad).toFixed(2)]} tickFormatter={(v) => `${+v.toFixed(2)}${unit}`} width={52} />
        <ReferenceArea x1={minX} x2={maxObs} fill={C.primary} fillOpacity={0.04} />
        <ReferenceArea x1={maxObs} x2={maxX} fill={C.predict} fillOpacity={0.04} />
        <Tooltip {...tip} labelFormatter={(v) => `x = ${fmtX(Number(v))}`} formatter={(v: unknown) => (Array.isArray(v) ? v.map((n) => (+n).toFixed(2)).join(" – ") : (+(v as number)).toFixed(2))} />
        <Area dataKey="band" stroke="none" fill={C.predict} fillOpacity={0.12} name="Interval" isAnimationActive={false} />
        <Line dataKey="obs" stroke={C.primary} strokeWidth={1.5} dot={false} name="Fit (observed)" isAnimationActive={false} />
        <Line dataKey="pred" stroke={C.predict} strokeWidth={1.5} strokeDasharray="5 4" dot={false} name="Projection" isAnimationActive={false} />
        <Scatter data={fit.points} dataKey="y" fill={C.primary} name="Experiments" isAnimationActive={false} />
        {target && ty !== undefined && (
          <>
            <ReferenceLine x={target} stroke={C.predict} strokeDasharray="2 3" />
            <ReferenceDot x={target} y={ty} r={6} fill={C.predict} stroke="var(--background)" strokeWidth={2} />
          </>
        )}
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function MetricChart({ data, lines, height = 220, area, unit = "", xKey = "i", yDomain }: {
  data: Record<string, number | string>[]; lines: { key: string; color: string; name?: string; dashed?: boolean }[];
  height?: number; area?: boolean; unit?: string; xKey?: string; yDomain?: [number | string, number | string];
}) {
  const Chart = area ? AreaChart : LineChart;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <Chart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
        <defs>
          {lines.map((l) => (
            <linearGradient key={l.key} id={`g-${l.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={l.color} stopOpacity={0.25} />
              <stop offset="100%" stopColor={l.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid stroke={C.grid} strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey={xKey} {...axis} minTickGap={24} />
        <YAxis {...axis} width={48} domain={yDomain ?? ["auto", "auto"]} tickFormatter={(v) => `${+(+v).toFixed(2)}${unit}`} />
        <Tooltip {...tip} />
        {lines.length > 1 && <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />}
        {lines.map((l) =>
          area ? (
            <Area key={l.key} dataKey={l.key} name={l.name ?? l.key} stroke={l.color} fill={`url(#g-${l.key})`} strokeWidth={1.5} dot={false} isAnimationActive={false} strokeDasharray={l.dashed ? "4 3" : undefined} />
          ) : (
            <Line key={l.key} dataKey={l.key} name={l.name ?? l.key} stroke={l.color} strokeWidth={1.5} dot={false} isAnimationActive={false} strokeDasharray={l.dashed ? "4 3" : undefined} />
          ),
        )}
      </Chart>
    </ResponsiveContainer>
  );
}

export function Bars({ data, xKey, bars, height = 220, layout = "horizontal", stacked }: {
  data: Record<string, number | string>[]; xKey: string; bars: { key: string; color: string; name?: string }[]; height?: number; layout?: "horizontal" | "vertical"; stacked?: boolean;
}) {
  const v = layout === "vertical";
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 6, right: 8, bottom: 0, left: v ? 40 : -12 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="2 4" horizontal={!v} vertical={v} />
        {v ? <XAxis type="number" {...axis} /> : <XAxis dataKey={xKey} {...axis} />}
        {v ? <YAxis type="category" dataKey={xKey} {...axis} width={90} /> : <YAxis {...axis} width={48} />}
        <Tooltip {...tip} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
        {bars.length > 1 && <Legend wrapperStyle={{ fontSize: 11, fontFamily: "var(--font-mono)" }} />}
        {bars.map((b) => <Bar key={b.key} dataKey={b.key} name={b.name ?? b.key} fill={b.color} radius={2} stackId={stacked ? "s" : undefined} isAnimationActive={false} />)}
      </BarChart>
    </ResponsiveContainer>
  );
}

/** PredictionChart — predicted vs actual scatter with the ideal diagonal. */
export function PredictionChart({ points, height = 280 }: { points: { predicted: number; actual: number; name: string }[]; height?: number }) {
  const all = points.flatMap((p) => [p.predicted, p.actual]);
  const lo = Math.floor(Math.min(...all) - 1), hi = Math.ceil(Math.max(...all) + 1);
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 10, right: 16, bottom: 14, left: -8 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="2 4" />
        <XAxis type="number" dataKey="predicted" name="Predicted" domain={[lo, hi]} {...axis} label={{ value: "Predicted", position: "insideBottom", offset: -6, fill: C.muted, fontSize: 10 }} />
        <YAxis type="number" dataKey="actual" name="Actual" domain={[lo, hi]} {...axis} width={44} />
        <ZAxis range={[70, 70]} />
        <ReferenceLine segment={[{ x: lo, y: lo }, { x: hi, y: hi }]} stroke={C.muted} strokeDasharray="4 4" />
        <Tooltip {...tip} cursor={{ strokeDasharray: "3 3" }} />
        <Scatter data={points} fill={C.predict} isAnimationActive={false} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

export function ConfusionMatrix({ tp, fp, fn, tn }: { tp: number; fp: number; fn: number; tn: number }) {
  const max = Math.max(tp, fp, fn, tn);
  const cell = (v: number, good: boolean, label: string) => (
    <div className={cn("flex aspect-[1.6] flex-col items-center justify-center rounded-md border", good ? "border-primary/30" : "border-destructive/30")}
      style={{ background: `color-mix(in oklab, ${good ? "var(--primary)" : "var(--destructive)"} ${Math.round((v / max) * 28)}%, transparent)` }}>
      <span className="font-mono text-lg">{v.toLocaleString()}</span>
      <span className="label-xs">{label}</span>
    </div>
  );
  return (
    <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-xs">
      <span />
      <span className="label-xs text-center">Pred ↑</span>
      <span className="label-xs text-center">Pred ↓</span>
      <span className="label-xs">Actual ↑</span>{cell(tp, true, "TP")}{cell(fn, false, "FN")}
      <span className="label-xs">Actual ↓</span>{cell(fp, false, "FP")}{cell(tn, true, "TN")}
    </div>
  );
}

export function Sparkline({ data, color = C.primary, height = 32 }: { data: { v: number }[]; color?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}><Line dataKey="v" stroke={color} strokeWidth={1.25} dot={false} isAnimationActive={false} /></LineChart>
    </ResponsiveContainer>
  );
}
