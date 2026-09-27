type Status = "healthy" | "watch" | "stale";

const STYLES: Record<Status, string> = {
  healthy: "bg-pulse/15 text-pulse border-pulse/40",
  watch: "bg-amber/15 text-amber border-amber/40",
  stale: "bg-rust/15 text-rust border-rust/40",
};

const LABELS: Record<Status, string> = {
  healthy: "Healthy",
  watch: "Watch",
  stale: "Stale data",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {LABELS[status]}
    </span>
  );
}

export type { Status };
