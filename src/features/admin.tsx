import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DemoNote, Field, MetricCard, PageHeader, Panel, Progress, RunStatus } from "@/components/lab";
import { DataTable } from "@/components/DataTable";
import { Bars, C, MetricChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api, useStore } from "@/lib/store";
import { auditLogs, computePool, deployments, models, organizations, series } from "@/data/mock";
import { compact, date, datetime, duration, gb, params, usd } from "@/lib/format";
import { metricLabel } from "@/lib/scaling";

/* All admin screens read the same mock store as the research app. */

export function AdminDashboard() {
  const users = useStore((s) => s.users);
  const exps = useStore((s) => s.experiments);
  const runs = useStore((s) => s.runs);
  const mrr = organizations.reduce((a, o) => a + o.revenue, 0);
  const signups = series(30, 3, 12, 0.4, 6).map((d) => ({ i: d.i + 1, v: Math.max(0, Math.round(d.v)) }));
  return (
    <>
      <PageHeader eyebrow="Operator console" title="Dashboard" actions={<DemoNote />} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <MetricCard label="Users" value={users.length} />
        <MetricCard label="Orgs" value={organizations.length} />
        <MetricCard label="Experiments" value={exps.length} />
        <MetricCard label="Active runs" value={runs.filter((r) => r.status === "running").length} tone="primary" />
        <MetricCard label="GPU util." value={`${Math.round(computePool.reduce((a, c) => a + c.utilization, 0) / computePool.length)}%`} />
        <MetricCard label="MRR" value={usd(mrr)} tone="success" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Signups, last 30 days"><MetricChart area data={signups} lines={[{ key: "v", color: C.primary, name: "Signups" }]} /></Panel>
        <Panel title="GPU utilization (%)"><Bars data={computePool.map((c) => ({ gpu: c.gpu, u: c.utilization }))} xKey="gpu" bars={[{ key: "u", color: C.info, name: "Utilization" }]} /></Panel>
        <Panel title="Recent audit events" className="lg:col-span-2">
          <ul className="divide-y font-mono text-xs">
            {auditLogs.slice(0, 6).map((l) => (
              <li key={l.id} className="flex flex-wrap gap-x-3 py-1.5"><span className="text-muted-foreground">{datetime(l.timestamp)}</span><span>{l.user}</span><span className="text-primary">{l.action}</span><RunStatus status={l.status} className="ml-auto" /></li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}

export function AdminUsers() {
  const users = useStore((s) => s.users);
  return (
    <>
      <PageHeader title="Users" description={`${users.length} accounts`} />
      <DataTable rows={users} searchKeys={(u) => `${u.name} ${u.email} ${u.organization}`}
        columns={[
          { key: "n", header: "Name", cell: (u) => <div><div>{u.name}</div><div className="font-mono text-[11px] text-muted-foreground">{u.email}</div></div>, sort: (u) => u.name },
          { key: "o", header: "Organization", cell: (u) => u.organization },
          { key: "r", header: "Role", cell: (u) => u.role },
          { key: "e", header: "Exps", cell: (u) => u.experiments, sort: (u) => u.experiments },
          { key: "c", header: "Compute", cell: (u) => usd(u.compute), sort: (u) => u.compute },
          { key: "s", header: "Status", cell: (u) => <RunStatus status={u.status} /> },
          { key: "a", header: "", cell: (u) => u.status === "suspended"
            ? <Button size="sm" variant="ghost" onClick={(ev) => { ev.stopPropagation(); api.setUserStatus(u.id, "active"); toast.success(`${u.name} reactivated`); }}>Reactivate</Button>
            : <Button size="sm" variant="ghost" className="text-destructive" onClick={(ev) => { ev.stopPropagation(); api.setUserStatus(u.id, "suspended"); toast(`${u.name} suspended`); }}>Suspend</Button> },
        ]} />
    </>
  );
}

export function AdminOrganizations() {
  return (
    <>
      <PageHeader title="Organizations" />
      <DataTable rows={organizations} searchKeys={(o) => o.name}
        columns={[
          { key: "n", header: "Name", cell: (o) => o.name, sort: (o) => o.name },
          { key: "p", header: "Plan", cell: (o) => o.plan },
          { key: "u", header: "Users", cell: (o) => o.users, sort: (o) => o.users },
          { key: "e", header: "Experiments", cell: (o) => o.experiments, sort: (o) => o.experiments },
          { key: "c", header: "Compute", cell: (o) => usd(o.compute), sort: (o) => o.compute },
          { key: "r", header: "MRR", cell: (o) => usd(o.revenue), sort: (o) => o.revenue },
          { key: "s", header: "Status", cell: (o) => <RunStatus status={o.status} /> },
        ]} />
    </>
  );
}

export function AdminExperiments() {
  const exps = useStore((s) => s.experiments);
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Experiments" description="All experiments across every workspace." />
      <DataTable rows={exps} searchKeys={(e) => `${e.name} ${e.owner} ${e.family}`} onRowClick={(e) => navigate({ to: "/app/experiments/$id", params: { id: e.id } })}
        columns={[
          { key: "n", header: "Name", cell: (e) => e.name, sort: (e) => e.name },
          { key: "f", header: "Family", cell: (e) => e.family },
          { key: "o", header: "Owner", cell: (e) => e.owner },
          { key: "c", header: "Compute", cell: (e) => usd(e.compute), sort: (e) => e.compute },
          { key: "s", header: "Status", cell: (e) => <RunStatus status={e.status} /> },
        ]} />
    </>
  );
}

export function AdminRuns() {
  const runs = useStore((s) => s.runs);
  return (
    <>
      <PageHeader title="Runs" />
      <DataTable rows={runs} searchKeys={(r) => `${r.id} ${r.user} ${r.gpu}`}
        columns={[
          { key: "id", header: "Run", cell: (r) => <span className="font-mono">{r.id}</span> },
          { key: "u", header: "User", cell: (r) => r.user },
          { key: "g", header: "GPU", cell: (r) => r.gpu },
          { key: "p", header: "Progress", cell: (r) => <div className="w-24"><Progress value={r.progress} /></div>, sort: (r) => r.progress },
          { key: "d", header: "Duration", cell: (r) => duration(r.durationMin), sort: (r) => r.durationMin },
          { key: "c", header: "Cost", cell: (r) => usd(r.compute), sort: (r) => r.compute },
          { key: "s", header: "Status", cell: (r) => <RunStatus status={r.status} /> },
          { key: "a", header: "", cell: (r) => (r.status === "running" || r.status === "queued") && <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { api.stopExperiment(r.experimentId); toast("Run stopped"); }}>Stop</Button> },
        ]} />
    </>
  );
}

export function AdminDatasets() {
  const ds = useStore((s) => s.datasets);
  return (
    <>
      <PageHeader title="Datasets" />
      <DataTable rows={ds} searchKeys={(d) => `${d.name} ${d.owner}`}
        columns={[
          { key: "n", header: "Name", cell: (d) => d.name, sort: (d) => d.name },
          { key: "o", header: "Owner", cell: (d) => d.owner },
          { key: "sz", header: "Size", cell: (d) => gb(d.sizeGB), sort: (d) => d.sizeGB },
          { key: "r", header: "Rows", cell: (d) => compact(d.rows), sort: (d) => d.rows },
          { key: "q", header: "Quality", cell: (d) => `${d.quality}%`, sort: (d) => d.quality },
          { key: "s", header: "Status", cell: (d) => <RunStatus status={d.status} /> },
        ]} />
    </>
  );
}

export function AdminModels() {
  return (
    <>
      <PageHeader title="Models" />
      <DataTable rows={models} searchKeys={(m) => `${m.name} ${m.architecture}`}
        columns={[
          { key: "n", header: "Name", cell: (m) => m.name, sort: (m) => m.name },
          { key: "a", header: "Architecture", cell: (m) => m.architecture },
          { key: "p", header: "Params", cell: (m) => params(m.params), sort: (m) => m.params },
          { key: "v", header: "Version", cell: (m) => m.version },
          { key: "u", header: "Usage", cell: (m) => compact(m.usage), sort: (m) => m.usage },
          { key: "s", header: "Status", cell: (m) => <RunStatus status={m.status} /> },
        ]} />
    </>
  );
}

export function AdminPredictions() {
  const preds = useStore((s) => s.predictions);
  return (
    <>
      <PageHeader title="Predictions" />
      <DataTable rows={preds} searchKeys={(p) => `${p.name} ${p.family}`}
        columns={[
          { key: "n", header: "Name", cell: (p) => p.name },
          { key: "m", header: "Metric", cell: (p) => metricLabel[p.metric] },
          { key: "p", header: "Predicted", cell: (p) => `${p.predicted} (${p.low}–${p.high})` },
          { key: "a", header: "Actual", cell: (p) => p.actual ?? "—" },
          { key: "c", header: "Conf.", cell: (p) => `${p.confidence}%`, sort: (p) => p.confidence },
          { key: "d", header: "Created", cell: (p) => date(p.createdAt), sort: (p) => p.createdAt },
          { key: "s", header: "Status", cell: (p) => <RunStatus status={p.status} /> },
        ]} />
    </>
  );
}

export function AdminDeployments() {
  return (
    <>
      <PageHeader title="Deployments" />
      <DataTable rows={deployments}
        columns={[
          { key: "n", header: "Name", cell: (d) => d.name },
          { key: "e", header: "Env", cell: (d) => d.environment },
          { key: "v", header: "Version", cell: (d) => d.version },
          { key: "r", header: "Requests", cell: (d) => compact(d.requests) },
          { key: "l", header: "Latency", cell: (d) => `${d.latencyMs}ms` },
          { key: "s", header: "Status", cell: (d) => <RunStatus status={d.status} /> },
        ]} />
    </>
  );
}

export function AdminCompute() {
  return (
    <>
      <PageHeader title="Compute" description="GPU pool capacity and queue depth." actions={<DemoNote />} />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {computePool.map((c) => (
          <Panel key={c.gpu} title={c.gpu} actions={<span className="font-mono text-xs text-muted-foreground">${c.pricePerHour}/h</span>}>
            <Progress value={c.utilization} tone={c.utilization > 85 ? "warning" : "primary"} />
            <div className="mt-3 grid grid-cols-2 gap-2 font-mono text-xs">
              <div><div className="label-xs">Total</div>{c.total}</div><div><div className="label-xs">Free</div>{c.available}</div>
              <div><div className="label-xs">Running</div>{c.running}</div><div><div className="label-xs">Queued</div>{c.queued}</div>
            </div>
          </Panel>
        ))}
      </div>
    </>
  );
}

const services = [["API gateway", "operational", 99.99, 38], ["Scheduler", "operational", 99.97, 12], ["Training workers", "degraded", 99.2, 0], ["Object storage", "operational", 100, 21], ["Metrics DB", "operational", 99.95, 7], ["Auth", "operational", 99.99, 18]] as const;

export function AdminHealth() {
  const lat = series(60, 21, 40, 0, 10).map((d) => ({ i: d.i, ms: Math.max(10, d.v) }));
  return (
    <>
      <PageHeader title="System health" actions={<DemoNote />} />
      <div className="mb-4 grid gap-3 md:grid-cols-3">
        {services.map(([n, s, up, ms]) => (
          <Panel key={n} title={n} actions={<RunStatus status={s} />}><div className="font-mono text-xs text-muted-foreground">uptime {up}% · {ms ? `${ms}ms p50` : "queue backlog"}</div></Panel>
        ))}
      </div>
      <Panel title="API latency, last hour (ms)"><MetricChart area data={lat} lines={[{ key: "ms", color: C.success, name: "p50" }]} /></Panel>
    </>
  );
}

export function AdminUsage() {
  const data = series(14, 5, 1800, 40, 400).map((d) => ({ day: `D${d.i + 1}`, gpu: Math.round(d.v), storage: Math.round(d.v * 0.18) }));
  return (
    <>
      <PageHeader title="Platform usage" actions={<DemoNote />} />
      <Panel title="Daily spend ($)"><Bars stacked data={data} xKey="day" height={280} bars={[{ key: "gpu", color: C.primary, name: "GPU" }, { key: "storage", color: C.predict, name: "Storage" }]} /></Panel>
    </>
  );
}

export function AdminBilling() {
  const mrr = organizations.reduce((a, o) => a + o.revenue, 0);
  return (
    <>
      <PageHeader title="Billing" actions={<DemoNote />} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <MetricCard label="MRR" value={usd(mrr)} tone="success" />
        <MetricCard label="ARR" value={usd(mrr * 12)} />
        <MetricCard label="Trials" value={organizations.filter((o) => o.status === "trial").length} tone="warning" />
        <MetricCard label="Past due" value={organizations.filter((o) => o.status === "past_due").length} tone="destructive" />
      </div>
      <DataTable rows={organizations}
        columns={[
          { key: "n", header: "Organization", cell: (o) => o.name },
          { key: "p", header: "Plan", cell: (o) => o.plan },
          { key: "r", header: "MRR", cell: (o) => usd(o.revenue), sort: (o) => o.revenue },
          { key: "s", header: "Status", cell: (o) => <RunStatus status={o.status} /> },
          { key: "a", header: "", cell: (o) => o.status === "past_due" && <Button size="sm" variant="ghost" onClick={() => toast.success(`Reminder sent to ${o.name}`)}>Send reminder</Button> },
        ]} />
    </>
  );
}

export function AdminAudit() {
  return (
    <>
      <PageHeader title="Audit logs" />
      <DataTable rows={auditLogs} pageSize={15} searchKeys={(l) => `${l.user} ${l.action} ${l.resource} ${l.ip}`}
        columns={[
          { key: "t", header: "Time", cell: (l) => <span className="font-mono text-xs">{datetime(l.timestamp)}</span>, sort: (l) => l.timestamp },
          { key: "u", header: "User", cell: (l) => l.user },
          { key: "a", header: "Action", cell: (l) => <span className="font-mono text-xs text-primary">{l.action}</span> },
          { key: "r", header: "Resource", cell: (l) => <span className="font-mono text-xs">{l.resource}</span> },
          { key: "ip", header: "IP", cell: (l) => <span className="font-mono text-xs">{l.ip}</span> },
          { key: "s", header: "Result", cell: (l) => <RunStatus status={l.status} /> },
        ]} />
    </>
  );
}

export function AdminSettings() {
  const [flags, setFlags] = useState({ signups: true, maintenance: false, h100: true });
  const [quota, setQuota] = useState("5000");
  return (
    <>
      <PageHeader title="Platform settings" />
      <div className="grid max-w-2xl gap-4">
        <Panel title="Feature flags">
          {([["signups", "Allow new signups"], ["maintenance", "Maintenance mode"], ["h100", "H100 pool available"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between py-1.5 text-sm">{l}<Switch checked={flags[k]} onCheckedChange={(v) => { setFlags({ ...flags, [k]: v }); toast.success("Setting updated"); }} /></label>
          ))}
        </Panel>
        <Panel title="Default limits">
          <Field label="Monthly compute quota per workspace ($)"><Input type="number" value={quota} onChange={(e) => setQuota(e.target.value)} /></Field>
          <Button size="sm" className="mt-3" onClick={() => toast.success("Limits saved")}>Save</Button>
        </Panel>
      </div>
    </>
  );
}
