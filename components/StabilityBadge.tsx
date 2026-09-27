import type { ApyStability } from "@/lib/stability";
import { STABILITY_LABEL } from "@/lib/stability";

const STYLES: Record<ApyStability, string> = {
  steady: "bg-pulse/15 text-pulse border-pulse/40",
  moderate: "bg-amber/15 text-amber border-amber/40",
  volatile: "bg-rust/15 text-rust border-rust/40",
};

export function StabilityBadge({ stability }: { stability: ApyStability | null }) {
  if (stability === null) {
    return <span className="text-xs text-inkfaint">—</span>;
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[stability]}`}
      title="APY stability, based on the trailing 7-day change in reported rate"
    >
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {STABILITY_LABEL[stability]}
    </span>
  );
}
