import { cn } from "@/lib/utils";

/** Shared brand logo. Uses the SVG files in /public. `iconOnly` for compact spaces, `onLight` for light surfaces. */
export function Logo({ className, admin, iconOnly, onLight }: { className?: string; admin?: boolean; iconOnly?: boolean; onLight?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {iconOnly
        ? <img src="/logo-icon.svg" alt="ScalarLab" width={22} height={22} className="size-[22px]" />
        : <img src={onLight ? "/logo-dark.svg" : "/logo.svg"} alt="ScalarLab" width={111} height={24} className="h-6 w-auto" />}
      {admin && <span className="rounded-sm bg-primary px-1 font-mono text-[9px] font-bold uppercase text-primary-foreground">Admin</span>}
    </span>
  );
}
