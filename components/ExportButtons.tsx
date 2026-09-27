"use client";

import { toCsv } from "@/lib/csv";

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportButtons({
  data,
  filenameBase,
}: {
  data: Record<string, string | number | null>[];
  filenameBase: string;
}) {
  if (data.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => download(`${filenameBase}.csv`, toCsv(data), "text/csv")}
        className="focus-ring border border-line/25 px-2.5 py-1 text-xs font-medium text-inkfaint transition-colors hover:border-pulse/40 hover:text-pulse"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => download(`${filenameBase}.json`, JSON.stringify(data, null, 2), "application/json")}
        className="focus-ring border border-line/25 px-2.5 py-1 text-xs font-medium text-inkfaint transition-colors hover:border-pulse/40 hover:text-pulse"
      >
        Export JSON
      </button>
    </div>
  );
}
