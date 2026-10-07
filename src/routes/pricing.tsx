import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { MarketingLayout } from "@/layouts/MarketingLayout";
import { Button } from "@/components/ui/button";
import { DemoNote } from "@/components/lab";
import { cn } from "@/lib/utils";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/pricing")({
  head: () => seo("Pricing", "Demo pricing for ScalarLab plans: Researcher, Team, Lab and Enterprise."),
  component: Pricing,
});

const plans = [
  { name: "Researcher", price: "Free", per: "", items: ["3 active experiments", "$25 compute credit", "Scaling fits up to 8 points", "Community models"] },
  { name: "Team", price: "$49", per: "/month", items: ["Unlimited experiments", "5 members", "Scale predictions + validation", "Research workspaces"], featured: true },
  { name: "Lab", price: "$199", per: "/month", items: ["25 members", "Priority H100 queue", "Calibration reports", "Private model registry"] },
  { name: "Enterprise", price: "Custom", per: "", items: ["SSO & audit logs", "Dedicated GPU pools", "On-prem datasets", "Deployment endpoints"] },
];

function Pricing() {
  return (
    <MarketingLayout>
      <div className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-center gap-3"><span className="label-xs">Pricing</span><DemoNote /></div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Pay for evidence, not guesses.</h1>
        <p className="mt-3 text-muted-foreground">Mock pricing for demonstration only. Compute billed separately at pool rates.</p>
        <div className="mt-12 grid gap-4 md:grid-cols-4">
          {plans.map((p) => (
            <div key={p.name} className={cn("panel flex flex-col p-5", p.featured && "border-primary glow-primary")}>
              <div className="text-sm font-medium">{p.name}</div>
              <div className="mt-3"><span className="font-mono text-3xl">{p.price}</span><span className="text-sm text-muted-foreground">{p.per}</span></div>
              <ul className="mt-5 flex-1 space-y-2 text-sm">{p.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 size-4 text-primary" />{i}</li>)}</ul>
              <Button asChild className="mt-6" variant={p.featured ? "default" : "outline"}><Link to="/signup">{p.price === "Custom" ? "Contact sales" : "Start"}</Link></Button>
            </div>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
