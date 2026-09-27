import Link from "next/link";

const NAV = [
  { href: "/status", label: "Status" },
  { href: "/analytics", label: "Analytics" },
  { href: "/compare", label: "Compare" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-ink/60 bg-ink/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight text-paper">Concrete Pulse</span>
          <span className="hidden text-[11px] text-inkfaint sm:inline">unofficial</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded-sm px-3 py-1.5 text-sm font-medium text-paper/80 transition-colors hover:bg-paper/10 hover:text-pulse"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
