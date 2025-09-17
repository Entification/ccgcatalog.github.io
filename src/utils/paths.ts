export const withBase = (p: string) => {
  const base = (import.meta.env.BASE_URL || "/").trim();
  const baseClean = base.endsWith("/") ? base.slice(0, -1) : base;
  const rel = (p || "").replace(/^\/+/, "");
  return `${baseClean}/${rel}`;
};
