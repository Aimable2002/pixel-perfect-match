import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { PageHeader, Panel, Mono, RunStatus } from "@/components/lab";
import { Bars, C } from "@/components/charts";
import { useStore } from "@/lib/store";
import { metricLabel, metricUnit } from "@/lib/scaling";
import { params, usd, gb } from "@/lib/format";
import type { MetricKey } from "@/types";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/compare")({
  validateSearch: z.object({ ids: z.string().optional() }),
  head: () => seo("Compare experiments", "Side-by-side comparison of experiment metrics and configuration."),
  component: Compare,
});

const keys: MetricKey[] = ["accuracy", "precision", "recall", "f1", "profitFactor", "sharpe", "maxDrawdown", "netReturn"];
const colors = [C.primary, C.info, C.predict, C.c4, C.success];

function Compare() {
  const { ids } = Route.useSearch();
  const all = useStore((s) => s.experiments);
  const exps = (ids?.split(",") ?? []).map((id) => all.find((e) => e.id === id)).filter((e) => !!e);
  const list = exps.length ? exps : all.filter((e) => e.metrics).slice(0, 3);
  return (
    <>
      <PageHeader eyebrow="Experiments / Compare" title={`Comparing ${list.length} experiments`} description="Automated comparison. Best value per metric highlighted." />
      <Panel bodyClass="p-0 overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead><tr className="border-b">
            <th className="label-xs px-4 py-2 text-left font-normal">Metric</th>
            {list.map((e) => <th key={e.id} className="px-4 py-2 text-left font-normal"><Link to="/app/experiments/$id" params={{ id: e.id }} className="font-medium hover:text-primary">{e.name}</Link><div><RunStatus status={e.status} /></div></th>)}
          </tr></thead>
          <tbody>
            {([["Model size", (e) => params(e.params)], ["Dataset", (e) => gb(e.dataGB)], ["Compute", (e) => usd(e.compute)]] as [string, (e: (typeof list)[0]) => string][]).map(([k, f]) => (
              <tr key={k} className="border-b"><td className="px-4 py-2 text-muted-foreground">{k}</td>{list.map((e) => <td key={e.id} className="px-4 py-2"><Mono>{f(e)}</Mono></td>)}</tr>
            ))}
            {keys.map((k) => {
              const vals = list.map((e) => e.metrics?.[k]);
              const best = k === "maxDrawdown" ? Math.min(...vals.filter((v) => v !== undefined) as number[]) : Math.max(...vals.filter((v) => v !== undefined) as number[]);
              return (
                <tr key={k} className="border-b last:border-0"><td className="px-4 py-2 text-muted-foreground">{metricLabel[k]}</td>
                  {list.map((e, i) => <td key={e.id} className="px-4 py-2"><Mono className={cn(vals[i] === best && "text-primary")}>{vals[i] ?? "—"}{vals[i] !== undefined && metricUnit(k)}</Mono></td>)}
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Panel title="Classification metrics">
          <Bars xKey="m" height={260} data={(["accuracy", "precision", "recall", "f1"] as MetricKey[]).map((k) => ({ m: metricLabel[k], ...Object.fromEntries(list.map((e) => [e.name, e.metrics?.[k] ?? 0])) }))}
            bars={list.map((e, i) => ({ key: e.name, color: colors[i % colors.length] }))} />
        </Panel>
        <Panel title="Strategy metrics (demo backtest)">
          <Bars xKey="m" height={260} data={(["profitFactor", "sharpe"] as MetricKey[]).map((k) => ({ m: metricLabel[k], ...Object.fromEntries(list.map((e) => [e.name, e.metrics?.[k] ?? 0])) }))}
            bars={list.map((e, i) => ({ key: e.name, color: colors[i % colors.length] }))} />
        </Panel>
      </div>
    </>
  );
}
