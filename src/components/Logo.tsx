import { cn } from "@/lib/utils";

export function Logo({ className, admin }: { className?: string; admin?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <svg viewBox="0 0 24 24" className="size-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M3 20 L9 14 L13 16 L21 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M17 9 L21 5" strokeDasharray="2 2" />
        <circle cx="3" cy="20" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="9" cy="14" r="1.4" fill="currentColor" stroke="none" />
        <circle cx="13" cy="16" r="1.4" fill="currentColor" stroke="none" />
      </svg>
      <span className="text-[15px]">Scalar<span className="text-muted-foreground">Lab</span></span>
      {admin && <span className="rounded-sm bg-primary px-1 font-mono text-[9px] font-bold uppercase text-primary-foreground">Admin</span>}
    </span>
  );
}
