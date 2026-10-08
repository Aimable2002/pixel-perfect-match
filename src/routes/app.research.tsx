import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, Panel, Segmented } from "@/components/lab";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, useStore } from "@/lib/store";
import { datetime } from "@/lib/format";
import { seo } from "@/lib/seo";
import type { ResearchNote } from "@/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/research")({
  head: () => seo("Research workspace", "A running notebook of hypotheses, observations and conclusions."),
  component: Research,
});

const kinds: ResearchNote["kind"][] = ["Hypothesis", "Observation", "Conclusion", "Note"];
const kindTone: Record<ResearchNote["kind"], string> = { Hypothesis: "text-predict", Observation: "text-info", Conclusion: "text-success", Note: "text-muted-foreground" };

function Research() {
  const notes = useStore((s) => s.notes);
  const exps = useStore((s) => s.experiments);
  const [kind, setKind] = useState<ResearchNote["kind"]>("Hypothesis");
  const [body, setBody] = useState("");
  const [attach, setAttach] = useState("");
  return (
    <>
      <PageHeader title="Research workspace" description="Write down what you expect before you run it, then what you saw. Your future self will thank you." />
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <Panel title={`Notebook · ${notes.length} entries`}>
          <ol className="space-y-4">
            {[...notes].reverse().map((n) => (
              <li key={n.id} className="border-l-2 border-border pl-3">
                <div className="flex items-center gap-2 font-mono text-[11px]"><span className={cn("uppercase", kindTone[n.kind])}>{n.kind}</span><span className="text-muted-foreground">{datetime(n.createdAt)}</span></div>
                <p className="mt-1 whitespace-pre-wrap text-sm">{n.body}</p>
                {n.attachments.length > 0 && <div className="mt-1.5 flex flex-wrap gap-1">{n.attachments.map((a) => <span key={a} className="rounded-sm border px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground">{a}</span>)}</div>}
              </li>
            ))}
          </ol>
        </Panel>
        <Panel title="New entry">
          <div className="space-y-3">
            <Segmented value={kind} onChange={setKind} options={kinds.map((k) => ({ value: k, label: k }))} />
            <Textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} placeholder="e.g. Doubling data should matter more than doubling params for EURUSD…" />
            <select value={attach} onChange={(e) => setAttach(e.target.value)} className="h-9 w-full rounded-md border bg-background px-2 text-xs">
              <option value="">Attach an experiment (optional)</option>
              {exps.map((e) => <option key={e.id} value={e.name}>{e.name}</option>)}
            </select>
            <Button className="w-full" disabled={!body.trim()} onClick={() => { api.addNote(kind, body.trim(), attach ? [attach] : []); setBody(""); setAttach(""); toast.success("Entry added"); }}>Add entry</Button>
          </div>
        </Panel>
      </div>
    </>
  );
}
