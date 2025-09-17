export function asset(path: string) {
  if (!path) return path;

  const p = path.toLowerCase();
  if (
    p.startsWith("http://") ||
    p.startsWith("https://") ||
    p.startsWith("data:") ||
    p.startsWith("blob:")
  ) {
    return path;
  }

  const base = (import.meta.env.BASE_URL || "/").trim();
  const baseClean = base.endsWith("/") ? base.slice(0, -1) : base;
  const rel = path.replace(/^\/+/, ""); // strip leading slashes from path

  return `${baseClean}/${rel}`;
}
