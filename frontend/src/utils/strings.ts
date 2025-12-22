export const toTitleCase = (s: string) =>
  s
    ? s
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(" ")
    : "";
