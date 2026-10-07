import { useMemo, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
  sort?: (row: T) => number | string;
}

/** DataTable — search, sort, selection, pagination; all client-side over mock rows. */
export function DataTable<T extends { id: string }>({
  rows, columns, searchKeys, pageSize = 10, toolbar, onRowClick, selectable, selected, onSelectedChange, empty = "No results.",
}: {
  rows: T[];
  columns: Column<T>[];
  searchKeys?: (row: T) => string;
  pageSize?: number;
  toolbar?: ReactNode;
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selected?: string[];
  onSelectedChange?: (ids: string[]) => void;
  empty?: string;
}) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);

  const filtered = useMemo(() => {
    let out = q && searchKeys ? rows.filter((r) => searchKeys(r).toLowerCase().includes(q.toLowerCase())) : rows;
    if (sort) {
      const col = columns.find((c) => c.key === sort.key);
      if (col?.sort) out = [...out].sort((a, b) => (col.sort!(a) > col.sort!(b) ? 1 : -1) * sort.dir);
    }
    return out;
  }, [rows, q, searchKeys, sort, columns]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const p = Math.min(page, pages - 1);
  const view = filtered.slice(p * pageSize, (p + 1) * pageSize);
  const sel = selected ?? [];
  const toggle = (id: string) => onSelectedChange?.(sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]);

  return (
    <div className="panel overflow-hidden">
      {(searchKeys || toolbar) && (
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
          {searchKeys && (
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search…"
                className="h-8 w-56 rounded-md border bg-background pl-7 pr-2 text-xs outline-none focus:ring-1 focus:ring-ring" />
            </div>
          )}
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b text-left">
              {selectable && (
                <th className="w-8 px-3 py-2">
                  <input type="checkbox" aria-label="Select all" className="accent-primary"
                    checked={view.length > 0 && view.every((r) => sel.includes(r.id))}
                    onChange={(e) => onSelectedChange?.(e.target.checked ? [...new Set([...sel, ...view.map((r) => r.id)])] : sel.filter((id) => !view.some((r) => r.id === id)))} />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={cn("label-xs whitespace-nowrap px-3 py-2 font-normal", c.sort && "cursor-pointer select-none hover:text-foreground", c.className)}
                  onClick={() => c.sort && setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === 1 ? -1 : 1 }))}>
                  {c.header}{sort?.key === c.key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((r) => (
              <tr key={r.id} onClick={() => onRowClick?.(r)}
                className={cn("border-b last:border-0 transition-colors hover:bg-accent/40", onRowClick && "cursor-pointer", sel.includes(r.id) && "bg-primary/5")}>
                {selectable && (
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label="Select row" className="accent-primary" checked={sel.includes(r.id)} onChange={() => toggle(r.id)} />
                  </td>
                )}
                {columns.map((c) => <td key={c.key} className={cn("whitespace-nowrap px-3 py-2", c.className)}>{c.cell(r)}</td>)}
              </tr>
            ))}
            {!view.length && <tr><td colSpan={columns.length + 1} className="px-3 py-10 text-center text-sm text-muted-foreground">{empty}</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between border-t px-3 py-2 font-mono text-[11px] text-muted-foreground">
        <span>{filtered.length} rows{sel.length ? ` · ${sel.length} selected` : ""}</span>
        <div className="flex items-center gap-2">
          <button className="rounded p-1 hover:bg-accent disabled:opacity-30" disabled={p === 0} onClick={() => setPage(p - 1)} aria-label="Previous page"><ChevronLeft className="size-3.5" /></button>
          <span>{p + 1} / {pages}</span>
          <button className="rounded p-1 hover:bg-accent disabled:opacity-30" disabled={p >= pages - 1} onClick={() => setPage(p + 1)} aria-label="Next page"><ChevronRight className="size-3.5" /></button>
        </div>
      </div>
    </div>
  );
}
