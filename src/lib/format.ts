export const usd = (n: number) =>
  n >= 1000 ? `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}` : `$${n.toFixed(2)}`;
export const compact = (n: number) =>
  Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
export const params = (m: number) => (m === 0 ? "—" : m >= 1000 ? `${+(m / 1000).toFixed(1)}B` : `${m}M`);
export const gb = (g: number) => (g >= 1000 ? `${+(g / 1000).toFixed(1)}TB` : g < 1 ? `${Math.round(g * 1000)}MB` : `${g}GB`);
export const date = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export const datetime = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" });
export const duration = (min: number) => (min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min}m`);
