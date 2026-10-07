import { useSyncExternalStore } from "react";
import { toast } from "sonner";
import * as mock from "@/data/mock";
import type { Dataset, Experiment, Prediction, ResearchNote, Run } from "@/types";

/**
 * Local mock state. Every mutation goes through the functions in `api` below,
 * so a real backend can replace this module without touching pages.
 */
export interface AppState {
  user: { name: string; email: string; workspace: string } | null;
  admin: boolean;
  experiments: Experiment[];
  runs: Run[];
  datasets: Dataset[];
  predictions: Prediction[];
  notes: ResearchNote[];
  users: typeof mock.users;
}

let state: AppState = {
  user: { name: "Researcher", email: "researcher@scalar.dev", workspace: "Forex Research" },
  admin: false,
  experiments: mock.experiments,
  runs: mock.runs,
  datasets: mock.datasets,
  predictions: mock.predictions,
  notes: mock.notes,
  users: mock.users,
};
const initial = state;
const listeners = new Set<() => void>();
const set = (fn: (s: AppState) => Partial<AppState>) => {
  state = { ...state, ...fn(state) };
  listeners.forEach((l) => l());
};

export function useStore<T>(sel: (s: AppState) => T): T {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => sel(state),
    () => sel(initial),
  );
}
export const getState = () => state;

let seq = 0;
const uid = (p: string) => `${p}-${Date.now().toString(36)}${(seq++).toString(36)}`;

function simulateRun(runId: string, expId: string) {
  if (typeof window === "undefined") return;
  setTimeout(() => {
    set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? { ...r, status: "running" } : r)) }));
    const t = setInterval(() => {
      const run = state.runs.find((r) => r.id === runId);
      if (!run || run.status !== "running") return clearInterval(t);
      const progress = Math.min(100, run.progress + 6 + Math.round(Math.random() * 6));
      if (progress < 100) {
        set((s) => ({ runs: s.runs.map((r) => (r.id === runId ? { ...r, progress } : r)) }));
        return;
      }
      clearInterval(t);
      const exp = state.experiments.find((e) => e.id === expId)!;
      const metrics = mock.metricsFor(exp.compute, Date.now() % 1000);
      set((s) => ({
        runs: s.runs.map((r) => (r.id === runId ? { ...r, progress: 100, status: "completed", metric: metrics.accuracy, durationMin: Math.round(6 + exp.compute * 0.8) } : r)),
        experiments: s.experiments.map((e) => (e.id === expId ? { ...e, status: "completed", metrics } : e)),
      }));
      toast.success(`${exp.name} completed`, { description: `Accuracy ${metrics.accuracy}% · Sharpe ${metrics.sharpe} (demo data)` });
    }, 700);
  }, 1200);
}

export const api = {
  login(email: string, name = "Researcher") {
    set(() => ({ user: { name, email, workspace: "Forex Research" } }));
  },
  logout() { set(() => ({ user: null, admin: false })); },
  adminLogin() { set(() => ({ admin: true })); },
  setWorkspace(workspace: string) { set((s) => ({ user: s.user ? { ...s.user, workspace } : s.user })); },

  createExperiment(input: Omit<Experiment, "id" | "status" | "createdAt" | "owner" | "metrics">) {
    const id = uid("exp");
    const exp: Experiment = { ...input, id, status: "queued", createdAt: new Date().toISOString(), owner: state.user?.name ?? "Researcher" };
    set((s) => ({ experiments: [exp, ...s.experiments] }));
    api.runExperiment(id);
    return id;
  },
  runExperiment(id: string) {
    const exp = state.experiments.find((e) => e.id === id);
    if (!exp) return;
    const run: Run = { id: uid("run"), experimentId: id, status: "queued", progress: 0, durationMin: 0, gpu: exp.training.gpu, compute: exp.compute, createdAt: new Date().toISOString(), user: exp.owner };
    set((s) => ({
      runs: [run, ...s.runs],
      experiments: s.experiments.map((e) => (e.id === id ? { ...e, status: "running" } : e)),
    }));
    simulateRun(run.id, id);
    return run.id;
  },
  stopExperiment(id: string) {
    set((s) => ({
      runs: s.runs.map((r) => (r.experimentId === id && (r.status === "running" || r.status === "queued") ? { ...r, status: "failed" } : r)),
      experiments: s.experiments.map((e) => (e.id === id ? { ...e, status: e.metrics ? "completed" : "failed" } : e)),
    }));
  },
  duplicateExperiment(id: string) {
    const e = state.experiments.find((x) => x.id === id)!;
    const copy: Experiment = { ...e, id: uid("exp"), name: `${e.name} (copy)`, status: "draft", metrics: undefined, createdAt: new Date().toISOString() };
    set((s) => ({ experiments: [copy, ...s.experiments] }));
    return copy.id;
  },
  archiveExperiments(ids: string[]) {
    set((s) => ({ experiments: s.experiments.map((e) => (ids.includes(e.id) ? { ...e, status: "archived" } : e)) }));
  },
  addDataset(d: Omit<Dataset, "id">) {
    const ds = { ...d, id: uid("ds") };
    set((s) => ({ datasets: [ds, ...s.datasets] }));
    return ds.id;
  },
  createDatasetVersion(id: string) {
    set((s) => ({ datasets: s.datasets.map((d) => (d.id === id ? { ...d, versions: d.versions + 1 } : d)) }));
  },
  savePrediction(p: Omit<Prediction, "id" | "createdAt" | "status">) {
    const pred: Prediction = { ...p, id: uid("pred"), status: "predicted", createdAt: new Date().toISOString() };
    set((s) => ({ predictions: [pred, ...s.predictions] }));
    return pred.id;
  },
  markAwaiting(id: string) {
    set((s) => ({ predictions: s.predictions.map((p) => (p.id === id ? { ...p, status: "awaiting" } : p)) }));
  },
  validatePrediction(id: string, actual: number) {
    set((s) => ({
      predictions: s.predictions.map((p) =>
        p.id === id ? { ...p, actual, status: actual >= p.low && actual <= p.high ? "validated" : "invalidated" } : p,
      ),
    }));
  },
  addNote(kind: ResearchNote["kind"], body: string, attachments: string[] = []) {
    set((s) => ({ notes: [...s.notes, { id: uid("n"), kind, body, attachments, createdAt: new Date().toISOString() }] }));
  },
  attachToLastNote(item: string) {
    set((s) => {
      const n = [...s.notes];
      if (!n.length) return {};
      n[n.length - 1] = { ...n[n.length - 1], attachments: [...n[n.length - 1].attachments, item] };
      return { notes: n };
    });
  },
  setUserStatus(id: string, status: "active" | "suspended") {
    set((s) => ({ users: s.users.map((u) => (u.id === id ? { ...u, status } : u)) }));
  },
};
