import type { MetadataRoute } from "next";
import { headers } from "next/headers";

// Authenticated pages such as /drive are intentionally excluded.
const publicRoutes = [
  { path: "", changeFrequency: "monthly", priority: 1 },
  { path: "/sign-up", changeFrequency: "monthly", priority: 0.8 },
  { path: "/sign-in", changeFrequency: "yearly", priority: 0.4 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
] as const;

function firstHeaderValue(value: string | null) {
  return value?.split(",")[0]?.trim();
}

async function getSiteUrl() {
  const requestHeaders = await headers();
  const host =
    firstHeaderValue(requestHeaders.get("x-forwarded-host")) ??
    firstHeaderValue(requestHeaders.get("host"));

  if (!host) {
    return "http://localhost:3000";
  }

  const isLocal = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol =
    firstHeaderValue(requestHeaders.get("x-forwarded-proto")) ??
    (isLocal ? "http" : "https");

  return `${protocol}://${host}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = await getSiteUrl();

  return publicRoutes.map(({ path, ...route }) => ({
    url: `${siteUrl}${path}`,
    ...route,
  }));
}
