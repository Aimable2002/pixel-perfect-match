import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import {
  Activity, BarChart3, BookOpen, Bell, Box, Boxes, ChevronsUpDown, Database, FlaskConical, Gauge, HelpCircle,
  LayoutGrid, LineChart, Menu, NotebookPen, Rocket, Search, Settings, Target, CheckCheck, User, Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore, api } from "@/lib/store";
import { Logo } from "@/components/Logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; exact?: boolean };
const main: NavItem[] = [
  { to: "/app", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/app/experiments", label: "Experiments", icon: FlaskConical },
  { to: "/app/datasets", label: "Datasets", icon: Database },
  { to: "/app/models", label: "Models", icon: Boxes },
  { to: "/app/scaling", label: "Scaling Lab", icon: LineChart },
  { to: "/app/predictions", label: "Predictions", icon: Target },
  { to: "/app/validation", label: "Validation", icon: CheckCheck },
  { to: "/app/runs", label: "Runs", icon: Activity },
  { to: "/app/deployments", label: "Deployments", icon: Rocket },
  { to: "/app/research", label: "Research", icon: NotebookPen },
  { to: "/docs", label: "Documentation", icon: BookOpen },
];
const bottom: NavItem[] = [
  { to: "/create-workspace", label: "Workspace", icon: Building2 },
  { to: "/app/usage", label: "Usage", icon: Gauge },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

function NavLinks({ items, onNav }: { items: NavItem[]; onNav?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      {items.map((it) => {
        const active = it.exact ? path === it.to : path === it.to || path.startsWith(it.to + "/");
        return (
          <Link key={it.to} to={it.to} onClick={onNav}
            className={cn("group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors",
              active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
            <it.icon className={cn("size-4", active ? "text-sidebar-primary" : "opacity-70")} />
            {it.label}
          </Link>
        );
      })}
    </>
  );
}

export function Sidebar({ onNav }: { onNav?: () => void }) {
  const user = useStore((s) => s.user);
  return (
    <div className="flex h-full flex-col bg-sidebar">
      <div className="flex h-12 items-center border-b border-sidebar-border px-4"><Link to="/app"><Logo /></Link></div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2"><NavLinks items={main} onNav={onNav} /></nav>
      <div className="space-y-0.5 border-t border-sidebar-border p-2">
        <NavLinks items={bottom} onNav={onNav} />
        <div className="mt-2 flex items-center gap-2.5 rounded-md px-2.5 py-2">
          <div className="grid size-7 place-items-center rounded-full bg-primary/15 font-mono text-[11px] text-primary">{user?.name.slice(0, 2).toUpperCase() ?? "—"}</div>
          <div className="min-w-0 text-xs">
            <div className="truncate font-medium">{user?.name ?? "Signed out"}</div>
            <div className="truncate text-muted-foreground">{user?.email}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const user = useStore((s) => s.user);
  const exps = useStore((s) => s.experiments);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setOpen((o) => !o); } };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  const go = (to: string, params?: Record<string, string>) => { setOpen(false); navigate({ to, params } as never); };
  return (
    <header className="sticky top-0 z-20 flex h-12 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur md:px-5">
      <button className="rounded p-1.5 hover:bg-accent lg:hidden" onClick={onMenu} aria-label="Open menu"><Menu className="size-4" /></button>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-md px-2 py-1 text-[13px] hover:bg-accent">
          <span className="grid size-5 place-items-center rounded-sm bg-primary font-mono text-[10px] font-bold text-primary-foreground">{user?.workspace[0] ?? "W"}</span>
          <span className="hidden sm:inline">{user?.workspace ?? "Workspace"}</span>
          <ChevronsUpDown className="size-3 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel className="label-xs">Workspaces</DropdownMenuLabel>
          {["Forex Research", "Vision Sandbox", "Personal"].map((w) => (
            <DropdownMenuItem key={w} onClick={() => { api.setWorkspace(w); toast(`Switched to ${w}`); }}>{w}</DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate({ to: "/create-workspace" })}>+ Create workspace</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button onClick={() => setOpen(true)} className="ml-auto flex h-8 w-full max-w-xs items-center gap-2 rounded-md border bg-surface px-2.5 text-xs text-muted-foreground hover:text-foreground md:ml-6 md:mr-auto">
        <Search className="size-3.5" /> <span className="flex-1 text-left">Search experiments, runs…</span>
        <kbd className="hidden rounded border px-1 font-mono text-[10px] sm:inline">⌘K</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search the lab…" />
        <CommandList>
          <CommandEmpty>No results.</CommandEmpty>
          <CommandGroup heading="Experiments">
            {exps.slice(0, 12).map((e) => <CommandItem key={e.id} onSelect={() => go("/app/experiments/$id", { id: e.id })}><FlaskConical className="size-3.5" />{e.name}</CommandItem>)}
          </CommandGroup>
          <CommandGroup heading="Go to">
            {main.map((m) => <CommandItem key={m.to} onSelect={() => go(m.to)}><m.icon className="size-3.5" />{m.label}</CommandItem>)}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <Popover>
        <PopoverTrigger className="relative rounded p-1.5 hover:bg-accent" aria-label="Notifications">
          <Bell className="size-4" /><span className="absolute right-1 top-1 size-1.5 rounded-full bg-primary" />
        </PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="border-b px-3 py-2 text-xs font-medium">Notifications</div>
          {[
            ["Run run-8a3f completed", "Forex Transformer 800M · acc 59.6%", "4m"],
            ["Prediction validated", "2B Forex Transformer · error 0.5pt", "2h"],
            ["Dataset processing", "USDJPY Tick Data · 62% indexed", "5h"],
          ].map(([t, d, ago]) => (
            <div key={t} className="border-b px-3 py-2.5 last:border-0">
              <div className="flex justify-between text-xs"><span>{t}</span><span className="font-mono text-muted-foreground">{ago}</span></div>
              <div className="mt-0.5 font-mono text-[11px] text-muted-foreground">{d}</div>
            </div>
          ))}
        </PopoverContent>
      </Popover>
      <Link to="/docs" className="rounded p-1.5 hover:bg-accent" aria-label="Help"><HelpCircle className="size-4" /></Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="grid size-7 place-items-center rounded-full bg-primary/15 font-mono text-[11px] text-primary" aria-label="Account">
          {user?.name.slice(0, 2).toUpperCase() ?? <User className="size-3.5" />}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs">{user?.email}</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigate({ to: "/app/settings" })}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/app/usage" })}>Usage</DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate({ to: "/admin" })}>Admin console</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => { api.logout(); navigate({ to: "/login" }); }}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

export function AppLayout() {
  const [mobile, setMobile] = useState(false);
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 border-r border-sidebar-border lg:block"><Sidebar /></aside>
      <Sheet open={mobile} onOpenChange={setMobile}>
        <SheetContent side="left" className="w-60 border-sidebar-border p-0"><SheetTitle className="sr-only">Navigation</SheetTitle><Sidebar onNav={() => setMobile(false)} /></SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenu={() => setMobile(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-6"><Outlet /></main>
      </div>
    </div>
  );
}

export { Box, BarChart3 };
