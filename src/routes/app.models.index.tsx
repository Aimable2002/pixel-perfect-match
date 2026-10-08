import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Segmented } from "@/components/lab";
import { ModelCard } from "@/components/cards";
import { models } from "@/data/mock";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/app/models/")({
  head: () => seo("Models", "Model library: time-series, language, vision and custom architectures."),
  component: Models,
});

function Models() {
  const [cat, setCat] = useState("All");
  return (
    <>
      <PageHeader title="Models" description="Architectures available for experiments. Create variants to build a scaling ladder." />
      <div className="mb-4"><Segmented value={cat} onChange={setCat} options={["All", "Time Series", "Language", "Vision", "Custom"].map((v) => ({ value: v, label: v }))} /></div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">{models.filter((m) => cat === "All" || m.category === cat).map((m) => <ModelCard key={m.id} m={m} />)}</div>
    </>
  );
}
