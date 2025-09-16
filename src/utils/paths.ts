export const withBase = (p: string) =>
  new URL(p.startsWith('/') ? p.slice(1) : p, import.meta.env.BASE_URL).toString()
