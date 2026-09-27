export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink/60 py-8 text-center text-xs text-inkfaint">
      <p>
        Concrete Pulse is an independent, community-built dashboard. Not affiliated with or endorsed by
        Concrete / Blueprint Finance. Data via{" "}
        <a href="https://defillama.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
          DefiLlama
        </a>
        's public API.
      </p>
    </footer>
  );
}
