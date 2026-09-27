// Plain data only — deliberately NOT a "use client" file. A "use client" module's named exports (even
// non-component ones, like these label/color maps) get treated as client references by the RSC bundler,
// which breaks when a Server Component (app/compare/page.tsx) tries to import and index into them
// directly. Keeping this as a plain server-safe module lets both the client chart and the server page
// import the same lookup tables without that bug.

export const PROJECT_COLORS: Record<string, string> = {
  concrete: "#7CFF6B",
  "aave-v3": "#B6509E",
  "compound-v3": "#00D395",
  "morpho-blue": "#5B9DF7",
  spark: "#F7C948",
  "sky-lending": "#4FC3F7",
  "euler-v2": "#9B7EDE",
  "fluid-lending": "#FF8A5B",
};

export const PROJECT_LABELS: Record<string, string> = {
  concrete: "Concrete",
  "aave-v3": "Aave v3",
  "compound-v3": "Compound v3",
  "morpho-blue": "Morpho Blue",
  spark: "Spark",
  "sky-lending": "Sky",
  "euler-v2": "Euler v2",
  "fluid-lending": "Fluid",
};
