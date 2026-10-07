import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { fitFamily, type Dimension } from "@/lib/scaling";
import type { MetricKey } from "@/types";

export function useFamilyFit(family: string, metric: MetricKey = "accuracy", dim: Dimension = "compute") {
  const exps = useStore((s) => s.experiments);
  return useMemo(() => {
    const members = exps.filter((e) => e.family === family);
    return { members, fit: fitFamily(members, metric, dim) };
  }, [exps, family, metric, dim]);
}

export function useFamilies() {
  const exps = useStore((s) => s.experiments);
  return useMemo(() => {
    const m = new Map<string, number>();
    exps.forEach((e) => e.metrics && m.set(e.family, (m.get(e.family) ?? 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]).map(([f]) => f);
  }, [exps]);
}
