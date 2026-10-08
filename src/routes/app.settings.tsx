import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Field, PageHeader, Panel } from "@/components/lab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api, useStore } from "@/lib/store";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/settings")({
  head: () => seo("Settings", "Profile, workspace, notifications and API keys."),
  component: Settings,
});

function Settings() {
  const user = useStore((s) => s.user);
  const [workspace, setWorkspace] = useState(user?.workspace ?? "");
  const [name, setName] = useState(user?.name ?? "");
  const [notify, setNotify] = useState({ runs: true, predictions: true, weekly: false });
  const [keys, setKeys] = useState(["sk_demo_8f2a…41c9"]);
  return (
    <>
      <PageHeader title="Settings" />
      <div className="grid max-w-3xl gap-4">
        <Panel title="Profile">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Email"><Input value={user?.email ?? ""} disabled /></Field>
          </div>
          <Button className="mt-3" size="sm" onClick={() => { if (user) api.login(user.email, name); toast.success("Profile saved"); }}>Save</Button>
        </Panel>
        <Panel title="Workspace">
          <Field label="Workspace name"><Input value={workspace} onChange={(e) => setWorkspace(e.target.value)} /></Field>
          <Button className="mt-3" size="sm" onClick={() => { api.setWorkspace(workspace); toast.success("Workspace renamed"); }}>Save</Button>
        </Panel>
        <Panel title="Notifications">
          {([["runs", "Run completes or fails"], ["predictions", "Prediction is validated"], ["weekly", "Weekly research digest"]] as const).map(([k, l]) => (
            <label key={k} className="flex items-center justify-between py-1.5 text-sm">{l}<Switch checked={notify[k]} onCheckedChange={(v) => setNotify({ ...notify, [k]: v })} /></label>
          ))}
        </Panel>
        <Panel title="API keys" actions={<Button size="sm" variant="outline" onClick={() => { setKeys([...keys, `sk_demo_${Math.random().toString(16).slice(2, 6)}…${Math.random().toString(16).slice(2, 6)}`]); toast.success("Key created"); }}>New key</Button>}>
          <ul className="space-y-2">
            {keys.map((k) => (
              <li key={k} className="flex items-center justify-between font-mono text-xs">{k}
                <Button size="sm" variant="ghost" onClick={() => setKeys(keys.filter((x) => x !== k))}>Revoke</Button></li>
            ))}
            {!keys.length && <li className="text-sm text-muted-foreground">No keys.</li>}
          </ul>
        </Panel>
      </div>
    </>
  );
}
