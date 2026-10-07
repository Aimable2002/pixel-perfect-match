import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/MarketingLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/lab";
import { api } from "@/lib/store";

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function LoginPage() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("researcher@scalar.dev");
  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); await wait(600);
    api.login(email); toast.success("Signed in"); nav({ to: "/app" });
  };
  return (
    <AuthLayout title="Log in" subtitle="Welcome back to the lab.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Email"><Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" required defaultValue="demo-password" /></Field>
        <div className="flex justify-end"><Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">Forgot password?</Link></div>
        <Button className="w-full" disabled={busy}>{busy ? "Signing in…" : "Log in"}</Button>
        <p className="text-center text-xs text-muted-foreground">No account? <Link to="/signup" className="text-primary">Sign up</Link></p>
      </form>
    </AuthLayout>
  );
}

export function SignupPage() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setBusy(true);
    const f = new FormData(e.currentTarget);
    await wait(600);
    api.login(String(f.get("email")), String(f.get("name")) || "Researcher");
    nav({ to: "/verify-email" });
  };
  return (
    <AuthLayout title="Create your account" subtitle="Start with $25 of demo compute credit.">
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name"><Input name="name" required placeholder="Ada Park" /></Field>
        <Field label="Work email"><Input name="email" type="email" required placeholder="ada@lab.dev" /></Field>
        <Field label="Password" hint="Min. 8 characters"><Input name="password" type="password" minLength={8} required /></Field>
        <Button className="w-full" disabled={busy}>{busy ? "Creating account…" : "Create account"}</Button>
        <p className="text-center text-xs text-muted-foreground">Already have one? <Link to="/login" className="text-primary">Log in</Link></p>
      </form>
    </AuthLayout>
  );
}

export function ForgotPage() {
  const [sent, setSent] = useState(false);
  return (
    <AuthLayout title="Reset password" subtitle="We'll email you a reset link.">
      {sent ? (
        <div className="panel p-4 text-sm">Check your inbox — a reset link is on its way (simulated). <Link to="/login" className="mt-3 block text-primary">Back to login</Link></div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="space-y-4">
          <Field label="Email"><Input type="email" required /></Field>
          <Button className="w-full">Send reset link</Button>
        </form>
      )}
    </AuthLayout>
  );
}

export function VerifyPage() {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  return (
    <AuthLayout title="Verify your email" subtitle="Enter the 6-digit code we sent. Any 6 digits work in this demo.">
      <form onSubmit={(e) => { e.preventDefault(); toast.success("Email verified"); nav({ to: "/create-workspace" }); }} className="space-y-4">
        <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" className="text-center font-mono text-xl tracking-[0.5em]" />
        <Button className="w-full" disabled={code.length !== 6}>Verify</Button>
        <button type="button" onClick={() => toast("Code resent (simulated)")} className="w-full text-xs text-muted-foreground hover:text-foreground">Resend code</button>
      </form>
    </AuthLayout>
  );
}

export function WorkspacePage() {
  const nav = useNavigate();
  const [name, setName] = useState("Forex Research");
  const [domain, setDomain] = useState("Forex");
  return (
    <AuthLayout title="Create a workspace" subtitle="Workspaces hold datasets, experiments and compute budgets.">
      <form onSubmit={(e) => { e.preventDefault(); api.setWorkspace(name); toast.success(`Workspace “${name}” ready`); nav({ to: "/app" }); }} className="space-y-4">
        <Field label="Workspace name"><Input value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="Primary research domain">
          <div className="grid grid-cols-3 gap-2">
            {["Forex", "General AI", "Custom"].map((d) => (
              <button type="button" key={d} onClick={() => setDomain(d)} className={`rounded-md border px-2 py-2 text-xs ${domain === d ? "border-primary bg-primary/10 text-primary" : "text-muted-foreground"}`}>{d}</button>
            ))}
          </div>
        </Field>
        <Field label="Monthly compute budget"><Input type="number" defaultValue={500} /></Field>
        <Button className="w-full">Create workspace</Button>
      </form>
    </AuthLayout>
  );
}

export function AdminLoginPage() {
  const nav = useNavigate();
  return (
    <div className="theme-admin grid min-h-screen place-items-center bg-background p-6 text-foreground">
      <form onSubmit={(e) => { e.preventDefault(); api.adminLogin(); toast.success("Operator session started"); nav({ to: "/admin" }); }} className="panel w-full max-w-sm space-y-4 p-6">
        <div><div className="label-xs">ScalarLab · Operator console</div><h1 className="mt-1 text-lg font-semibold">Admin login</h1></div>
        <Field label="Email"><Input type="email" defaultValue="ops@scalar.dev" required /></Field>
        <Field label="Password"><Input type="password" defaultValue="operator" required /></Field>
        <Field label="2FA code"><Input defaultValue="482913" className="font-mono" /></Field>
        <Button className="w-full">Enter console</Button>
        <p className="text-center font-mono text-[10px] text-muted-foreground">Simulated authentication · demo only</p>
      </form>
    </div>
  );
}
