export function buildShareUrl(ids: string[]) {
  const url = new URL(window.location.href);
  url.searchParams.set("compare", ids.join(","));
  return url.toString();
}

export function readSharedIds(): string[] {
  const url = new URL(window.location.href);
  const val = url.searchParams.get("compare");
  return val ? val.split(",").filter(Boolean) : [];
}