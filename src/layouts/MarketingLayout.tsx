import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

const links: [string, string][] = [["/features", "Features"], ["/research", "Research"], ["/pricing", "Pricing"], ["/docs", "Docs"]];

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-5">
          <Link to="/"><Logo /></Link>
          <nav className="hidden gap-5 text-[13px] text-muted-foreground md:flex">
            {links.map(([to, l]) => <Link key={to} to={to} className="hover:text-foreground" activeProps={{ className: "text-foreground" }}>{l}</Link>)}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link to="/login" className="px-2 text-[13px] text-muted-foreground hover:text-foreground">Log in</Link>
            <Button asChild size="sm"><Link to="/signup">Start Experiment</Link></Button>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <Logo />
          <div className="flex flex-wrap gap-5">{links.map(([to, l]) => <Link key={to} to={to} className="hover:text-foreground">{l}</Link>)}<Link to="/admin-login" className="hover:text-foreground">Admin</Link></div>
          <span className="font-mono">Prototype · all data is fictional · not financial advice</span>
        </div>
      </footer>
    </div>
  );
}

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Link to="/"><Logo /></Link>
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
      <div className="grid-bg relative hidden overflow-hidden border-l bg-sidebar lg:flex lg:flex-col lg:justify-end lg:p-12">
        <div className="font-mono text-xs leading-6 text-muted-foreground">
          <div><span className="text-primary">$</span> scalar fit --family forex-transformer</div>
          <div>observed: 12 experiments · $10 → $800</div>
          <div>fit: acc = 53.4 + 2.21·log10(compute)</div>
          <div className="text-predict">projection @ $4,820 → 63.4% [61.1, 65.2]</div>
          <div className="text-success">verdict: likely worthwhile</div>
        </div>
        <p className="mt-8 max-w-sm text-2xl font-medium tracking-tight">Experiment small.<br /><span className="text-primary">Predict big.</span></p>
      </div>
    </div>
  );
}
