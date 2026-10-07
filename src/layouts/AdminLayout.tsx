import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, api } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const groups: { label: string; items: [string, string][] }[] = [
  { label: "Platform", items: [["/admin", "Dashboard"], ["/admin/users", "Users"], ["/admin/organizations", "Organizations"]] },
  { label: "Research", items: [["/admin/experiments", "Experiments"], ["/admin/runs", "Runs"], ["/admin/datasets", "Datasets"], ["/admin/models", "Models"], ["/admin/predictions", "Predictions"], ["/admin/deployments", "Deployments"]] },
  { label: "Infrastructure", items: [["/admin/compute", "Compute"], ["/admin/health", "System Health"], ["/admin/usage", "Usage"]] },
  { label: "Business", items: [["/admin/billing", "Billing"], ["/admin/audit", "Audit Logs"], ["/admin/settings", "Settings"]] },
];

export function AdminSidebar({ onNav }: { onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-12 items-center border-b border-sidebar-border px-4"><Link to="/admin"><Logo admin /></Link></div>
      <nav className="flex-1 space-y-4 overflow-y-auto p-3">
        {groups.map((g) => (
          <div key={g.label}>
            <div className="label-xs mb-1 px-2">{g.label}</div>
            {g.items.map(([to, label]) => {
              const active = to === "/admin" ? path === to : path.startsWith(to);
              return (
                <Link key={to} to={to} onClick={onNav}
                  className={cn("flex items-center justify-between border-l-2 px-2 py-1 font-mono text-[12px] transition-colors",
                    active ? "border-primary bg-sidebar-accent text-foreground" : "border-transparent text-sidebar-foreground/70 hover:text-foreground")}>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3 font-mono text-[11px] text-muted-foreground">
        <Link to="/app" className="hover:text-foreground">← Back to research app</Link>
      </div>
    </div>
  );
}

export function AdminLayout() {
  const admin = useStore((s) => s.admin);
  const [mobile, setMobile] = useState(false);
  const navigate = useNavigate();
  if (!admin)
    return (
      <div className="theme-admin grid min-h-screen place-items-center bg-background p-6 text-foreground">
        <div className="panel max-w-sm p-6 text-center">
          <ShieldAlert className="mx-auto size-6 text-primary" />
          <h1 className="mt-3 font-semibold">Admin access required</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to the operator console to continue.</p>
          <Button className="mt-4" onClick={() => navigate({ to: "/admin-login" })}>Admin login</Button>
        </div>
      </div>
    );
  return (
    <div className="theme-admin flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-52 shrink-0 border-r border-sidebar-border lg:block"><AdminSidebar /></aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="theme-admin w-56 p-0"><SheetTitle className="sr-only">Admin navigation</SheetTitle><AdminSidebar onNav={() => setMobile(false)} /></SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-10 items-center gap-3 border-b bg-sidebar px-4 font-mono text-[11px]">
          <button className="lg:hidden" onClick={() => setMobile(true)} aria-label="Open menu"><Menu className="size-4" /></button>
          <span className="flex items-center gap-1.5 text-success"><span className="size-1.5 rounded-full bg-current pulse-dot" />ALL SYSTEMS OPERATIONAL</span>
          <span className="hidden text-muted-foreground sm:inline">region: us-east · env: prod-demo</span>
          <button className="ml-auto text-muted-foreground hover:text-foreground" onClick={() => { api.logout(); navigate({ to: "/admin-login" }); }}>sign out</button>
        </header>
        <main className="w-full flex-1 px-4 py-5 md:px-6"><Outlet /></main>
      </div>
    </div>
  );
}
