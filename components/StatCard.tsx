export function StatCard({
  label,
  value,
  sub,
  accent = "text-pulse",
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="border border-line/20 bg-paper/5 p-4">
      <p className="text-[11px] uppercase tracking-wide text-inkfaint">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-inkfaint">{sub}</p>}
    </div>
  );
}
