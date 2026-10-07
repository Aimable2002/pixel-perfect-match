import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PageHeader({ title, description, actions, eyebrow }: { title: ReactNode; description?: ReactNode; actions?: ReactNode; eyebrow?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && <div className="label-xs mb-2">{eyebrow}</div>}
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Panel({ title, actions, children, className, bodyClass }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("panel min-w-0", className)}>
      {(title || actions) && (
        <header className="flex items-center justify-between gap-2 border-b px-4 py-2.5">
          <h3 className="text-[13px] font-medium">{title}</h3>
          <div className="flex items-center gap-2">{actions}</div>
        </header>
      )}
      <div className={cn("p-4", bodyClass)}>{children}</div>
    </section>
  );
}

export function MetricCard({ label, value, sub, tone, className }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "primary" | "predict" | "success" | "warning" | "destructive"; className?: string }) {
  const toneCls = { primary: "text-primary", predict: "text-predict", success: "text-success", warning: "text-warning", destructive: "text-destructive" };
  return (
    <div className={cn("panel px-4 py-3", className)}>
      <div className="label-xs">{label}</div>
      <div className={cn("mt-1.5 font-mono text-xl font-medium tabular-nums", tone && toneCls[tone])}>{value}</div>
      {sub && <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

const statusTone: Record<string, string> = {
  completed: "text-success bg-success/10 border-success/25",
  validated: "text-success bg-success/10 border-success/25",
  healthy: "text-success bg-success/10 border-success/25",
  active: "text-success bg-success/10 border-success/25",
  ready: "text-success bg-success/10 border-success/25",
  success: "text-success bg-success/10 border-success/25",
  operational: "text-success bg-success/10 border-success/25",
  running: "text-info bg-info/10 border-info/25",
  processing: "text-info bg-info/10 border-info/25",
  predicted: "text-predict bg-predict/10 border-predict/25",
  awaiting: "text-warning bg-warning/10 border-warning/25",
  queued: "text-warning bg-warning/10 border-warning/25",
  degraded: "text-warning bg-warning/10 border-warning/25",
  trial: "text-warning bg-warning/10 border-warning/25",
  invited: "text-warning bg-warning/10 border-warning/25",
  beta: "text-info bg-info/10 border-info/25",
  failed: "text-destructive bg-destructive/10 border-destructive/25",
  invalidated: "text-destructive bg-destructive/10 border-destructive/25",
  down: "text-destructive bg-destructive/10 border-destructive/25",
  error: "text-destructive bg-destructive/10 border-destructive/25",
  failure: "text-destructive bg-destructive/10 border-destructive/25",
  suspended: "text-destructive bg-destructive/10 border-destructive/25",
  past_due: "text-destructive bg-destructive/10 border-destructive/25",
};
const statusText: Record<string, string> = { awaiting: "awaiting run", past_due: "past due" };

/** RunStatus — shared status pill for runs, experiments, predictions, services. */
export function RunStatus({ status, className }: { status: string; className?: string }) {
  const live = status === "running" || status === "processing";
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[10.5px] uppercase tracking-wide", statusTone[status] ?? "border-border bg-muted text-muted-foreground", className)}>
      <span className={cn("size-1.5 rounded-full bg-current", live && "pulse-dot")} />
      {statusText[status] ?? status}
    </span>
  );
}

export const Mono = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("font-mono tabular-nums", className)}>{children}</span>
);

export const DemoNote = ({ className }: { className?: string }) => (
  <span className={cn("rounded-sm border border-warning/30 bg-warning/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-warning", className)}>
    Demo data
  </span>
);

export function Progress({ value, tone = "primary" }: { value: number; tone?: "primary" | "info" | "warning" | "destructive" }) {
  const bg = { primary: "bg-primary", info: "bg-info", warning: "bg-warning", destructive: "bg-destructive" }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div className={cn("h-full rounded-full transition-all duration-500", bg)} style={{ width: `${value}%` }} />
    </div>
  );
}

export function KV({ items, cols = 2 }: { items: [string, ReactNode][]; cols?: number }) {
  return (
    <dl className={cn("grid gap-x-6 gap-y-3", cols === 3 ? "sm:grid-cols-3" : cols === 4 ? "grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2")}>
      {items.map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="label-xs">{k}</dt>
          <dd className="mt-1 truncate font-mono text-[13px]">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Modal — thin wrapper for consistent dialog chrome. */
export function Modal({ open, onOpenChange, title, description, children, footer, wide }: { open: boolean; onOpenChange: (o: boolean) => void; title: ReactNode; description?: ReactNode; children: ReactNode; footer?: ReactNode; wide?: boolean }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("border-border bg-popover", wide && "sm:max-w-2xl")}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export function Confirm({ trigger, title, description, onConfirm, action = "Confirm", destructive }: { trigger: ReactNode; title: string; description: string; onConfirm: () => void; action?: string; destructive?: boolean }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent className="bg-popover">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} className={cn(destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90")}>{action}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

export function Segmented<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)}
          className={cn("rounded-sm px-2.5 py-1 font-mono text-[11px] transition-colors", value === o.value ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function NativeSelect({ value, onChange, options, className }: { value: string; onChange: (v: string) => void; options: (string | { value: string; label: string })[]; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={cn("h-8 rounded-md border bg-background px-2 text-xs text-foreground outline-none focus:ring-1 focus:ring-ring", className)}>
      {options.map((o) => typeof o === "string" ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
